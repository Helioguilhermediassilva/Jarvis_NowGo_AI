import LandingShell from "@/landing/LandingShell";
import Seo from "@/components/Seo";
import BlogCtaCard, { CAL_URL, waLink } from "@/components/BlogCtaCard";
import { Link } from "wouter";
import "@/landing/styles/blog.css";

/**
 * Artigo do cluster "IA para Estudo e Trabalho" — ângulo institucional
 * (vertical Educação do site).
 * Palavras-chave alvo: inteligência artificial para professores (720),
 * IA para estudar (590), inteligência artificial na educação, IA e redação.
 */

const WA_EDU = waLink(
  "Olá! Li o artigo sobre IA na educação da NowGo AI e quero conversar sobre aplicação na minha instituição de ensino.",
);

const CANONICAL = "https://www.nowgoai.com/blog/inteligencia-artificial-na-educacao";
const TITLE =
  "Inteligência Artificial na Educação: guia para professores, gestores e instituições · NowGo AI";
const DESCRIPTION =
  "Como usar IA na educação com responsabilidade: ferramentas para professores, IA para estudar de verdade (sem terceirizar o aprendizado), o dilema da redação e do plágio, e o roteiro de adoção para escolas e universidades.";

const FAQ: { q: string; a: string }[] = [
  {
    q: "Como professores podem usar inteligência artificial?",
    a: "Os usos de maior retorno são: preparação de aulas e materiais (planos, exercícios, adaptações para diferentes níveis), correção assistida com rubricas definidas pelo professor, feedback individualizado em escala e redução de carga administrativa (comunicados, relatórios, registros). O princípio é constante: a IA prepara e organiza; o professor decide e ensina.",
  },
  {
    q: "Usar IA para estudar é considerado plágio?",
    a: "Depende do uso. Pedir explicações, gerar questões de prática, resumir para revisão e receber feedback sobre um texto próprio é estudo legítimo — e eficaz. Entregar como seu um texto produzido pela IA é plágio na maioria das políticas acadêmicas. A linha prática: a IA pode ajudar você a aprender e a melhorar o que você produziu; não pode produzir no seu lugar o que será avaliado como seu.",
  },
  {
    q: "A IA vai substituir professores?",
    a: "Não. A evidência aponta o contrário: quanto mais conteúdo automatizado existe, mais valioso fica o que só o professor faz — mediar, motivar, avaliar contexto, formar pensamento crítico e caráter. A IA bem usada devolve ao professor o tempo hoje consumido por burocracia e correção mecânica.",
  },
  {
    q: "Como uma escola ou universidade deve começar com IA?",
    a: "Com política antes de ferramenta: definir usos permitidos e vedados para alunos e docentes, formar os professores primeiro, e começar por um piloto administrativo ou pedagógico com indicador claro (horas docentes liberadas, tempo de resposta ao aluno, evasão). Dados de alunos são dados pessoais — muitos de menores de idade —, o que torna a governança e a residência dos dados requisito de partida, não detalhe.",
  },
];

const JSON_LD: Record<string, unknown>[] = [
  {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "Inteligência Artificial na Educação: guia para professores, gestores e instituições",
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
      { "@type": "ListItem", position: 3, name: "IA na Educação", item: CANONICAL },
    ],
  },
];

