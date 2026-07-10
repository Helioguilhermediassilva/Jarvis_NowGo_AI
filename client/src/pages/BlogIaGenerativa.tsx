import LandingShell from "@/landing/LandingShell";
import Seo from "@/components/Seo";
import BlogCtaCard, { CAL_URL, waLink } from "@/components/BlogCtaCard";
import { Link } from "wouter";
import "@/landing/styles/blog.css";

/**
 * Artigo do cluster "Conceitos Técnicos".
 * Palavras-chave alvo: inteligência artificial generativa (590),
 * o que é IA generativa, IA generativa exemplos, LLM.
 */

const WA_GENERATIVA = waLink(
  "Olá! Li o artigo sobre IA generativa da NowGo AI e quero avaliar aplicações na minha organização.",
);

const CANONICAL = "https://www.nowgoai.com/blog/inteligencia-artificial-generativa";
const TITLE = "IA Generativa: o que é, como funciona e exemplos de uso profissional · NowGo AI";
const DESCRIPTION =
  "Inteligência artificial generativa explicada: como os LLMs criam texto, imagem e voz, a diferença para a IA tradicional, exemplos de uso em empresas e governos, limites (alucinações) e como adotar com governança.";

const FAQ: { q: string; a: string }[] = [
  {
    q: "O que é inteligência artificial generativa?",
    a: "É a categoria de IA capaz de criar conteúdo novo — texto, imagem, áudio, vídeo, código — a partir de instruções em linguagem natural. Em vez de apenas classificar ou prever sobre dados existentes, como a IA tradicional, o modelo generativo produz. É a tecnologia por trás do ChatGPT, do Gemini e dos copilotos e agentes corporativos.",
  },
  {
    q: "Como a IA generativa funciona?",
    a: "Os modelos generativos de linguagem (LLMs) são treinados com volumes massivos de texto e aprendem os padrões estatísticos da linguagem — o que permite prever, palavra a palavra, a continuação mais provável e coerente de qualquer texto. Com técnicas de ajuste fino e conexão a dados externos (RAG), esse mecanismo passa a produzir respostas úteis, especializadas e fundamentadas nos dados de uma organização.",
  },
  {
    q: "Quais são exemplos de IA generativa?",
    a: "Assistentes de conversa (ChatGPT, Gemini, Claude), geradores de imagem e vídeo, copilotos de programação, sistemas de voz sintética natural e — no uso corporativo — agentes que redigem documentos, atendem clientes por voz, resumem reuniões e operam processos de backoffice.",
  },
  {
    q: "O que são alucinações da IA generativa?",
    a: "São respostas fluentes porém incorretas: o modelo 'completa' com informação plausível que não é verdadeira — uma jurisprudência inexistente, um dado inventado. É consequência do próprio mecanismo estatístico. A mitigação é arquitetural: conectar o modelo a fontes de verdade (RAG), restringir o escopo, exigir citação de fonte e manter revisão humana em tudo que é crítico.",
  },
  {
    q: "IA generativa é segura para uso corporativo?",
    a: "Sim, com governança: definir o que pode e o que não pode ser inserido nas ferramentas, usar versões com garantias contratuais de dados ou infraestrutura própria para conteúdo sensível, e desenhar supervisão humana nos pontos críticos. O risco não está na tecnologia em si, mas no uso difuso e sem política.",
  },
];

const JSON_LD: Record<string, unknown>[] = [
  {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "IA Generativa: o que é, como funciona e exemplos de uso profissional",
    description: DESCRIPTION,
    inLanguage: "pt-BR",
    author: { "@type": "Organization", name: "NowGo AI", url: "https://www.nowgoai.com/" },
    publisher: { "@type": "Organization", name: "NowGo AI", url: "https://www.nowgoai.com/" },
    mainEntityOfPage: CANONICAL,
    datePublished: "2026-07-09",
    dateModified: "2026-07-09",
    isPartOf: { "@type": "WebPage", "@id": "https://www.nowgoai.com/blog/inteligencia-artificial" },
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  },
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Blog", item: "https://www.nowgoai.com/blog" },
      {
        "@type": "ListItem",
        position: 2,
        name: "Inteligência Artificial",
        item: "https://www.nowgoai.com/blog/inteligencia-artificial",
      },
      { "@type": "ListItem", position: 3, name: "IA Generativa", item: CANONICAL },
    ],
  },
];

