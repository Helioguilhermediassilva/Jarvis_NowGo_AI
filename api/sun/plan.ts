/**
 * api/sun/plan.ts
 *
 * Endpoint público (GET) que devolve o snapshot vigente do SUN Execution
 * Controller. O cockpit consome este endpoint para renderizar:
 *  - 3 Missões Ativas (regra 3+1)
 *  - Matriz Ativa/Radar/Pausada/Descartada
 *  - Top 5 Deal Rooms
 *  - Cadência operacional (5 rituais)
 *  - Plano dos próximos 7 dias
 *  - Lista de remoção da agenda do founder
 *
 * Resposta:
 *  - 200 OK: { snapshot: SunSnapshot, stats: {...} }
 *  - 500: { error: string }
 */

import { getCurrentSunSnapshot, getSunStats } from "../../server/sunPlan.js";

export default async function handler(req: any, res: any) {
  try {
    const snapshot = getCurrentSunSnapshot();
    const stats = getSunStats(snapshot);
    res.setHeader("Cache-Control", "public, max-age=60, s-maxage=120");
    return res.status(200).json({ snapshot, stats });
  } catch (err: any) {
    const msg = err?.message ?? String(err);
    console.error("[/api/sun/plan] erro:", msg, err?.stack);
    return res.status(500).json({ error: `Falha ao carregar plano SUN: ${msg}` });
  }
}
