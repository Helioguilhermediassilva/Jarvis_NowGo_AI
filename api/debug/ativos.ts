/**
 * api/debug/ativos.ts
 *
 * Endpoint de diagnóstico: lista todos os deals da ATIVOS CRM IA com status,
 * valor, MRR, addedAt e ponderação por estágio (probabilidade × valor).
 * Útil para auditar Pipeline Aberto, Perspectiva Ponderada e Novas Oportunidades.
 */

import { listarAtivosCrmIa } from "../../server/brainQueries.js";

// Mapeamento de status (ATIVOS CRM IA) → probabilidade de fechamento.
// Sincronizado com STAGE_PROBABILITY em server/financialKpis.ts.
const STATUS_PROBABILITY: Record<string, number> = {
  Lead: 0.10,
  Qualified: 0.30,
  "Proposal 👀": 0.60,
  Negotiation: 0.80,
  "Closed 💪": 1.00,
  Lost: 0.00,
};

function probFor(status: string | null): number {
  if (!status) return 0;
  return STATUS_PROBABILITY[status] ?? 0;
}

export default async function handler(req: any, res: any) {
  try {
    const filter = (req?.query?.status as string) || null;
    const ativos = await listarAtivosCrmIa();

    let pipelineAberto = 0;
    let perspectivaPonderada = 0;
    let realizadoYtd = 0;

    const rows = ativos
      .filter((a) => (filter ? a.status === filter : true))
      .map((a) => {
        const valor = a.estimatedValueBrl ?? 0;
        const prob = probFor(a.status);
        const ponderado = valor * prob;
        const isAtivo =
          a.status !== "Closed 💪" && a.status !== "Lost" && a.status !== null;
        const isFechado = a.status === "Closed 💪";

        if (isAtivo) {
          pipelineAberto += valor;
          perspectivaPonderada += ponderado;
        }
        if (isFechado) {
          realizadoYtd += valor;
        }

        return {
          id: a.id,
          company: a.company,
          status: a.status,
          estimatedValueBrl: valor,
          probabilidade: prob,
          valorPonderadoBrl: ponderado,
          mrrBrl: a.mrrBrl,
          priority: a.priority,
          expectedClose: a.expectedClose,
          lastContact: a.lastContact,
          addedAt: a.addedAt,
        };
      })
      .sort(
        (x, y) =>
          (y.estimatedValueBrl ?? 0) - (x.estimatedValueBrl ?? 0),
      );

    res.setHeader("Cache-Control", "no-store");
    return res.status(200).json({
      total: rows.length,
      totalAll: ativos.length,
      filter,
      totais: {
        pipelineAberto: Math.round(pipelineAberto),
        perspectivaPonderada: Math.round(perspectivaPonderada),
        realizadoYtd: Math.round(realizadoYtd),
      },
      tabelaProbabilidade: STATUS_PROBABILITY,
      rows,
    });
  } catch (err: any) {
    return res
      .status(500)
      .json({ error: err?.message || "unknown" });
  }
}
