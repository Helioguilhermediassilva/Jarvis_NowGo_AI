/**
 * server/brainQueries.ts
 * NowGo Brain — funções de leitura tipadas (high-level) sobre as 8 bases canônicas.
 *
 * Cada função devolve estruturas enxutas, prontas para serializar como JSON
 * para o LLM ou para a home cockpit. NUNCA expõe IDs internos do Notion ao
 * usuário final — apenas o nome humano da oportunidade/projeto/etc.
 */

import { queryDatabase } from "./notionBrain";
import {
  BRAIN_DATABASES,
  BRAIN_PROPS,
  PIPELINE_HOT_STAGES,
  PIPELINE_ACTIVE_STAGES,
  type PipelineStage,
} from "./brainSchema";

// ---------------------------------------------------------------------------
// Helpers de extração de propriedades do payload Notion
// ---------------------------------------------------------------------------

type NotionProp = any;

function readTitle(prop: NotionProp): string {
  const arr = prop?.title;
  if (Array.isArray(arr) && arr[0]?.plain_text) return arr[0].plain_text;
  return "";
}

function readRichText(prop: NotionProp): string {
  const arr = prop?.rich_text;
  if (Array.isArray(arr)) {
    return arr.map((s) => s?.plain_text ?? "").join("").trim();
  }
  return "";
}

function readSelect(prop: NotionProp): string | null {
  return prop?.select?.name ?? null;
}

function readMultiSelect(prop: NotionProp): string[] {
  const arr = prop?.multi_select;
  if (Array.isArray(arr)) return arr.map((s) => s.name);
  return [];
}

function readNumber(prop: NotionProp): number | null {
  const v = prop?.number;
  return typeof v === "number" ? v : null;
}

function readDate(prop: NotionProp): string | null {
  return prop?.date?.start ?? null;
}

function readFormula(prop: NotionProp): number | string | null {
  const f = prop?.formula;
  if (!f) return null;
  if (typeof f.number === "number") return f.number;
  if (typeof f.string === "string") return f.string;
  return null;
}

function readRelationCount(prop: NotionProp): number {
  const arr = prop?.relation;
  return Array.isArray(arr) ? arr.length : 0;
}

function readUniqueId(prop: NotionProp): string | null {
  const u = prop?.unique_id;
  if (!u) return null;
  const prefix = u.prefix ?? "";
  const number = u.number;
  return number != null ? `${prefix}-${number}` : null;
}

// ---------------------------------------------------------------------------
// Tipos de domínio
// ---------------------------------------------------------------------------

export interface OportunidadeResumo {
  id: string;                     // page_id (não exposto ao usuário, só uso interno)
  nome: string;
  idHumano: string | null;        // ex: OPP-12
  estagio: PipelineStage | null;
  score: number | null;
  valorEstimado: number | null;
  probabilidade: number | null;
  urgencia: string | null;
  proximoFollowUp: string | null;
  agenteResponsavel: string | null;
  pontoTensao: string | null;
  criterioProximaFase: string | null;
  fortaleceTese: string | null;
  cluster: string | null;
  impactoEstrategico: string | null;
  empresaIds: number;              // só contagem; nomes vêm via outra query se precisar
  projetoIds: number;
}

function mapOportunidade(page: any): OportunidadeResumo {
  const p = page.properties ?? {};
  const props = BRAIN_PROPS.pipeline;
  return {
    id: page.id,
    nome: readTitle(p[props.title]),
    idHumano: readUniqueId(p[props.idOportunidade]),
    estagio: (readSelect(p[props.estagio]) as PipelineStage) ?? null,
    score: readNumber(p[props.score]),
    valorEstimado: readNumber(p[props.valorEstimado]),
    probabilidade: readNumber(p[props.probabilidade]),
    urgencia: readSelect(p[props.urgencia]),
    proximoFollowUp: readDate(p[props.proximoFollowUp]),
    agenteResponsavel: readSelect(p[props.agenteResponsavel]),
    pontoTensao: readRichText(p[props.pontoTensao]),
    criterioProximaFase: readRichText(p[props.criterioProximaFase]),
    fortaleceTese: readSelect(p[props.fortaleceTese]),
    cluster: readSelect(p[props.cluster]),
    impactoEstrategico: readSelect(p[props.impactoEstrategico]),
    empresaIds: readRelationCount(p[props.empresa]),
    projetoIds: readRelationCount(p[props.projeto]),
  };
}

