/**
 * server/postgresBrainRepository.smoke.test.ts
 *
 * Smoke test da integração com Supabase Cockpit_NowGo.
 *
 * Estratégia:
 * - Pula automaticamente se NOWGO_BRAIN_PG_URL não estiver definida
 *   (caso de CI public ou rodada local sem o secret).
 * - Usa SQL bruto via pg.Pool (sem Drizzle) para evitar dependência de
 *   transações tenant-scoped.
 * - Verifica:
 *     1. Conexão TCP/TLS está OK.
 *     2. Schema `nowgo_brain` existe e contém as 12 tabelas esperadas.
 *     3. Tenant seed `nowgo-ai` está presente com plano enterprise.
 *     4. Superadmin helio@nowgo.com.br existe e é owner do tenant.
 */
import { describe, it, expect, afterAll } from "vitest";
import { Pool } from "pg";

const url = process.env.NOWGO_BRAIN_PG_URL;
const describeIf = url ? describe : describe.skip;

let pool: Pool | null = null;

describeIf("Postgres NowGo Brain — smoke", () => {
  function getPool(): Pool {
    if (pool) return pool;
    pool = new Pool({
      connectionString: url!,
      ssl: { rejectUnauthorized: false },
    });
    return pool;
  }

  afterAll(async () => {
    if (pool) {
      await pool.end();
      pool = null;
    }
  });

  it("conecta e responde SELECT 1", async () => {
    const r = await getPool().query<{ ok: number }>("SELECT 1::int AS ok");
    expect(r.rows[0]?.ok).toBe(1);
  });

  it("contém o schema nowgo_brain com as 12 tabelas esperadas", async () => {
    const r = await getPool().query<{ table_name: string }>(
      `SELECT table_name FROM information_schema.tables
       WHERE table_schema = 'nowgo_brain'
       ORDER BY table_name`,
    );
    const tables = r.rows.map((row) => row.table_name);
    expect(tables).toEqual(
      expect.arrayContaining([
        "audit_log",
        "companies",
        "crm_assets",
        "documents",
        "financial_entries",
        "opportunities",
        "projects",
        "risks",
        "tasks",
        "tenant_members",
        "tenants",
        "users",
      ]),
    );
    expect(tables).toHaveLength(12);
  });

  it("tem o tenant seed nowgo-ai com plano enterprise", async () => {
    const r = await getPool().query<{ slug: string; plan: string; name: string }>(
      `SELECT slug, plan, name FROM nowgo_brain.tenants WHERE slug = 'nowgo-ai'`,
    );
    expect(r.rowCount).toBe(1);
    expect(r.rows[0]?.plan).toBe("enterprise");
    expect(r.rows[0]?.name).toBe("NowGo AI");
  });

  it("tem o superadmin Hélio como owner do tenant nowgo-ai", async () => {
    const r = await getPool().query<{
      email: string;
      user_role: string;
      member_role: string;
    }>(
      `SELECT u.email, u.role AS user_role, m.role AS member_role
         FROM nowgo_brain.tenants t
         JOIN nowgo_brain.tenant_members m ON m.tenant_id = t.id
         JOIN nowgo_brain.users u ON u.id = m.user_id
        WHERE t.slug = 'nowgo-ai' AND u.email = 'helio@nowgo.com.br'`,
    );
    expect(r.rowCount).toBe(1);
    expect(r.rows[0]?.user_role).toBe("superadmin");
    expect(r.rows[0]?.member_role).toBe("owner");
  });

  it("RLS está ativo nas 9 tabelas esperadas", async () => {
    const r = await getPool().query<{ tablename: string; rowsecurity: boolean }>(
      `SELECT tablename, rowsecurity
         FROM pg_tables
        WHERE schemaname = 'nowgo_brain'
        ORDER BY tablename`,
    );
    const rlsOn = r.rows.filter((row) => row.rowsecurity).map((row) => row.tablename);
    // 8 de domínio + audit_log + 3 administrativas (todas com RLS após mig 3) = 12
    expect(rlsOn).toEqual(
      expect.arrayContaining([
        "audit_log",
        "companies",
        "crm_assets",
        "documents",
        "financial_entries",
        "opportunities",
        "projects",
        "risks",
        "tasks",
        "tenants",
        "users",
        "tenant_members",
      ]),
    );
  });
});
