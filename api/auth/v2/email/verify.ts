/**
 * api/auth/v2/email/verify.ts
 *
 * F47 — Confirma o e-mail do usuário convidado, consumindo o token enviado
 * em `renderVerifyEmail`. Endpoint público: o link no e-mail dispara este
 * POST com `{ email, token }`. Resolve o `userId` pelo e-mail (case-insensitive)
 * e chama `confirmEmailVerification`.
 *
 * Anti-enumeração:
 *   • Qualquer falha (token inválido, e-mail não cadastrado, expirado) cai
 *     no mapping do `handlerFactory` que devolve 401 `invalid_verification_token`.
 *
 * Sucesso (200): `{ verified: true }`
 */
import { z } from "zod";
import { eq } from "drizzle-orm";

import { createApiHandler } from "../../../../server/http/handlerFactory.js";
import { db } from "../../../../server/db/client.js";
import { users } from "../../../../server/db/schema.js";
import {
  confirmEmailVerification,
  PasswordError,
} from "../../../../server/auth/passwordCredentials.js";

const InputSchema = z.object({
  email: z.string().email(),
  token: z.string().min(8),
});

type Input = z.infer<typeof InputSchema>;

export default createApiHandler<Input, { verified: true }>({
  methods: ["POST"],
  schema: InputSchema,
  tag: "auth.v2.email.verify",
  handler: async ({ input }) => {
    const email = input.email.trim().toLowerCase();
    const rows = await db()
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    const user = rows[0];
    if (!user) {
      // Não revela se o e-mail existe ou não — devolve mesmo erro do token inválido.
      throw new PasswordError("invalid_verification_token");
    }
    return await confirmEmailVerification({
      userId: user.id,
      rawToken: input.token,
    });
  },
});
