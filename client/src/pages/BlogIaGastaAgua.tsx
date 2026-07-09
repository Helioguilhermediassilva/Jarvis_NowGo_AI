import LandingShell from "@/landing/LandingShell";
import Seo from "@/components/Seo";
import BlogCtaCard, { CAL_URL, waLink } from "@/components/BlogCtaCard";
import { Link } from "wouter";
import "@/landing/styles/blog.css";

/**
 * Artigo do cluster "IA e Sociedade" — candidato a featured snippet.
 * Palavras-chave alvo: por que a inteligência artificial gasta água,
 * inteligência artificial usa água, IA consumo de energia.
 * Pergunta real da base de pesquisa com pouca resposta de qualidade em pt-BR.
 */

const WA_EFICIENCIA = waLink(
  "Olá! Li o artigo sobre consumo de água e energia da IA da NowGo AI e quero conversar sobre infraestrutura de IA eficiente.",
);

const CANONICAL = "https://www.nowgoai.com/blog/inteligencia-artificial-gasta-agua";
const TITLE =
  "Por que a Inteligência Artificial gasta água (e energia)? A explicação completa · NowGo AI";
const DESCRIPTION =
  "Entenda por que a IA consome água e energia: refrigeração de data centers, treinamento e uso de modelos, o que muda de um chip para outro — e como projetar IA eficiente e sustentável.";

const FAQ: { q: string; a: string }[] = [
  {
    q: "Por que a inteligência artificial gasta água?",
    a: "Porque os servidores que executam os modelos de IA geram muito calor e precisam de refrigeração contínua. Uma das formas mais comuns de refrigerar data centers é a evaporativa, que consome água. Além do resfriamento direto, há consumo indireto: a geração da eletricidade que alimenta o data center também usa água em várias fontes (térmicas e hidrelétricas, por exemplo).",
  },
  {
    q: "Quanta água a IA consome?",
    a: "Depende do modelo, do data center e do clima local — por isso estimativas variam bastante. O consumo relevante acontece em duas fases: o treinamento de grandes modelos (semanas de computação intensa) e o uso em escala (bilhões de consultas). O ponto essencial é que o consumo por consulta individual é pequeno, mas a escala global torna o total significativo — o que faz da eficiência um critério central de projeto.",
  },
  {
    q: "A IA também gasta muita energia?",
    a: "Sim — água e energia são duas faces do mesmo fenômeno. Treinar e executar modelos exige grande poder computacional (GPUs), que consome eletricidade e gera calor; o calor exige refrigeração, que consome mais energia e, muitas vezes, água. Data centers de IA são hoje um dos vetores de crescimento da demanda elétrica global.",
  },
  {
    q: "É possível usar IA de forma sustentável?",
    a: "Sim, e as alavancas são conhecidas: usar o modelo do tamanho certo para cada tarefa (modelos menores e especializados consomem uma fração dos gigantes), localizar processamento em regiões de energia limpa — vantagem natural do Brasil, com matriz majoritariamente renovável —, adotar refrigeração eficiente e medir o consumo como indicador de projeto, não como nota de rodapé.",
  },
];

const JSON_LD: Record<string, unknown>[] = [
  {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "Por que a Inteligência Artificial gasta água (e energia)? A explicação completa",
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
      { "@type": "ListItem", position: 3, name: "IA, água e energia", item: CANONICAL },
    ],
  },
];

