import { createApiHandler } from "../../server/http/handlerFactory.js";
import { requireV2Auth } from "../../server/http/authMiddlewareV2.js";
import { BillingError } from "../../server/billing/errors.js";
import { getBillingSummary } from "../../server/billing/stripeService.js";

type Output = {
  ok: true;
  subscription: {
    planCode: string;
    status: string;
    currentPeriodEnd: Date | null;
    cancelAtPeriodEnd: boolean;
  } | null;
  creditBalance: number;
};

export default createApiHandler<Record<string, never>, Output>({
  methods: ["GET"],
  tag: "billing.summary",
  handler: async ({ req, res }) => {
    const ctx = await requireV2Auth(req, res);
    if (!ctx.platformAccess) {
      throw new BillingError("platform_access_required");
    }
    const summary = await getBillingSummary(ctx.tenantId);
    return { ok: true, ...summary };
  },
});
