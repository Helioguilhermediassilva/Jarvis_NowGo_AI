import LandingShell from "@/landing/LandingShell";
import Seo from "@/components/Seo";
import BlogCtaCard, { CAL_URL, waLink } from "@/components/BlogCtaCard";
import { Link } from "wouter";
import "@/landing/styles/blog.css";

/**
 * Artigo do cluster "Ferramentas e Assistentes" — recorte estratégico de voz.
 * Palavras-chave alvo: inteligência artificial voz (320), IA de voz,
 * IA para conversar, atendimento com inteligência artificial.
 * Ponte direta com o Voice AI da plataforma NowGo.
 */

const WA_VOZ = waLink(
  "Olá! Li o artigo sobre IA de voz da NowGo AI e quero conversar sobre agentes de voz para o meu atendimento.",
);

const CANONICAL = "https://www.nowgoai.com/blog/inteligencia-artificial-de-voz";
const TITLE = "IA de Voz: como funcionam os agentes que atendem e ligam por telefone · NowGo AI";
const DESCRIPTION =
  "Inteligência artificial de voz explicada: como agentes conversam por telefone em linguagem natural, a diferença para a URA tradicional, casos de uso em saúde, governo e empresas, e o que exige um projeto sério.";

const FAQ: { q: string; a: string }[] = [
  {
    q: "O que é um agente de voz com inteligência artificial?",
    a: "É um sistema que atende e realiza ligações conversando em linguagem natural: entende o que a pessoa diz (não apenas 'digite 1'), responde com voz natural, consulta sistemas em tempo real e executa a tarefa — agendar, confirmar, informar, registrar. É a combinação de reconhecimento de fala, um modelo de linguagem e síntese de voz, integrada aos sistemas da organização.",
  },
  {
    q: "Qual a diferença entre IA de voz e a URA tradicional?",
    a: "A URA impõe um menu rígido ('digite 1 para...'); o agente de voz entende a pessoa falando naturalmente, em qualquer ordem, com sotaques e interrupções. A URA transfere; o agente resolve — porque está conectado à agenda, ao cadastro e aos sistemas. Na prática, a diferença aparece na taxa de resolução sem humano e na satisfação de quem liga.",
  },
  {
    q: "Existe IA para conversar por voz em português?",
    a: "Sim — a tecnologia atual conversa em português brasileiro com naturalidade, incluindo variações regionais. Para uso profissional, o diferencial não é o idioma, e sim a especialização: o agente precisa dominar o vocabulário do negócio (convênios, protocolos, serviços) e estar integrado aos sistemas reais para resolver de fato.",
  },
  {
    q: "IA de voz funciona para o público que não usa aplicativos?",
    a: "Esse é justamente seu maior mérito: o telefone é o canal mais universal que existe. Idosos, populações com menor familiaridade digital e quem está sem internet resolvem tudo por uma ligação comum — sem baixar app, sem criar senha. Para serviços públicos e saúde, é a tecnologia de IA mais inclusiva disponível.",
  },
  {
    q: "O que um projeto sério de IA de voz precisa ter?",
    a: "Quatro coisas: integração real com os sistemas (sem ela, o agente vira URA sofisticada), transparência (a pessoa deve saber que fala com uma IA e poder pedir um humano a qualquer momento), governança de dados — chamadas contêm dados pessoais e às vezes sensíveis, que devem residir em infraestrutura controlada — e medição contínua de taxa de resolução e satisfação.",
  },
];

const JSON_LD: Record<string, unknown>[] = [
  {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "IA de Voz: como funcionam os agentes que atendem e ligam por telefone",
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
      { "@type": "ListItem", position: 3, name: "IA de Voz", item: CANONICAL },
    ],
  },
];

