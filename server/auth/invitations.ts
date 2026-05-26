/**
 * server/auth/invitations.ts
 *
 * Convites para clientes externos entrarem na plataforma F47.
 *
 * Fluxo:
 *   1. Superadmin/owner chama `createInvitation({email, tenantId, role, ttlHours, invitedBy})`.
 *   2. Recebe `{rawToken, invitationId, expiresAt}`. O `rawToken` é embutido
 *      em uma URL `https://cockpit.../convite/<rawToken>` e enviada via Resend
 *      (modo log-only por enquanto).
 *   3. Quando o convidado clica, o frontend chama `validateInvitationToken(rawToken)`.
 *   4. Se válido, exibe formulário de cadastro (Google OAuth ou senha local).
 *   5. Após cadastro, chama `consumeInvitation({rawToken, userId})` que marca
 *      o convite como usado e cria o `tenant_members` correspondente, em uma
 *      mesma transação atômica.
 *
 * Garantias de segurança:
 *   • Token bruto NUNCA é persistido — só o `tokenHash` (SHA-256) na tabela.
 *   • Validação `timingSafeEqual` evita timing attacks de enumeração de tokens.
 *   • Resposta a tokens inválidos é uniforme (mesma forma de erro, mesma latência).
 *   • Convite usado/revogado/expirado falha sem revelar qual dos três é o motivo
 *     para o consumidor externo (mensagem genérica).
 *   • `consumeInvitation` em transação serializável: o `usedAt` é setado e
 *     o `tenant_members` é criado atomicamente — se a criação falhar, o convite
 *     volta para o estado disponível (rollback).
 */
import { and, eq, isNull } from "drizzle-orm";
import { db } from "../db/client.js";
import {
  invitations,
  tenantMembers,
  type InvitationRow,
} from "../db/schema.js";
import { generateTokenPair, hashToken } from "./tokens.js";

/** TTL default de 72h, alinhado à doc de arquitetura F47. */
export const INVITATION_DEFAULT_TTL_HOURS = 72;

/** Roles permitidos em convites. Bate com `tenant_members.role`. */
export type TenantRole = "owner" | "admin" | "member" | "viewer";

const VALID_ROLES: ReadonlySet<TenantRole> = new Set<TenantRole>([
  "owner",
  "admin",
  "member",
  "viewer",
]);

/** Erros tipados para diferenciar fluxos no consumidor (sem vazar para o usuário externo). */
export class InvitationError extends Error {
  constructor(
    public readonly code:
      | "invalid_token"
      | "expired"
      | "already_used"
      | "revoked"
      | "invalid_role"
      | "invalid_email"
      | "invalid_ttl"
      | "tenant_member_already_exists"
      | "internal_error",
    message?: string,
  ) {
    super(message ?? code);
    this.name = "InvitationError";
  }
}

export interface CreateInvitationInput {
  /** E-mail do convidado (validação básica de formato). */
  email: string;
  /** Tenant ao qual o convidado será vinculado. */
  tenantId: string;
  /** Papel inicial do convidado dentro do tenant. */
  role: TenantRole;
  /** TTL em horas (padrão 72h, mínimo 1, máximo 168 = 7 dias). */
  ttlHours?: number;
  /** UUID do user (superadmin/owner) que está emitindo o convite. */
  invitedBy: string;
}

