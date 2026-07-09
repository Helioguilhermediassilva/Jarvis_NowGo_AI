import LandingShell from "@/landing/LandingShell";
import Seo from "@/components/Seo";
import BlogCtaCard, { CAL_URL, waLink as WA } from "@/components/BlogCtaCard";
import "@/landing/styles/blog.css";

/**
 * Página pilar do cluster de conteúdo "inteligência artificial".
 * Ângulo editorial: IA aplicada a empresas, governos e cidades.
 * Estratégia: topo de funil educa; cada seção setorial tem CTA advertorial
 * com deep link contextual para WhatsApp e agendamento (cal.com); fundo de
 * funil direciona para a landing (www.nowgoai.com).
 */

const WA_GERAL = WA(
  "Olá! Li o guia de Inteligência Artificial da NowGo AI e quero avaliar como aplicar IA na minha organização.",
);
const WA_SAUDE = WA(
  "Olá! Li o guia de IA da NowGo AI e tenho interesse em IA para saúde (hospitais, voz e backoffice).",
);
const WA_GOV = WA(
  "Olá! Li o guia de IA da NowGo AI e tenho interesse em IA soberana para governos e cidades inteligentes.",
);
const WA_EDU = WA(
  "Olá! Li o guia de IA da NowGo AI e tenho interesse em IA para instituições de ensino.",
);
const WA_IND = WA(
  "Olá! Li o guia de IA da NowGo AI e tenho interesse em IA para indústria e empresas.",
);

const CANONICAL = "https://www.nowgoai.com/blog/inteligencia-artificial";
const TITLE =
  "Inteligência Artificial: o que é, como funciona e como aplicá-la em empresas, governos e cidades · NowGo AI";
const DESCRIPTION =
  "Guia completo de inteligência artificial: o que é, como funciona, tipos, IA generativa e agentes, aplicações em saúde, governo, educação e indústria, e como adotar IA soberana na sua organização.";

const FAQ: { q: string; a: string }[] = [
  {
    q: "O que significa inteligência artificial?",
    a: "Inteligência artificial (IA) é o campo da computação dedicado a criar sistemas capazes de executar tarefas que normalmente exigiriam inteligência humana: compreender linguagem, reconhecer padrões, tomar decisões e aprender com dados. Na prática empresarial, IA significa software que aprende com as informações da sua operação para automatizar processos e apoiar decisões.",
  },
  {
    q: "Qual é a diferença entre inteligência artificial e machine learning?",
    a: "Machine learning (aprendizado de máquina) é uma subárea da inteligência artificial. IA é o conceito amplo de máquinas que simulam capacidades cognitivas; machine learning é a técnica em que os sistemas aprendem padrões a partir de dados, sem serem programados regra a regra. Todo machine learning é IA, mas nem toda IA usa machine learning.",
  },
  {
    q: "Qual inteligência artificial é melhor?",
    a: "Depende do objetivo. Para uso pessoal, assistentes como ChatGPT, Gemini e Claude resolvem a maioria das tarefas. Para empresas e governos, a pergunta certa é outra: qual arquitetura de IA atende aos requisitos de soberania de dados, integração com sistemas existentes e escala? Nesses casos, LLMs customizados e infraestrutura dedicada superam ferramentas genéricas.",
  },
  {
    q: "Quem inventou a inteligência artificial e quando ela surgiu?",
    a: "O termo 'inteligência artificial' foi cunhado por John McCarthy em 1956, na conferência de Dartmouth, considerada o marco de nascimento do campo. Nomes como Alan Turing, Marvin Minsky e Claude Shannon estabeleceram as bases teóricas nas décadas de 1940 e 1950.",
  },
  {
    q: "Por que a inteligência artificial gasta água e energia?",
    a: "Modelos de IA rodam em data centers cujos servidores geram calor intenso e precisam de refrigeração, que em muitos casos consome água. O treinamento e a operação de grandes modelos também demandam energia significativa. Por isso, eficiência energética e infraestrutura bem dimensionada são critérios centrais em projetos sérios de IA.",
  },
  {
    q: "A inteligência artificial vai substituir os humanos?",
    a: "A evidência até aqui aponta para transformação, não substituição em massa: a IA automatiza tarefas, e as pessoas passam a atuar na supervisão, na estratégia e no relacionamento. Organizações que tratam IA como ferramenta de ampliação da capacidade humana tendem a colher os melhores resultados.",
  },
];

