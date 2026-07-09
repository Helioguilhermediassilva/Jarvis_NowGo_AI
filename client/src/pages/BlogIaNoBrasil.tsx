import LandingShell from "@/landing/LandingShell";
import Seo from "@/components/Seo";
import BlogCtaCard, { CAL_URL, waLink } from "@/components/BlogCtaCard";
import { Link } from "wouter";
import "@/landing/styles/blog.css";

/**
 * Artigo do cluster "IA e Sociedade" + lacuna estratégica "IA soberana".
 * Palavras-chave alvo: inteligência artificial no Brasil, IA brasileira,
 * IA soberana, soberania de dados, inteligência artificial da China.
 * Este é o artigo-manifesto do posicionamento NowGo.
 */

const WA_SOBERANIA = waLink(
  "Olá! Li o artigo sobre IA soberana no Brasil da NowGo AI e quero conversar sobre infraestrutura soberana para minha organização.",
);

const CANONICAL = "https://www.nowgoai.com/blog/inteligencia-artificial-no-brasil";
const TITLE =
  "Inteligência Artificial no Brasil: por que soberania é a decisão estratégica da década · NowGo AI";
const DESCRIPTION =
  "O cenário da IA no Brasil, a corrida geopolítica entre EUA e China e por que empresas e governos brasileiros precisam de IA soberana: dados sob jurisdição nacional, modelos auditáveis e autonomia estratégica.";

const FAQ: { q: string; a: string }[] = [
  {
    q: "O que é inteligência artificial soberana?",
    a: "IA soberana é a capacidade de uma organização ou país desenvolver e operar sistemas de IA sob seu próprio controle: dados processados em infraestrutura sob jurisdição nacional, modelos que podem ser auditados e especializados para a realidade local, e independência estratégica de plataformas estrangeiras para funções críticas. Não significa isolamento tecnológico — significa controle sobre o que é crítico.",
  },
  {
    q: "Como está a inteligência artificial no Brasil hoje?",
    a: "O Brasil combina adoção acelerada de IA por empresas e governos com dependência quase total de modelos e nuvens estrangeiros. Ao mesmo tempo, o país tem ativos reais: uma das maiores bases de dados públicos digitalizados do mundo (saúde, governo digital, sistema financeiro), talento técnico e demanda interna de escala continental — condições para construir uma camada soberana de IA em vez de apenas consumir a dos outros.",
  },
  {
    q: "Por que não usar apenas ChatGPT, Gemini e outras plataformas globais?",
    a: "Para uso individual e tarefas genéricas, elas são excelentes. O problema aparece em funções críticas de empresas e governos: dados sensíveis de cidadãos e pacientes trafegando fora da jurisdição nacional, impossibilidade de auditar o modelo, dependência de decisões comerciais e geopolíticas de terceiros, e custo recorrente em moeda estrangeira. Para essas funções, a arquitetura correta combina o melhor dos modelos globais com camadas soberanas onde importa.",
  },
  {
    q: "IA soberana é viável para uma organização, ou só para países?",
    a: "É viável — e cada vez mais acessível. Modelos abertos de alta qualidade, infraestrutura de GPU disponível no país e técnicas de especialização (fine-tuning, RAG) permitem que hospitais, empresas e governos operem IA de nível internacional com dados residentes em infraestrutura própria ou nacional. A decisão é de arquitetura, não de orçamento de superpotência.",
  },
];

const JSON_LD: Record<string, unknown>[] = [
  {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "Inteligência Artificial no Brasil: por que soberania é a decisão estratégica da década",
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
      { "@type": "ListItem", position: 3, name: "IA no Brasil", item: CANONICAL },
    ],
  },
];

