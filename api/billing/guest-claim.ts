import { z } from "zod";

import { BillingError } from "../../server/billing/errors.js";
import { claimGuestCheckout } from "../../server/billing/stripeService.js";
import { serializeCookie } from "../../server/auth/sessions.js";
import { createApiHandler } from "../../server/http/handlerFactory.js";

const InputSchema = z.object({
  token: z.string().min(32).max(256),
  password: z.string().min(12).max(128),
});

type Output = { ok: true; tenantId: string; userId: string };

export default createApiHandler<z.infer<typeof InputSchema>, Output>({
  methods: ["POST"],
  schema: InputSchema,
  tag: "billing.guest-claim",
  handler: async ({ req, res, input }) => {
    try {
      const result = await claimGuestCheckout({ token: input.token, password: input.password, req });
      res.setHeader(
        "Set-Cookie",
        serializeCookie({
          rawToken: result.rawToken,
          expiresAt: result.expiresAt,
          secure: true,
        }),
      );
      return { ok: true, tenantId: result.tenantId, userId: result.userId };
    } catch (error) {
      if (error instanceof BillingError) throw error;
      console.error("[billing.guest-claim] falhou:", error instanceof Error ? error.message : error);
      throw new BillingError("stripe_provider_error");
    }
  },
});
