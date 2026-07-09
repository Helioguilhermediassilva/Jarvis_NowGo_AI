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
