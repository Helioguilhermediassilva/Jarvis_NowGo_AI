/**
 * server/brainMutations.ts
 * NowGo Brain — funções de escrita tipadas (high-level) com guardrails.
 *
 * Princípios:
 *  - Toda escrita exige um `confirmedByUser: true` explícito (assume-se que a UI/voz
 *    já capturou a confirmação verbal antes de chamar a função).
 *  - Operações nunca destrutivas (sem delete; arquivamento via update).
 *  - Toda escrita registra-se em log estruturado (audit trail no Brain como
 *    documento Tipo=Ata, Status=Aprovado) — feito por separado em brainAudit.ts.
 */

import { createPage, updatePage, clearCache, archivePage } from "./notionBrain.js";
import {
  BRAIN_DATABASES,
  BRAIN_PROPS,
  PIPELINE_STAGES,
  type PipelineStage,
} from "./brainSchema.js";

// ---------------------------------------------------------------------------
// Builders de propriedade (helpers de baixo nível)
// ---------------------------------------------------------------------------

export function propTitle(text: string) {
  return { title: [{ type: "text", text: { content: text } }] };
}
export function propRichText(text: string) {
  return { rich_text: [{ type: "text", text: { content: text } }] };
}
export function propSelect(name: string) {
  return { select: { name } };
}
export function propMultiSelect(names: string[]) {
  return { multi_select: names.map((name) => ({ name })) };
}
export function propNumber(value: number) {
  return { number: value };
}
export function propDate(isoDate: string) {
  return { date: { start: isoDate } };
}
export function propRelation(ids: string[]) {
  return { relation: ids.map((id) => ({ id })) };
}

// ---------------------------------------------------------------------------
// Tipos de input
// ---------------------------------------------------------------------------

export interface AtualizarOportunidadeInput {
  pageId: string;
  estagio?: PipelineStage;
  score?: number;
  probabilidade?: number;
  valorEstimado?: number;
  proximoFollowUp?: string;     // ISO yyyy-mm-dd
  urgencia?: "Alta" | "Média" | "Baixa";
  pontoTensao?: string;
  criterioProximaFase?: string;
  notas?: string;
  confirmedByUser: true;
}

export interface RegistrarAtaInput {
  titulo: string;
  resumo: string;
  data?: string;
  tipo?: "Ata" | "Briefing" | "Relatório";
  projetoIds?: string[];
  tags?: string[];
  confirmedByUser: true;
}

export interface CriarOportunidadeInput {
  nome: string;                         // título da oportunidade (ex.: "GDF — Smart City")
  empresa?: string;                     // nome da empresa cliente
  estagio?: PipelineStage;              // default: Lead
  valorEstimado?: number;               // BRL
  probabilidade?: number;               // 0-100
  score?: number;                       // 0-100
  proximoFollowUp?: string;             // ISO yyyy-mm-dd
  urgencia?: "Alta" | "Média" | "Baixa";
  pontoTensao?: string;
  criterioProximaFase?: string;
  notas?: string;
  cluster?: string;
  agenteResponsavel?: string;
  confirmedByUser: true;
}

export interface ArquivarOportunidadeInput {
  pageId: string;
  motivo?: string;                      // registrado em Notas antes de arquivar
  confirmedByUser: true;
}

export interface CriarTarefaInput {
  nome: string;
  prioridade: "P0 - Crítica" | "P1 - Alta" | "P2 - Média" | "P3 - Baixa";
  executor?:
    | "Humano"
    | "Agente Executivo"
    | "Agente Comercial"
    | "Agente Governo/FAP"
    | "Agente Saúde"
    | "Agente Financeiro"
    | "Agente Operacional"
    | "Agente Knowledge";
  tipo?: "Estratégico" | "Operacional" | "Administrativo";
  prazo?: string;
  notas?: string;
  projetoIds?: string[];
  confirmedByUser: true;
}

// ---------------------------------------------------------------------------
// Criar oportunidade (Pipeline) — entrada no funil via voz/UI
// ---------------------------------------------------------------------------