// ---------------------------------------------------------------------------
// Pipeline — leituras de alto nível
// ---------------------------------------------------------------------------

/**
 * Lista oportunidades quentes (Estágio em [Proposta, Negociação] OU Score >= 80).
 * Ordenadas por Score desc, depois por Próximo Follow-up asc.
 */
export async function listarOportunidadesQuentes(limit = 10): Promise<OportunidadeResumo[]> {
  const props = BRAIN_PROPS.pipeline;
  const r = await queryDatabase(BRAIN_DATABASES.pipeline.id, {
    filter: {
      or: [
        ...PIPELINE_HOT_STAGES.map((s) => ({
          property: props.estagio,
          select: { equals: s },
        })),
        { property: props.score, number: { greater_than_or_equal_to: 80 } },
      ],
    },
    sorts: [
      { property: props.score, direction: "descending" },
      { property: props.proximoFollowUp, direction: "ascending" },
    ],
    page_size: limit,
  });
  return r.results.map(mapOportunidade);
}

/**
 * Top N oportunidades por Score (independentemente do estágio).
 */
export async function listarTopPorScore(limit = 5): Promise<OportunidadeResumo[]> {
  const props = BRAIN_PROPS.pipeline;
  const r = await queryDatabase(BRAIN_DATABASES.pipeline.id, {
    filter: {
      and: [
        { property: props.score, number: { is_not_empty: true } },
        // exclui fechados
        ...["Fechado-Ganho", "Fechado-Perdido"].map((s) => ({
          property: props.estagio,
          select: { does_not_equal: s },
        })),
      ],
    },
    sorts: [{ property: props.score, direction: "descending" }],
    page_size: limit,
  });
  return r.results.map(mapOportunidade);
}

/**
 * Oportunidades com follow-up atrasado (data anterior a hoje, estágio ativo).
 */
export async function listarFollowUpsAtrasados(): Promise<OportunidadeResumo[]> {
  const props = BRAIN_PROPS.pipeline;
  const today = new Date().toISOString().slice(0, 10);
  const r = await queryDatabase(BRAIN_DATABASES.pipeline.id, {
    filter: {
      and: [
        { property: props.proximoFollowUp, date: { before: today } },
        {
          or: PIPELINE_ACTIVE_STAGES.map((s) => ({
            property: props.estagio,
            select: { equals: s },
          })),
        },
      ],
    },
    sorts: [{ property: props.proximoFollowUp, direction: "ascending" }],
    page_size: 25,
  });
  return r.results.map(mapOportunidade);
}

/**
 * Busca uma oportunidade pelo nome (matching parcial, case-insensitive).
 */
export async function buscarOportunidadePorNome(query: string): Promise<OportunidadeResumo[]> {
  const props = BRAIN_PROPS.pipeline;
  const r = await queryDatabase(BRAIN_DATABASES.pipeline.id, {
    filter: {
      property: props.title,
      title: { contains: query },
    },
    page_size: 10,
  });
  return r.results.map(mapOportunidade);
}

// ---------------------------------------------------------------------------
// Projetos — leituras
// ---------------------------------------------------------------------------

export interface ProjetoResumo {
  id: string;
  nome: string;
  idHumano: string | null;
  status: string | null;
  vertical: string | null;
  risco: string | null;
  scorePrioridade: number | null;
  proximoMarco: string | null;
  dataProximoMarco: string | null;
  valorContrato: number | null;
  oportunidadesCount: number;
  tarefasCount: number;
  riscosCount: number;
  documentosCount: number;
}

