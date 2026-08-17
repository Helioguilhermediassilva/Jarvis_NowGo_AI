/**
 * server/googleDrive.ts
 *
 * Camada de integração com o Google Drive da NowGo (NowGo Sovereign Stack).
 * Usa Service Account com chave JSON em GOOGLE_DRIVE_SA_KEY (env var, JSON inteiro).
 *
 * Pasta raiz: "Arquivos_NowGo_AI" (ID resolvido na primeira chamada e cacheado).
 * Subpastas: Apresentacoes, Propostas, Contratos, OnePages, PitchDecks.
 *
 * IMPORTANTE: enquanto GOOGLE_DRIVE_SA_KEY não estiver configurada, todas as
 * chamadas devolvem `{ ok: false, reason: 'sa_not_configured' }` para que os
 * geradores possam fazer fallback para storage local.
 */

import { google, drive_v3 } from "googleapis";
import { Readable } from "stream";

export const ARQUIVOS_ROOT_NAME = "Arquivos_NowGo_AI";
export type DriveSubfolder =
  | "Apresentacoes"
  | "Propostas"
  | "Contratos"
  | "OnePages"
  | "PitchDecks";

const SUBFOLDERS: DriveSubfolder[] = [
  "Apresentacoes",
  "Propostas",
  "Contratos",
  "OnePages",
  "PitchDecks",
];

interface SaJson {
  client_email: string;
  private_key: string;
  project_id: string;
}

let driveClient: drive_v3.Drive | null = null;
let driveError: string | null = null;
let folderIdCache: { root?: string } & Partial<Record<DriveSubfolder, string>> = {};

/* ------------------------------------------------------------------ */
/*  Bootstrap do cliente                                                */
/* ------------------------------------------------------------------ */

function getSaJson(): SaJson | null {
  const raw = process.env.GOOGLE_DRIVE_SA_KEY;
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as SaJson;
    if (!parsed.client_email || !parsed.private_key) return null;
    return parsed;
  } catch {
    return null;
  }
}

function getDriveClient(): drive_v3.Drive | null {
  if (driveClient) return driveClient;
  const sa = getSaJson();
  if (!sa) {
    driveError = "GOOGLE_DRIVE_SA_KEY não configurada";
    return null;
  }
  try {
    const auth = new google.auth.JWT({
      email: sa.client_email,
      key: sa.private_key.replace(/\\n/g, "\n"),
      scopes: ["https://www.googleapis.com/auth/drive"],
    });
    // A versão atual de googleapis expõe tipos incompatíveis entre JWT e Drive.
    // O JWT é aceito em runtime; o cast limita a incompatibilidade ao ponto de adaptação.
    driveClient = google.drive({ version: "v3", auth } as any) as unknown as drive_v3.Drive;
    return driveClient;
  } catch (e) {
    driveError = `Drive client init falhou: ${(e as Error).message}`;
    return null;
  }
}

export function isDriveConfigured(): boolean {
  return getDriveClient() !== null;
}

export function getDriveError(): string | null {
  return driveError;
}

/* ------------------------------------------------------------------ */
/*  Pastas                                                              */
/* ------------------------------------------------------------------ */

async function findOrCreateFolder(
  drive: drive_v3.Drive,
  name: string,
  parentId?: string,
): Promise<string> {
  const q = [
    `mimeType = 'application/vnd.google-apps.folder'`,
    `name = '${name.replace(/'/g, "\\'")}'`,
    `trashed = false`,
    parentId ? `'${parentId}' in parents` : null,
  ]
    .filter(Boolean)
    .join(" and ");

  const list = await drive.files.list({
    q,
    fields: "files(id, name)",
    pageSize: 5,
    supportsAllDrives: true,
    includeItemsFromAllDrives: true,
  });
  const found = list.data.files?.[0];
  if (found?.id) return found.id;

  const created = await drive.files.create({
    requestBody: {
      name,
      mimeType: "application/vnd.google-apps.folder",
      parents: parentId ? [parentId] : undefined,
    },
    fields: "id",
    supportsAllDrives: true,
  });
  if (!created.data.id) throw new Error(`Não consegui criar pasta ${name}`);
  return created.data.id;
}

/**
 * Garante que a hierarquia de pastas existe e devolve o ID da subpasta.
 * Cacheia em memória dentro do worker para minimizar chamadas Drive.
 */
export async function ensureFolder(sub: DriveSubfolder): Promise<{
  ok: true; folderId: string; rootId: string;
} | { ok: false; reason: string }> {
  const drive = getDriveClient();
  if (!drive) return { ok: false, reason: driveError || "drive_not_configured" };

  try {
    if (!folderIdCache.root) {
      folderIdCache.root = await findOrCreateFolder(drive, ARQUIVOS_ROOT_NAME);
    }
    if (!folderIdCache[sub]) {
      folderIdCache[sub] = await findOrCreateFolder(drive, sub, folderIdCache.root);
    }
    return { ok: true, folderId: folderIdCache[sub] as string, rootId: folderIdCache.root };
  } catch (e) {
    return { ok: false, reason: (e as Error).message };
  }
}

