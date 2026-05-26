/**
 * api/auth/v2/mfa/setup-confirm.ts  →  POST /api/auth/v2/mfa/setup-confirm
 *
 * F47 — Confirma o cadastro de MFA TOTP. Recebe o `secret` (do /setup-init),
 * o `confirmationCode` (TOTP de 6 dígitos do app autenticador) e ativa
 * a credencial. Devolve os 8 backup codes em claro UMA ÚNICA VEZ.
 *
 * Aceita os mesmos dois modos do /setup-init:
 *   - Sessão V2 ativa (usuário voluntariamente ativando MFA): cria credencial
 *     e mantém a sessão. Mfa só passa a ser exigido em logins futuros.
 *   - Pós-login com `mfaTicket` (role exigia MFA): após confirmar, cria a
 *     SESSÃO definitiva e emite cookie `nowgo_session_v2`.
 */
import { z } from "zod";

import { createApiHandler } from "../../../../server/http/handlerFactory.js";
import { requireV2Auth } from "../../../../server/http/authMiddlewareV2.js";
import { enableMfa, MfaError } from "../../../../server/auth/mfaTotp.js";
import {
  createSession,
  serializeCookie,
} from "../../../../server/auth/sessions.js";
import { verifyMfaTicket } from "../login/index.js";

const InputSchema = z.object({
  secret: z.string().min(16),
  confirmationCode: z.string().regex(/^\d{6}$/),
  mfaTicket: z.string().min(8).optional(),
});

type Input = z.infer<typeof InputSchema>;

interface Output {
  ok: true;
  backupCodes: string[];
  /** Quando vem de mfaTicket, o backend emite o cookie e retorna sessionIssued=true. */
  sessionIssued: boolean;
}

export default createApiHandler<Input, Output>({
  methods: ["POST"],
  schema: InputSchema,
  tag: "auth.v2.mfa.setup_confirm",
  handler: async ({ req, res, input, clientIp }) => {
    let userId: string;
    let tenantId: string | null = null;
    let isPostLoginFlow = false;

    if (input.mfaTicket) {
      const ticket = verifyMfaTicket(input.mfaTicket);
      if (ticket.intent !== "setup") {
        throw new MfaError("internal_error", "ticket não é de setup");
      }
      userId = ticket.userId;
      tenantId = ticket.tenantId;
      isPostLoginFlow = true;
    } else {
      const ctx = await requireV2Auth(req, res);
      userId = ctx.userId;
      tenantId = ctx.tenantId;
    }

    const result = await enableMfa({
      userId,
      secret: input.secret,
      confirmationCode: input.confirmationCode,
    });

    let sessionIssued = false;
    if (isPostLoginFlow && tenantId) {
      const created = await createSession({
        userId,
        tenantId,
        ip: clientIp,
        userAgent: (req.headers["user-agent"] as string) ?? null,
      });
      res.setHeader(
        "Set-Cookie",
        serializeCookie({
          rawToken: created.rawToken,
          expiresAt: created.expiresAt,
          domain: process.env.NOWGO_COOKIE_DOMAIN || undefined,
          secure: process.env.NODE_ENV !== "test",
        }),
      );
      sessionIssued = true;
    }

    return {
      ok: true,
      backupCodes: result.backupCodes,
      sessionIssued,
    };
  },
});
