import LandingShell from "@/landing/LandingShell";
import Seo from "@/components/Seo";
import BlogCtaCard, { CAL_URL, waLink } from "@/components/BlogCtaCard";
import { Link } from "wouter";
import "@/landing/styles/blog.css";

/**
 * Artigo do cluster "Conceitos Técnicos".
 * Palavras-chave alvo: inteligência artificial e machine learning (720/mês),
 * IA vs machine learning, diferença entre IA e machine learning, deep learning.
 */

const WA_GERAL = waLink(
  "Olá! Li o artigo sobre IA e machine learning da NowGo AI e quero avaliar aplicações na minha organização.",
);

const CANONICAL = "https://www.nowgoai.com/blog/inteligencia-artificial-e-machine-learning";
const TITLE =
  "Inteligência Artificial e Machine Learning: qual a diferença (e o que isso muda na prática) · NowGo AI";
const DESCRIPTION =
  "IA, machine learning, deep learning e IA generativa explicados sem jargão: como os conceitos se encaixam, exemplos práticos de cada um e qual deles a sua organização realmente precisa.";

const FAQ: { q: string; a: string }[] = [
  {
    q: "Qual é a diferença entre inteligência artificial e machine learning?",
    a: "Inteligência artificial é o campo amplo: sistemas que executam tarefas associadas à inteligência humana. Machine learning é uma subárea da IA: a técnica em que o sistema aprende padrões a partir de dados, em vez de seguir regras programadas manualmente. Todo machine learning é IA, mas IA inclui também outras abordagens.",
  },
  {
    q: "O que é deep learning?",
    a: "Deep learning (aprendizado profundo) é uma subárea do machine learning que usa redes neurais com muitas camadas para aprender padrões complexos — é a técnica por trás do reconhecimento de imagem e voz modernos e dos grandes modelos de linguagem (LLMs) que alimentam a IA generativa.",
  },
  {
    q: "IA generativa é a mesma coisa que machine learning?",
    a: "A IA generativa é construída com machine learning (mais precisamente, com deep learning), mas é um tipo específico: modelos que criam conteúdo novo — texto, imagem, voz, código. Já o machine learning tradicional se concentra em prever e classificar: risco de crédito, previsão de demanda, detecção de fraude.",
  },
  {
    q: "Minha empresa precisa de machine learning ou de IA generativa?",
    a: "Provavelmente dos dois, para problemas diferentes. Previsões sobre dados estruturados (demanda, inadimplência, manutenção) pedem machine learning tradicional. Tarefas de linguagem e atendimento (documentos, conversas, voz) pedem IA generativa e agentes. Operações maduras combinam ambos sobre a mesma infraestrutura de dados.",
  },
];

const JSON_LD: Record<string, unknown>[] = [
  {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "Inteligência Artificial e Machine Learning: qual a diferença (e o que isso muda na prática)",
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
      { "@type": "ListItem", position: 3, name: "IA e Machine Learning", item: CANONICAL },
    ],
  },
];

