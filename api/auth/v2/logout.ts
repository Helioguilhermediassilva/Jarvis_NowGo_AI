/**
 * api/auth/v2/logout.ts  →  POST /api/auth/v2/logout
 *
 * F47 — Encerra a sessão V2 atual:
 *   1. Lê cookie `nowgo_session_v2`.
 *   2. Revoga a linha em `sessions` (best-effort — se o cookie já estava
 *      inválido, segue o fluxo).
 *   3. Reemite `Set-Cookie` com Max-Age=0 para apagar do browser.
 *
 * Retorna sempre 200 `{ ok: true }` mesmo sem cookie — idempotente.
 */
import { z } from "zod";

import { createApiHandler } from "../../../server/http/handlerFactory.js";
import {
  parseSessionCookie,
  revokeSession,
  serializeClearCookie,
} from "../../../server/auth/sessions.js";

const InputSchema = z.object({}).passthrough();

type Input = z.infer<typeof InputSchema>;

export default createApiHandler<Input, { ok: true }>({
  methods: ["POST"],
  schema: InputSchema,
  tag: "auth.v2.logout",
  handler: async ({ req, res }) => {
    const cookieHeader = (req.headers["cookie"] ?? req.headers["Cookie"]) as
      | string
      | undefined
      | null;
    const rawToken = parseSessionCookie(cookieHeader ?? null);
    if (rawToken) {
      await revokeSession(rawToken).catch(() => undefined);
    }
    res.setHeader(
      "Set-Cookie",
      serializeClearCookie(process.env.NOWGO_COOKIE_DOMAIN || undefined),
    );
    return { ok: true };
  },
});
