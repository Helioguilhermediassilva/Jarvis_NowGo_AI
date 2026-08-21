/**
 * GET /api/auth/v2/xavier/start
 *
 * Inicia o acesso federado do NowGo para o Xavier. A sessão V2 permanece no
 * domínio comercial; somente um token transitório e criptografado é enviado
 * ao callback do Xavier.
 */
import { z } from "zod";

import { createXavierHandoffToken } from "../../../../server/auth/xavierHandoff.js";
import { BillingError } from "../../../../server/billing/errors.js";
import { requireV2Auth } from "../../../../server/http/authMiddlewareV2.js";
import { createApiHandler } from "../../../../server/http/handlerFactory.js";

const InputSchema = z.object({
  locale: z.enum(["pt", "en", "es"]).default("pt"),
});

type Input = z.infer<typeof InputSchema>;

const XAVIER_ORIGIN =
  process.env.NOWGO_XAVIER_ORIGIN?.trim() || "https://jarvisnowgo.com";

export default createApiHandler<Input, never>({
  methods: ["GET"],
  schema: InputSchema,
  tag: "auth.v2.xavier.start",
  handler: async ({ req, res, input }) => {
    const auth = await requireV2Auth(req, res);
    if (!auth.platformAccess) {
      throw new BillingError("platform_access_required");
    }

    const token = createXavierHandoffToken({
      userId: auth.userId,
      tenantId: auth.tenantId,
      email: auth.email,
      locale: input.locale,
    });
    const callback = new URL("/api/auth/handoff", XAVIER_ORIGIN);
    callback.searchParams.set("token", token);
    callback.searchParams.set("locale", input.locale);
    callback.searchParams.set("source", "nowgoai");

    res.status(302).setHeader("Location", callback.toString()).end();
    return undefined as never;
  },
});
