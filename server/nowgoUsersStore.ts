/**
 * server/nowgoUsersStore.ts
 *
 * NowGo Users — store soberano de whitelist de acesso ao Cockpit Jarvis.
 *
 * Modelo de dados (schema da database Notion "NowGo Users"):
 *  - Email (title)        : string lowercase (chave única)
 *  - Nome (rich_text)     : nome de exibição (preenchido no primeiro login)
 *  - Foto (url)           : URL da foto Google
 *  - Papel (select)       : "superadmin" | "operador" | "leitor"
 *  - Ativo (checkbox)     : controla acesso (false = bloqueado)
 *  - Criado em (date)     : timestamp ISO do primeiro login
 *  - Último acesso (date) : timestamp ISO atualizado a cada login
 *
 * O ID da database é descoberto dinamicamente:
 *  1. Variável NOWGO_USERS_DATABASE_ID, se definida
 *  2. Busca por título "NowGo Users" via /search
 *  3. Se não existir, é criada automaticamente em uma página raiz disponível
 *     (a integração precisa ter ao menos uma página compartilhada).
 */

import {
  notionFetch,
  queryDatabase,
  createPage,
  updatePage,
  listDatabases,
  listPages,
} from "./notionBrain.js";
import type { NowGoUser, UserRole } from "./auth.js";

const DB_TITLE = "NowGo Users";

let cachedDatabaseId: string | null = null;

// ---------------------------------------------------------------------------
// Resolução do databaseId (com cache)
// ---------------------------------------------------------------------------

export async function resolveUsersDatabaseId(): Promise<string> {
  if (cachedDatabaseId) return cachedDatabaseId;

  const fromEnv = process.env.NOWGO_USERS_DATABASE_ID?.trim();
  if (fromEnv) {
    cachedDatabaseId = fromEnv;
    return fromEnv;
  }

  // Procura uma database existente cujo título seja "NowGo Users"
  const dbs = await listDatabases();
  const found = dbs.find((d) => d.title.toLowerCase() === DB_TITLE.toLowerCase());
  if (found) {
    cachedDatabaseId = found.id;
    return found.id;
  }

  throw new Error(
    "NowGo Users database não encontrada. Defina NOWGO_USERS_DATABASE_ID ou crie uma database chamada 'NowGo Users' no Notion compartilhada com a integração.",
  );
}

/**
 * Garante que a database "NowGo Users" exista. Se não existir, tenta criá-la
 * sob a primeira página acessível pela integração.
 */
export async function ensureUsersDatabase(): Promise<string> {
  try {
    return await resolveUsersDatabaseId();
  } catch {
    // Não existe — tentar criar
  }

  const pages = await listPages(50);
  if (!pages.length) {
    throw new Error(
      "Nenhuma página acessível pela integração Notion para criar a database 'NowGo Users'. Compartilhe ao menos uma página com a integração e tente de novo.",
    );
  }

  // Usa a primeira página acessível como parent
  const parent = pages[0];

  const created = await notionFetch<any>("/databases", {
    method: "POST",
    body: JSON.stringify({
      parent: { type: "page_id", page_id: parent.id },
      title: [{ type: "text", text: { content: DB_TITLE } }],
      properties: {
        Email: { title: {} },
        Nome: { rich_text: {} },
        Foto: { url: {} },
        Papel: {
          select: {
            options: [
              { name: "superadmin", color: "red" },
              { name: "operador", color: "blue" },
              { name: "leitor", color: "default" },
            ],
          },
        },
        Ativo: { checkbox: {} },
        "Criado em": { date: {} },
        "Último acesso": { date: {} },
      },
    }),
  });

  cachedDatabaseId = created.id;
  return created.id;
}

// ---------------------------------------------------------------------------
// Mapeamento Notion <-> NowGoUser
// ---------------------------------------------------------------------------