export default function BlogIaNaEducacao() {
  return (
    <LandingShell>
      <Seo title={TITLE} description={DESCRIPTION} canonical={CANONICAL} jsonLd={JSON_LD} />

      <section className="ng-section ng-section-hero">
        <div className="ng-container">
          <div className="ng-page-hero reveal">
            <span className="ng-eyebrow">Guia NowGo AI · Educação</span>
            <h1 className="ng-page-title">
              Inteligência Artificial na Educação: guia para professores, gestores e instituições
            </h1>
            <p className="ng-page-subtitle">
              Da preparação de aulas à gestão da evasão: onde a IA amplia o professor, como orientar alunos a
              estudar com IA sem terceirizar o aprendizado, e o roteiro de adoção para escolas e universidades.
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
                <li><a href="#principio">O princípio: ampliar o professor, não substituí-lo</a></li>
                <li><a href="#professores">IA para professores: os usos que funcionam</a></li>
                <li><a href="#alunos">IA para estudar: o uso certo e o atalho errado</a></li>
                <li><a href="#redacao">Redação, plágio e avaliação na era da IA</a></li>
                <li><a href="#instituicao">IA para a gestão: matrícula, atendimento e evasão</a></li>
                <li><a href="#adocao">Roteiro de adoção para escolas e universidades</a></li>
                <li><a href="#faq">Perguntas frequentes</a></li>
              </ol>
            </nav>

            <article className="ng-page-block" id="principio">
              <h2>O princípio: ampliar o professor, não substituí-lo</h2>
              <p>
                Nenhum setor recebeu a <Link href="/blog/inteligencia-artificial">inteligência artificial</Link>{" "}
                com tanta ambivalência quanto a educação — e com razão: o risco de terceirizar justamente o que
                a escola existe para desenvolver (pensar, escrever, argumentar) é real. Mas a resposta madura
                não é proibir nem liberar tudo: é desenhar o uso.
              </p>
              <p>
                O critério que organiza tudo neste guia é um só: <strong>a IA deve absorver a carga mecânica e
                devolver tempo humano ao ensino</strong>. Quando a tecnologia prepara, corrige o repetitivo e
                administra, sobra professor para o que nenhum modelo faz: mediar, motivar e formar.
              </p>
            </article>

            <article className="ng-page-block" id="professores">
              <h2>IA para professores: os usos que funcionam</h2>
              <p>
                <strong>Preparação.</strong> Planos de aula alinhados à BNCC, listas de exercícios em vários
                níveis de dificuldade, adaptações para alunos com necessidades específicas, materiais de apoio —
                o rascunho que consumia o fim de semana sai em minutos, e o professor edita com seu método.
              </p>
              <p>
                <strong>Correção e feedback.</strong> Com rubricas definidas pelo docente, a IA faz a primeira
                passada de correção e gera feedback individual por aluno — transformando a devolutiva, que
                raramente cabe no tempo real do professor, em rotina viável. A nota final e o julgamento
                pedagógico permanecem humanos.
              </p>
              <p>
                <strong>Carga administrativa.</strong> Comunicados a famílias, relatórios, registros de
                acompanhamento: tarefa de linguagem repetitiva é exatamente o que a IA faz melhor — e o que mais
                rouba tempo de quem ensina.
              </p>
            </article>

            <article className="ng-page-block" id="alunos">
              <h2>IA para estudar: o uso certo e o atalho errado</h2>
              <p>
                A diferença entre estudar com IA e fingir que estudou é a direção do esforço.{" "}
                <strong>Usos que aprofundam o aprendizado:</strong> pedir explicações com analogias diferentes
                até entender, gerar questões de prática e simulados, pedir que a IA aponte erros no seu
                raciocínio, usar o modelo como parceiro de debate que contesta seus argumentos.
              </p>
              <p>
                <strong>O atalho errado</strong> é pedir o produto final pronto: o texto entregue, a lista
                resolvida. Além do problema de integridade, o efeito é objetivo — quem não pratica não aprende,
                e a avaliação seguinte (a prova presencial, a arguição, a vida) cobra a diferença. Instituições
                inteligentes têm ensinado essa distinção explicitamente, em vez de fingir que os alunos não usam
                IA.
              </p>
            </article>

            <article className="ng-page-block" id="redacao">
              <h2>Redação, plágio e avaliação na era da IA</h2>
              <p>
                A redação é o campo de batalha simbólico. A resposta que tem funcionado combina três movimentos:{" "}
                <strong>transparência</strong> (política clara do que é permitido em cada atividade, em vez de
                proibição genérica), <strong>redesenho da avaliação</strong> (mais produção em sala, arguição
                oral e etapas de processo — rascunho, revisão, versão final — onde o percurso do aluno fica
                visível) e <strong>uso pedagógico da própria IA</strong>: o aluno escreve, a IA critica com a
                rubrica do professor, o aluno reescreve. Detectores automáticos de texto de IA, sozinhos, são
                frágeis e geram falsos positivos — política e desenho de avaliação funcionam melhor que
                policiamento tecnológico.
              </p>
            </article>

            <article className="ng-page-block" id="instituicao">
              <h2>IA para a gestão: matrícula, atendimento e evasão</h2>
              <p>
                Fora da sala de aula, a instituição de ensino é uma operação — e as alavancas são as mesmas de
                qualquer operação. <strong>Atendimento</strong>: <Link href="/blog/agentes-de-inteligencia-artificial">agentes</Link>{" "}
                de chat e voz respondem dúvidas de matrícula, documentos e financeiro em qualquer horário,
                liberando a secretaria. <strong>Evasão</strong>: modelos preditivos cruzam frequência, notas e
                engajamento para sinalizar alunos em risco a tempo de a coordenação agir — impacto direto em
                receita e em missão. <strong>Backoffice</strong>: cobrança, conciliação e comunicação em massa
                automatizadas.
              </p>
              <p>
                E um requisito acima de todos: dados de alunos são dados pessoais, em grande parte de menores de
                idade. Governança, consentimento e residência dos dados — de preferência em infraestrutura sob
                controle da instituição, como discutimos no artigo sobre{" "}
                <Link href="/blog/inteligencia-artificial-no-brasil">IA soberana</Link> — são o ponto de partida
                de qualquer projeto sério.
              </p>
            </article>

            <BlogCtaCard
              title="IA para a sua instituição de ensino"
              text="A NowGo AI implanta atendimento inteligente, prevenção de evasão e automação administrativa para escolas e universidades — com governança de dados de alunos por desenho."
              wa={WA_EDU}
              waLabel="Falar sobre minha instituição"
            />

            <article className="ng-page-block" id="adocao">
              <h2>Roteiro de adoção para escolas e universidades</h2>
              <p>
                <strong>1. Política antes de ferramenta</strong> — usos permitidos e vedados, por público
                (alunos, docentes, administrativo). <strong>2. Professores primeiro</strong> — formação prática
                antes de qualquer exigência; professor confiante orienta, professor perdido proíbe.{" "}
                <strong>3. Piloto com indicador</strong> — horas docentes liberadas, tempo de resposta da
                secretaria, retenção de alunos. <strong>4. Escala por módulos</strong> — do administrativo ao
                pedagógico, sobre a mesma infraestrutura e a mesma governança.
              </p>
              <p>
                É o modelo que a NowGo AI — parceira NVIDIA e Top 50 inovadoras globais — aplica na vertical de
                educação da sua <a href="/">plataforma soberana para empresas, governos e cidades</a>: a
                tecnologia a serviço de quem ensina, com o dado do aluno protegido como deve ser.
              </p>
            </article>

            <article className="ng-page-block ng-blog-faq" id="faq">
              <h2>Perguntas frequentes sobre IA na educação</h2>
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
          <h2 className="ng-h2 ng-final-h2">Quer levar IA para a sua escola ou universidade?</h2>
          <p className="ng-section-sub ng-final-sub">
            Diagnóstico da operação acadêmica e administrativa, e implantação com política, formação docente e
            governança de dados — direto ao ponto, sem compromisso.
          </p>
          <div className="ng-hero-actions">
            <a href={CAL_URL} target="_blank" rel="noreferrer" className="btn-primary">
              Agendar reunião
            </a>
            <a href={WA_EDU} target="_blank" rel="noreferrer" className="btn-secondary">
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
