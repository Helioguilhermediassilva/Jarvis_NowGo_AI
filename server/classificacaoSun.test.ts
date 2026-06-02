/**
 * classificacaoSun.test.ts
 *
 * Valida a lógica do eixo de Classificação SUN que torna o cockpit interativo:
 *  - default seguro (sem classificação -> Radar)
 *  - filtro que mantém oportunidades fora de foco (Pausada/Descartada) longe
 *    do Top Deal Rooms, sem derrubar as não-classificadas
 *  - o conjunto canônico de classificações
 */

import { describe, it, expect } from "vitest";
import { CLASSIFICACAO_SUN } from "./brainSchema.js";

/** Mesma regra de default usada no frontend (BrainPipelineLive). */
function classDefault(c: string | null | undefined): string {
  return c && (CLASSIFICACAO_SUN as readonly string[]).includes(c)
    ? c
    : "Radar";
}

/**
 * Espelha o critério do filtro Notion `does_not_equal "Pausada"/"Descartada"`:
 * registros sem classificação (null) permanecem elegíveis; apenas os
 * explicitamente Pausada/Descartada são excluídos.
 */
function elegivelParaDealRoom(classificacao: string | null): boolean {
  if (classificacao === "Pausada" || classificacao === "Descartada") {
    return false;
  }
  return true;
}

describe("Classificação SUN — conjunto canônico", () => {
  it("contém exatamente as 4 classificações esperadas", () => {
    expect([...CLASSIFICACAO_SUN]).toEqual([
      "Missão Ativa",
      "Radar",
      "Pausada",
      "Descartada",
    ]);
  });
});

describe("classDefault", () => {
  it("retorna Radar para valores nulos/indefinidos/vazios", () => {
    expect(classDefault(null)).toBe("Radar");
    expect(classDefault(undefined)).toBe("Radar");
    expect(classDefault("")).toBe("Radar");
  });

  it("retorna Radar para valores inválidos", () => {
    expect(classDefault("Foo")).toBe("Radar");
  });

  it("preserva valores válidos", () => {
    expect(classDefault("Missão Ativa")).toBe("Missão Ativa");
    expect(classDefault("Pausada")).toBe("Pausada");
    expect(classDefault("Descartada")).toBe("Descartada");
  });
});

describe("elegibilidade para Top Deal Rooms (filtro SUN)", () => {
  it("exclui Pausada e Descartada", () => {
    expect(elegivelParaDealRoom("Pausada")).toBe(false);
    expect(elegivelParaDealRoom("Descartada")).toBe(false);
  });

  it("mantém Missão Ativa e Radar", () => {
    expect(elegivelParaDealRoom("Missão Ativa")).toBe(true);
    expect(elegivelParaDealRoom("Radar")).toBe(true);
  });

  it("mantém oportunidades sem classificação (null)", () => {
    expect(elegivelParaDealRoom(null)).toBe(true);
  });
});
