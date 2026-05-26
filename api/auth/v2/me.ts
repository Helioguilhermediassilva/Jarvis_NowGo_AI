/**
 * api/auth/v2/me.ts  →  GET /api/auth/v2/me
 *
 * F47 — Devolve o contexto da sessão V2 atual ao frontend (cockpit V2).
 * Usa `requireV2Auth` para validar cookie + carregar role/tenant. Em
 * sessões inválidas/expiradas/revogadas o handler factory traduz para 401.
 *
 * Saída inclui `tenantSlug` para conveniência do frontend.
 */
import { z } from "zod";
import { eq } from "drizzle-orm";

import { createApiHandler } from "../../../server/http/handlerFactory.js";
import { requireV2Auth } from "../../../server/http/authMiddlewareV2.js";
import { db } from "../../../server/db/client.js";
import { tenants } from "../../../server/db/schema.js";

const InputSchema = z.object({}).passthrough();

interface Output {
  ok: true;
  userId: string;
  email: string;
  role: "superadmin" | "owner" | "admin" | "member";
  tenantId: string;
  tenantSlug: string | null;
  mfaEnabled: boolean;
}

export default createApiHandler<unknown, Output>({
  methods: ["GET"],
  schema: InputSchema,
  tag: "auth.v2.me",
  handler: async ({ req, res }) => {
    const ctx = await requireV2Auth(req, res);

    const tRows = await db()
      .select({ slug: tenants.slug })
      .from(tenants)
      .where(eq(tenants.id, ctx.tenantId))
      .limit(1);

    return {
      ok: true,
      userId: ctx.userId,
      email: ctx.email,
      role: ctx.role,
      tenantId: ctx.tenantId,
      tenantSlug: tRows[0]?.slug ?? null,
      mfaEnabled: ctx.mfaEnabled,
    };
  },
});
