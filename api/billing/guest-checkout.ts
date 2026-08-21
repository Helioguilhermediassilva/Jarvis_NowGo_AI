import { z } from "zod";

import { BillingError } from "../../server/billing/errors.js";
import { createGuestCheckoutSession } from "../../server/billing/stripeService.js";
import { createApiHandler } from "../../server/http/handlerFactory.js";

const InputSchema = z.object({
  email: z.string().trim().email().max(320),
  offerCode: z.string().min(1).max(80),
  billingInterval: z.enum(["monthly", "annual"]).optional(),
  trialChoice: z.enum(["trial", "pay_now"]).optional(),
  promoCode: z.string().trim().min(1).max(80).optional(),
});

type Output = { ok: true; sessionId: string; url: string };

export default createApiHandler<z.infer<typeof InputSchema>, Output>({
  methods: ["POST"],
  schema: InputSchema,
  tag: "billing.guest-checkout",
  handler: async ({ req, input }) => {
    try {
      const session = await createGuestCheckoutSession({
        email: input.email,
        offerCode: input.offerCode,
        billingInterval: input.billingInterval,
        trialChoice: input.trialChoice,
        promoCode: input.promoCode,
        req,
      });
      return { ok: true, sessionId: session.id, url: session.url };
    } catch (error) {
      if (error instanceof BillingError) throw error;
      console.error("[billing.guest-checkout] falhou:", error instanceof Error ? error.message : error);
      throw new BillingError("stripe_provider_error");
    }
  },
});
