import LandingShell from "@/landing/LandingShell";
import Seo from "@/components/Seo";
import BlogCtaCard, { CAL_URL, waLink } from "@/components/BlogCtaCard";
import { Link } from "wouter";
import "@/landing/styles/blog.css";

/**
 * Artigo do cluster "IA nas Profissões" — recorte enterprise.
 * Palavras-chave alvo: inteligência artificial nos negócios, IA financeira,
 * inteligência artificial na indústria 4.0, IA para empresas.
 */

const WA_NEGOCIOS = waLink(
  "Olá! Li o artigo sobre IA para indústria e negócios da NowGo AI e quero avaliar aplicações na minha empresa.",
);

const CANONICAL = "https://www.nowgoai.com/blog/inteligencia-artificial-para-empresas";
const TITLE =
  "Inteligência Artificial para Empresas: aplicações na indústria, finanças e negócios · NowGo AI";
const DESCRIPTION =
  "IA nos negócios com retorno mensurável: previsão de demanda, manutenção preditiva e indústria 4.0, automação financeira, agentes de backoffice e atendimento — e o roteiro de adoção que evita os erros clássicos.";

const FAQ: { q: string; a: string }[] = [
  {
    q: "Como a inteligência artificial é usada nas empresas?",
    a: "Os usos de maior retorno se agrupam em quatro frentes: previsão (demanda, risco, manutenção), automação de processos (backoffice financeiro, documentos, conciliações), atendimento e vendas (agentes de chat e voz, qualificação de leads) e apoio à decisão (análise de dados internos em linguagem natural para gestores). O que separa projetos que dão retorno dos que viram piloto eterno é indicador claro e integração com os sistemas reais da operação.",
  },
  {
    q: "O que é indústria 4.0 e qual o papel da IA nela?",
    a: "Indústria 4.0 é a fábrica conectada: sensores, dados em tempo real e sistemas integrados. A IA é a camada que transforma esses dados em ação — prevendo falhas de equipamento antes que parem a linha (manutenção preditiva), inspecionando qualidade por visão computacional, otimizando planejamento de produção e consumo de energia.",
  },
  {
    q: "Quanto custa implantar IA em uma empresa?",
    a: "O investimento varia com o escopo, mas a pergunta correta é o retorno: projetos bem desenhados começam por um piloto de semanas, com meta numérica (horas economizadas, perdas evitadas, receita recuperada), e só escalam o que provou valor. Desconfie do caminho inverso — plataformas amplas contratadas antes de qualquer caso de uso validado.",
  },
  {
    q: "Minha empresa precisa de um modelo de IA próprio?",
    a: "Nem sempre — mas precisa de controle. Para tarefas genéricas, modelos de mercado bastam. Quando o processo envolve dados sensíveis, conhecimento proprietário ou função crítica, modelos especializados rodando em infraestrutura sob controle da empresa protegem o diferencial competitivo e atendem requisitos de conformidade. A arquitetura madura combina os dois, com uma camada de orquestração decidindo o que roda onde.",
  },
];

const JSON_LD: Record<string, unknown>[] = [
  {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "Inteligência Artificial para Empresas: aplicações na indústria, finanças e negócios",
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
      { "@type": "ListItem", position: 3, name: "IA para Empresas", item: CANONICAL },
    ],
  },
];

