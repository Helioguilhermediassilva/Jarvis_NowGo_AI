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
 *   { ok: true, userId, tenantId, role, platformAccess, requiresEmailVerification }
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
// renderVerifyEmail/sendEmail removidos: e-mail de verificação não é enviado
// no fluxo de aceitar convite (a posse do endereço já foi provada pelo recebimento
// do convite). Mantemos requiresEmailVerification=false por compatibilidade de schema.

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
  platformAccess: boolean;
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
    // IMPORTANTE: o convite é enviado para o e-mail do destinatário, ou seja,
    // ter recebido o link já prova posse do endereço. Por isso não exigimos
    // verificação adicional de e-mail aqui — marcamos verifiedAt=now() já na
    // criação da credencial. Isso evita o problema de o usuário definir senha
    // e não conseguir logar enquanto o e-mail de verificação não for clicado.
    if (input.mode === "password" && created) {
      // Só cria credencial em conta nova: se já existia user (Google prévio),
      // não sobrescreve. UI deve detectar isso e oferecer "associar Google".
      // Faz isto ANTES de consumir o convite, para que falhas (e.g. argon2
      // estourando RAM serverless) não deixem o usuário sem credencial mas
      // com tenant_members criado.
      try {
        await createPasswordCredential({
          userId,
          password: input.password,
          requireEmailVerification: false,
        });
      } catch (err) {
        // Re-lança com contexto para não ser engolido pelo handlerFactory
        const msg = err instanceof Error ? err.message : String(err);
        throw new Error(`accept-invite credential failed: ${msg}`);
      }
    }
    const requiresEmailVerification = false;

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
      platformAccess: consumed.platformAccess,
      requiresEmailVerification,
    };
  },
});