/**
 * Inicializa toda a hierarquia em uma chamada (root + 5 subpastas).
 * Usado pelo /api/drive/test.
 */
export async function ensureAllFolders(): Promise<{
  ok: true; root: string; subfolders: Record<DriveSubfolder, string>;
} | { ok: false; reason: string }> {
  const drive = getDriveClient();
  if (!drive) return { ok: false, reason: driveError || "drive_not_configured" };

  try {
    if (!folderIdCache.root) {
      folderIdCache.root = await findOrCreateFolder(drive, ARQUIVOS_ROOT_NAME);
    }
    const subs = {} as Record<DriveSubfolder, string>;
    for (const sub of SUBFOLDERS) {
      if (!folderIdCache[sub]) {
        folderIdCache[sub] = await findOrCreateFolder(drive, sub, folderIdCache.root);
      }
      subs[sub] = folderIdCache[sub] as string;
    }
    return { ok: true, root: folderIdCache.root, subfolders: subs };
  } catch (e) {
    return { ok: false, reason: (e as Error).message };
  }
}

/* ------------------------------------------------------------------ */
/*  Upload                                                              */
/* ------------------------------------------------------------------ */

export interface UploadFileInput {
  subfolder: DriveSubfolder;
  fileName: string;
  mimeType: string;
  data: Buffer;
  /** Se true, dá link de leitura para "qualquer um com link". Default: false. */
  shareAnyone?: boolean;
}

export interface UploadFileResult {
  ok: true;
  fileId: string;
  webViewLink: string;
  webContentLink?: string;
}
export interface UploadFileError {
  ok: false;
  reason: string;
}

export async function uploadFile(
  input: UploadFileInput,
): Promise<UploadFileResult | UploadFileError> {
  const drive = getDriveClient();
  if (!drive) return { ok: false, reason: driveError || "drive_not_configured" };

  try {
    const folder = await ensureFolder(input.subfolder);
    if (!folder.ok) return folder;

    const created = await drive.files.create({
      requestBody: {
        name: input.fileName,
        parents: [folder.folderId],
        mimeType: input.mimeType,
      },
      media: {
        mimeType: input.mimeType,
        body: Readable.from(input.data),
      },
      fields: "id, webViewLink, webContentLink",
      supportsAllDrives: true,
    });

    const fileId = created.data.id;
    if (!fileId) return { ok: false, reason: "Drive não devolveu fileId" };

    if (input.shareAnyone) {
      try {
        await drive.permissions.create({
          fileId,
          requestBody: { role: "reader", type: "anyone" },
          supportsAllDrives: true,
        });
      } catch (e) {
        // Se a permissão falhar (ex.: política de domínio), não invalida o upload.
        console.warn(`[googleDrive] permissão pública falhou para ${fileId}: ${(e as Error).message}`);
      }
    }

    return {
      ok: true,
      fileId,
      webViewLink: created.data.webViewLink || `https://drive.google.com/file/d/${fileId}/view`,
      webContentLink: created.data.webContentLink || undefined,
    };
  } catch (e) {
    return { ok: false, reason: (e as Error).message };
  }
}

/**
 * Lista os últimos N arquivos de uma subpasta. Útil para o painel "Arquivos NowGo".
 */
export async function listRecentFiles(
  sub: DriveSubfolder,
  limit = 10,
): Promise<
  | { ok: true; files: Array<{ id: string; name: string; mimeType: string; modifiedTime: string; webViewLink: string }> }
  | { ok: false; reason: string }
> {
  const drive = getDriveClient();
  if (!drive) return { ok: false, reason: driveError || "drive_not_configured" };

  const folder = await ensureFolder(sub);
  if (!folder.ok) return folder;

  try {
    const list = await drive.files.list({
      q: `'${folder.folderId}' in parents and trashed = false`,
      orderBy: "modifiedTime desc",
      pageSize: Math.max(1, Math.min(50, limit)),
      fields: "files(id, name, mimeType, modifiedTime, webViewLink)",
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
    });
    const files = (list.data.files || []).map((f: drive_v3.Schema$File) => ({
      id: f.id || "",
      name: f.name || "",
      mimeType: f.mimeType || "",
      modifiedTime: f.modifiedTime || "",
      webViewLink: f.webViewLink || "",
    }));
    return { ok: true, files };
  } catch (e) {
    return { ok: false, reason: (e as Error).message };
  }
}
