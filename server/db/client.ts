/**
 * server/db/client.ts
 *
 * Cliente PostgreSQL para o NowGo Brain (Cockpit_NowGo no Supabase).
 *
 * - Singleton de Pool reutilizado entre requests.
 * - Função `withTenant(tenantId, fn)` abre uma transação, faz
 *   `SET LOCAL app.current_tenant_id = ...` e executa a função; o RLS
 *   das 8 tabelas de domínio + audit_log usa esse setting para isolar leituras.
 * - O backend SEMPRE usa a service role (NOWGO_BRAIN_PG_URL) — RLS deny-all
 *   protege as 3 tabelas administrativas se a anon key vazar.
 */
import { Pool, type PoolClient } from "pg";
import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import * as schema from "./schema.js";

type BrainDb = NodePgDatabase<typeof schema>;

let _pool: Pool | null = null;

function pool(): Pool {
  if (_pool) return _pool;
  const url = process.env.NOWGO_BRAIN_PG_URL;
  if (!url) {
    throw new Error(
      "NOWGO_BRAIN_PG_URL não configurada. Defina-a com a connection string PostgreSQL do Cockpit_NowGo (use o Transaction Pooler, porta 6543).",
    );
  }
  _pool = new Pool({
    connectionString: url,
    // Supabase exige SSL em todos os ambientes
    ssl: { rejectUnauthorized: false },
    max: 10,
    idleTimeoutMillis: 30_000,
  });
  return _pool;
}

/** Drizzle instance reutilizável fora de transações tenant-scoped. */
export function db() {
  return drizzle(pool(), { schema });
}

/**
 * Abre uma transação isolada por tenant. Define
 * `SET LOCAL app.current_tenant_id` para que as policies de RLS atuem.
 *
 * Use em todos os caminhos que tocam dados operacionais de um tenant
 * (opportunities, crm_assets, etc.). Para operações administrativas em
 * `tenants`/`users`/`tenant_members` use `db()` diretamente.
 */
export async function withTenant<T>(
  tenantId: string,
  fn: (tx: BrainDb, raw: PoolClient) => Promise<T>,
): Promise<T> {
  const client = await pool().connect();
  try {
    await client.query("BEGIN");
    // Validamos o formato uuid via parametrização para evitar SQL injection.
    await client.query("SELECT set_config($1, $2, true)", [
      "app.current_tenant_id",
      tenantId,
    ]);
    // Drizzle aceita Pool ou PoolClient; cast intencional para o tipo
    // genérico do schema, já que estamos dentro de uma transação.
    const tx = drizzle(client as unknown as Pool, { schema }) as BrainDb;
    const result = await fn(tx, client);
    await client.query("COMMIT");
    return result;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

/** Fecha o pool (útil em testes ou shutdown gracioso). */
export async function closePool(): Promise<void> {
  if (_pool) {
    await _pool.end();
    _pool = null;
  }
}

export { schema };
