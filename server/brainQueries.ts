/**
 * server/brainQueries.ts
 * NowGo Brain — funções de leitura tipadas (high-level) sobre as 8 bases canônicas.
 *
 * Cada função devolve estruturas enxutas, prontas para serializar como JSON
 * para o LLM ou para a home cockpit. NUNCA expõe IDs internos do Notion ao
 * usuário final — apenas o nome humano da oportunidade/projeto/etc.
 */

import { queryDatabase } from "./notionBrain.js";
import {
  BRAIN_DATABASES,
  BRAIN_PROPS,
  PIPELINE_HOT_STAGES,
  PIPELINE_ACTIVE_STAGES,
  type PipelineStage,
} from "./brainSchema.js";

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
 * Top N "Deal Rooms" — oportunidades ativas (não fechadas e não arquivadas)
 * com maior Score, considerando o ranking automaticamente atualizado a cada
 * mudança de estágio. Quando uma oportunidade do top é movida para
 * Fechado-Ganho/Perdido, a próxima de maior score sobe para o slot vago.
 */
export async function listarTopDealRooms(limit = 5): Promise<OportunidadeResumo[]> {
  return listarTopPorScore(limit);
}

/**
 * Lista missões SUN ativas — reuso da database `📁 Projetos` filtrando por
 * `Vertical = "Missão SUN"` e status ativo. Limite máximo de 5.
 */
