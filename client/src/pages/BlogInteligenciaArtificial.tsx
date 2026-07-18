import ArticleI18n from "@/blog/ArticleI18n";
import { pilarCopy } from "@/blog/pilarCopy";

/** Página pilar trilíngue do cluster. Conteúdo em pilarCopy.ts. */
export default function BlogInteligenciaArtificial() {
  return (
    <ArticleI18n
      base="/blog/inteligencia-artificial"
      copy={pilarCopy}
      datePublished="2026-07-09"
    />
  );
}
