/**
 * api/auth/v2/login/mfa.ts  →  POST /api/auth/v2/login/mfa
 *
 * F47 — Segunda etapa do login: usuário autenticado por senha apresenta
 * o código TOTP (6 dígitos) ou um backup code, junto do `mfaTicket`
 * emitido pelo /login.
 *
 * Aceita:
 *   { ticket, code }        — TOTP de 6 dígitos
 *   { ticket, backupCode }  — código de backup (uso único)
 *
 * Rate-limit: 5 reqs / 15 min por IP+ticket.
 * Em sucesso emite cookie `nowgo_session_v2`.
 */
import { z } from "zod";

import { createApiHandler } from "../../../../server/http/handlerFactory.js";
import {
  verifyMfaCode,
  consumeBackupCode,
} from "../../../../server/auth/mfaTotp.js";
import {
  createSession,
  serializeCookie,
} from "../../../../server/auth/sessions.js";
import { tryConsume, rlKey } from "../../../../server/http/rateLimit.js";
import { PasswordError } from "../../../../server/auth/passwordCredentials.js";
import { verifyMfaTicket } from "./index.js";

const InputSchema = z
  .object({
    ticket: z.string().min(8),
    code: z
      .string()
      .regex(/^\d{6}$/)
      .optional(),
    backupCode: z.string().min(6).max(40).optional(),
  })
  .refine((v) => Boolean(v.code) !== Boolean(v.backupCode), {
    message: "informe code OU backupCode (exatamente um)",
  });

type Input = z.infer<typeof InputSchema>;

interface Output {
  ok: true;
  userId: string;
  tenantId: string;
}

export default createApiHandler<Input, Output>({
  methods: ["POST"],
  schema: InputSchema,
  tag: "auth.v2.login.mfa",
  handler: async ({ req, res, input, clientIp }) => {
    // 1) Rate limit (5 / 15 min)
    const rl = tryConsume(rlKey("login.mfa", `${clientIp}:${input.ticket.slice(-12)}`), {
      capacity: 5,
      refillPerSec: 5 / (15 * 60),
    });
    if (!rl.allowed) {
      res.setHeader("Retry-After", String(rl.resetSec));
      throw new PasswordError(
        "account_locked",
        "muitas tentativas; tente novamente em alguns minutos",
      );
    }

    // 2) Valida ticket
    const payload = verifyMfaTicket(input.ticket);
    if (payload.intent !== "challenge") {
      throw new PasswordError(
        "invalid_credentials",
        "ticket não é de challenge",
      );
    }

    // 3) Verifica código (TOTP ou backup)
    if (input.code) {
      await verifyMfaCode({ userId: payload.userId, code: input.code });
    } else if (input.backupCode) {
      await consumeBackupCode({
        userId: payload.userId,
        code: input.backupCode,
      });
    } else {
      throw new PasswordError("invalid_credentials");
    }

    // 4) Emite sessão definitiva
    const created = await createSession({
      userId: payload.userId,
      tenantId: payload.tenantId,
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

    return { ok: true, userId: payload.userId, tenantId: payload.tenantId };
  },
});
