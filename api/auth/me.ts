/**
 * api/auth/me.ts
 *
 * Retorna o usuário da sessão atual ou 401.
 * Usado pelo hook `useAuth()` no frontend.
 */

import { requireAuth } from "../../server/auth.js";

export default async function handler(req: any, res: any) {
  try {
    const claims = await requireAuth(req);
    if (!claims) {
      res.setHeader("Cache-Control", "no-store");
      return res.status(401).json({ authenticated: false });
    }
    res.setHeader("Cache-Control", "no-store");
    return res.status(200).json({
      authenticated: true,
      user: {
        email: claims.sub,
        name: claims.name ?? null,
        picture: claims.picture ?? null,
        role: claims.role,
      },
    });
  } catch (err: any) {
    console.error("[/api/auth/me] erro:", err?.message);
    return res.status(500).json({ error: "Falha ao verificar sessão." });
  }
}
