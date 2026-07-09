import LandingShell from "@/landing/LandingShell";
import Seo from "@/components/Seo";
import BlogCtaCard, { CAL_URL, waLink } from "@/components/BlogCtaCard";
import { Link } from "wouter";
import "@/landing/styles/blog.css";

/**
 * Artigo do cluster "IA nas Profissões". Maior CPC da base de keywords
 * (inteligência artificial advogado — US$ 2,90).
 * Palavras-chave alvo: inteligência artificial advogado, IA para advogados,
 * inteligência artificial no direito, IA jurídica (inclui busca por gratuita).
 */

const WA_JURIDICO = waLink(
  "Olá! Li o artigo sobre IA para advogados da NowGo AI e quero conversar sobre aplicação no meu escritório/departamento jurídico.",
);

const CANONICAL = "https://www.nowgoai.com/blog/inteligencia-artificial-para-advogados";
const TITLE =
  "Inteligência Artificial para Advogados: como a IA já atua no direito (e como adotar com segurança) · NowGo AI";
const DESCRIPTION =
  "IA no direito na prática: pesquisa e análise de jurisprudência, revisão de contratos, automação de rotinas processuais e atendimento ao cliente. O que ferramentas gratuitas entregam, onde está o risco de confidencialidade e como escritórios e departamentos jurídicos devem adotar IA.";

const FAQ: { q: string; a: string }[] = [
  {
    q: "Como a inteligência artificial é usada no direito?",
    a: "Os usos mais consolidados são: pesquisa jurídica e análise de jurisprudência em linguagem natural, revisão e comparação de contratos, elaboração assistida de peças e pareceres (sempre com revisão do advogado), automação de rotinas processuais como monitoramento de prazos e andamentos, e atendimento inicial ao cliente por chat ou voz. A decisão jurídica e a responsabilidade profissional permanecem com o advogado.",
  },
  {
    q: "Existe inteligência artificial jurídica gratuita?",
    a: "Existem assistentes de IA de uso geral gratuitos que ajudam em rascunhos e pesquisas iniciais. O ponto de atenção é duplo: precisão (respostas jurídicas exigem conferência de fontes — modelos genéricos podem citar jurisprudência inexistente) e confidencialidade (dados de clientes inseridos em ferramentas gratuitas podem ser processados fora do controle do escritório, o que conflita com o sigilo profissional). Para uso profissional recorrente, ferramentas especializadas ou infraestrutura própria são o caminho seguro.",
  },
  {
    q: "A IA pode substituir advogados?",
    a: "Não. A IA automatiza a camada repetitiva do trabalho jurídico — busca, triagem, minutas iniciais, controle de prazos — e devolve tempo para o que é essencialmente humano: estratégia, negociação, sustentação e relacionamento com o cliente. O advogado que usa IA bem tende a superar o que não usa; a ferramenta sozinha não substitui nenhum dos dois.",
  },
  {
    q: "Usar IA no jurídico é seguro para o sigilo profissional?",
    a: "Depende da arquitetura. O sigilo advogado-cliente e a LGPD exigem saber onde os dados são processados e quem pode acessá-los. Soluções em que documentos de clientes trafegam por plataformas genéricas, fora do controle do escritório, criam risco real. A alternativa é usar ferramentas com garantias contratuais claras ou, para operações maiores, modelos rodando em infraestrutura sob controle da própria organização.",
  },
  {
    q: "Por onde um escritório de advocacia deve começar com IA?",
    a: "Pelo processo de maior volume e menor risco: triagem e resposta inicial de consultas, monitoramento de andamentos e prazos, e apoio à pesquisa com revisão obrigatória. Um piloto de escopo fechado, com política interna de uso de IA definida antes (o que pode e o que não pode ser inserido nas ferramentas), estabelece o padrão para escalar com segurança.",
  },
];

const JSON_LD: Record<string, unknown>[] = [
  {
    "@context": "https://schema.org",
    "@type": "Article",
    headline:
      "Inteligência Artificial para Advogados: como a IA já atua no direito (e como adotar com segurança)",
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
      { "@type": "ListItem", position: 3, name: "IA para Advogados", item: CANONICAL },
    ],
  },
];

