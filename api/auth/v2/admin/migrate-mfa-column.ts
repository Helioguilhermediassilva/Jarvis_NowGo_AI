/**
 * api/auth/v2/admin/migrate-mfa-column.ts → POST
 *
 * ⚠️ ONE-SHOT — corrige drift entre migration 0005 (text[]) e schema Drizzle (jsonb).
 * Converte mfa_credentials.backup_codes_hashed para JSONB.
 * Remover após uso.
 */
import { z } from "zod";
import { createHmac, timingSafeEqual } from "node:crypto";
import { sql } from "drizzle-orm";

import { createApiHandler } from "../../../../server/http/handlerFactory.js";
import { db } from "../../../../server/db/client.js";

const InputSchema = z.object({
  adminToken: z.string().min(16).max(2048),
});
type Input = z.infer<typeof InputSchema>;

interface Output {
  ok: true;
  before: unknown;
  after: unknown;
}

function timingEqual(a: string, b: string): boolean {
  const ah = createHmac("sha256", "salt-cmp").update(a).digest();
  const bh = createHmac("sha256", "salt-cmp").update(b).digest();
  return ah.length === bh.length && timingSafeEqual(ah, bh);
}

export default createApiHandler<Input, Output>({
  methods: ["POST"],
  schema: InputSchema,
  tag: "auth.v2.admin.migrate_mfa_column",
  handler: async ({ res, input }) => {
    try {
      const expected = process.env.JWT_SECRET;
      if (!expected || !timingEqual(input.adminToken, expected)) {
        res.status(401).json({ error: "forbidden" });
        return undefined as unknown as Output;
      }

      const before = await db().execute(
        sql`SELECT data_type, udt_name FROM information_schema.columns WHERE table_schema='nowgo_brain' AND table_name='mfa_credentials' AND column_name='backup_codes_hashed'`,
      );

      // Limpar registros (não há nada útil; setup-helio-mfa apaga antes de inserir)
      await db().execute(sql`DELETE FROM nowgo_brain.mfa_credentials`);

      // ALTER COLUMN para JSONB; recria do zero pois não há dados úteis
      await db().execute(
        sql`ALTER TABLE nowgo_brain.mfa_credentials ALTER COLUMN backup_codes_hashed TYPE jsonb USING to_jsonb(backup_codes_hashed)`,
      );

      const after = await db().execute(
        sql`SELECT data_type, udt_name FROM information_schema.columns WHERE table_schema='nowgo_brain' AND table_name='mfa_credentials' AND column_name='backup_codes_hashed'`,
      );

      return { ok: true, before, after };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      const cause = (err as { cause?: unknown })?.cause;
      const causeMsg =
        cause instanceof Error
          ? `${cause.name}: ${cause.message}`
          : cause
            ? String(cause)
            : null;
      res.status(500).json({
        error: "internal_error",
        detail: msg.slice(0, 500),
        cause: causeMsg,
      });
      return undefined as unknown as Output;
    }
  },
});
