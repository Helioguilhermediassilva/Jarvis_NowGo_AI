import { useEffect, useState, useCallback } from "react";
import type { Lang } from "./copy";

/**
 * Hook de idioma da landing nowgo ai.
 *
 * Persistência: chave `nowgoai.landing.lang` no localStorage.
 * Detecção inicial (em ordem de prioridade):
 *   1. Valor previamente salvo no localStorage (escolha explícita do usuário).
 *   2. `navigator.language` — pt-* → "pt", es-* → "es", restante → "en".
 *
 * O atributo `lang` do <html> também é atualizado para acessibilidade e SEO.
 */
const STORAGE_KEY = "nowgoai.landing.lang";

function isLang(value: string | null): value is Lang {
  return value === "pt" || value === "en" || value === "es";
}

function detectInitial(): Lang {
  if (typeof window === "undefined") return "pt";
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (isLang(stored)) return stored;
  const navLang = (navigator.language || "").toLowerCase();
  if (navLang.startsWith("pt")) return "pt";
  if (navLang.startsWith("es")) return "es";
  return "en";
}

const HTML_LANG_MAP: Record<Lang, string> = {
  pt: "pt-BR",
  en: "en",
  es: "es",
};

const ROTATION: readonly Lang[] = ["pt", "en", "es"];

export function useLang() {
  const [lang, setLangState] = useState<Lang>(() => detectInitial());

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("lang", HTML_LANG_MAP[lang]);
    }
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, lang);
    }
  }, [lang]);

  const setLang = useCallback((next: Lang) => setLangState(next), []);
  const toggleLang = useCallback(() => {
    setLangState((cur) => {
      const idx = ROTATION.indexOf(cur);
      return ROTATION[(idx + 1) % ROTATION.length];
    });
  }, []);

  return { lang, setLang, toggleLang };
}
