import BlogArticleLayout from "@/blog/BlogArticleLayout";
import { copyAgentesDeIa } from "@/blog/copyAgentesDeIa";

/**
 * Artigo trilíngue "Agentes de IA" (cluster Conceitos Técnicos).
 * Conteúdo em blog/copyAgentesDeIa.ts; estrutura, Seo/hreflang e
 * JSON-LD no BlogArticleLayout.
 */
export default function BlogAgentesDeIa() {
  return <BlogArticleLayout basePath="/blog/agentes-de-inteligencia-artificial" copy={copyAgentesDeIa} />;
}
