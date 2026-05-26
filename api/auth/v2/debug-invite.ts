/**
 * api/auth/v2/_debug_invite.ts
 *
 * ENDPOINT DEBUG TEMPORÁRIO — F47.
 *
 * Objetivo: diagnosticar o 500 retornado por /api/auth/v2/invite/validate
 * quando o token tem 8+ chars mas não existe no banco. O handlerFactory
 * mascara erros não-tipados como `internal_error`, sem stack trace.
 *
 * Este endpoint:
 *   • Aceita um GET sem auth.
 *   • Devolve em texto claro o nome da exception, mensagem e (em dev) stack.
 *   • Vai SER REMOVIDO no próximo commit após coleta do diagnóstico.
 *
 * Acesso: GET /api/auth/v2/_debug_invite?token=xxxxxxxx
 */
import type { VercelRequest, VercelResponse } from "@vercel/node";

import { validateInvitationToken } from "../../../server/auth/invitations.js";

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
): Promise<void> {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "GET") {
    res.status(405).json({ error: "method_not_allowed" });
    return;
  }
  const token = String(req.query.token ?? "");
  if (token.length < 8) {
    res.status(400).json({ error: "token_too_short" });
    return;
  }
  try {
    const result = await validateInvitationToken(token);
    res.status(200).json({ ok: true, found: true, invitation: result.invitation });
  } catch (err) {
    const e = err as Error & { code?: string };
    res.status(200).json({
      ok: false,
      errorName: e?.name ?? typeof err,
      errorCode: e?.code ?? null,
      errorMessage: e?.message ?? String(err),
      // stack em texto plano para diagnóstico
      stack: typeof e?.stack === "string" ? e.stack.split("\n").slice(0, 12) : null,
      env: {
        hasNowgoBrainPgUrl: Boolean(process.env.NOWGO_BRAIN_PG_URL),
        nodeEnv: process.env.NODE_ENV ?? null,
        vercelEnv: process.env.VERCEL_ENV ?? null,
      },
    });
  }
}
