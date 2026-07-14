import LandingShell from "@/landing/LandingShell";
import Seo from "@/components/Seo";
import BlogCtaCard, { CAL_URL, waLink } from "@/components/BlogCtaCard";
import { Link } from "wouter";
import "@/landing/styles/blog.css";

/**
 * Artigo do cluster "Fundamentos" — fecha o cluster de conteúdo.
 * Palavras-chave alvo: como usar inteligência artificial (390),
 * como usar IA grátis, como aplicar inteligência artificial.
 */

const WA_GERAL = waLink(
  "Olá! Li o guia 'como usar IA' da NowGo AI e quero conversar sobre levar IA para a minha organização.",
);

const CANONICAL = "https://www.nowgoai.com/blog/como-usar-inteligencia-artificial";
const TITLE = "Como Usar Inteligência Artificial: do primeiro acesso ao uso profissional · NowGo AI";
const DESCRIPTION =
  "Guia prático de como usar IA: por onde começar (inclusive grátis), como escrever bons comandos, os erros comuns de iniciante, o salto do uso pessoal para o profissional e o caminho para levar IA à sua organização.";

const FAQ: { q: string; a: string }[] = [
  {
    q: "Como começar a usar inteligência artificial gratuitamente?",
    a: "Os principais assistentes — ChatGPT, Gemini, Claude — têm versões gratuitas que bastam para aprender. Comece com tarefas reais do seu dia: resumir um texto, rascunhar um e-mail, explicar um conceito, planejar uma semana. Quinze minutos por dia com problemas reais ensinam mais que qualquer curso introdutório.",
  },
  {
    q: "Como escrever bons comandos (prompts) para a IA?",
    a: "Quatro elementos resolvem a maioria dos casos: contexto (quem você é e qual a situação), tarefa específica (o que exatamente quer), formato (lista, tabela, e-mail, quantas palavras) e exemplo, quando houver. E trate como conversa: peça ajustes na resposta em vez de recomeçar do zero.",
  },
  {
    q: "O que não devo fazer ao usar IA?",
    a: "Três erros dominam: confiar sem verificar (modelos podem gerar informação plausível e errada — confira fatos, números e fontes antes de usar), inserir dados sensíveis (seus ou de terceiros) em ferramentas gratuitas sem política clara de dados, e terceirizar julgamento — a IA informa e acelera; decisões importantes continuam suas.",
  },
  {
    q: "Como levar a IA do uso pessoal para a empresa?",
    a: "O uso individual da equipe é o começo, não o fim: o valor de escala vem quando a IA é integrada aos processos e sistemas — atendimento, backoffice, previsão — com governança de dados e indicadores. O caminho prático: mapear os processos com maior custo repetitivo, rodar um piloto de escopo fechado com meta numérica e escalar por módulos sobre uma infraestrutura única.",
  },
];

const JSON_LD: Record<string, unknown>[] = [
  {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "Como Usar Inteligência Artificial: do primeiro acesso ao uso profissional",
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
      { "@type": "ListItem", position: 3, name: "Como Usar IA", item: CANONICAL },
    ],
  },
];