export async function listarMissoesAtivas(): Promise<ProjetoResumo[]> {
  const props = BRAIN_PROPS.projetos;
  const r = await queryDatabase(BRAIN_DATABASES.projetos.id, {
    filter: {
      and: [
        { property: props.vertical, select: { equals: "Missão SUN" } },
        {
          or: [
            { property: props.status, select: { equals: "Ativo" } },
            { property: props.status, select: { equals: "Em andamento" } },
          ],
        },
      ],
    },
    sorts: [{ property: props.scorePrioridade, direction: "descending" }],
    page_size: 5,
  });
  return r.results.map(mapProjeto);
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


// ---------------------------------------------------------------------------
// ATIVOS CRM IA — fonte editável humana (founder edita direto no Notion)
// ---------------------------------------------------------------------------

export interface AtivoCrmResumo {
  id: string;
  company: string;
  status: string | null;        // Lead / Qualified / Proposal 👀 / Negotiation / Closed 💪 / Lost
  priority: string | null;      // Low / Medium / High
  estimatedValueBrl: number | null; // já em BRL (formato real)
  mrrBrl: number | null;            // receita recorrente mensal (BRL)
  arrBrl: number | null;            // receita recorrente anual (formula)
  type: string | null;
  email: string | null;
  phone: string | null;
  expectedClose: string | null;
  lastContact: string | null;
}

function mapAtivoCrm(page: any): AtivoCrmResumo {
  const p = page.properties ?? {};
  const props = BRAIN_PROPS.ativosCrmIa;
  return {
    id: page.id,
    company: readTitle(p[props.title]),
    status: readSelect(p[props.status]),
    priority: readSelect(p[props.priority]),
    estimatedValueBrl: readNumber(p[props.estimatedValue]),
    mrrBrl: readNumber(p[props.mrr]),
    // ARR é fórmula no Notion (number) — usamos readFormula
    arrBrl: (() => {
      const v = readFormula(p[props.arr]);
      return typeof v === "number" ? v : null;
    })(),
    type: readRichText(p[props.type]) || null,
    email: p[props.email]?.email ?? null,
    phone: p[props.phone]?.phone_number ?? null,
    expectedClose: readDate(p[props.expectedClose]),
    lastContact: readDate(p[props.lastContact]),
  };
}

/**
 * Lista todos os ativos da ATIVOS CRM IA, com paginação automática.
 * Excluindo lixeira (Notion já filtra automaticamente).
 */
export async function listarAtivosCrmIa(opts?: { onlyActive?: boolean }): Promise<AtivoCrmResumo[]> {
  const onlyActive = opts?.onlyActive ?? false;
  const all: AtivoCrmResumo[] = [];
  let cursor: string | undefined = undefined;
  let pages = 0;
  do {
    const r: any = await queryDatabase(BRAIN_DATABASES.ativosCrmIa.id, {
      page_size: 100,
      start_cursor: cursor,
    });
    for (const page of r.results ?? []) {
      all.push(mapAtivoCrm(page));
    }
    cursor = r.has_more ? r.next_cursor : undefined;
    pages += 1;
    if (pages > 20) break; // safety guard
  } while (cursor);

  if (onlyActive) {
    return all.filter((a) => a.status !== "Lost" && a.status !== "Closed 💪");
  }
  return all;
}

/**
 * Totaliza MRR e ARR da carteira ATIVOS CRM IA (apenas deals não Lost).
 */
export interface RecurringRevenueTotals {
  mrrTotalBrl: number;
  arrTotalBrl: number;
  dealsComRecorrencia: number;
  totalAtivos: number;
  porStatus: Record<string, { mrr: number; arr: number; count: number }>;
  topRecorrencia: Array<{ company: string; mrr: number; arr: number; status: string | null }>;
}

export function calcularMrrArrTotals(ativos: AtivoCrmResumo[]): RecurringRevenueTotals {
  let mrrTotal = 0;
  let arrTotal = 0;
  let dealsComRecorrencia = 0;
  const porStatus: Record<string, { mrr: number; arr: number; count: number }> = {};
  const top: Array<{ company: string; mrr: number; arr: number; status: string | null }> = [];

  for (const a of ativos) {
    // exclui Lost
    if (a.status === "Lost") continue;
    const mrr = a.mrrBrl ?? 0;
    if (mrr > 0) {
      mrrTotal += mrr;
      arrTotal += a.arrBrl ?? mrr * 12;
      dealsComRecorrencia += 1;
      top.push({
        company: a.company,
        mrr,
        arr: a.arrBrl ?? mrr * 12,
        status: a.status,
      });

      const key = a.status ?? "—";
      if (!porStatus[key]) porStatus[key] = { mrr: 0, arr: 0, count: 0 };
      porStatus[key].mrr += mrr;
      porStatus[key].arr += a.arrBrl ?? mrr * 12;
      porStatus[key].count += 1;
    }
  }

  top.sort((a, b) => b.mrr - a.mrr);

  return {
    mrrTotalBrl: mrrTotal,
    arrTotalBrl: arrTotal,
    dealsComRecorrencia,
    totalAtivos: ativos.filter((a) => a.status !== "Lost").length,
    porStatus,
    topRecorrencia: top.slice(0, 10),
  };
}


// ---------------------------------------------------------------------------
// F17.1 — Adapter: ATIVOS CRM IA → OportunidadeResumo (forma canônica)
// ---------------------------------------------------------------------------

/**
 * Mapeia o status do ATIVOS CRM IA para o PipelineStage canônico.
 */
function mapAtivoStatusToStage(status: string | null): PipelineStage | null {
  if (!status) return null;
  const s = status.trim();
  if (s === "Lead") return "Lead";
  if (s === "Qualified") return "Qualificado";
  if (s.startsWith("Proposal")) return "Proposta";
  if (s === "Negotiation") return "Negociação";
  if (s.startsWith("Closed")) return "Fechado-Ganho";
  if (s === "Lost") return "Fechado-Perdido";
  return null;
}

/**
 * Converte um AtivoCrmResumo em OportunidadeResumo (formato esperado por
 * calcularKpis), de modo que a ATIVOS CRM IA possa ser usada como fonte
 * primária do cockpit financeiro.
 */
export function ativoCrmToOportunidade(a: AtivoCrmResumo): OportunidadeResumo {
  return {
    id: a.id,
    nome: a.company || "(sem nome)",
    idHumano: null,
    estagio: mapAtivoStatusToStage(a.status),
    score: null,
    valorEstimado: a.estimatedValueBrl ?? null,
    probabilidade: null,
    urgencia: null,
    proximoFollowUp: a.expectedClose ?? a.lastContact ?? null,
    agenteResponsavel: null,
    pontoTensao: "",
    criterioProximaFase: "",
    fortaleceTese: null,
    cluster: null,
    impactoEstrategico: null,
    empresaIds: 0,
    projetoIds: 0,
  };
}

/**
 * Reuso direto para o handler de KPIs: lê todos os ativos e devolve no
 * formato canônico, pronto para passar a calcularKpis().
 */
export async function listarOportunidadesDeAtivosCrmIa(): Promise<OportunidadeResumo[]> {
  const ativos = await listarAtivosCrmIa();
  return ativos.map(ativoCrmToOportunidade);
}

