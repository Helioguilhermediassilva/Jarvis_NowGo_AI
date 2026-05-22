/**
 * api/brain/deal-rooms.ts
 *
 * GET /api/brain/deal-rooms[?limit=5]
 *
 * Ranking automático top-N de oportunidades ativas (não fechadas, não arquivadas)
 * por score. Quando uma oportunidade é movida para Fechado-Ganho/Perdido ou
 * arquivada, a próxima de maior score sobe para o slot vago no próximo refresh.
 */

import { requireAuth } from "../../server/auth.js";
import { listarTopDealRooms } from "../../server/brainQueries.js";

export default async function handler(req: any, res: any) {
  const claims = await requireAuth(req).catch(() => null);
  if (!claims) {
    return res.status(401).json({ error: "Não autenticado." });
  }

  const url =
    typeof req.url === "string" ? new URL(req.url, "http://x") : null;
  const limit = Math.min(
    10,
    Math.max(1, parseInt(url?.searchParams.get("limit") ?? "5", 10)),
  );

  res.setHeader("Cache-Control", "private, no-store");

  try {
    const dealRooms = await listarTopDealRooms(limit);
    return res.status(200).json({
      dealRooms,
      limit,
      generatedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error("[/api/brain/deal-rooms] erro:", err?.message);
    return res
      .status(500)
      .json({ error: err?.message ?? "Erro ao consultar deal rooms." });
  }
}