function mapProjeto(page: any): ProjetoResumo {
  const p = page.properties ?? {};
  const props = BRAIN_PROPS.projetos;
  return {
    id: page.id,
    nome: readTitle(p[props.title]),
    idHumano: readUniqueId(p[props.idProjeto]),
    status: readSelect(p[props.status]),
    vertical: readSelect(p[props.vertical]),
    risco: readSelect(p[props.risco]),
    scorePrioridade: readNumber(p[props.scorePrioridade]),
    proximoMarco: readRichText(p[props.proximoMarco]),
    dataProximoMarco: readDate(p[props.dataProximoMarco]),
    valorContrato: readNumber(p[props.valorContrato]),
    oportunidadesCount: readRelationCount(p[props.oportunidades]),
    tarefasCount: readRelationCount(p[props.tarefas]),
    riscosCount: readRelationCount(p[props.riscos]),
    documentosCount: readRelationCount(p[props.documentos]),
  };
}

/**
 * Lista projetos ativos (status = Ativo), ordenados por Score Prioridade desc.
 */
export async function listarProjetosAtivos(limit = 10): Promise<ProjetoResumo[]> {
  const props = BRAIN_PROPS.projetos;
  const r = await queryDatabase(BRAIN_DATABASES.projetos.id, {
    filter: { property: props.status, select: { equals: "Ativo" } },
    sorts: [{ property: props.scorePrioridade, direction: "descending" }],
    page_size: limit,
  });
  return r.results.map(mapProjeto);
}

// ---------------------------------------------------------------------------
// Tarefas — leituras
// ---------------------------------------------------------------------------

export interface TarefaResumo {
  id: string;
  nome: string;
  idHumano: string | null;
  status: string | null;
  prioridade: string | null;
  executor: string | null;
  tipo: string | null;
  prazo: string | null;
  notas: string;
}

function mapTarefa(page: any): TarefaResumo {
  const p = page.properties ?? {};
  const props = BRAIN_PROPS.tarefas;
  return {
    id: page.id,
    nome: readTitle(p[props.title]),
    idHumano: readUniqueId(p[props.idTarefa]),
    status: readSelect(p[props.status]),
    prioridade: readSelect(p[props.prioridade]),
    executor: readSelect(p[props.executor]),
    tipo: readSelect(p[props.tipo]),
    prazo: readDate(p[props.prazo]),
    notas: readRichText(p[props.notas]),
  };
}

/**
 * Lista tarefas pendentes (status != Concluído, != Bloqueado) ordenadas por prioridade e prazo.
 */
export async function listarTarefasPendentes(limit = 15): Promise<TarefaResumo[]> {
  const props = BRAIN_PROPS.tarefas;
  const r = await queryDatabase(BRAIN_DATABASES.tarefas.id, {
    filter: {
      and: [
        { property: props.status, select: { does_not_equal: "Concluído" } },
      ],
    },
    sorts: [
      { property: props.prazo, direction: "ascending" },
    ],
    page_size: limit,
  });
  return r.results.map(mapTarefa);
}

/**
 * Lista tarefas P0/P1 atrasadas (bloqueios).
 */
export async function listarBloqueiosCriticos(): Promise<TarefaResumo[]> {
  const props = BRAIN_PROPS.tarefas;
  const today = new Date().toISOString().slice(0, 10);
  const r = await queryDatabase(BRAIN_DATABASES.tarefas.id, {
    filter: {
      and: [
        {
          or: [
            { property: props.prioridade, select: { equals: "P0 - Crítica" } },
            { property: props.prioridade, select: { equals: "P1 - Alta" } },
            { property: props.status, select: { equals: "Bloqueado" } },
          ],
        },
        { property: props.status, select: { does_not_equal: "Concluído" } },
      ],
    },
    sorts: [{ property: props.prazo, direction: "ascending" }],
    page_size: 10,
  });
  return r.results.map(mapTarefa);
}
