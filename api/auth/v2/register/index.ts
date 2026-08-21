/**
 * api/auth/v2/register/index.ts
 *
 * Cadastro público por e-mail e senha.
 *
 * A conta é criada com tenant pessoal e membership owner, mas sem acesso à
 * Plataforma até que uma assinatura ou compra válida seja reconciliada pelo
 * webhook Stripe. A credencial exige confirmação do e-mail antes do login.
 */
import { z } from "zod";
import { eq } from "drizzle-orm";

import { createApiHandler } from "../../../../server/http/handlerFactory.js";
import { db } from "../../../../server/db/client.js";
import {
  passwordCredentials,
  tenantMembers,
  tenants,
  users,
} from "../../../../server/db/schema.js";
import {
  createPasswordCredential,
  evaluatePasswordPolicy,
  PasswordError,
} from "../../../../server/auth/passwordCredentials.js";
import { renderVerifyEmail, sendEmail } from "../../../../server/email/resendClient.js";
import { getAppOrigin } from "../../../../server/billing/catalog.js";
import { rlKey, tryConsume } from "../../../../server/http/rateLimit.js";

const InputSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1),
  name: z.string().trim().max(120).optional(),
  // Mantido no contrato do cliente. A origem efetiva é resolvida no servidor
  // para não transformar o endpoint em um redirecionador aberto.
  origin: z.string().url(),
});

type Input = z.infer<typeof InputSchema>;

interface Output {
  ok: true;
  emailVerificationSent: boolean;
}

const REGISTER_CAPACITY = 5;
const REGISTER_WINDOW_SECONDS = 15 * 60;

export default createApiHandler<Input, Output>({
  methods: ["POST"],
  schema: InputSchema,
  tag: "auth.v2.register",
  handler: async ({ req, res, input, clientIp }) => {
    const rate = tryConsume(
      rlKey("auth-register", clientIp),
      {
        capacity: REGISTER_CAPACITY,
        refillPerSec: REGISTER_CAPACITY / REGISTER_WINDOW_SECONDS,
      },
    );
    if (!rate.allowed) {
      res.setHeader("Retry-After", String(rate.resetSec));
      res.status(429).json({ error: "rate_limited" });
      return undefined as never;
    }

    const policy = evaluatePasswordPolicy(input.password);
    if (!policy.ok) {
      throw new PasswordError("weak_password", policy.errors.join("; "));
    }

    const email = input.email;
    const existing = await db()
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    if (existing[0]) {
      throw new PasswordError("email_already_registered");
    }

    // A inserção condicional evita criar uma segunda conta se duas requisições
    // concorrentes chegarem com o mesmo e-mail entre o SELECT e o INSERT.
    const [user] = await db()
      .insert(users)
      .values({
        email,
        name: input.name?.trim() || email.split("@")[0],
        role: "user",
      })
      .onConflictDoNothing({ target: users.email })
      .returning({ id: users.id });
    if (!user) {
      throw new PasswordError("email_already_registered");
    }

    let credential: Awaited<ReturnType<typeof createPasswordCredential>>;
    try {
      credential = await createPasswordCredential({
        userId: user.id,
        password: input.password,
        requireEmailVerification: true,
      });

      await db().transaction(async (tx) => {
        const [tenant] = await tx
          .insert(tenants)
          .values({
            slug: `personal-${user.id}`,
            name: `NowGo AI — ${email}`,
            plan: "starter",
            createdByUserId: user.id,
          })
          .returning({ id: tenants.id });
        if (!tenant) throw new Error("Falha ao criar tenant pessoal");

        await tx.insert(tenantMembers).values({
          tenantId: tenant.id,
          userId: user.id,
          role: "owner",
          platformAccess: false,
        });
      });
    } catch (error) {
      // Remove somente os registros criados por esta tentativa para não deixar
      // uma conta sem credencial ou sem membership utilizável.
      await db().delete(passwordCredentials).where(eq(passwordCredentials.userId, user.id));
      await db().delete(users).where(eq(users.id, user.id));
      throw error;
    }

    let emailVerificationSent = false;
    if (credential.verificationRawToken) {
      try {
        const configuredOrigin = process.env.NOWGO_PUBLIC_ORIGIN?.trim();
        const origin = configuredOrigin
          ? configuredOrigin.replace(/\/$/, "")
          : getAppOrigin(req).replace(/\/$/, "");
        const verifyUrl = `${origin}/verificar-email/${encodeURIComponent(credential.verificationRawToken)}?email=${encodeURIComponent(email)}`;
        const rendered = renderVerifyEmail({ to: email, verifyUrl });
        await sendEmail({
          to: email,
          subject: rendered.subject,
          html: rendered.html,
          text: rendered.text,
          tag: "auth-register-verification",
        });
        emailVerificationSent = true;
      } catch (error) {
        // A conta permanece criada; o usuário pode solicitar um novo fluxo de
        // recuperação/reenvio posteriormente. Nunca registramos o token bruto.
        console.error(
          "[auth.register] falha no envio de verificação:",
          error instanceof Error ? error.message : error,
        );
      }
    }

    return { ok: true, emailVerificationSent };
  },
});
