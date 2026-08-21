export type BillingErrorCode =
  | "offer_invalid"
  | "platform_access_required"
  | "billing_not_configured"
  | "billing_customer_missing"
  | "stripe_provider_error"
  | "guest_email_invalid"
  | "guest_claim_invalid"
  | "guest_claim_expired"
  | "guest_account_exists";

export class BillingError extends Error {
  constructor(
    public readonly code: BillingErrorCode,
    message?: string,
  ) {
    super(message ?? code);
    this.name = "BillingError";
  }
}
