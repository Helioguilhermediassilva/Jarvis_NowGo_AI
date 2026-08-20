import { createApiHandler } from "../../server/http/handlerFactory.js";
import { requireV2Auth } from "../../server/http/authMiddlewareV2.js";
import { BillingError } from "../../server/billing/errors.js";
import { createCustomerPortalSession } from "../../server/billing/stripeService.js";

type Output = { ok: true; url: string };

export default createApiHandler<Record<string, never>, Output>({
  methods: ["POST"],
  tag: "billing.portal",
  handler: async ({ req, res }) => {
    const ctx = await requireV2Auth(req, res);
    if (!ctx.platformAccess) {
      throw new BillingError("platform_access_required");
    }

    try {
      const portal = await createCustomerPortalSession({ tenantId: ctx.tenantId, req });
      return { ok: true, url: portal.url };
    } catch (error) {
      if (error instanceof BillingError) throw error;
      console.error("[billing.portal] Stripe falhou:", error instanceof Error ? error.message : error);
      throw new BillingError("stripe_provider_error");
    }
  },
});
