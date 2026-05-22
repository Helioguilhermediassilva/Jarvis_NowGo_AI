/**
 * server/docGenerators.ts
 *
 * Geradores de documentos da NowGo Sovereign Stack (executados pelo Jarvis a comando de voz).
 * Cinco famílias: Apresentação, Proposta Comercial, Contrato, One-Page, Pitch Deck.
 *
 * Identidade visual provisória (até templates Master NowGo serem definidos):
 *   - Paleta: ciano #00d4ff, azul-marinho #061026, grafite #14233a, cinza-claro #d6e2f3
 *   - Tipografia: Calibri/Arial (PPTX/DOCX), Helvetica (PDF)
 *   - Capa com monograma "N." em ciano sobre fundo azul-marinho
 *   - Rodapé: "NowGo Holding · NowGo Sovereign Stack · CONFIDENCIAL"
 */

// Compatibilidade ESM/CJS no runtime serverless do Vercel:
// pptxgenjs e docx expõem ESM (.es.js / .mjs) que internamente usam `import`
// statements; em alguns runtimes Node esses arquivos são avaliados como CJS
// e disparam "Cannot use import statement outside a module".
// Forçamos a versão CJS via createRequire para garantir compatibilidade total.
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
/* eslint-disable @typescript-eslint/no-var-requires */
const PptxGenJS: any = require("pptxgenjs");
const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType,
  PageBreak, Footer, Header,
} = require("docx") as typeof import("docx");
const PDFDocument: any = require("pdfkit");
/* eslint-enable @typescript-eslint/no-var-requires */
// Tipos ainda vêm dos pacotes ESM (apenas em compile-time)
import type { Paragraph as DocxParagraph } from "docx";

// -------- Paleta NowGo --------
const NOWGO_CYAN = "00D4FF";
const NOWGO_NAVY = "061026";
const NOWGO_GRAPH = "14233A";
const NOWGO_LIGHT = "D6E2F3";
const NOWGO_FOOTER = "NowGo Holding · NowGo Sovereign Stack · CONFIDENCIAL";

// -------- Tipos comuns --------
export interface GeneratedDoc {
  fileName: string;
  mimeType: string;
  buffer: Buffer;
}

function slug(s: string): string {
  return s
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-|-$/g, "")
    .toLowerCase()
    .slice(0, 60);
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

/* ================================================================== */
/*  1) APRESENTAÇÃO                                                      */
/* ================================================================== */

export interface ApresentacaoInput {
  titulo: string;
  subtitulo?: string;
  cliente?: string;
  autor?: string;
  /** Lista ordenada de seções/slides com bullets. */
  slides: Array<{
    titulo: string;
    bullets: string[];
    /** Notas opcionais (footnotes / speaker notes). */
    notas?: string;
  }>;
}

