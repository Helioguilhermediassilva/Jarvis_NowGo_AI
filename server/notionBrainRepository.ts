/**
 * server/notionBrainRepository.ts
 *
 * Adapta as funções legadas em brainQueries.ts à interface NowGoBrainRepository.
 * Permite que o restante do app converse pela interface neutra, mantendo
 * Notion como source-of-truth na fase 1.
 *
 * Como o Notion atual é single-tenant (uma única organização: NowGo AI),
 * o parâmetro `tenantId` é IGNORADO nesta implementação. Ele só passa a
 * importar quando a aplicação migra para a implementação Postgres.
 */
import {
  listarOportunidadesQuentes,
  listarTopPorScore,
  listarFollowUpsAtrasados,
  listarProjetosAtivos,
  listarTarefasPendentes,
  listarAtivosCrmIa,
  type AtivoCrmResumo,
  type OportunidadeResumo,
  type ProjetoResumo as NotionProjetoResumo,
  type TarefaResumo as NotionTarefaResumo,
} from "./brainQueries.js";

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

function mapAtivo(a: AtivoCrmResumo): CrmAssetResumo {
  return {
    id: a.id,
    company: a.company,
    priority: a.priority,
    status: a.status,
    expectedClose: a.expectedClose,
    type: a.type,
    estimatedValue: a.estimatedValueBrl,
    mrr: a.mrrBrl,
    arr: a.arrBrl,
    email: a.email,
    phone: a.phone,
    lastContact: a.lastContact,
    decisionMaker: a.decisionMaker,
    decisionMakerContact: a.decisionMakerContact,
    addedAt: a.addedAt,
  };
}

function mapProjeto(p: NotionProjetoResumo): ProjetoResumo {
  return {
    id: p.id,
    nome: p.nome,
    scorePrioridade: (p as any).scorePrioridade ?? null,
    status: (p as any).status ?? null,
    proximoMarco: (p as any).proximoMarco ?? null,
    dataProximoMarco: (p as any).dataProximoMarco ?? null,
    categoriaPrioridade: (p as any).categoriaPrioridade ?? null,
    valorContrato: (p as any).valorContrato ?? null,
    responsavel: (p as any).responsavel ?? null,
    vertical: (p as any).vertical ?? null,
  };
}

function mapTarefa(t: NotionTarefaResumo): TarefaResumo {
  return {
    id: t.id,
    nome: (t as any).nome ?? "",
    responsavel: (t as any).responsavel ?? null,
    executor: (t as any).executor ?? null,
    prioridade: (t as any).prioridade ?? null,
    status: (t as any).status ?? null,
    prazo: (t as any).prazo ?? null,
    tipo: (t as any).tipo ?? null,
  };
}

export class NotionBrainRepository implements NowGoBrainRepository {
  readonly name = "notion";

  async listOpportunities(
    _tenantId: string,
    filter?: ListOpportunitiesFilter,
  ): Promise<OportunidadeResumo[]> {
    const limit = filter?.limit ?? 10;
    if (filter?.estagio) {
      // Notion não tem filtro por estágio único nesta camada; usamos quentes + filtro local.
      const quentes = await listarOportunidadesQuentes(limit * 2);
      const stages = (
        Array.isArray(filter.estagio) ? filter.estagio : [filter.estagio]
      ) as string[];
      return quentes.filter((o) => o.estagio && stages.includes(o.estagio)).slice(0, limit);
    }
    if (filter?.ordering === "next_followup_asc") {
      return listarFollowUpsAtrasados();
    }
    if (typeof filter?.scoreMin === "number") {
      return listarTopPorScore(limit);
    }
    return listarOportunidadesQuentes(limit);
  }

  async listCrmAssets(
    _tenantId: string,
    filter?: ListCrmAssetsFilter,
  ): Promise<CrmAssetResumo[]> {
    const ativos = await listarAtivosCrmIa({ onlyActive: false });
    let result = ativos.map(mapAtivo);
    if (filter?.status) {
      const arr = Array.isArray(filter.status) ? filter.status : [filter.status];
      result = result.filter((a) => a.status && arr.includes(a.status));
    }
    if (filter?.priority) {
      const arr = Array.isArray(filter.priority) ? filter.priority : [filter.priority];
      result = result.filter((a) => a.priority && arr.includes(a.priority));
    }
    if (filter?.type) {
      const arr = Array.isArray(filter.type) ? filter.type : [filter.type];
      result = result.filter((a) => a.type && arr.includes(a.type));
    }
    return filter?.limit ? result.slice(0, filter.limit) : result;
  }

  async listProjects(_tenantId: string, limit = 10): Promise<ProjetoResumo[]> {
    const rows = await listarProjetosAtivos(limit);
    return rows.map(mapProjeto);
  }

  async listCompanies(_tenantId: string, _limit = 50): Promise<EmpresaResumo[]> {
    // Ainda não há query dedicada de empresas em brainQueries.ts.
    // Quando for implementada, basta encadear aqui.
    return [];
  }

  async listTasks(_tenantId: string, limit = 15): Promise<TarefaResumo[]> {
    const rows = await listarTarefasPendentes(limit);
    return rows.map(mapTarefa);
  }

  async listDocuments(_tenantId: string, _limit = 50): Promise<DocumentoResumo[]> {
    return [];
  }

  async listRisks(_tenantId: string, _limit = 50): Promise<RiscoResumo[]> {
    return [];
  }

  async listFinancialEntries(
    _tenantId: string,
    _limit = 50,
  ): Promise<FinanceiroResumo[]> {
    return [];
  }

  async healthCheck(): Promise<boolean> {
    try {
      // Smoke check: lista 1 oportunidade. Se Notion responder, está saudável.
      await listarOportunidadesQuentes(1);
      return true;
    } catch {
      return false;
    }
  }
}
