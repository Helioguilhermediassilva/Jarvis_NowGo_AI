/**
 * server/jarvisBrainTools.ts
 *
 * Tools do Jarvis NowGo expostas ao LLM (Grok) para ler e atualizar o
 * NowGo Brain (CRM/portfólio). Inclui também a tool de pesquisa externa
 * via Live Search do Grok e a tool de acionamento do SUN (placeholder
 * que registra a missão no Brain como tarefa "Agente Knowledge").
 *
 * Protocolo de escrita preview→confirma:
 *   - Toda tool de escrita aceita um campo `confirmedByUser` (default false).
 *   - Se false, a tool retorna apenas um preview do que seria gravado, NUNCA
 *     persiste. O Jarvis então deve recitar o preview por voz e perguntar
 *     "Senhor, posso confirmar?". Após resposta afirmativa, ele re-emite a
 *     tool call com `confirmedByUser: true` e aí grava.
 */

import {
  buscarOportunidadePorNome,
  listarOportunidadesQuentes,
  listarTopPorScore,
  listarFollowUpsAtrasados,
  listarBloqueiosCriticos,
  listarTarefasPendentes,
  type OportunidadeResumo,
  type TarefaResumo,
} from "./brainQueries.js";
import {
  atualizarOportunidade,
  registrarAta,
  criarTarefa,
  type AtualizarOportunidadeInput,
  type RegistrarAtaInput,
  type CriarTarefaInput,
} from "./brainMutations.js";
import { PIPELINE_STAGES } from "./brainSchema.js";

/* ------------------------------------------------------------------ */
/*  Tool definitions (formato OpenAI/Grok)                             */
/* ------------------------------------------------------------------ */

