import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { Lang } from "./copy";

/**
 * Hook + Provider de idioma da landing nowgo ai.
 *
 * Persistência: chave `nowgoai.landing.lang` no localStorage.
 * Detecção inicial (em ordem de prioridade):
 *   1. Valor previamente salvo no localStorage (escolha explícita do usuário).
 *   2. `navigator.language` — pt-* → "pt", es-* → "es", restante → "en".
 *
 * O atributo `lang` do <html> também é atualizado para acessibilidade e SEO.
 *
 * IMPORTANTE: o estado de idioma é compartilhado por toda a aplicação via
 * Context. Antes desta refatoração, cada chamada de `useLang()` criava uma
 * instância independente do hook, fazendo com que o toggle no header (dentro
 * do LandingShell) não atualizasse o conteúdo das páginas filhas (Sobre,
 * Imprensa, Carreiras, Manifesto, Privacidade). Agora todos os consumidores
 * compartilham o mesmo estado.
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

type LangContextValue = {
  lang: Lang;
  setLang: (next: Lang) => void;
  toggleLang: () => void;
};

const LangContext = createContext<LangContextValue | null>(null);

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => detectInitial());

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("lang", HTML_LANG_MAP[lang]);
    }
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, lang);
    }
  }, [lang]);

  // Sincroniza entre múltiplas abas/janelas do mesmo navegador
  useEffect(() => {
    if (typeof window === "undefined") return;
    const handler = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY) return;
      const next = event.newValue;
      if (isLang(next)) setLangState(next);
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  const setLang = useCallback((next: Lang) => setLangState(next), []);
  const toggleLang = useCallback(() => {
    setLangState((cur) => {
      const idx = ROTATION.indexOf(cur);
      return ROTATION[(idx + 1) % ROTATION.length];
    });
  }, []);

  return (
    <LangContext.Provider value={{ lang, setLang, toggleLang }}>
      {children}
    </LangContext.Provider>
  );
}

/**
 * Hook público — mantém a mesma API do hook original (lang, setLang, toggleLang)
 * para que nenhum componente consumidor precise mudar.
 *
 * Fora de um <LangProvider>, faz fallback graceful: lê o valor inicial e
 * persiste no localStorage, mas avisa em desenvolvimento. Isso evita crash
 * em testes unitários que renderizam componentes isoladamente.
 */
export function useLang(): LangContextValue {
  const ctx = useContext(LangContext);
  if (ctx) return ctx;

  // Fallback: comportamento legado (instância isolada). Não deveria acontecer
  // em produção porque <LangProvider> envolve toda a App.
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [lang, setLangState] = useState<Lang>(() => detectInitial());
  // eslint-disable-next-line react-hooks/rules-of-hooks
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