export default function BlogIaParaAdvogados() {
  return (
    <LandingShell>
      <Seo title={TITLE} description={DESCRIPTION} canonical={CANONICAL} jsonLd={JSON_LD} />

      <section className="ng-section ng-section-hero">
        <div className="ng-container">
          <div className="ng-page-hero reveal">
            <span className="ng-eyebrow">Guia NowGo AI · Direito</span>
            <h1 className="ng-page-title">
              Inteligência Artificial para Advogados: como a IA já atua no direito — e como adotar com segurança
            </h1>
            <p className="ng-page-subtitle">
              Pesquisa de jurisprudência, contratos, prazos e atendimento: onde a IA gera resultado no jurídico,
              o que as ferramentas gratuitas realmente entregam e como proteger o sigilo profissional no
              processo.
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
                <li><a href="#panorama">O que muda no trabalho jurídico com IA</a></li>
                <li><a href="#aplicacoes">As cinco aplicações que já funcionam</a></li>
                <li><a href="#gratuitas">IA jurídica gratuita: o que serve e onde mora o risco</a></li>
                <li><a href="#sigilo">Sigilo profissional, LGPD e alucinações</a></li>
                <li><a href="#adocao">Como adotar IA no escritório ou departamento jurídico</a></li>
                <li><a href="#faq">Perguntas frequentes</a></li>
              </ol>
            </nav>

            <article className="ng-page-block" id="panorama">
              <h2>O que muda no trabalho jurídico com inteligência artificial</h2>
              <p>
                O direito é uma profissão de linguagem — e a{" "}
                <Link href="/blog/inteligencia-artificial">inteligência artificial</Link> atual é, antes de
                tudo, uma tecnologia de linguagem. Por isso o impacto no jurídico é tão direto: boa parte da
                rotina de um escritório ou departamento é ler, comparar, resumir e redigir textos sob regras —
                exatamente o que os modelos de linguagem fazem em escala.
              </p>
              <p>
                O resultado não é a substituição do advogado, e sim uma reorganização do tempo: a camada
                repetitiva (busca, triagem, minutas iniciais, controle de prazos) é automatizada, e a hora do
                profissional migra para estratégia, negociação e relacionamento com o cliente — a parte do
                trabalho que define honorários e reputação.
              </p>
            </article>

            <article className="ng-page-block" id="aplicacoes">
              <h2>As cinco aplicações de IA que já funcionam no direito</h2>
              <p>
                <strong>1. Pesquisa jurídica e jurisprudência.</strong> Busca em linguagem natural sobre bases
                de decisões, com resumo dos precedentes relevantes. A regra de ouro: toda citação retornada pela
                IA é conferida na fonte antes de entrar em qualquer peça.
              </p>
              <p>
                <strong>2. Contratos.</strong> Revisão assistida, comparação entre versões, identificação de
                cláusulas de risco e desvios em relação ao padrão do escritório — de horas para minutos, com
                validação final do advogado.
              </p>
              <p>
                <strong>3. Elaboração assistida de peças e pareceres.</strong> A IA produz a primeira versão a
                partir dos fatos e do modelo do escritório; o advogado edita, aprofunda e assume. O ganho está
                na página em branco eliminada, não no texto pronto.
              </p>
              <p>
                <strong>4. Rotinas processuais.</strong> Monitoramento de andamentos, alertas de prazo, triagem
                e distribuição interna de intimações — o tipo de fluxo repetitivo que{" "}
                <Link href="/blog/agentes-de-inteligencia-artificial">agentes de IA</Link> executam de ponta a
                ponta com trilha de auditoria.
              </p>
              <p>
                <strong>5. Atendimento ao cliente.</strong> Triagem inicial de consultas por chat ou voz,
                qualificação do caso e agendamento com o advogado certo — atendimento imediato para o cliente,
                filtro qualificado para a equipe.
              </p>
            </article>

            <BlogCtaCard
              title="IA para escritórios e departamentos jurídicos"
              text="A NowGo AI implanta automação jurídica com governança: agentes para rotinas processuais e atendimento, integrados aos sistemas do escritório, com sigilo e trilha de auditoria por desenho."
              wa={WA_JURIDICO}
              waLabel="Falar sobre meu jurídico"
            />

            <article className="ng-page-block" id="gratuitas">
              <h2>IA jurídica gratuita: o que serve e onde mora o risco</h2>
              <p>
                É uma das buscas mais comuns de advogados — e merece resposta honesta. Assistentes gratuitos de
                uso geral ajudam de verdade em rascunhos, brainstorm de teses e organização de ideias. Para uso
                profissional recorrente, porém, dois limites aparecem rápido.
              </p>
              <p>
                O primeiro é <strong>precisão</strong>: modelos genéricos podem "alucinar" — citar julgados,
                súmulas ou artigos que não existem. Em qualquer uso jurídico, a conferência na fonte é etapa
                obrigatória do fluxo, não opcional. O segundo é <strong>confidencialidade</strong>: inserir
                documentos ou fatos de clientes em ferramentas gratuitas pode significar processamento desses
                dados fora do controle do escritório — em tensão direta com o sigilo profissional e com a LGPD.
              </p>
              <p>
                A regra prática: gratuito para o que é público e genérico; para dados de cliente, apenas
                ferramentas com garantias contratuais claras ou infraestrutura sob controle da organização.
              </p>
            </article>

            <article className="ng-page-block" id="sigilo">
              <h2>Sigilo profissional, LGPD e o problema das alucinações</h2>
              <p>
                O ativo central da advocacia é a confiança — e ela impõe requisitos técnicos. O sigilo
                advogado-cliente exige saber <strong>onde os dados são processados e quem pode acessá-los</strong>;
                a LGPD reforça isso para dados pessoais, com atenção especial a dados sensíveis presentes em
                processos. E a responsabilidade pelo conteúdo das peças é sempre do advogado que assina, o que
                torna a revisão humana parte formal do fluxo de trabalho com IA.
              </p>
              <p>
                Para operações jurídicas maiores — grandes escritórios, departamentos de empresas, órgãos
                públicos — a resposta madura é a mesma que descrevemos para a{" "}
                <Link href="/blog/inteligencia-artificial-na-saude">saúde</Link>: arquitetura soberana, com
                modelos especializados processando documentos em infraestrutura sob controle da organização,
                trilha de auditoria completa e política interna de uso de IA definida antes da primeira
                ferramenta.
              </p>
            </article>

            <article className="ng-page-block" id="adocao">
              <h2>Como adotar IA no escritório ou departamento jurídico</h2>
              <p>
                <strong>1. Política antes de ferramenta</strong> — defina o que pode e o que não pode ser
                inserido em sistemas de IA, e quem revisa o quê. <strong>2. Comece pelo volume</strong> —
                triagem de consultas, prazos e andamentos, minutas padronizadas: alto volume, regras claras,
                risco controlado. <strong>3. Piloto com indicador</strong> — horas economizadas, tempo de
                resposta ao cliente, prazos perdidos (que devem ir a zero). <strong>4. Escale por módulos</strong>{" "}
                — do administrativo ao apoio à estratégia, sobre a mesma infraestrutura, mantendo o advogado no
                centro da decisão.
              </p>
              <p>
                É o modelo de implantação da NowGo AI, parceira NVIDIA e Top 50 inovadoras globais: agentes e
                automação jurídica como módulos de uma{" "}
                <a href="/">infraestrutura soberana de IA para empresas, governos e cidades</a> — não mais uma
                ferramenta avulsa na pilha do escritório.
              </p>
            </article>

            <article className="ng-page-block ng-blog-faq" id="faq">
              <h2>Perguntas frequentes sobre IA para advogados</h2>
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
          <h2 className="ng-h2 ng-final-h2">Quer levar IA para o seu jurídico com segurança?</h2>
          <p className="ng-section-sub ng-final-sub">
            Diagnóstico dos fluxos do seu escritório ou departamento e desenho da automação com sigilo e
            governança — direto ao ponto, sem compromisso.
          </p>
          <div className="ng-hero-actions">
            <a href={CAL_URL} target="_blank" rel="noreferrer" className="btn-primary">
              Agendar reunião
            </a>
            <a href={WA_JURIDICO} target="_blank" rel="noreferrer" className="btn-secondary">
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
