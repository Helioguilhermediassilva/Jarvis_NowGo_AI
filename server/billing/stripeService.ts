import Stripe from "stripe";
import { and, desc, eq, gt, isNull, or, sql } from "drizzle-orm";

import { db } from "../db/client.js";
import {
  billingEvents,
  billingSubscriptions,
  creditLedger,
  guestCheckoutIntents,
  passwordCredentials,
  stripeCustomers,
  tenantMembers,
  tenants,
  users,
} from "../db/schema.js";
import { BillingError } from "./errors.js";
import { hashPassword } from "../auth/passwordCredentials.js";
import { createSession } from "../auth/sessions.js";
import { generateTokenPair, hashToken } from "../auth/tokens.js";
import { renderGuestCheckoutClaimEmail, sendEmail } from "../email/resendClient.js";
import {
  getAppOrigin,
  getBillingSecret,
  getBillingWebhookSecret,
  getOffer,
  getOfferByPriceId,
  getConfiguredPriceId,
  type BillingOffer,
} from "./catalog.js";

let _stripe: Stripe | null = null;

export function stripeClient(): Stripe {
  if (_stripe) return _stripe;
  _stripe = new Stripe(getBillingSecret());
  return _stripe;
}

export async function createOrGetStripeCustomer(input: {
  tenantId: string;
  email: string;
}): Promise<string> {
  const existing = await db()
    .select({ stripeCustomerId: stripeCustomers.stripeCustomerId })
    .from(stripeCustomers)
    .where(eq(stripeCustomers.tenantId, input.tenantId))
    .limit(1);
  if (existing[0]) return existing[0].stripeCustomerId;

  const customer = await stripeClient().customers.create({
    email: input.email,
    metadata: { tenant_id: input.tenantId },
  });

  try {
    await db()
      .insert(stripeCustomers)
      .values({
        tenantId: input.tenantId,
        stripeCustomerId: customer.id,
        email: input.email,
      })
      .onConflictDoNothing({ target: stripeCustomers.tenantId });
  } catch (error) {
    console.warn("[billing] não foi possível persistir stripe_customer:", error);
  }

  const persisted = await db()
    .select({ stripeCustomerId: stripeCustomers.stripeCustomerId })
    .from(stripeCustomers)
    .where(eq(stripeCustomers.tenantId, input.tenantId))
    .limit(1);
  return persisted[0]?.stripeCustomerId ?? customer.id;
}

export async function createCheckoutSession(input: {
  tenantId: string;
  userId: string;
  email: string;
  offerCode: string;
  req: { headers: Record<string, string | string[] | undefined> };
}): Promise<{ id: string; url: string }> {
  const offer = getOffer(input.offerCode);
  if (!offer) throw new BillingError("offer_invalid");
  const priceId = getConfiguredPriceId(offer);
  const customerId = await createOrGetStripeCustomer({
    tenantId: input.tenantId,
    email: input.email,
  });
  const origin = getAppOrigin(input.req);
  const metadata = {
    tenant_id: input.tenantId,
    user_id: input.userId,
    offer_code: offer.code,
  };

  const session = await stripeClient().checkout.sessions.create({
    mode: offer.kind === "subscription" ? "subscription" : "payment",
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    metadata,
    client_reference_id: `${input.tenantId}:${offer.code}`,
    success_url: `${origin}/billing?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/billing?checkout=cancelled&offer=${encodeURIComponent(offer.code)}`,
    allow_promotion_codes: true,
    billing_address_collection: "auto",
    ...(offer.kind === "subscription"
      ? { subscription_data: { metadata } }
      : { payment_intent_data: { metadata } }),
  });

  if (!session.url) throw new Error("Stripe não retornou uma URL de Checkout");
  return { id: session.id, url: session.url };
}

