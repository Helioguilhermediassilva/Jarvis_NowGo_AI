/**
 * api/financial/kpis.ts
 *
 * Endpoint GET dos KPIs do NowGo Revenue Cockpit.
 *
 * v1.3 (F17 — Receita Recorrente):
 *  - Inclui MRR e ARR somados da ATIVOS CRM IA (fonte editável humana)
 *  - Realizado YTD calculado AUTOMATICAMENTE das oportunidades em Fechado-Ganho
 *  - Meta, ticket médio e (opcional) override de realizado leem do NowGo Configs
 *  - Fallback para snapshot inicial se nenhuma fechada existir e nenhum override
 */

import {
  calcularKpis,
  META_2026_BRL,
  TICKET_MEDIO_BRL,
} from "../../server/financialKpis.js";
import {
  listarTopPorScore,
  listarAtivosCrmIa,
  calcularMrrArrTotals,
} from "../../server/brainQueries.js";
import { getConfigNumber } from "../../server/nowgoConfigsStore.js";

export default async function handler(_req: any, res: any) {
  try {
    // Lê em paralelo:
    //   1) até 100 oportunidades do pipeline canônico (Brain)
    //   2) todos os ativos da ATIVOS CRM IA (fonte humana, MRR/ARR)
    const [opps, ativos] = await Promise.all([
      listarTopPorScore(100).catch((e) => {
        console.warn(
          "[/api/financial/kpis] Brain pipeline indisponível:",
          (e as Error).message,
        );
        return [];
      }),
      listarAtivosCrmIa().catch((e) => {
        console.warn(
          "[/api/financial/kpis] ATIVOS CRM IA indisponível:",
          (e as Error).message,
        );
        return [];
      }),
    ]);

    const recurring = calcularMrrArrTotals(ativos);

    // Lê overrides persistentes (defaults se não existirem)
    const [metaOverride, ticketOverride, realizadoOverride] = await Promise.all([
      getConfigNumber("META_2026_BRL", META_2026_BRL),
      getConfigNumber("TICKET_MEDIO_BRL", TICKET_MEDIO_BRL),
      getConfigNumber("REALIZADO_YTD_OVERRIDE_BRL", -1), // -1 = sem override
    ]);

    const kpis = calcularKpis({
      oportunidades: opps,
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
        opportunities: opps.length,
        ativosCrmIa: ativos.length,
        metaSource:
          metaOverride === META_2026_BRL ? "default" : "override",
        ticketSource:
          ticketOverride === TICKET_MEDIO_BRL ? "default" : "override",
        realizadoSource:
          realizadoOverride >= 0
            ? "override"
            : kpis.contagens.fechadasYtd > 0
              ? "brain-auto"
              : "snapshot",
      },
    });
  } catch (err: any) {
    console.error("[/api/financial/kpis] erro:", err?.message);
    const kpis = calcularKpis({ oportunidades: [] });
    return res.status(200).json({ kpis, warning: "fallback" });
  }
}