export const BRAIN_TOOLS = [
  {
    type: "function",
    function: {
      name: "brain_buscar_oportunidade",
      description:
        "Busca oportunidades no CRM/Brain pelo nome ou parte do nome. Use quando o usuário citar uma oportunidade específica e você precisar do pageId interno antes de qualquer atualização. Retorna até 10 matches com nome, idHumano, estágio, score, valor e pageId.",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description:
              "Termo de busca em português (ex: 'GDF', 'Hospital de Base', 'Lenovo').",
          },
        },
        required: ["query"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "brain_oportunidades_quentes",
      description:
        "Lista as oportunidades quentes do CRM (estágio Proposta/Negociação OU score>=80), ordenadas por score desc. Use quando o usuário pedir 'minhas oportunidades quentes', 'pipeline aquecido', 'o que está prestes a fechar'.",
      parameters: {
        type: "object",
        properties: {
          limit: { type: "integer", minimum: 1, maximum: 20, description: "Máximo de itens (default 10)." },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "brain_top_score",
      description:
        "Top N oportunidades por Score (independente do estágio, exclui fechadas). Use para 'minhas prioridades', 'top oportunidades', 'maiores scores'.",
      parameters: {
        type: "object",
        properties: {
          limit: { type: "integer", minimum: 1, maximum: 10, description: "Quantidade (default 3)." },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "brain_followups_atrasados",
      description:
        "Lista oportunidades com follow-up atrasado (data anterior a hoje). Use para 'o que está atrasado', 'pendências de follow-up'.",
      parameters: { type: "object", properties: {} },
    },
  },
  {
    type: "function",
    function: {
      name: "brain_bloqueios_criticos",
      description:
        "Lista tarefas P0/P1 ou bloqueadas no Brain. Use para 'meus bloqueios', 'pontos de atenção', 'o que está travado'.",
      parameters: { type: "object", properties: {} },
    },
  },
  {
    type: "function",
    function: {
      name: "brain_tarefas_pendentes",
      description:
        "Lista tarefas pendentes (não concluídas) ordenadas por prazo. Use para 'minhas tarefas', 'o que tenho que fazer hoje'.",
      parameters: {
        type: "object",
        properties: {
          limit: { type: "integer", minimum: 1, maximum: 30, description: "Máximo de tarefas (default 10)." },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "brain_atualizar_oportunidade",
      description:
        "Atualiza campos de uma oportunidade no CRM/Brain. PROTOCOLO DE CONFIRMAÇÃO: na primeira chamada, deixe `confirmedByUser=false` e a tool retorna apenas um preview. Você (Jarvis) lê o preview por voz, pergunta se pode confirmar; ao receber 'sim', re-emite a chamada com `confirmedByUser=true` para gravar. Use sempre o pageId obtido via brain_buscar_oportunidade.",
      parameters: {
        type: "object",
        properties: {
          pageId: { type: "string", description: "ID interno da oportunidade (page_id do Notion)." },
          estagio: {
            type: "string",
            enum: PIPELINE_STAGES as unknown as string[],
            description: "Novo estágio do pipeline.",
          },
          score: { type: "number", description: "Novo score 0-100." },
          probabilidade: { type: "number", description: "Probabilidade 0-100 (%)." },
          valorEstimado: { type: "number", description: "Valor estimado em BRL." },
          proximoFollowUp: { type: "string", description: "Data ISO yyyy-mm-dd do próximo follow-up." },
          urgencia: { type: "string", enum: ["Alta", "Média", "Baixa"] },
          pontoTensao: { type: "string", description: "Texto livre sobre o ponto de tensão atual." },
          criterioProximaFase: { type: "string", description: "Critério para avançar de estágio." },
          notas: { type: "string", description: "Anotação livre." },
          confirmedByUser: {
            type: "boolean",
            description: "true SOMENTE depois que o usuário confirmou verbalmente o preview. false retorna apenas o preview.",
          },
        },
        required: ["pageId"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "brain_registrar_ata",
      description:
        "Registra uma ata/briefing/relatório na base Documentos do Brain. PROTOCOLO DE CONFIRMAÇÃO igual ao update de oportunidade.",
      parameters: {
        type: "object",
        properties: {
          titulo: { type: "string" },
          resumo: { type: "string", description: "Resumo executivo (até ~2000 chars)." },
          tipo: { type: "string", enum: ["Ata", "Briefing", "Relatório"], description: "Default: Ata." },
          data: { type: "string", description: "Data ISO yyyy-mm-dd. Default: hoje." },
          tags: { type: "array", items: { type: "string" } },
          confirmedByUser: { type: "boolean" },
        },
        required: ["titulo", "resumo"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "brain_criar_tarefa",
      description:
        "Cria uma tarefa nova no Brain. PROTOCOLO DE CONFIRMAÇÃO igual aos outros writes.",
      parameters: {
        type: "object",
        properties: {
          nome: { type: "string" },
          prioridade: {
            type: "string",
            enum: ["P0 - Crítica", "P1 - Alta", "P2 - Média", "P3 - Baixa"],
          },
          executor: {
            type: "string",
            enum: [
              "Humano",
              "Agente Executivo",
              "Agente Comercial",
              "Agente Governo-FAP",
              "Agente Saúde",
              "Agente Financeiro",
              "Agente Operacional",
              "Agente Knowledge",
            ],
          },
          tipo: { type: "string", enum: ["Estratégico", "Operacional", "Administrativo"] },
          prazo: { type: "string", description: "Data ISO yyyy-mm-dd." },
          notas: { type: "string" },
          confirmedByUser: { type: "boolean" },
        },
        required: ["nome", "prioridade"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "pesquisa_externa",
      description:
        "Faz pesquisa externa em tempo real (web + X/Twitter) via Live Search. Use para fatos recentes, notícias, cotações, dados públicos NÃO presentes no Brain ou no contexto. Retorna síntese textual.",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string", description: "Pergunta ou termo de pesquisa." },
          escopo: {
            type: "string",
            enum: ["web", "x", "ambos"],
            description: "Onde buscar. Default: ambos.",
          },
        },
        required: ["query"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "sun_executar_missao",
      description:
        "Aciona o SUN (agente assíncrono interno NowGo) para executar uma missão longa em background (ex.: regenerar Plano SUN, redigir documento extenso, varrer portfólio, pesquisa profunda multi-fonte). PROTOCOLO DE CONFIRMAÇÃO: peça confirmação ao usuário antes (`confirmedByUser=true`). A missão é registrada como tarefa 'Agente Knowledge' no Brain e o SUN processará em background.",
      parameters: {
        type: "object",
        properties: {
          objetivo: { type: "string", description: "O que o SUN deve entregar (frase clara)." },
          prazo: { type: "string", description: "Data ISO yyyy-mm-dd até quando." },
          contexto: { type: "string", description: "Contexto adicional (até ~2000 chars)." },
          confirmedByUser: { type: "boolean" },
        },
        required: ["objetivo"],
      },
    },
  },
] as const;

/* ------------------------------------------------------------------ */
/*  Handlers                                                            */
/* ------------------------------------------------------------------ */

function compactOpp(o: OportunidadeResumo) {
  return {
    pageId: o.id,
    nome: o.nome,
    idHumano: o.idHumano,
    estagio: o.estagio,
    score: o.score,
    valorEstimado: o.valorEstimado,
    urgencia: o.urgencia,
    proximoFollowUp: o.proximoFollowUp,
    pontoTensao: o.pontoTensao,
  };
}

function compactTask(t: TarefaResumo) {
  return {
    pageId: t.id,
    nome: t.nome,
    idHumano: t.idHumano,
    status: t.status,
    prioridade: t.prioridade,
    executor: t.executor,
    prazo: t.prazo,
  };
}

/** Indica se a tool produziu uma mutação real no Brain (write committed). */
export interface BrainToolResult {
  content: string;
  mutated: boolean;
}

export async function executeBrainTool(
  name: string,
  args: Record<string, unknown>,
): Promise<BrainToolResult | null> {
  // ----- LEITURAS -----
  if (name === "brain_buscar_oportunidade") {
    const q = String(args.query || "").slice(0, 200);
    if (!q) return { content: JSON.stringify({ error: "query vazia" }), mutated: false };
    const results = await buscarOportunidadePorNome(q);
    return {
      content: JSON.stringify({ count: results.length, oportunidades: results.map(compactOpp) }),
      mutated: false,
    };
  }
  if (name === "brain_oportunidades_quentes") {
    const limit = Math.max(1, Math.min(20, Number(args.limit ?? 10)));
    const results = await listarOportunidadesQuentes(limit);
    return { content: JSON.stringify({ count: results.length, oportunidades: results.map(compactOpp) }), mutated: false };
  }
  if (name === "brain_top_score") {
    const limit = Math.max(1, Math.min(10, Number(args.limit ?? 3)));
    const results = await listarTopPorScore(limit);
    return { content: JSON.stringify({ count: results.length, oportunidades: results.map(compactOpp) }), mutated: false };
  }
  if (name === "brain_followups_atrasados") {
    const results = await listarFollowUpsAtrasados();
    return { content: JSON.stringify({ count: results.length, oportunidades: results.map(compactOpp) }), mutated: false };
  }
  if (name === "brain_bloqueios_criticos") {
    const results = await listarBloqueiosCriticos();
    return { content: JSON.stringify({ count: results.length, tarefas: results.map(compactTask) }), mutated: false };
  }
  if (name === "brain_tarefas_pendentes") {
    const limit = Math.max(1, Math.min(30, Number(args.limit ?? 10)));
    const results = await listarTarefasPendentes(limit);
    return { content: JSON.stringify({ count: results.length, tarefas: results.map(compactTask) }), mutated: false };
  }

  // ----- ESCRITAS (preview→confirma) -----
  if (name === "brain_atualizar_oportunidade") {
    const confirmed = args.confirmedByUser === true;
    const fields: string[] = [];
    if (args.estagio) fields.push(`estagio=${args.estagio}`);
    if (args.score !== undefined) fields.push(`score=${args.score}`);
    if (args.probabilidade !== undefined) fields.push(`probabilidade=${args.probabilidade}`);
    if (args.valorEstimado !== undefined) fields.push(`valorEstimado=${args.valorEstimado}`);
    if (args.proximoFollowUp) fields.push(`proximoFollowUp=${args.proximoFollowUp}`);
    if (args.urgencia) fields.push(`urgencia=${args.urgencia}`);
    if (args.pontoTensao !== undefined) fields.push("pontoTensao=...");
    if (args.criterioProximaFase !== undefined) fields.push("criterioProximaFase=...");
    if (args.notas !== undefined) fields.push("notas=...");

    if (!confirmed) {
      return {
        content: JSON.stringify({
          preview: true,
          message: "Preview da atualização. Recite ao usuário e peça confirmação verbal antes de re-emitir com confirmedByUser=true.",
          pageId: args.pageId,
          camposParaAtualizar: fields,
        }),
        mutated: false,
      };
    }
    if (!args.pageId) {
      return { content: JSON.stringify({ error: "pageId obrigatório" }), mutated: false };
    }
    try {
      const out = await atualizarOportunidade({
        ...args,
        confirmedByUser: true,
      } as AtualizarOportunidadeInput);
      return {
        content: JSON.stringify({
          ok: true,
          message: "Oportunidade atualizada no Brain. Cockpit deve refrescar automaticamente.",
          pageId: out.pageId,
          updatedFields: out.updatedFields,
        }),
        mutated: true,
      };
    } catch (e) {
      return { content: JSON.stringify({ error: (e as Error).message }), mutated: false };
    }
  }

  if (name === "brain_registrar_ata") {
    const confirmed = args.confirmedByUser === true;
    if (!confirmed) {
      return {
        content: JSON.stringify({
          preview: true,
          message: "Preview da ata. Recite e peça confirmação antes de re-emitir.",
          titulo: args.titulo,
          tipo: args.tipo ?? "Ata",
          data: args.data ?? new Date().toISOString().slice(0, 10),
          resumoPreview: String(args.resumo || "").slice(0, 240) + "...",
        }),
        mutated: false,
      };
    }
    try {
      const out = await registrarAta({ ...args, confirmedByUser: true } as RegistrarAtaInput);
      return {
        content: JSON.stringify({
          ok: true,
          message: "Ata registrada no Brain.",
          pageId: out.pageId,
          idHumano: out.idHumano,
        }),
        mutated: true,
      };
    } catch (e) {
      return { content: JSON.stringify({ error: (e as Error).message }), mutated: false };
    }
  }

  if (name === "brain_criar_tarefa") {
    const confirmed = args.confirmedByUser === true;
    if (!confirmed) {
      return {
        content: JSON.stringify({
          preview: true,
          message: "Preview da tarefa. Recite e peça confirmação antes de re-emitir.",
          nome: args.nome,
          prioridade: args.prioridade,
          executor: args.executor,
          prazo: args.prazo,
        }),
        mutated: false,
      };
    }
    try {
      const normalized = { ...args };
      if (normalized.executor === "Agente Governo-FAP") normalized.executor = "Agente Governo/FAP";
      const out = await criarTarefa({ ...normalized, confirmedByUser: true } as CriarTarefaInput);
      return {
        content: JSON.stringify({
          ok: true,
          message: "Tarefa criada no Brain.",
          pageId: out.pageId,
          idHumano: out.idHumano,
        }),
        mutated: true,
      };
    } catch (e) {
      return { content: JSON.stringify({ error: (e as Error).message }), mutated: false };
    }
  }

  // ----- PESQUISA EXTERNA (Grok Live Search) -----
  if (name === "pesquisa_externa") {
    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) return { content: JSON.stringify({ error: "Live Search não configurado" }), mutated: false };
    const query = String(args.query || "").slice(0, 400);
    const escopo = String(args.escopo || "ambos");
    if (!query) return { content: JSON.stringify({ error: "query vazia" }), mutated: false };
    const sources: Array<{ type: string }> = [];
    if (escopo === "web" || escopo === "ambos") sources.push({ type: "web" });
    if (escopo === "x" || escopo === "ambos") sources.push({ type: "x" });
    try {
      const r = await fetch("https://api.x.ai/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({
          model: "grok-4.3",
          messages: [
            { role: "system", content: "Você é um pesquisador. Responda em português, em até 6 linhas, com dados verificáveis e citando a fonte (sem URL crua, apenas o nome da fonte)." },
            { role: "user", content: query },
          ],
          search_parameters: { mode: "auto", sources },
          temperature: 0.3,
        }),
        signal: AbortSignal.timeout(45_000),
      });
      const txt = await r.text();
      if (!r.ok) return { content: JSON.stringify({ error: `Live Search ${r.status}: ${txt.slice(0, 200)}` }), mutated: false };
      const data = JSON.parse(txt) as { choices?: Array<{ message?: { content?: string } }> };
      const out = data.choices?.[0]?.message?.content || "";
      return { content: JSON.stringify({ resposta: out.slice(0, 2400), escopo }), mutated: false };
    } catch (e) {
      return { content: JSON.stringify({ error: `pesquisa_externa: ${(e as Error).message}` }), mutated: false };
    }
  }

  // ----- SUN — acionar missão assíncrona -----
  if (name === "sun_executar_missao") {
    const confirmed = args.confirmedByUser === true;
    const objetivo = String(args.objetivo || "").slice(0, 400);
    const contexto = String(args.contexto || "").slice(0, 2000);
    const prazo = args.prazo ? String(args.prazo) : undefined;
    if (!objetivo) return { content: JSON.stringify({ error: "objetivo vazio" }), mutated: false };
    if (!confirmed) {
      return {
        content: JSON.stringify({
          preview: true,
          message: "Preview da missão SUN. Confirme verbalmente antes de re-emitir.",
          objetivo,
          prazo: prazo ?? null,
          contextoResumo: contexto.slice(0, 240) + (contexto.length > 240 ? "..." : ""),
        }),
        mutated: false,
      };
    }
    // Materializa a missão como tarefa de Agente Knowledge no Brain.
    try {
      const out = await criarTarefa({
        nome: `[SUN] ${objetivo}`,
        prioridade: "P1 - Alta",
        executor: "Agente Knowledge",
        tipo: "Estratégico",
        prazo,
        notas: contexto,
        confirmedByUser: true,
      });
      return {
        content: JSON.stringify({
          ok: true,
          message: "Missão SUN registrada. Será executada em background pelo agente assíncrono NowGo.",
          taskPageId: out.pageId,
          idHumano: out.idHumano,
        }),
        mutated: true,
      };
    } catch (e) {
      return { content: JSON.stringify({ error: (e as Error).message }), mutated: false };
    }
  }

  return null; // não é uma tool de Brain
}
