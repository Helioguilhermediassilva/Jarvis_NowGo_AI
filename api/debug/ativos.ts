/**
 * api/debug/ativos.ts
 *
 * Endpoint temporário de diagnóstico: lista todos os deals da ATIVOS CRM IA
 * com status, valor, MRR e ID. Útil para auditar Realizado YTD e identificar
 * deals classificados de forma errada.
 */

import { listarAtivosCrmIa } from "../../server/brainQueries.js";

export default async function handler(req: any, res: any) {
  try {
    const filter = (req?.query?.status as string) || null;
    const ativos = await listarAtivosCrmIa();

    const rows = ativos
      .filter((a) => (filter ? a.status === filter : true))
      .map((a) => ({
        id: a.id,
        company: a.company,
        status: a.status,
        estimatedValueBrl: a.estimatedValueBrl,
        mrrBrl: a.mrrBrl,
        priority: a.priority,
        expectedClose: a.expectedClose,
      }))
      .sort(
        (x, y) =>
          (y.estimatedValueBrl ?? 0) - (x.estimatedValueBrl ?? 0),
      );

    res.setHeader("Cache-Control", "no-store");
    return res.status(200).json({
      total: rows.length,
      totalAll: ativos.length,
      filter,
      rows,
    });
  } catch (err: any) {
    return res
      .status(500)
      .json({ error: err?.message || "unknown" });
  }
}
