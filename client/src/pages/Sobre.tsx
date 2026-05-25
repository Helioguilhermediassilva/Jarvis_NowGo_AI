import { useEffect } from "react";
import LandingShell from "@/landing/LandingShell";
import { useLang } from "@/landing/useLang";
import { pagesCopy } from "@/landing/copyPages";

export default function Sobre() {
  const { lang } = useLang();
  const t = pagesCopy[lang].sobre;

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

      <section className="ng-section">
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

      <section className="ng-section ng-final-cta">
        <div className="ng-container">
          <div className="ng-final-cta-inner reveal">
            <h2 className="ng-final-cta-title">{t.contactCta.title}</h2>
            <p className="ng-final-cta-subtitle">{t.contactCta.subtitle}</p>
            <div className="ng-hero-actions">
              <a href="mailto:helio@nowgo.com.br" className="btn-primary">
                {t.contactCta.primary}
              </a>
              <a
                href="https://wa.me/5561998887766"
                target="_blank"
                rel="noreferrer"
                className="btn-ghost"
              >
                {t.contactCta.secondary}
              </a>
            </div>
          </div>
        </div>
      </section>
    </LandingShell>
  );
}