export async function criarOportunidade(
  input: CriarOportunidadeInput,
): Promise<{ pageId: string; idHumano: string | null }> {
  if (!input.confirmedByUser) {
    throw new Error("criarOportunidade requer confirmedByUser=true");
  }
  if (!input.nome || input.nome.trim().length === 0) {
    throw new Error("Nome da oportunidade é obrigatório.");
  }

  const p = BRAIN_PROPS.pipeline;
  const properties: Record<string, unknown> = {
    [p.title]: propTitle(input.nome.trim()),
    [p.estagio]: propSelect(input.estagio ?? "Lead"),
  };

  if (input.empresa) properties[p.empresa] = propRichText(input.empresa);
  if (typeof input.valorEstimado === "number")
    properties[p.valorEstimado] = propNumber(input.valorEstimado);
  if (typeof input.probabilidade === "number") {
    if (input.probabilidade < 0 || input.probabilidade > 100) {
      throw new Error(`Probabilidade fora do intervalo 0-100: ${input.probabilidade}`);
    }
    properties[p.probabilidade] = propNumber(input.probabilidade);
  }
  if (typeof input.score === "number") {
    if (input.score < 0 || input.score > 100) {
      throw new Error(`Score fora do intervalo 0-100: ${input.score}`);
    }
    properties[p.score] = propNumber(input.score);
  }
  if (input.proximoFollowUp)
    properties[p.proximoFollowUp] = propDate(input.proximoFollowUp);
  if (input.urgencia) properties[p.urgencia] = propSelect(input.urgencia);
  if (input.pontoTensao) properties[p.pontoTensao] = propRichText(input.pontoTensao);
  if (input.criterioProximaFase)
    properties[p.criterioProximaFase] = propRichText(input.criterioProximaFase);
  if (input.notas) properties[p.notas] = propRichText(input.notas);
  if (input.cluster) properties[p.cluster] = propSelect(input.cluster);
  if (input.agenteResponsavel)
    properties[p.agenteResponsavel] = propSelect(input.agenteResponsavel);

  const res = await createPage(BRAIN_DATABASES.pipeline.id, properties);
  clearCache();
  return {
    pageId: res.id,
    idHumano: res.properties?.[p.idOportunidade]?.unique_id
      ? `${res.properties[p.idOportunidade].unique_id.prefix ?? ""}-${res.properties[p.idOportunidade].unique_id.number}`
      : null,
  };
}

// ---------------------------------------------------------------------------
// Arquivar oportunidade (soft delete) — marca archived=true no Notion
// ---------------------------------------------------------------------------

export async function arquivarOportunidade(
  input: ArquivarOportunidadeInput,
): Promise<{ pageId: string }> {
  if (!input.confirmedByUser) {
    throw new Error("arquivarOportunidade requer confirmedByUser=true");
  }
  if (!input.pageId) {
    throw new Error("pageId é obrigatório.");
  }

  // Se houver motivo, registra em Notas antes de arquivar (auditoria leve)
  if (input.motivo && input.motivo.trim().length > 0) {
    const stamp = new Date().toISOString().slice(0, 16).replace("T", " ");
    const motivoFmt = `[Arquivado em ${stamp}] ${input.motivo.trim()}`;
    try {
      await updatePage(input.pageId, {
        [BRAIN_PROPS.pipeline.notas]: propRichText(motivoFmt),
      });
    } catch {
      // não bloqueia arquivamento se update falhar
    }
  }

  await archivePage(input.pageId);
  clearCache();
  return { pageId: input.pageId };
}

// ---------------------------------------------------------------------------
// Atualizar oportunidade (Pipeline) — função central do CRM por voz
// ---------------------------------------------------------------------------