export async function createCustomerPortalSession(input: {
  tenantId: string;
  req: { headers: Record<string, string | string[] | undefined> };
}): Promise<{ url: string }> {
  const customer = await db()
    .select({ stripeCustomerId: stripeCustomers.stripeCustomerId })
    .from(stripeCustomers)
    .where(eq(stripeCustomers.tenantId, input.tenantId))
    .limit(1);
  if (!customer[0]) throw new BillingError("billing_customer_missing");

  const origin = getAppOrigin(input.req);
  const portal = await stripeClient().billingPortal.sessions.create({
    customer: customer[0].stripeCustomerId,
    return_url: `${origin}/billing`,
  });
  return { url: portal.url };
}

export async function getBillingSummary(tenantId: string) {
  const subscription = await db()
    .select({
      planCode: billingSubscriptions.planCode,
      status: billingSubscriptions.status,
      currentPeriodEnd: billingSubscriptions.currentPeriodEnd,
      cancelAtPeriodEnd: billingSubscriptions.cancelAtPeriodEnd,
    })
    .from(billingSubscriptions)
    .where(eq(billingSubscriptions.tenantId, tenantId))
    .orderBy(desc(billingSubscriptions.updatedAt))
    .limit(1);

  const balance = await db()
    .select({
      credits: sql<number>`coalesce(sum(${creditLedger.amount}), 0)`,
    })
    .from(creditLedger)
    .where(
      and(
        eq(creditLedger.tenantId, tenantId),
        or(isNull(creditLedger.expiresAt), sql`${creditLedger.expiresAt} > now()`),
      ),
    );

  return {
    subscription: subscription[0] ?? null,
    creditBalance: Number(balance[0]?.credits ?? 0),
  };
}

export async function handleStripeWebhook(rawBody: string, signature: string) {
  const event = stripeClient().webhooks.constructEvent(
    rawBody,
    signature,
    getBillingWebhookSecret(),
  );

  const existing = await db()
    .select({ processedAt: billingEvents.processedAt })
    .from(billingEvents)
    .where(eq(billingEvents.stripeEventId, event.id))
    .limit(1);
  if (existing[0]?.processedAt) return { duplicate: true, eventId: event.id };

  if (!existing[0]) {
    await db()
      .insert(billingEvents)
      .values({
        stripeEventId: event.id,
        eventType: event.type,
        payload: event as unknown as Record<string, unknown>,
      })
      .onConflictDoNothing({ target: billingEvents.stripeEventId });
  }

  await processStripeEvent(event);

  await db()
    .update(billingEvents)
    .set({ processedAt: new Date() })
    .where(eq(billingEvents.stripeEventId, event.id));

  return { duplicate: false, eventId: event.id };
}

async function processStripeEvent(event: Stripe.Event): Promise<void> {
  const data = event.data.object as any;

  switch (event.type) {
    case "checkout.session.completed": {
      const guestIntentId = typeof data.metadata?.guest_checkout_intent_id === "string"
        ? data.metadata.guest_checkout_intent_id
        : null;
      if (guestIntentId) {
        if (data.payment_status === "paid" || data.mode === "subscription") {
          await markGuestCheckoutPaid(guestIntentId, data);
        }
        return;
      }
      if (data.mode === "payment" && data.payment_status === "paid") {
        await grantCreditPackFromCheckout(data);
      }
      return;
    }
    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted":
      await syncSubscription(data);
      return;
    case "invoice.paid":
      await grantSubscriptionCredits(data);
      return;
    case "invoice.payment_failed":
      if (typeof data.subscription === "string") {
        await db()
          .update(billingSubscriptions)
          .set({ status: "past_due", updatedAt: new Date() })
          .where(eq(billingSubscriptions.stripeSubscriptionId, data.subscription));
      }
      return;
    default:
      return;
  }
}

