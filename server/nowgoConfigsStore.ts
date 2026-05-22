/**
 * server/nowgoConfigsStore.ts
 *
 * NowGo Configs — store soberano de overrides de configuração persistentes.
 *
 * Modelo (database Notion "NowGo Configs"):
 *  - Key (title)         : chave única (ex.: "META_2026_BRL", "TICKET_MEDIO_BRL")
 *  - Value (rich_text)   : valor serializado (string; números convertidos no get)
 *  - Tipo (select)       : "number" | "string" | "boolean" | "json"
 *  - Atualizado em (date): timestamp ISO da última atualização
 *  - Atualizado por (rich_text): email de quem editou
 *  - Notas (rich_text)   : texto livre opcional
 *
 * Auto-criação: igual ao NowGo Users — cria a database na primeira página
 * disponível para a integração se não existir.
 *
 * Uso típico no Revenue Cockpit:
 *  - getConfigNumber("META_2026_BRL") com fallback para constante hardcoded
 *  - setConfigNumber("META_2026_BRL", 25_000_000, "helio@nowgo.com.br", "...")
 */

import {
  queryDatabase,
  createPage,
  updatePage,
  listDatabases,
  listPages,
  notionFetch,
} from "./notionBrain.js";

const DB_TITLE = "NowGo Configs";

let cachedDatabaseId: string | null = null;

// ---------------------------------------------------------------------------
// Resolução do databaseId
// ---------------------------------------------------------------------------

export async function resolveConfigsDatabaseId(): Promise<string> {
  if (cachedDatabaseId) return cachedDatabaseId;

  const fromEnv = process.env.NOWGO_CONFIGS_DATABASE_ID?.trim();
  if (fromEnv) {
    cachedDatabaseId = fromEnv;
    return fromEnv;
  }

  const dbs = await listDatabases();
  const found = dbs.find(
    (d) => d.title.toLowerCase() === DB_TITLE.toLowerCase(),
  );
  if (found) {
    cachedDatabaseId = found.id;
    return found.id;
  }

  throw new Error(
    "NowGo Configs database não encontrada. Defina NOWGO_CONFIGS_DATABASE_ID ou compartilhe uma página com a integração para auto-criação.",
  );
}

export async function ensureConfigsDatabase(): Promise<string> {
  try {
    return await resolveConfigsDatabaseId();
  } catch {
    // criar
  }

  const pages = await listPages(50);
  if (!pages.length) {
    throw new Error(
      "Nenhuma página acessível pela integração Notion para criar a database 'NowGo Configs'.",
    );
  }
  const parentPageId = pages[0].id;

  const created = await notionFetch<{ id: string }>("/databases", {
    method: "POST",
    body: JSON.stringify({
      parent: { type: "page_id", page_id: parentPageId },
      title: [{ type: "text", text: { content: DB_TITLE } }],
      properties: {
        Key: { title: {} },
        Value: { rich_text: {} },
        Tipo: {
          select: {
            options: [
              { name: "number", color: "blue" },
              { name: "string", color: "default" },
              { name: "boolean", color: "purple" },
              { name: "json", color: "orange" },
            ],
          },
        },
        "Atualizado em": { date: {} },
        "Atualizado por": { rich_text: {} },
        Notas: { rich_text: {} },
      },
    }),
  });
  cachedDatabaseId = created.id;
  return created.id;
}

// ---------------------------------------------------------------------------
// Helpers de leitura de propriedades (defensivos)
// ---------------------------------------------------------------------------

function readTitle(prop: any): string {
  return (prop?.title ?? []).map((t: any) => t.plain_text ?? "").join("").trim();
}
function readRichText(prop: any): string {
  return (prop?.rich_text ?? [])
    .map((t: any) => t.plain_text ?? "")
    .join("")
    .trim();
}
function readSelect(prop: any): string {
  return prop?.select?.name ?? "";
}

// ---------------------------------------------------------------------------
// API pública
// ---------------------------------------------------------------------------

export interface ConfigEntry {
  pageId: string;
  key: string;
  valueRaw: string;
  tipo: "number" | "string" | "boolean" | "json";
  atualizadoEm: string | null;
  atualizadoPor: string | null;
}

export async function getConfig(key: string): Promise<ConfigEntry | null> {
  const dbId = await ensureConfigsDatabase();
  const r = await queryDatabase(dbId, {
    filter: { property: "Key", title: { equals: key } },
    page_size: 1,
  });
  const page = r.results[0];
  if (!page) return null;
  const p = page.properties ?? {};
  return {
    pageId: page.id,
    key: readTitle(p.Key),
    valueRaw: readRichText(p.Value),
    tipo: (readSelect(p.Tipo) as ConfigEntry["tipo"]) || "string",
    atualizadoEm: p["Atualizado em"]?.date?.start ?? null,
    atualizadoPor: readRichText(p["Atualizado por"]) || null,
  };
}

export async function getConfigNumber(
  key: string,
  fallback: number,
): Promise<number> {
  try {
    const e = await getConfig(key);
    if (!e) return fallback;
    const n = parseFloat(e.valueRaw);
    return Number.isFinite(n) ? n : fallback;
  } catch (err) {
    console.warn(`[configs] getConfigNumber(${key}) falhou:`, (err as Error).message);
    return fallback;
  }
}

export async function setConfig(
  key: string,
  value: string | number | boolean | object,
  updatedBy: string,
  notas?: string,
): Promise<ConfigEntry> {
  const dbId = await ensureConfigsDatabase();
  const tipo: ConfigEntry["tipo"] =
    typeof value === "number"
      ? "number"
      : typeof value === "boolean"
        ? "boolean"
        : typeof value === "object"
          ? "json"
          : "string";
  const valueStr =
    tipo === "json" ? JSON.stringify(value) : String(value);

  const existing = await getConfig(key);

  const properties: any = {
    Key: { title: [{ type: "text", text: { content: key } }] },
    Value: { rich_text: [{ type: "text", text: { content: valueStr } }] },
    Tipo: { select: { name: tipo } },
    "Atualizado em": { date: { start: new Date().toISOString() } },
    "Atualizado por": {
      rich_text: [{ type: "text", text: { content: updatedBy } }],
    },
  };
  if (notas) {
    properties.Notas = {
      rich_text: [{ type: "text", text: { content: notas } }],
    };
  }

  if (existing) {
    await updatePage(existing.pageId, properties);
    return {
      ...existing,
      valueRaw: valueStr,
      tipo,
      atualizadoEm: new Date().toISOString(),
      atualizadoPor: updatedBy,
    };
  }

  const created = await createPage(dbId, properties);
  return {
    pageId: created.id,
    key,
    valueRaw: valueStr,
    tipo,
    atualizadoEm: new Date().toISOString(),
    atualizadoPor: updatedBy,
  };
}
