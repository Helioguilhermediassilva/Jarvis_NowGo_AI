/**
 * server/financialKpis.ts
 *
 * NowGo Revenue Cockpit — cálculo de indicadores financeiros consolidados.
 *
 * Parâmetros estratégicos (v1.1, 22/mai/2026, confirmados pelo founder):
 *  - Meta 2026 (inicial): R$ 10.000.000
 *  - Realizado YTD (snapshot inicial): R$ 640.000
 *  - Ticket médio esperado pós-case GDF: R$ 10MM a R$ 12MM
 *  - Metodologia da perspectiva: ponderação por estágio do pipeline
 *
 * Probabilidades por estágio (padrão de mercado para forecasting):
 *  Lead         → 10%
 *  Qualificado  → 30%
 *  Proposta     → 60%
 *  Negociação   → 80%
 *  Fechado-Ganho → 100%
 *  Fechado-Perdido → 0%
 *
 * Tudo aqui é função pura — fácil de testar com dados sintéticos.
 */

import type { OportunidadeResumo } from "./brainQueries.js";
import type { PipelineStage } from "./brainSchema.js";

// ---------------------------------------------------------------------------
// Constantes estratégicas
// ---------------------------------------------------------------------------

// Meta inicial 2026 (revisado pelo founder em 22/mai/2026): R$ 10MM.
// Pode ser elevada conforme o pipeline maduro com tickets de R$ 10-12MM.
export const META_2026_BRL = 10_000_000;
export const REALIZADO_YTD_SNAPSHOT_BRL = 640_000;
export const TICKET_MEDIO_BRL = 11_000_000; // média entre R$ 10MM e R$ 12MM
export const ANO_CORRENTE = 2026;

export const STAGE_PROBABILITY: Record<PipelineStage, number> = {
  Lead: 0.1,
  Qualificado: 0.3,
  Proposta: 0.6,
  Negociação: 0.8,
  "Fechado-Ganho": 1.0,
  "Fechado-Perdido": 0.0,
};

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

export interface FinancialKpis {
  /** ISO timestamp da geração */
  generatedAt: string;
  ano: number;

  /** Meta anual em R$ */
  metaAnualBrl: number;

  /** Total já fechado (Fechado-Ganho) em R$ — YTD */
  realizadoYtdBrl: number;

  /** Volume total em pipeline aberto (Lead+Qualificado+Proposta+Negociação) em R$ */
  pipelineAbertoBrl: number;

  /** Perspectiva ponderada (forecast end-of-year): realizado + Σ(valor × prob_estágio) */
  perspectivaBrl: number;

  /** MRR — Receita Recorrente Mensal (soma de MRRs dos ativos não-Lost) em R$ */
  mrrTotalBrl: number;

  /** ARR — Receita Recorrente Anual (MRR × 12) em R$ */
  arrTotalBrl: number;

  /** Quantidade de deals com receita recorrente */
  dealsComRecorrencia: number;

  /** % atingido da meta com base no realizado YTD */
  pctMetaAtingida: number;

  /** % atingido da meta com base na perspectiva */
  pctMetaPerspectiva: number;

  /** Quanto falta para a meta em R$ */
  faltaParaMetaBrl: number;

  /** Quantos deals fechados ainda são necessários (com base no ticket médio) */
  dealsParaMeta: number;

  /** Contagens de oportunidades por estágio */
  contagens: {
    novasOportunidades: number; // status Lead criadas no mês corrente
    propostas: number; // estágio Proposta
    negociacoes: number; // estágio Negociação
    fechadasYtd: number; // Fechado-Ganho YTD
    perdidasYtd: number; // Fechado-Perdido YTD
    totalAtivas: number; // todas em estágio ativo
  };

  /** Ticket médio observado (média dos fechados YTD), pode ser null se não houver fechados */
  ticketMedioObservadoBrl: number | null;

  /** Ticket médio considerado para "deals para meta" */
  ticketMedioConsideradoBrl: number;

  /** Volume por missão SUN (id 1, 2, 3) */
  porMissao: {
    1: MissionKpi;
    2: MissionKpi;
    3: MissionKpi;
  };
}

export interface MissionKpi {
  pipelineAbertoBrl: number;
  realizadoYtdBrl: number;
  perspectivaBrl: number;
  contagem: number;
}

// ---------------------------------------------------------------------------
// Mapping oportunidade → missão SUN
// ---------------------------------------------------------------------------

/**
 * Heurística de mapeamento de oportunidade para missão SUN com base em
 * cluster / nome / palavras-chave. Para v1.0, a regra é simples e
 * pode ser refinada quando o snapshot SUN for dinâmico.
 *
 * Missão 1 (cyan) — Parcerias Internacionais e Setor Público
 * Missão 2 (verde) — Saúde, Saúde Hospitalar, Saúde Pública
 * Missão 3 (violeta) — Cidades, Smart Cities, Mobilidade Urbana, ESG
 */
export function classificarMissao(opp: OportunidadeResumo): 1 | 2 | 3 | null {
  const haystack = [
    opp.nome ?? "",
    opp.cluster ?? "",
    opp.estagio ?? "",
    opp.impactoEstrategico ?? "",
  ]
    .join(" ")
    .toLowerCase();

  if (
    /saúde|saude|hospital|hospitalar|paciente|prontu/.test(haystack)
  ) {
    return 2;
  }
  if (
    /cidade|smart\s*city|mobilidade|urbano|esg|sustentab|sociedad/.test(
      haystack,
    )
  ) {
    return 3;
  }
  // default: Missão 1 (parcerias internacionais e setor público)
  return 1;
}

