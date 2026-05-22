/**
 * api/brain/status.ts
 *
 * Endpoint que alimenta a Home Cockpit interna do NowGo Jarvis AI.
 * Agrega em uma única chamada: top 3 prioridades, pontos de atenção e
 * sugestões de aceleração (estas últimas mockadas nesta F2; serão
 * geradas por LLM em fase seguinte).
 *
 * Restrição: somente GET, somente leitura, requer cabeçalho de autenticação
 * simples (validado por env JARVIS_COCKPIT_SECRET); se ausente, devolve 401.
 */

import type { VercelRequest, VercelResponse } from "@vercel/node";
import {
  listarTopPorScore,
  listarFollowUpsAtrasados,
  listarBloqueiosCriticos,
  type OportunidadeResumo,
  type TarefaResumo,
} from "../../server/brainQueries.js";

function authorize(req: VercelRequest): boolean {
  const expected = process.env.JARVIS_COCKPIT_SECRET;
  if (!expected) return true; // dev: sem segredo configurado, permite tudo
  const got =
    req.headers["x-jarvis-cockpit"] ||
    (req.headers.authorization ?? "").replace(/^Bearer\s+/i, "");
  return got === expected;
}

interface CockpitPriority {
  id: string;
  nome: string;
  idHumano: string | null;
  estagio: string | null;
  score: number | null;
  valorEstimado: number | null;
  proximoFollowUp: string | null;
  status: "verde" | "amarelo" | "vermelho";
  motivo: string;
}

function classifyOpp(opp: OportunidadeResumo): { status: "verde" | "amarelo" | "vermelho"; motivo: string } {
  const today = new Date().toISOString().slice(0, 10);
  if (opp.proximoFollowUp && opp.proximoFollowUp < today) {
    return { status: "vermelho", motivo: `Follow-up atrasado (${opp.proximoFollowUp})` };
  }
  if (opp.score != null && opp.score >= 80) {
    return { status: "verde", motivo: "Score alto e momentum positivo" };
  }
  if (opp.urgencia === "Alta") {
    return { status: "amarelo", motivo: "Urgência alta — exige atenção" };
  }
  return { status: "amarelo", motivo: "Aguardando próximo movimento" };
}

interface CockpitAttention {
  tipo: "bloqueio" | "follow-up-atrasado" | "deadline";
  titulo: string;
  detalhe: string;
}

interface CockpitAcceleration {
  titulo: string;
  proposicao: string;
  fazSentido: "sim" | "talvez" | "validar";
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Método não permitido" });
  }
  if (!authorize(req)) {
    return res.status(401).json({ error: "Não autorizado" });
  }

  try {
    const [top, atrasos, bloqueios] = await Promise.all([
      listarTopPorScore(5),
      listarFollowUpsAtrasados(),
      listarBloqueiosCriticos(),
    ]);

    const priorities: CockpitPriority[] = top.slice(0, 3).map((o) => {
      const cls = classifyOpp(o);
      return {
        id: o.id,
        nome: o.nome,
        idHumano: o.idHumano,
        estagio: o.estagio,
        score: o.score,
        valorEstimado: o.valorEstimado,
        proximoFollowUp: o.proximoFollowUp,
        status: cls.status,
        motivo: cls.motivo,
      };
    });

    const attentions: CockpitAttention[] = [];

    // Bloqueios críticos
    for (const t of bloqueios.slice(0, 3)) {
      attentions.push({
        tipo: "bloqueio",
        titulo: t.nome,
        detalhe: `${t.prioridade ?? "P?"} · ${t.status ?? "—"}${t.prazo ? ` · prazo ${t.prazo}` : ""}`,
      });
    }

    // Follow-ups atrasados (até 3)
    for (const o of atrasos.slice(0, 3)) {
      attentions.push({
        tipo: "follow-up-atrasado",
        titulo: o.nome,
        detalhe: `Estágio ${o.estagio ?? "—"} · follow-up era ${o.proximoFollowUp}`,
      });
    }

    // Acelerações: por enquanto mockadas (F3 substitui por análise Grok real)
    const accelerations: CockpitAcceleration[] = [
      {
        titulo: "Padrão repetido em propostas de governo",
        proposicao:
          "Três oportunidades governamentais ativas usam o mesmo template Stack soberano. Vale empacotar como produto reusável.",
        fazSentido: "validar",
      },
    ];

    return res.status(200).json({
      generatedAt: new Date().toISOString(),
      priorities,
      attentions,
      accelerations,
      summary: {
        topScore: top[0]?.score ?? null,
        atrasosCount: atrasos.length,
        bloqueiosCount: bloqueios.length,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const stack = err instanceof Error ? (err.stack ?? "").slice(0, 1500) : null;
    // @ts-expect-error tipos do NotionError
    const notionStatus = err?.status ?? null;
    // @ts-expect-error tipos do NotionError
    const notionBody = err?.bodyText ? String(err.bodyText).slice(0, 800) : null;
    console.error("[brain/status]", message, stack);
    return res.status(500).json({
      error: "brain_status_failed",
      message,
      notionStatus,
      notionBody,
      stack,
    });
  }
}
