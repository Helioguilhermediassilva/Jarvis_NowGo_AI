import Stripe from "stripe";
import { and, desc, eq, isNull, or, sql } from "drizzle-orm";

import { db } from "../db/client.js";
import {
  billingEvents,
  billingSubscriptions,
  creditLedger,
  stripeCustomers,
} from "../db/schema.js";
import { BillingError } from "./errors.js";
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
