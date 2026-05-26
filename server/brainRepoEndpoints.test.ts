/**
 * api/brain/repo-info.test.ts
 *
 * Testes dos novos endpoints que consomem NowGoBrainRepository via fábrica.
 * Mocka a fábrica para não tocar em Notion/Postgres reais.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import type { VercelRequest, VercelResponse } from "@vercel/node";

// Mock da fábrica antes de importar os handlers
vi.mock("./brainRepositoryFactory.js", () => {
  return {
    getBrainRepository: () => ({
      name: "notion",
      healthCheck: vi.fn().mockResolvedValue(true),
      listOpportunities: vi.fn().mockResolvedValue([
        {
          id: "abc-123",
          nome: "Mock Opp",
          idHumano: "OPP-1",
          estagio: "Negociação",
          score: 95,
          valorEstimado: 1_000_000,
          probabilidade: 80,
          urgencia: "Alta",
          proximoFollowUp: "2026-06-01",
          agenteResponsavel: null,
          pontoTensao: null,
          criterioProximaFase: null,
          fortaleceTese: null,
          cluster: null,
          impactoEstrategico: null,
          empresaIds: 0,
          projetoIds: 0,
          decisor: null,
          contatoDecisor: null,
        },
      ]),
    }),
    resetBrainRepository: vi.fn(),
  };
});

// Helper para construir req/res Vercel-like
function mockReqRes(method: string, query: Record<string, string> = {}, headers: Record<string, string> = {}) {
  const req = {
    method,
    query,
    headers,
  } as unknown as VercelRequest;
  const res = {
    status: vi.fn(function (this: any) {
      return this;
    }),
    json: vi.fn(function (this: any, body: unknown) {
      this._body = body;
      return this;
    }),
  } as unknown as VercelResponse & { _body?: unknown };
  return { req, res: res as VercelResponse & { _body?: unknown }, statusFn: res.status as any, jsonFn: res.json as any };
}

describe("/api/brain/repo-info", () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
    vi.stubEnv("JARVIS_COCKPIT_SECRET", "");
    vi.stubEnv("NOWGO_BRAIN_PG_URL", ""); // força fallback do slug
    vi.stubEnv("NOWGO_BRAIN_REPO", "notion");
  });

  it("rejeita métodos diferentes de GET com 405", async () => {
    const { default: handler } = await import("../api/brain/repo-info.js");
    const { req, res, statusFn, jsonFn } = mockReqRes("POST");
    await handler(req, res);
    expect(statusFn).toHaveBeenCalledWith(405);
    expect(jsonFn).toHaveBeenCalledWith({ error: "method_not_allowed" });
  });

  it("retorna implementação ativa, healthy e contagem de oportunidades", async () => {
    const { default: handler } = await import("../api/brain/repo-info.js");
    const { req, res, statusFn, jsonFn } = mockReqRes("GET");
    await handler(req, res);
    expect(statusFn).toHaveBeenCalledWith(200);
    const body = (jsonFn as any).mock.calls[0][0];
    expect(body.activeImplementation).toBe("notion");
    expect(body.healthy).toBe(true);
    expect(body.smokeOpportunitiesCount).toBe(1);
    expect(body.internalTenant.slug).toBe("nowgo-ai");
    expect(body.pgUrlConfigured).toBe(false);
  });
});

describe("/api/brain/opportunities-via-repo", () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
    vi.stubEnv("JARVIS_COCKPIT_SECRET", "");
    vi.stubEnv("NOWGO_BRAIN_PG_URL", "");
    vi.stubEnv("NOWGO_BRAIN_REPO", "notion");
  });

  it("rejeita métodos diferentes de GET com 405", async () => {
    const { default: handler } = await import("../api/brain/opportunities-via-repo.js");
    const { req, res, statusFn } = mockReqRes("DELETE");
    await handler(req, res);
    expect(statusFn).toHaveBeenCalledWith(405);
  });

  it("retorna lista paginada via interface, com metadados de tracing", async () => {
    const { default: handler } = await import("../api/brain/opportunities-via-repo.js");
    const { req, res, statusFn, jsonFn } = mockReqRes("GET", { limit: "5" });
    await handler(req, res);
    expect(statusFn).toHaveBeenCalledWith(200);
    const body = (jsonFn as any).mock.calls[0][0];
    expect(body.via).toBe("notion");
    expect(body.count).toBe(1);
    expect(body.opportunities).toHaveLength(1);
    expect(body.opportunities[0].nome).toBe("Mock Opp");
    expect(body.limit).toBe(5);
  });

  it("clampa limit fora dos limites para o intervalo [1, 50]", async () => {
    const { default: handler } = await import("../api/brain/opportunities-via-repo.js");
    const { req, res, jsonFn } = mockReqRes("GET", { limit: "999" });
    await handler(req, res);
    const body = (jsonFn as any).mock.calls[0][0];
    expect(body.limit).toBe(50);
  });

  it("respeita scoreMin numérico e ignora valores inválidos", async () => {
    const { default: handler } = await import("../api/brain/opportunities-via-repo.js");
    const { req, res, jsonFn } = mockReqRes("GET", { scoreMin: "abc" });
    await handler(req, res);
    const body = (jsonFn as any).mock.calls[0][0];
    expect(body.scoreMin).toBeNull();
  });
});
