/**
 * sunSnapshotLive.test.ts
 *
 * Valida o Snapshot DINÂMICO construído a partir do NowGo Brain
 * (`buildSunSnapshotFromBrain`) e o reflexo nas estatísticas (`getSunStats`):
 *  - todas as oportunidades vivas do Brain entram no snapshot
 *  - classificação real do Brain prevalece; herda estática quando vazia
 *  - herda ação/contexto do snapshot estático no match por nome normalizado
 *  - itens estáticos sem correspondente vivo são preservados
 *  - versão vira "Live" e o total de oportunidades/missões bate com o Brain
 */

import { describe, it, expect } from "vitest";
import {
  buildSunSnapshotFromBrain,
  getSunStats,
  getCurrentSunSnapshot,
  type SunSnapshot,
  type SunOpportunity,
} from "./sunPlan.js";

const base: SunSnapshot = {
  ...getCurrentSunSnapshot(),
  versao: "1.0",
  oportunidades: [
    {
      nome: "Hospital 100% IA (Joás)",
      classificacao: "MISSAO_ATIVA",
      acao: "ação estática Joás",
      contexto: "portfolio",
    },
    {
      nome: "DPI soberana e interoperabilidade entre secretarias",
      classificacao: "MISSAO_ATIVA",
      acao: "ação smart city",
      contexto: "smart_city_2036",
    },
    {
      nome: "Oportunidade só no blueprint",
      classificacao: "PAUSADA",
      acao: "ação remanescente",
      contexto: "portfolio",
    },
  ] as SunOpportunity[],
};

describe("buildSunSnapshotFromBrain", () => {
  it("inclui TODAS as oportunidades vivas do Brain (inclusive novas)", () => {
    const out = buildSunSnapshotFromBrain(base, [
      { nome: "Dr. Roberto Rodrigues — NowGo Expert AI", classificacaoSun: "Missão Ativa" },
      { nome: "Cliente Totalmente Novo", classificacaoSun: "Radar" },
    ]);
    const nomes = out.oportunidades.map((o) => o.nome);
    expect(nomes).toContain("Dr. Roberto Rodrigues — NowGo Expert AI");
    expect(nomes).toContain("Cliente Totalmente Novo");
  });

  it("usa a classificação real do Brain", () => {
    const out = buildSunSnapshotFromBrain(base, [
      { nome: "Hospital 100% IA (Joás)", classificacaoSun: "Pausada" },
    ]);
    const joas = out.oportunidades.find((o) => o.nome.includes("Joás"));
    expect(joas?.classificacao).toBe("PAUSADA");
  });

  it("herda ação e contexto do snapshot estático no match por nome normalizado", () => {
    const out = buildSunSnapshotFromBrain(base, [
      // sem acento e sem parênteses: ainda casa com o estático
      { nome: "Hospital 100 IA Joas", classificacaoSun: "Radar" },
      { nome: "DPI soberana e interoperabilidade entre secretarias", classificacaoSun: "Missão Ativa" },
    ]);
    const joas = out.oportunidades.find((o) => /joas/i.test(o.nome));
    expect(joas?.acao).toBe("ação estática Joás");
    expect(joas?.contexto).toBe("portfolio");
    const dpi = out.oportunidades.find((o) => o.nome.startsWith("DPI"));
    expect(dpi?.contexto).toBe("smart_city_2036");
  });

  it("quando a classificação do Brain está vazia, herda a estática (ou RADAR se não houver)", () => {
    const out = buildSunSnapshotFromBrain(base, [
      { nome: "Hospital 100% IA (Joás)", classificacaoSun: null }, // herda MISSAO_ATIVA estática
      { nome: "Sem Classe E Sem Estático", classificacaoSun: "" }, // vira RADAR
    ]);
    expect(out.oportunidades.find((o) => o.nome.includes("Joás"))?.classificacao).toBe("MISSAO_ATIVA");
    expect(
      out.oportunidades.find((o) => o.nome === "Sem Classe E Sem Estático")?.classificacao,
    ).toBe("RADAR");
  });

  it("dá ação-padrão por classe para oportunidades novas sem match estático", () => {
    const out = buildSunSnapshotFromBrain(base, [
      { nome: "Cliente Novo Radar", classificacaoSun: "Radar" },
    ]);
    const novo = out.oportunidades.find((o) => o.nome === "Cliente Novo Radar");
    expect(novo?.acao).toMatch(/Radar/);
    expect(novo?.contexto).toBe("portfolio");
  });

  it("NÃO arrasta itens estáticos sem correspondente vivo no Brain (reflete o pipeline real)", () => {
    const out = buildSunSnapshotFromBrain(base, [
      { nome: "Hospital 100% IA (Joás)", classificacaoSun: "Radar" },
    ]);
    expect(
      out.oportunidades.find((o) => o.nome === "Oportunidade só no blueprint"),
    ).toBeFalsy();
    // Só a oportunidade viva do Brain entra.
    expect(out.oportunidades.length).toBe(1);
  });

  it("marca a versão como Live e fonte auto_jarvis", () => {
    const out = buildSunSnapshotFromBrain(base, [
      { nome: "X", classificacaoSun: "Radar" },
    ]);
    expect(out.versao).toBe("Live");
    expect(out.fonte).toBe("auto_jarvis");
  });

  it("não duplica uma oportunidade que existe no estático e no Brain", () => {
    const out = buildSunSnapshotFromBrain(base, [
      { nome: "Hospital 100% IA (Joás)", classificacaoSun: "Radar" },
    ]);
    const ocorrencias = out.oportunidades.filter((o) => o.nome.includes("Joás"));
    expect(ocorrencias.length).toBe(1);
  });
});

describe("paridade Snapshot x Brain Live", () => {
  it("produz exatamente uma oportunidade por linha viva do Brain (sem perdas)", () => {
    const brain = [
      { nome: "Alfa", classificacaoSun: "Missão Ativa" },
      { nome: "Beta", classificacaoSun: "Radar" },
      { nome: "Gama", classificacaoSun: "Pausada" },
      { nome: "Delta", classificacaoSun: null },
    ];
    const out = buildSunSnapshotFromBrain(base, brain);
    // A contagem do Snapshot bate 1:1 com o nº de linhas vivas do Brain.
    expect(out.oportunidades.length).toBe(brain.length);
    for (const b of brain) {
      expect(out.oportunidades.some((o) => o.nome === b.nome)).toBe(true);
    }
  });
});

describe("getSunStats no snapshot dinâmico", () => {
  it("totalOportunidades e totalMissoesAtivas refletem o Brain", () => {
    const out = buildSunSnapshotFromBrain(base, [
      { nome: "Dr. Roberto", classificacaoSun: "Missão Ativa" },
      { nome: "GDF/FAP-DF", classificacaoSun: "Missão Ativa" },
      { nome: "Cliente Radar", classificacaoSun: "Radar" },
    ]);
    const stats = getSunStats(out);
    // Apenas as 3 oportunidades vivas do Brain (sem arraste do blueprint).
    expect(stats.totalOportunidades).toBe(3);
    // 2 classificadas como Missão Ativa.
    expect(stats.totalMissoesAtivas).toBe(2);
  });
});
