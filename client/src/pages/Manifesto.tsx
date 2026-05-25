import { useEffect } from "react";
import LandingShell from "@/landing/LandingShell";
import { useLang } from "@/landing/useLang";
import { pagesCopy } from "@/landing/copyPages";

export default function Manifesto() {
  const { lang } = useLang();
  const t = pagesCopy[lang].manifesto;

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

      {/* Pilares: Propósito · Missão · Visão */}
      <section className="ng-section">
        <div className="ng-container">
          <div className="ng-manifesto-pillars reveal">
            {t.pillars.map((p, i) => (
              <article key={i} className="ng-manifesto-pillar">
                <span className="ng-eyebrow ng-manifesto-kicker">
                  {p.kicker}
                </span>
                <h3 className="ng-manifesto-pillar-title">{p.title}</h3>
                <p className="ng-manifesto-pillar-body">{p.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Forças · Valores · Foco — em três colunas estilo lousa */}
      <section className="ng-section">
        <div className="ng-container">
          <div className="ng-manifesto-grid reveal">
            <ManifestoBoard title={t.forces.title} items={t.forces.items} />
            <ManifestoBoard title={t.values.title} items={t.values.items} />
            <ManifestoBoard title={t.focus.title} items={t.focus.items} />
          </div>
        </div>
      </section>

      {/* Princípios · Lembretes — duas colunas */}
      <section className="ng-section">
        <div className="ng-container">
          <div className="ng-manifesto-grid-2 reveal">
            <ManifestoBoard
              title={t.principles.title}
              items={t.principles.items}
            />
            <ManifestoBoard
              title={t.reminders.title}
              items={t.reminders.items}
            />
          </div>
        </div>
      </section>

      {/* Closing */}
      <section className="ng-section ng-final-cta">
        <div className="ng-container">
          <div className="ng-final-cta-inner reveal">
            <h2 className="ng-final-cta-title">{t.closing}</h2>
            <p className="ng-final-cta-subtitle">— Hélio Guilherme</p>
          </div>
        </div>
      </section>
    </LandingShell>
  );
}

function ManifestoBoard({
  title,
  items,
}: {
  title: string;
  items: string[];
}) {
  return (
    <article className="ng-manifesto-board">
      <h3 className="ng-manifesto-board-title">{title}</h3>
      <ul className="ng-manifesto-board-list">
        {items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    </article>
  );
}