// ---------------------------------------------------------------------------
// Função principal
// ---------------------------------------------------------------------------

export interface CalcularKpisInput {
  oportunidades: OportunidadeResumo[];
  /** Permite override do realizado YTD quando o Brain ainda não tem o
   *  histórico completo (usa snapshot inicial). */
  realizadoYtdOverrideBrl?: number;
  /** Permite override do ticket médio considerado. */
  ticketMedioOverrideBrl?: number;
  /** Permite override da meta. */
  metaAnualOverrideBrl?: number;
  /** Data de referência para "novas oportunidades do mês". Default: hoje. */
  hoje?: Date;
  /** Totais de receita recorrente (vem da ATIVOS CRM IA). */
  mrrTotalBrl?: number;
  arrTotalBrl?: number;
  dealsComRecorrencia?: number;
}

export function calcularKpis(input: CalcularKpisInput): FinancialKpis {
  const opps = input.oportunidades ?? [];
  const meta = input.metaAnualOverrideBrl ?? META_2026_BRL;
  const ticketConsiderado = input.ticketMedioOverrideBrl ?? TICKET_MEDIO_BRL;
  const hoje = input.hoje ?? new Date();
  const mesCorrente = hoje.getUTCMonth();
  const anoCorrente = hoje.getUTCFullYear();

  let pipelineAberto = 0;
  let realizadoBrain = 0;
  let perspectiva = 0;

  let novasOportunidades = 0;
  let propostas = 0;
  let negociacoes = 0;
  let fechadasYtd = 0;
  let perdidasYtd = 0;
  let totalAtivas = 0;

  let somaFechadasBrl = 0;

  const porMissao: FinancialKpis["porMissao"] = {
    1: { pipelineAbertoBrl: 0, realizadoYtdBrl: 0, perspectivaBrl: 0, contagem: 0 },
    2: { pipelineAbertoBrl: 0, realizadoYtdBrl: 0, perspectivaBrl: 0, contagem: 0 },
    3: { pipelineAbertoBrl: 0, realizadoYtdBrl: 0, perspectivaBrl: 0, contagem: 0 },
  };

  for (const opp of opps) {
    const valor = opp.valorEstimado ?? 0;
    const estagio = opp.estagio;
    const missao = classificarMissao(opp);
    if (missao) porMissao[missao].contagem += 1;

    if (estagio === "Fechado-Ganho") {
      realizadoBrain += valor;
      somaFechadasBrl += valor;
      fechadasYtd += 1;
      if (missao) porMissao[missao].realizadoYtdBrl += valor;
    } else if (estagio === "Fechado-Perdido") {
      perdidasYtd += 1;
    } else if (estagio) {
      pipelineAberto += valor;
      totalAtivas += 1;
      const prob = STAGE_PROBABILITY[estagio] ?? 0;
      perspectiva += valor * prob;

      if (missao) {
        porMissao[missao].pipelineAbertoBrl += valor;
        porMissao[missao].perspectivaBrl += valor * prob;
      }

      if (estagio === "Proposta") propostas += 1;
      if (estagio === "Negociação") negociacoes += 1;
    }

    // novas oportunidades = criadas no mês corrente E em estágio Lead
    if (estagio === "Lead" && opp.proximoFollowUp) {
      try {
        const dt = new Date(opp.proximoFollowUp);
        if (
          dt.getUTCMonth() === mesCorrente &&
          dt.getUTCFullYear() === anoCorrente
        ) {
          novasOportunidades += 1;
        }
      } catch {
        // ignora datas inválidas
      }
    }
  }

  // Realizado: usa Brain se houver, senão snapshot inicial
  const realizadoYtd =
    input.realizadoYtdOverrideBrl ??
    (realizadoBrain > 0 ? realizadoBrain : REALIZADO_YTD_SNAPSHOT_BRL);

  // Perspectiva = realizado + pipeline ponderado
  const perspectivaTotal = realizadoYtd + perspectiva;

  const faltaParaMeta = Math.max(0, meta - realizadoYtd);
  const dealsParaMeta = Math.max(
    0,
    Math.ceil(faltaParaMeta / Math.max(1, ticketConsiderado)),
  );

  const ticketObservado = fechadasYtd > 0 ? somaFechadasBrl / fechadasYtd : null;

  return {
    generatedAt: new Date().toISOString(),
    ano: anoCorrente,
    metaAnualBrl: meta,
    realizadoYtdBrl: realizadoYtd,
    pipelineAbertoBrl: pipelineAberto,
    perspectivaBrl: perspectivaTotal,
    mrrTotalBrl: input.mrrTotalBrl ?? 0,
    arrTotalBrl: input.arrTotalBrl ?? (input.mrrTotalBrl ?? 0) * 12,
    dealsComRecorrencia: input.dealsComRecorrencia ?? 0,
    pctMetaAtingida: meta > 0 ? (realizadoYtd / meta) * 100 : 0,
    pctMetaPerspectiva: meta > 0 ? (perspectivaTotal / meta) * 100 : 0,
    faltaParaMetaBrl: faltaParaMeta,
    dealsParaMeta,
    contagens: {
      novasOportunidades,
      propostas,
      negociacoes,
      fechadasYtd,
      perdidasYtd,
      totalAtivas,
    },
    ticketMedioObservadoBrl: ticketObservado,
    ticketMedioConsideradoBrl: ticketConsiderado,
    porMissao,
  };
}
