import LandingShell from "@/landing/LandingShell";
import Seo from "@/components/Seo";
import BlogCtaCard, { CAL_URL, waLink } from "@/components/BlogCtaCard";
import { Link } from "wouter";
import "@/landing/styles/blog.css";

/**
 * Artigo do cluster "IA nas Profissões" (prioridade 1 do plano de conteúdo).
 * Palavras-chave alvo: inteligência artificial na saúde, inteligência
 * artificial na medicina, IA e medicina.
 * Linka para a página pilar (/blog/inteligencia-artificial) e afunila para
 * a landing e para o WhatsApp com contexto de saúde.
 */

const WA_SAUDE = waLink(
  "Olá! Li o artigo sobre IA na saúde da NowGo AI e quero conversar sobre aplicação no meu hospital/clínica/operadora.",
);

const CANONICAL = "https://www.nowgoai.com/blog/inteligencia-artificial-na-saude";
const TITLE =
  "Inteligência Artificial na Saúde: aplicações reais em hospitais, clínicas e operadoras · NowGo AI";
const DESCRIPTION =
  "Como a inteligência artificial já funciona na saúde e na medicina: agentes de voz para agendamento e triagem, apoio à radiologia, automação de backoffice hospitalar, LGPD e soberania de dados, e por onde começar.";

const FAQ: { q: string; a: string }[] = [
  {
    q: "Como a inteligência artificial é usada na medicina hoje?",
    a: "As aplicações mais maduras estão em três camadas: relacionamento com o paciente (agentes de voz e chat para agendamento, confirmação e triagem inicial), apoio clínico (priorização de exames de imagem, sugestão de achados para revisão do radiologista, documentação assistida de consultas) e operação (previsão de demanda e de faltas, gestão de leitos, faturamento e combate a glosas). Em todas elas, a decisão clínica permanece com o profissional de saúde.",
  },
  {
    q: "A inteligência artificial pode substituir médicos?",
    a: "Não — e os projetos sérios não tentam isso. A IA atua como camada de apoio: reduz tarefa administrativa, prioriza casos e organiza informação para que o médico decida melhor e mais rápido. A responsabilidade pelo diagnóstico e pela conduta é sempre do profissional habilitado, e a supervisão humana é requisito de desenho, não um detalhe.",
  },
  {
    q: "IA na saúde é compatível com a LGPD?",
    a: "Sim, desde que o projeto nasça com governança: dados de saúde são dados sensíveis pela LGPD, o que exige base legal adequada, minimização, controle de acesso e — ponto crítico — clareza sobre onde os dados são processados. Arquiteturas soberanas, em que os dados permanecem em infraestrutura sob controle da instituição e em jurisdição nacional, simplificam a conformidade e reduzem risco regulatório.",
  },
  {
    q: "Por onde um hospital ou clínica deve começar com IA?",
    a: "Pelo processo com fila ou custo mais evidente e resultado mais fácil de medir. Na prática, os pontos de partida mais comuns são o agendamento e confirmação por agente de voz (reduz falta e libera a recepção) e a automação de rotinas de backoffice como faturamento e glosas. Um piloto bem delimitado, com indicador claro, prova valor em semanas e cria a base para escalar por módulos.",
  },
  {
    q: "Quanto custa implantar inteligência artificial na saúde?",
    a: "Varia com o escopo: um agente de voz para agendamento tem custo e prazo muito diferentes de uma plataforma integrada ao prontuário. A referência correta não é o preço da ferramenta, e sim o retorno mensurável — redução de faltas, de glosas e de horas administrativas. Por isso o caminho recomendado é começar com diagnóstico e piloto de escopo fechado antes de qualquer contrato amplo.",
  },
];

const JSON_LD: Record<string, unknown>[] = [
  {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "Inteligência Artificial na Saúde: aplicações reais em hospitais, clínicas e operadoras",
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
      { "@type": "ListItem", position: 3, name: "IA na Saúde", item: CANONICAL },
    ],
  },
];

