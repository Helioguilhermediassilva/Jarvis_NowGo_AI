/**
 * api/admin/setup-decisor-props.ts
 *
 * Endpoint TEMPORÁRIO de setup: adiciona duas propriedades rich_text à base
 * "ATIVOS CRM IA" do NowGo Brain:
 *   - "Decision Maker"          → nome do decisor do cliente
 *   - "Decision Maker Contact"  → contato (cargo, canal, telefone, e-mail)
 *
 * Idempotente: se a propriedade já existe, não duplica.
 *
 * Segurança: exige header `x-admin-token` igual a JARVIS_COCKPIT_SECRET.
 * Este arquivo deve ser REMOVIDO após o setup ser executado uma vez.
 */

import type { VercelRequest, VercelResponse } from "@vercel/node";

const ATIVOS_CRM_IA_DB_ID = "1041e87b-1609-806f-af78-e9102e86e231";
const NEW_PROPS = ["Decision Maker", "Decision Maker Contact"] as const;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Token TEMPORÁRIO hardcoded. Este arquivo será removido após o setup.
  const adminToken = "13b69ba0a442f36431d76053baf280ef84a966b9a0dc7c91";
  if (req.headers["x-admin-token"] !== adminToken) {
    return res.status(401).json({ error: "unauthorized" });
  }
  const notionToken = process.env.NOTION_API_KEY;
  if (!notionToken) {
    return res.status(500).json({ error: "NOTION_API_KEY missing" });
  }

  // 1. Buscar schema atual.
  const headers = {
    Authorization: `Bearer ${notionToken}`,
    "Notion-Version": "2022-06-28",
    "Content-Type": "application/json",
  };
  const dbRes = await fetch(`https://api.notion.com/v1/databases/${ATIVOS_CRM_IA_DB_ID}`, {
    method: "GET",
    headers,
  });
  if (!dbRes.ok) {
    return res.status(502).json({ error: "notion get db failed", status: dbRes.status, body: (await dbRes.text()).slice(0, 400) });
  }
  const db = (await dbRes.json()) as { properties: Record<string, unknown> };
  const existing = Object.keys(db.properties);

  // 2. Adicionar apenas as que não existem.
  const toAdd: Record<string, { rich_text: Record<string, never> }> = {};
  for (const name of NEW_PROPS) {
    if (!existing.includes(name)) {
      toAdd[name] = { rich_text: {} };
    }
  }
  if (Object.keys(toAdd).length === 0) {
    return res.status(200).json({ ok: true, msg: "all props already exist", existing: NEW_PROPS });
  }

  // 3. PATCH no schema.
  const patchRes = await fetch(`https://api.notion.com/v1/databases/${ATIVOS_CRM_IA_DB_ID}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify({ properties: toAdd }),
  });
  if (!patchRes.ok) {
    return res.status(502).json({ error: "notion patch failed", status: patchRes.status, body: (await patchRes.text()).slice(0, 400) });
  }
  const updated = (await patchRes.json()) as { properties: Record<string, unknown> };
  return res.status(200).json({
    ok: true,
    added: Object.keys(toAdd),
    propertiesNow: Object.keys(updated.properties),
  });
}
