/**
 * api/auth/logout.ts
 *
 * Encerra a sessão do usuário limpando o cookie nowgo_session.
 * Aceita GET (para link direto) e POST (para fetch).
 */

import { buildLogoutCookie } from "../../server/auth.js";

export default async function handler(req: any, res: any) {
  res.setHeader("Set-Cookie", buildLogoutCookie());
  res.setHeader("Cache-Control", "no-store");

  if (req.method === "GET") {
    const proto = (req.headers["x-forwarded-proto"] as string) ?? "https";
    const host =
      (req.headers["x-forwarded-host"] as string) ?? req.headers["host"];
    res.statusCode = 302;
    res.setHeader("Location", `${proto}://${host}/`);
    return res.end();
  }

  return res.status(200).json({ ok: true });
}
