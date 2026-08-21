import { SignJWT, jwtVerify } from "jose";
import { createSession, serializeCookie } from "../../../../server/auth/sessions.js";
import { hasMfa } from "../../../../server/auth/mfaTotp.js";
import { signMfaTicket } from "../login/index.js";
import type { SocialProvider } from "../../../../server/auth/socialAuth.js";

export interface ApiRequest {
  method?: string;
  query?: Record<string, string | string[] | undefined>;
  headers: Record<string, string | string[] | undefined>;
}

export interface ApiResponse {
  statusCode?: number;
  setHeader(name: string, value: string): void;
  end(body?: string): void;
  json(body: unknown): void;
  status(code: number): ApiResponse;
}

export interface SocialState {
  provider: SocialProvider;
  returnTo: string;
  billingOffer?: string;
  nonce: string;
  iat: number;
  exp: number;
}

export interface SocialProviderConfig {
  clientId: string;
  clientSecret: string;
  authorizationEndpoint: string;
  tokenEndpoint: string;
}

const SOCIAL_PROVIDERS: readonly SocialProvider[] = ["google", "github", "linkedin"];

function jwtSecretBytes(): Uint8Array {
  const raw = process.env.NOWGO_JWT_SECRET ?? process.env.JWT_SECRET;
  if (!raw || raw.length < 32) {
    throw new Error("Segredo de state OAuth ausente ou curto demais.");
  }
  return new TextEncoder().encode(raw);
}

export function firstQuery(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export function isSocialProvider(value: unknown): value is SocialProvider {
  return typeof value === "string" && SOCIAL_PROVIDERS.includes(value as SocialProvider);
}

export function socialProviders(): SocialProvider[] {
  return SOCIAL_PROVIDERS.filter((provider) => {
    try {
      getSocialProviderConfig(provider);
      return true;
    } catch {
      return false;
    }
  });
}

export function safeReturnTo(raw: unknown, fallback = "/"): string {
  if (typeof raw !== "string") return fallback;
  if (!raw.startsWith("/") || raw.startsWith("//")) return fallback;
  return raw;
}

export function requestOrigin(req: ApiRequest): string {
  const configured = process.env.NOWGO_PUBLIC_ORIGIN?.trim().replace(/\/$/, "");
  if (configured) return configured;
  const forwardedProto = firstQuery(req.headers["x-forwarded-proto"]) ?? "https";
  const forwardedHost = firstQuery(req.headers["x-forwarded-host"]);
  const host = forwardedHost ?? firstQuery(req.headers.host);
  if (!host) throw new Error("Host ausente para montar o redirect OAuth.");
  return `${forwardedProto.split(",")[0].trim()}://${host}`;
}

export function callbackUri(req: ApiRequest): string {
  const provider = firstQuery(req.query?.provider);
  if (!isSocialProvider(provider)) throw new Error("Provedor social inválido.");
  return `${requestOrigin(req)}/api/auth/v2/social/${provider}/callback`;
}

export function getSocialProviderConfig(provider: SocialProvider): SocialProviderConfig {
  const values = provider === "google"
    ? {
        clientId: process.env.NOWGO_OAUTH_CLIENT_ID,
        clientSecret: process.env.NOWGO_OAUTH_CLIENT_SECRET,
        authorizationEndpoint: "https://accounts.google.com/o/oauth2/v2/auth",
        tokenEndpoint: "https://oauth2.googleapis.com/token",
      }
    : provider === "github"
      ? {
          clientId: process.env.NOWGO_GITHUB_CLIENT_ID,
          clientSecret: process.env.NOWGO_GITHUB_CLIENT_SECRET,
          authorizationEndpoint: "https://github.com/login/oauth/authorize",
          tokenEndpoint: "https://github.com/login/oauth/access_token",
        }
      : {
          clientId: process.env.NOWGO_LINKEDIN_CLIENT_ID,
          clientSecret: process.env.NOWGO_LINKEDIN_CLIENT_SECRET,
          authorizationEndpoint: "https://www.linkedin.com/oauth/v2/authorization",
          tokenEndpoint: "https://www.linkedin.com/oauth/v2/accessToken",
        };

  if (!values.clientId || !values.clientSecret) {
    throw new Error(`Credenciais OAuth ausentes para ${provider}.`);
  }
  return values as SocialProviderConfig;
}

export async function signSocialState(
  provider: SocialProvider,
  returnTo: string,
  nonce: string,
  billingOffer?: string,
): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  return new SignJWT({ provider, returnTo, billingOffer, nonce })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt(now)
    .setExpirationTime(now + 300)
    .setIssuer("nowgo-v2-social-state")
    .sign(jwtSecretBytes());
}

