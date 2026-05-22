/**
 * api/auth/google/start.ts
 *
 * Inicia o fluxo OAuth 2.0 com Google.
 * Redireciona o navegador para a tela de consentimento do Google.
 *
 * Query params suportados:
 *  - returnTo: caminho relativo para onde voltar após login (default: "/cockpit")
 *
 * O state é um JWT curto de 5 min contendo apenas o returnTo, assinado
 * com NOWGO_JWT_SECRET para evitar tampering / open redirect.
 */

import { SignJWT } from "jose";

function jwtSecretBytes(): Uint8Array {
  const raw = process.env.NOWGO_JWT_SECRET;
  if (!raw || raw.length < 32) {
    throw new Error("NOWGO_JWT_SECRET ausente ou curto demais.");
  }
  return new TextEncoder().encode(raw);
}

function origin(req: any): string {
  const proto = (req.headers["x-forwarded-proto"] as string) ?? "https";
  const host = (req.headers["x-forwarded-host"] as string) ?? req.headers["host"];
  return `${proto}://${host}`;
}

function safeReturnTo(raw: unknown): string {
  if (typeof raw !== "string") return "/cockpit";
  if (!raw.startsWith("/") || raw.startsWith("//")) return "/cockpit";
  return raw;
}

export default async function handler(req: any, res: any) {
  try {
    const clientId = process.env.NOWGO_OAUTH_CLIENT_ID;
    if (!clientId) {
      return res.status(500).json({
        error: "NOWGO_OAUTH_CLIENT_ID ausente. Login indisponível.",
      });
    }

    const returnTo = safeReturnTo(req.query?.returnTo);
    const redirectUri = `${origin(req)}/api/auth/google/callback`;

    const now = Math.floor(Date.now() / 1000);
    const state = await new SignJWT({ returnTo })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt(now)
      .setExpirationTime(now + 300) // 5 min
      .setIssuer("nowgo-jarvis-state")
      .sign(jwtSecretBytes());

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: "code",
      scope: "openid email profile",
      access_type: "online",
      include_granted_scopes: "true",
      state,
      prompt: "select_account",
    });

    const url = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
    res.statusCode = 302;
    res.setHeader("Location", url);
    res.setHeader("Cache-Control", "no-store");
    res.end();
  } catch (err: any) {
    console.error("[/api/auth/google/start] erro:", err?.message);
    res.status(500).json({ error: "Falha ao iniciar login Google." });
  }
}
