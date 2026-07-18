import BlogArticleLayout from "@/blog/BlogArticleLayout";
import { copyIaNaSaude } from "@/blog/copyIaNaSaude";

/**
 * Artigo trilíngue "IA na Saúde" (cluster IA nas Profissões, prioridade 1).
 * Conteúdo em blog/copyIaNaSaude.ts; estrutura, Seo/hreflang e JSON-LD
 * no BlogArticleLayout.
 */
export default function BlogIaNaSaude() {
  return <BlogArticleLayout basePath="/blog/inteligencia-artificial-na-saude" copy={copyIaNaSaude} />;
}
