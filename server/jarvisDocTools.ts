/**
 * server/jarvisDocTools.ts
 *
 * Tools do Jarvis para geração de documentos NowGo (apresentação, proposta,
 * contrato, one-page, pitch deck).
 *
 * Fluxo de cada tool:
 *  1. Recebe um briefing curto vindo do Jarvis.
 *  2. Pede ao Grok que expanda o briefing em conteúdo estruturado (JSON).
 *  3. Chama o gerador adequado (server/docGenerators.ts).
 *  4. Tenta upload no Google Drive (server/googleDrive.ts) — se ausente,
 *     responde com link `data:` codificado em base64 para o usuário baixar.
 *  5. Devolve `webViewLink` + nome do arquivo + caminho da pasta.
 *
 * Todas as tools seguem protocolo preview→confirma:
 *  - Se `confirmedByUser` !== true, devolve um preview e NÃO gera.
 *  - Se `confirmedByUser` === true, gera + envia.
 */

// docGenerators carrega bibliotecas pesadas (pptxgenjs/docx/pdfkit). Importamos
// apenas tipos estáticos aqui; as funções geradoras são carregadas via dynamic import
// no momento da execução, mantendo o cold-start do chat-stream rápido.
import type {
  ApresentacaoInput, PropostaInput, ContratoInput, OnePageInput, PitchDeckInput,
  GeneratedDoc,
} from "./docGenerators.js";
import { uploadFile, isDriveConfigured, type DriveSubfolder } from "./googleDrive.js";

async function gen() {
  return await import("./docGenerators.js");
}

interface ToolHandlerResult {
  content: string;
  mutated: boolean;
}

// -------- Schemas das tools (a serem registrados em JARVIS_TOOLS) --------

