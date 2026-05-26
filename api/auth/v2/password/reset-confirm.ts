/**
 * api/auth/v2/password/reset-confirm.ts
 *
 * F47 — Confirma a redefinição de senha. Recebe `email`, `token` e
 * `newPassword`, valida via `consumePasswordReset` e — em sucesso —
 * revoga TODAS as sessões V2 ativas do usuário (logout-everywhere)
 * para forçar novo login com a senha nova.
 *
 * Não cria nova sessão automaticamente: o frontend redireciona para /login.
 */
import { z } from "zod";
import { eq } from "drizzle-orm";

import { createApiHandler } from "../../../../server/http/handlerFactory.js";
import { db } from "../../../../server/db/client.js";
import { users } from "../../../../server/db/schema.js";
import {
  consumePasswordReset,
  PasswordError,
} from "../../../../server/auth/passwordCredentials.js";
import { revokeAllUserSessions } from "../../../../server/auth/sessions.js";

const InputSchema = z.object({
  email: z.string().email(),
  token: z.string().min(8),
  newPassword: z.string().min(12).max(256),
});

type Input = z.infer<typeof InputSchema>;

export default createApiHandler<Input, { ok: true }>({
  methods: ["POST"],
  schema: InputSchema,
  tag: "auth.v2.password.reset_confirm",
  handler: async ({ input }) => {
    const email = input.email.trim().toLowerCase();
    const userRows = await db()
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    const user = userRows[0];
    if (!user) {
      throw new PasswordError("invalid_reset_token");
    }

    await consumePasswordReset({
      userId: user.id,
      rawToken: input.token,
      newPassword: input.newPassword,
    });

    // Logout-everywhere: invalida sessões ativas
    await revokeAllUserSessions(user.id);

    return { ok: true };
  },
});