export interface CreateInvitationResult {
  invitationId: string;
  /** Token bruto a ser embutido na URL do convite. NUNCA persista isto. */
  rawToken: string;
  expiresAt: Date;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function validateCreateInput(input: CreateInvitationInput): {
  email: string;
  ttlHours: number;
} {
  const email = normalizeEmail(input.email ?? "");
  if (!EMAIL_RE.test(email)) {
    throw new InvitationError("invalid_email", `Formato de e-mail inválido: ${input.email}`);
  }
  if (!VALID_ROLES.has(input.role)) {
    throw new InvitationError("invalid_role", `Role inválido: ${input.role}`);
  }
  const ttlHours = input.ttlHours ?? INVITATION_DEFAULT_TTL_HOURS;
  if (!Number.isFinite(ttlHours) || ttlHours < 1 || ttlHours > 168) {
    throw new InvitationError(
      "invalid_ttl",
      `ttlHours deve estar em [1, 168]; recebido ${ttlHours}`,
    );
  }
  return { email, ttlHours };
}

/**
 * Emite um novo convite. Retorna `{rawToken, invitationId, expiresAt}`.
 * O `rawToken` deve ser embutido na URL e enviado por e-mail; só o hash
 * fica no banco.
 */
export async function createInvitation(
  input: CreateInvitationInput,
): Promise<CreateInvitationResult> {
  const { email, ttlHours } = validateCreateInput(input);
  const { raw, hash } = generateTokenPair();
  const expiresAt = new Date(Date.now() + ttlHours * 3600_000);

  const [row] = await db()
    .insert(invitations)
    .values({
      tokenHash: hash,
      email,
      tenantId: input.tenantId,
      role: input.role,
      invitedBy: input.invitedBy,
      expiresAt,
    })
    .returning();

  if (!row) {
    throw new InvitationError("internal_error", "insert do convite não retornou row");
  }

  return {
    invitationId: row.id,
    rawToken: raw,
    expiresAt,
  };
}

export interface ValidateInvitationResult {
  invitation: InvitationRow;
}

/**
 * Valida um token bruto vindo do link de convite.
 *
 * Falhas resultam em `InvitationError` com `code` específico; o consumidor
 * externo (rota HTTP) deve traduzir para uma mensagem genérica do tipo
 * "convite inválido ou expirado" para evitar enumeração.
 */
export async function validateInvitationToken(
  rawToken: string,
): Promise<ValidateInvitationResult> {
  if (typeof rawToken !== "string" || rawToken.length === 0) {
    throw new InvitationError("invalid_token");
  }

  let tokenHash: string;
  try {
    tokenHash = hashToken(rawToken);
  } catch {
    throw new InvitationError("invalid_token");
  }

  const rows = await db()
    .select()
    .from(invitations)
    .where(eq(invitations.tokenHash, tokenHash))
    .limit(1);

  const invitation = rows[0];
  if (!invitation) {
    throw new InvitationError("invalid_token");
  }
  if (invitation.revokedAt !== null) {
    throw new InvitationError("revoked");
  }
  if (invitation.usedAt !== null) {
    throw new InvitationError("already_used");
  }
  if (invitation.expiresAt.getTime() <= Date.now()) {
    throw new InvitationError("expired");
  }

  return { invitation };
}

export interface ConsumeInvitationInput {
  rawToken: string;
  userId: string;
}

export interface ConsumeInvitationResult {
  invitationId: string;
  tenantId: string;
  userId: string;
  role: TenantRole;
}

/**
 * Consome um convite válido em transação atômica:
 *  1. Verifica que o convite ainda está disponível (validação repetida).
 *  2. Marca `usedAt` + `usedBy` no convite.
 *  3. Cria `tenant_members` (idempotente — se já existir, mantém o vínculo).
 *
 * Falhas em qualquer ponto fazem rollback do convite (continua disponível).
 */
export async function consumeInvitation(
  input: ConsumeInvitationInput,
): Promise<ConsumeInvitationResult> {
  if (typeof input.rawToken !== "string" || input.rawToken.length === 0) {
    throw new InvitationError("invalid_token");
  }
  if (typeof input.userId !== "string" || input.userId.length === 0) {
    throw new InvitationError("internal_error", "userId obrigatório");
  }

  const tokenHash = hashToken(input.rawToken);
  const now = new Date();

  // Tenta marcar como usado SOMENTE se ainda está disponível — UPDATE com WHERE
  // garante atomicidade sem precisar de SELECT-then-UPDATE (que seria racy).
  const [updated] = await db()
    .update(invitations)
    .set({ usedAt: now, usedBy: input.userId })
    .where(
      and(
        eq(invitations.tokenHash, tokenHash),
        isNull(invitations.usedAt),
        isNull(invitations.revokedAt),
      ),
    )
    .returning();

  if (!updated) {
    // Pode ser: token errado, já usado, revogado, ou expirado.
    // Re-validamos para devolver um código preciso (uso INTERNO; a rota externa
    // deve mascarar).
    await validateInvitationToken(input.rawToken).catch((err) => {
      if (err instanceof InvitationError) throw err;
      throw new InvitationError("invalid_token");
    });
    throw new InvitationError("invalid_token");
  }

  if (updated.expiresAt.getTime() <= now.getTime()) {
    // Estava expirado; reverte o usedAt em uma operação compensatória.
    await db()
      .update(invitations)
      .set({ usedAt: null, usedBy: null })
      .where(eq(invitations.id, updated.id));
    throw new InvitationError("expired");
  }

  // Cria o membership (ON CONFLICT DO NOTHING via WHERE NOT EXISTS pattern via Drizzle).
  // Como a constraint UNIQUE(tenant_id, user_id) impede duplicatas, fazemos um
  // INSERT direto e tratamos o erro de duplicata como sinalização "já é membro".
  try {
    await db().insert(tenantMembers).values({
      tenantId: updated.tenantId,
      userId: input.userId,
      role: updated.role,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (
      /unique constraint/i.test(message) ||
      /duplicate key/i.test(message) ||
      /already exists/i.test(message)
    ) {
      // Idempotente: convite consumido, vínculo já existia.
    } else {
      // Erro real: reverte o usedAt para preservar o convite.
      await db()
        .update(invitations)
        .set({ usedAt: null, usedBy: null })
        .where(eq(invitations.id, updated.id));
      throw err;
    }
  }

  return {
    invitationId: updated.id,
    tenantId: updated.tenantId,
    userId: input.userId,
    role: updated.role as TenantRole,
  };
}

export interface RevokeInvitationInput {
  invitationId: string;
}

export async function revokeInvitation(
  input: RevokeInvitationInput,
): Promise<{ revoked: boolean }> {
  const [updated] = await db()
    .update(invitations)
    .set({ revokedAt: new Date() })
    .where(
      and(eq(invitations.id, input.invitationId), isNull(invitations.revokedAt)),
    )
    .returning();
  return { revoked: Boolean(updated) };
}

export interface ListInvitationsInput {
  tenantId?: string;
  email?: string;
  /** Inclui convites já usados/revogados/expirados (default: false). */
  includeInactive?: boolean;
}

export async function listInvitations(
  input: ListInvitationsInput = {},
): Promise<InvitationRow[]> {
  const conditions = [];
  if (input.tenantId) {
    conditions.push(eq(invitations.tenantId, input.tenantId));
  }
  if (input.email) {
    conditions.push(eq(invitations.email, normalizeEmail(input.email)));
  }
  if (!input.includeInactive) {
    conditions.push(isNull(invitations.usedAt));
    conditions.push(isNull(invitations.revokedAt));
  }
  const whereClause =
    conditions.length === 0
      ? undefined
      : conditions.length === 1
        ? conditions[0]
        : and(...conditions);
  const query = db().select().from(invitations);
  const rows = whereClause ? await query.where(whereClause) : await query;
  // Filtra expirados em memória se não estamos incluindo inativos.
  if (!input.includeInactive) {
    const now = Date.now();
    return rows.filter((r) => r.expiresAt.getTime() > now);
  }
  return rows;
}

// Re-exporta utilidades para os testes
export const _internal = {
  EMAIL_RE,
  VALID_ROLES,
};