export async function atualizarOportunidade(
  input: AtualizarOportunidadeInput,
): Promise<{ pageId: string; updatedFields: string[] }> {
  if (!input.confirmedByUser) {
    throw new Error("atualizarOportunidade requer confirmedByUser=true");
  }

  const p = BRAIN_PROPS.pipeline;
  const properties: Record<string, unknown> = {};
  const updated: string[] = [];

  if (input.estagio) {
    if (!PIPELINE_STAGES.includes(input.estagio)) {
      throw new Error(`Estágio inválido: ${input.estagio}`);
    }
    properties[p.estagio] = propSelect(input.estagio);
    updated.push("estagio");
  }
  if (typeof input.score === "number") {
    if (input.score < 0 || input.score > 100) {
      throw new Error(`Score fora do intervalo 0-100: ${input.score}`);
    }
    properties[p.score] = propNumber(input.score);
    updated.push("score");
  }
  if (typeof input.probabilidade === "number") {
    properties[p.probabilidade] = propNumber(input.probabilidade);
    updated.push("probabilidade");
  }
  if (typeof input.valorEstimado === "number") {
    properties[p.valorEstimado] = propNumber(input.valorEstimado);
    updated.push("valorEstimado");
  }
  if (input.proximoFollowUp) {
    properties[p.proximoFollowUp] = propDate(input.proximoFollowUp);
    updated.push("proximoFollowUp");
  }
  if (input.urgencia) {
    properties[p.urgencia] = propSelect(input.urgencia);
    updated.push("urgencia");
  }
  if (input.pontoTensao !== undefined) {
    properties[p.pontoTensao] = propRichText(input.pontoTensao);
    updated.push("pontoTensao");
  }
  if (input.criterioProximaFase !== undefined) {
    properties[p.criterioProximaFase] = propRichText(input.criterioProximaFase);
    updated.push("criterioProximaFase");
  }
  if (input.notas !== undefined) {
    properties[p.notas] = propRichText(input.notas);
    updated.push("notas");
  }

  if (updated.length === 0) {
    throw new Error("Nenhum campo fornecido para atualizar.");
  }

  await updatePage(input.pageId, properties);
  clearCache(); // garante que próxima leitura veja os novos valores
  return { pageId: input.pageId, updatedFields: updated };
}

// ---------------------------------------------------------------------------
// Registrar ata / documento na Knowledge Base
// ---------------------------------------------------------------------------

export async function registrarAta(
  input: RegistrarAtaInput,
): Promise<{ pageId: string; idHumano: string | null }> {
  if (!input.confirmedByUser) {
    throw new Error("registrarAta requer confirmedByUser=true");
  }

  const p = BRAIN_PROPS.documentos;
  const properties: Record<string, unknown> = {
    [p.title]: propTitle(input.titulo),
    [p.tipo]: propSelect(input.tipo ?? "Ata"),
    [p.status]: propSelect("Aprovado"),
    [p.data]: propDate(input.data ?? new Date().toISOString().slice(0, 10)),
    [p.resumo]: propRichText(input.resumo),
  };

  if (input.projetoIds && input.projetoIds.length > 0) {
    properties[p.projeto] = propRelation(input.projetoIds);
  }
  if (input.tags && input.tags.length > 0) {
    properties[p.tags] = propMultiSelect(input.tags);
  }

  const res = await createPage(BRAIN_DATABASES.documentos.id, properties);
  clearCache();
  return {
    pageId: res.id,
    idHumano: res.properties?.[p.idDocumento]?.unique_id
      ? `${res.properties[p.idDocumento].unique_id.prefix ?? ""}-${res.properties[p.idDocumento].unique_id.number}`
      : null,
  };
}

// ---------------------------------------------------------------------------
// Criar tarefa
// ---------------------------------------------------------------------------

export async function criarTarefa(
  input: CriarTarefaInput,
): Promise<{ pageId: string; idHumano: string | null }> {
  if (!input.confirmedByUser) {
    throw new Error("criarTarefa requer confirmedByUser=true");
  }

  const p = BRAIN_PROPS.tarefas;
  const properties: Record<string, unknown> = {
    [p.title]: propTitle(input.nome),
    [p.prioridade]: propSelect(input.prioridade),
    [p.status]: propSelect("A Fazer"),
  };

  if (input.executor) properties[p.executor] = propSelect(input.executor);
  if (input.tipo) properties[p.tipo] = propSelect(input.tipo);
  if (input.prazo) properties[p.prazo] = propDate(input.prazo);
  if (input.notas) properties[p.notas] = propRichText(input.notas);
  if (input.projetoIds && input.projetoIds.length > 0) {
    properties[p.projeto] = propRelation(input.projetoIds);
  }

  const res = await createPage(BRAIN_DATABASES.tarefas.id, properties);
  clearCache();
  return {
    pageId: res.id,
    idHumano: res.properties?.[p.idTarefa]?.unique_id
      ? `${res.properties[p.idTarefa].unique_id.prefix ?? ""}-${res.properties[p.idTarefa].unique_id.number}`
      : null,
  };
}
