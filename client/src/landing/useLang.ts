import { useEffect, useState, useCallback } from "react";
import type { Lang } from "./copy";

/**
 * Hook de idioma da landing nowgo ai.
 *
 * Persistência: chave `nowgoai.landing.lang` no localStorage.
 * Detecção inicial: usa o idioma do browser (navigator.language) como fallback,
 * preferindo PT-BR para acessos do Brasil e EN para o restante do mundo.
 *
 * O atributo `lang` do <html> também é atualizado para acessibilidade e SEO.
 */
const STORAGE_KEY = "nowgoai.landing.lang";

function detectInitial(): Lang {
  if (typeof window === "undefined") return "pt";
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === "pt" || stored === "en") return stored;
  const navLang = (navigator.language || "").toLowerCase();
  if (navLang.startsWith("pt")) return "pt";
  return "en";
}

export function useLang() {
  const [lang, setLangState] = useState<Lang>(() => detectInitial());

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("lang", lang === "pt" ? "pt-BR" : "en");
    }
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, lang);
    }
  }, [lang]);

  const setLang = useCallback((next: Lang) => setLangState(next), []);
  const toggleLang = useCallback(() => setLangState((cur) => (cur === "pt" ? "en" : "pt")), []);

  return { lang, setLang, toggleLang };
}
