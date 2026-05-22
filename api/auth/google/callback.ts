/**
 * api/auth/google/callback.ts
 *
 * Conclui o fluxo OAuth 2.0 com Google.
 *
 * Fluxo:
 *  1. Recebe `code` e `state` do redirecionamento Google.
 *  2. Valida `state` (JWT curto assinado).
 *  3. Troca `code` por `id_token` via Google Token endpoint.
 *  4. Verifica `id_token` contra JWKS oficial do Google.
 *  5. Resolve acesso via whitelist (Notion + fallback superadmin).
 *  6. Emite cookie de sessão `nowgo_session` (JWT HS256, 7 dias).
 *  7. Redireciona para `returnTo` (default: /cockpit).
 *
 * Em caso de bloqueio por whitelist, redireciona para `/?denied=1`
 * com uma mensagem amigável na landing.
 */

import { jwtVerify } from "jose";
import {
  exchangeCodeForIdToken,
  verifyGoogleIdToken,
  resolveAccess,
  issueSessionJWT,
  buildSessionCookie,
} from "../../../server/auth.js";

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

async function readState(state: string): Promise<{ returnTo: string }> {
  const { payload } = await jwtVerify(state, jwtSecretBytes(), {
    issuer: "nowgo-jarvis-state",
  });
  const returnTo =
    typeof payload.returnTo === "string" && payload.returnTo.startsWith("/")
      ? payload.returnTo
      : "/cockpit";
  return { returnTo };
}

export default async function handler(req: any, res: any) {
  const base = origin(req);

  try {
    const { code, state, error } = req.query ?? {};
    if (error) {
      console.warn("[/api/auth/google/callback] Google retornou erro:", error);
      res.statusCode = 302;
      res.setHeader("Location", `${base}/?denied=1&reason=oauth_error`);
      return res.end();
    }
    if (typeof code !== "string" || typeof state !== "string") {
      res.statusCode = 302;
      res.setHeader("Location", `${base}/?denied=1&reason=missing_params`);
      return res.end();
    }

    let returnTo = "/cockpit";
    try {
      ({ returnTo } = await readState(state));
    } catch (e) {
      console.warn("[callback] state inválido:", (e as Error).message);
      res.statusCode = 302;
      res.setHeader("Location", `${base}/?denied=1&reason=bad_state`);
      return res.end();
    }

    const redirectUri = `${base}/api/auth/google/callback`;
    const idToken = await exchangeCodeForIdToken(code, redirectUri);
    const profile = await verifyGoogleIdToken(idToken);

    const user = await resolveAccess(profile.email, {
      name: profile.name,
      picture: profile.picture,
    });

    if (!user) {
      console.warn(
        `[callback] Acesso negado para ${profile.email} (não está na whitelist)`,
      );
      res.statusCode = 302;
      res.setHeader(
        "Location",
        `${base}/?denied=1&reason=not_whitelisted&email=${encodeURIComponent(
          profile.email,
        )}`,
      );
      return res.end();
    }

    const session = await issueSessionJWT({
      sub: user.email,
      name: user.name,
      picture: user.picture,
      role: user.role,
    });

    res.setHeader("Set-Cookie", buildSessionCookie(session));
    res.setHeader("Cache-Control", "no-store");
    res.statusCode = 302;
    res.setHeader("Location", `${base}${returnTo}`);
    return res.end();
  } catch (err: any) {
    console.error("[/api/auth/google/callback] erro:", err?.message);
    res.statusCode = 302;
    res.setHeader("Location", `${base}/?denied=1&reason=server_error`);
    return res.end();
  }
}
