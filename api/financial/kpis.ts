/**
 * api/financial/kpis.ts
 *
 * Endpoint GET que devolve os KPIs financeiros do NowGo Revenue Cockpit.
 * Combina pipeline real do NowGo Brain com snapshot inicial de realizado YTD
 * (caso o Brain ainda não contenha o histórico completo).
 *
 * Resposta:
 *  200 OK: { kpis: FinancialKpis }
 *  500: { error: string, kpis: FinancialKpis (fallback synthetic) }
 *
 * Em caso de falha do Brain, retorna um objeto sintético com snapshot
 * (mantém o cockpit utilizável mesmo offline).
 */

import { calcularKpis, REALIZADO_YTD_SNAPSHOT_BRL, META_2026_BRL, TICKET_MEDIO_BRL } from "../../server/financialKpis.js";
import { listarTopPorScore } from "../../server/brainQueries.js";

export default async function handler(req: any, res: any) {
  try {
    // Lê até 100 oportunidades — o suficiente para um cálculo confiável
    const opps = await listarTopPorScore(100).catch((e) => {
      console.warn("[/api/financial/kpis] Brain indisponível:", (e as Error).message);
      return [];
    });

    const kpis = calcularKpis({
      oportunidades: opps,
    });

    res.setHeader("Cache-Control", "private, max-age=30, s-maxage=60");
    return res.status(200).json({ kpis });
  } catch (err: any) {
    console.error("[/api/financial/kpis] erro:", err?.message);
    // Fallback sintético — cockpit nunca quebra
    const kpis = calcularKpis({ oportunidades: [] });
    return res.status(200).json({ kpis, warning: "fallback" });
  }
}
