/**
 * server/auth/tenants.ts
 *
 * Helpers compactos para resolver tenants pelo ID ou slug. Usados pelos
 * endpoints F47 (criar convite, gerar link, mostrar nome do tenant na UI).
 */
import { eq } from "drizzle-orm";

import { db } from "../db/client.js";
import { tenants, type TenantRow } from "../db/schema.js";

export async function getTenantById(id: string): Promise<TenantRow | null> {
  if (!id) return null;
  const rows = await db()
    .select()
    .from(tenants)
    .where(eq(tenants.id, id))
    .limit(1);
  return rows[0] ?? null;
}

export async function getTenantBySlug(slug: string): Promise<TenantRow | null> {
  if (!slug) return null;
  const rows = await db()
    .select()
    .from(tenants)
    .where(eq(tenants.slug, slug))
    .limit(1);
  return rows[0] ?? null;
}
