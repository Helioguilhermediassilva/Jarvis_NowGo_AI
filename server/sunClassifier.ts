/**
 * server/sunClassifier.ts
 *
 * Classificador SUN — implementa o "Sistema de Prioridade Inteligente" do
 * Blueprint Operacional NowGo AI (fonte: NowGo Brain → 🧠 Blueprint Operacional
 * → 🎯 Sistema de Prioridade Inteligente). Owner: Hélio Guilherme Dias Silva.
 *
 * Fórmula oficial (score 0-100):
 *   Score = U×0,20 + IF×0,25 + IE×0,25 + R×0,10 + D×0,10 + P×0,10
 *
 * Categorias do blueprint → 4 classes do cockpit:
 *   Score > 85  → 🔥 Foco Imediato     → "Missão Ativa"  (missões críticas / Deal Rooms)
 *   60 a 85     → 📡 Radar Estratégico → "Radar"
 *   < 60        → 📦 Backlog            → "Pausada"
 *   status Lost → (sempre)              → "Descartada"
 *
 * Missão/Visão NowGo (peso forte em Impacto Estratégico):
 *   Missão: "ser a camada operacional inteligente que conecta dados, cidadãos e
 *   serviços para um futuro melhor".
 *   Visão: "ser referência global em infraestrutura operacional soberana de IA
 *   para cidades, empresas e serviços públicos".
 *   → Oportunidades de Governo, Cidades, Saúde e Serviços Públicos recebem IE
 *     máximo (definem posicionamento setorial — núcleo da tese).
 */

import type { AtivoCrmResumo } from "./brainQueries.js";

/** As 4 classes canônicas do eixo SUN (espelha CLASSIFICACAO_SUN). */
export type SunClass = "Missão Ativa" | "Radar" | "Pausada" | "Descartada";

export interface SunVectors {
  /** Urgência (peso 20%). */
  U: number;
  /** Impacto Financeiro (peso 25%). */
  IF: number;
  /** Impacto Estratégico (peso 25%). */
  IE: number;
  /** Risco — invertido (peso 10%). */
  R: number;
  /** Dependências (peso 10%). */
  D: number;
  /** Probabilidade (peso 10%). */
  P: number;
}

export interface SunScoreResult {
  score: number;          // 0-100 (arredondado)
  classe: SunClass;       // classificação para o cockpit
  categoria: string;      // categoria literal do blueprint
  vetores: SunVectors;    // vetores usados (auditoria)
}

/** Pesos oficiais do blueprint. */
export const SUN_WEIGHTS = {
  U: 0.2,
  IF: 0.25,
  IE: 0.25,
  R: 0.1,
  D: 0.1,
  P: 0.1,
} as const;

// ---------------------------------------------------------------------------
// Normalização de status (ATIVOS CRM IA usa rótulos em inglês com emojis)
// ---------------------------------------------------------------------------

export type CrmStatusKind =
  | "lead"
  | "qualified"
  | "proposal"
  | "negotiation"
  | "closed"
  | "lost"
  | "unknown";

export function normalizeCrmStatus(status: string | null | undefined): CrmStatusKind {
  if (!status) return "unknown";
  const s = status.trim().toLowerCase();
  if (s.startsWith("lost") || s.includes("perdid")) return "lost";
  if (s.startsWith("closed") || s.includes("ganho") || s.includes("won")) return "closed";
  if (s.startsWith("negotiation") || s.includes("negocia")) return "negotiation";
  if (s.startsWith("proposal") || s.includes("proposta")) return "proposal";
  if (s.startsWith("qualified") || s.includes("qualific")) return "qualified";
  if (s.startsWith("lead")) return "lead";
  return "unknown";
}

// ---------------------------------------------------------------------------
// Vetores individuais (cada um 0-100), derivados de ATIVOS CRM IA
// ---------------------------------------------------------------------------

/** Probabilidade (P) ← status do funil. */
export function vetorProbabilidade(kind: CrmStatusKind): number {
  switch (kind) {
    case "closed":
      return 100; // contrato firmado
    case "negotiation":
      return 70; // aceite verbal / assinatura iminente
    case "proposal":
      return 40; // negociação avançada
    case "qualified":
      return 30;
    case "lead":
      return 10; // lead inicial
    default:
      return 10;
  }
}

/** Impacto Financeiro (IF) ← valor estimado (BRL). */
export function vetorImpactoFinanceiro(valorBrl: number | null | undefined): number {
  const v = valorBrl ?? 0;
  if (v >= 1_000_000) return 100; // ≥ R$ 1M
  if (v >= 250_000) return 70; // R$ 250k – 1M
  if (v >= 50_000) return 40; // R$ 50k – 250k
  if (v > 0) return 10; // < R$ 50k
  return 10; // sem valor monetizável direto
}

/** Urgência (U) ← dias até expectedClose. */
export function vetorUrgencia(
  expectedClose: string | null | undefined,
  now: Date = new Date(),
): number {
  if (!expectedClose) return 10; // sem prazo definido
  const d = new Date(expectedClose);
  if (isNaN(d.getTime())) return 10;
  const dias = Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (dias <= 7) return 100; // janela imediata (inclui prazos vencidos)
  if (dias <= 30) return 70;
  if (dias <= 90) return 40;
  return 10;
}

/**
 * Impacto Estratégico (IE) ← segmento/tipo, com peso forte na missão/visão
 * NowGo: Governo, Cidades, Saúde e Serviços Públicos = posicionamento setorial.
 */