async function syncSubscription(subscription: any): Promise<void> {
  const customerId = normalizeStripeId(subscription.customer);
  const priceId = subscription.items?.data?.[0]?.price?.id;
  if (!customerId || !priceId) return;

  const customer = await db()
    .select({ tenantId: stripeCustomers.tenantId })
    .from(stripeCustomers)
    .where(eq(stripeCustomers.stripeCustomerId, customerId))
    .limit(1);
  const tenantId = subscription.metadata?.tenant_id ?? customer[0]?.tenantId;
  const offer = getOfferByPriceId(priceId);
  if (!tenantId || !offer?.planCode) return;

  await db()
    .insert(billingSubscriptions)
    .values({
      tenantId,
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscription.id,
      stripePriceId: priceId,
      planCode: offer.planCode,
      status: subscription.status,
      currentPeriodStart: fromUnix(subscription.current_period_start ?? subscription.items?.data?.[0]?.current_period_start),
      currentPeriodEnd: fromUnix(subscription.current_period_end ?? subscription.items?.data?.[0]?.current_period_end),
      cancelAtPeriodEnd: Boolean(subscription.cancel_at_period_end),
    })
    .onConflictDoUpdate({
      target: billingSubscriptions.stripeSubscriptionId,
      set: {
        stripeCustomerId: customerId,
        stripePriceId: priceId,
        planCode: offer.planCode,
        status: subscription.status,
        currentPeriodStart: fromUnix(subscription.current_period_start),
        currentPeriodEnd: fromUnix(subscription.current_period_end),
        cancelAtPeriodEnd: Boolean(subscription.cancel_at_period_end),
        updatedAt: new Date(),
      },
    });

  // A compra self-service também é o ato que habilita o acesso à Plataforma.
  // Mantemos estados de cobrança em atraso dentro da janela de graça; o acesso
  // é revogado somente quando a assinatura chega a um estado encerrado.
  const hasPlatformAccess = ["active", "trialing", "past_due"].includes(subscription.status);
  await db()
    .update(tenantMembers)
    .set({ platformAccess: hasPlatformAccess })
    .where(eq(tenantMembers.tenantId, tenantId));
}

async function grantSubscriptionCredits(invoice: any): Promise<void> {
  const subscriptionId = normalizeStripeId(invoice.subscription);
  if (!subscriptionId) return;

  const subscription = await stripeClient().subscriptions.retrieve(subscriptionId, {
    expand: ["items.data.price"],
  });
  await syncSubscription(subscription);

  const customerId = normalizeStripeId(subscription.customer);
  const priceId = subscription.items.data[0]?.price?.id;
  const offer = priceId ? getOfferByPriceId(priceId) : null;
  if (!customerId || !offer?.planCode || !offer.includedCredits) return;

  const customer = await db()
    .select({ tenantId: stripeCustomers.tenantId })
    .from(stripeCustomers)
    .where(eq(stripeCustomers.stripeCustomerId, customerId))
    .limit(1);
  if (!customer[0]) return;

  await grantCredits({
    tenantId: customer[0].tenantId,
    amount: offer.includedCredits,
    source: "subscription_cycle",
    planCode: offer.planCode,
    idempotencyKey: `invoice:${invoice.id}`,
    expiresAt: fromUnix((subscription as any).current_period_end ?? subscription.items.data[0]?.current_period_end),
    metadata: { invoice_id: invoice.id, subscription_id: subscription.id },
  });
}

async function grantCreditPackFromCheckout(session: any): Promise<void> {
  const offer = getOffer(session.metadata?.offer_code ?? "");
  if (!offer?.creditPackAmount) return;
  const tenantId = session.metadata?.tenant_id;
  if (!tenantId) return;

  await grantCredits({
    tenantId,
    amount: offer.creditPackAmount,
    source: "stripe_credit_pack",
    idempotencyKey: `checkout:${session.id}`,
    expiresAt: new Date(Date.now() + (offer.creditPackExpiryDays ?? 365) * 86_400_000),
    stripeCheckoutSessionId: session.id,
    stripePaymentIntentId: normalizeStripeId(session.payment_intent),
    metadata: { offer_code: offer.code },
  });

  // Um pacote pago também libera o acesso self-service à Plataforma.
  await db()
    .update(tenantMembers)
    .set({ platformAccess: true })
    .where(eq(tenantMembers.tenantId, tenantId));
}

