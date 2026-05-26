/**
 * server/http/authMiddlewareV2.ts
 *
 * Middleware de autenticação F47 (cookie `nowgo_session_v2`).
 *
 * Use em endpoints novos sob /api/cockpit/* e /api/auth/v2/*.
 * NÃO substitui o `requireAuth` em server/auth.ts (JWT/Notion) que continua
 * servindo /cockpit interno para o Hélio.
 */
import type { VercelRequest, VercelResponse } from "@vercel/node";

import { db } from "../db/client.js";
import { mfaCredentials, tenantMembers, users } from "../db/schema.js";
import { and, eq } from "drizzle-orm";
import {
  loadSessionByRawToken,
  parseSessionCookie,
  SessionError,
  serializeCookie,
} from "../auth/sessions.js";

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

export type V2Role = "superadmin" | "owner" | "admin" | "member";

export interface V2AuthContext {
  userId: string;
  tenantId: string;
  /** Role no tenant atual (para superadmin platform-wide é "superadmin"). */
  role: V2Role;
  email: string;
  mfaEnabled: boolean;
}

// ---------------------------------------------------------------------------
// Função principal
// ---------------------------------------------------------------------------

/**
 * Lê cookie de sessão, valida no banco, retorna contexto.
 * Se inválido/expirado/revogado, lança `SessionError` (handlerFactory mapeia para 401).
 *
 * Side effect: se `loadSessionByRawToken` aplicou sliding-window, este middleware
 * re-emite o cookie com o novo expiresAt antes de retornar.
 */
export async function requireV2Auth(
  req: VercelRequest,
  res: VercelResponse,
): Promise<V2AuthContext> {
  const cookieHeader = (req.headers["cookie"] ?? req.headers["Cookie"]) as
    | string
    | undefined
    | null;
  const rawToken = parseSessionCookie(cookieHeader ?? null);
  if (!rawToken) {
    throw new SessionError("invalid_session");
  }

  const loaded = await loadSessionByRawToken(rawToken);

  // Re-emitir cookie se sliding-window foi aplicado
  if (loaded.renewedExpiresAt) {
    res.setHeader(
      "Set-Cookie",
      serializeCookie({
        rawToken,
        expiresAt: loaded.renewedExpiresAt,
        domain: cookieDomainFromEnv(),
      }),
    );
  }

  // Carrega user
  const userRows = await db()
    .select()
    .from(users)
    .where(eq(users.id, loaded.session.userId))
    .limit(1);
  const user = userRows[0];
  if (!user) {
    throw new SessionError("invalid_session", "user_missing");
  }

  // Deriva mfaEnabled da existência da linha em mfa_credentials
  // (a linha só é gravada após a verificação bem-sucedida do código TOTP).
  const mfaRows = await db()
    .select({ userId: mfaCredentials.userId })
    .from(mfaCredentials)
    .where(eq(mfaCredentials.userId, user.id))
    .limit(1);
  const mfaEnabled = mfaRows.length > 0;

  // Resolve role no tenant (superadmin é platform-wide)
  let role: V2Role;
  if (user.role === "superadmin") {
    role = "superadmin";
  } else {
    const memberRows = await db()
      .select()
      .from(tenantMembers)
      .where(
        and(
          eq(tenantMembers.userId, loaded.session.userId),
          eq(tenantMembers.tenantId, loaded.session.tenantId),
        ),
      )
      .limit(1);
    const member = memberRows[0];
    if (!member) {
      throw new SessionError("invalid_session", "no_membership");
    }
    role = member.role as V2Role;
  }

  return {
    userId: loaded.session.userId,
    tenantId: loaded.session.tenantId,
    role,
    email: user.email,
    mfaEnabled,
  };
}

/**
 * Variante que aceita uma lista de roles. Lança SessionError("forbidden")
 * se a role não estiver na lista.
 */
export async function requireV2Role(
  req: VercelRequest,
  res: VercelResponse,
  allowed: ReadonlyArray<V2Role>,
): Promise<V2AuthContext> {
  const ctx = await requireV2Auth(req, res);
  if (!allowed.includes(ctx.role)) {
    throw new SessionError("invalid_session", "forbidden");
  }
  return ctx;
}

function cookieDomainFromEnv(): string | undefined {
  // Em produção, seta o domínio explicitamente para evitar leakage entre subdomínios.
  // Em dev (localhost), retorna undefined.
  const env = process.env.NOWGO_COOKIE_DOMAIN;
  return env && env.trim().length > 0 ? env.trim() : undefined;
}

export const _internal = { cookieDomainFromEnv };
