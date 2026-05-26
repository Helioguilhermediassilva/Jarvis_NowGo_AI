/**
 * server/postgresBrainRepository.ts
 *
 * Implementação Postgres (Supabase Cockpit_NowGo) do NowGoBrainRepository.
 * Na fase 1 atua como SHADOW MIRROR: leituras opcionais para validação,
 * escritas espelhadas pelo serviço de sync (a ser adicionado).
 *
 * Toda operação que toca tabelas com RLS passa por `withTenant()` para
 * que `SET LOCAL app.current_tenant_id` ative o isolamento.
 */
import { and, desc, eq, gte, inArray } from "drizzle-orm";
import { withTenant } from "./db/client.js";
import {
  opportunities,
  crmAssets,
  projects,
  companies,
  tasks,
  documents,
  risks,
  financialEntries,
} from "./db/schema.js";
import type {
  CrmAssetResumo,
  DocumentoResumo,
  EmpresaResumo,
  FinanceiroResumo,
  ListCrmAssetsFilter,
  ListOpportunitiesFilter,
  NowGoBrainRepository,
  ProjetoResumo,
  RiscoResumo,
  TarefaResumo,
} from "./nowgoBrainRepository.js";
import type { OportunidadeResumo } from "./brainQueries.js";
import type { PipelineStage } from "./brainSchema.js";

function toNum(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : null;
}

function toStrArr(value: unknown): string[] {
  if (Array.isArray(value)) return value.filter((v) => typeof v === "string");
  return [];
}

export class PostgresBrainRepository implements NowGoBrainRepository {
  readonly name = "postgres";

  // ----------------------------------------------------------------- Pipeline
  async listOpportunities(
    tenantId: string,
    filter?: ListOpportunitiesFilter,
  ): Promise<OportunidadeResumo[]> {
    return withTenant(tenantId, async (tx) => {
      const conditions = [eq(opportunities.tenantId, tenantId)];
      if (filter?.estagio) {
        const stages = (
          Array.isArray(filter.estagio) ? filter.estagio : [filter.estagio]
        ) as PipelineStage[];
        conditions.push(inArray(opportunities.estagio, stages));
      }
      if (typeof filter?.scoreMin === "number") {
        conditions.push(gte(opportunities.score, String(filter.scoreMin)));
      }

      const rows = await tx
        .select()
        .from(opportunities)
        .where(and(...conditions))
        .orderBy(desc(opportunities.score))
        .limit(filter?.limit ?? 50);

      return rows.map(
        (r): OportunidadeResumo => ({
          id: r.id,
          nome: r.nome,
          idHumano: r.idHumano,
          estagio: (r.estagio as PipelineStage | null) ?? null,
          score: toNum(r.score),
          valorEstimado: toNum(r.valorEstimado),
          probabilidade: toNum(r.probabilidade),
          urgencia: r.urgencia,
          proximoFollowUp: r.proximoFollowUp,
          agenteResponsavel: r.agenteResponsavel,
          pontoTensao: r.pontoTensao,
          criterioProximaFase: r.criterioProximaFase,
          fortaleceTese: r.fortaleceTese,
          cluster: r.cluster,
          impactoEstrategico: r.impactoEstrategico,
          empresaIds: Array.isArray(r.empresaIds)
            ? (r.empresaIds as unknown[]).length
            : 0,
          projetoIds: Array.isArray(r.projetoIds)
            ? (r.projetoIds as unknown[]).length
            : 0,
          dataCriacao: r.dataCriacao,
          decisor: r.decisor,
          contatoDecisor: r.contatoDecisor,
        }),
      );
    });
  }

  // ----------------------------------------------------------------- CRM
  async listCrmAssets(
    tenantId: string,
    filter?: ListCrmAssetsFilter,
  ): Promise<CrmAssetResumo[]> {
    return withTenant(tenantId, async (tx) => {
      const conditions = [eq(crmAssets.tenantId, tenantId)];
      if (filter?.status) {
        const arr = Array.isArray(filter.status) ? filter.status : [filter.status];
        conditions.push(inArray(crmAssets.status, arr));
      }
      if (filter?.priority) {
        const arr = Array.isArray(filter.priority)
          ? filter.priority
          : [filter.priority];
        conditions.push(inArray(crmAssets.priority, arr));
      }
      if (filter?.type) {
        const arr = Array.isArray(filter.type) ? filter.type : [filter.type];
        conditions.push(inArray(crmAssets.type, arr));
      }

      const rows = await tx
        .select()
        .from(crmAssets)
        .where(and(...conditions))
        .limit(filter?.limit ?? 50);

      return rows.map(
        (r): CrmAssetResumo => ({
          id: r.id,
          company: r.company,
          priority: r.priority,
          status: r.status,
          expectedClose: r.expectedClose,
          type: r.type,
          estimatedValue: toNum(r.estimatedValue),
          mrr: toNum(r.mrr),
          arr: toNum(r.arr),
          email: r.email,
          phone: r.phone,
          lastContact: r.lastContact,
          decisionMaker: r.decisionMaker,
          decisionMakerContact: r.decisionMakerContact,
          addedAt: r.addedAt,
        }),
      );
    });
  }