export async function grantCredits(input: {
  tenantId: string;
  userId?: string | null;
  amount: number;
  source: string;
  planCode?: string;
  idempotencyKey: string;
  expiresAt?: Date | null;
  stripeCheckoutSessionId?: string | null;
  stripePaymentIntentId?: string | null;
  metadata?: Record<string, unknown>;
}) {
  if (!Number.isInteger(input.amount) || input.amount === 0) {
    throw new BillingError("stripe_provider_error", "amount de créditos deve ser um inteiro diferente de zero");
  }
  await db()
    .insert(creditLedger)
    .values({
      tenantId: input.tenantId,
      userId: input.userId ?? null,
      amount: input.amount,
      source: input.source,
      planCode: input.planCode ?? null,
      stripeCheckoutSessionId: input.stripeCheckoutSessionId ?? null,
      stripePaymentIntentId: input.stripePaymentIntentId ?? null,
      idempotencyKey: input.idempotencyKey,
      expiresAt: input.expiresAt ?? null,
      metadata: input.metadata ?? {},
    })
    .onConflictDoNothing({ target: creditLedger.idempotencyKey });
}

function normalizeStripeId(value: unknown): string | null {
  if (typeof value === "string" && value.length > 0) return value;
  if (value && typeof value === "object" && "id" in value) {
    const id = (value as { id?: unknown }).id;
    return typeof id === "string" ? id : null;
  }
  return null;
}

function fromUnix(value: unknown): Date | null {
  return typeof value === "number" && Number.isFinite(value)
    ? new Date(value * 1_000)
    : null;
}

export const _internal = {
  normalizeStripeId,
  fromUnix,
  processStripeEvent,
  getOffer,
  getConfiguredPriceId,
};


// ---------------------------------------------------------------------------
// Guest Checkout — pagamento antes da criação da conta
// ---------------------------------------------------------------------------

const GUEST_CLAIM_TTL_MS = 2 * 60 * 60_000;

function normalizeBillingEmail(email: string): string {
  return email.trim().toLowerCase();
}

function publicBillingOrigin(): string {
  return process.env.NOWGO_PUBLIC_ORIGIN ?? "https://www.nowgoai.com";
}

export async function createGuestCheckoutSession(input: {
  email: string;
  offerCode: string;
  req: { headers: Record<string, string | string[] | undefined> };
}): Promise<{ id: string; url: string }> {
  const email = normalizeBillingEmail(input.email);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new BillingError("guest_email_invalid");
  }

  const existingUser = await db()
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  if (existingUser[0]) throw new BillingError("guest_account_exists");

  const offer = getOffer(input.offerCode);
  if (!offer) throw new BillingError("offer_invalid");
  const priceId = getConfiguredPriceId(offer);
  const tokenPair = generateTokenPair();
  const [intent] = await db()
    .insert(guestCheckoutIntents)
    .values({
      email,
      offerCode: offer.code,
      status: "pending",
      claimTokenHash: tokenPair.hash,
      expiresAt: new Date(Date.now() + 24 * 60 * 60_000),
      metadata: { source: "public_pricing" },
    })
    .returning({ id: guestCheckoutIntents.id });

  if (!intent) throw new BillingError("stripe_provider_error", "falha ao criar intenção guest");

  try {
    const customer = await stripeClient().customers.create({
      email,
      metadata: { guest_checkout_intent_id: intent.id },
    });
    const metadata = {
      guest_checkout_intent_id: intent.id,
      offer_code: offer.code,
    };
    const session = await stripeClient().checkout.sessions.create({
      mode: offer.kind === "subscription" ? "subscription" : "payment",
      customer: customer.id,
      line_items: [{ price: priceId, quantity: 1 }],
      metadata,
      client_reference_id: `guest:${intent.id}`,
      customer_update: { name: "auto", address: "auto" },
      success_url: `${publicBillingOrigin()}/checkout-complete?intent=${encodeURIComponent(intent.id)}`,
      cancel_url: `${publicBillingOrigin()}/#pricing`,
      allow_promotion_codes: true,
      billing_address_collection: "auto",
      ...(offer.kind === "subscription"
        ? { subscription_data: { metadata } }
        : { payment_intent_data: { metadata } }),
    });

    if (!session.url) throw new Error("Stripe não retornou uma URL de Checkout");
    await db()
      .update(guestCheckoutIntents)
      .set({
        stripeCheckoutSessionId: session.id,
        stripeCustomerId: customer.id,
        updatedAt: new Date(),
      })
      .where(eq(guestCheckoutIntents.id, intent.id));
    return { id: session.id, url: session.url };
  } catch (error) {
    await db()
      .update(guestCheckoutIntents)
      .set({ status: "failed", updatedAt: new Date() })
      .where(eq(guestCheckoutIntents.id, intent.id));
    if (error instanceof BillingError) throw error;
    console.error("[billing.guest-checkout] Stripe falhou:", error instanceof Error ? error.message : error);
    throw new BillingError("stripe_provider_error");
  }
}