const JSON_LD: Record<string, unknown>[] = [
  {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "Inteligência Artificial: o que é, como funciona e como aplicá-la em empresas, governos e cidades",
    description: DESCRIPTION,
    inLanguage: "pt-BR",
    author: { "@type": "Organization", name: "NowGo AI", url: "https://www.nowgoai.com/" },
    publisher: { "@type": "Organization", name: "NowGo AI", url: "https://www.nowgoai.com/" },
    mainEntityOfPage: CANONICAL,
    datePublished: "2026-07-09",
    dateModified: "2026-07-09",
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
      { "@type": "ListItem", position: 2, name: "Inteligência Artificial", item: CANONICAL },
    ],
  },
];

export default function BlogInteligenciaArtificial() {
  return (
    <LandingShell>
      <Seo title={TITLE} description={DESCRIPTION} canonical={CANONICAL} jsonLd={JSON_LD} />

      <section className="ng-section ng-section-hero">
        <div className="ng-container">
          <div className="ng-page-hero reveal">
            <span className="ng-eyebrow">Guia NowGo AI</span>
            <h1 className="ng-page-title">
              Inteligência Artificial: o que é, como funciona e como aplicá-la em empresas, governos e cidades
            </h1>
            <p className="ng-page-subtitle">
              Um guia direto ao ponto para líderes que precisam decidir sobre IA — dos conceitos fundamentais à
              adoção de infraestrutura soberana, com exemplos reais por setor.
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
                <li><a href="#o-que-e">O que é inteligência artificial</a></li>
                <li><a href="#como-funciona">Como funciona a inteligência artificial</a></li>
                <li><a href="#tipos">Tipos de IA: generativa, agentes e machine learning</a></li>
                <li><a href="#vantagens">Vantagens e desvantagens</a></li>
                <li><a href="#setores">IA aplicada: saúde, governo, educação e indústria</a></li>
                <li><a href="#soberania">IA soberana: por que o Brasil precisa de infraestrutura própria</a></li>
                <li><a href="#como-adotar">Como levar IA para a sua organização</a></li>
                <li><a href="#faq">Perguntas frequentes</a></li>
              </ol>
            </nav>

            <article className="ng-page-block" id="o-que-e">
              <h2>O que é inteligência artificial</h2>
              <p>
                Inteligência artificial (IA) é o campo da tecnologia dedicado a construir sistemas capazes de
                executar tarefas que, até pouco tempo, exigiam inteligência humana: interpretar textos e imagens,
                conversar em linguagem natural, reconhecer padrões em grandes volumes de dados e tomar decisões
                com base neles.
              </p>
              <p>
                Na prática, quando falamos de IA hoje, falamos principalmente de modelos treinados com dados —
                dos assistentes de conversa aos sistemas que preveem demanda hospitalar, otimizam o trânsito de
                uma cidade ou automatizam o backoffice de uma empresa. A diferença entre um experimento e um
                resultado real está menos no modelo e mais na forma como ele é integrado à operação.
              </p>
            </article>

            <article className="ng-page-block" id="como-funciona">
              <h2>Como funciona a inteligência artificial</h2>
              <p>
                O ciclo básico de qualquer sistema de IA tem três etapas: <strong>dados</strong> (o sistema é
                alimentado com exemplos — textos, imagens, registros operacionais), <strong>treinamento</strong>{" "}
                (algoritmos identificam padrões estatísticos nesses exemplos) e <strong>inferência</strong> (o
                modelo treinado responde a situações novas: classifica, prevê, gera conteúdo ou aciona um
                processo).
              </p>
              <p>
                Nos modelos de linguagem (LLMs) que popularizaram a IA generativa, esse treinamento acontece
                sobre volumes gigantescos de texto, e o resultado é um sistema capaz de compreender e produzir
                linguagem natural. Para uso corporativo e governamental, esses modelos são especializados com os
                dados e as regras da própria organização — é aí que entram os LLMs customizados e a
                infraestrutura dedicada.
              </p>
            </article>

            <article className="ng-page-block" id="tipos">
              <h2>Tipos de IA: generativa, agentes e machine learning</h2>
              <p>
                <strong>Machine learning</strong> é a base: sistemas que aprendem padrões a partir de dados para
                prever e classificar — detecção de fraude, previsão de demanda, manutenção preditiva.
              </p>
              <p>
                <strong>IA generativa</strong> é a geração mais recente: modelos que criam conteúdo novo — texto,
                imagem, voz, código — a partir de instruções em linguagem natural. É a tecnologia por trás do
                ChatGPT, do Gemini e dos copilotos corporativos.
              </p>
              <p>
                <strong>Agentes autônomos</strong> são o passo seguinte: sistemas de IA que não apenas respondem,
                mas executam — consultam bases, acionam sistemas, conduzem atendimentos por voz e completam
                fluxos de trabalho inteiros com supervisão humana. É nessa camada que a IA deixa de ser uma
                ferramenta de produtividade individual e passa a operar processos da organização.
              </p>
            </article>

            <article className="ng-page-block" id="vantagens">
              <h2>Vantagens e desvantagens da inteligência artificial</h2>
              <p>
                <strong>Vantagens:</strong> escala (atendimento e análise 24/7), velocidade de decisão, redução
                de custo operacional em tarefas repetitivas, personalização em massa e capacidade de encontrar
                padrões invisíveis ao olho humano.
              </p>
              <p>
                <strong>Desvantagens e riscos:</strong> dependência da qualidade dos dados, possibilidade de
                respostas incorretas quando o sistema opera sem guarda-corpos, custo energético dos grandes
                modelos e — o risco mais subestimado por organizações públicas e privadas — a{" "}
                <strong>perda de soberania sobre dados</strong> quando informações sensíveis trafegam por
                plataformas de terceiros, fora do controle e da jurisdição da organização.
              </p>
              <p>
                A boa notícia: todos esses riscos são endereçáveis com arquitetura adequada — modelos
                especializados, infraestrutura dimensionada e governança de dados desde o desenho do projeto.
              </p>
            </article>

            <article className="ng-page-block" id="setores">
              <h2>IA aplicada: exemplos reais por setor</h2>
              <p>
                <strong>Saúde.</strong> Agentes de voz que agendam consultas e fazem triagem, IA que apoia laudos
                e radiologia, e automação de backoffice hospitalar. O impacto é direto: menos fila, menos
                glosa, mais tempo de equipe clínica dedicado ao paciente.
              </p>
            </article>

            <BlogCtaCard
              title="IA para hospitais e operadoras de saúde"
              text="A NowGo AI implanta agentes de voz e automação hospitalar como módulos de uma infraestrutura integrada — não como softwares isolados."
              wa={WA_SAUDE}
              waLabel="Falar sobre IA na saúde"
            />

            <article className="ng-page-block">
              <p>
                <strong>Governos e cidades inteligentes.</strong> Um Smart Cities OS conecta dados urbanos —
                mobilidade, segurança, serviços públicos — em uma camada única de orquestração, permitindo que
                gestores enxerguem a cidade em tempo real e que o cidadão seja atendido por canais inteligentes.
                A condição inegociável nesse setor é a soberania: dados públicos precisam permanecer sob
                jurisdição e controle públicos.
              </p>
            </article>

            <BlogCtaCard
              title="IA soberana para governos e cidades"
              text="Infraestrutura operacional soberana, modular e interoperável para gestão pública — do atendimento ao cidadão à orquestração de dados urbanos."
              wa={WA_GOV}
              waLabel="Falar sobre governo e cidades"
            />

            <article className="ng-page-block">
              <p>
                <strong>Educação.</strong> Para redes de ensino e universidades, a IA atua em duas frentes:
                eficiência institucional (matrículas, atendimento, evasão) e apoio pedagógico (tutores
                inteligentes, produção de material, avaliação assistida por professores). O desafio não é a
                ferramenta — é a implantação com governança, para que a IA amplie o professor em vez de
                substituí-lo.
              </p>
              <p>
                <strong>Indústria e empresas.</strong> Da indústria 4.0 ao setor financeiro, os casos mais
                maduros combinam previsão (demanda, manutenção, risco) com automação de processos e agentes que
                operam sistemas legados. A régua de sucesso é uma só: redução mensurável de custo ou aumento
                mensurável de receita.
              </p>
              <p>
                <strong>Direito e serviços profissionais.</strong> Análise de contratos, pesquisa de
                jurisprudência e automação de rotinas processuais já são realidade em escritórios e departamentos
                jurídicos — com o cuidado obrigatório de manter revisão humana e confidencialidade dos dados.
              </p>
            </article>

            <BlogCtaCard
              title="IA para indústria, educação e empresas"
              text="Diagnóstico do processo, desenho da arquitetura e implantação com metas mensuráveis — a IA integrada à sua operação, não mais um software na prateleira."
              wa={WA_IND}
              waLabel="Falar sobre minha operação"
            />

            <article className="ng-page-block" id="soberania">
              <h2>IA soberana: por que o Brasil precisa de infraestrutura própria</h2>
              <p>
                A corrida global de IA deixou de ser apenas tecnológica — é geopolítica. Estados Unidos e China
                tratam modelos e data centers como ativos estratégicos. Para o Brasil, depender exclusivamente de
                plataformas estrangeiras significa exportar dados sensíveis de cidadãos, hospitais e governos e
                importar decisões tomadas fora da nossa jurisdição.
              </p>
              <p>
                IA soberana não significa isolamento: significa que os dados críticos são processados em
                infraestrutura sob controle nacional, que os modelos podem ser auditados e especializados para a
                realidade local, e que a organização — pública ou privada — mantém autonomia estratégica. É o
                princípio que orienta a arquitetura da NowGo AI: modular, soberana, interoperável e preparada
                para os requisitos de empresas e governos.
              </p>
            </article>

            <article className="ng-page-block" id="como-adotar">
              <h2>Como levar inteligência artificial para a sua organização</h2>
              <p>
                A maioria dos projetos de IA que fracassam morre pelos mesmos motivos: começar pela ferramenta em
                vez do problema, ignorar a qualidade dos dados e tratar IA como projeto de TI em vez de projeto
                de operação. O caminho que funciona tem quatro passos:
              </p>
              <p>
                <strong>1. Diagnóstico do processo</strong> — identificar onde há custo repetitivo, fila ou
                decisão baseada em dados que hoje ninguém consegue analisar. <strong>2. Piloto com meta
                mensurável</strong> — um escopo pequeno, com indicador claro (tempo, custo, receita), em
                semanas e não anos. <strong>3. Arquitetura soberana</strong> — definir desde o início onde os
                dados residem, quem audita o modelo e como ele se integra aos sistemas existentes.{" "}
                <strong>4. Escala por módulos</strong> — expandir a partir do que provou valor, sobre a mesma
                infraestrutura, em vez de acumular ferramentas desconexas.
              </p>
              <p>
                É exatamente esse o modelo de trabalho da NowGo AI, parceira NVIDIA e reconhecida entre as Top 50
                inovadoras globais: LLMs customizados, agentes autônomos e infraestrutura de IA sob medida,
                implantados como um ecossistema integrado para{" "}
                <a href="/">empresas, governos e cidades</a>.
              </p>
            </article>

            <article className="ng-page-block ng-blog-faq" id="faq">
              <h2>Perguntas frequentes sobre inteligência artificial</h2>
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
          <h2 className="ng-h2 ng-final-h2">Pronto para aplicar IA na sua organização?</h2>
          <p className="ng-section-sub ng-final-sub">
            Converse com quem constrói infraestrutura soberana de IA para empresas, governos e cidades.
            Diagnóstico direto, sem compromisso.
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
