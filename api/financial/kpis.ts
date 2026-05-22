/**
 * api/financial/kpis.ts
 *
 * Endpoint GET dos KPIs do NowGo Revenue Cockpit.
 *
 * v1.4 (F17.1 — ATIVOS CRM IA como fonte primária):
 *  - A ATIVOS CRM IA passa a ser a fonte primária dos cálculos de
 *    Pipeline Aberto, Realizado YTD, Perspectiva e contagens.
 *  - O pipeline canônico (💼 Oportunidades / Pipeline) continua sendo lido
 *    em paralelo e seus deals são MESCLADOS na lista quando há valor.
 *  - MRR/ARR continuam vindo de ATIVOS CRM IA.
 *
 * Decisão de design: o founder edita os deals reais em ATIVOS CRM IA, então
 * essa é a fonte de verdade. O pipeline canônico fica para deals já
 * "promovidos" via SUN Classifier (fase futura).
 */

import {
  calcularKpis,
  META_2026_BRL,
  TICKET_MEDIO_BRL,
} from "../../server/financialKpis.js";
import {
  listarTopPorScore,
  listarAtivosCrmIa,
  ativoCrmToOportunidade,
  calcularMrrArrTotals,
} from "../../server/brainQueries.js";
import { getConfigNumber } from "../../server/nowgoConfigsStore.js";

export default async function handler(_req: any, res: any) {
  try {
    // ATIVOS CRM IA = única fonte da verdade do funil.
    // O pipeline canônico (Brain) ficará reativado quando o SUN Sync estiver
    // implementado (fase 3): nessa altura ele só conterá oportunidades JÁ
    // promovidas pelo classificador, evitando double-count.
    const ativos = await listarAtivosCrmIa().catch((e) => {
      console.warn(
        "[/api/financial/kpis] ATIVOS CRM IA indisponível:",
        (e as Error).message,
      );
      return [];
    });
    const oppsBrain: any[] = []; // mantido só para o campo sources
    const oppsAtivos = ativos.map(ativoCrmToOportunidade);
    const oppsMesclado = oppsAtivos;

    // Calcula totais de receita recorrente
    const recurring = calcularMrrArrTotals(ativos);

    // Lê overrides persistentes (defaults se não existirem)
    const [metaOverride, ticketOverride, realizadoOverride] = await Promise.all([
      getConfigNumber("META_2026_BRL", META_2026_BRL),
      getConfigNumber("TICKET_MEDIO_BRL", TICKET_MEDIO_BRL),
      getConfigNumber("REALIZADO_YTD_OVERRIDE_BRL", -1), // -1 = sem override
    ]);

    const kpis = calcularKpis({
      oportunidades: oppsMesclado,
      metaAnualOverrideBrl: metaOverride,
      ticketMedioOverrideBrl: ticketOverride,
      realizadoYtdOverrideBrl:
        realizadoOverride >= 0 ? realizadoOverride : undefined,
      mrrTotalBrl: recurring.mrrTotalBrl,
      arrTotalBrl: recurring.arrTotalBrl,
      dealsComRecorrencia: recurring.dealsComRecorrencia,
    });

    res.setHeader("Cache-Control", "private, max-age=15, s-maxage=30");
    return res.status(200).json({
      kpis,
      recurring: {
        mrrTotalBrl: recurring.mrrTotalBrl,
        arrTotalBrl: recurring.arrTotalBrl,
        dealsComRecorrencia: recurring.dealsComRecorrencia,
        totalAtivos: recurring.totalAtivos,
        porStatus: recurring.porStatus,
        topRecorrencia: recurring.topRecorrencia,
      },
      sources: {
        primary: "ATIVOS CRM IA",
        ativosCrmIa: ativos.length,
        brainPipeline: oppsBrain.length,
        mescladas: oppsMesclado.length,
        metaSource:
          metaOverride === META_2026_BRL ? "default" : "override",
        ticketSource:
          ticketOverride === TICKET_MEDIO_BRL ? "default" : "override",
        realizadoSource:
          realizadoOverride >= 0
            ? "override"
            : kpis.contagens.fechadasYtd > 0
              ? "ativos-auto"
              : "snapshot",
      },
    });
  } catch (err: any) {
    console.error("[/api/financial/kpis] erro:", err?.message);
    const kpis = calcularKpis({ oportunidades: [] });
    return res.status(200).json({ kpis, warning: "fallback" });
  }
}