async function persistGuestStripeCustomer(intent: any, tenantId: string): Promise<void> {
  if (!intent.stripeCustomerId) return;
  await db()
    .insert(stripeCustomers)
    .values({
      tenantId,
      stripeCustomerId: intent.stripeCustomerId,
      email: intent.email,
    })
    .onConflictDoNothing({ target: stripeCustomers.tenantId });
}

async function reconcileGuestPurchaseAfterClaim(intent: any, session: any): Promise<void> {
  if (!intent.tenantId) return;
  const offer = getOffer(intent.offerCode);
  if (!offer) return;
  await persistGuestStripeCustomer(intent, intent.tenantId);

  if (offer.creditPackAmount && session.payment_status === "paid") {
    await grantCredits({
      tenantId: intent.tenantId,
      userId: intent.userId,
      amount: offer.creditPackAmount,
      source: "stripe_credit_pack",
      idempotencyKey: `checkout:${session.id}`,
      expiresAt: new Date(Date.now() + (offer.creditPackExpiryDays ?? 365) * 86_400_000),
      stripeCheckoutSessionId: session.id,
      stripePaymentIntentId: normalizeStripeId(session.payment_intent),
      metadata: { offer_code: offer.code, guest_intent_id: intent.id },
    });
    await db()
      .update(tenantMembers)
      .set({ platformAccess: true })
      .where(eq(tenantMembers.tenantId, intent.tenantId));
    return;
  }

  if (offer.kind === "subscription") {
    const subscriptionId = normalizeStripeId(session.subscription);
    if (!subscriptionId) return;
    const subscription = await stripeClient().subscriptions.retrieve(subscriptionId, {
      expand: ["items.data.price"],
    });
    const metadata = {
      ...(subscription.metadata ?? {}),
      tenant_id: intent.tenantId,
      user_id: intent.userId ?? "",
      offer_code: offer.code,
    };
    await stripeClient().subscriptions.update(subscription.id, { metadata });
    await syncSubscription({ ...subscription, metadata });
  }
}

/** Processa o pagamento guest sem criar conta antes da confirmação do Stripe. */
export async function markGuestCheckoutPaid(intentId: string, session: any): Promise<void> {
  const rows = await db()
    .select()
    .from(guestCheckoutIntents)
    .where(eq(guestCheckoutIntents.id, intentId))
    .limit(1);
  const intent = rows[0];
  if (!intent) return;

  if (intent.status === "claimed" && intent.tenantId) {
    await reconcileGuestPurchaseAfterClaim(intent, session);
    return;
  }
  if (intent.status !== "pending") return;

  const tokenPair = generateTokenPair();
  const updated = await db()
    .update(guestCheckoutIntents)
    .set({
      status: "paid",
      claimTokenHash: tokenPair.hash,
      expiresAt: new Date(Date.now() + GUEST_CLAIM_TTL_MS),
      stripeCheckoutSessionId: session.id,
      stripeCustomerId: normalizeStripeId(session.customer),
      updatedAt: new Date(),
    })
    .where(and(eq(guestCheckoutIntents.id, intentId), eq(guestCheckoutIntents.status, "pending")))
    .returning();
  const paidIntent = updated[0];
  if (!paidIntent) return;

  const offer = getOffer(paidIntent.offerCode);
  if (!offer) return;
  const claimUrl = `${publicBillingOrigin()}/checkout-complete?claim=${encodeURIComponent(tokenPair.raw)}`;
  try {
    const email = renderGuestCheckoutClaimEmail({
      to: paidIntent.email,
      claimUrl,
      offerName: offer.displayName,
    });
    await sendEmail({
      to: paidIntent.email,
      subject: email.subject,
      html: email.html,
      text: email.text,
      tag: "billing-guest-claim",
    });
  } catch (error) {
    // O pagamento continua reconciliado; o link nunca é escrito no log.
    console.error("[billing.guest-checkout] falha no envio do claim:", error instanceof Error ? error.message : error);
  }
}

