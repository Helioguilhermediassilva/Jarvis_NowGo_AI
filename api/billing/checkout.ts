import { z } from "zod";

import { createApiHandler } from "../../server/http/handlerFactory.js";
import { requireV2Auth } from "../../server/http/authMiddlewareV2.js";
import { BillingError } from "../../server/billing/errors.js";
import { createCheckoutSession } from "../../server/billing/stripeService.js";

const InputSchema = z.object({
  offerCode: z.string().min(1).max(80),
});

type Output = { ok: true; sessionId: string; url: string };

export default createApiHandler<z.infer<typeof InputSchema>, Output>({
  methods: ["POST"],
  schema: InputSchema,
  tag: "billing.checkout",
  handler: async ({ req, res, input }) => {
    const ctx = await requireV2Auth(req, res);
    if (!ctx.platformAccess) {
      throw new BillingError("platform_access_required");
    }

    try {
      const session = await createCheckoutSession({
        tenantId: ctx.tenantId,
        userId: ctx.userId,
        email: ctx.email,
        offerCode: input.offerCode,
        req,
      });
      return { ok: true, sessionId: session.id, url: session.url };
    } catch (error) {
      if (error instanceof BillingError) throw error;
      console.error("[billing.checkout] Stripe falhou:", error instanceof Error ? error.message : error);
      throw new BillingError("stripe_provider_error");
    }
  },
});