export default function BlogIaGastaAgua() {
  return (
    <LandingShell>
      <Seo title={TITLE} description={DESCRIPTION} canonical={CANONICAL} jsonLd={JSON_LD} />

      <section className="ng-section ng-section-hero">
        <div className="ng-container">
          <div className="ng-page-hero reveal">
            <span className="ng-eyebrow">Guia NowGo AI · Sociedade</span>
            <h1 className="ng-page-title">
              Por que a inteligência artificial gasta água (e energia)? A explicação completa
            </h1>
            <p className="ng-page-subtitle">
              A cada resposta de um modelo de IA existe um data center trabalhando — e esquentando. Entenda de
              onde vem o consumo de água e energia da IA, o que o influencia e como projetar sistemas
              eficientes.
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
                <li><a href="#resposta">A resposta direta</a></li>
                <li><a href="#calor">De onde vem o calor: GPUs e data centers</a></li>
                <li><a href="#agua">Onde a água entra: refrigeração direta e indireta</a></li>
                <li><a href="#fases">Treinamento vs uso: quando a IA consome mais</a></li>
                <li><a href="#eficiencia">Como projetar IA eficiente (e a vantagem do Brasil)</a></li>
                <li><a href="#faq">Perguntas frequentes</a></li>
              </ol>
            </nav>

            <article className="ng-page-block" id="resposta">
              <h2>A resposta direta</h2>
              <p>
                A inteligência artificial gasta água porque <strong>os servidores que executam os modelos
                geram calor intenso e precisam de refrigeração contínua</strong> — e uma das formas mais comuns
                de refrigerar data centers, a evaporativa, consome água. Some-se o consumo indireto: gerar a
                eletricidade que alimenta esses data centers também demanda água em boa parte das fontes. Água e
                energia, portanto, são duas faces do mesmo fenômeno físico: computação em massa produz calor, e
                calor precisa ir para algum lugar.
              </p>
            </article>

            <article className="ng-page-block" id="calor">
              <h2>De onde vem o calor: GPUs e data centers</h2>
              <p>
                Modelos de <Link href="/blog/inteligencia-artificial">inteligência artificial</Link> — em
                especial os grandes modelos de linguagem — rodam em GPUs, chips projetados para bilhões de
                cálculos em paralelo. Cada GPU de última geração consome centenas de watts; um data center de IA
                agrupa dezenas de milhares delas, operando 24/7. Praticamente toda essa eletricidade vira calor
                dentro das salas de servidores.
              </p>
              <p>
                Se esse calor não for removido, os equipamentos falham. Por isso, a refrigeração é parte tão
                estrutural de um data center quanto os próprios servidores — e é nela que o consumo de água se
                concentra.
              </p>
            </article>

            <article className="ng-page-block" id="agua">
              <h2>Onde a água entra: refrigeração direta e indireta</h2>
              <p>
                <strong>Consumo direto.</strong> Muitos data centers usam refrigeração evaporativa: a água
                absorve o calor e parte dela evapora nas torres de resfriamento — é água efetivamente consumida,
                não apenas circulada. Técnicas alternativas (refrigeração líquida em circuito fechado,
                free-cooling em climas frios) reduzem esse consumo, mas têm custos e limites próprios.
              </p>
              <p>
                <strong>Consumo indireto.</strong> A eletricidade que alimenta o data center também tem pegada
                hídrica: usinas térmicas usam água para vapor e resfriamento, e hidrelétricas têm perdas por
                evaporação nos reservatórios. Por isso análises sérias somam as duas parcelas — a água do
                resfriamento e a água embutida na energia.
              </p>
              <p>
                <strong>O fator local.</strong> O mesmo modelo pode ter pegadas muito diferentes conforme o
                lugar: clima (quanto mais quente, mais refrigeração), tecnologia do data center e fonte da
                energia. É por isso que estimativas de "quantos litros por consulta" variam tanto — e por que a
                localização da infraestrutura é uma decisão ambiental, não só técnica.
              </p>
            </article>

            <article className="ng-page-block" id="fases">
              <h2>Treinamento vs uso: quando a IA consome mais</h2>
              <p>
                O consumo acontece em duas fases distintas. O <strong>treinamento</strong> de um grande modelo é
                um evento concentrado: semanas ou meses de milhares de GPUs a plena carga. O <strong>uso</strong>{" "}
                (inferência) é o oposto: cada consulta individual custa pouco, mas bilhões de consultas diárias,
                no mundo todo, somam um consumo contínuo que já supera o do treinamento nos serviços de grande
                escala.
              </p>
              <p>
                Essa distinção importa para quem decide: uma organização que <em>usa</em> IA não repete o custo
                do treinamento dos grandes modelos — e pode reduzir drasticamente sua pegada escolhendo modelos
                do tamanho certo para cada tarefa, em vez de usar o maior modelo disponível para tudo.
              </p>
            </article>

            <BlogCtaCard
              title="IA eficiente por desenho"
              text="A NowGo AI dimensiona modelos e infraestrutura para o problema real — modelos especializados, menores e mais eficientes, com dados residentes em infraestrutura nacional de matriz limpa."
              wa={WA_EFICIENCIA}
              waLabel="Falar sobre eficiência"
            />

            <article className="ng-page-block" id="eficiencia">
              <h2>Como projetar IA eficiente — e a vantagem natural do Brasil</h2>
              <p>
                As alavancas de eficiência são conhecidas: <strong>modelo do tamanho certo</strong> (modelos
                especializados menores entregam a mesma tarefa com fração do consumo dos gigantes),{" "}
                <strong>infraestrutura moderna</strong> (refrigeração líquida e data centers eficientes),{" "}
                <strong>localização inteligente</strong> (energia limpa e clima favorável) e{" "}
                <strong>medição</strong> — tratar consumo de energia e água como indicador de projeto desde o
                desenho.
              </p>
              <p>
                E aqui o Brasil tem uma carta rara: matriz elétrica majoritariamente renovável, território e
                demanda para justificar infraestrutura local. Processar IA em solo brasileiro pode ser, ao mesmo
                tempo, mais <strong>soberano</strong> — como discutimos no artigo sobre{" "}
                <Link href="/blog/inteligencia-artificial-no-brasil">IA no Brasil</Link> — e mais{" "}
                <strong>sustentável</strong> do que depender de data centers em regiões de matriz fóssil. Para
                empresas e governos, eficiência e soberania deixaram de ser agendas separadas: são o mesmo
                projeto de infraestrutura bem desenhada.
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
          <h2 className="ng-h2 ng-final-h2">IA com eficiência e soberania, desde o desenho</h2>
          <p className="ng-section-sub ng-final-sub">
            Converse com quem dimensiona modelos e infraestrutura para o seu problema real — com consumo, custo
            e controle como critérios de projeto.
          </p>
          <div className="ng-hero-actions">
            <a href={CAL_URL} target="_blank" rel="noreferrer" className="btn-primary">
              Agendar reunião
            </a>
            <a href={WA_EFICIENCIA} target="_blank" rel="noreferrer" className="btn-secondary">
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
