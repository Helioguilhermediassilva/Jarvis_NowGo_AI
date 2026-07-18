import BlogArticleLayout from "@/blog/BlogArticleLayout";
import { copyIaEMachineLearning } from "@/blog/copyIaEMachineLearning";

/**
 * Artigo trilíngue "IA e Machine Learning" (cluster Conceitos Técnicos).
 * Conteúdo em blog/copyIaEMachineLearning.ts; estrutura, Seo/hreflang e
 * JSON-LD no BlogArticleLayout.
 */
export default function BlogIaEMachineLearning() {
  return (
    <BlogArticleLayout
      basePath="/blog/inteligencia-artificial-e-machine-learning"
      copy={copyIaEMachineLearning}
    />
  );
}