export async function claimGuestCheckout(input: {
  token: string;
  password: string;
  req: { headers: Record<string, string | string[] | undefined> };
}): Promise<{ rawToken: string; expiresAt: Date; tenantId: string; userId: string }> {
  if (!input.token || input.token.length < 32) throw new BillingError("guest_claim_invalid");
  const claimHash = hashToken(input.token);
  const rows = await db()
    .select()
    .from(guestCheckoutIntents)
    .where(eq(guestCheckoutIntents.claimTokenHash, claimHash))
    .limit(1);
  const intent = rows[0];
  if (!intent || intent.status !== "paid") {
    if (intent && intent.expiresAt.getTime() <= Date.now()) throw new BillingError("guest_claim_expired");
    throw new BillingError("guest_claim_invalid");
  }
  if (intent.expiresAt.getTime() <= Date.now()) throw new BillingError("guest_claim_expired");

  const existingUser = await db()
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, intent.email))
    .limit(1);
  if (existingUser[0]) throw new BillingError("guest_account_exists");

  const argon2Hash = await hashPassword(input.password);
  const result = await db().transaction(async (tx) => {
    const [user] = await tx
      .insert(users)
      .values({ email: intent.email, name: intent.email.split("@")[0] })
      .returning({ id: users.id });
    if (!user) throw new BillingError("stripe_provider_error", "falha ao criar usuário guest");

    const [tenant] = await tx
      .insert(tenants)
      .values({
        slug: `guest-${intent.id}`,
        name: `NowGo AI — ${intent.email}`,
        plan: "starter",
        createdByUserId: user.id,
      })
      .returning({ id: tenants.id });
    if (!tenant) throw new BillingError("stripe_provider_error", "falha ao criar tenant guest");

    await tx.insert(passwordCredentials).values({
      userId: user.id,
      argon2Hash,
      verifiedAt: new Date(),
    });
    await tx.insert(tenantMembers).values({
      tenantId: tenant.id,
      userId: user.id,
      role: "owner",
      platformAccess: false,
    });
    await tx
      .update(guestCheckoutIntents)
      .set({
        status: "claimed",
        tenantId: tenant.id,
        userId: user.id,
        claimedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(and(eq(guestCheckoutIntents.id, intent.id), eq(guestCheckoutIntents.status, "paid")));
    return { tenantId: tenant.id, userId: user.id };
  });

  if (intent.stripeCheckoutSessionId) {
    const session = await stripeClient().checkout.sessions.retrieve(intent.stripeCheckoutSessionId, {
      expand: ["subscription"],
    });
    await reconcileGuestPurchaseAfterClaim({ ...intent, ...result, tenantId: result.tenantId, userId: result.userId }, session);
  }

  const session = await createSession({
    userId: result.userId,
    tenantId: result.tenantId,
    ip: typeof input.req.headers["x-forwarded-for"] === "string" ? input.req.headers["x-forwarded-for"] : null,
    userAgent: typeof input.req.headers["user-agent"] === "string" ? input.req.headers["user-agent"] : null,
  });
  return {
    rawToken: session.rawToken,
    expiresAt: session.expiresAt,
    tenantId: result.tenantId,
    userId: result.userId,
  };
}
