/**
 * server/auth.ts
 *
 * NowGo AI — Camada de autenticação soberana.
 *
 * Responsabilidades:
 *  - Gerar e verificar JWT de sessão (HS256, segredo NOWGO_JWT_SECRET)
 *  - Trocar `authorization_code` por `id_token` Google (OAuth2 Web App)
 *  - Validar o `id_token` contra os JWKS oficiais do Google
 *  - Resolver papel do usuário consultando a whitelist (Notion + fallback env)
 *  - Helpers de cookie HttpOnly (`nowgo_session`)
 *
 * Princípios:
 *  - Nenhum dado sensível em logs.
 *  - Tudo server-side. JWT_SECRET nunca é exposto ao cliente.
 *  - Whitelist é a fonte de verdade — sem registro, sem acesso.
 */

import { SignJWT, jwtVerify, createRemoteJWKSet } from "jose";

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

export type UserRole = "superadmin" | "operador" | "leitor";

export interface NowGoUser {
  email: string;
  name?: string;
  picture?: string;
  role: UserRole;
  active: boolean;
}

export interface NowGoSessionClaims {
  sub: string; // email (lowercase)
  name?: string;
  picture?: string;
  role: UserRole;
}

// ---------------------------------------------------------------------------
// Configuração
// ---------------------------------------------------------------------------

const SESSION_COOKIE_NAME = "nowgo_session";
const SESSION_TTL_SEC = 60 * 60 * 24 * 7; // 7 dias

const GOOGLE_JWKS = createRemoteJWKSet(
  new URL("https://www.googleapis.com/oauth2/v3/certs"),
);

function jwtSecretBytes(): Uint8Array {
  const raw = process.env.NOWGO_JWT_SECRET;
  if (!raw || raw.length < 32) {
    throw new Error(
      "NOWGO_JWT_SECRET ausente ou curto demais (mínimo 32 chars).",
    );
  }
  return new TextEncoder().encode(raw);
}

function googleClientId(): string {
  const v = process.env.NOWGO_OAUTH_CLIENT_ID;
  if (!v) throw new Error("NOWGO_OAUTH_CLIENT_ID ausente.");
  return v;
}

function googleClientSecret(): string {
  const v = process.env.NOWGO_OAUTH_CLIENT_SECRET;
  if (!v) throw new Error("NOWGO_OAUTH_CLIENT_SECRET ausente.");
  return v;
}

function superadminEmail(): string {
  return (process.env.NOWGO_SUPERADMIN_EMAIL ?? "helio@nowgo.com.br")
    .trim()
    .toLowerCase();
}

// ---------------------------------------------------------------------------
// Sessão JWT (HS256)
// ---------------------------------------------------------------------------

