/**
 * server/brain.integration.test.ts
 *
 * Teste de integração REAL contra o NowGo Brain (Notion API).
 *
 * Requer NOTION_API_KEY no ambiente. Caso ausente, o teste é skippado.
 * Não escreve nada no Brain — apenas leitura.
 */
import { describe, it, expect } from "vitest";
import {
  listarOportunidadesQuentes,
  listarTopPorScore,
  listarProjetosAtivos,
  listarTarefasPendentes,
} from "./brainQueries";
import { listDatabases } from "./notionBrain";
import { BRAIN_DATABASES } from "./brainSchema";

const hasToken = !!process.env.NOTION_API_KEY;

describe.skipIf(!hasToken)("NowGo Brain — leitura real", () => {
  it("lista bases acessíveis e inclui as canônicas críticas", async () => {
    const dbs = await listDatabases();
    const ids = new Set(dbs.map((d) => d.id.replace(/-/g, "")));
    const required = [
      BRAIN_DATABASES.pipeline.id,
      BRAIN_DATABASES.projetos.id,
      BRAIN_DATABASES.tarefas.id,
    ].map((id) => id.replace(/-/g, ""));
    for (const r of required) {
      expect(ids.has(r), `base ${r} deve estar acessível`).toBe(true);
    }
  }, 30000);

  it("lista oportunidades quentes com Score>=80 ou estágio Proposta/Negociação", async () => {
    const opps = await listarOportunidadesQuentes(5);
    expect(Array.isArray(opps)).toBe(true);
    // Cada uma das oportunidades deve ter nome
    for (const o of opps) {
      expect(o.nome.length).toBeGreaterThan(0);
    }
  }, 30000);

  it("lista top 5 por score ordenados desc", async () => {
    const top = await listarTopPorScore(5);
    expect(Array.isArray(top)).toBe(true);
    // Verifica ordem decrescente quando há scores
    const scores = top.map((o) => o.score).filter((s): s is number => s != null);
    for (let i = 1; i < scores.length; i++) {
      expect(scores[i - 1]).toBeGreaterThanOrEqual(scores[i]);
    }
  }, 30000);

  it("lista projetos ativos", async () => {
    const projs = await listarProjetosAtivos(10);
    expect(Array.isArray(projs)).toBe(true);
    for (const p of projs) {
      expect(p.status).toBe("Ativo");
    }
  }, 30000);

  it("lista tarefas pendentes (não concluídas)", async () => {
    const tarefas = await listarTarefasPendentes(15);
    expect(Array.isArray(tarefas)).toBe(true);
    for (const t of tarefas) {
      expect(t.status).not.toBe("Concluído");
    }
  }, 30000);
});
