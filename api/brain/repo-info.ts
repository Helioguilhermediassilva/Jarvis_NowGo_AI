/**
 * api/brain/repo-info.ts
 *
 * Diagnóstico da camada NowGoBrainRepository.
 *
 * Retorna a implementação ativa (controlada por env NOWGO_BRAIN_REPO),
 * o resultado do health check e, opcionalmente, a contagem de oportunidades
 * lidas do tenant interno `nowgo-ai` para validar a interface end-to-end.
 *
 * Útil para:
 *  - Confirmar em produção que a fábrica está retornando a implementação
 *    correta (notion / postgres / shadow).
 *  - Detectar precocemente quebras na conexão Postgres ou Notion.
 *  - Decidir, num futuro toggle, se o cockpit pode migrar do Notion para
 *    o Postgres com segurança.
 *
 * Acesso: somente GET. Em produção, exige cabeçalho `x-jarvis-cockpit`
 * igual a JARVIS_COCKPIT_SECRET, mesmo padrão de /api/brain/status.
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

/** Resolve o id do tenant interno a partir do slug, sem depender do Drizzle.
 *  Para a fase 1, o NotionBrainRepository ignora o tenant_id, então em produção
 *  default isto pode retornar uma string fixa. Quando rodando via Postgres,
 *  consulta o banco. */
async function resolveInternalTenantId(): Promise<string | null> {
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
      return r.rows[0]?.id ?? null;
    } finally {
      await pool.end();
    }
  } catch {
    return null;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "method_not_allowed" });
  }
  if (!authorize(req)) {
    return res.status(401).json({ error: "unauthorized" });
  }

  const repo = getBrainRepository();
  const startedAt = Date.now();
  let healthy = false;
  let healthError: string | null = null;
  try {
    healthy = await repo.healthCheck();
  } catch (err) {
    healthError = err instanceof Error ? err.message : String(err);
  }
  const healthMs = Date.now() - startedAt;

  let internalTenantId: string | null = null;
  let smokeOpportunitiesCount: number | null = null;
  let smokeError: string | null = null;
  try {
    internalTenantId = await resolveInternalTenantId();
    if (internalTenantId && healthy) {
      const opps = await repo.listOpportunities(internalTenantId, { limit: 5 });
      smokeOpportunitiesCount = opps.length;
    }
  } catch (err) {
    smokeError = err instanceof Error ? err.message : String(err);
  }

  return res.status(200).json({
    activeImplementation: repo.name,
    activeMode: process.env.NOWGO_BRAIN_REPO || "notion",
    healthy,
    healthMs,
    healthError,
    internalTenant: {
      slug: NOWGO_INTERNAL_TENANT_SLUG,
      id: internalTenantId,
    },
    smokeOpportunitiesCount,
    smokeError,
    pgUrlConfigured: Boolean(process.env.NOWGO_BRAIN_PG_URL),
    serverTime: new Date().toISOString(),
  });
}