export default function BlogIaEMachineLearning() {
  return (
    <LandingShell>
      <Seo title={TITLE} description={DESCRIPTION} canonical={CANONICAL} jsonLd={JSON_LD} />

      <section className="ng-section ng-section-hero">
        <div className="ng-container">
          <div className="ng-page-hero reveal">
            <span className="ng-eyebrow">Guia NowGo AI · Conceitos</span>
            <h1 className="ng-page-title">
              Inteligência Artificial e Machine Learning: qual a diferença — e o que isso muda na prática
            </h1>
            <p className="ng-page-subtitle">
              IA, machine learning, deep learning e IA generativa formam camadas de um mesmo campo. Entenda como
              se encaixam, com exemplos reais — e descubra qual deles o seu problema realmente pede.
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
                <li><a href="#resposta">A resposta em um parágrafo</a></li>
                <li><a href="#camadas">As camadas: IA → machine learning → deep learning → IA generativa</a></li>
                <li><a href="#exemplos">Exemplos práticos de cada camada</a></li>
                <li><a href="#qual">Qual a sua organização precisa?</a></li>
                <li><a href="#faq">Perguntas frequentes</a></li>
              </ol>
            </nav>

            <article className="ng-page-block" id="resposta">
              <h2>A resposta em um parágrafo</h2>
              <p>
                <strong>Inteligência artificial</strong> é o campo amplo: construir sistemas que executam
                tarefas associadas à inteligência humana. <strong>Machine learning</strong> é uma subárea da IA:
                em vez de programar regras manualmente, o sistema aprende padrões a partir de dados.{" "}
                <strong>Deep learning</strong> é uma subárea do machine learning que usa redes neurais profundas
                para padrões complexos. E a <strong>IA generativa</strong> — a geração do ChatGPT e dos agentes
                — é construída sobre deep learning para criar conteúdo novo: texto, imagem, voz, código. São
                círculos concêntricos, não tecnologias rivais.
              </p>
            </article>

            <article className="ng-page-block" id="camadas">
              <h2>As camadas, da mais ampla à mais específica</h2>
              <p>
                <strong>Inteligência artificial (o campo).</strong> Nasceu formalmente em 1956 e engloba tudo:
                dos antigos sistemas de regras ("se X, então Y") aos modelos atuais. Quando alguém diz que uma
                empresa "usa IA", está no nível mais genérico possível — a pergunta útil é sempre{" "}
                <em>qual técnica, para qual problema</em>.
              </p>
              <p>
                <strong>Machine learning (a técnica dominante).</strong> O sistema recebe exemplos históricos —
                transações legítimas e fraudulentas, pacientes que faltaram e que compareceram — e aprende os
                padrões que distinguem uns dos outros. O resultado é um modelo capaz de prever e classificar
                casos novos. É a técnica por trás da maioria do valor de IA gerado em empresas na última década.
              </p>
              <p>
                <strong>Deep learning (a técnica que destravou a era atual).</strong> Redes neurais com muitas
                camadas, treinadas com grandes volumes de dados e poder computacional — tipicamente GPUs. Foi o
                deep learning que tornou possível reconhecer imagens e voz com precisão prática e, depois,
                treinar os grandes modelos de linguagem.
              </p>
              <p>
                <strong>IA generativa e agentes (a fronteira).</strong> LLMs que compreendem e produzem
                linguagem, imagem e voz — e, quando conectados a sistemas e ferramentas, viram{" "}
                <Link href="/blog/agentes-de-inteligencia-artificial">agentes de IA</Link> que executam
                processos de ponta a ponta.
              </p>
            </article>

            <article className="ng-page-block" id="exemplos">
              <h2>Exemplos práticos de cada camada</h2>
              <p>
                <strong>Machine learning tradicional:</strong> previsão de demanda e ocupação de leitos,
                detecção de fraude em pagamentos, score de risco de crédito, manutenção preditiva de
                equipamentos, previsão de evasão escolar. Dados estruturados, resposta numérica ou
                classificação.
              </p>
              <p>
                <strong>Deep learning:</strong> leitura assistida de exames de imagem na{" "}
                <Link href="/blog/inteligencia-artificial-na-saude">saúde</Link>, reconhecimento de voz,
                inspeção visual de qualidade na indústria, visão computacional em cidades (contagem de fluxo,
                detecção de incidentes).
              </p>
              <p>
                <strong>IA generativa e agentes:</strong> atendimento por voz que agenda e confirma,
                documentação assistida, análise e redação de documentos, copilotos internos treinados no
                conhecimento da organização, agentes de backoffice que operam sistemas legados.
              </p>
            </article>

            <BlogCtaCard
              title="Do conceito à aplicação certa"
              text="A NowGo AI faz o diagnóstico do seu problema e desenha a combinação correta — machine learning para previsão, IA generativa e agentes para linguagem e processos — sobre uma infraestrutura soberana única."
              wa={WA_GERAL}
              waLabel="Avaliar meu caso"
            />

            <article className="ng-page-block" id="qual">
              <h2>Qual a sua organização precisa?</h2>
              <p>
                A regra prática é olhar para o formato do problema. Se a pergunta é{" "}
                <em>"quanto/qual a chance/qual categoria"</em> sobre dados estruturados — quanto vamos vender,
                qual a chance deste cliente cancelar, esta transação é fraude? — o caminho é machine learning
                tradicional: mais barato de operar, mais fácil de auditar. Se o problema envolve{" "}
                <em>linguagem, documentos, conversa ou execução de processos</em> — atender, redigir, resumir,
                operar sistemas — o caminho é IA generativa e agentes.
              </p>
              <p>
                Operações maduras não escolhem: combinam as duas camadas sobre a mesma base de dados e a mesma
                governança. É a abordagem da{" "}
                <a href="/">plataforma soberana da NowGo AI</a> — modelos preditivos, LLMs customizados e
                agentes como módulos de uma infraestrutura única, e não como ferramentas desconexas. Para
                entender o campo completo, veja também o nosso{" "}
                <Link href="/blog/inteligencia-artificial">guia completo de inteligência artificial</Link>.
              </p>
            </article>

            <article className="ng-page-block ng-blog-faq" id="faq">
              <h2>Perguntas frequentes</h2>
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
          <h2 className="ng-h2 ng-final-h2">Quer aplicar a técnica certa ao seu problema?</h2>
          <p className="ng-section-sub ng-final-sub">
            Diagnóstico direto: onde machine learning resolve, onde agentes resolvem e como combinar os dois com
            soberania de dados.
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
