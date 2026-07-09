import LandingShell from "@/landing/LandingShell";
import Seo from "@/components/Seo";
import BlogCtaCard, { CAL_URL, waLink } from "@/components/BlogCtaCard";
import { Link } from "wouter";
import "@/landing/styles/blog.css";

/**
 * Artigo do cluster "Conceitos Técnicos" (prioridade 2 do plano de conteúdo).
 * Palavras-chave alvo: agentes de inteligência artificial, agentes de IA,
 * o que é um agente de IA, LLM, IA generativa.
 */

const WA_AGENTES = waLink(
  "Olá! Li o artigo sobre agentes de IA da NowGo AI e quero avaliar agentes autônomos para a minha operação.",
);

const CANONICAL = "https://www.nowgoai.com/blog/agentes-de-inteligencia-artificial";
const TITLE = "Agentes de IA: o que são, como funcionam e o que muda para empresas e governos · NowGo AI";
const DESCRIPTION =
  "Agentes de inteligência artificial explicados: a diferença entre chatbot, copiloto e agente autônomo, como agentes executam processos de ponta a ponta, e o que é preciso para usá-los com segurança em empresas e governos.";

const FAQ: { q: string; a: string }[] = [
  {
    q: "O que é um agente de inteligência artificial?",
    a: "Um agente de IA é um sistema que, além de compreender e gerar linguagem, executa ações para cumprir um objetivo: consulta sistemas, preenche registros, envia comunicações, aciona outros softwares e conduz fluxos de trabalho de várias etapas — com supervisão humana definida em pontos críticos. A diferença para um chatbot é o verbo: o chatbot responde; o agente faz.",
  },
  {
    q: "Qual a diferença entre um agente de IA e o ChatGPT?",
    a: "O ChatGPT é um assistente de conversa de propósito geral: você pergunta, ele responde. Um agente corporativo é especializado em processos da organização e conectado aos seus sistemas — agenda, ERP, CRM, prontuário — podendo executar tarefas de ponta a ponta dentro de regras e permissões definidas. Muitos agentes usam LLMs como 'cérebro', mas o valor está na integração e na governança, não apenas no modelo.",
  },
  {
    q: "O que é um LLM?",
    a: "LLM (Large Language Model, ou grande modelo de linguagem) é o tipo de modelo de IA treinado com volumes massivos de texto para compreender e gerar linguagem natural. É a tecnologia base da IA generativa e dos agentes. Em contexto empresarial e governamental, LLMs podem ser customizados com os dados e as regras da organização e executados em infraestrutura própria — o que garante especialização e soberania.",
  },
  {
    q: "Agentes de IA são seguros para uso em empresas e governos?",
    a: "Sim, quando desenhados com guarda-corpos: permissões mínimas por tarefa, pontos de aprovação humana em ações sensíveis, trilha de auditoria completa de tudo que o agente fez e infraestrutura sob controle da organização. Agente sem governança é risco; agente com arquitetura correta é força de trabalho digital auditável.",
  },
  {
    q: "Por onde começar com agentes de IA?",
    a: "Pelo processo repetitivo de maior volume e regras mais claras: confirmação e agendamento por voz, triagem de solicitações, conciliações e follow-ups de backoffice. Um piloto de escopo fechado, com indicador numérico e supervisão humana, prova o valor em semanas e define o padrão de governança para escalar.",
  },
];

const JSON_LD: Record<string, unknown>[] = [
  {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "Agentes de IA: o que são, como funcionam e o que muda para empresas e governos",
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
      { "@type": "ListItem", position: 3, name: "Agentes de IA", item: CANONICAL },
    ],
  },
];