export default function BlogIaNoBrasil() {
  return (
    <LandingShell>
      <Seo title={TITLE} description={DESCRIPTION} canonical={CANONICAL} jsonLd={JSON_LD} />

      <section className="ng-section ng-section-hero">
        <div className="ng-container">
          <div className="ng-page-hero reveal">
            <span className="ng-eyebrow">Guia NowGo AI · Brasil</span>
            <h1 className="ng-page-title">
              Inteligência Artificial no Brasil: por que soberania é a decisão estratégica da década
            </h1>
            <p className="ng-page-subtitle">
              A corrida de IA virou geopolítica. Entre os modelos americanos e os chineses, a pergunta que
              importa para empresas e governos brasileiros é outra: quem controla os dados, os modelos e as
              decisões?
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
                <li><a href="#corrida">A corrida global: EUA, China e o resto do mundo</a></li>
                <li><a href="#brasil">Onde o Brasil está — dependências e ativos</a></li>
                <li><a href="#soberania">O que é IA soberana (e o que não é)</a></li>
                <li><a href="#pratica">Soberania na prática: a arquitetura que funciona</a></li>
                <li><a href="#agenda">A agenda para empresas e governos brasileiros</a></li>
                <li><a href="#faq">Perguntas frequentes</a></li>
              </ol>
            </nav>

            <article className="ng-page-block" id="corrida">
              <h2>A corrida global: EUA, China e o resto do mundo</h2>
              <p>
                A <Link href="/blog/inteligencia-artificial">inteligência artificial</Link> deixou de ser uma
                disputa entre empresas e virou uma disputa entre potências. Os Estados Unidos lideram em modelos
                de fronteira e concentram a infraestrutura de chips e nuvem; a China respondeu com modelos
                competitivos e uma estratégia industrial explícita de IA. Controles de exportação de chips,
                data centers tratados como ativos estratégicos e modelos usados como instrumento de influência
                compõem o novo tabuleiro.
              </p>
              <p>
                Para os demais países, esse cenário coloca uma escolha silenciosa mas decisiva: ser apenas{" "}
                <em>consumidor</em> de inteligência produzida fora — exportando dados e importando decisões — ou
                construir camadas próprias de capacidade sobre o que o mundo oferece. É a mesma encruzilhada que
                o mundo já viu com energia, telecomunicações e sistema financeiro. Em todas, quem tratou
                infraestrutura crítica como commodity pagou caro depois.
              </p>
            </article>

            <article className="ng-page-block" id="brasil">
              <h2>Onde o Brasil está: dependências e ativos</h2>
              <p>
                O retrato brasileiro tem dois lados. O lado da <strong>dependência</strong>: a adoção de IA por
                empresas e governos cresce rápido, mas quase inteiramente sobre modelos e nuvens estrangeiros —
                com dados sensíveis de cidadãos, pacientes e operações críticas processados fora da jurisdição
                nacional, custo recorrente em dólar e zero capacidade de auditoria sobre os modelos.
              </p>
              <p>
                O lado dos <strong>ativos</strong>: o Brasil tem uma das maiores bases de dados públicos
                digitalizados do mundo — o SUS e seus sistemas de saúde, o governo digital, o sistema financeiro
                com Pix e Open Finance —, talento técnico reconhecido e um mercado interno de escala
                continental. Poucos países têm, ao mesmo tempo, tanta matéria-prima (dados e demanda) e tanta
                dependência da inteligência dos outros. Fechar essa distância é a oportunidade da década.
              </p>
            </article>

            <article className="ng-page-block" id="soberania">
              <h2>O que é IA soberana — e o que não é</h2>
              <p>
                IA soberana <strong>não é</strong> isolamento tecnológico, nem recusar modelos globais, nem
                reinventar tudo do zero. Isso seria caro, lento e contraproducente.
              </p>
              <p>
                IA soberana <strong>é</strong> controle sobre o que é crítico: (1){" "}
                <strong>dados residentes</strong> — informações sensíveis processadas em infraestrutura sob
                jurisdição e controle nacional ou da própria organização; (2) <strong>modelos auditáveis e
                especializados</strong> — a capacidade de inspecionar, ajustar e treinar modelos com a
                realidade local, do vocabulário do SUS às regras do direito brasileiro; (3){" "}
                <strong>autonomia estratégica</strong> — funções críticas que não param se um fornecedor
                estrangeiro mudar preço, política ou disponibilidade.
              </p>
              <p>
                Com modelos abertos de alta qualidade e infraestrutura de GPU disponível no país, essa
                arquitetura deixou de ser privilégio de superpotências: é uma decisão de desenho ao alcance de
                hospitais, empresas e governos subnacionais.
              </p>
            </article>

            <BlogCtaCard
              title="Infraestrutura soberana de IA"
              text="A NowGo AI projeta e implanta a camada soberana da sua organização: LLMs customizados, agentes e orquestração operando sobre dados residentes — com o melhor da tecnologia global onde ela não compromete o controle."
              wa={WA_SOBERANIA}
              waLabel="Falar sobre soberania"
            />

            <article className="ng-page-block" id="pratica">
              <h2>Soberania na prática: a arquitetura que funciona</h2>
              <p>
                A arquitetura soberana madura é <strong>híbrida e modular</strong>. Dados sensíveis e funções
                críticas rodam em modelos especializados sobre infraestrutura controlada; tarefas genéricas e
                não sensíveis podem usar plataformas globais, com política clara do que trafega onde. Entre as
                duas camadas, uma <strong>camada de orquestração</strong> decide, registra e audita — os{" "}
                <Link href="/blog/agentes-de-inteligencia-artificial">agentes de IA</Link> operam dentro dela,
                com permissões e trilha completa.
              </p>
              <p>
                Os princípios de desenho são os mesmos que aplicamos em qualquer projeto: modular (cada
                capacidade é um módulo que se integra, não um silo), interoperável (conversa com os sistemas
                existentes), enterprise-grade e government-grade (segurança, auditoria e conformidade — LGPD
                incluída — desde a origem). É o padrão da{" "}
                <a href="/">plataforma da NowGo AI</a> para saúde, cidades, educação e indústria.
              </p>
            </article>

            <article className="ng-page-block" id="agenda">
              <h2>A agenda para empresas e governos brasileiros</h2>
              <p>
                <strong>Para empresas:</strong> mapear quais dados e funções são críticos demais para depender
                de terceiros; começar a especializar modelos com o conhecimento proprietário do negócio — que é,
                cada vez mais, o único diferencial que um concorrente não copia contratando a mesma plataforma.
              </p>
              <p>
                <strong>Para governos:</strong> tratar dados de cidadãos como ativo estratégico sob jurisdição
                nacional; exigir auditabilidade e residência de dados nas contratações de IA; e usar o poder de
                compra público para desenvolver capacidade local — como fizeram os países que hoje lideram.
              </p>
              <p>
                <strong>Para ambos:</strong> começar agora, por um módulo, com indicador claro — e escalar sobre
                a mesma infraestrutura. Soberania não se decreta; se constrói, projeto a projeto. E cada projeto
                construído sobre arquitetura dependente é retrabalho futuro garantido.
              </p>
            </article>

            <article className="ng-page-block ng-blog-faq" id="faq">
              <h2>Perguntas frequentes sobre IA soberana no Brasil</h2>
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
          <h2 className="ng-h2 ng-final-h2">Construa a camada soberana da sua organização</h2>
          <p className="ng-section-sub ng-final-sub">
            Converse com quem projeta infraestrutura soberana de IA para empresas, governos e cidades — módulo a
            módulo, com controle e auditoria desde o desenho.
          </p>
          <div className="ng-hero-actions">
            <a href={CAL_URL} target="_blank" rel="noreferrer" className="btn-primary">
              Agendar reunião
            </a>
            <a href={WA_SOBERANIA} target="_blank" rel="noreferrer" className="btn-secondary">
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
