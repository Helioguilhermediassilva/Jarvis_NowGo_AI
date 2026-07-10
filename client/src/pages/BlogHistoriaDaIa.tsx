import LandingShell from "@/landing/LandingShell";
import Seo from "@/components/Seo";
import BlogCtaCard, { CAL_URL, waLink } from "@/components/BlogCtaCard";
import { Link } from "wouter";
import "@/landing/styles/blog.css";

/**
 * Artigo do cluster "História da IA".
 * Palavras-chave alvo: história da inteligência artificial, quem inventou a
 * inteligência artificial, quando surgiu a inteligência artificial, 1956.
 */

const WA_GERAL = waLink(
  "Olá! Vim pelo blog da NowGo AI e quero conversar sobre aplicar IA na minha organização.",
);

const CANONICAL = "https://www.nowgoai.com/blog/historia-da-inteligencia-artificial";
const TITLE = "História da Inteligência Artificial: de 1956 à era dos agentes · NowGo AI";
const DESCRIPTION =
  "A história da IA em uma linha do tempo clara: Turing e os fundamentos, Dartmouth 1956, os invernos da IA, a revolução do deep learning, o momento ChatGPT e a era dos agentes — e o que ela ensina a quem decide hoje.";

const FAQ: { q: string; a: string }[] = [
  {
    q: "Quem inventou a inteligência artificial?",
    a: "Não há um único inventor. Alan Turing estabeleceu as bases teóricas nos anos 1940-50 (incluindo o famoso Teste de Turing, de 1950). O termo 'inteligência artificial' foi cunhado por John McCarthy, que organizou com Marvin Minsky, Claude Shannon e Nathaniel Rochester a conferência de Dartmouth, em 1956 — o marco de fundação do campo como disciplina científica.",
  },
  {
    q: "Quando surgiu a inteligência artificial?",
    a: "Como campo formal, em 1956, na conferência de Dartmouth (EUA). As ideias fundadoras são anteriores — o artigo de Turing 'Computing Machinery and Intelligence' é de 1950 —, e as redes neurais artificiais têm origem teórica ainda nos anos 1940, com McCulloch e Pitts.",
  },
  {
    q: "O que foram os 'invernos da IA'?",
    a: "Períodos (em especial nos anos 1970 e no fim dos 1980) em que o entusiasmo e o financiamento despencaram porque as promessas superaram o que a tecnologia da época entregava. São o lembrete histórico de que a IA avança em ciclos — e de que projetos sobrevivem a ciclos quando geram valor mensurável, não manchete.",
  },
  {
    q: "O que mudou para a IA explodir nos últimos anos?",
    a: "Três curvas se cruzaram: dados em volume inédito (internet), poder computacional massivo (GPUs) e avanços de arquitetura de modelos — em especial os Transformers (2017), base dos LLMs. O lançamento do ChatGPT, no fim de 2022, tornou essa capacidade acessível a qualquer pessoa e abriu a fase atual: a da IA generativa e dos agentes.",
  },
];

const JSON_LD: Record<string, unknown>[] = [
  {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "História da Inteligência Artificial: de 1956 à era dos agentes",
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
      { "@type": "ListItem", position: 3, name: "História da IA", item: CANONICAL },
    ],
  },
];

