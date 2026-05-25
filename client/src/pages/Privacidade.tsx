import { useEffect } from "react";
import LandingShell from "@/landing/LandingShell";
import { useLang } from "@/landing/useLang";
import { pagesCopy } from "@/landing/copyPages";

export default function Privacidade() {
  const { lang } = useLang();
  const t = pagesCopy[lang].privacidade;

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
            <p className="ng-page-meta">{t.hero.updated}</p>
          </div>
        </div>
      </section>

      <section className="ng-section">
        <div className="ng-container">
          <div className="ng-page-content ng-policy reveal">
            {t.sections.map((s, i) => (
              <article key={i} className="ng-page-block">
                <h2>{s.title}</h2>
                {s.body.map((p, j) => (
                  <p key={j}>{p}</p>
                ))}
              </article>
            ))}
          </div>
        </div>
      </section>
    </LandingShell>
  );
}
