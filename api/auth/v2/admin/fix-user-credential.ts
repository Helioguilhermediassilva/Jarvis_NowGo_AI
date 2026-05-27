/**
 * api/auth/v2/admin/fix-user-credential.ts
 *
 * Endpoint admin temporário para criar password_credentials para um usuário
 * que ficou sem credencial após um accept-invite que falhou (caso Serena).
 *
 * Recebe { adminToken, email, password }, gera o hash Argon2 da senha e
 * grava em password_credentials com verifiedAt=now() (a posse do endereço
 * já foi provada pelo recebimento do convite). Devolve { ok, userId }.
 *
 * Idempotente por e-mail: se já existir credencial, atualiza o hash.
 *
 * Será REMOVIDO depois de usado.
 */
import { z } from "zod";
import { eq } from "drizzle-orm";
import crypto from "node:crypto";

import { createApiHandler } from "../../../../server/http/handlerFactory.js";
import { db } from "../../../../server/db/client.js";
import {
  users,
  passwordCredentials,
} from "../../../../server/db/schema.js";
import {
  hashPassword,
} from "../../../../server/auth/passwordCredentials.js";

const InputSchema = z.object({
  adminToken: z.string().min(8),
  email: z.string().email().toLowerCase(),
  password: z.string().min(12),
});

type Input = z.infer<typeof InputSchema>;

interface Output {
  ok: true;
  userId: string;
  action: "created" | "updated";
}

export default createApiHandler<Input, Output>({
  methods: ["POST"],
  schema: InputSchema,
  tag: "auth.v2.admin.fix-cred",
  handler: async ({ input }) => {
    const expected = process.env.JWT_SECRET ?? "";
    if (
      !expected ||
      !crypto.timingSafeEqual(
        Buffer.from(expected.padEnd(64, "0").slice(0, 64)),
        Buffer.from(input.adminToken.padEnd(64, "0").slice(0, 64)),
      )
    ) {
      throw new Error("forbidden");
    }

    const userRow = await db()
      .select()
      .from(users)
      .where(eq(users.email, input.email))
      .limit(1);
    const user = userRow[0];
    if (!user) {
      throw new Error(`user_not_found: ${input.email}`);
    }

    const hash = await hashPassword(input.password);

    const existing = await db()
      .select()
      .from(passwordCredentials)
      .where(eq(passwordCredentials.userId, user.id))
      .limit(1);

    if (existing[0]) {
      await db()
        .update(passwordCredentials)
        .set({
          argon2Hash: hash,
          verifiedAt: new Date(),
          verificationTokenHash: null,
          verificationSentAt: null,
          failedAttempts: 0,
          lockedUntil: null,
          resetTokenHash: null,
          resetTokenExpiresAt: null,
          passwordChangedAt: new Date(),
        })
        .where(eq(passwordCredentials.userId, user.id));
      return { ok: true, userId: user.id, action: "updated" };
    }

    await db().insert(passwordCredentials).values({
      userId: user.id,
      argon2Hash: hash,
      verifiedAt: new Date(),
      verificationTokenHash: null,
      verificationSentAt: null,
      passwordChangedAt: new Date(),
      failedAttempts: 0,
      lockedUntil: null,
      resetTokenHash: null,
      resetTokenExpiresAt: null,
    });

    return { ok: true, userId: user.id, action: "created" };
  },
});