export default function BlogIaParaEmpresas() {
  return (
    <LandingShell>
      <Seo title={TITLE} description={DESCRIPTION} canonical={CANONICAL} jsonLd={JSON_LD} />

      <section className="ng-section ng-section-hero">
        <div className="ng-container">
          <div className="ng-page-hero reveal">
            <span className="ng-eyebrow">Guia NowGo AI · Negócios</span>
            <h1 className="ng-page-title">
              Inteligência Artificial para Empresas: aplicações na indústria, nas finanças e nos negócios
            </h1>
            <p className="ng-page-subtitle">
              A régua é uma só: redução mensurável de custo ou aumento mensurável de receita. Onde a IA já passa
              nesse teste — e o roteiro de adoção que evita os erros clássicos.
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
                <li><a href="#regua">A régua: retorno mensurável ou não é projeto</a></li>
                <li><a href="#previsao">Previsão: demanda, risco e manutenção</a></li>
                <li><a href="#industria">Indústria 4.0: a fábrica que enxerga e antecipa</a></li>
                <li><a href="#financas">Finanças e backoffice: onde o dinheiro vaza</a></li>
                <li><a href="#atendimento">Atendimento, vendas e decisão</a></li>
                <li><a href="#erros">Os quatro erros que matam projetos de IA</a></li>
                <li><a href="#faq">Perguntas frequentes</a></li>
              </ol>
            </nav>

            <article className="ng-page-block" id="regua">
              <h2>A régua: retorno mensurável ou não é projeto</h2>
              <p>
                Depois do entusiasmo inicial com a{" "}
                <Link href="/blog/inteligencia-artificial">inteligência artificial</Link> generativa, as
                empresas chegaram à fase adulta da conversa: o que, exatamente, muda no resultado? A boa notícia
                é que a resposta existe — mas ela está concentrada em aplicações específicas, integradas à
                operação, e não no uso difuso de chatbots pela equipe.
              </p>
              <p>
                Este guia organiza as aplicações pela régua que importa a qualquer CFO:{" "}
                <strong>custo que cai ou receita que sobe, com número na frente</strong>. Tudo que não passa
                nesse teste é experimento — legítimo, mas com orçamento e expectativa de experimento.
              </p>
            </article>

            <article className="ng-page-block" id="previsao">
              <h2>Previsão: demanda, risco e manutenção</h2>
              <p>
                A frente mais madura de IA empresarial é o <strong>machine learning preditivo</strong> —{" "}
                <Link href="/blog/inteligencia-artificial-e-machine-learning">diferente da IA generativa</Link>,
                e frequentemente mais rentável. Previsão de demanda reduz estoque parado e ruptura; score de
                risco melhora crédito e cobrança; previsão de churn permite reter o cliente antes do
                cancelamento. São modelos treinados nos dados históricos da própria empresa — o que significa
                que o diferencial é seu, não do fornecedor.
              </p>
            </article>

            <article className="ng-page-block" id="industria">
              <h2>Indústria 4.0: a fábrica que enxerga e antecipa</h2>
              <p>
                Na indústria, a IA é a camada de inteligência sobre a fábrica conectada.{" "}
                <strong>Manutenção preditiva</strong>: sensores + modelos que detectam padrões de falha antes da
                parada de linha — cada hora de parada evitada tem preço conhecido e alto.{" "}
                <strong>Inspeção por visão computacional</strong>: qualidade verificada em 100% da produção, não
                por amostragem. <strong>Otimização</strong>: planejamento de produção, logística e consumo de
                energia ajustados continuamente aos dados reais.
              </p>
              <p>
                O padrão de sucesso industrial é começar pelo ativo mais crítico (a máquina cuja parada custa
                mais caro) e expandir célula a célula — nunca pelo big bang da "fábrica inteligente" inteira de
                uma vez.
              </p>
            </article>

            <article className="ng-page-block" id="financas">
              <h2>Finanças e backoffice: onde o dinheiro vaza em silêncio</h2>
              <p>
                O backoffice financeiro é o território dos <Link href="/blog/agentes-de-inteligencia-artificial">agentes de IA</Link>:
                conciliação bancária e contábil, conferência de notas e contratos, cobrança com régua
                personalizada, detecção de anomalias e fraude em pagamentos, fechamento acelerado. São fluxos de
                regras claras e alto volume — exatamente o perfil em que agentes executam de ponta a ponta com
                trilha de auditoria, e em que o retorno aparece no primeiro trimestre.
              </p>
              <p>
                Para operações financeiras reguladas, o requisito adicional é conhecido: dados sensíveis e
                modelos auditáveis, de preferência em infraestrutura sob controle da empresa — o mesmo princípio
                de <Link href="/blog/inteligencia-artificial-no-brasil">soberania</Link> que vale para governos.
              </p>
            </article>

            <article className="ng-page-block" id="atendimento">
              <h2>Atendimento, vendas e apoio à decisão</h2>
              <p>
                <strong>Atendimento</strong>: agentes de chat e voz que resolvem o repetitivo (status, segunda
                via, agendamento) e transferem com contexto o que exige humano — custo por atendimento cai,
                disponibilidade vai a 24/7. <strong>Vendas</strong>: qualificação automática de leads, follow-up
                que não esquece ninguém, propostas montadas a partir do histórico. <strong>Decisão</strong>:
                gestores perguntando aos próprios dados em linguagem natural — "por que a margem caiu no
                Nordeste?" — sem fila no time de BI.
              </p>
            </article>

            <BlogCtaCard
              title="IA com retorno mensurável para a sua empresa"
              text="A NowGo AI faz o diagnóstico da operação, prioriza os casos de maior retorno e implanta previsão, agentes e automação sobre uma infraestrutura soberana única — integrada aos sistemas que você já usa."
              wa={WA_NEGOCIOS}
              waLabel="Avaliar minha empresa"
            />

            <article className="ng-page-block" id="erros">
              <h2>Os quatro erros que matam projetos de IA empresarial</h2>
              <p>
                <strong>1. Começar pela ferramenta, não pelo problema</strong> — contratar a plataforma e depois
                procurar o que fazer com ela. <strong>2. Ignorar os dados</strong> — modelo nenhum compensa
                cadastro sujo e sistemas que não se falam; parte do projeto é arrumar a casa.{" "}
                <strong>3. Piloto sem indicador</strong> — sem meta numérica definida antes, todo piloto
                "funciona" e nenhum escala. <strong>4. Ferramentas desconexas</strong> — cada área contratando
                seu app de IA cria silos novos; o valor composto vem de uma camada única de orquestração, com
                governança e dados compartilhados.
              </p>
              <p>
                Evitar os quatro é, essencialmente, uma decisão de arquitetura — a que orienta a{" "}
                <a href="/">plataforma da NowGo AI</a>, parceira NVIDIA e Top 50 inovadoras globais: modular,
                interoperável, enterprise-grade, com soberania de dados por desenho.
              </p>
            </article>

            <article className="ng-page-block ng-blog-faq" id="faq">
              <h2>Perguntas frequentes sobre IA para empresas</h2>
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
          <h2 className="ng-h2 ng-final-h2">Onde a IA gera retorno na sua operação?</h2>
          <p className="ng-section-sub ng-final-sub">
            Diagnóstico dos processos com maior potencial, priorização por retorno e implantação com meta
            numérica — direto ao ponto, sem compromisso.
          </p>
          <div className="ng-hero-actions">
            <a href={CAL_URL} target="_blank" rel="noreferrer" className="btn-primary">
              Agendar reunião
            </a>
            <a href={WA_NEGOCIOS} target="_blank" rel="noreferrer" className="btn-secondary">
              Falar no WhatsApp
            </a>
            <a href="/#verticals" className="btn-secondary">
              Ver soluções por setor
            </a>
          </div>
        </div>
      </section>
    </LandingShell>
  );
}
