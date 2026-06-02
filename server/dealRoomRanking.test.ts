import { describe, it, expect } from "vitest";
import {
  pesoClassificacaoSun,
  rankearDealRooms,
  type OportunidadeResumo,
} from "./brainQueries";

// Fábrica mínima de oportunidades para os testes de ranking.
function opp(partial: Partial<OportunidadeResumo>): OportunidadeResumo {
  return {
    id: partial.id ?? Math.random().toString(36).slice(2),
    nome: partial.nome ?? "Oportunidade",
    idHumano: partial.idHumano ?? null,
    estagio: partial.estagio ?? null,
    score: partial.score ?? null,
    valorEstimado: partial.valorEstimado ?? null,
    probabilidade: partial.probabilidade ?? null,
    urgencia: partial.urgencia ?? null,
    proximoFollowUp: partial.proximoFollowUp ?? null,
    agenteResponsavel: partial.agenteResponsavel ?? null,
    pontoTensao: partial.pontoTensao ?? null,
    criterioProximaFase: partial.criterioProximaFase ?? null,
    fortaleceTese: partial.fortaleceTese ?? null,
    cluster: partial.cluster ?? null,
    impactoEstrategico: partial.impactoEstrategico ?? null,
    empresaIds: partial.empresaIds ?? 0,
    projetoIds: partial.projetoIds ?? 0,
    classificacaoSun: partial.classificacaoSun ?? null,
  };
}

describe("pesoClassificacaoSun", () => {
  it("ordena Missão Ativa > Radar > sem classificação > Pausada > Descartada", () => {
    expect(pesoClassificacaoSun("Missão Ativa")).toBeGreaterThan(
      pesoClassificacaoSun("Radar"),
    );
    expect(pesoClassificacaoSun("Radar")).toBeGreaterThan(
      pesoClassificacaoSun(null),
    );
    expect(pesoClassificacaoSun(null)).toBeGreaterThan(
      pesoClassificacaoSun("Pausada"),
    );
    expect(pesoClassificacaoSun("Pausada")).toBeGreaterThan(
      pesoClassificacaoSun("Descartada"),
    );
  });

  it("tolera espaços extras na classificação", () => {
    expect(pesoClassificacaoSun("  Missão Ativa  ")).toBe(
      pesoClassificacaoSun("Missão Ativa"),
    );
  });
});

describe("rankearDealRooms", () => {
  it("coloca Missão Ativa SEM score à frente de Radar com score alto", () => {
    const roberto = opp({
      id: "roberto",
      nome: "Dr. Roberto Rodrigues",
      classificacaoSun: "Missão Ativa",
      score: null, // Verbal Closed, sem Score preenchido
      valorEstimado: 840000,
    });
    const radarAlto = opp({
      id: "radar",
      nome: "Radar com score alto",
      classificacaoSun: "Radar",
      score: 95,
      valorEstimado: 500000,
    });
    const ranked = rankearDealRooms([radarAlto, roberto]);
    expect(ranked[0].id).toBe("roberto");
    expect(ranked[1].id).toBe("radar");
  });

  it("dentro da mesma faixa SUN, ordena por Score desc e depois Valor desc", () => {
    const a = opp({ id: "a", classificacaoSun: "Missão Ativa", score: 80, valorEstimado: 100000 });
    const b = opp({ id: "b", classificacaoSun: "Missão Ativa", score: 90, valorEstimado: 100000 });
    const c = opp({ id: "c", classificacaoSun: "Missão Ativa", score: 90, valorEstimado: 300000 });
    const ranked = rankearDealRooms([a, b, c]);
    expect(ranked.map((o) => o.id)).toEqual(["c", "b", "a"]);
  });

  it("Dr. Roberto (Missão Ativa) aparece no Top 5 mesmo cercado de Radares fortes", () => {
    const roberto = opp({ id: "roberto", classificacaoSun: "Missão Ativa", score: 43.7 });
    const radares = Array.from({ length: 10 }, (_, i) =>
      opp({ id: `radar-${i}`, classificacaoSun: "Radar", score: 99 - i }),
    );
    const top5 = rankearDealRooms([...radares, roberto]).slice(0, 5);
    expect(top5.some((o) => o.id === "roberto")).toBe(true);
    expect(top5[0].id).toBe("roberto");
  });

  it("não muta o array de entrada", () => {
    const entrada = [
      opp({ id: "x", classificacaoSun: "Radar", score: 50 }),
      opp({ id: "y", classificacaoSun: "Missão Ativa", score: 10 }),
    ];
    const copia = [...entrada];
    rankearDealRooms(entrada);
    expect(entrada.map((o) => o.id)).toEqual(copia.map((o) => o.id));
  });
});