export default function BlogComoUsarIa() {
  return (
    <LandingShell>
      <Seo title={TITLE} description={DESCRIPTION} canonical={CANONICAL} jsonLd={JSON_LD} />

      <section className="ng-section ng-section-hero">
        <div className="ng-container">
          <div className="ng-page-hero reveal">
            <span className="ng-eyebrow">Guia NowGo AI · Prática</span>
            <h1 className="ng-page-title">
              Como usar inteligência artificial: do primeiro acesso ao uso profissional
            </h1>
            <p className="ng-page-subtitle">
              O caminho completo em um guia: começar (de graça), dominar os comandos, evitar os erros de
              iniciante — e dar o salto do uso pessoal para a operação da sua organização.
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
                <li><a href="#comecar">Por onde começar (inclusive grátis)</a></li>
                <li><a href="#prompts">A habilidade central: pedir bem</a></li>
                <li><a href="#erros">Os três erros de iniciante</a></li>
                <li><a href="#profissional">Do uso pessoal ao profissional</a></li>
                <li><a href="#organizacao">O salto: IA na organização</a></li>
                <li><a href="#faq">Perguntas frequentes</a></li>
              </ol>
            </nav>

            <article className="ng-page-block" id="comecar">
              <h2>Por onde começar (inclusive grátis)</h2>
              <p>
                Usar <Link href="/blog/inteligencia-artificial">inteligência artificial</Link> hoje não exige
                instalar nada nem pagar nada: os grandes assistentes têm versões gratuitas na web e no celular.
                O erro comum é começar "testando a IA" com perguntas aleatórias — o aprendizado real vem de usá-la
                em <strong>tarefas suas</strong>: o e-mail difícil de escrever, o texto longo para resumir, o
                conceito que você precisa entender, o planejamento da semana.
              </p>
              <p>
                Quinze minutos por dia, com problemas reais, durante duas semanas — esse é o "curso" que
                transforma qualquer pessoa de curiosa em usuária competente.
              </p>
            </article>

            <article className="ng-page-block" id="prompts">
              <h2>A habilidade central: pedir bem</h2>
              <p>
                A qualidade da resposta segue a qualidade do pedido. Quatro elementos resolvem quase tudo:{" "}
                <strong>contexto</strong> ("sou gestor de uma clínica com 12 funcionários..."),{" "}
                <strong>tarefa específica</strong> ("escreva um comunicado sobre a mudança de horário"),{" "}
                <strong>formato</strong> ("em até 120 palavras, tom cordial") e <strong>exemplo</strong>, quando
                existir ("no estilo deste comunicado anterior: ...").
              </p>
              <p>
                E a regra que os iniciantes demoram a descobrir: <strong>é uma conversa, não uma busca</strong>.
                Se a resposta veio 80% boa, não recomece — peça o ajuste: "encurte", "tom mais formal", "agora
                em formato de lista". Refinar é mais rápido e ensina o modelo sobre o que você quer.
              </p>
            </article>

            <article className="ng-page-block" id="erros">
              <h2>Os três erros de iniciante</h2>
              <p>
                <strong>1. Confiar sem verificar.</strong> Modelos{" "}
                <Link href="/blog/inteligencia-artificial-generativa">generativos</Link> podem produzir
                informação plausível e errada. Fato, número, citação e fonte se conferem antes de usar — sempre.
              </p>
              <p>
                <strong>2. Inserir o que não devia.</strong> Dado pessoal sensível, informação confidencial de
                cliente ou da empresa: nada disso entra em ferramenta gratuita sem política clara de dados. Na
                dúvida, anonimize ou não insira.
              </p>
              <p>
                <strong>3. Terceirizar o julgamento.</strong> A IA acelera, informa e organiza; a decisão — e a
                responsabilidade por ela — continua humana. Vale para o e-mail delicado, para o diagnóstico e
                para o contrato.
              </p>
            </article>

            <article className="ng-page-block" id="profissional">
              <h2>Do uso pessoal ao profissional</h2>
              <p>
                O segundo estágio é sistematizar: em vez de pedidos avulsos, criar seus fluxos recorrentes — o
                prompt padrão para relatório semanal, o revisor de propostas com seu checklist, o preparador de
                reuniões que resume os documentos antes. Profissionais avançados mantêm uma biblioteca de
                comandos testados para as tarefas que repetem — é a diferença entre usar IA e ter um método.
              </p>
              <p>
                É também o estágio de escolher ferramenta por critério: para trabalho com documentos da empresa,
                versões pagas ou corporativas com garantias de dados; para cada tarefa, o modelo do tamanho
                certo — como discutimos no guia sobre{" "}
                <Link href="/blog/inteligencia-artificial-e-machine-learning">IA e machine learning</Link>.
              </p>
            </article>

            <article className="ng-page-block" id="organizacao">
              <h2>O salto: IA na organização</h2>
              <p>
                O uso individual, mesmo excelente, tem teto: cada pessoa economiza a sua hora. O valor de escala
                aparece quando a IA sai do navegador e entra nos <strong>processos</strong> — o telefone que{" "}
                <Link href="/blog/inteligencia-artificial-de-voz">atende sozinho</Link>, o backoffice que{" "}
                <Link href="/blog/agentes-de-inteligencia-artificial">agentes</Link> executam, a previsão que
                orienta o estoque, o atendimento que resolve 24/7.
              </p>
              <p>
                Esse salto não é uma compra, é um projeto: diagnóstico dos processos, piloto com meta numérica,
                governança de dados desde o desenho e escala por módulos — o roteiro que detalhamos para{" "}
                <Link href="/blog/inteligencia-artificial-para-empresas">empresas</Link>,{" "}
                <Link href="/blog/inteligencia-artificial-na-saude">saúde</Link> e{" "}
                <Link href="/blog/inteligencia-artificial-na-educacao">educação</Link>, sempre sobre
                infraestrutura <Link href="/blog/inteligencia-artificial-no-brasil">soberana</Link>.
              </p>
            </article>

            <BlogCtaCard
              title="Sua equipe já usa IA. Sua operação ainda não."
              text="A NowGo AI faz a ponte: do uso individual disperso à IA integrada aos processos — com diagnóstico, piloto mensurável e infraestrutura soberana."
              wa={WA_GERAL}
              waLabel="Dar o próximo passo"
            />

            <article className="ng-page-block ng-blog-faq" id="faq">
              <h2>Perguntas frequentes sobre como usar IA</h2>
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
          <h2 className="ng-h2 ng-final-h2">Pronto para o próximo nível de uso de IA?</h2>
          <p className="ng-section-sub ng-final-sub">
            Do uso pessoal à operação inteligente: diagnóstico direto de onde a IA gera valor real na sua
            organização.
          </p>
          <div className="ng-hero-actions">
            <a href={CAL_URL} target="_blank" rel="noreferrer" className="btn-primary">
              Agendar reunião
            </a>
            <a href={WA_GERAL} target="_blank" rel="noreferrer" className="btn-secondary">
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