export async function gerarApresentacao(input: ApresentacaoInput): Promise<GeneratedDoc> {
  const pptx = new PptxGenJS();
  pptx.layout = "LAYOUT_WIDE"; // 13.33 x 7.5
  pptx.title = input.titulo;
  pptx.company = "NowGo Holding";
  pptx.author = input.autor || "Jarvis NowGo";

  // Capa
  const cover = pptx.addSlide();
  cover.background = { color: NOWGO_NAVY };
  cover.addText("N.", {
    x: 0.5, y: 0.4, w: 1.5, h: 1.5,
    fontSize: 60, bold: true, color: NOWGO_CYAN, fontFace: "Calibri",
  });
  cover.addText(input.titulo, {
    x: 0.7, y: 2.5, w: 12, h: 1.6,
    fontSize: 40, bold: true, color: "FFFFFF", fontFace: "Calibri",
  });
  if (input.subtitulo) {
    cover.addText(input.subtitulo, {
      x: 0.7, y: 4.2, w: 12, h: 0.8,
      fontSize: 22, color: NOWGO_LIGHT, fontFace: "Calibri",
    });
  }
  if (input.cliente) {
    cover.addText(`Apresentado a: ${input.cliente}`, {
      x: 0.7, y: 5.2, w: 12, h: 0.5, fontSize: 16, color: NOWGO_CYAN,
    });
  }
  cover.addText(`${todayIso()} · NowGo Holding`, {
    x: 0.7, y: 6.7, w: 12, h: 0.4, fontSize: 12, color: NOWGO_LIGHT, italic: true,
  });

  // Slides de conteúdo
  for (const s of input.slides) {
    const sl = pptx.addSlide();
    sl.background = { color: "FFFFFF" };
    // Faixa lateral cyan
    sl.addShape(pptx.ShapeType.rect, {
      x: 0, y: 0, w: 0.25, h: 7.5, fill: { color: NOWGO_CYAN },
    });
    sl.addText(s.titulo, {
      x: 0.6, y: 0.4, w: 12.4, h: 0.8,
      fontSize: 28, bold: true, color: NOWGO_NAVY, fontFace: "Calibri",
    });
    sl.addText(
      s.bullets.map((b) => ({ text: b, options: { bullet: true, color: NOWGO_GRAPH } })),
      { x: 0.7, y: 1.6, w: 12.0, h: 5.0, fontSize: 16, fontFace: "Calibri", paraSpaceAfter: 8 },
    );
    sl.addText(NOWGO_FOOTER, {
      x: 0.6, y: 7.05, w: 12, h: 0.3, fontSize: 9, color: NOWGO_GRAPH, italic: true,
    });
    if (s.notas) sl.addNotes(s.notas);
  }

  // Slide de fechamento
  const closing = pptx.addSlide();
  closing.background = { color: NOWGO_NAVY };
  closing.addText("Obrigado.", {
    x: 0.7, y: 3.0, w: 12, h: 1.2, fontSize: 56, bold: true, color: NOWGO_CYAN,
  });
  closing.addText("NowGo Holding · contato@nowgoai.com", {
    x: 0.7, y: 4.3, w: 12, h: 0.6, fontSize: 18, color: "FFFFFF",
  });

  const buf = await (pptx.write({ outputType: "nodebuffer" }) as Promise<Buffer>);
  return {
    fileName: `${todayIso()}-${slug(input.titulo)}.pptx`,
    mimeType: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    buffer: buf,
  };
}

/* ================================================================== */
/*  2) PROPOSTA COMERCIAL                                                */
/* ================================================================== */

export interface PropostaInput {
  titulo: string;
  cliente: string;
  contatoCliente?: string;
  sumarioExecutivo: string;
  escopo: string[];
  entregaveis: string[];
  cronograma: Array<{ fase: string; prazo: string; descricao: string }>;
  investimento: { valorTotal: string; condicoes: string };
  proximosPassos: string[];
}

