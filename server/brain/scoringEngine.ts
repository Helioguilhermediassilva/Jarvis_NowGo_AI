/**
 * server/brain/scoringEngine.ts
 *
 * Implementa a fórmula oficial do **Blueprint Operacional NowGo Brain**:
 *
 *   Score = U·0,20 + IF·0,25 + IE·0,25 + R·0,10 + D·0,10 + P·0,10
 *
 * Categorias derivadas:
 *   • Score > 85   → "foco_imediato"      (🔥 Deal Room ativo)
 *   • 60 ≤ S ≤ 85  → "radar_estrategico"  (📡 Pipeline / revisão semanal)
 *   • Score < 60   → "backlog"            (📦 Ideia / revisão mensal)
 *
 * Esta função é PURA: não toca banco, não importa Drizzle, não tem efeito
 * colateral. É a contrapartida TypeScript do trigger SQL
 * `nowgo_brain.recompute_opportunity_score()` aplicado na migração 0005.
 *
 * Manter os dois lados em sintonia é responsabilidade dos testes vitest
 * em `scoringEngine.test.ts` e do smoke test que compara o cálculo TS contra
 * o resultado retornado pelo banco para o mesmo input.
 */

export type PriorityCategory =
  | "foco_imediato"
  | "radar_estrategico"
  | "backlog";

/**
 * Vetores de scoring (cada um no intervalo [0, 100]).
 * Corresponde exatamente às colunas adicionadas em `opportunities` na F47.
 */
export interface ScoringVectors {
  /** Urgência — prazo contratual ou janela de oportunidade. Peso 20%. */
  urgency: number;
  /** Impacto financeiro — receita esperada × probabilidade. Peso 25%. */
  financialImpact: number;
  /** Impacto estratégico — alinhamento com tese de longo prazo. Peso 25%. */
  strategicImpact: number;
  /** Risco — invertido na semântica de negócio, mas armazenado direto. Peso 10%. */
  risk: number;
  /** Dependências — bloqueios externos (alta dependência reduz score). Peso 10%. */
  dependency: number;
  /** Probabilidade — likelihood de fechamento. Peso 10%. */
  probability: number;
}

export interface ScoringResult {
  /** Score 0..100 com duas casas decimais (round-half-to-even via toFixed). */
  computedScore: number;
  /** Categoria derivada conforme cortes do blueprint. */
  priorityCategory: PriorityCategory;
}

/**
 * Pesos oficiais. NÃO mude sem alinhamento com o blueprint operacional
 * em `🎯 Sistema de Prioridade Inteligente` no Notion da NowGo Brain.
 */
export const SCORING_WEIGHTS = {
  urgency: 0.2,
  financialImpact: 0.25,
  strategicImpact: 0.25,
  risk: 0.1,
  dependency: 0.1,
  probability: 0.1,
} as const;

/**
 * Verifica que cada vetor está no intervalo [0, 100]. Lança `Error` com
 * detalhes do(s) campo(s) inválido(s) — garantindo falha rápida no backend
 * antes de persistir lixo no Postgres (que tem CHECK constraint equivalente).
 */
export function assertValidVectors(v: ScoringVectors): void {
  const invalid: string[] = [];
  for (const [key, value] of Object.entries(v) as Array<
    [keyof ScoringVectors, number]
  >) {
    if (typeof value !== "number" || Number.isNaN(value)) {
      invalid.push(`${key}=NaN`);
    } else if (!Number.isFinite(value)) {
      invalid.push(`${key}=Infinity`);
    } else if (value < 0 || value > 100) {
      invalid.push(`${key}=${value}`);
    }
  }
  if (invalid.length > 0) {
    throw new Error(
      `scoringEngine: vetores fora do intervalo [0,100]: ${invalid.join(", ")}`,
    );
  }
}

/**
 * Aplica a fórmula oficial e arredonda para duas casas decimais.
 * Usa o mesmo arredondamento que o `numeric(5,2)` do Postgres
 * (round-half-away-from-zero) para garantir paridade com o trigger SQL.
 */
function roundToTwo(value: number): number {
  // Number.parseFloat(value.toFixed(2)) reproduz exatamente o comportamento
  // do `round(numeric, 2)` do Postgres para entradas no nosso domínio
  // (0..100, três decimais no máximo).
  return Number.parseFloat(value.toFixed(2));
}

/**
 * Mapeia o score numérico para a categoria de prioridade conforme cortes
 * oficiais do blueprint. Os cortes são INCLUSIVOS na borda inferior:
 *   score >  85   → foco_imediato
 *   score >= 60   → radar_estrategico
 *   score <  60   → backlog
 */
export function categoryFromScore(score: number): PriorityCategory {
  if (score > 85) return "foco_imediato";
  if (score >= 60) return "radar_estrategico";
  return "backlog";
}

/**
 * Calcula score e categoria para um conjunto de vetores válidos.
 * Função pura — chame à vontade no servidor, sem efeito colateral.
 */
export function computeOpportunityScore(v: ScoringVectors): ScoringResult {
  assertValidVectors(v);
  const raw =
    v.urgency * SCORING_WEIGHTS.urgency +
    v.financialImpact * SCORING_WEIGHTS.financialImpact +
    v.strategicImpact * SCORING_WEIGHTS.strategicImpact +
    v.risk * SCORING_WEIGHTS.risk +
    v.dependency * SCORING_WEIGHTS.dependency +
    v.probability * SCORING_WEIGHTS.probability;
  const computedScore = roundToTwo(raw);
  return {
    computedScore,
    priorityCategory: categoryFromScore(computedScore),
  };
}

/**
 * Variante tolerante: aceita os 6 vetores como `number | null | undefined`
 * (ex: oportunidade ainda em rascunho, sem todos os campos preenchidos).
 * Retorna `null` quando algum vetor está ausente, replicando a lógica do
 * trigger SQL que nesses casos zera `computed_score` e `priority_category`.
 */
export function tryComputeOpportunityScore(
  partial: Partial<Record<keyof ScoringVectors, number | null | undefined>>,
): ScoringResult | null {
  const keys: Array<keyof ScoringVectors> = [
    "urgency",
    "financialImpact",
    "strategicImpact",
    "risk",
    "dependency",
    "probability",
  ];
  const complete: Partial<ScoringVectors> = {};
  for (const k of keys) {
    const v = partial[k];
    if (v === null || v === undefined) return null;
    complete[k] = v;
  }
  return computeOpportunityScore(complete as ScoringVectors);
}