export async function verifySocialState(
  rawState: string,
  provider: SocialProvider,
): Promise<SocialState> {
  const { payload } = await jwtVerify(rawState, jwtSecretBytes(), {
    issuer: "nowgo-v2-social-state",
  });
  if (payload.provider !== provider || typeof payload.returnTo !== "string" || typeof payload.nonce !== "string") {
    throw new Error("State OAuth inválido para o provedor informado.");
  }
  return {
    provider,
    returnTo: safeReturnTo(payload.returnTo),
    billingOffer: typeof payload.billingOffer === "string" && /^[a-z0-9_]{1,80}$/.test(payload.billingOffer)
      ? payload.billingOffer
      : undefined,
    nonce: payload.nonce,
    iat: Number(payload.iat ?? 0),
    exp: Number(payload.exp ?? 0),
  };
}

export function redirect(res: ApiResponse, target: string): void {
  res.statusCode = 302;
  res.setHeader("Location", target);
  res.setHeader("Cache-Control", "no-store");
  res.end();
}

export function redirectToPath(req: ApiRequest, res: ApiResponse, path: string): void {
  redirect(res, new URL(path, requestOrigin(req)).toString());
}

export function redirectWithError(
  req: ApiRequest,
  res: ApiResponse,
  returnTo: string,
  code: string,
  billingOffer?: string,
): void {
  const target = new URL("/login", requestOrigin(req));
  target.searchParams.set("socialError", code);
  target.searchParams.set("returnTo", safeReturnTo(returnTo));
  if (billingOffer && /^[a-z0-9_]{1,80}$/.test(billingOffer)) {
    target.searchParams.set("billingOffer", billingOffer);
  }
  redirect(res, target.toString());
}

export async function postForm<T>(url: string, values: Record<string, string>): Promise<T> {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body: new URLSearchParams(values).toString(),
  });
  const text = await response.text();
  let body: unknown = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = { raw: text };
  }
  if (!response.ok) {
    throw new Error(`OAuth token endpoint respondeu ${response.status}.`);
  }
  return body as T;
}

export async function getJson<T>(url: string, accessToken: string, headers: Record<string, string> = {}): Promise<T> {
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
      ...headers,
    },
  });
  if (!response.ok) throw new Error(`OAuth profile endpoint respondeu ${response.status}.`);
  return (await response.json()) as T;
}

function withBillingOffer(origin: string, returnTo: string, billingOffer?: string): string {
  const target = new URL(safeReturnTo(returnTo), origin);
  if (billingOffer && /^[a-z0-9_]{1,80}$/.test(billingOffer)) {
    target.searchParams.set("billingOffer", billingOffer);
  }
  return target.toString();
}

export async function completeSocialSession(
  req: ApiRequest,
  res: ApiResponse,
  userId: string,
  tenantId: string,
  returnTo: string,
  billingOffer?: string,
): Promise<void> {
  if (await hasMfa(userId)) {
    const ticket = signMfaTicket({ userId, tenantId, intent: "challenge" });
    const origin = requestOrigin(req);
    const target = new URL("/mfa/desafio", origin);
    const safeReturn = new URL(withBillingOffer(origin, returnTo, billingOffer));
    const relativeReturn = `${safeReturn.pathname}${safeReturn.search}${safeReturn.hash}`;
    target.searchParams.set("ticket", ticket);
    target.searchParams.set("returnTo", relativeReturn || "/");
    redirect(res, target.toString());
    return;
  }

  const session = await createSession({
    userId,
    tenantId,
    ip: firstQuery(req.headers["x-forwarded-for"]) ?? null,
    userAgent: firstQuery(req.headers["user-agent"]) ?? null,
  });
  res.setHeader(
    "Set-Cookie",
    serializeCookie({
      rawToken: session.rawToken,
      expiresAt: session.expiresAt,
      domain: process.env.NOWGO_COOKIE_DOMAIN || undefined,
      secure: process.env.NODE_ENV !== "test",
    }),
  );
  redirect(res, withBillingOffer(requestOrigin(req), returnTo, billingOffer));
}
