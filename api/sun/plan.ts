/**
 * api/sun/plan.ts
 *
 * Endpoint público (GET) que devolve o snapshot vigente do SUN Execution
 * Controller. O cockpit consome este endpoint para renderizar:
 *  - 3 Missões Ativas (regra 3+1)
 *  - Matriz Ativa/Radar/Pausada/Descartada (Snapshot)
 *  - Top 5 Deal Rooms
 *  - Cadência operacional (5 rituais)
 *  - Plano dos próximos 7 dias
 *  - Lista de remoção da agenda do founder
 *
 * Sincronização ao vivo:
 *  O snapshot base é estático (blueprint v1.0), mas as CLASSIFICAÇÕES das
 *  oportunidades são sobrepostas com o estado real do NowGo Brain (Notion),
 *  via `applySunClassificationFromBrain`. Assim o Snapshot reflete o que o
 *  usuário altera no Brain Live / Notion / por voz, sem perder as ações
 *  operacionais. Se o Brain falhar, cai no snapshot estático (fail-safe).
 *
 * Resposta:
 *  - 200 OK: { snapshot: SunSnapshot, stats: {...}, live: boolean }
 *  - 500: { error: string }
 */

import {
  getCurrentSunSnapshot,
  getSunStats,
  applySunClassificationFromBrain,
} from "../../server/sunPlan.js";
import { listarPortfolioSun } from "../../server/brainQueries.js";

export default async function handler(req: any, res: any) {
  try {
    const base = getCurrentSunSnapshot();

    // Overlay ao vivo da classificação real do Brain (com fail-safe).
    let snapshot = base;
    let live = false;
    try {
      const brainOps = await listarPortfolioSun(200);
      snapshot = applySunClassificationFromBrain(base, brainOps);
      live = true;
    } catch (brainErr: any) {
      console.warn(
        "[/api/sun/plan] overlay do Brain indisponível, usando snapshot estático:",
        brainErr?.message ?? String(brainErr),
      );
    }

    const stats = getSunStats(snapshot);
    // Sem cache de borda: a classificação muda em tempo real.
    res.setHeader("Cache-Control", "no-store, max-age=0");
    return res.status(200).json({ snapshot, stats, live });
  } catch (err: any) {
    const msg = err?.message ?? String(err);
    console.error("[/api/sun/plan] erro:", msg, err?.stack);
    return res.status(500).json({ error: `Falha ao carregar plano SUN: ${msg}` });
  }
}
