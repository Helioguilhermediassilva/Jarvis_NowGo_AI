import type { VercelRequest, VercelResponse } from "@vercel/node";
import { ensureAllFolders, isDriveConfigured, getDriveError, listRecentFiles } from "../../server/googleDrive.js";

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cache-Control", "no-store");

  if (!isDriveConfigured()) {
    return res.status(200).json({
      configured: false,
      reason: getDriveError() || "GOOGLE_DRIVE_SA_KEY ausente",
      hint: "Adicione a chave JSON da Service Account em GOOGLE_DRIVE_SA_KEY no Vercel.",
    });
  }

  try {
    const folders = await ensureAllFolders();
    if (!folders.ok) {
      return res.status(500).json({ configured: true, ok: false, reason: folders.reason });
    }
    const recent = await listRecentFiles("Apresentacoes", 3);
    return res.status(200).json({
      configured: true,
      ok: true,
      root: folders.root,
      subfolders: folders.subfolders,
      sample: recent.ok ? recent.files : [],
      message: "Drive autenticado e pasta Arquivos_NowGo_AI pronta.",
    });
  } catch (e) {
    return res.status(500).json({ configured: true, ok: false, reason: (e as Error).message });
  }
}