export async function issueSessionJWT(
  claims: NowGoSessionClaims,
): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  return await new SignJWT({
    name: claims.name,
    picture: claims.picture,
    role: claims.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(claims.sub)
    .setIssuedAt(now)
    .setExpirationTime(now + SESSION_TTL_SEC)
    .setIssuer("nowgo-jarvis")
    .setAudience("nowgo-jarvis")
    .sign(jwtSecretBytes());
}

export async function verifySessionJWT(
  token: string,
): Promise<NowGoSessionClaims | null> {
  try {
    const { payload } = await jwtVerify(token, jwtSecretBytes(), {
      issuer: "nowgo-jarvis",
      audience: "nowgo-jarvis",
    });
    if (typeof payload.sub !== "string" || !payload.role) return null;
    return {
      sub: payload.sub,
      name: typeof payload.name === "string" ? payload.name : undefined,
      picture:
        typeof payload.picture === "string" ? payload.picture : undefined,
      role: payload.role as UserRole,
    };
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Cookie helpers
// ---------------------------------------------------------------------------

export function buildSessionCookie(token: string): string {
  // Cookie HttpOnly + Secure + SameSite=Lax para fluxo OAuth redirect-back.
  return [
    `${SESSION_COOKIE_NAME}=${token}`,
    "Path=/",
    `Max-Age=${SESSION_TTL_SEC}`,
    "HttpOnly",
    "Secure",
    "SameSite=Lax",
  ].join("; ");
}

export function buildLogoutCookie(): string {
  return [
    `${SESSION_COOKIE_NAME}=`,
    "Path=/",
    "Max-Age=0",
    "HttpOnly",
    "Secure",
    "SameSite=Lax",
  ].join("; ");
}

export function readSessionFromCookieHeader(
  cookieHeader: string | undefined,
): string | null {
  if (!cookieHeader) return null;
  for (const part of cookieHeader.split(/;\s*/)) {
    const [k, ...rest] = part.split("=");
    if (k === SESSION_COOKIE_NAME) return rest.join("=");
  }
  return null;
}

// ---------------------------------------------------------------------------
// Google OAuth — troca de code por id_token + verificação JWKS
// ---------------------------------------------------------------------------

export interface GoogleIdTokenClaims {
  email: string;
  email_verified: boolean;
  name?: string;
  picture?: string;
  sub: string; // Google user ID
}

export async function exchangeCodeForIdToken(
  code: string,
  redirectUri: string,
): Promise<string> {
  const params = new URLSearchParams({
    code,
    client_id: googleClientId(),
    client_secret: googleClientSecret(),
    redirect_uri: redirectUri,
    grant_type: "authorization_code",
  });

  const r = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  });

  if (!r.ok) {
    const txt = await r.text();
    throw new Error(`Falha ao trocar code por token Google: ${r.status} ${txt}`);
  }
  const json = (await r.json()) as { id_token?: string };
  if (!json.id_token) throw new Error("Resposta do Google sem id_token.");
  return json.id_token;
}

export async function verifyGoogleIdToken(
  idToken: string,
): Promise<GoogleIdTokenClaims> {
  const { payload } = await jwtVerify(idToken, GOOGLE_JWKS, {
    issuer: ["https://accounts.google.com", "accounts.google.com"],
    audience: googleClientId(),
  });

  const email = String(payload.email ?? "").toLowerCase();
  if (!email) throw new Error("id_token sem email.");
  const email_verified = Boolean(payload.email_verified);
  if (!email_verified) throw new Error("Email Google não verificado.");

  return {
    email,
    email_verified,
    name: typeof payload.name === "string" ? payload.name : undefined,
    picture:
      typeof payload.picture === "string" ? payload.picture : undefined,
    sub: String(payload.sub ?? ""),
  };
}

// ---------------------------------------------------------------------------
// Whitelist — Notion (preferencial) + fallback env (NOWGO_SUPERADMIN_EMAIL)
// ---------------------------------------------------------------------------

import {
  resolveUserByEmail,
  upsertUser,
  ensureUsersDatabase,
} from "./nowgoUsersStore.js";

export async function resolveAccess(
  email: string,
  profile: { name?: string; picture?: string },
): Promise<NowGoUser | null> {
  const lower = email.trim().toLowerCase();

  // Bootstrap: superadmin sempre tem acesso, mesmo sem registro.
  const isSuper = lower === superadminEmail();

  // Tenta resolver via Notion (NowGo Users database).
  let stored: NowGoUser | null = null;
  try {
    stored = await resolveUserByEmail(lower);
  } catch (err) {
    console.warn(
      "[auth] resolveUserByEmail falhou (continuando com fallback):",
      (err as Error).message,
    );
  }

  if (!stored && !isSuper) {
    // Não está na whitelist — bloqueia.
    return null;
  }

  // Se for superadmin e não há registro, faz auto-seed (idempotente).
  if (!stored && isSuper) {
    try {
      await ensureUsersDatabase();
      stored = await upsertUser({
        email: lower,
        name: profile.name,
        picture: profile.picture,
        role: "superadmin",
        active: true,
      });
    } catch (err) {
      console.warn(
        "[auth] auto-seed do superadmin falhou (seguindo com fallback em memória):",
        (err as Error).message,
      );
      stored = {
        email: lower,
        name: profile.name,
        picture: profile.picture,
        role: "superadmin",
        active: true,
      };
    }
  }

  if (!stored) return null;
  if (!stored.active) return null;

  // Atualiza last_login_at em background (não bloqueia o login).
  void upsertUser({
    email: lower,
    name: profile.name ?? stored.name,
    picture: profile.picture ?? stored.picture,
    role: stored.role,
    active: true,
    lastLoginAt: new Date().toISOString(),
  }).catch(() => undefined);

  return stored;
}

// ---------------------------------------------------------------------------
// Middleware-like helper para handlers serverless
// ---------------------------------------------------------------------------

export async function requireAuth(req: {
  headers: Record<string, any>;
}): Promise<NowGoSessionClaims | null> {
  const cookieHeader = (req.headers["cookie"] ?? req.headers["Cookie"]) as
    | string
    | undefined;
  const token = readSessionFromCookieHeader(cookieHeader);
  if (!token) return null;
  return verifySessionJWT(token);
}

export function isSuperadmin(claims: NowGoSessionClaims | null): boolean {
  return !!claims && claims.role === "superadmin";
}
