/**
 * server/auth/sessions.ts
 *
 * Sessões de usuário autenticadas via cookie HTTP.
 *
 * Decisões de produto (Hélio, 2026-05-26):
 *   • TTL: 7 dias renováveis (a cada acesso, sliding expiration).
 *   • Cookie: HttpOnly, Secure, SameSite=Lax, path=/, domain do app.
 *   • Token criptográfico de 32 bytes (256 bits) gerado por `tokens.ts`,
 *     persistido apenas como SHA-256 hash em `sessions.session_token_hash`.
 *   • Revogação: marca `revoked_at`. Sessões revogadas ou expiradas são
 *     rejeitadas em `loadSessionByRawToken`.
 *   • Renovação automática: a cada `loadSessionByRawToken` válido,
 *     `last_seen_at` é atualizado e `expires_at` empurrado para now+7d
 *     (sliding window).
 *
 * Compat: este módulo NÃO interage com Express/headers diretamente. Ele expõe
 * primitivas (`createSession`, `loadSessionByRawToken`, `revokeSession`,
 * `serializeCookie`) que a camada de rota (api/auth/*.ts) compõe.
 */
import { and, eq, isNull } from "drizzle-orm";

import { db } from "../db/client.js";
import { sessions, type SessionRow } from "../db/schema.js";
import { generateTokenPair, hashToken } from "./tokens.js";

// ---------------------------------------------------------------------------
// Constantes
// ---------------------------------------------------------------------------

export const SESSION_TTL_MS = 7 * 24 * 60 * 60_000; // 7 dias
export const COOKIE_NAME = "nowgo_session";
export const COOKIE_PATH = "/";
export const COOKIE_SAMESITE = "Lax" as const;

// ---------------------------------------------------------------------------
// Erros
// ---------------------------------------------------------------------------

export class SessionError extends Error {
  constructor(
    public readonly code:
      | "invalid_session"
      | "expired_session"
      | "revoked_session"
      | "internal_error",
    message?: string,
  ) {
    super(message ?? code);
    this.name = "SessionError";
  }
}

// ---------------------------------------------------------------------------
// Criação de sessão
// ---------------------------------------------------------------------------

export interface CreateSessionInput {
  userId: string;
  tenantId: string;
  ip?: string | null;
  userAgent?: string | null;
  /** TTL customizado em ms (default = SESSION_TTL_MS). */
  ttlMs?: number;
}

export interface CreateSessionResult {
  /** Token bruto a ser colocado no cookie. NUNCA persistido. */
  rawToken: string;
  /** Linha persistida (sem o segredo). */
  session: SessionRow;
  /** Quando o cookie deve expirar. */
  expiresAt: Date;
}

export async function createSession(
  input: CreateSessionInput,
): Promise<CreateSessionResult> {
  if (!input.userId || !input.tenantId) {
    throw new SessionError("internal_error", "userId e tenantId obrigatórios");
  }
  const { raw, hash } = generateTokenPair();
  const ttl = input.ttlMs ?? SESSION_TTL_MS;
  if (ttl < 60_000 || ttl > 30 * 24 * 60 * 60_000) {
    throw new SessionError("internal_error", "ttlMs fora dos limites");
  }
  const expiresAt = new Date(Date.now() + ttl);

  const [row] = await db()
    .insert(sessions)
    .values({
      userId: input.userId,
      tenantId: input.tenantId,
      sessionTokenHash: hash,
      ip: input.ip ?? null,
      userAgent: input.userAgent ?? null,
      expiresAt,
    })
    .returning();

  if (!row) {
    throw new SessionError("internal_error", "falha ao persistir sessão");
  }

  return { rawToken: raw, session: row, expiresAt };
}

// ---------------------------------------------------------------------------
// Carregamento + renovação
// ---------------------------------------------------------------------------

export interface LoadedSession {
  session: SessionRow;
  /** Se sliding-window foi aplicado, novo expiresAt vai aqui (cookie deve ser reemitido). */
  renewedExpiresAt?: Date;
}

/**
 * Carrega sessão a partir do token bruto vindo do cookie.
 * Aplica sliding-window TTL: se passou pelo menos 5min desde lastSeenAt,
 * empurra expires_at para now+7d e atualiza lastSeenAt.
 */
