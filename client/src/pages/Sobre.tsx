import { useEffect } from "react";
import LandingShell from "@/landing/LandingShell";
import { useLang } from "@/landing/useLang";
import { pagesCopy } from "@/landing/copyPages";

export default function Sobre() {
  const { lang } = useLang();
  const t = pagesCopy[lang].sobre;

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.title = `${t.hero.title} · NowGo AI`;
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
              <h2>{t.bio.title}</h2>
              {t.bio.body.map((p, i) => (
                <p key={i} dangerouslySetInnerHTML={{ __html: p }} />
              ))}
            </article>

            <article className="ng-page-block">
              <h2>{t.founder.title}</h2>
              {t.founder.linkedin && (
                <a
                  href={t.founder.linkedin.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ng-founder-linkedin"
                  aria-label={t.founder.linkedin.label}
                >
                  <svg
                    className="ng-founder-linkedin-icon"
                    viewBox="0 0 24 24"
                    width="18"
                    height="18"
                    aria-hidden="true"
                  >
                    <path
                      fill="currentColor"
                      d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.13 1.45-2.13 2.94v5.67H9.37V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.38-1.85 3.61 0 4.28 2.38 4.28 5.47v6.27zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0z"
                    />
                  </svg>
                  <span>{t.founder.linkedin.label}</span>
                </a>
              )}
              {t.founder.body.map((p, i) => (
                <p key={i} dangerouslySetInnerHTML={{ __html: p }} />
              ))}
            </article>

            <article className="ng-page-block">
              <h2>{t.philosophy.title}</h2>
              {t.philosophy.body.map((p, i) => (
                <p key={i} dangerouslySetInnerHTML={{ __html: p }} />
              ))}
            </article>
          </div>
        </div>
      </section>

      <section id="contact" className="ng-final-cta">
        <div className="ng-section-inner reveal">
          <h2 className="ng-h2 ng-final-h2">{t.contactCta.title}</h2>
          <p className="ng-section-sub ng-final-sub">{t.contactCta.subtitle}</p>
          <div className="ng-hero-actions">
            <a
              href="https://cal.com/helio-guilherme-jnrivp"
              target="_blank"
              rel="noreferrer"
              className="btn-primary"
            >
              {t.contactCta.primary}
            </a>
            <a
              href="https://wa.me/5561999708833?text=Ol%C3%A1%2C%20H%C3%A9lio!%20Vim%20pelo%20site%20da%20NowGo%20AI.%20Tenho%20interesse%20em%20%5BSmart%20City%20%2F%20Enterprise%20%2F%20Outro%5D%20e%20gostaria%20de%20conversar."
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