const SEGMENTOS_NUCLEO = [
  "governo",
  "gov",
  "público",
  "publico",
  "public",
  "cidade",
  "smart city",
  "cidades",
  "saúde",
  "saude",
  "health",
  "hospital",
  "datasus",
  "ministério",
  "ministerio",
  "gdf",
  "prefeitura",
  "estado",
  "municíp",
  "municip",
];
const SEGMENTOS_ADJACENTE = [
  "enterprise",
  "empresa",
  "indústria",
  "industria",
  "corporate",
  "banco",
  "fintech",
  "varejo",
  "energia",
];

export function vetorImpactoEstrategico(
  type: string | null | undefined,
  company: string | null | undefined,
  priority: string | null | undefined,
): number {
  const hay = `${type ?? ""} ${company ?? ""}`.toLowerCase();
  if (SEGMENTOS_NUCLEO.some((k) => hay.includes(k))) return 100; // núcleo missão/visão
  if (SEGMENTOS_ADJACENTE.some((k) => hay.includes(k))) return 70; // mercado adjacente
  // sem segmento explícito: usa prioridade como proxy de relevância estratégica
  const p = (priority ?? "").toLowerCase();
  if (p === "high") return 70;
  if (p === "medium") return 40;
  return 40; // pontual, sem efeito multiplicador
}

/** Risco (R) — invertido ← prioridade como proxy (alta prioridade = mais controlado). */
export function vetorRisco(priority: string | null | undefined): number {
  const p = (priority ?? "").toLowerCase();
  if (p === "high") return 100; // risco baixo (foco, recursos alocados)
  if (p === "medium") return 70; // risco médio
  if (p === "low") return 40; // risco alto (baixa prioridade)
  return 70; // default risco médio quando não informado
}

/** Dependências (D) ← default 70 (1-2 controláveis) na ausência de dado específico. */
export function vetorDependencias(): number {
  return 70;
}

// ---------------------------------------------------------------------------
// Cálculo do score e da classe
// ---------------------------------------------------------------------------

export function calcularScore(v: SunVectors): number {
  const raw =
    v.U * SUN_WEIGHTS.U +
    v.IF * SUN_WEIGHTS.IF +
    v.IE * SUN_WEIGHTS.IE +
    v.R * SUN_WEIGHTS.R +
    v.D * SUN_WEIGHTS.D +
    v.P * SUN_WEIGHTS.P;
  return Math.round(raw);
}

export function categoriaDoScore(score: number): string {
  if (score > 85) return "🔥 Foco Imediato";
  if (score >= 60) return "📡 Radar Estratégico";
  return "📦 Backlog";
}

export function classeDoScore(score: number): SunClass {
  if (score > 85) return "Missão Ativa";
  if (score >= 60) return "Radar";
  return "Pausada";
}

/**
 * Classifica um ativo da ATIVOS CRM IA segundo o blueprint oficial.
 * Deals com status Lost são sempre "Descartada" (independente do score).
 */
export function classificarAtivoSun(
  a: Pick<
    AtivoCrmResumo,
    "status" | "priority" | "estimatedValueBrl" | "expectedClose" | "type" | "company"
  >,
  now: Date = new Date(),
): SunScoreResult {
  const kind = normalizeCrmStatus(a.status);

  const vetores: SunVectors = {
    U: vetorUrgencia(a.expectedClose, now),
    IF: vetorImpactoFinanceiro(a.estimatedValueBrl),
    IE: vetorImpactoEstrategico(a.type, a.company, a.priority),
    R: vetorRisco(a.priority),
    D: vetorDependencias(),
    P: vetorProbabilidade(kind),
  };

  const score = calcularScore(vetores);
  const categoria = categoriaDoScore(score);

  // Classe pelo score (blueprint puro).
  const classePorScore: SunClass = classeDoScore(score);

  // Piso de classe pelo estágio do funil: o status comercial é um sinal forte
  // de realidade que não pode ser "engolido" por valor/prazo ausentes no CRM.
  // Regra de negócio confirmada (Negotiation=quente, Proposal=morno):
  //  - Negotiation → no mínimo Missão Ativa
  //  - Proposal/Qualified → no mínimo Radar
  //  - Lead → Pausada (backlog real)
  //  - Lost → Descartada (sempre, acima de tudo)
  // O score do blueprint continua válido para PROMOVER acima do piso e para
  // ordenar dentro de cada classe.
  const classe: SunClass =
    kind === "lost"
      ? "Descartada"
      : aplicarPisoPorEstagio(kind, classePorScore);

  return { score, classe, categoria, vetores };
}

/** Ordem de força das classes (maior = mais prioritário). */
const CLASS_RANK: Record<SunClass, number> = {
  "Missão Ativa": 3,
  Radar: 2,
  Pausada: 1,
  Descartada: 0,
};

/**
 * Eleva a classe ao piso mínimo definido pelo estágio do funil, sem nunca
 * rebaixar uma classe que o score já elevou acima do piso.
 */
export function aplicarPisoPorEstagio(
  kind: CrmStatusKind,
  classePorScore: SunClass,
): SunClass {
  let piso: SunClass;
  switch (kind) {
    case "negotiation":
      piso = "Missão Ativa";
      break;
    case "proposal":
    case "qualified":
      piso = "Radar";
      break;
    case "lead":
      piso = "Pausada";
      break;
    default:
      piso = "Pausada";
  }
  return CLASS_RANK[classePorScore] >= CLASS_RANK[piso] ? classePorScore : piso;
}
