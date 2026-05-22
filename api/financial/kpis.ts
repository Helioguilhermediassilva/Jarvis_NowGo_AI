/**
 * api/financial/kpis.ts
 *
 * Endpoint GET dos KPIs do NowGo Revenue Cockpit.
 *
 * v1.2 (F14.3 + F14.4):
 *  - Realizado YTD calculado AUTOMATICAMENTE das oportunidades em Fechado-Ganho
 *  - Meta, ticket médio e (opcional) override de realizado leem do NowGo Configs
 *  - Fallback para snapshot inicial (R$ 640.000) se nenhuma fechada existir e
 *    nenhum override for definido
 */

import {
  calcularKpis,
  META_2026_BRL,
  TICKET_MEDIO_BRL,
} from "../../server/financialKpis.js";
import { listarTopPorScore } from "../../server/brainQueries.js";
import { getConfigNumber } from "../../server/nowgoConfigsStore.js";

export default async function handler(_req: any, res: any) {
  try {
    // Lê até 100 oportunidades — universo suficiente para cálculo confiável
    const opps = await listarTopPorScore(100).catch((e) => {
      console.warn(
        "[/api/financial/kpis] Brain indisponível:",
        (e as Error).message,
      );
      return [];
    });

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
    });

    res.setHeader("Cache-Control", "private, max-age=15, s-maxage=30");
    return res.status(200).json({
      kpis,
      sources: {
        opportunities: opps.length,
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
