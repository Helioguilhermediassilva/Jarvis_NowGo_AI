import { useMemo } from "react";
import LandingShell from "@/landing/LandingShell";
import Seo from "@/components/Seo";
import { CAL_URL, waLink } from "@/components/BlogCtaCard";
import { useBlogLangSync, urlFor } from "@/blog/useBlogLangSync";
import { pilarCopy } from "@/blog/pilarCopy";
import "@/landing/styles/blog.css";

/**
 * Página pilar do cluster "inteligência artificial" — trilíngue (PT/EN/ES).
 *
 * URLs: /blog/inteligencia-artificial (PT, canônica x-default),
 *       /en/blog/inteligencia-artificial, /es/blog/inteligencia-artificial.
 * O idioma segue o toggle global do site (useBlogLangSync): trocar o idioma
 * no header navega para a URL correspondente; abrir uma URL /en ou /es
 * define o idioma global. Conteúdo em client/src/blog/pilarCopy.ts.
 */

const BASE = "/blog/inteligencia-artificial";
const ORIGIN = "https://www.nowgoai.com";
const INLANG = { pt: "pt-BR", en: "en", es: "es" } as const;

const ALTERNATES = [
  { hrefLang: "pt-BR", href: `${ORIGIN}${BASE}` },
  { hrefLang: "en", href: `${ORIGIN}/en${BASE}` },
  { hrefLang: "es", href: `${ORIGIN}/es${BASE}` },
  { hrefLang: "x-default", href: `${ORIGIN}${BASE}` },
];

export default function BlogInteligenciaArtificial() {
  const lang = useBlogLangSync(BASE);
  const c = pilarCopy[lang];
  const canonical = `${ORIGIN}${urlFor(lang, BASE)}`;

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
        datePublished: "2026-07-09",
        dateModified: "2026-07-09",
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
    [lang],
  );

  return (
    <LandingShell>
      <Seo
        title={c.seoTitle}
        description={c.seoDescription}
        canonical={canonical}
        jsonLd={jsonLd}
        alternates={ALTERNATES}
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