function readTitle(prop: any): string {
  if (!prop?.title || !Array.isArray(prop.title)) return "";
  return prop.title.map((t: any) => t?.plain_text ?? "").join("");
}
function readRichText(prop: any): string | undefined {
  if (!prop?.rich_text || !Array.isArray(prop.rich_text)) return undefined;
  const txt = prop.rich_text.map((t: any) => t?.plain_text ?? "").join("");
  return txt || undefined;
}
function readUrl(prop: any): string | undefined {
  return typeof prop?.url === "string" ? prop.url : undefined;
}
function readSelect(prop: any): string | undefined {
  return prop?.select?.name;
}
function readCheckbox(prop: any): boolean {
  return Boolean(prop?.checkbox);
}

function mapPageToUser(page: any): NowGoUser | null {
  const props = page?.properties ?? {};
  const email = readTitle(props.Email).trim().toLowerCase();
  if (!email) return null;
  const role = (readSelect(props.Papel) as UserRole | undefined) ?? "leitor";
  return {
    email,
    name: readRichText(props.Nome),
    picture: readUrl(props.Foto),
    role,
    active: readCheckbox(props.Ativo) || readCheckbox(props.Active),
  };
}

// ---------------------------------------------------------------------------
// Operações
// ---------------------------------------------------------------------------

export async function resolveUserByEmail(email: string): Promise<NowGoUser | null> {
  const dbId = await resolveUsersDatabaseId();
  const lower = email.trim().toLowerCase();

  const r = await queryDatabase(dbId, {
    filter: {
      property: "Email",
      title: { equals: lower },
    },
    page_size: 1,
  });
  const page = r.results?.[0];
  if (!page) return null;
  return mapPageToUser(page);
}

export async function listAllUsers(): Promise<NowGoUser[]> {
  const dbId = await resolveUsersDatabaseId();
  const r = await queryDatabase(dbId, { page_size: 100 });
  return (r.results ?? [])
    .map(mapPageToUser)
    .filter((u): u is NowGoUser => !!u);
}

interface UpsertInput {
  email: string;
  name?: string;
  picture?: string;
  role: UserRole;
  active: boolean;
  lastLoginAt?: string;
}

export async function upsertUser(input: UpsertInput): Promise<NowGoUser> {
  const dbId = await ensureUsersDatabase();
  const lower = input.email.trim().toLowerCase();

  // Verificar se já existe
  const existing = await queryDatabase(dbId, {
    filter: { property: "Email", title: { equals: lower } },
    page_size: 1,
  });
  const existingPage = existing.results?.[0];

  const props: Record<string, unknown> = {
    Email: { title: [{ type: "text", text: { content: lower } }] },
    Papel: { select: { name: input.role } },
    Ativo: { checkbox: input.active },
  };
  if (input.name) {
    props.Nome = { rich_text: [{ type: "text", text: { content: input.name } }] };
  }
  if (input.picture) {
    props.Foto = { url: input.picture };
  }
  if (input.lastLoginAt) {
    props["Último acesso"] = { date: { start: input.lastLoginAt } };
  }

  if (existingPage) {
    await updatePage(existingPage.id, props);
  } else {
    props["Criado em"] = { date: { start: new Date().toISOString() } };
    await createPage(dbId, props);
  }

  return {
    email: lower,
    name: input.name,
    picture: input.picture,
    role: input.role,
    active: input.active,
  };
}

export async function setUserActive(email: string, active: boolean): Promise<void> {
  const dbId = await resolveUsersDatabaseId();
  const lower = email.trim().toLowerCase();
  const r = await queryDatabase(dbId, {
    filter: { property: "Email", title: { equals: lower } },
    page_size: 1,
  });
  const page = r.results?.[0];
  if (!page) throw new Error(`Usuário ${lower} não encontrado.`);
  await updatePage(page.id, { Ativo: { checkbox: active } });
}

export async function setUserRole(email: string, role: UserRole): Promise<void> {
  const dbId = await resolveUsersDatabaseId();
  const lower = email.trim().toLowerCase();
  const r = await queryDatabase(dbId, {
    filter: { property: "Email", title: { equals: lower } },
    page_size: 1,
  });
  const page = r.results?.[0];
  if (!page) throw new Error(`Usuário ${lower} não encontrado.`);
  await updatePage(page.id, { Papel: { select: { name: role } } });
}