  // ----------------------------------------------------------------- Projetos
  async listProjects(tenantId: string, limit = 50): Promise<ProjetoResumo[]> {
    return withTenant(tenantId, async (tx) => {
      const rows = await tx
        .select()
        .from(projects)
        .where(eq(projects.tenantId, tenantId))
        .orderBy(desc(projects.scorePrioridade))
        .limit(limit);
      return rows.map(
        (r): ProjetoResumo => ({
          id: r.id,
          nome: r.nome,
          scorePrioridade: toNum(r.scorePrioridade),
          status: r.status,
          proximoMarco: r.proximoMarco,
          dataProximoMarco: r.dataProximoMarco,
          categoriaPrioridade: r.categoriaPrioridade,
          valorContrato: toNum(r.valorContrato),
          responsavel: r.responsavel,
          vertical: r.vertical,
        }),
      );
    });
  }

  // ----------------------------------------------------------------- Empresas
  async listCompanies(tenantId: string, limit = 50): Promise<EmpresaResumo[]> {
    return withTenant(tenantId, async (tx) => {
      const rows = await tx
        .select()
        .from(companies)
        .where(eq(companies.tenantId, tenantId))
        .limit(limit);
      return rows.map(
        (r): EmpresaResumo => ({
          id: r.id,
          nome: r.nome,
          setor: r.setor,
          nivelInfluencia: r.nivelInfluencia,
          statusRelacionamento: r.statusRelacionamento,
          tipo: r.tipo,
          contatoPrincipal: r.contatoPrincipal,
          email: r.email,
          telefone: r.telefone,
          ultimoContato: r.ultimoContato,
        }),
      );
    });
  }

  // ----------------------------------------------------------------- Tarefas
  async listTasks(tenantId: string, limit = 50): Promise<TarefaResumo[]> {
    return withTenant(tenantId, async (tx) => {
      const rows = await tx
        .select()
        .from(tasks)
        .where(eq(tasks.tenantId, tenantId))
        .limit(limit);
      return rows.map(
        (r): TarefaResumo => ({
          id: r.id,
          nome: r.nome,
          responsavel: r.responsavel,
          executor: r.executor,
          prioridade: r.prioridade,
          status: r.status,
          prazo: r.prazo,
          tipo: r.tipo,
        }),
      );
    });
  }

  // ----------------------------------------------------------------- Documentos
  async listDocuments(tenantId: string, limit = 50): Promise<DocumentoResumo[]> {
    return withTenant(tenantId, async (tx) => {
      const rows = await tx
        .select()
        .from(documents)
        .where(eq(documents.tenantId, tenantId))
        .limit(limit);
      return rows.map(
        (r): DocumentoResumo => ({
          id: r.id,
          nome: r.nome,
          status: r.status,
          tipo: r.tipo,
          resumo: r.resumo,
          tags: toStrArr(r.tags),
          data: r.data,
        }),
      );
    });
  }

  // ----------------------------------------------------------------- Riscos
  async listRisks(tenantId: string, limit = 50): Promise<RiscoResumo[]> {
    return withTenant(tenantId, async (tx) => {
      const rows = await tx
        .select()
        .from(risks)
        .where(eq(risks.tenantId, tenantId))
        .limit(limit);
      return rows.map(
        (r): RiscoResumo => ({
          id: r.id,
          descricao: r.descricao,
          impacto: r.impacto,
          probabilidade: r.probabilidade,
          categoria: r.categoria,
          status: r.status,
          mitigacao: r.mitigacao,
          responsavel: r.responsavel,
          proximaRevisao: r.proximaRevisao,
          dataIdentificacao: r.dataIdentificacao,
        }),
      );
    });
  }

  // ----------------------------------------------------------------- Financeiro
  async listFinancialEntries(
    tenantId: string,
    limit = 50,
  ): Promise<FinanceiroResumo[]> {
    return withTenant(tenantId, async (tx) => {
      const rows = await tx
        .select()
        .from(financialEntries)
        .where(eq(financialEntries.tenantId, tenantId))
        .orderBy(desc(financialEntries.data))
        .limit(limit);
      return rows.map(
        (r): FinanceiroResumo => ({
          id: r.id,
          descricao: r.descricao,
          categoria: r.categoria,
          tipo: r.tipo,
          status: r.status,
          valor: toNum(r.valor),
          data: r.data,
          formaPagamento: r.formaPagamento,
        }),
      );
    });
  }

  // ----------------------------------------------------------------- Health
  async healthCheck(): Promise<boolean> {
    try {
      const { sql } = await import("drizzle-orm");
      const { db } = await import("./db/client.js");
      const result = await db().execute(sql`SELECT 1 AS ok`);
      // node-postgres retorna { rows: [...] }
      const rows = (result as unknown as { rows?: unknown[] }).rows ?? [];
      return rows.length > 0;
    } catch {
      return false;
    }
  }
}
