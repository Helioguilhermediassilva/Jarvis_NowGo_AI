import BlogArticleLayout from "@/blog/BlogArticleLayout";
import { copyIaNoBrasil } from "@/blog/copyIaNoBrasil";

/**
 * Artigo trilíngue "IA no Brasil / soberania" (clusters IA e Sociedade +
 * lacuna estratégica de soberania). Conteúdo em blog/copyIaNoBrasil.ts;
 * estrutura, Seo/hreflang e JSON-LD no BlogArticleLayout.
 */
export default function BlogIaNoBrasil() {
  return <BlogArticleLayout basePath="/blog/inteligencia-artificial-no-brasil" copy={copyIaNoBrasil} />;
}