export default function BlogAgentesDeIa() {
  return (
    <LandingShell>
      <Seo title={TITLE} description={DESCRIPTION} canonical={CANONICAL} jsonLd={JSON_LD} />

      <section className="ng-section ng-section-hero">
        <div className="ng-container">
          <div className="ng-page-hero reveal">
            <span className="ng-eyebrow">Guia NowGo AI · Conceitos</span>
            <h1 className="ng-page-title">
              Agentes de IA: o que são, como funcionam e o que muda para empresas e governos
            </h1>
            <p className="ng-page-subtitle">
              O chatbot responde; o agente executa. Entenda a tecnologia que transforma IA de ferramenta de
              produtividade em força de trabalho digital — e o que é preciso para usá-la com governança.
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
                <li><a href="#definicao">O que é um agente de IA</a></li>
                <li><a href="#niveis">Chatbot, copiloto e agente: os três níveis de autonomia</a></li>
                <li><a href="#anatomia">Como um agente funciona por dentro</a></li>
                <li><a href="#casos">O que agentes já fazem em operações reais</a></li>
                <li><a href="#governanca">Governança: como usar agentes com segurança</a></li>
                <li><a href="#faq">Perguntas frequentes</a></li>
              </ol>
            </nav>

            <article className="ng-page-block" id="definicao">
              <h2>O que é um agente de inteligência artificial</h2>
              <p>
                Um agente de IA é um sistema que recebe um objetivo — "confirme as consultas de amanhã",
                "concilie estes pagamentos", "responda esta solicitação do cidadão" — e executa as etapas
                necessárias para cumpri-lo: consulta sistemas, toma decisões dentro de regras definidas, aciona
                outras ferramentas e reporta o resultado. É a evolução natural da{" "}
                <Link href="/blog/inteligencia-artificial">inteligência artificial</Link> generativa: o modelo
                de linguagem deixa de apenas conversar e passa a operar.
              </p>
              <p>
                A distinção importa porque muda a pergunta que a organização deve fazer. Com chatbots, a
                pergunta era "como a IA pode ajudar minha equipe a responder mais rápido?". Com agentes, a
                pergunta passa a ser "quais processos inteiros posso delegar, mantendo supervisão humana nos
                pontos que importam?".
              </p>
            </article>

            <article className="ng-page-block" id="niveis">
              <h2>Chatbot, copiloto e agente: os três níveis de autonomia</h2>
              <p>
                <strong>Chatbot</strong> — responde perguntas em linguagem natural. Útil, mas passivo: toda ação
                continua com o humano.
              </p>
              <p>
                <strong>Copiloto</strong> — trabalha lado a lado com uma pessoa dentro de uma ferramenta:
                rascunha o texto, sugere o código, resume a reunião. A produtividade sobe, mas o ritmo continua
                limitado pela jornada humana.
              </p>
              <p>
                <strong>Agente autônomo</strong> — recebe o objetivo e conduz o fluxo de ponta a ponta,
                acionando sistemas e pessoas quando necessário. Opera 24/7, em escala, com cada ação registrada.
                É o nível em que a IA passa a compor a capacidade operacional da organização — e o nível que
                exige arquitetura e governança de verdade.
              </p>
            </article>

            <article className="ng-page-block" id="anatomia">
              <h2>Como um agente funciona por dentro</h2>
              <p>
                Todo agente combina quatro componentes. O <strong>cérebro</strong> é um modelo de linguagem
                (LLM) — em contextos corporativos e públicos, idealmente customizado com o vocabulário, as
                regras e os dados da organização. A <strong>memória e o contexto</strong> conectam o agente às
                fontes de verdade da operação: agenda, ERP, CRM, prontuário, bases de dados. As{" "}
                <strong>ferramentas</strong> são as ações que ele pode executar — enviar mensagem, atualizar
                registro, fazer uma ligação por voz, acionar outro sistema. E a <strong>orquestração</strong> é
                a camada que coordena tudo: define o que o agente pode fazer sozinho, o que exige aprovação
                humana e como cada passo é registrado para auditoria.
              </p>
              <p>
                É por isso que agentes isolados, comprados como apps avulsos, entregam pouco: sem integração com
                os sistemas reais e sem camada de orquestração, o "agente" volta a ser um chatbot. O valor está
                na infraestrutura que conecta modelos, dados e sistemas — modular, interoperável e sob controle
                da organização.
              </p>
            </article>

            <BlogCtaCard
              title="Agentes autônomos integrados à sua operação"
              text="A NowGo AI desenha e implanta agentes de IA — de voz e de backoffice — como módulos de uma camada de orquestração soberana, conectada aos sistemas que sua organização já usa."
              wa={WA_AGENTES}
              waLabel="Avaliar agentes na minha operação"
            />

            <article className="ng-page-block" id="casos">
              <h2>O que agentes já fazem em operações reais</h2>
              <p>
                <strong>Atendimento por voz</strong> — agentes que atendem e fazem ligações em linguagem
                natural: agendamento e confirmação na <Link href="/blog/inteligencia-artificial-na-saude">saúde</Link>,
                atendimento ao cidadão em serviços públicos, cobrança e pós-venda em empresas.
              </p>
              <p>
                <strong>Backoffice</strong> — conciliação financeira, conferência de faturamento, follow-up de
                pendências, atualização de cadastros: fluxos repetitivos de várias etapas que o agente executa
                nos próprios sistemas da organização.
              </p>
              <p>
                <strong>Gestão e decisão</strong> — agentes que monitoram indicadores, cruzam bases públicas e
                internas e produzem briefings operacionais para gestores, transformando dado disperso em decisão
                diária. É o padrão que orienta plataformas de orquestração urbana e corporativa.
              </p>
            </article>

            <article className="ng-page-block" id="governanca">
              <h2>Governança: como usar agentes com segurança</h2>
              <p>
                Autonomia sem governança é passivo, não ativo. Quatro princípios separam projetos maduros de
                experimentos arriscados: <strong>permissão mínima</strong> (o agente só acessa o que a tarefa
                exige), <strong>aprovação humana</strong> em ações sensíveis ou irreversíveis,{" "}
                <strong>trilha de auditoria</strong> de cada ação executada e <strong>soberania</strong> — dados
                e modelos operando em infraestrutura sob controle e jurisdição da organização, requisito
                inegociável para governos e para setores regulados.
              </p>
              <p>
                Com esses guarda-corpos, o agente deixa de ser uma caixa-preta e vira o que deve ser: força de
                trabalho digital auditável, que amplia a equipe humana em vez de criar risco novo. É o modelo de
                arquitetura que a NowGo AI, parceira NVIDIA, aplica em seus projetos de{" "}
                <a href="/">infraestrutura soberana de IA para empresas, governos e cidades</a>.
              </p>
            </article>

            <article className="ng-page-block ng-blog-faq" id="faq">
              <h2>Perguntas frequentes sobre agentes de IA</h2>
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
          <h2 className="ng-h2 ng-final-h2">Pronto para colocar agentes de IA para trabalhar?</h2>
          <p className="ng-section-sub ng-final-sub">
            Diagnóstico dos processos com maior potencial de automação e desenho da arquitetura de agentes com
            governança — direto ao ponto, sem compromisso.
          </p>
          <div className="ng-hero-actions">
            <a href={CAL_URL} target="_blank" rel="noreferrer" className="btn-primary">
              Agendar reunião
            </a>
            <a href={WA_AGENTES} target="_blank" rel="noreferrer" className="btn-secondary">
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