export default function BlogIaNaSaude() {
  return (
    <LandingShell>
      <Seo title={TITLE} description={DESCRIPTION} canonical={CANONICAL} jsonLd={JSON_LD} />

      <section className="ng-section ng-section-hero">
        <div className="ng-container">
          <div className="ng-page-hero reveal">
            <span className="ng-eyebrow">Guia NowGo AI · Saúde</span>
            <h1 className="ng-page-title">
              Inteligência Artificial na Saúde: aplicações reais em hospitais, clínicas e operadoras
            </h1>
            <p className="ng-page-subtitle">
              Onde a IA já entrega resultado na medicina — do agente de voz que elimina fila de agendamento ao
              apoio à radiologia e ao backoffice hospitalar — e como implantar com segurança clínica, LGPD e
              soberania de dados.
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
                <li><a href="#panorama">O que a IA muda na saúde, na prática</a></li>
                <li><a href="#paciente">Relacionamento com o paciente: agentes de voz e triagem</a></li>
                <li><a href="#clinico">Apoio clínico: radiologia, laudos e documentação</a></li>
                <li><a href="#operacao">Operação e backoffice: leitos, faltas e glosas</a></li>
                <li><a href="#lgpd">LGPD, ética e soberania de dados na saúde</a></li>
                <li><a href="#implantar">Como implantar: do diagnóstico ao piloto</a></li>
                <li><a href="#faq">Perguntas frequentes</a></li>
              </ol>
            </nav>

            <article className="ng-page-block" id="panorama">
              <h2>O que a inteligência artificial muda na saúde, na prática</h2>
              <p>
                A saúde é o setor onde a distância entre o hype e a operação real é mais visível. De um lado,
                promessas de diagnóstico automático; de outro, hospitais com fila no agendamento, equipes
                assistenciais consumidas por tarefa administrativa e receita perdida em glosas. A{" "}
                <Link href="/blog/inteligencia-artificial">inteligência artificial</Link> que gera resultado
                hoje ataca exatamente essa segunda lista — os gargalos operacionais — enquanto apoia, sem
                substituir, a decisão clínica.
              </p>
              <p>
                Uma forma útil de organizar as aplicações é em três camadas: o relacionamento com o paciente, o
                apoio ao trabalho clínico e a operação do negócio de saúde. As três funcionam melhor quando
                fazem parte de uma mesma infraestrutura — falando com o prontuário, com a agenda e com o
                faturamento — em vez de chegarem como ferramentas isoladas que criam novos silos.
              </p>
            </article>

            <article className="ng-page-block" id="paciente">
              <h2>Relacionamento com o paciente: agentes de voz e triagem inteligente</h2>
              <p>
                O primeiro contato do paciente com a instituição é telefônico ou digital — e é onde mais se
                perde eficiência. <strong>Agentes de voz com IA</strong> atendem ligações em linguagem natural,
                agendam, remarcam e confirmam consultas e exames, respondem dúvidas frequentes de preparo e
                fazem triagem inicial de urgência para direcionar o caso ao canal certo.
              </p>
              <p>
                O impacto é mensurável em três indicadores: taxa de absenteísmo (confirmação ativa reduz
                faltas), tempo de espera no atendimento telefônico e horas de recepção liberadas para o
                atendimento presencial. E, ao contrário das URAs tradicionais, o agente de voz conversa — o que
                muda a experiência do paciente, em especial de populações com menos familiaridade digital, que
                resolvem tudo por uma ligação comum.
              </p>
            </article>

            <BlogCtaCard
              title="Agente de voz para agendamento e confirmação"
              text="A NowGo AI implanta agentes de voz integrados à agenda e ao backoffice da instituição — como módulo de uma infraestrutura soberana, não como mais um software isolado."
              wa={WA_SAUDE}
              waLabel="Falar sobre agente de voz"
            />

            <article className="ng-page-block" id="clinico">
              <h2>Apoio clínico: radiologia, laudos e documentação assistida</h2>
              <p>
                Na camada clínica, o papel da IA é organizar informação e priorizar — nunca decidir sozinha. Em{" "}
                <strong>radiologia</strong>, sistemas de IA ordenam a fila de leitura destacando exames com
                suspeita de achados críticos e sugerem regiões de atenção para revisão do radiologista, o que
                reduz tempo até o laudo nos casos que não podem esperar.
              </p>
              <p>
                Na <strong>documentação clínica</strong>, a IA transcreve e estrutura o registro da consulta
                para validação do profissional, devolvendo ao médico minutos de cada atendimento que hoje são
                gastos digitando. E na gestão do cuidado, modelos preditivos ajudam a identificar pacientes com
                maior risco de agravamento ou reinternação, apoiando protocolos de acompanhamento.
              </p>
              <p>
                Em todos esses usos, dois princípios são inegociáveis: <strong>supervisão humana</strong> — a
                responsabilidade diagnóstica é do médico — e <strong>rastreabilidade</strong> — a instituição
                precisa poder auditar o que o sistema sugeriu e por quê. É por isso que modelos especializados e
                auditáveis, rodando em infraestrutura controlada pela instituição, são o padrão correto para o
                ambiente clínico.
              </p>
            </article>

            <article className="ng-page-block" id="operacao">
              <h2>Operação e backoffice: leitos, faltas, faturamento e glosas</h2>
              <p>
                É a camada menos glamourosa e a de retorno mais rápido. <strong>Previsão de demanda</strong>{" "}
                (ocupação de leitos, volume de pronto atendimento, escala de equipes) permite planejar em vez de
                reagir. <strong>Automação de faturamento</strong> confere guias, checa conformidade com regras
                de convênios antes do envio e reduz a principal fonte de perda silenciosa de receita dos
                hospitais brasileiros: a glosa.
              </p>
              <p>
                Agentes de IA também assumem rotinas administrativas inteiras — conciliação, follow-up de
                pendências, atualização de cadastros — operando os sistemas que a instituição já usa. Para a
                gestão, o efeito combinado é caixa mais previsível e equipe administrativa focada em exceções,
                não em digitação.
              </p>
            </article>

            <BlogCtaCard
              title="Backoffice hospitalar com IA"
              text="Diagnóstico dos processos de faturamento, glosas e agendamento, e implantação de automação com metas mensuráveis — integrada aos sistemas que seu hospital já usa."
              wa={WA_SAUDE}
              waLabel="Falar sobre meu hospital"
            />

            <article className="ng-page-block" id="lgpd">
              <h2>LGPD, ética e soberania de dados na saúde</h2>
              <p>
                Dado de saúde é dado sensível — a LGPD é explícita. Isso impõe três exigências a qualquer
                projeto de IA no setor: base legal e finalidade claras, minimização e controle de acesso, e
                transparência sobre <strong>onde e por quem</strong> os dados são processados.
              </p>
              <p>
                É nesse último ponto que muitos projetos falham: ao usar plataformas genéricas de IA, dados de
                pacientes podem trafegar por infraestruturas fora do controle da instituição e fora da
                jurisdição brasileira. A alternativa é a <strong>arquitetura soberana</strong>: modelos
                especializados processando dados em infraestrutura sob controle da instituição, com trilha de
                auditoria completa. Além de reduzir risco regulatório, essa abordagem protege o ativo mais
                estratégico de um hospital — a confiança do paciente.
              </p>
            </article>

            <article className="ng-page-block" id="implantar">
              <h2>Como implantar IA na sua instituição de saúde</h2>
              <p>
                O roteiro que funciona é o mesmo que descrevemos no{" "}
                <Link href="/blog/inteligencia-artificial">guia completo de inteligência artificial</Link>,
                aplicado à realidade da saúde:
              </p>
              <p>
                <strong>1. Diagnóstico</strong> — mapear onde estão fila, falta, glosa e hora administrativa
                desperdiçada. <strong>2. Piloto com indicador</strong> — um escopo fechado (por exemplo, agente
                de voz para confirmação de consultas em uma unidade), com meta numérica e prazo de semanas.{" "}
                <strong>3. Governança desde o desenho</strong> — LGPD, supervisão clínica e residência dos dados
                definidos antes da primeira linha de integração. <strong>4. Escala por módulos</strong> —
                expandir do agendamento ao backoffice e ao apoio clínico sobre a mesma infraestrutura.
              </p>
              <p>
                É assim que a NowGo AI — parceira NVIDIA e reconhecida entre as Top 50 inovadoras globais —
                estrutura seus projetos de saúde: voz, automação e inteligência operacional como módulos de uma{" "}
                <a href="/">plataforma soberana para empresas, governos e cidades</a>, com o paciente e a equipe
                de saúde no centro.
              </p>
            </article>

            <article className="ng-page-block ng-blog-faq" id="faq">
              <h2>Perguntas frequentes sobre IA na saúde</h2>
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
          <h2 className="ng-h2 ng-final-h2">Quer levar IA para o seu hospital, clínica ou operadora?</h2>
          <p className="ng-section-sub ng-final-sub">
            Converse com quem implanta IA na saúde com soberania de dados, supervisão clínica e metas
            mensuráveis. Diagnóstico direto, sem compromisso.
          </p>
          <div className="ng-hero-actions">
            <a href={CAL_URL} target="_blank" rel="noreferrer" className="btn-primary">
              Agendar reunião
            </a>
            <a href={WA_SAUDE} target="_blank" rel="noreferrer" className="btn-secondary">
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
