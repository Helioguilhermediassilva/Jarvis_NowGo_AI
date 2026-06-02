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
  /** Data de criação do registro (ISO yyyy-mm-dd). Usado pelo contador de novas oportunidades do mês. */
  dataCriacao?: string | null;
  /** F30 — nome do decisor do cliente. */
  decisor?: string | null;
  /** F30 — contato do decisor (cargo + canal + telefone/e-mail). */
  contatoDecisor?: string | null;
  /** Classificação SUN — eixo estratégico (Missão Ativa/Radar/Pausada/Descartada). */
  classificacaoSun?: string | null;
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
    decisor: readRichText(p[(props as any).decisor]) || null,
    contatoDecisor: readRichText(p[(props as any).contatoDecisor]) || null,
    classificacaoSun: readSelect(p[(props as any).classificacaoSun]),
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
        // exclui oportunidades fora de foco (eixo SUN)
        ...["Pausada", "Descartada"].map((c) => ({
          property: props.classificacaoSun,
          select: { does_not_equal: c },
        })),
      ],
    },
    sorts: [{ property: props.score, direction: "descending" }],
    page_size: limit,
  });
  return r.results.map(mapOportunidade);
}

/**
 * Portfólio classificado pelo eixo SUN. Retorna todas as oportunidades vivas
 * (exclui Fechado-Ganho/Perdido) com sua classificação estratégica, ordenadas
 * por Score desc. Oportunidades sem classificação caem em "Radar" por default.
 */
