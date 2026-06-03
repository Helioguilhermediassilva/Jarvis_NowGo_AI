/**
 * atualizarAtivoCrm.test.ts
 *
 * Testes do write-back na base ATIVOS CRM IA (fonte de verdade do funil).
 * Mocka notionBrain para capturar as propriedades enviadas ao Notion,
 * sem tocar em serviços reais.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

// Captura das chamadas a updatePage
const updateCalls: Array<{ pageId: string; props: Record<string, any> }> = [];

vi.mock("./notionBrain.js", () => ({
  updatePage: vi.fn(async (pageId: string, props: Record<string, any>) => {
    updateCalls.push({ pageId, props });
    return { id: pageId, properties: {} };
  }),
  createPage: vi.fn(async () => ({ id: "new-page", properties: {} })),
  archivePage: vi.fn(async () => ({ id: "archived" })),
  clearCache: vi.fn(() => {}),
}));

import {
  atualizarAtivoCrm,
  resolverAtivoCrmIa,
} from "./brainMutations.js";

beforeEach(() => {
  updateCalls.length = 0;
});

describe("atualizarAtivoCrm", () => {
  it("exige confirmedByUser=true", async () => {
    await expect(
      // @ts-expect-error teste de guarda de runtime
      atualizarAtivoCrm({ pageId: "p1", status: "Negotiation" }),
    ).rejects.toThrow(/confirmedByUser/);
  });

  it("exige pageId", async () => {
    await expect(
      atualizarAtivoCrm({ pageId: "", status: "Lead", confirmedByUser: true }),
    ).rejects.toThrow(/pageId/);
  });

  it("rejeita status CRM inválido", async () => {
    await expect(
      atualizarAtivoCrm({
        pageId: "p1",
        // @ts-expect-error valor fora do enum
        status: "EmNegociacao",
        confirmedByUser: true,
      }),
    ).rejects.toThrow(/Status CRM inválido/);
  });

  it("rejeita prioridade inválida", async () => {
    await expect(
      atualizarAtivoCrm({
        pageId: "p1",
        // @ts-expect-error valor fora do enum
        priority: "Urgente",
        confirmedByUser: true,
      }),
    ).rejects.toThrow(/Prioridade CRM inválida/);
  });

  it("rejeita valor negativo", async () => {
    await expect(
      atualizarAtivoCrm({
        pageId: "p1",
        estimatedValueBrl: -10,
        confirmedByUser: true,
      }),
    ).rejects.toThrow(/negativo/);
  });

  it("falha quando nenhum campo é fornecido", async () => {
    await expect(
      atualizarAtivoCrm({ pageId: "p1", confirmedByUser: true }),
    ).rejects.toThrow(/Nenhum campo/);
  });

  it("grava status, valor e prazo na database ATIVOS CRM IA", async () => {
    const res = await atualizarAtivoCrm({
      pageId: "dr-roberto",
      status: "Negotiation",
      estimatedValueBrl: 840000,
      expectedClose: "2026-07-01",
      confirmedByUser: true,
    });
    expect(res.updatedFields).toEqual(
      expect.arrayContaining(["status", "estimatedValue", "expectedClose"]),
    );
    expect(updateCalls).toHaveLength(1);
    const props = updateCalls[0].props;
    // Status mapeado para a property "Status" (select)
    expect(props["Status"]).toBeDefined();
    expect(props["Status"].select.name).toBe("Negotiation");
    // Valor na property "Estimated Value" (number)
    expect(props["Estimated Value"].number).toBe(840000);
    // Prazo em "Expected Close" (date)
    expect(props["Expected Close"].date.start).toBe("2026-07-01");
  });

  it("não envia classificacaoSun (derivada pelo blueprint)", async () => {
    await atualizarAtivoCrm({
      pageId: "x",
      status: "Proposal 👀",
      confirmedByUser: true,
    });
    const props = updateCalls[0].props;
    // Nenhuma property de classificação SUN deve ser escrita
    expect(JSON.stringify(props)).not.toMatch(/Classifica/i);
  });
});

describe("resolverAtivoCrmIa", () => {
  it("ganho=default marca Closed 💪", async () => {
    const res = await resolverAtivoCrmIa({
      pageId: "won",
      confirmedByUser: true,
    });
    expect(res.pageId).toBe("won");
    expect(updateCalls[0].props["Status"].select.name).toBe("Closed 💪");
  });

  it("ganho=false marca Lost", async () => {
    await resolverAtivoCrmIa({
      pageId: "lost",
      ganho: false,
      confirmedByUser: true,
    });
    expect(updateCalls[0].props["Status"].select.name).toBe("Lost");
  });

  it("exige confirmedByUser", async () => {
    await expect(
      // @ts-expect-error guarda de runtime
      resolverAtivoCrmIa({ pageId: "x" }),
    ).rejects.toThrow(/confirmedByUser/);
  });
});