export default function BlogHistoriaDaIa() {
  return (
    <LandingShell>
      <Seo title={TITLE} description={DESCRIPTION} canonical={CANONICAL} jsonLd={JSON_LD} />

      <section className="ng-section ng-section-hero">
        <div className="ng-container">
          <div className="ng-page-hero reveal">
            <span className="ng-eyebrow">Guia NowGo AI · História</span>
            <h1 className="ng-page-title">
              História da Inteligência Artificial: de 1956 à era dos agentes
            </h1>
            <p className="ng-page-subtitle">
              Setenta anos entre a promessa e a realidade — com dois invernos no caminho. A linha do tempo da IA
              e as lições que ela deixa para quem toma decisões hoje.
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
                <li><a href="#fundamentos">Antes do nome: Turing e os fundamentos (1943–1955)</a></li>
                <li><a href="#dartmouth">1956: Dartmouth e o nascimento do campo</a></li>
                <li><a href="#ciclos">Promessas, invernos e sistemas especialistas (1957–1993)</a></li>
                <li><a href="#aprendizado">A virada do aprendizado: dados e deep learning (1994–2016)</a></li>
                <li><a href="#generativa">Transformers, ChatGPT e a era generativa (2017–hoje)</a></li>
                <li><a href="#licoes">O que a história ensina a quem decide</a></li>
                <li><a href="#faq">Perguntas frequentes</a></li>
              </ol>
            </nav>

            <article className="ng-page-block" id="fundamentos">
              <h2>Antes do nome: Turing e os fundamentos (1943–1955)</h2>
              <p>
                A pergunta veio antes do termo. Em 1950, Alan Turing publicou "Computing Machinery and
                Intelligence" e propôs o experimento que ficaria célebre como <strong>Teste de Turing</strong>:
                se, numa conversa por texto, você não distingue a máquina de uma pessoa, em que sentido ela não
                "pensa"? Antes dele, em 1943, McCulloch e Pitts haviam descrito o primeiro modelo matemático de
                neurônio artificial — a semente teórica das redes neurais que dominariam o campo setenta anos
                depois.
              </p>
            </article>

            <article className="ng-page-block" id="dartmouth">
              <h2>1956: Dartmouth e o nascimento do campo</h2>
              <p>
                No verão de 1956, John McCarthy reuniu no Dartmouth College, com Marvin Minsky, Claude Shannon e
                Nathaniel Rochester, um seminário para investigar a conjectura de que "todo aspecto da
                aprendizagem ou qualquer outra característica da inteligência pode, em princípio, ser descrito
                com tanta precisão que uma máquina pode simulá-lo". Foi ali que McCarthy cunhou o termo{" "}
                <strong>inteligência artificial</strong> — e que a{" "}
                <Link href="/blog/inteligencia-artificial">IA</Link> nasceu como disciplina científica, com
                nome, agenda e uma geração de fundadores.
              </p>
            </article>

            <article className="ng-page-block" id="ciclos">
              <h2>Promessas, invernos e sistemas especialistas (1957–1993)</h2>
              <p>
                As décadas seguintes alternaram euforia e frustração. Os primeiros programas impressionaram em
                problemas de laboratório, e previsões grandiosas se acumularam — até a realidade cobrar: a
                computação da época não sustentava as promessas. O financiamento despencou e o campo viveu seu
                primeiro <strong>inverno da IA</strong> nos anos 1970.
              </p>
              <p>
                Nos anos 1980, os <strong>sistemas especialistas</strong> — programas de regras "se-então"
                codificando conhecimento humano — levaram IA às empresas pela primeira vez, criaram uma
                indústria e... colapsaram sob o próprio custo de manutenção, trazendo o segundo inverno. A lição
                dos dois ciclos é a mesma, e continua atual: <strong>a distância entre a demonstração e a
                operação é onde os projetos morrem</strong>.
              </p>
            </article>

            <article className="ng-page-block" id="aprendizado">
              <h2>A virada do aprendizado: dados e deep learning (1994–2016)</h2>
              <p>
                A saída dos invernos veio com uma mudança de filosofia: em vez de programar regras, deixar a
                máquina <strong>aprender com dados</strong> — o{" "}
                <Link href="/blog/inteligencia-artificial-e-machine-learning">machine learning</Link>. Marcos
                simbólicos pontuaram a virada: o Deep Blue vencendo Kasparov no xadrez (1997), a explosão de
                dados da internet, e em 2012 o momento decisivo — a rede neural AlexNet pulverizando os recordes
                de reconhecimento de imagem e provando que <strong>deep learning + GPUs + dados</strong> era a
                fórmula. Em 2016, o AlphaGo vencendo Lee Sedol no Go mostrou ao mundo que a curva tinha mudado
                de inclinação.
              </p>
            </article>

            <article className="ng-page-block" id="generativa">
              <h2>Transformers, ChatGPT e a era generativa (2017–hoje)</h2>
              <p>
                Em 2017, pesquisadores do Google publicaram a arquitetura <strong>Transformer</strong> — a base
                técnica dos grandes modelos de linguagem. Cinco anos de escala depois, o lançamento do{" "}
                <strong>ChatGPT</strong>, no fim de 2022, fez o que nenhum artigo científico faria: colocou a{" "}
                <Link href="/blog/inteligencia-artificial-generativa">IA generativa</Link> na mão de centenas de
                milhões de pessoas em semanas.
              </p>
              <p>
                A fase atual é a da transição do conversar para o fazer: modelos conectados a sistemas e
                ferramentas viram <Link href="/blog/agentes-de-inteligencia-artificial">agentes</Link> que
                executam processos — e a disputa deixou de ser só tecnológica para se tornar{" "}
                <Link href="/blog/inteligencia-artificial-no-brasil">geopolítica</Link>, com dados, chips e
                modelos tratados como ativos estratégicos nacionais.
              </p>
            </article>

            <article className="ng-page-block" id="licoes">
              <h2>O que a história ensina a quem decide hoje</h2>
              <p>
                <strong>1. Ciclos são a regra.</strong> Euforia e correção se alternam desde 1956; sobrevive o
                projeto que gera valor mensurável, não o que gera manchete. <strong>2. A operação é o
                teste.</strong> Todos os invernos começaram na distância entre a demo e o dia a dia — a mesma
                distância que separa, hoje, o piloto de chatbot da infraestrutura integrada.{" "}
                <strong>3. Quem constrói capacidade fica com o valor.</strong> Em cada ciclo, os ganhos se
                concentraram em quem dominava a camada de infraestrutura da época. É a aposta da{" "}
                <a href="/">NowGo AI</a>: menos hype, mais infraestrutura soberana operando de verdade.
              </p>
            </article>

            <BlogCtaCard
              title="Do aprendizado da história à sua operação"
              text="Setenta anos de IA ensinam o que funciona: valor mensurável, integração real e capacidade própria. É por aí que a NowGo AI começa qualquer projeto."
              wa={WA_GERAL}
              waLabel="Conversar com a NowGo"
            />

            <article className="ng-page-block ng-blog-faq" id="faq">
              <h2>Perguntas frequentes sobre a história da IA</h2>
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
          <h2 className="ng-h2 ng-final-h2">A próxima década da IA passa pela sua organização</h2>
          <p className="ng-section-sub ng-final-sub">
            Converse com quem constrói a camada de infraestrutura desta era — soberana, modular e integrada à
            operação real.
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