export async function loadSessionByRawToken(
  rawToken: string,
): Promise<LoadedSession> {
  if (!rawToken) {
    throw new SessionError("invalid_session");
  }
  const tokenHash = hashToken(rawToken);
  const rows = await db()
    .select()
    .from(sessions)
    .where(eq(sessions.sessionTokenHash, tokenHash))
    .limit(1);
  const row = rows[0];
  if (!row) {
    throw new SessionError("invalid_session");
  }
  if (row.revokedAt !== null) {
    throw new SessionError("revoked_session");
  }
  if (row.expiresAt.getTime() <= Date.now()) {
    throw new SessionError("expired_session");
  }

  // Sliding window: só atualiza se passou ≥5min desde o lastSeenAt
  const SLIDING_THROTTLE_MS = 5 * 60_000;
  let renewedExpiresAt: Date | undefined;
  if (Date.now() - row.lastSeenAt.getTime() >= SLIDING_THROTTLE_MS) {
    renewedExpiresAt = new Date(Date.now() + SESSION_TTL_MS);
    await db()
      .update(sessions)
      .set({ lastSeenAt: new Date(), expiresAt: renewedExpiresAt })
      .where(eq(sessions.id, row.id));
  }

  return { session: row, renewedExpiresAt };
}

// ---------------------------------------------------------------------------
// Revogação
// ---------------------------------------------------------------------------

export async function revokeSession(rawToken: string): Promise<{ revoked: boolean }> {
  if (!rawToken) return { revoked: false };
  const tokenHash = hashToken(rawToken);
  const result = await db()
    .update(sessions)
    .set({ revokedAt: new Date() })
    .where(
      and(eq(sessions.sessionTokenHash, tokenHash), isNull(sessions.revokedAt)),
    )
    .returning();
  return { revoked: result.length > 0 };
}

/** Revoga TODAS as sessões ativas de um usuário (ex: pós password reset). */
export async function revokeAllUserSessions(
  userId: string,
): Promise<{ revoked: number }> {
  const result = await db()
    .update(sessions)
    .set({ revokedAt: new Date() })
    .where(and(eq(sessions.userId, userId), isNull(sessions.revokedAt)))
    .returning();
  return { revoked: result.length };
}

// ---------------------------------------------------------------------------
// Cookie helpers (sem dependência de framework)
// ---------------------------------------------------------------------------

export interface SerializeCookieOptions {
  rawToken: string;
  expiresAt: Date;
  /** Domínio do cookie. Em produção: `.cockpitcrmnowgoai.com`. Em dev: omit. */
  domain?: string;
  /** Default true em produção; permite false em testes locais sobre HTTP. */
  secure?: boolean;
}

export function serializeCookie(opts: SerializeCookieOptions): string {
  const parts = [
    `${COOKIE_NAME}=${encodeURIComponent(opts.rawToken)}`,
    `Path=${COOKIE_PATH}`,
    `Expires=${opts.expiresAt.toUTCString()}`,
    `HttpOnly`,
    `SameSite=${COOKIE_SAMESITE}`,
  ];
  if (opts.secure ?? true) parts.push("Secure");
  if (opts.domain) parts.push(`Domain=${opts.domain}`);
  return parts.join("; ");
}

/** Cookie que apaga a sessão (Set-Cookie no logout). */
export function serializeClearCookie(domain?: string): string {
  const parts = [
    `${COOKIE_NAME}=`,
    `Path=${COOKIE_PATH}`,
    `Expires=Thu, 01 Jan 1970 00:00:00 GMT`,
    `Max-Age=0`,
    `HttpOnly`,
    `SameSite=${COOKIE_SAMESITE}`,
    `Secure`,
  ];
  if (domain) parts.push(`Domain=${domain}`);
  return parts.join("; ");
}

/** Extrai o token bruto do header Cookie de uma request. */
export function parseSessionCookie(cookieHeader: string | null | undefined): string | null {
  if (!cookieHeader) return null;
  const pairs = cookieHeader.split(/;\s*/);
  for (const pair of pairs) {
    const [name, ...rest] = pair.split("=");
    if (name === COOKIE_NAME) {
      return decodeURIComponent(rest.join("="));
    }
  }
  return null;
}

// ---------------------------------------------------------------------------
// Helpers para testes
// ---------------------------------------------------------------------------

export const _internal = {
  SESSION_TTL_MS,
  COOKIE_NAME,
  COOKIE_PATH,
  COOKIE_SAMESITE,
};