export async function gerarProposta(input: PropostaInput): Promise<GeneratedDoc> {
  const titleP = (txt: string, level: (typeof HeadingLevel)[keyof typeof HeadingLevel]) =>
    new Paragraph({
      heading: level,
      spacing: { before: 240, after: 120 },
      children: [new TextRun({ text: txt, bold: true, color: NOWGO_NAVY })],
    });
  const bodyP = (txt: string, opts: { bold?: boolean; italics?: boolean } = {}) =>
    new Paragraph({
      spacing: { after: 120 },
      children: [new TextRun({ text: txt, ...opts })],
    });
  const bulletP = (txt: string) =>
    new Paragraph({ bullet: { level: 0 }, children: [new TextRun({ text: txt })] });

  const doc = new Document({
    creator: "Jarvis NowGo",
    title: input.titulo,
    description: `Proposta comercial NowGo para ${input.cliente}`,
    styles: { default: { document: { run: { font: "Calibri", size: 22 } } } },
    sections: [
      {
        headers: { default: new Header({ children: [bodyP("NowGo Sovereign Stack", { italics: true })] }) },
        footers: { default: new Footer({ children: [bodyP(NOWGO_FOOTER, { italics: true })] }) },
        children: [
          // Capa
          new Paragraph({
            alignment: AlignmentType.CENTER, spacing: { before: 1200, after: 240 },
            children: [new TextRun({ text: "N.", bold: true, color: NOWGO_CYAN, size: 120 })],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: input.titulo, bold: true, size: 48, color: NOWGO_NAVY })],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER, spacing: { before: 240 },
            children: [new TextRun({ text: `Proposta para ${input.cliente}`, italics: true, size: 28, color: NOWGO_GRAPH })],
          }),
          ...(input.contatoCliente
            ? [new Paragraph({
              alignment: AlignmentType.CENTER, spacing: { before: 120 },
              children: [new TextRun({ text: input.contatoCliente, italics: true, size: 22 })],
            })]
            : []),
          new Paragraph({
            alignment: AlignmentType.CENTER, spacing: { before: 240 },
            children: [new TextRun({ text: `Brasília · ${todayIso()}`, size: 22, color: NOWGO_GRAPH })],
          }),
          new Paragraph({ children: [new PageBreak()] }),

          // Conteúdo
          titleP("1. Sumário Executivo", HeadingLevel.HEADING_1),
          bodyP(input.sumarioExecutivo),

          titleP("2. Escopo", HeadingLevel.HEADING_1),
          ...input.escopo.map((e) => bulletP(e)),

          titleP("3. Entregáveis", HeadingLevel.HEADING_1),
          ...input.entregaveis.map((e) => bulletP(e)),

          titleP("4. Cronograma", HeadingLevel.HEADING_1),
          ...input.cronograma.flatMap((c) => [
            bodyP(`${c.fase} — ${c.prazo}`, { bold: true }),
            bodyP(c.descricao),
          ]),

          titleP("5. Investimento", HeadingLevel.HEADING_1),
          bodyP(`Valor total: ${input.investimento.valorTotal}`, { bold: true }),
          bodyP(input.investimento.condicoes),

          titleP("6. Próximos Passos", HeadingLevel.HEADING_1),
          ...input.proximosPassos.map((p) => bulletP(p)),

          new Paragraph({
            alignment: AlignmentType.CENTER, spacing: { before: 480 },
            children: [new TextRun({ text: "NowGo Holding · contato@nowgoai.com", color: NOWGO_NAVY, bold: true })],
          }),
        ],
      },
    ],
  });

  const buf = await Packer.toBuffer(doc);
  return {
    fileName: `${todayIso()}-proposta-${slug(input.cliente)}-${slug(input.titulo)}.docx`,
    mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    buffer: buf,
  };
}

/* ================================================================== */
/*  3) CONTRATO (MSA / SOW / NDA)                                       */
/* ================================================================== */

export interface ContratoInput {
  tipo: "MSA" | "SOW" | "NDA";
  titulo: string;
  contratante: string;
  contratada?: string;
  objeto: string;
  clausulas: Array<{ titulo: string; texto: string }>;
  vigencia?: string;
  foro?: string;
}

