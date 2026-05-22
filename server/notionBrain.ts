/**
 * server/notionBrain.ts
 * NowGo Brain — cliente HTTP para a API do Notion v1.
 * Camada fina, sem dependência externa do pacote @notionhq/client para reduzir bundle Vercel.
 *
 * Princípios:
 *  - Single source of truth: token só lido de NOTION_API_KEY (env do servidor).
 *  - Cache em memória (60s) para reads idempotentes — reduz custo e respeita rate-limit.
 *  - Sem operações destrutivas (DELETE) — arquivamento via update apenas.
 *  - Logs estruturados sem nunca registrar o token.
 */

const NOTION_BASE = "https://api.notion.com/v1";
const NOTION_VERSION = "2022-06-28";

const CACHE_TTL_MS = 60_000;
const cache = new Map<string, { at: number; data: unknown }>();

function token(): string {
  const t = process.env.NOTION_API_KEY;
  if (!t) {
    throw new Error("NOTION_API_KEY ausente no ambiente do servidor");
  }
  return t;
}

function authHeaders(): Record<string, string> {
  return {
    Authorization: `Bearer ${token()}`,
    "Notion-Version": NOTION_VERSION,
    "Content-Type": "application/json",
  };
}

export async function notionFetch<T = unknown>(
  path: string,
  init: RequestInit = {},
  options: { cache?: boolean } = { cache: false },
): Promise<T> {
  const url = `${NOTION_BASE}${path}`;
  const key = `${init.method ?? "GET"} ${url} ${typeof init.body === "string" ? init.body : ""}`;

  if (options.cache && (!init.method || init.method === "GET" || init.method === "POST")) {
    const hit = cache.get(key);
    if (hit && Date.now() - hit.at < CACHE_TTL_MS) {
      return hit.data as T;
    }
  }

  const res = await fetch(url, {
    ...init,
    headers: { ...authHeaders(), ...(init.headers as Record<string, string> | undefined) },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new NotionError(res.status, `${init.method ?? "GET"} ${path} → ${res.status}`, text);
  }

  const data = (await res.json()) as T;
  if (options.cache) {
    cache.set(key, { at: Date.now(), data });
  }
  return data;
}

export class NotionError extends Error {
  constructor(
    public status: number,
    message: string,
    public bodyText: string,
  ) {
    super(message);
    this.name = "NotionError";
  }
}

// ---------- Helpers de leitura ----------

export interface NotionDatabaseInfo {
  id: string;
  title: string;
  parent_id?: string;
}

/**
 * Lista bases (databases) acessíveis pela integração.
 */
export async function listDatabases(): Promise<NotionDatabaseInfo[]> {
  const r = await notionFetch<{ results: any[] }>(
    "/search",
    {
      method: "POST",
      body: JSON.stringify({
        filter: { value: "database", property: "object" },
        page_size: 100,
      }),
    },
    { cache: true },
  );
  return (r.results ?? []).map((db) => ({
    id: db.id,
    title:
      Array.isArray(db.title) && db.title[0]?.plain_text
        ? db.title[0].plain_text
        : "(sem título)",
    parent_id: db.parent?.page_id,
  }));
}

/**
 * Lista páginas acessíveis pela integração (até `pageSize`).
 */
export async function listPages(pageSize = 30): Promise<{ id: string; title: string }[]> {
  const r = await notionFetch<{ results: any[] }>(
    "/search",
    {
      method: "POST",
      body: JSON.stringify({
        filter: { value: "page", property: "object" },
        page_size: pageSize,
      }),
    },
    { cache: true },
  );
  return (r.results ?? []).map((p) => ({
    id: p.id,
    title: extractTitle(p),
  }));
}

function extractTitle(page: any): string {
  // page com properties.Name.title
  const props = page?.properties ?? {};
  for (const key of Object.keys(props)) {
    const v = props[key];
    if (v?.type === "title" && Array.isArray(v.title) && v.title[0]?.plain_text) {
      return v.title[0].plain_text;
    }
  }
  // child_page block
  if (page?.child_page?.title) return page.child_page.title;
  return "(sem título)";
}

/**
 * Consulta uma database e devolve resultados paginados.
 */
export async function queryDatabase(
  databaseId: string,
  body: Record<string, unknown> = {},
): Promise<{ results: any[]; has_more: boolean; next_cursor: string | null }> {
  const r = await notionFetch<{ results: any[]; has_more: boolean; next_cursor: string | null }>(
    `/databases/${databaseId}/query`,
    {
      method: "POST",
      body: JSON.stringify(body),
    },
    { cache: true },
  );
  return r;
}

/**
 * Obtém o schema bruto de uma database (para inspeção).
 */
export async function retrieveDatabase(databaseId: string): Promise<any> {
  return notionFetch<any>(`/databases/${databaseId}`, { method: "GET" }, { cache: true });
}

// ---------- Helpers de escrita ----------

/**
 * Cria uma nova página numa database.
 * `properties` deve seguir o schema da database de destino.
 */
export async function createPage(
  parentDatabaseId: string,
  properties: Record<string, unknown>,
  children?: unknown[],
): Promise<any> {
  return notionFetch<any>("/pages", {
    method: "POST",
    body: JSON.stringify({
      parent: { database_id: parentDatabaseId },
      properties,
      children,
    }),
  });
}

/**
 * Atualiza uma página existente (não usa para arquivamento neste protótipo).
 */
export async function updatePage(
  pageId: string,
  properties: Record<string, unknown>,
): Promise<any> {
  return notionFetch<any>(`/pages/${pageId}`, {
    method: "PATCH",
    body: JSON.stringify({ properties }),
  });
}

/**
 * Arquiva uma página (soft delete via Notion API). Não destrói o registro;
 * apenas o marca como `archived: true`, ocultando-o de queries padrão.
 * Recuperável manualmente via Notion UI.
 */
export async function archivePage(pageId: string): Promise<any> {
  return notionFetch<any>(`/pages/${pageId}`, {
    method: "PATCH",
    body: JSON.stringify({ archived: true }),
  });
}

/**
 * Limpa o cache (use em testes ou após escrita).
 */
export function clearCache(): void {
  cache.clear();
}
