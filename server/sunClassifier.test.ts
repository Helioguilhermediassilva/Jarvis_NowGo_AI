import { describe, it, expect } from "vitest";
import {
  classificarAtivoSun,
  calcularScore,
  categoriaDoScore,
  classeDoScore,
  normalizeCrmStatus,
  vetorProbabilidade,
  vetorImpactoFinanceiro,
  vetorUrgencia,
  vetorImpactoEstrategico,
  vetorRisco,
  SUN_WEIGHTS,
} from "./sunClassifier.js";

describe("normalizeCrmStatus", () => {
  it("reconhece os rótulos do ATIVOS CRM IA (inglês + emojis)", () => {
    expect(normalizeCrmStatus("Negotiation")).toBe("negotiation");
    expect(normalizeCrmStatus("Proposal 👀")).toBe("proposal");
    expect(normalizeCrmStatus("Closed 💪")).toBe("closed");
    expect(normalizeCrmStatus("Lost")).toBe("lost");
    expect(normalizeCrmStatus("Qualified")).toBe("qualified");
    expect(normalizeCrmStatus("Lead")).toBe("lead");
    expect(normalizeCrmStatus(null)).toBe("unknown");
  });
});

describe("vetores individuais", () => {
  it("probabilidade segue o funil", () => {
    expect(vetorProbabilidade("closed")).toBe(100);
    expect(vetorProbabilidade("negotiation")).toBe(70);
    expect(vetorProbabilidade("proposal")).toBe(40);
    expect(vetorProbabilidade("lead")).toBe(10);
  });

  it("impacto financeiro por faixa de valor", () => {
    expect(vetorImpactoFinanceiro(2_000_000)).toBe(100);
    expect(vetorImpactoFinanceiro(300_000)).toBe(70);
    expect(vetorImpactoFinanceiro(80_000)).toBe(40);
    expect(vetorImpactoFinanceiro(10_000)).toBe(10);
    expect(vetorImpactoFinanceiro(null)).toBe(10);
  });

  it("urgência por dias até o fechamento", () => {
    const now = new Date("2026-06-01T00:00:00Z");
    expect(vetorUrgencia("2026-06-05", now)).toBe(100); // <=7d
    expect(vetorUrgencia("2026-06-20", now)).toBe(70); // <=30d
    expect(vetorUrgencia("2026-08-01", now)).toBe(40); // <=90d
    expect(vetorUrgencia("2027-01-01", now)).toBe(10); // >90d
    expect(vetorUrgencia(null, now)).toBe(10);
  });

  it("impacto estratégico máximo para segmentos do núcleo da missão/visão", () => {
    expect(vetorImpactoEstrategico("Governo", "Secretaria X", "Low")).toBe(100);
    expect(vetorImpactoEstrategico("Health", "Hospital Y", "Low")).toBe(100);
    expect(vetorImpactoEstrategico("Smart City", "Prefeitura Z", "Low")).toBe(100);
    expect(vetorImpactoEstrategico("Enterprise", "Banco W", "Low")).toBe(70);
    expect(vetorImpactoEstrategico(null, "Cliente XPTO", "High")).toBe(70);
    expect(vetorImpactoEstrategico(null, "Cliente XPTO", "Low")).toBe(40);
  });

  it("risco invertido pela prioridade", () => {
    expect(vetorRisco("High")).toBe(100);
    expect(vetorRisco("Medium")).toBe(70);
    expect(vetorRisco("Low")).toBe(40);
    expect(vetorRisco(null)).toBe(70);
  });
});

describe("calcularScore", () => {
  it("aplica os pesos oficiais do blueprint", () => {
    const v = { U: 100, IF: 100, IE: 100, R: 100, D: 100, P: 100 };
    expect(calcularScore(v)).toBe(100);
    const soma =
      SUN_WEIGHTS.U +
      SUN_WEIGHTS.IF +
      SUN_WEIGHTS.IE +
      SUN_WEIGHTS.R +
      SUN_WEIGHTS.D +
      SUN_WEIGHTS.P;
    expect(soma).toBeCloseTo(1, 5);
  });
});