export const DOC_TOOLS = [
  {
    type: "function" as const,
    function: {
      name: "criar_apresentacao",
      description:
        "Gera uma apresentação institucional (PPTX) da NowGo Holding com identidade visual NowGo Sovereign Stack. Use para apresentações de projetos, executivas, propostas visuais, ou pitches internos. Sempre confirme com o usuário antes de gerar.",
      parameters: {
        type: "object",
        properties: {
          titulo: { type: "string", description: "Título principal da apresentação." },
          subtitulo: { type: "string" },
          cliente: { type: "string", description: "A quem se destina (opcional)." },
          briefing: {
            type: "string",
            description:
              "Briefing curto (1-3 parágrafos) descrevendo o conteúdo desejado. O Jarvis usará isto para expandir em slides.",
          },
          numSlides: { type: "integer", minimum: 6, maximum: 25, description: "Quantidade de slides de conteúdo (default 10)." },
          confirmedByUser: { type: "boolean", description: "true se o usuário já confirmou; false ou omisso = preview only." },
        },
        required: ["titulo", "briefing"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "criar_proposta_comercial",
      description:
        "Gera uma proposta comercial (DOCX) completa: capa, sumário executivo, escopo, entregáveis, cronograma, investimento e próximos passos. Use quando o founder pedir para preparar proposta para um cliente. Sempre confirme antes de gerar.",
      parameters: {
        type: "object",
        properties: {
          titulo: { type: "string" },
          cliente: { type: "string", description: "Nome do cliente/órgão." },
          contatoCliente: { type: "string", description: "Pessoa-chave no cliente (opcional)." },
          briefing: {
            type: "string",
            description: "Briefing detalhado: contexto, problema, escopo desejado, prazo, valor estimado, condições.",
          },
          confirmedByUser: { type: "boolean" },
        },
        required: ["titulo", "cliente", "briefing"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "criar_contrato",
      description:
        "Gera um contrato (DOCX) — MSA, SOW ou NDA — com cláusulas-padrão NowGo + variáveis preenchidas. Sempre confirme antes de gerar e avise que requer revisão jurídica.",
      parameters: {
        type: "object",
        properties: {
          tipo: { type: "string", enum: ["MSA", "SOW", "NDA"] },
          titulo: { type: "string" },
          contratante: { type: "string", description: "Nome completo da contratante (parte cliente)." },
          contratada: { type: "string", description: "Default: NowGo AI Holding LTDA." },
          briefing: {
            type: "string",
            description: "Objeto, prazo, valor (se SOW), entregáveis, riscos especiais, foro.",
          },
          confirmedByUser: { type: "boolean" },
        },
        required: ["tipo", "titulo", "contratante", "briefing"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "criar_one_page",
      description:
        "Gera um one-page (PDF, 1 página) com executive summary visual da NowGo. Útil para entregar a CEOs, governadores ou conselhos antes de uma reunião. Sempre confirme.",
      parameters: {
        type: "object",
        properties: {
          titulo: { type: "string" },
          subtitulo: { type: "string" },
          cliente: { type: "string" },
          briefing: { type: "string", description: "Desafio, solução proposta, diferenciais, resultados esperados, CTA." },
          confirmedByUser: { type: "boolean" },
        },
        required: ["titulo", "briefing"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "criar_pitch_deck",
      description:
        "Gera um pitch deck (PPTX) clássico de startup com problem/solution/market/product/traction/business/team/ask. Use para apresentações a investidores ou parceiros estratégicos. Sempre confirme.",
      parameters: {
        type: "object",
        properties: {
          empresa: { type: "string" },
          oneliner: { type: "string", description: "Frase única que descreve a empresa." },
          briefing: {
            type: "string",
            description: "Contexto operacional: produto, mercado, tração, modelo, time, ask.",
          },
          confirmedByUser: { type: "boolean" },
        },
        required: ["empresa", "oneliner", "briefing"],
      },
    },
  },
];

// ----------------- LLM helper para expandir briefings -----------------

async function callGrokForJson<T>(systemPrompt: string, userPrompt: string): Promise<T> {
  const apiKey = process.env.XAI_API_KEY;
  if (!apiKey) throw new Error("XAI_API_KEY ausente — não é possível expandir briefing.");

  const r = await fetch("https://api.x.ai/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "grok-4.3",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.4,
    }),
  });
  if (!r.ok) throw new Error(`Grok ${r.status}: ${(await r.text()).slice(0, 200)}`);
  const data = (await r.json()) as { choices?: Array<{ message?: { content?: string } }> };
  const txt = data.choices?.[0]?.message?.content || "";
  try {
    return JSON.parse(txt) as T;
  } catch {
    throw new Error(`Grok devolveu JSON inválido: ${txt.slice(0, 200)}`);
  }
}

// ----------------- Upload helper (Drive ou base64) -----------------

async function publishDoc(
  doc: GeneratedDoc,
  subfolder: DriveSubfolder,
): Promise<{ where: string; link: string; folder: string }> {
  if (isDriveConfigured()) {
    const up = await uploadFile({
      subfolder,
      fileName: doc.fileName,
      mimeType: doc.mimeType,
      data: doc.buffer,
      shareAnyone: false,
    });
    if (up.ok) {
      return { where: "drive", link: up.webViewLink, folder: `Arquivos_NowGo_AI/${subfolder}` };
    }
    // Se falhar, cai no fallback abaixo
  }
  // Fallback: data URL base64 (frontend pode oferecer download direto).
  const dataUrl = `data:${doc.mimeType};base64,${doc.buffer.toString("base64")}`;
  return { where: "fallback", link: dataUrl, folder: "(local — Drive não configurado)" };
}

// ============================================================================
//  EXECUTOR PRINCIPAL
// ============================================================================

export async function executeDocTool(
  name: string,
  args: Record<string, unknown>,
): Promise<ToolHandlerResult | null> {
  // ----- 1. APRESENTAÇÃO -----
  if (name === "criar_apresentacao") {
    const titulo = String(args.titulo || "");
    const briefing = String(args.briefing || "");
    if (!args.confirmedByUser) {
      return {
        content: JSON.stringify({
          preview: true,
          mensagem: `Vou preparar uma apresentação intitulada "${titulo}" baseada no briefing recebido. Posso confirmar?`,
          dados: { titulo, subtitulo: args.subtitulo, cliente: args.cliente, numSlides: args.numSlides || 10 },
        }),
        mutated: false,
      };
    }
    const numSlides = Number(args.numSlides || 10);
    const expanded = await callGrokForJson<ApresentacaoInput>(
      "Você é um redator estratégico da NowGo Holding. Expanda o briefing em uma apresentação executiva. Devolva JSON com `titulo`, `subtitulo`, `cliente`, `slides` (array de { titulo, bullets[], notas? }). Cada slide deve ter 3-6 bullets concisos e sem hype.",
      `Briefing:\n${briefing}\n\nQuantidade de slides de conteúdo: ${numSlides}. Use linguagem sóbria e factual.`,
    );
    const input: ApresentacaoInput = {
      titulo: titulo || expanded.titulo,
      subtitulo: (args.subtitulo as string) || expanded.subtitulo,
      cliente: (args.cliente as string) || expanded.cliente,
      autor: "Jarvis NowGo",
      slides: expanded.slides || [],
    };
    const doc = await (await gen()).gerarApresentacao(input);
    const out = await publishDoc(doc, "Apresentacoes");
    return {
      content: JSON.stringify({
        ok: true,
        message: `Apresentação gerada: ${doc.fileName}`,
        fileName: doc.fileName,
        link: out.link,
        folder: out.folder,
        where: out.where,
      }),
      mutated: false,
    };
  }

  // ----- 2. PROPOSTA -----
  if (name === "criar_proposta_comercial") {
    const titulo = String(args.titulo || "");
    const cliente = String(args.cliente || "");
    const briefing = String(args.briefing || "");
    if (!args.confirmedByUser) {
      return {
        content: JSON.stringify({
          preview: true,
          mensagem: `Vou preparar a proposta "${titulo}" para ${cliente}. Posso confirmar?`,
          dados: { titulo, cliente, contatoCliente: args.contatoCliente },
        }),
        mutated: false,
      };
    }
    const expanded = await callGrokForJson<PropostaInput>(
      "Você é um especialista comercial da NowGo Holding. Estruture o briefing em uma proposta comercial completa. Devolva JSON com `titulo`, `cliente`, `contatoCliente`, `sumarioExecutivo`, `escopo` (array), `entregaveis` (array), `cronograma` (array de { fase, prazo, descricao }), `investimento` ({ valorTotal, condicoes }), `proximosPassos` (array). Linguagem profissional, sem hype, com números concretos.",
      `Briefing:\n${briefing}\n\nCliente: ${cliente}\nTítulo: ${titulo}`,
    );
    const input: PropostaInput = {
      ...expanded,
      titulo,
      cliente,
      contatoCliente: (args.contatoCliente as string) || expanded.contatoCliente,
    };
    const doc = await (await gen()).gerarProposta(input);
    const out = await publishDoc(doc, "Propostas");
    return {
      content: JSON.stringify({
        ok: true,
        message: `Proposta gerada: ${doc.fileName}`,
        fileName: doc.fileName,
        link: out.link,
        folder: out.folder,
        where: out.where,
      }),
      mutated: false,
    };
  }

  // ----- 3. CONTRATO -----
  if (name === "criar_contrato") {
    const tipo = String(args.tipo || "MSA") as "MSA" | "SOW" | "NDA";
    const titulo = String(args.titulo || "");
    const contratante = String(args.contratante || "");
    const briefing = String(args.briefing || "");
    if (!args.confirmedByUser) {
      return {
        content: JSON.stringify({
          preview: true,
          mensagem: `Vou preparar um ${tipo} preliminar entre ${contratante} e NowGo AI Holding LTDA, intitulado "${titulo}". Lembre-se que requer revisão jurídica antes de assinatura. Posso confirmar?`,
          dados: { tipo, titulo, contratante, contratada: args.contratada || "NowGo AI Holding LTDA" },
        }),
        mutated: false,
      };
    }
    const expanded = await callGrokForJson<ContratoInput>(
      "Você é um redator jurídico assistente da NowGo Holding. Estruture o briefing em um contrato preliminar (NUNCA substitui revisão por advogado). Devolva JSON com `tipo`, `titulo`, `contratante`, `contratada`, `objeto`, `clausulas` (array de { titulo, texto }), `vigencia`, `foro`. Use cláusulas padrão claras e justas.",
      `Tipo: ${tipo}\nTítulo: ${titulo}\nContratante: ${contratante}\nBriefing: ${briefing}`,
    );
    const input: ContratoInput = {
      ...expanded,
      tipo,
      titulo,
      contratante,
      contratada: (args.contratada as string) || expanded.contratada,
    };
    const doc = await (await gen()).gerarContrato(input);
    const out = await publishDoc(doc, "Contratos");
    return {
      content: JSON.stringify({
        ok: true,
        message: `Contrato preliminar gerado: ${doc.fileName} (revisão jurídica obrigatória).`,
        fileName: doc.fileName,
        link: out.link,
        folder: out.folder,
        where: out.where,
        avisoLegal: "Documento preliminar gerado por IA. Requer revisão jurídica antes de assinatura.",
      }),
      mutated: false,
    };
  }

  // ----- 4. ONE-PAGE -----
  if (name === "criar_one_page") {
    const titulo = String(args.titulo || "");
    const briefing = String(args.briefing || "");
    if (!args.confirmedByUser) {
      return {
        content: JSON.stringify({
          preview: true,
          mensagem: `Vou preparar um one-page intitulado "${titulo}". Posso confirmar?`,
          dados: { titulo, subtitulo: args.subtitulo, cliente: args.cliente },
        }),
        mutated: false,
      };
    }
    const expanded = await callGrokForJson<OnePageInput>(
      "Você é um redator estratégico da NowGo. Devolva JSON com `titulo`, `subtitulo`, `cliente`, `desafio`, `solucao`, `diferenciais` (array), `resultadosEsperados` (array), `cta`. Conciso, 1 página, sem hype.",
      `Briefing:\n${briefing}`,
    );
    const input: OnePageInput = {
      ...expanded,
      titulo,
      subtitulo: (args.subtitulo as string) || expanded.subtitulo,
      cliente: (args.cliente as string) || expanded.cliente,
    };
    const doc = await (await gen()).gerarOnePage(input);
    const out = await publishDoc(doc, "OnePages");
    return {
      content: JSON.stringify({
        ok: true,
        message: `One-page gerado: ${doc.fileName}`,
        fileName: doc.fileName,
        link: out.link,
        folder: out.folder,
        where: out.where,
      }),
      mutated: false,
    };
  }

  // ----- 5. PITCH DECK -----
  if (name === "criar_pitch_deck") {
    const empresa = String(args.empresa || "");
    const oneliner = String(args.oneliner || "");
    const briefing = String(args.briefing || "");
    if (!args.confirmedByUser) {
      return {
        content: JSON.stringify({
          preview: true,
          mensagem: `Vou preparar um pitch deck para ${empresa} com a tese "${oneliner}". Posso confirmar?`,
          dados: { empresa, oneliner },
        }),
        mutated: false,
      };
    }
    const expanded = await callGrokForJson<PitchDeckInput>(
      "Você é um especialista em pitch decks de startup. Estruture o briefing nas seções clássicas. Devolva JSON com `empresa`, `oneliner`, `problema`, `solucao`, `mercado`, `produto`, `tracao`, `modeloNegocio`, `time` (array), `ask`. Cada seção deve ser concisa, factual, sem buzzwords.",
      `Empresa: ${empresa}\nOneliner: ${oneliner}\nBriefing: ${briefing}`,
    );
    const input: PitchDeckInput = { ...expanded, empresa, oneliner };
    const doc = await (await gen()).gerarPitchDeck(input);
    const out = await publishDoc(doc, "PitchDecks");
    return {
      content: JSON.stringify({
        ok: true,
        message: `Pitch deck gerado: ${doc.fileName}`,
        fileName: doc.fileName,
        link: out.link,
        folder: out.folder,
        where: out.where,
      }),
      mutated: false,
    };
  }

  return null; // Não é uma DocTool
}
