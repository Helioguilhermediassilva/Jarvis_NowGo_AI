import { Link } from "wouter";
import LandingShell from "@/landing/LandingShell";
import Seo from "@/components/Seo";
import "@/landing/styles/blog.css";

/**
 * Índice do blog NowGo AI. Lista os guias publicados do cluster de conteúdo.
 * Novos artigos do cluster (saúde, governo, agentes, soberania) entram aqui.
 */

const POSTS = [
  {
    slug: "/blog/inteligencia-artificial-para-empresas",
    title: "Inteligência Artificial para Empresas: aplicações na indústria, nas finanças e nos negócios",
    excerpt:
      "Previsão, indústria 4.0, backoffice financeiro, atendimento e decisão — as aplicações que passam na régua do retorno mensurável, e os quatro erros que matam projetos.",
    tag: "IA nas Profissões",
  },
  {
    slug: "/blog/inteligencia-artificial-na-educacao",
    title: "Inteligência Artificial na Educação: guia para professores, gestores e instituições",
    excerpt:
      "IA que amplia o professor, o uso certo para estudar, o dilema da redação e do plágio, e a operação acadêmica — com governança de dados de alunos por desenho.",
    tag: "IA para Estudo e Trabalho",
  },
  {
    slug: "/blog/inteligencia-artificial-generativa",
    title: "IA Generativa: o que é, como funciona e exemplos de uso profissional",
    excerpt:
      "O mecanismo dos LLMs, fine-tuning e RAG, os usos que geram valor em organizações e a arquitetura que mitiga alucinações.",
    tag: "Conceitos Técnicos",
  },
  {
    slug: "/blog/inteligencia-artificial-no-brasil",
    title: "Inteligência Artificial no Brasil: por que soberania é a decisão estratégica da década",
    excerpt:
      "A corrida geopolítica da IA, as dependências e os ativos do Brasil, e a arquitetura soberana que empresas e governos podem construir agora.",
    tag: "IA e Sociedade",
  },
  {
    slug: "/blog/inteligencia-artificial-e-machine-learning",
    title: "Inteligência Artificial e Machine Learning: qual a diferença — e o que isso muda na prática",
    excerpt:
      "IA, machine learning, deep learning e IA generativa como camadas de um mesmo campo, com exemplos reais e a regra prática para escolher a técnica certa.",
    tag: "Conceitos Técnicos",
  },
  {
    slug: "/blog/inteligencia-artificial-gasta-agua",
    title: "Por que a inteligência artificial gasta água (e energia)? A explicação completa",
    excerpt:
      "De onde vem o consumo de água e energia da IA, o que o influencia — e por que processar IA no Brasil pode ser mais soberano e mais sustentável.",
    tag: "IA e Sociedade",
  },
  {
    slug: "/blog/inteligencia-artificial-para-advogados",
    title:
      "Inteligência Artificial para Advogados: como a IA já atua no direito — e como adotar com segurança",
    excerpt:
      "Jurisprudência, contratos, prazos e atendimento: onde a IA gera resultado no jurídico, os limites das ferramentas gratuitas e como proteger o sigilo profissional.",
    tag: "IA nas Profissões",
  },
  {
    slug: "/blog/agentes-de-inteligencia-artificial",
    title: "Agentes de IA: o que são, como funcionam e o que muda para empresas e governos",
    excerpt:
      "O chatbot responde; o agente executa. Os três níveis de autonomia, a anatomia de um agente e a governança necessária para usá-los com segurança.",
    tag: "Conceitos Técnicos",
  },
  {
    slug: "/blog/inteligencia-artificial-na-saude",
    title:
      "Inteligência Artificial na Saúde: aplicações reais em hospitais, clínicas e operadoras",
    excerpt:
      "Agentes de voz para agendamento e triagem, apoio à radiologia, backoffice hospitalar, LGPD e soberania de dados — e o roteiro de implantação que funciona.",
    tag: "IA nas Profissões",
  },
  {
    slug: "/blog/inteligencia-artificial",
    title:
      "Inteligência Artificial: o que é, como funciona e como aplicá-la em empresas, governos e cidades",
    excerpt:
      "O guia completo para líderes: conceitos fundamentais, IA generativa e agentes, aplicações reais por setor e o caminho para adotar IA soberana.",
    tag: "Guia pilar",
  },
];

export default function Blog() {
  return (
    <LandingShell>
      <Seo
        title="Blog · NowGo AI — Inteligência artificial aplicada"
        description="Guias e análises da NowGo AI sobre inteligência artificial aplicada a empresas, governos e cidades: IA soberana, agentes autônomos, saúde, educação e indústria."
        canonical="https://www.nowgoai.com/blog"
      />

      <section className="ng-section ng-section-hero">
        <div className="ng-container">
          <div className="ng-page-hero reveal">
            <span className="ng-eyebrow">Blog NowGo AI</span>
            <h1 className="ng-page-title">Inteligência artificial aplicada</h1>
            <p className="ng-page-subtitle">
              Guias práticos sobre IA soberana, agentes autônomos e transformação de operações em empresas,
              governos e cidades.
            </p>
          </div>
        </div>
      </section>

      <section className="ng-section-content">
        <div className="ng-container">
          <div className="ng-page-content reveal">
            {POSTS.map((post) => (
              <article className="ng-page-block" key={post.slug}>
                <span className="ng-eyebrow">{post.tag}</span>
                <h2>
                  <Link href={post.slug}>{post.title}</Link>
                </h2>
                <p>{post.excerpt}</p>
                <p>
                  <Link href={post.slug}>Ler o guia completo →</Link>
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </LandingShell>
  );
}
