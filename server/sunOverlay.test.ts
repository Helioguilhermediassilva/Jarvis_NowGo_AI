/**
 * sunOverlay.test.ts
 *
 * Valida o overlay que faz o Snapshot do cockpit refletir as classificações
 * reais do NowGo Brain:
 *  - normalização de nomes (acentos/pontuação/caixa)
 *  - mapeamento ClassificacaoSun (PT) -> SunClass (enum)
 *  - sobreposição por nome homônimo, preservando ação e itens sem match
 */

import { describe, it, expect } from "vitest";
import {
  normalizeOppName,
  classificacaoSunToSunClass,
  applySunClassificationFromBrain,
  getCurrentSunSnapshot,
  type SunSnapshot,
  type SunOpportunity,
} from "./sunPlan.js";

describe("normalizeOppName", () => {
  it("remove acentos, pontuação e normaliza espaços/caixa", () => {
    expect(normalizeOppName("Hospital 100% IA (Joás)")).toBe(
      "hospital 100 ia joas",
    );
    expect(normalizeOppName("WLM — NowGo Voice + Produto")).toBe(
      "wlm nowgo voice produto",
    );
    expect(normalizeOppName("  Cemel —   30+  clínicas ")).toBe(
      "cemel 30 clinicas",
    );
  });

  it("é estável (idempotente) e tolera vazio", () => {
    expect(normalizeOppName("")).toBe("");
    const once = normalizeOppName("Smart City/CODHAB Habitação");
    expect(normalizeOppName(once)).toBe(once);
  });
});

describe("classificacaoSunToSunClass", () => {
  it("mapeia os 4 rótulos PT do Notion para o enum", () => {
    expect(classificacaoSunToSunClass("Missão Ativa")).toBe("MISSAO_ATIVA");
    expect(classificacaoSunToSunClass("Radar")).toBe("RADAR");
    expect(classificacaoSunToSunClass("Pausada")).toBe("PAUSADA");
    expect(classificacaoSunToSunClass("Descartada")).toBe("DESCARTADA");
  });

  it("retorna null para vazio/desconhecido (mantém estático)", () => {
    expect(classificacaoSunToSunClass(null)).toBeNull();
    expect(classificacaoSunToSunClass(undefined)).toBeNull();
    expect(classificacaoSunToSunClass("")).toBeNull();
    expect(classificacaoSunToSunClass("Foo")).toBeNull();
  });
});

describe("applySunClassificationFromBrain", () => {
  const base: SunSnapshot = {
    ...getCurrentSunSnapshot(),
    oportunidades: [
      { nome: "Hospital 100% IA (Joás)", classificacao: "MISSAO_ATIVA", acao: "ação A" },
      { nome: "WLM — NowGo Voice + Produto", classificacao: "MISSAO_ATIVA", acao: "ação B" },
      { nome: "Ericsson", classificacao: "RADAR", acao: "ação C" },
    ] as SunOpportunity[],
  };

  it("sobrepõe a classe quando o Brain tem classificação preenchida (match por nome normalizado)", () => {
    const out = applySunClassificationFromBrain(base, [
      { nome: "Hospital 100% IA (Joas)", classificacaoSun: "Radar" }, // sem acento
      { nome: "WLM NowGo Voice Produto", classificacaoSun: "Pausada" }, // sem pontuação
    ]);
    expect(out.oportunidades.find((o) => o.nome.includes("Joás"))?.classificacao).toBe("RADAR");
    expect(out.oportunidades.find((o) => o.nome.startsWith("WLM"))?.classificacao).toBe("PAUSADA");
  });

  it("preserva a ação operacional estática ao trocar a classe", () => {
    const out = applySunClassificationFromBrain(base, [
      { nome: "Hospital 100% IA (Joás)", classificacaoSun: "Descartada" },
    ]);
    const joas = out.oportunidades.find((o) => o.nome.includes("Joás"));
    expect(joas?.classificacao).toBe("DESCARTADA");
    expect(joas?.acao).toBe("ação A");
  });

  it("não altera itens sem match no Brain", () => {
    const out = applySunClassificationFromBrain(base, [
      { nome: "Oportunidade Inexistente", classificacaoSun: "Pausada" },
    ]);
    expect(out.oportunidades.find((o) => o.nome === "Ericsson")?.classificacao).toBe("RADAR");
  });

  it("ignora classificações vazias do Brain (mantém estático)", () => {
    const out = applySunClassificationFromBrain(base, [
      { nome: "Ericsson", classificacaoSun: null },
    ]);
    expect(out.oportunidades.find((o) => o.nome === "Ericsson")?.classificacao).toBe("RADAR");
  });

  it("retorna o snapshot original quando não há classificações vivas", () => {
    const out = applySunClassificationFromBrain(base, []);
    expect(out).toBe(base);
  });
});