export default function BlogIaGenerativa() {
  return (
    <LandingShell>
      <Seo title={TITLE} description={DESCRIPTION} canonical={CANONICAL} jsonLd={JSON_LD} />

      <section className="ng-section ng-section-hero">
        <div className="ng-container">
          <div className="ng-page-hero reveal">
            <span className="ng-eyebrow">Guia NowGo AI · Conceitos</span>
            <h1 className="ng-page-title">
              IA Generativa: o que é, como funciona e exemplos de uso profissional
            </h1>
            <p className="ng-page-subtitle">
              A tecnologia que faz máquinas escreverem, falarem e criarem — explicada sem jargão: o mecanismo
              por trás dos LLMs, os usos que geram valor em organizações e os limites que todo gestor precisa
              conhecer.
            </p>
          </div>
        </div>
      </section>

      <section className="ng-section-content">
        <div className="ng-container">
          <div className="ng-page-content reveal">
            <nav className="ng-blog-toc" aria-label="Sumário">
              <strong>Neste guia</strong>
              <ol>
                <li><a href="#definicao">O que é IA generativa</a></li>
                <li><a href="#mecanismo">Como funciona: o mecanismo dos LLMs</a></li>
                <li><a href="#especializacao">De genérico a especializado: fine-tuning e RAG</a></li>
                <li><a href="#exemplos">Exemplos de uso profissional</a></li>
                <li><a href="#limites">Limites: alucinações e como mitigá-las</a></li>
                <li><a href="#faq">Perguntas frequentes</a></li>
              </ol>
            </nav>

            <article className="ng-page-block" id="definicao">
              <h2>O que é IA generativa</h2>
              <p>
                IA generativa é a categoria de{" "}
                <Link href="/blog/inteligencia-artificial">inteligência artificial</Link> capaz de{" "}
                <strong>criar conteúdo novo</strong> — texto, imagem, áudio, vídeo, código — a partir de
                instruções em linguagem natural. A diferença para a IA tradicional está no verbo: modelos
                preditivos <em>classificam e preveem</em> sobre o que existe; modelos generativos{" "}
                <em>produzem</em> o que não existia.
              </p>
              <p>
                Essa mudança de verbo explica o impacto: pela primeira vez, trabalho de linguagem — redigir,
                resumir, traduzir, atender, explicar — tornou-se automatizável em escala. E como a maior parte
                do trabalho de escritório é, no fundo, trabalho de linguagem, praticamente toda organização foi
                afetada de uma vez.
              </p>
            </article>

            <article className="ng-page-block" id="mecanismo">
              <h2>Como funciona: o mecanismo dos LLMs</h2>
              <p>
                O motor da IA generativa de texto são os <strong>LLMs (grandes modelos de linguagem)</strong>:
                redes neurais profundas treinadas sobre volumes massivos de texto. Durante o treinamento, o
                modelo aprende os padrões estatísticos da linguagem — como palavras, ideias e estruturas se
                relacionam. No uso, ele faz algo aparentemente simples: prever, fragmento a fragmento, a
                continuação mais provável e coerente do texto — o que, em escala e com refinamento, resulta em
                respostas, documentos e diálogos de qualidade notável.
              </p>
              <p>
                O mesmo princípio se estende a outras mídias: modelos de imagem aprendem a relação entre
                descrições e pixels; modelos de voz, entre texto e som. E é a base técnica que discutimos em
                mais profundidade no artigo sobre{" "}
                <Link href="/blog/inteligencia-artificial-e-machine-learning">IA e machine learning</Link>.
              </p>
            </article>

            <article className="ng-page-block" id="especializacao">
              <h2>De genérico a especializado: fine-tuning e RAG</h2>
              <p>
                Um LLM de mercado sabe "de tudo um pouco" — mas não conhece os seus contratos, o seu prontuário,
                a sua norma interna. Duas técnicas fecham essa distância. O <strong>fine-tuning</strong> ajusta
                o modelo com exemplos da organização, ensinando vocabulário, formato e regras do domínio. O{" "}
                <strong>RAG</strong> (geração aumentada por recuperação) conecta o modelo às bases de
                conhecimento da empresa em tempo real: antes de responder, o sistema busca os documentos
                relevantes e fundamenta a resposta neles — com fonte citada.
              </p>
              <p>
                É essa especialização que separa o chatbot genérico do sistema corporativo confiável — e que,
                feita sobre infraestrutura própria, mantém o conhecimento proprietário da organização sob seu{" "}
                <Link href="/blog/inteligencia-artificial-no-brasil">controle soberano</Link>, em vez de
                alimentar a plataforma de terceiros.
              </p>
            </article>

            <BlogCtaCard
              title="LLMs customizados para a sua organização"
              text="A NowGo AI especializa modelos generativos com o conhecimento do seu negócio — fine-tuning, RAG e agentes sobre infraestrutura soberana, do piloto à escala."
              wa={WA_GENERATIVA}
              waLabel="Avaliar meu caso"
            />

            <article className="ng-page-block" id="exemplos">
              <h2>Exemplos de uso profissional</h2>
              <p>
                <strong>Atendimento por voz e chat</strong> — agentes que conversam naturalmente, agendam e
                resolvem, na <Link href="/blog/inteligencia-artificial-na-saude">saúde</Link>, no serviço
                público e no varejo. <strong>Documentos</strong> — redação assistida de propostas, contratos e
                relatórios; análise e comparação em minutos, com revisão humana. <strong>Conhecimento
                interno</strong> — o "pergunte à empresa": políticas, manuais e históricos acessíveis em
                linguagem natural para toda a equipe. <strong>Código</strong> — copilotos que aceleram
                desenvolvimento e modernização de sistemas legados. <strong>Processos</strong> — quando o
                modelo generativo ganha ferramentas e permissões, vira{" "}
                <Link href="/blog/agentes-de-inteligencia-artificial">agente</Link> e executa fluxos de ponta a
                ponta.
              </p>
            </article>

            <article className="ng-page-block" id="limites">
              <h2>Limites: alucinações e como mitigá-las</h2>
              <p>
                O mesmo mecanismo que gera fluência gera o principal risco: a <strong>alucinação</strong> — a
                resposta plausível e errada. O modelo não "sabe" no sentido humano; ele completa padrões. Sem
                fundamento externo, pode inventar o dado, a fonte, a jurisprudência.
              </p>
              <p>
                A mitigação é arquitetural, não comportamental: <strong>fundamentar</strong> respostas em fontes
                de verdade via RAG, com citação; <strong>restringir</strong> o escopo do sistema ao seu domínio;{" "}
                <strong>medir</strong> qualidade continuamente com avaliações; e manter{" "}
                <strong>revisão humana</strong> obrigatória em tudo que é crítico. Com esses guarda-corpos, a IA
                generativa deixa de ser um risco difuso e vira o que as organizações maduras já colhem:
                capacidade de linguagem em escala industrial, sob governança — o padrão da{" "}
                <a href="/">plataforma da NowGo AI</a>.
              </p>
            </article>

            <article className="ng-page-block ng-blog-faq" id="faq">
              <h2>Perguntas frequentes sobre IA generativa</h2>
              {FAQ.map((f) => (
                <details key={f.q}>
                  <summary>{f.q}</summary>
                  <p>{f.a}</p>
                </details>
              ))}
            </article>
          </div>
        </div>
      </section>

      <section id="contact" className="ng-final-cta">
        <div className="ng-section-inner reveal">
          <h2 className="ng-h2 ng-final-h2">Pronto para usar IA generativa com governança?</h2>
          <p className="ng-section-sub ng-final-sub">
            Do modelo certo à arquitetura anti-alucinação: diagnóstico direto de onde a IA generativa gera valor
            na sua operação.
          </p>
          <div className="ng-hero-actions">
            <a href={CAL_URL} target="_blank" rel="noreferrer" className="btn-primary">
              Agendar reunião
            </a>
            <a href={WA_GENERATIVA} target="_blank" rel="noreferrer" className="btn-secondary">
              Falar no WhatsApp
            </a>
            <a href="/#platform" className="btn-secondary">
              Conhecer a plataforma
            </a>
          </div>
        </div>
      </section>
    </LandingShell>
  );
}
