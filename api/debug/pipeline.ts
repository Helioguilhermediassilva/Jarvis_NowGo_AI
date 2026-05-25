/**
 * api/debug/pipeline.ts
 *
 * Endpoint de diagnóstico (somente leitura, sem auth): lista todas as
 * oportunidades vivas do Pipeline NowGo Brain com Score, Estágio, Valor
 * Estimado e Probabilidade, ordenadas por Score descendente.
 *
 * Útil para auditar Top 5 Deal Rooms e identificar candidatos a entrar/sair
 * do ranking. Exclui Fechado-Ganho e Fechado-Perdido.
 *
 * Query params (opcionais):
 *   ?limit=50   (máx 200, default 100)
 */
import { listarTopPorScore } from "../../server/brainQueries.js";

export default async function handler(req: any, res: any) {
  try {
    const limitRaw = parseInt(req?.query?.limit ?? "100", 10);
    const limit = Math.min(200, Math.max(1, Number.isFinite(limitRaw) ? limitRaw : 100));

    const opps = await listarTopPorScore(limit);

    const rows = opps.map((o, idx) => ({
      rank: idx + 1,
      isTop5: idx < 5,
      nome: o.nome,
      idHumano: o.idHumano,
      estagio: o.estagio,
      score: o.score,
      valorEstimado: o.valorEstimado,
      probabilidade: o.probabilidade,
      proximoFollowUp: o.proximoFollowUp,
      urgencia: o.urgencia,
      agenteResponsavel: o.agenteResponsavel,
    }));

    const top5Total = rows
      .slice(0, 5)
      .reduce((sum, r) => sum + (r.valorEstimado ?? 0), 0);
    const totalAll = rows.reduce((sum, r) => sum + (r.valorEstimado ?? 0), 0);

    res.setHeader("Cache-Control", "no-store");
    return res.status(200).json({
      total: rows.length,
      limit,
      totaisBrl: {
        top5: Math.round(top5Total),
        all: Math.round(totalAll),
      },
      rows,
    });
  } catch (err: any) {
    return res
      .status(500)
      .json({ error: err?.message || "unknown" });
  }
}