export async function listarPortfolioSun(limit = 100): Promise<OportunidadeResumo[]> {
  const props = BRAIN_PROPS.pipeline;
  const r = await queryDatabase(BRAIN_DATABASES.pipeline.id, {
    filter: {
      and: [
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
 * Normaliza string para matching fuzzy: lowercase + remove acentos + remove
 * pontuação comum + colapsa espaços. Ex.: "WLM Indústrias S/A" -> "wlm industrias sa".
 */
function normalizeForFuzzy(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[\.,\-_/\\&()\[\]"']+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Levenshtein-lite (limite curto): true se distancia <= max. */
function withinEditDistance(a: string, b: string, max: number): boolean {
  if (Math.abs(a.length - b.length) > max) return false;
  const la = a.length, lb = b.length;
  if (la === 0) return lb <= max;
  if (lb === 0) return la <= max;
  let prev = new Array(lb + 1);
  for (let j = 0; j <= lb; j++) prev[j] = j;
  for (let i = 1; i <= la; i++) {
    const cur = new Array(lb + 1);
    cur[0] = i;
    let rowMin = cur[0];
    for (let j = 1; j <= lb; j++) {
      const cost = a.charCodeAt(i - 1) === b.charCodeAt(j - 1) ? 0 : 1;
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + cost);
      if (cur[j] < rowMin) rowMin = cur[j];
    }
    if (rowMin > max) return false;
    prev = cur;
  }
  return prev[lb] <= max;
}

/**
 * Busca uma oportunidade pelo nome com matching FUZZY:
 *  - Primeiro tenta substring case-insensitive direto no Notion (rápido).
 *  - Em paralelo, busca TODAS as oportunidades ativas (até 200) e roda
 *    matching fuzzy local: substring de tokens normalizados, iniciais,
 *    e Levenshtein <=2 sobre cada token. Resultados são dedup + scored.
 *  - Top 10 por score retornado.
 *
 * Isso permite encontrar "WLM" mesmo quando o título é "Indústrias WLM S/A"
 * ou quando o STT transcreve com pequenos erros ("vlm", "velemê").
 */
export async function buscarOportunidadePorNome(query: string): Promise<OportunidadeResumo[]> {
  const props = BRAIN_PROPS.pipeline;
  const qNorm = normalizeForFuzzy(query);
  const qTokens = qNorm.split(" ").filter((t) => t.length >= 2);
  if (!qNorm) return [];

  // 1) Substring direto no Notion (rápido, geralmente cobre 80% dos casos).
  const direct = await queryDatabase(BRAIN_DATABASES.pipeline.id, {
    filter: { property: props.title, title: { contains: query } },
    page_size: 10,
  });
  const directMatches = direct.results.map(mapOportunidade);

  // 2) Carrega TUDO ativo para matching local fuzzy (Notion não tem fuzzy nativo).
  const all = await queryDatabase(BRAIN_DATABASES.pipeline.id, {
    filter: {
      or: PIPELINE_ACTIVE_STAGES.map((s) => ({
        property: props.estagio,
        select: { equals: s },
      })),
    },
    page_size: 200,
  });
  const allMatches: OportunidadeResumo[] = all.results.map(mapOportunidade);

  // Score cada candidato: substring=10, prefix=8, todos tokens contidos=6,
  // qualquer token contido=4, edit-distance<=2 em token=3, iniciais batem=5.
  const scored = new Map<string, { item: OportunidadeResumo; score: number }>();
  for (const item of allMatches) {
    const nomeNorm = normalizeForFuzzy(item.nome || "");
    if (!nomeNorm) continue;
    const nomeTokens = nomeNorm.split(" ").filter(Boolean);
    let score = 0;
    if (nomeNorm.includes(qNorm)) score = Math.max(score, 10);
    if (nomeNorm.startsWith(qNorm)) score = Math.max(score, 8);
    if (qTokens.length > 0) {
      const allTokensIn = qTokens.every((t) => nomeNorm.includes(t));
      const anyTokenIn = qTokens.some((t) => nomeNorm.includes(t));
      if (allTokensIn) score = Math.max(score, 6);
      else if (anyTokenIn) score = Math.max(score, 4);
      // Iniciais: query "WLM" -> match em token cujas iniciais sejam W L M.
      if (qNorm.length <= 5 && /^[a-z]+$/.test(qNorm)) {
        const initials = nomeTokens.map((t) => t[0]).join("");
        if (initials.includes(qNorm)) score = Math.max(score, 5);
      }
      // Edit-distance pequeno por token (cobre erros de STT).
      for (const qt of qTokens) {
        if (qt.length < 3) continue;
        for (const nt of nomeTokens) {
          if (Math.abs(nt.length - qt.length) > 2) continue;
          if (withinEditDistance(qt, nt, qt.length <= 4 ? 1 : 2)) {
            score = Math.max(score, 3);
          }
        }
      }
    }
    if (score > 0) {
      scored.set(item.id, { item, score });
    }
  }
  // Merge: prioriza directMatches (Notion encontrou substring exata).
  for (const item of directMatches) {
    const prev = scored.get(item.id);
    if (prev) prev.score = Math.max(prev.score, 10);
    else scored.set(item.id, { item, score: 10 });
  }
  const merged = Array.from(scored.values())
    .sort((a, b) => b.score - a.score)
    .slice(0, 10)
    .map((x) => x.item);
  return merged;
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
 * F30 — Calcula a próxima oportunidade candidata ao Top 5 Deal Rooms após
 * a resolução de um deal atual. Exclui as oportunidades atualmente no
 * Top 5 (currentTopIds) e as fechadas (Ganho/Perdido). Ranking interno:
 * (valorEstimado || 0) × (score / 100), com fallback para score puro
 * quando o valor não está preenchido.
 */
export async function proximoDealRoomCandidato(
  currentTopIds: string[],
): Promise<OportunidadeResumo | null> {
  const props = BRAIN_PROPS.pipeline;
  // Busca um pool maior (20) para depois filtrar e re-rankear localmente.
  const r = await queryDatabase(BRAIN_DATABASES.pipeline.id, {
    filter: {
      and: [
        { property: props.score, number: { is_not_empty: true } },
        ...["Fechado-Ganho", "Fechado-Perdido"].map((s) => ({
          property: props.estagio,
          select: { does_not_equal: s },
        })),
        ...["Pausada", "Descartada"].map((c) => ({
          property: props.classificacaoSun,
          select: { does_not_equal: c },
        })),
      ],
    },
    sorts: [{ property: props.score, direction: "descending" }],
    page_size: 20,
  });
  const all = r.results.map(mapOportunidade);
  const eligible = all.filter((o) => !currentTopIds.includes(o.id));
  if (eligible.length === 0) return null;
  // Re-rank por (valor × score/100) descendente.
  eligible.sort((a, b) => {
    const sa = (a.score ?? 0) / 100;
    const sb = (b.score ?? 0) / 100;
    const wa = (a.valorEstimado ?? 0) * sa;
    const wb = (b.valorEstimado ?? 0) * sb;
    if (wb !== wa) return wb - wa;
    return (b.score ?? 0) - (a.score ?? 0);
  });
  return eligible[0];
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
  /** Data de criação do registro no Notion (campo Added) — ISO yyyy-mm-dd. */
  addedAt: string | null;
  /** F30 — nome do decisor do cliente (rich_text livre). */
  decisionMaker: string | null;
  /** F30 — contato do decisor: cargo, canal, telefone, e-mail (rich_text livre). */
  decisionMakerContact: string | null;
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
    // Campo "Added" é created_time → vem como ISO string em p[props.added]
    addedAt: (() => {
      const raw = p[(BRAIN_PROPS.ativosCrmIa as any).added];
      if (!raw) return null;
      // created_time vem como { created_time: "2026-05-22T..." }
      if (typeof raw === "object" && "created_time" in raw)
        return (raw as any).created_time?.slice(0, 10) ?? null;
      if (typeof raw === "object" && "date" in raw)
        return readDate(raw) ?? null;
      return null;
    })(),
    decisionMaker: readRichText(p[(props as any).decisionMaker]) || null,
    decisionMakerContact: readRichText(p[(props as any).decisionMakerContact]) || null,
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
    dataCriacao: a.addedAt ?? null,
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

