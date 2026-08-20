export type BillingErrorCode =
  | "offer_invalid"
  | "platform_access_required"
  | "billing_not_configured"
  | "billing_customer_missing"
  | "stripe_provider_error";

export class BillingError extends Error {
  constructor(
    public readonly code: BillingErrorCode,
    message?: string,
  ) {
    super(message ?? code);
    this.name = "BillingError";
  }
}
