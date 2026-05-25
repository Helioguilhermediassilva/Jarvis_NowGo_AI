import { useEffect } from "react";
import LandingShell from "@/landing/LandingShell";
import { useLang } from "@/landing/useLang";
import { pagesCopy } from "@/landing/copyPages";

/**
 * Carreiras — página institucional de vagas da NowGo AI.
 *
 * Mantém o mesmo padrão visual de Sobre/Manifesto/Privacidade (LandingShell
 * com hero, blocos de conteúdo e CTA final), garantindo coerência de design
 * system e idiomas PT/EN/ES via copyPages.ts.
 */
export default function Carreiras() {
  const { lang } = useLang();
  const t = pagesCopy[lang].carreiras;

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
              {t.intro.body.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </article>

            {t.vagas.map((vaga) => (
              <article key={vaga.role} className="ng-page-block ng-job-card">
                <span className="ng-eyebrow ng-job-area">{vaga.area}</span>
                <h2 className="ng-job-role">{vaga.role}</h2>
                <p className="ng-job-meta">{vaga.meta}</p>
                <p className="ng-job-intro">{vaga.intro}</p>

                <h3 className="ng-job-section-title">{vaga.responsibilities.title}</h3>
                <ul className="ng-job-list">
                  {vaga.responsibilities.items.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>

                <h3 className="ng-job-section-title">{vaga.requirements.title}</h3>
                <ul className="ng-job-list">
                  {vaga.requirements.items.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>

                {vaga.notRequired && (
                  <>
                    <h3 className="ng-job-section-title">{vaga.notRequired.title}</h3>
                    <ul className="ng-job-list">
                      {vaga.notRequired.items.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </>
                )}

                {vaga.differentials && (
                  <>
                    <h3 className="ng-job-section-title">{vaga.differentials.title}</h3>
                    <ul className="ng-job-list">
                      {vaga.differentials.items.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </>
                )}

                <p className="ng-job-apply">{vaga.apply.text}</p>
                <a
                  href={`mailto:carreiras@nowgo.com.br?subject=${encodeURIComponent(vaga.apply.subject)}`}
                  className="btn-primary ng-job-cta"
                >
                  {vaga.apply.cta}
                </a>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="ng-final-cta">
        <div className="ng-section-inner reveal">
          <h2 className="ng-h2 ng-final-h2">{t.contactCta.title}</h2>
          <p className="ng-section-sub ng-final-sub">{t.contactCta.subtitle}</p>
          <div className="ng-hero-actions">
            <a
              href="mailto:carreiras@nowgo.com.br?subject=Candidatura%20espont%C3%A2nea"
              className="btn-primary"
            >
              {t.contactCta.primary}
            </a>
            <a
              href="https://wa.me/5561999708833?text=Ol%C3%A1%2C%20H%C3%A9lio!%20Vim%20pela%20p%C3%A1gina%20de%20Carreiras%20da%20NowGo%20AI%20e%20gostaria%20de%20conversar%20sobre%20oportunidades."
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
