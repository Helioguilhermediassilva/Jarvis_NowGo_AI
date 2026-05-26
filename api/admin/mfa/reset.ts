/**
 * api/admin/mfa/reset.ts  →  POST /api/admin/mfa/reset
 *
 * F47 — Reset administrativo de MFA. Apenas `superadmin` pode chamar.
 * Remove a linha de `mfa_credentials` do usuário-alvo, forçando-o a
 * reconfigurar TOTP no próximo login (intent="setup" no fluxo).
 *
 * Pré-requisito de produto (Hélio, 2026-05-26): a verificação OOB da
 * identidade do usuário-alvo é responsabilidade humana — o endpoint
 * confia no superadmin autenticado.
 */
import { z } from "zod";

import { createApiHandler } from "../../../server/http/handlerFactory.js";
import { requireV2Role } from "../../../server/http/authMiddlewareV2.js";
import { resetMfa } from "../../../server/auth/mfaTotp.js";

const InputSchema = z.object({
  targetUserId: z.string().uuid(),
});

type Input = z.infer<typeof InputSchema>;

export default createApiHandler<Input, { ok: true; reset: true }>({
  methods: ["POST"],
  schema: InputSchema,
  tag: "auth.v2.admin.mfa.reset",
  handler: async ({ req, res, input }) => {
    await requireV2Role(req, res, ["superadmin"]);
    await resetMfa({ userId: input.targetUserId });
    return { ok: true, reset: true };
  },
});
