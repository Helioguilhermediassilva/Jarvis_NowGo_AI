import { BillingError } from "./errors.js";

export type BillingOfferCode =
  | "sovereign_platform_pro_monthly"
  | "sovereign_platform_pro_annual"
  | "sovereign_platform_business_monthly"
  | "sovereign_platform_business_annual"
  | "sovereign_credits_1000"
  | "sovereign_credits_3000"
  | "sovereign_credits_10000";

export type SubscriptionPlanCode =
  | "sovereign_platform_pro"
  | "sovereign_platform_business";

export type BillingOffer = {
  code: BillingOfferCode;
  kind: "subscription" | "credit_pack";
  displayName: string;
  priceEnv: string;
  includedCredits: number;
  creditPackAmount?: number;
  creditPackExpiryDays?: number;
  planCode?: SubscriptionPlanCode;
};

/**
 * Catálogo público estável. O navegador só recebe o `code`; Price IDs nunca
 * são aceitos diretamente do cliente.
 */
export const BILLING_CATALOG: Record<BillingOfferCode, BillingOffer> = {
  sovereign_platform_pro_monthly: {
    code: "sovereign_platform_pro_monthly",
    kind: "subscription",
    displayName: "Plataforma de Inteligência Soberana Pro",
    priceEnv: "NOWGO_BILLING_PRICE_SOVEREIGN_PRO_MONTHLY",
    includedCredits: 5_000,
    planCode: "sovereign_platform_pro",
  },
  sovereign_platform_business_monthly: {
    code: "sovereign_platform_business_monthly",
    kind: "subscription",
    displayName: "Plataforma de Inteligência Soberana Business",
    priceEnv: "NOWGO_BILLING_PRICE_SOVEREIGN_BUSINESS_MONTHLY",
    // Franquia mensal aprovada para a oferta Business.
    includedCredits: 15_000,
    planCode: "sovereign_platform_business",
  },
  sovereign_platform_pro_annual: {
    code: "sovereign_platform_pro_annual",
    kind: "subscription",
    displayName: "Plataforma de Inteligência Soberana Pro — anual",
    priceEnv: "NOWGO_BILLING_PRICE_SOVEREIGN_PRO_ANNUAL",
    includedCredits: 5_000,
    planCode: "sovereign_platform_pro",
  },
  sovereign_platform_business_annual: {
    code: "sovereign_platform_business_annual",
    kind: "subscription",
    displayName: "Plataforma de Inteligência Soberana Business — anual",
    priceEnv: "NOWGO_BILLING_PRICE_SOVEREIGN_BUSINESS_ANNUAL",
    includedCredits: 15_000,
    planCode: "sovereign_platform_business",
  },
  sovereign_credits_1000: {
    code: "sovereign_credits_1000",
    kind: "credit_pack",
    displayName: "1.000 créditos da Plataforma de Inteligência Soberana",
    priceEnv: "NOWGO_BILLING_PRICE_CREDITS_1000",
    includedCredits: 0,
    creditPackAmount: 1_000,
    creditPackExpiryDays: 365,
  },
  sovereign_credits_3000: {
    code: "sovereign_credits_3000",
    kind: "credit_pack",
    displayName: "3.000 créditos da Plataforma de Inteligência Soberana",
    priceEnv: "NOWGO_BILLING_PRICE_CREDITS_3000",
    includedCredits: 0,
    creditPackAmount: 3_000,
    creditPackExpiryDays: 365,
  },
  sovereign_credits_10000: {
    code: "sovereign_credits_10000",
    kind: "credit_pack",
    displayName: "10.000 créditos da Plataforma de Inteligência Soberana",
    priceEnv: "NOWGO_BILLING_PRICE_CREDITS_10000",
    includedCredits: 0,
    creditPackAmount: 10_000,
    creditPackExpiryDays: 365,
  },
};

export const SUBSCRIPTION_PLAN_BY_CODE: Record<SubscriptionPlanCode, BillingOffer> = {
  sovereign_platform_pro: BILLING_CATALOG.sovereign_platform_pro_monthly,
  sovereign_platform_business: BILLING_CATALOG.sovereign_platform_business_monthly,
};

export function getOffer(code: string): BillingOffer | null {
  return Object.prototype.hasOwnProperty.call(BILLING_CATALOG, code)
    ? BILLING_CATALOG[code as BillingOfferCode]
    : null;
}

export function getConfiguredPriceId(offer: BillingOffer): string {
  const value = process.env[offer.priceEnv]?.trim();
  if (!value) {
    throw new BillingError("billing_not_configured", `Configuração ausente: ${offer.priceEnv}`);
  }
  return value;
}

export function getOfferByPriceId(priceId: string): BillingOffer | null {
  for (const offer of Object.values(BILLING_CATALOG)) {
    if (process.env[offer.priceEnv]?.trim() === priceId) return offer;
  }
  return null;
}

export function getBillingSecret(): string {
  const value = process.env.NOWGO_BILLING_SECRET_KEY?.trim();
  if (!value) throw new BillingError("billing_not_configured", "NOWGO_BILLING_SECRET_KEY não configurada");
  return value;
}

export function getBillingWebhookSecret(): string {
  const value = process.env.NOWGO_BILLING_WEBHOOK_SECRET?.trim();
  if (!value) throw new BillingError("billing_not_configured", "NOWGO_BILLING_WEBHOOK_SECRET não configurada");
  return value;
}

export function getAppOrigin(req: { headers: Record<string, string | string[] | undefined> }): string {
  const configured = process.env.NOWGO_PUBLIC_ORIGIN?.trim();
  if (configured) return configured.replace(/\/$/, "");
  const forwardedProto = firstHeader(req.headers["x-forwarded-proto"]) ?? "https";
  const forwardedHost = firstHeader(req.headers["x-forwarded-host"]);
  const host = forwardedHost ?? firstHeader(req.headers.host);
  if (!host) throw new Error("Não foi possível determinar a origem pública do NowGo");
  return `${forwardedProto}://${host}`;
}

function firstHeader(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export const _internal = {
  firstHeader,
};
