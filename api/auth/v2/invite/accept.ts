/**
 * api/auth/v2/invite/accept.ts
 *
 * F47 — Aceita um convite e cria a conta do convidado.
 *
 * Modos de cadastro suportados (parâmetro `mode`):
 *   • "password" — Senha local (Argon2id). E-mail de verificação é enviado
 *     em seguida; o usuário só consegue logar após confirmar o e-mail.
 *   • "google"   — Usuário criado sem senha; o login efetivo virá do
 *     fluxo Google OAuth posterior (matching por e-mail). Não envia e-mail
 *     de verificação porque o Google já valida o endereço.
 *
 * Fluxo (rota pública, mas guardada por token de uso único):
 *   1. Validar `validateInvitationToken` (sem consumir) para garantir que
 *      ainda está disponível e capturar `invitation.email`.
 *   2. Garantir que o usuário ainda não existe pelo e-mail; se existir,
 *      apenas reaproveita (`tenant_members` será criado pelo
 *      `consumeInvitation` em transação).
 *   3. Para `mode=password`: chamar `createPasswordCredential`. Para
 *      `mode=google`: pular essa etapa.
 *   4. Chamar `consumeInvitation({rawToken, userId})` para marcar o convite
 *      como usado e criar `tenant_members` em transação.
 *   5. Para `mode=password`: enviar e-mail de verificação.
 *
 * Resposta de sucesso (200):
 *   { ok: true, userId, tenantId, role, requiresEmailVerification }
 *
 * Erros importantes:
 *   • Convite inválido/expirado/usado → 410 (mapeado pelo handlerFactory).
 *   • Senha fraca → 400 weak_password (PasswordError).
 *   • E-mail já cadastrado em outra conta → cria membership idempotente.
 */
import { z } from "zod";
import { eq } from "drizzle-orm";

import { createApiHandler } from "../../../../server/http/handlerFactory.js";
import { db } from "../../../../server/db/client.js";
import { users } from "../../../../server/db/schema.js";
import {
  validateInvitationToken,
  consumeInvitation,
} from "../../../../server/auth/invitations.js";
import { createPasswordCredential } from "../../../../server/auth/passwordCredentials.js";
import {
  renderVerifyEmail,
  sendEmail,
} from "../../../../server/email/resendClient.js";

const InputSchema = z.discriminatedUnion("mode", [
  z.object({
    mode: z.literal("password"),
    token: z.string().min(8),
    password: z.string().min(12),
    name: z.string().min(1).max(120).optional(),
    origin: z.string().url(),
  }),
  z.object({
    mode: z.literal("google"),
    token: z.string().min(8),
    name: z.string().min(1).max(120).optional(),
    origin: z.string().url(),
  }),
]);

type Input = z.infer<typeof InputSchema>;

interface Output {
  ok: true;
  userId: string;
  tenantId: string;
  role: string;
  requiresEmailVerification: boolean;
}

async function getOrCreateUserByEmail(
  email: string,
  name: string | undefined,
): Promise<{ id: string; created: boolean }> {
  const existing = await db()
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  if (existing[0]) return { id: existing[0].id, created: false };
  const [inserted] = await db()
    .insert(users)
    .values({
      email,
      name: name ?? null,
      role: "user",
    })
    .returning();
  if (!inserted) {
    throw new Error("Falha ao criar usuário");
  }
  return { id: inserted.id, created: true };
}

export default createApiHandler<Input, Output>({
  methods: ["POST"],
  schema: InputSchema,
  tag: "auth.v2.invite.accept",
  handler: async ({ input }) => {
    // 1) Validar convite (não consome ainda)
    const { invitation } = await validateInvitationToken(input.token);

    // 2) Garantir usuário (idempotente por e-mail do convite)
    const { id: userId, created } = await getOrCreateUserByEmail(
      invitation.email,
      input.name,
    );

    // 3) Credencial local apenas no mode=password
    let requiresEmailVerification = false;
    if (input.mode === "password" && created) {
      // Só cria credencial em conta nova: se já existia user (Google prévio),
      // não sobrescreve. UI deve detectar isso e oferecer "associar Google".
      const cred = await createPasswordCredential({
        userId,
        password: input.password,
        requireEmailVerification: true,
      });
      requiresEmailVerification = true;

      // 5) Enviar e-mail de verificação
      if (cred.verificationRawToken) {
        const verifyUrl = `${input.origin.replace(/\/$/, "")}/verificar-email/${cred.verificationRawToken}`;
        const tpl = renderVerifyEmail({ to: invitation.email, verifyUrl });
        await sendEmail({
          to: invitation.email,
          subject: tpl.subject,
          html: tpl.html,
          text: tpl.text,
          tag: "f47.verify",
        });
      }
    }

    // 4) Consumir convite + criar tenant_members em transação atômica
    const consumed = await consumeInvitation({
      rawToken: input.token,
      userId,
    });

    return {
      ok: true,
      userId: consumed.userId,
      tenantId: consumed.tenantId,
      role: consumed.role,
      requiresEmailVerification,
    };
  },
});
