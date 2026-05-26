/**
 * server/nowgoBrainRepository.ts
 *
 * Contrato agnóstico de persistência do NowGo Brain.
 *
 * Por que existe:
 * - Hoje a fonte é Notion (NotionBrainRepository).
 * - Em paralelo escrevemos no Postgres do Cockpit_NowGo (PostgresBrainRepository,
 *   shadow mirror).
 * - No futuro, o storage pode migrar para NVIDIA + Nomad on-prem.
 *
 * Tudo que o resto do sistema (jarvisBrainTools, financialKpis, dashboards do
 * /cockpit) consome passa por esta interface — nenhum chamador conhece o
 * fornecedor real. Quem instala a implementação concreta é a função-fábrica
 * `getBrainRepository()` em server/brainRepositoryFactory.ts.
 */
import type { PipelineStage } from "./brainSchema.js";
import type { OportunidadeResumo } from "./brainQueries.js";

// Os enums de CRM (priority/status/type) ainda não estão tipados em brainSchema.
// Mantemos string aqui para acomodar os valores reais do Notion sem acoplar
// a interface a um conjunto fechado prematuramente.
export type CrmAssetPriority = string;
export type CrmAssetStatus = string;
export type CrmAssetType = string;

// ---------------------------------------------------------------------------
// Resumos de domínio expostos pela interface
// ---------------------------------------------------------------------------
// Pipeline
export type { OportunidadeResumo };

// CRM Ativos (espelho do que brainQueries.ts já exporta)
export interface CrmAssetResumo {
  id: string;
  company: string;
  priority: CrmAssetPriority | null;
  status: CrmAssetStatus | null;
  expectedClose: string | null;
  type: CrmAssetType | null;
  estimatedValue: number | null;
  mrr: number | null;
  arr: number | null;
  email: string | null;
  phone: string | null;
  lastContact: string | null;
  decisionMaker: string | null;
  decisionMakerContact: string | null;
  addedAt: string | null;
}

export interface ProjetoResumo {
  id: string;
  nome: string;
  scorePrioridade: number | null;
  status: string | null;
  proximoMarco: string | null;
  dataProximoMarco: string | null;
  categoriaPrioridade: string | null;
  valorContrato: number | null;
  responsavel: string | null;
  vertical: string | null;
}

export interface EmpresaResumo {
  id: string;
  nome: string;
  setor: string | null;
  nivelInfluencia: string | null;
  statusRelacionamento: string | null;
  tipo: string | null;
  contatoPrincipal: string | null;
  email: string | null;
  telefone: string | null;
  ultimoContato: string | null;
}

export interface TarefaResumo {
  id: string;
  nome: string;
  responsavel: string | null;
  executor: string | null;
  prioridade: string | null;
  status: string | null;
  prazo: string | null;
  tipo: string | null;
}

export interface DocumentoResumo {
  id: string;
  nome: string;
  status: string | null;
  tipo: string | null;
  resumo: string | null;
  tags: string[];
  data: string | null;
}

export interface RiscoResumo {
  id: string;
  descricao: string;
  impacto: string | null;
  probabilidade: string | null;
  categoria: string | null;
  status: string | null;
  mitigacao: string | null;
  responsavel: string | null;
  proximaRevisao: string | null;
  dataIdentificacao: string | null;
}

export interface FinanceiroResumo {
  id: string;
  descricao: string;
  categoria: string | null;
  tipo: string | null;
  status: string | null;
  valor: number | null;
  data: string | null;
  formaPagamento: string | null;
}

// ---------------------------------------------------------------------------
// Filtros e parâmetros padrão
// ---------------------------------------------------------------------------
export interface ListOpportunitiesFilter {
  estagio?: PipelineStage | PipelineStage[];
  scoreMin?: number;
  limit?: number;
  ordering?: "score_desc" | "next_followup_asc" | "valor_desc";
}

export interface ListCrmAssetsFilter {
  status?: CrmAssetStatus | CrmAssetStatus[];
  priority?: CrmAssetPriority | CrmAssetPriority[];
  type?: CrmAssetType | CrmAssetType[];
  limit?: number;
}

// ---------------------------------------------------------------------------
// Contrato unificado
// ---------------------------------------------------------------------------
/**
 * Operações suportadas pela camada de NowGo Brain.
 *
 * Convenções:
 * - Todos os métodos são tenant-aware. Implementações Notion (single-tenant)
 *   ignoram o parâmetro `tenantId`; implementações Postgres usam-no para RLS.
 * - Retornos são "resumos" (subset projetado), nunca rows brutas do storage.
 * - Erros de rede/quota são lançados; o chamador decide se faz retry/fallback.
 */
export interface NowGoBrainRepository {
  /** Identificador legível da implementação ("notion", "postgres", etc.) */
  readonly name: string;

  // ------------------------------------------------------------------- Pipeline
  listOpportunities(
    tenantId: string,
    filter?: ListOpportunitiesFilter,
  ): Promise<OportunidadeResumo[]>;

  // ------------------------------------------------------------------- CRM
  listCrmAssets(
    tenantId: string,
    filter?: ListCrmAssetsFilter,
  ): Promise<CrmAssetResumo[]>;

  // ------------------------------------------------------------------- Projetos
  listProjects(tenantId: string, limit?: number): Promise<ProjetoResumo[]>;

  // ------------------------------------------------------------------- Empresas
  listCompanies(tenantId: string, limit?: number): Promise<EmpresaResumo[]>;

  // ------------------------------------------------------------------- Tarefas
  listTasks(tenantId: string, limit?: number): Promise<TarefaResumo[]>;

  // ------------------------------------------------------------------- Documentos
  listDocuments(tenantId: string, limit?: number): Promise<DocumentoResumo[]>;

  // ------------------------------------------------------------------- Riscos
  listRisks(tenantId: string, limit?: number): Promise<RiscoResumo[]>;

  // ------------------------------------------------------------------- Financeiro
  listFinancialEntries(
    tenantId: string,
    limit?: number,
  ): Promise<FinanceiroResumo[]>;

  // ------------------------------------------------------------------- Health
  /** True se o storage está acessível e respondendo. */
  healthCheck(): Promise<boolean>;
}

/**
 * Resultado do shadow-mirror: uma operação foi feita no source-of-truth
 * (Notion) e replicada no mirror (Postgres). Exposto para auditoria e métricas.
 */
export interface ShadowMirrorResult {
  ok: boolean;
  source: "notion" | "postgres";
  mirror: "postgres" | "notion" | null;
  durationMs: number;
  error?: string;
}
