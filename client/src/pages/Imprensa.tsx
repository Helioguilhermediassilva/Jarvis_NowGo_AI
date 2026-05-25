import { useEffect } from "react";
import LandingShell from "@/landing/LandingShell";
import { useLang } from "@/landing/useLang";
import { pagesCopy } from "@/landing/copyPages";

/**
 * Imprensa — página institucional de imprensa da nowgo ai.
 *
 * Lista artigos, entrevistas e cobertura de mídia sobre a empresa em PT/EN/ES.
 * Estrutura escalável: novos artigos são adicionados em copyPages.ts no array
 * `articles` de cada idioma, sem necessidade de alterar este componente.
 *
 * Mantém o mesmo padrão visual de Sobre/Carreiras/Manifesto/Privacidade
 * (LandingShell com hero, blocos de conteúdo e CTA final), garantindo
 * coerência de design system e idiomas.
 */
export default function Imprensa() {
  const { lang } = useLang();
  const t = pagesCopy[lang].imprensa;

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.title = `${t.hero.title} · nowgo ai`;
    }
  }, [t.hero.title]);

  return (
    <LandingShell>
      <section className="ng-section ng-section-hero">
        <div className="ng-container">
          <div className="ng-page-hero reveal">
            <span className="ng-eyebrow">{t.hero.eyebrow}</span>
            <h1 className="ng-page-title">{t.hero.title}</h1>
            <p className="ng-page-subtitle">{t.hero.subtitle}</p>
          </div>
        </div>
      </section>

      <section className="ng-section-content">
        <div className="ng-container">
          <div className="ng-page-content reveal">
            <article className="ng-page-block">
              {t.intro.body.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </article>

            <div className="ng-press-list">
              {t.articles.map((article, i) => {
                const isUpcoming = article.upcoming === true;
                const cardContent = (
                  <>
                    <div className="ng-press-meta">
                      <span className="ng-press-outlet">{article.outlet}</span>
                      <span className="ng-press-meta-sep">·</span>
                      <span>{article.date}</span>
                      <span className="ng-press-meta-sep">·</span>
                      <span className="ng-press-category">{article.category}</span>
                      {isUpcoming && article.upcomingLabel && (
                        <span className="ng-press-badge-soon">{article.upcomingLabel}</span>
                      )}
                    </div>
                    <h2 className="ng-press-title">{article.title}</h2>
                    <p className="ng-press-summary">{article.summary}</p>
                    {!isUpcoming && article.ctaLabel && (
                      <span className="ng-press-cta">{article.ctaLabel}</span>
                    )}
                  </>
                );

                if (isUpcoming || !article.url) {
                  return (
                    <div key={i} className="ng-press-card is-upcoming">
                      {cardContent}
                    </div>
                  );
                }

                return (
                  <a
                    key={i}
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ng-press-card"
                  >
                    {cardContent}
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section id="contact" className="ng-final-cta">
        <div className="ng-section-inner reveal">
          <h2 className="ng-h2 ng-final-h2">{t.contactCta.title}</h2>
          <p className="ng-section-sub ng-final-sub">{t.contactCta.subtitle}</p>
          <div className="ng-hero-actions">
            <a
              href="mailto:imprensa@nowgo.com.br?subject=Contato%20de%20imprensa"
              className="btn-primary"
            >
              {t.contactCta.primary}
            </a>
            <a
              href="https://wa.me/5561999708833?text=Ol%C3%A1%2C%20H%C3%A9lio!%20Vim%20pela%20p%C3%A1gina%20de%20Imprensa%20da%20nowgo%20ai%20e%20gostaria%20de%20uma%20pauta%2Fentrevista."
              target="_blank"
              rel="noreferrer"
              className="btn-secondary"
            >
              {t.contactCta.secondary}
            </a>
          </div>
        </div>
      </section>
    </LandingShell>
  );
}
