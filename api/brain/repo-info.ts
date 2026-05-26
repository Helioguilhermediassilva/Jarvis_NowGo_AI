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
 * Estados possíveis do bloco `internalTenant`:
 *  - { source: "notion-fallback", id: "nowgo-ai" }: modo notion, não consulta
 *    Postgres porque o NotionBrainRepository ignora tenant_id.
 *  - { source: "postgres", id: "<uuid>" }: modo postgres/shadow, id real
 *    lido da tabela nowgo_brain.tenants.
 *  - { source: "postgres", id: null, error: "..." }: tentou consultar e
 *    falhou. Útil para diagnóstico.
 *  - { source: "skipped", id: null }: NOWGO_BRAIN_PG_URL ausente, modo
 *    notion silencioso.
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

type InternalTenantSource = "notion-fallback" | "postgres" | "skipped";

interface InternalTenantResult {
  source: InternalTenantSource;
  slug: string;
  id: string | null;
  error: string | null;
  durationMs: number;
}

/**
 * Resolve a identidade do tenant interno conforme o modo ativo.
 *
 * - Modo `notion` (default): retorna direto o slug `nowgo-ai` como id, sem
 *   abrir conexão Postgres. O NotionBrainRepository não usa esse valor.
 * - Modo `postgres` / `shadow`: consulta `nowgo_brain.tenants` e retorna o
 *   UUID real. Captura e expõe erros em vez de engolir silenciosamente.
 */
async function resolveInternalTenant(activeMode: string): Promise<InternalTenantResult> {
  const startedAt = Date.now();

  if (activeMode === "notion") {
    return {
      source: "notion-fallback",
      slug: NOWGO_INTERNAL_TENANT_SLUG,
      id: NOWGO_INTERNAL_TENANT_SLUG,
      error: null,
      durationMs: Date.now() - startedAt,
    };
  }

  const pgUrl = process.env.NOWGO_BRAIN_PG_URL;
  if (!pgUrl) {
    return {
      source: "skipped",
      slug: NOWGO_INTERNAL_TENANT_SLUG,
      id: null,
      error: "NOWGO_BRAIN_PG_URL not configured",
      durationMs: Date.now() - startedAt,
    };
  }

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
      return {
        source: "postgres",
        slug: NOWGO_INTERNAL_TENANT_SLUG,
        id: r.rows[0]?.id ?? null,
        error: r.rows[0]?.id ? null : "tenant nowgo-ai not found in nowgo_brain.tenants",
        durationMs: Date.now() - startedAt,
      };
    } finally {
      await pool.end();
    }
  } catch (err) {
    return {
      source: "postgres",
      slug: NOWGO_INTERNAL_TENANT_SLUG,
      id: null,
      error: err instanceof Error ? err.message : String(err),
      durationMs: Date.now() - startedAt,
    };
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "method_not_allowed" });
  }
  if (!authorize(req)) {
    return res.status(401).json({ error: "unauthorized" });
  }

  const activeMode = process.env.NOWGO_BRAIN_REPO || "notion";
  const repo = getBrainRepository();

  const healthStartedAt = Date.now();
  let healthy = false;
  let healthError: string | null = null;
  try {
    healthy = await repo.healthCheck();
  } catch (err) {
    healthError = err instanceof Error ? err.message : String(err);
  }
  const healthMs = Date.now() - healthStartedAt;

  const internalTenant = await resolveInternalTenant(activeMode);

  let smokeOpportunitiesCount: number | null = null;
  let smokeError: string | null = null;
  let smokeMs: number | null = null;
  if (internalTenant.id && healthy) {
    const t0 = Date.now();
    try {
      const opps = await repo.listOpportunities(internalTenant.id, { limit: 5 });
      smokeOpportunitiesCount = opps.length;
    } catch (err) {
      smokeError = err instanceof Error ? err.message : String(err);
    }
    smokeMs = Date.now() - t0;
  }

  return res.status(200).json({
    activeImplementation: repo.name,
    activeMode,
    healthy,
    healthMs,
    healthError,
    internalTenant,
    smokeOpportunitiesCount,
    smokeError,
    smokeMs,
    pgUrlConfigured: Boolean(process.env.NOWGO_BRAIN_PG_URL),
    serverTime: new Date().toISOString(),
  });
}