export async function gerarContrato(input: ContratoInput): Promise<GeneratedDoc> {
  const contratada = input.contratada || "NowGo AI Holding LTDA";
  const clausulas: DocxParagraph[] = [];
  input.clausulas.forEach((c, idx) => {
    clausulas.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 240, after: 120 },
        children: [new TextRun({ text: `Cláusula ${idx + 1}ª — ${c.titulo}`, bold: true, color: NOWGO_NAVY })],
      }),
    );
    clausulas.push(new Paragraph({ spacing: { after: 120 }, children: [new TextRun({ text: c.texto })] }));
  });

  const doc = new Document({
    creator: "Jarvis NowGo",
    title: input.titulo,
    description: `${input.tipo} entre ${input.contratante} e ${contratada}`,
    styles: { default: { document: { run: { font: "Calibri", size: 22 } } } },
    sections: [
      {
        footers: { default: new Footer({ children: [new Paragraph({ children: [new TextRun({ text: NOWGO_FOOTER, italics: true })] })] }) },
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER, spacing: { after: 240 },
            children: [new TextRun({ text: input.tipo, bold: true, size: 36, color: NOWGO_CYAN })],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER, spacing: { after: 480 },
            children: [new TextRun({ text: input.titulo, bold: true, size: 28, color: NOWGO_NAVY })],
          }),
          new Paragraph({
            spacing: { after: 240 },
            children: [
              new TextRun({ text: "Pelo presente instrumento particular, ", bold: false }),
              new TextRun({ text: input.contratante, bold: true }),
              new TextRun({ text: " (\"CONTRATANTE\") e " }),
              new TextRun({ text: contratada, bold: true }),
              new TextRun({ text: " (\"CONTRATADA\"), em conjunto denominadas \"Partes\", celebram o presente instrumento, mediante as cláusulas e condições a seguir." }),
            ],
          }),
          new Paragraph({
            heading: HeadingLevel.HEADING_2, spacing: { before: 240, after: 120 },
            children: [new TextRun({ text: "Objeto", bold: true, color: NOWGO_NAVY })],
          }),
          new Paragraph({ spacing: { after: 120 }, children: [new TextRun({ text: input.objeto })] }),
          ...clausulas,
          ...(input.vigencia
            ? [
              new Paragraph({
                heading: HeadingLevel.HEADING_2, spacing: { before: 240, after: 120 },
                children: [new TextRun({ text: "Vigência", bold: true, color: NOWGO_NAVY })],
              }),
              new Paragraph({ children: [new TextRun({ text: input.vigencia })] }),
            ]
            : []),
          ...(input.foro
            ? [
              new Paragraph({
                heading: HeadingLevel.HEADING_2, spacing: { before: 240, after: 120 },
                children: [new TextRun({ text: "Foro", bold: true, color: NOWGO_NAVY })],
              }),
              new Paragraph({ children: [new TextRun({ text: input.foro })] }),
            ]
            : []),
          new Paragraph({
            spacing: { before: 720, after: 240 },
            children: [new TextRun({ text: `Brasília, ${todayIso()}.` })],
          }),
          new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 480 }, children: [new TextRun({ text: "_______________________________" })] }),
          new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: input.contratante, bold: true })] }),
          new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 480 }, children: [new TextRun({ text: "_______________________________" })] }),
          new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: contratada, bold: true })] }),
        ],
      },
    ],
  });

  const buf = await Packer.toBuffer(doc);
  return {
    fileName: `${todayIso()}-${input.tipo.toLowerCase()}-${slug(input.contratante)}-${slug(input.titulo)}.docx`,
    mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    buffer: buf,
  };
}

/* ================================================================== */
/*  4) ONE-PAGE (PDF executive summary, 1 página)                      */
/* ================================================================== */

export interface OnePageInput {
  titulo: string;
  subtitulo?: string;
  cliente?: string;
  desafio: string;
  solucao: string;
  diferenciais: string[];
  resultadosEsperados: string[];
  cta: string;
}

