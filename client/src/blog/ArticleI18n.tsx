import { useMemo } from "react";
import LandingShell from "@/landing/LandingShell";
import Seo from "@/components/Seo";
import { CAL_URL, waLink } from "@/components/BlogCtaCard";
import { useBlogLangSync, urlFor } from "@/blog/useBlogLangSync";
import type { Lang } from "@/landing/copy";
import "@/landing/styles/blog.css";

/**
 * Renderizador genérico de artigo trilíngue do blog.
 * Cada artigo fornece um Record<Lang, ArticleCopy> e um basePath;
 * o componente cuida de Seo (title/description/canonical/hreflang),
 * JSON-LD (Article + FAQPage + Breadcrumb), TOC, seções, CTAs
 * advertoriais e CTA final — tudo no idioma sincronizado com o site.
 */

export type ArticleSection =
  | { kind: "text"; id: string; heading: string; paragraphs: string[] }
  | { kind: "cta"; title: string; text: string; waMsg: string; waLabel: string };

export type ArticleCopy = {
  seoTitle: string;
  seoDescription: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  tocLabel: string;
  toc: { href: string; label: string }[];
  sections: ArticleSection[];
  faqTitle: string;
  faq: { q: string; a: string }[];
  finalTitle: string;
  finalSub: string;
  ctaSchedule: string;
  ctaWhatsapp: string;
  ctaPlatform: string;
  ctaDiagnosis: string;
  finalWaMsg: string;
};

const ORIGIN = "https://www.nowgoai.com";
const INLANG: Record<Lang, string> = { pt: "pt-BR", en: "en", es: "es" };

export default function ArticleI18n({
  base,
  copy,
  datePublished,
}: {
  base: string;
  copy: Record<Lang, ArticleCopy>;
  datePublished: string;
}) {
  const lang = useBlogLangSync(base);
  const c = copy[lang];
  const canonical = `${ORIGIN}${urlFor(lang, base)}`;

  const alternates = useMemo(
    () => [
      { hrefLang: "pt-BR", href: `${ORIGIN}${base}` },
      { hrefLang: "en", href: `${ORIGIN}/en${base}` },
      { hrefLang: "es", href: `${ORIGIN}/es${base}` },
      { hrefLang: "x-default", href: `${ORIGIN}${base}` },
    ],
    [base],
  );

  const jsonLd = useMemo<Record<string, unknown>[]>(
    () => [
      {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: c.title,
        description: c.seoDescription,
        inLanguage: INLANG[lang],
        author: { "@type": "Organization", name: "NowGo AI", url: `${ORIGIN}/` },
        publisher: { "@type": "Organization", name: "NowGo AI", url: `${ORIGIN}/` },
        mainEntityOfPage: canonical,
        datePublished,
        dateModified: datePublished,
      },
      {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: c.faq.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
      {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Blog", item: `${ORIGIN}/blog` },
          { "@type": "ListItem", position: 2, name: c.title, item: canonical },
        ],
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [lang, base],
  );

  return (
    <LandingShell>
      <Seo
        title={c.seoTitle}
        description={c.seoDescription}
        canonical={canonical}
        jsonLd={jsonLd}
        alternates={alternates}
      />

      <section className="ng-section ng-section-hero">
        <div className="ng-container">
          <div className="ng-page-hero reveal">
            <span className="ng-eyebrow">{c.eyebrow}</span>
            <h1 className="ng-page-title">{c.title}</h1>
            <p className="ng-page-subtitle">{c.subtitle}</p>
          </div>
        </div>
      </section>

      <section className="ng-section-content">
        <div className="ng-container">
          <div className="ng-page-content reveal">
            <nav className="ng-blog-toc" aria-label={c.tocLabel}>
              <strong>{c.tocLabel}</strong>
              <ol>
                {c.toc.map((t) => (
                  <li key={t.href}>
                    <a href={t.href}>{t.label}</a>
                  </li>
                ))}
              </ol>
            </nav>

            {c.sections.map((s, i) =>
              s.kind === "text" ? (
                <article className="ng-page-block" id={s.id} key={s.id || i}>
                  {s.heading && <h2>{s.heading}</h2>}
                  {s.paragraphs.map((p, j) => (
                    <p key={j} dangerouslySetInnerHTML={{ __html: p }} />
                  ))}
                </article>
              ) : (
                <div className="ng-blog-cta" key={`cta-${i}`}>
                  <h3>{s.title}</h3>
                  <p>{s.text}</p>
                  <div className="ng-blog-cta-actions">
                    <a href={waLink(s.waMsg)} target="_blank" rel="noreferrer" className="btn-primary">
                      {s.waLabel}
                    </a>
                    <a href={CAL_URL} target="_blank" rel="noreferrer" className="btn-secondary">
                      {c.ctaDiagnosis}
                    </a>
                  </div>
                </div>
              ),
            )}

            <article className="ng-page-block ng-blog-faq" id="faq">
              <h2>{c.faqTitle}</h2>
              {c.faq.map((f) => (
                <details key={f.q}>
                  <summary>{f.q}</summary>
                  <p>{f.a}</p>
                </details>
              ))}
            </article>
          </div>
        </div>
      </section>

      <section id="contact" className="ng-final-cta">
        <div className="ng-section-inner reveal">
          <h2 className="ng-h2 ng-final-h2">{c.finalTitle}</h2>
          <p className="ng-section-sub ng-final-sub">{c.finalSub}</p>
          <div className="ng-hero-actions">
            <a href={CAL_URL} target="_blank" rel="noreferrer" className="btn-primary">
              {c.ctaSchedule}
            </a>
            <a href={waLink(c.finalWaMsg)} target="_blank" rel="noreferrer" className="btn-secondary">
              {c.ctaWhatsapp}
            </a>
            <a href="/#platform" className="btn-secondary">
              {c.ctaPlatform}
            </a>
          </div>
        </div>
      </section>
    </LandingShell>
  );
}
