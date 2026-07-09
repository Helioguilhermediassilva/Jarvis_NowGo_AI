import { useEffect } from "react";

/**
 * Seo — helper de SEO por rota para a SPA.
 * Atualiza title, meta description, canonical e injeta JSON-LD estruturado.
 * Ao desmontar, remove os scripts JSON-LD injetados e restaura os padrões
 * definidos em client/index.html.
 */
type Props = {
  title: string;
  description: string;
  /** URL canônica absoluta, ex.: https://www.nowgoai.com/blog/inteligencia-artificial */
  canonical: string;
  /** Objetos schema.org a injetar como <script type="application/ld+json"> */
  jsonLd?: Record<string, unknown>[];
};

const DEFAULT_TITLE = "NowGo AI — Sovereign Enterprise AI";
const DEFAULT_DESCRIPTION =
  "NowGo AI — Sovereign Enterprise AI for Smart Cities, Health, Education and Industry. NVIDIA Partner Expert. Top 50 Global.";
const DEFAULT_CANONICAL = "https://www.nowgoai.com/";
const JSONLD_ATTR = "data-seo-jsonld";

function setMeta(selector: string, attr: string, value: string) {
  const el = document.head.querySelector<HTMLMetaElement>(selector);
  if (el) el.setAttribute(attr, value);
}

export default function Seo({ title, description, canonical, jsonLd }: Props) {
  useEffect(() => {
    if (typeof document === "undefined") return;

    document.title = title;
    setMeta('meta[name="description"]', "content", description);
    setMeta('meta[property="og:title"]', "content", title);
    setMeta('meta[property="og:description"]', "content", description);
    setMeta('meta[property="og:url"]', "content", canonical);
    setMeta('meta[name="twitter:title"]', "content", title);
    setMeta('meta[name="twitter:description"]', "content", description);

    const link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (link) link.href = canonical;

    const scripts: HTMLScriptElement[] = [];
    (jsonLd ?? []).forEach((obj) => {
      const s = document.createElement("script");
      s.type = "application/ld+json";
      s.setAttribute(JSONLD_ATTR, "true");
      s.text = JSON.stringify(obj);
      document.head.appendChild(s);
      scripts.push(s);
    });

    return () => {
      document.title = DEFAULT_TITLE;
      setMeta('meta[name="description"]', "content", DEFAULT_DESCRIPTION);
      setMeta('meta[property="og:title"]', "content", DEFAULT_TITLE);
      setMeta('meta[property="og:description"]', "content", DEFAULT_DESCRIPTION);
      setMeta('meta[property="og:url"]', "content", DEFAULT_CANONICAL);
      setMeta('meta[name="twitter:title"]', "content", DEFAULT_TITLE);
      setMeta('meta[name="twitter:description"]', "content", DEFAULT_DESCRIPTION);
      if (link) link.href = DEFAULT_CANONICAL;
      scripts.forEach((s) => s.remove());
    };
  }, [title, description, canonical, jsonLd]);

  return null;
}
