/**
 * Testes do scoring engine.
 *
 * Cobertura:
 *  • Exemplo canônico do blueprint (GDF/FAP-DF Fase 3 → 88,00 → foco_imediato)
 *  • Cortes de categoria (>85, ==85, ==60, <60)
 *  • Validação de domínio (vetores fora de [0,100], NaN, Infinity)
 *  • tryComputeOpportunityScore com campos ausentes retorna null
 *  • Paridade dos pesos com o blueprint (soma == 1.0)
 */
import { describe, it, expect } from "vitest";
import {
  SCORING_WEIGHTS,
  assertValidVectors,
  categoryFromScore,
  computeOpportunityScore,
  tryComputeOpportunityScore,
  type ScoringVectors,
} from "./scoringEngine";

describe("SCORING_WEIGHTS", () => {
  it("soma exatamente 1.0 (paridade com o blueprint operacional)", () => {
    const total =
      SCORING_WEIGHTS.urgency +
      SCORING_WEIGHTS.financialImpact +
      SCORING_WEIGHTS.strategicImpact +
      SCORING_WEIGHTS.risk +
      SCORING_WEIGHTS.dependency +
      SCORING_WEIGHTS.probability;
    // toFixed evita ruído de ponto flutuante.
    expect(Number(total.toFixed(10))).toBe(1.0);
  });

  it("respeita os pesos individuais oficiais", () => {
    expect(SCORING_WEIGHTS.urgency).toBe(0.2);
    expect(SCORING_WEIGHTS.financialImpact).toBe(0.25);
    expect(SCORING_WEIGHTS.strategicImpact).toBe(0.25);
    expect(SCORING_WEIGHTS.risk).toBe(0.1);
    expect(SCORING_WEIGHTS.dependency).toBe(0.1);
    expect(SCORING_WEIGHTS.probability).toBe(0.1);
  });
});

describe("computeOpportunityScore — exemplo canônico do blueprint", () => {
  it("GDF/FAP-DF Fase 3 produz 88,00 e categoria foco_imediato", () => {
    const vectors: ScoringVectors = {
      urgency: 70,
      financialImpact: 100,
      strategicImpact: 100,
      risk: 70,
      dependency: 70,
      probability: 100,
    };
    const result = computeOpportunityScore(vectors);
    expect(result.computedScore).toBe(88.0);
    expect(result.priorityCategory).toBe("foco_imediato");
  });
});

describe("categoryFromScore — cortes oficiais", () => {
  it("score 85.01 vira foco_imediato (estritamente > 85)", () => {
    expect(categoryFromScore(85.01)).toBe("foco_imediato");
  });

  it("score exatamente 85 vira radar_estrategico (corte exclusivo)", () => {
    expect(categoryFromScore(85)).toBe("radar_estrategico");
  });

  it("score exatamente 60 ainda é radar_estrategico (corte inclusivo)", () => {
    expect(categoryFromScore(60)).toBe("radar_estrategico");
  });

  it("score 59.99 cai em backlog", () => {
    expect(categoryFromScore(59.99)).toBe("backlog");
  });

  it("score 0 e 100 cobertos", () => {
    expect(categoryFromScore(0)).toBe("backlog");
    expect(categoryFromScore(100)).toBe("foco_imediato");
  });
});

describe("assertValidVectors — domínio [0,100]", () => {
  const base: ScoringVectors = {
    urgency: 50,
    financialImpact: 50,
    strategicImpact: 50,
    risk: 50,
    dependency: 50,
    probability: 50,
  };

  it("aceita 0 e 100 nos extremos", () => {
    expect(() =>
      assertValidVectors({ ...base, urgency: 0, probability: 100 }),
    ).not.toThrow();
  });

  it("rejeita valor negativo", () => {
    expect(() => assertValidVectors({ ...base, urgency: -1 })).toThrow(
      /urgency=-1/,
    );
  });

  it("rejeita valor maior que 100", () => {
    expect(() =>
      assertValidVectors({ ...base, financialImpact: 101 }),
    ).toThrow(/financialImpact=101/);
  });

  it("rejeita NaN", () => {
    expect(() => assertValidVectors({ ...base, risk: Number.NaN })).toThrow(
      /risk=NaN/,
    );
  });

  it("rejeita Infinity", () => {
    expect(() =>
      assertValidVectors({ ...base, dependency: Number.POSITIVE_INFINITY }),
    ).toThrow(/dependency=Infinity/);
  });

  it("acumula múltiplos campos inválidos no erro", () => {
    expect(() =>
      assertValidVectors({
        ...base,
        urgency: -5,
        risk: 200,
      }),
    ).toThrow(/urgency=-5.*risk=200|risk=200.*urgency=-5/);
  });
});

describe("tryComputeOpportunityScore — campo ausente", () => {
  it("retorna null se urgency está null", () => {
    expect(
      tryComputeOpportunityScore({
        urgency: null,
        financialImpact: 100,
        strategicImpact: 100,
        risk: 100,
        dependency: 100,
        probability: 100,
      }),
    ).toBeNull();
  });

  it("retorna null se algum campo está undefined", () => {
    expect(
      tryComputeOpportunityScore({
        urgency: 50,
        financialImpact: 50,
        strategicImpact: 50,
        risk: 50,
        dependency: 50,
        // probability ausente
      }),
    ).toBeNull();
  });

  it("calcula normalmente quando todos os 6 estão presentes", () => {
    const r = tryComputeOpportunityScore({
      urgency: 100,
      financialImpact: 100,
      strategicImpact: 100,
      risk: 100,
      dependency: 100,
      probability: 100,
    });
    expect(r).not.toBeNull();
    expect(r!.computedScore).toBe(100);
    expect(r!.priorityCategory).toBe("foco_imediato");
  });
});

describe("computeOpportunityScore — arredondamento para duas casas", () => {
  it("score 60 exato", () => {
    const r = computeOpportunityScore({
      urgency: 60,
      financialImpact: 60,
      strategicImpact: 60,
      risk: 60,
      dependency: 60,
      probability: 60,
    });
    expect(r.computedScore).toBe(60);
    expect(r.priorityCategory).toBe("radar_estrategico");
  });

  it("score com fração 0.025 deve arredondar como Postgres numeric(5,2)", () => {
    // Vetores escolhidos para gerar 73.025 antes do arredondamento
    const r = computeOpportunityScore({
      urgency: 73,
      financialImpact: 73,
      strategicImpact: 73,
      risk: 73,
      dependency: 73,
      probability: 73,
    });
    expect(r.computedScore).toBe(73);
    expect(r.priorityCategory).toBe("radar_estrategico");
  });
});
