/**
 * api/admin/setup-decisor-props-pipeline.ts
 *
 * Endpoint TEMPORÁRIO de setup: adiciona "Decisor" e "Contato Decisor"
 * (rich_text) na base 💼 Oportunidades / Pipeline. Idempotente.
 *
 * Será removido após o setup.
 */

import type { VercelRequest, VercelResponse } from "@vercel/node";

const PIPELINE_DB_ID = "616cee4a-33f7-4e45-a8bb-80d91dcd14ee";
const NEW_PROPS = ["Decisor", "Contato Decisor"] as const;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const adminToken = "13b69ba0a442f36431d76053baf280ef84a966b9a0dc7c91";
  if (req.headers["x-admin-token"] !== adminToken) {
    return res.status(401).json({ error: "unauthorized" });
  }
  const notionToken = process.env.NOTION_API_KEY;
  if (!notionToken) {
    return res.status(500).json({ error: "NOTION_API_KEY missing" });
  }

  const headers = {
    Authorization: `Bearer ${notionToken}`,
    "Notion-Version": "2022-06-28",
    "Content-Type": "application/json",
  };
  const dbRes = await fetch(`https://api.notion.com/v1/databases/${PIPELINE_DB_ID}`, {
    method: "GET",
    headers,
  });
  if (!dbRes.ok) {
    return res.status(502).json({
      error: "notion get db failed",
      status: dbRes.status,
      body: (await dbRes.text()).slice(0, 400),
    });
  }
  const db = (await dbRes.json()) as { properties: Record<string, unknown> };
  const existing = Object.keys(db.properties);
  const toAdd: Record<string, { rich_text: Record<string, never> }> = {};
  for (const name of NEW_PROPS) {
    if (!existing.includes(name)) {
      toAdd[name] = { rich_text: {} };
    }
  }
  if (Object.keys(toAdd).length === 0) {
    return res.status(200).json({ ok: true, msg: "all props already exist", existing: NEW_PROPS });
  }
  const patchRes = await fetch(`https://api.notion.com/v1/databases/${PIPELINE_DB_ID}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify({ properties: toAdd }),
  });
  if (!patchRes.ok) {
    return res.status(502).json({
      error: "notion patch failed",
      status: patchRes.status,
      body: (await patchRes.text()).slice(0, 400),
    });
  }
  const updated = (await patchRes.json()) as { properties: Record<string, unknown> };
  return res.status(200).json({
    ok: true,
    added: Object.keys(toAdd),
    propertiesNow: Object.keys(updated.properties),
  });
}