export async function gerarOnePage(input: OnePageInput): Promise<GeneratedDoc> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: "A4", margin: 36 });
      const chunks: Buffer[] = [];
      doc.on("data", (c: Buffer) => chunks.push(c));
      doc.on("end", () => {
        resolve({
          fileName: `${todayIso()}-onepage-${slug(input.titulo)}.pdf`,
          mimeType: "application/pdf",
          buffer: Buffer.concat(chunks),
        });
      });
      doc.on("error", reject);

      // Faixa superior cyan
      doc.rect(0, 0, 595, 8).fill("#" + NOWGO_CYAN);

      // Cabeçalho
      doc.fillColor("#" + NOWGO_NAVY).font("Helvetica-Bold").fontSize(10).text("NOWGO HOLDING · NOWGO SOVEREIGN STACK", 36, 24);
      doc.fillColor("#" + NOWGO_GRAPH).font("Helvetica").fontSize(9).text(todayIso(), 460, 24, { align: "right", width: 100 });

      // Título
      doc.moveDown(2);
      doc.fillColor("#" + NOWGO_NAVY).font("Helvetica-Bold").fontSize(24).text(input.titulo, 36, 60, { width: 523 });
      if (input.subtitulo) {
        doc.fillColor("#" + NOWGO_GRAPH).font("Helvetica").fontSize(13).text(input.subtitulo, 36, doc.y + 4, { width: 523 });
      }
      if (input.cliente) {
        doc.fillColor("#" + NOWGO_CYAN).font("Helvetica-Bold").fontSize(11).text(`Para: ${input.cliente}`, 36, doc.y + 8);
      }

      // Linha separadora
      doc.moveTo(36, doc.y + 10).lineTo(559, doc.y + 10).strokeColor("#" + NOWGO_CYAN).lineWidth(1).stroke();
      doc.moveDown(1);

      const sectionHeading = (txt: string) => {
        doc.fillColor("#" + NOWGO_CYAN).font("Helvetica-Bold").fontSize(11).text(txt.toUpperCase(), { characterSpacing: 1.5 });
        doc.moveDown(0.3);
      };
      const sectionBody = (txt: string) => {
        doc.fillColor("#" + NOWGO_GRAPH).font("Helvetica").fontSize(10).text(txt, { align: "justify", width: 523 });
        doc.moveDown(0.6);
      };
      const bullets = (items: string[]) => {
        for (const it of items) {
          doc.fillColor("#" + NOWGO_GRAPH).font("Helvetica").fontSize(10).text(`•  ${it}`, { width: 523 });
          doc.moveDown(0.15);
        }
        doc.moveDown(0.5);
      };

      sectionHeading("Desafio"); sectionBody(input.desafio);
      sectionHeading("Solução"); sectionBody(input.solucao);
      sectionHeading("Diferenciais NowGo"); bullets(input.diferenciais);
      sectionHeading("Resultados esperados"); bullets(input.resultadosEsperados);

      // CTA
      doc.moveDown(0.5);
      const ctaY = doc.y;
      doc.rect(36, ctaY, 523, 38).fill("#" + NOWGO_NAVY);
      doc.fillColor("#" + NOWGO_CYAN).font("Helvetica-Bold").fontSize(11).text(input.cta, 50, ctaY + 13, { width: 495 });

      // Rodapé
      doc.fillColor("#" + NOWGO_GRAPH).font("Helvetica-Oblique").fontSize(8).text(NOWGO_FOOTER, 36, 800, { width: 523, align: "center" });

      doc.end();
    } catch (e) {
      reject(e);
    }
  });
}

/* ================================================================== */
/*  5) PITCH DECK                                                       */
/* ================================================================== */

export interface PitchDeckInput {
  empresa: string;
  oneliner: string;
  problema: string;
  solucao: string;
  mercado: string;
  produto: string;
  tracao: string;
  modeloNegocio: string;
  time: string[];
  ask: string;
}

export async function gerarPitchDeck(input: PitchDeckInput): Promise<GeneratedDoc> {
  const apr: ApresentacaoInput = {
    titulo: input.empresa,
    subtitulo: input.oneliner,
    autor: "Jarvis NowGo",
    slides: [
      { titulo: "Problema", bullets: [input.problema] },
      { titulo: "Solução", bullets: [input.solucao] },
      { titulo: "Mercado", bullets: [input.mercado] },
      { titulo: "Produto", bullets: [input.produto] },
      { titulo: "Tração", bullets: [input.tracao] },
      { titulo: "Modelo de Negócio", bullets: [input.modeloNegocio] },
      { titulo: "Time", bullets: input.time },
      { titulo: "Ask", bullets: [input.ask] },
    ],
  };
  const out = await gerarApresentacao(apr);
  return {
    ...out,
    fileName: `${todayIso()}-pitch-${slug(input.empresa)}.pptx`,
  };
}