export default function BlogIaDeVoz() {
  return (
    <LandingShell>
      <Seo title={TITLE} description={DESCRIPTION} canonical={CANONICAL} jsonLd={JSON_LD} />

      <section className="ng-section ng-section-hero">
        <div className="ng-container">
          <div className="ng-page-hero reveal">
            <span className="ng-eyebrow">Guia NowGo AI · Voz</span>
            <h1 className="ng-page-title">
              IA de Voz: como funcionam os agentes que atendem e ligam por telefone
            </h1>
            <p className="ng-page-subtitle">
              O telefone é o canal mais universal que existe — e acaba de ganhar inteligência. Como agentes de
              voz conversam, resolvem e incluem quem nenhum aplicativo alcança.
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
                <li><a href="#o-que-e">O que é IA de voz (e por que não é uma URA)</a></li>
                <li><a href="#como-funciona">Como funciona uma conversa com agente de voz</a></li>
                <li><a href="#casos">Casos de uso: saúde, governo e empresas</a></li>
                <li><a href="#inclusao">A tecnologia de IA mais inclusiva que existe</a></li>
                <li><a href="#projeto">O que separa um projeto sério de um brinquedo</a></li>
                <li><a href="#faq">Perguntas frequentes</a></li>
              </ol>
            </nav>

            <article className="ng-page-block" id="o-que-e">
              <h2>O que é IA de voz — e por que não é uma URA</h2>
              <p>
                Um agente de voz com <Link href="/blog/inteligencia-artificial">inteligência artificial</Link>{" "}
                atende e realiza ligações conversando como uma pessoa: entende fala natural (com sotaque,
                hesitação e interrupção), responde com voz fluida e — o ponto decisivo — <strong>resolve</strong>,
                porque está conectado aos sistemas da organização: agenda, cadastro, faturamento, protocolo.
              </p>
              <p>
                A URA tradicional é o oposto: um menu rígido que empurra a pessoa por caminhos numerados até,
                na maioria das vezes, transferi-la para a fila humana. A diferença não é cosmética — é de taxa
                de resolução. O agente de voz é um{" "}
                <Link href="/blog/agentes-de-inteligencia-artificial">agente de IA</Link> completo cujo canal é
                o telefone.
              </p>
            </article>

            <article className="ng-page-block" id="como-funciona">
              <h2>Como funciona uma conversa com agente de voz</h2>
              <p>
                Em cada troca, três motores trabalham em tempo real: o <strong>reconhecimento de fala</strong>{" "}
                transforma o áudio em texto; um <strong>modelo de linguagem</strong> — idealmente especializado
                no vocabulário do negócio — entende a intenção, consulta os sistemas e decide a resposta; e a{" "}
                <strong>síntese de voz</strong> devolve a fala com naturalidade. Tudo em fração de segundo, para
                que a conversa flua sem pausas artificiais.
              </p>
              <p>
                A engenharia difícil não está em nenhuma das três peças isoladas — está na orquestração: manter
                contexto ao longo da ligação, executar ações nos sistemas com permissões corretas, saber quando
                transferir para um humano com todo o contexto junto, e registrar cada passo para auditoria.
              </p>
            </article>

            <article className="ng-page-block" id="casos">
              <h2>Casos de uso: saúde, governo e empresas</h2>
              <p>
                <strong><Link href="/blog/inteligencia-artificial-na-saude">Saúde</Link>.</strong> O caso mais
                maduro: agendamento, remarcação e confirmação de consultas e exames por telefone, com impacto
                direto no absenteísmo e na fila da recepção; orientações de preparo e triagem inicial com
                direcionamento correto.
              </p>
              <p>
                <strong>Governo e cidades.</strong> Atendimento ao cidadão 24/7 para informações, protocolos e
                agendamento de serviços — no canal que toda a população domina. Para o setor público, voz é a
                diferença entre digitalizar o serviço e digitalizar <em>o acesso</em> ao serviço.
              </p>
              <p>
                <strong>Empresas.</strong> Confirmação de entregas, cobrança com régua respeitosa, pós-venda,
                qualificação de leads e pesquisa de satisfação — ligações que precisam acontecer em volume e que
                nenhuma equipe humana dá conta de fazer com consistência.
              </p>
            </article>

            <BlogCtaCard
              title="Voice AI integrado à sua operação"
              text="A NowGo AI implanta agentes de voz em português, integrados aos seus sistemas e operando sobre infraestrutura soberana — do agendamento em saúde ao atendimento ao cidadão."
              wa={WA_VOZ}
              waLabel="Falar sobre voz no meu atendimento"
            />

            <article className="ng-page-block" id="inclusao">
              <h2>A tecnologia de IA mais inclusiva que existe</h2>
              <p>
                Toda estratégia digital esbarra no mesmo muro: uma parte relevante da população — idosos,
                pessoas com menor letramento digital, quem está sem dados no celular — não usa aplicativo, não
                abre site, não cria senha. Mas todos ligam.
              </p>
              <p>
                A IA de voz transforma o canal mais antigo e universal em porta de entrada inteligente: o
                cidadão que liga para marcar uma consulta é atendido na hora, no seu ritmo, na sua forma de
                falar. Para organizações com compromisso de servir populações vulneráveis — hospitais públicos,
                governos, operadoras sociais —, voz não é um canal a mais: é o canal que garante que a
                tecnologia chegue a quem mais precisa dela.
              </p>
            </article>

            <article className="ng-page-block" id="projeto">
              <h2>O que separa um projeto sério de um brinquedo</h2>
              <p>
                <strong>Integração real</strong> — agente sem acesso à agenda e aos sistemas é URA com voz
                bonita. <strong>Transparência</strong> — a pessoa sabe que fala com uma IA e pode pedir um
                humano a qualquer momento, sendo transferida com o contexto completo.{" "}
                <strong>Governança de dados</strong> — ligações carregam dados pessoais e, em saúde, dados
                sensíveis: gravações e transcrições devem residir em infraestrutura sob controle da organização,
                no padrão de <Link href="/blog/inteligencia-artificial-no-brasil">soberania</Link> que
                defendemos para tudo que é crítico. <strong>Medição contínua</strong> — taxa de resolução sem
                humano, satisfação e custo por chamada como indicadores vivos do projeto.
              </p>
              <p>
                É assim que o Voice AI se integra à <a href="/">plataforma da NowGo AI</a>: não um bot de
                telefone avulso, mas um módulo de voz da mesma infraestrutura soberana que orquestra dados,
                agentes e sistemas.
              </p>
            </article>

            <article className="ng-page-block ng-blog-faq" id="faq">
              <h2>Perguntas frequentes sobre IA de voz</h2>
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
          <h2 className="ng-h2 ng-final-h2">Seu telefone pode atender sozinho — e bem</h2>
          <p className="ng-section-sub ng-final-sub">
            Diagnóstico do seu fluxo de ligações e desenho do agente de voz com integração, transparência e
            soberania — direto ao ponto, sem compromisso.
          </p>
          <div className="ng-hero-actions">
            <a href={CAL_URL} target="_blank" rel="noreferrer" className="btn-primary">
              Agendar reunião
            </a>
            <a href={WA_VOZ} target="_blank" rel="noreferrer" className="btn-secondary">
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
