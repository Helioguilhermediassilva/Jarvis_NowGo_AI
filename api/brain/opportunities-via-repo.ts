/**
 * api/brain/opportunities-via-repo.ts
 *
 * Proof-of-concept de leitura de oportunidades passando pela interface
 * NowGoBrainRepository (e não chamando brainQueries.ts diretamente).
 *
 * Coexiste com /api/brain/opportunities (legado) — o endpoint legado
 * permanece intocado e continua sendo a fonte oficial dos dashboards
 * enquanto a interface não cobre 100% dos casos de uso.
 *
 * Quando a Fase 1.2 entregar paridade total, os dashboards migram para
 * este endpoint e o legado vai sendo aposentado.
 *
 * Query params:
 *   ?limit=number        (default 10, máximo 50)
 *   ?ordering=string     (score_desc | next_followup_asc | valor_desc)
 *   ?scoreMin=number
 *
 * Acesso: somente GET. Em produção exige x-jarvis-cockpit.
 */
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getBrainRepository } from "../../server/brainRepositoryFactory.js";

function authorize(req: VercelRequest): boolean {
  const expected = process.env.JARVIS_COCKPIT_SECRET;
  if (!expected) return true;
  const got =
    req.headers["x-jarvis-cockpit"] ||
    (req.headers.authorization ?? "").replace(/^Bearer\s+/i, "");
  return got === expected;
}

const NOWGO_INTERNAL_TENANT_SLUG = "nowgo-ai";

async function resolveInternalTenantId(): Promise<string> {
  const pgUrl = process.env.NOWGO_BRAIN_PG_URL;
  if (!pgUrl) return NOWGO_INTERNAL_TENANT_SLUG;
  try {
    const { Pool } = await import("pg");
    const pool = new Pool({
      connectionString: pgUrl,
      ssl: { rejectUnauthorized: false },
      max: 1,
    });
    try {
      const r = await pool.query<{ id: string }>(
        "SELECT id FROM nowgo_brain.tenants WHERE slug = $1 LIMIT 1",
        [NOWGO_INTERNAL_TENANT_SLUG],
      );
      return r.rows[0]?.id ?? NOWGO_INTERNAL_TENANT_SLUG;
    } finally {
      await pool.end();
    }
  } catch {
    return NOWGO_INTERNAL_TENANT_SLUG;
  }
}

function clampInt(value: unknown, fallback: number, max: number): number {
  const n = typeof value === "string" ? Number(value) : Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(1, Math.min(max, Math.floor(n)));
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "method_not_allowed" });
  }
  if (!authorize(req)) {
    return res.status(401).json({ error: "unauthorized" });
  }

  const repo = getBrainRepository();
  const tenantId = await resolveInternalTenantId();

  const limit = clampInt(req.query.limit, 10, 50);
  const ordering = (req.query.ordering as string | undefined) ?? "score_desc";
  const scoreMinRaw = req.query.scoreMin as string | undefined;
  const scoreMin = scoreMinRaw && Number.isFinite(Number(scoreMinRaw))
    ? Number(scoreMinRaw)
    : undefined;

  const startedAt = Date.now();
  try {
    const opportunities = await repo.listOpportunities(tenantId, {
      limit,
      ordering: ordering as any,
      scoreMin,
    });
    return res.status(200).json({
      via: repo.name,
      tenantId,
      limit,
      ordering,
      scoreMin: scoreMin ?? null,
      count: opportunities.length,
      durationMs: Date.now() - startedAt,
      opportunities,
    });
  } catch (err) {
    return res.status(500).json({
      via: repo.name,
      tenantId,
      error: err instanceof Error ? err.message : String(err),
      durationMs: Date.now() - startedAt,
    });
  }
}
