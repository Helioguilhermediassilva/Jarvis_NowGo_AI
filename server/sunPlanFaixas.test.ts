import { describe, it, expect } from "vitest";
import { getCurrentSunSnapshot } from "./sunPlan.js";

/**
 * F-Missoes — valida a reestruturação dos Deal Rooms em duas faixas
 * (Críticas de Execução vs. Estratégicas de Longo Prazo) e a coerência
 * de status após as correções de 02/06/2026.
 */
describe("SUN Deal Rooms — faixas de execução vs. estratégica", () => {
  const snap = getCurrentSunSnapshot();

  it("todo deal room declara uma faixa válida", () => {
    for (const dr of snap.dealRooms) {
      expect(["EXECUCAO", "ESTRATEGICA"]).toContain(dr.faixa);
    }
  });

  it("Dr. Roberto (Perícias Médicas) está em EXECUCAO e marcado como fechamento verbal", () => {
    const roberto = snap.dealRooms.find((dr) =>
      dr.nome.toLowerCase().includes("roberto"),
    );
    expect(roberto).toBeDefined();
    expect(roberto?.faixa).toBe("EXECUCAO");
    expect(roberto?.status.toLowerCase()).toContain("verbal");
  });

  it("Joás está em ESTRATEGICA e em fase de discovery (sem proposta prematura)", () => {
    const joas = snap.dealRooms.find((dr) =>
      dr.nome.toLowerCase().includes("joás") ||
      dr.nome.toLowerCase().includes("joas"),
    );
    expect(joas).toBeDefined();
    expect(joas?.faixa).toBe("ESTRATEGICA");
    expect(joas?.status.toLowerCase()).toContain("discovery");
    expect(joas?.status.toLowerCase()).not.toContain("proposta fase 1");
  });

  it("WLM está em ESTRATEGICA e em qualificação (sem term sheet)", () => {
    const wlm = snap.dealRooms.find((dr) =>
      dr.nome.toLowerCase().includes("wlm"),
    );
    expect(wlm).toBeDefined();
    expect(wlm?.faixa).toBe("ESTRATEGICA");
    expect(wlm?.status.toLowerCase()).not.toContain("term sheet");
    expect(wlm?.status.toLowerCase()).toContain("qualificação");
  });

  it("existe ao menos um deal room em cada faixa", () => {
    const exec = snap.dealRooms.filter((dr) => dr.faixa === "EXECUCAO");
    const estrat = snap.dealRooms.filter((dr) => dr.faixa === "ESTRATEGICA");
    expect(exec.length).toBeGreaterThan(0);
    expect(estrat.length).toBeGreaterThan(0);
  });

  it("o plano de 7 dias não menciona mais 'term sheet WLM' nem 'proposta fase 1 Joás'", () => {
    const txt = snap.proximos7Dias.map((d) => d.acao.toLowerCase()).join(" | ");
    expect(txt).not.toContain("term sheet wlm");
    expect(txt).not.toContain("proposta fase 1 joás");
  });
});
