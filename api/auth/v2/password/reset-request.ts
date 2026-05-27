/**
 * api/auth/v2/password/reset-request.ts
 *
 * F47 — Solicita um e-mail de recuperação de senha.
 *
 * Anti-enumeração: independente de o e-mail existir, devolve sempre
 * `{ ok: true }`. Se existir credencial, gera token e envia o e-mail
 * de fato; se não, apenas retorna sem revelar nada ao chamador.
 *
 * Rate-limit: 3 reqs / 1h por IP+email.
 */
import { z } from "zod";
import { eq } from "drizzle-orm";

import { createApiHandler } from "../../../../server/http/handlerFactory.js";
import { db } from "../../../../server/db/client.js";
import { users } from "../../../../server/db/schema.js";
import {
  requestPasswordReset,
  PasswordError,
} from "../../../../server/auth/passwordCredentials.js";
import {
  renderResetPasswordEmail,
  sendEmail,
} from "../../../../server/email/resendClient.js";
import { tryConsume, rlKey } from "../../../../server/http/rateLimit.js";

const InputSchema = z.object({
  email: z.string().email(),
  origin: z.string().url(),
});

type Input = z.infer<typeof InputSchema>;

export default createApiHandler<Input, { ok: true }>({
  methods: ["POST"],
  schema: InputSchema,
  tag: "auth.v2.password.reset_request",
  handler: async ({ input, res, clientIp }) => {
    const email = input.email.trim().toLowerCase();

    // Rate limit (3 / 1h)
    const rl = tryConsume(rlKey("pwreset", `${clientIp}:${email}`), {
      capacity: 3,
      refillPerSec: 3 / (60 * 60),
    });
    if (!rl.allowed) {
      // Não revela se o limite foi atingido em e-mails reais; só indica retry.
      res.setHeader("Retry-After", String(rl.resetSec));
      return { ok: true };
    }

    const userRows = await db()
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    const user = userRows[0];
    if (!user) {
      return { ok: true }; // anti-enumeração
    }

    let rawToken: string;
    try {
      const result = await requestPasswordReset({ userId: user.id });
      rawToken = result.rawToken;
    } catch (err) {
      // Se não houver credencial local (usuário Google-only), não revela:
      if (err instanceof PasswordError && err.code === "credential_not_found") {
        return { ok: true };
      }
      throw err;
    }

    const resetUrl = `${input.origin.replace(/\/$/, "")}/redefinir-senha/${rawToken}?email=${encodeURIComponent(email)}`;
    const tpl = renderResetPasswordEmail({ to: email, resetUrl });
    await sendEmail({
      to: email,
      subject: tpl.subject,
      html: tpl.html,
      text: tpl.text,
      tag: "f47.password.reset",
    }).catch(() => undefined); // best-effort: não revela falha de provedor

    return { ok: true };
  },
});
