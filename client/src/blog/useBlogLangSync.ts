import { useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { useLang } from "@/landing/useLang";
import type { Lang } from "@/landing/copy";

/**
 * Sincroniza o idioma global do site com a URL dos artigos do blog.
 *
 * Convenção de URLs:
 *   PT (padrão): /blog/slug
 *   EN:          /en/blog/slug
 *   ES:          /es/blog/slug
 *
 * Regras:
 *  - Ao ABRIR a página, a URL manda: /en/... define o idioma global como "en".
 *  - Depois de montada, o TOGGLE manda: trocar o idioma no header navega
 *    para a URL correspondente do mesmo artigo (replace, sem sujar histórico).
 *
 * Retorna o idioma efetivo do conteúdo.
 */
export function urlFor(lang: Lang, basePath: string): string {
  return lang === "pt" ? basePath : `/${lang}${basePath}`;
}

export function useBlogLangSync(basePath: string): Lang {
  const { lang, setLang } = useLang();
  const [location, navigate] = useLocation();
  const mounted = useRef(false);

  const urlLang: Lang = location.startsWith("/en/")
    ? "en"
    : location.startsWith("/es/")
      ? "es"
      : "pt";

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      if (urlLang !== lang) setLang(urlLang);
      return;
    }
    const target = urlFor(lang, basePath);
    if (location !== target) navigate(target, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  return mounted.current ? lang : urlLang;
}