describe("categoria e classe por score", () => {
  it("mapeia faixas do blueprint", () => {
    expect(categoriaDoScore(90)).toBe("🔥 Foco Imediato");
    expect(categoriaDoScore(70)).toBe("📡 Radar Estratégico");
    expect(categoriaDoScore(50)).toBe("📦 Backlog");
    expect(classeDoScore(90)).toBe("Missão Ativa");
    expect(classeDoScore(70)).toBe("Radar");
    expect(classeDoScore(50)).toBe("Pausada");
  });
});

describe("aplicarPisoPorEstagio + classificarAtivoSun com piso", () => {
  const now = new Date("2026-06-01T00:00:00Z");

  it("Negotiation tem piso Missão Ativa mesmo com valor/prazo ausentes", () => {
    const r = classificarAtivoSun(
      {
        status: "Negotiation",
        priority: "Medium",
        estimatedValueBrl: null,
        expectedClose: null,
        type: null,
        company: "Cliente sem dados",
      },
      now,
    );
    expect(r.classe).toBe("Missão Ativa");
  });

  it("Proposal tem piso Radar mesmo com score baixo", () => {
    const r = classificarAtivoSun(
      {
        status: "Proposal",
        priority: "Low",
        estimatedValueBrl: 10_000,
        expectedClose: null,
        type: null,
        company: "Cliente XPTO",
      },
      now,
    );
    expect(r.classe).toBe("Radar");
  });

  it("Lead permanece Pausada (backlog real)", () => {
    const r = classificarAtivoSun(
      {
        status: "Lead",
        priority: "Low",
        estimatedValueBrl: 10_000,
        expectedClose: null,
        type: null,
        company: "Lead frio",
      },
      now,
    );
    expect(r.classe).toBe("Pausada");
  });

  it("score alto promove acima do piso (Proposal de Governo vira Missão Ativa)", () => {
    const r = classificarAtivoSun(
      {
        status: "Proposal",
        priority: "High",
        estimatedValueBrl: 2_000_000,
        expectedClose: "2026-06-05",
        type: "Governo",
        company: "GDF",
      },
      now,
    );
    expect(r.classe).toBe("Missão Ativa");
    expect(r.score).toBeGreaterThan(85);
  });
});

describe("classificarAtivoSun (ponta a ponta)", () => {
  const now = new Date("2026-06-01T00:00:00Z");

  it("deal de Governo em Negociação, alto valor e prazo curto vira Missão Ativa", () => {
    const r = classificarAtivoSun(
      {
        status: "Negotiation",
        priority: "High",
        estimatedValueBrl: 2_000_000,
        expectedClose: "2026-06-05",
        type: "Governo",
        company: "GDF",
      },
      now,
    );
    expect(r.classe).toBe("Missão Ativa");
    expect(r.score).toBeGreaterThan(85);
  });

  it("status Lost é sempre Descartada, independente do score", () => {
    const r = classificarAtivoSun(
      {
        status: "Lost",
        priority: "High",
        estimatedValueBrl: 5_000_000,
        expectedClose: "2026-06-02",
        type: "Governo",
        company: "Mega Deal",
      },
      now,
    );
    expect(r.classe).toBe("Descartada");
  });

  it("lead inicial pequeno e sem prazo cai em Pausada (Backlog)", () => {
    const r = classificarAtivoSun(
      {
        status: "Lead",
        priority: "Low",
        estimatedValueBrl: 10_000,
        expectedClose: null,
        type: "Enterprise",
        company: "Startup pequena",
      },
      now,
    );
    expect(r.classe).toBe("Pausada");
    expect(r.score).toBeLessThan(60);
  });

  it("segmento do núcleo eleva o score mesmo com prioridade média", () => {
    const gov = classificarAtivoSun(
      {
        status: "Proposal",
        priority: "Medium",
        estimatedValueBrl: 300_000,
        expectedClose: "2026-06-20",
        type: "Saúde",
        company: "Hospital Regional",
      },
      now,
    );
    const enterprise = classificarAtivoSun(
      {
        status: "Proposal",
        priority: "Medium",
        estimatedValueBrl: 300_000,
        expectedClose: "2026-06-20",
        type: "Enterprise",
        company: "Indústria genérica",
      },
      now,
    );
    expect(gov.score).toBeGreaterThan(enterprise.score);
  });
});
