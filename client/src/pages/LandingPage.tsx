import { useEffect, useRef } from "react";
import { Link } from "wouter";
import "@/landing/styles/design-system.css";
import { useHeroGlobe } from "@/landing/useHeroGlobe";
import { useLang } from "@/landing/useLang";
import { copy } from "@/landing/copy";

/**
 * LandingPage — landing pública da nowgo ai em cockpitcrmnowgoai.com (rota /).
 *
 * Esta página é o ponto de entrada institucional. O cockpit autenticado
 * (/cockpit) e o Jarvis cívico (/civic) permanecem intocados. Todo o
 * design system (cores, tipografia, animações) é importado de
 * `@/landing/styles/design-system.css`, fiel à referência Asimov AI
 * Intelligence SaaS, com tokens da nowgo ai.
 *
 * Conteúdo: bilíngue PT-BR/EN, controlado pelo hook `useLang` com persistência
 * em localStorage. Toda string vem do arquivo `copy.ts`, sem hardcode no JSX.
 */
export default function LandingPage() {
  const { lang, setLang } = useLang();
  const t = copy[lang];

  const canvasRef = useRef<HTMLCanvasElement>(null);
  useHeroGlobe(canvasRef);

  // Carregar Outfit + Inter do Google Fonts uma única vez.
  useEffect(() => {
    if (typeof document === "undefined") return;
    if (document.getElementById("nowgoai-landing-fonts")) return;
    const link = document.createElement("link");
    link.id = "nowgoai-landing-fonts";
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Outfit:wght@300;400;500;600;700&display=swap";
    document.head.appendChild(link);
  }, []);

  // IntersectionObserver simples para a animação de entrada das seções.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("visible");
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -80px 0px" },
    );
    document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [lang]);

  return (
    <div className="nowgoai-landing">
      <div className="ambient-glow" aria-hidden="true" />
      <div className="grid-layer" aria-hidden="true" />
      <div className="noise-layer" aria-hidden="true" />

      {/* HEADER */}
      <header id="header" className="ng-header">
        <div className="ng-header-inner">
          <a href="#top" className="ng-brand">
            <span className="ng-brand-mark">◇</span>
            <span className="ng-brand-text">nowgo ai</span>
          </a>
          <nav className="ng-nav-links" aria-label="primary">
            <div className="ng-nav-dropdown">
              <button type="button" className="ng-nav-dropdown-trigger" aria-haspopup="true" aria-expanded="false">
                {t.footer.colB.title}
                <span className="ng-nav-dropdown-caret" aria-hidden="true">⌄</span>
              </button>
              <div className="ng-nav-dropdown-menu" role="menu">
                {t.footer.colB.links.map((link) => (
                  link.href.startsWith("/") && !link.href.startsWith("/#") ? (
                    <Link key={link.label} href={link.href} role="menuitem">{link.label}</Link>
                  ) : (
                    <a key={link.label} href={link.href} role="menuitem">{link.label}</a>
                  )
                ))}
              </div>
            </div>
            <a href="#platform">{t.nav.platform}</a>
            <a href="#verticals">{t.nav.verticals}</a>
            <a href="#cases">{t.nav.cases}</a>
            <a href="#ecosystem">{t.nav.ecosystem}</a>
            <a href="#pricing">{t.nav.pricing}</a>
          </nav>
          <div className="ng-header-actions">
            <div className="ng-lang-toggle" role="tablist" aria-label="Language">
              {(["pt", "en", "es"] as const).map((code) => (
                <button
                  key={code}
                  type="button"
                  role="tab"
                  aria-selected={lang === code}
                  className={lang === code ? "active" : ""}
                  onClick={() => setLang(code)}
                >
                  {code.toUpperCase()}
                </button>
              ))}
            </div>
            <Link href="/cockpit" className="btn-primary ng-cta">
              {t.nav.cockpitCta}
            </Link>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section id="top" className="ng-hero">
        <div className="ng-hero-grid">
          <div className="ng-hero-text ng-hero-content reveal">
            <span className="tagline">{t.hero.tag}</span>
            <h1 className="ng-h1">
              <span className="ng-h1-line">{t.hero.titleA}</span>
              <span className="ng-h1-line ng-h1-line-dim">{t.hero.titleB}</span>
            </h1>
            <p className="ng-hero-sub">{t.hero.subtitle}</p>
            <div className="ng-hero-actions">
              <a href="#contact" className="btn-primary">{t.hero.ctaPrimary}</a>
              <Link href="/cockpit" className="btn-secondary">{t.hero.ctaSecondary}</Link>
            </div>
            <div className="ng-hero-kpis">
              <div className="ng-hero-kpi"><span>•</span>{t.hero.kpiA}</div>
              <div className="ng-hero-kpi"><span>•</span>{t.hero.kpiB}</div>
              <div className="ng-hero-kpi"><span>•</span>{t.hero.kpiC}</div>
            </div>
          </div>
          <div className="ng-hero-globe-col" aria-hidden="true">
            <canvas ref={canvasRef} id="hero-globe" />
          </div>
        </div>
      </section>

      {/* PLATFORM */}
      <section id="platform" className="ng-section">
        <div className="ng-section-inner">
          <div className="ng-section-head reveal">
            <span className="tagline">{t.platform.eyebrow}</span>
            <h2 className="ng-h2">{t.platform.title}</h2>
            <p className="ng-section-sub">{t.platform.subtitle}</p>
          </div>
          <div className="ng-pillars">
            {t.platform.pillars.map((p, i) => (
              <article key={i} className="ng-pillar reveal" style={{ transitionDelay: `${i * 80}ms` }}>
                <div className="ng-pillar-tag">{p.tag}</div>
                <h3 className="ng-pillar-title">{p.title}</h3>
                <p className="ng-pillar-desc">{p.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* VERTICALS */}
      <section id="verticals" className="ng-section ng-section-alt">
        <div className="ng-section-inner">
          <div className="ng-section-head reveal">
            <span className="tagline">{t.verticals.eyebrow}</span>
            <h2 className="ng-h2">{t.verticals.title}</h2>
            <p className="ng-section-sub">{t.verticals.subtitle}</p>
          </div>

          {/* Smart Cities (frente pública) em destaque */}
          <div className="ng-vertical-feature reveal">
            <div className="ng-vertical-feature-head">
              <span className="ng-vertical-feature-kicker">{t.verticals.smartCity.kicker}</span>
              <h3 className="ng-vertical-feature-name">{t.verticals.smartCity.name}</h3>
            </div>
            <p className="ng-vertical-feature-desc">{t.verticals.smartCity.desc}</p>
            <ul className="ng-vertical-feature-bullets">
              {t.verticals.smartCity.bullets.map((b, i) => (
                <li key={i}>{b}</li>
              ))}
            </ul>
          </div>

          {/* Enterprise (frente privada) */}
          <div className="ng-vertical-enterprise reveal">
            <div className="ng-vertical-enterprise-head">
              <span className="ng-vertical-feature-kicker">{t.verticals.enterprise.kicker}</span>
              <h3 className="ng-vertical-feature-name">{t.verticals.enterprise.name}</h3>
              <p className="ng-vertical-feature-desc">{t.verticals.enterprise.desc}</p>
            </div>
            <div className="ng-verticals-grid">
              {t.verticals.enterprise.items.map((v, i) => (
                <article key={i} className="ng-vertical reveal" style={{ transitionDelay: `${i * 60}ms` }}>
                  <div className="ng-vertical-num">{String(i + 1).padStart(2, "0")}</div>
                  <h3 className="ng-vertical-name">{v.name}</h3>
                  <p className="ng-vertical-desc">{v.desc}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CASES */}
      <section id="cases" className="ng-section">
        <div className="ng-section-inner">
          <div className="ng-section-head reveal">
            <span className="tagline">{t.cases.eyebrow}</span>
            <h2 className="ng-h2">{t.cases.title}</h2>
            <p className="ng-section-sub">{t.cases.subtitle}</p>
          </div>
          <div className="ng-cases-grid">
            {t.cases.items.map((c, i) => (
              <article key={i} className="ng-case reveal" style={{ transitionDelay: `${i * 80}ms` }}>
                <span className="ng-case-tag">{c.tag}</span>
                <h3 className="ng-case-title">{c.title}</h3>
                <div className="ng-case-metric">
                  {c.metric && <strong>{c.metric}</strong>}
                  <span>{c.metricLabel}</span>
                </div>
                <p className="ng-case-desc">{c.desc}</p>
              </article>
            ))}
          </div>
          <p className="ng-cases-footer reveal">{t.cases.footer}</p>
        </div>
      </section>

      {/* SEALS */}
      <section id="seals" className="ng-section ng-section-alt">
        <div className="ng-section-inner">
          <div className="ng-section-head reveal">
            <span className="tagline">{t.seals.eyebrow}</span>
            <h2 className="ng-h2">{t.seals.title}</h2>
            <p className="ng-section-sub">{t.seals.subtitle}</p>
          </div>
          <div className="ng-seals-grid">
            {t.seals.items.map((s, i) => (
              <article key={i} className="ng-seal reveal" style={{ transitionDelay: `${i * 50}ms` }}>
                <span className="ng-seal-kicker">{s.kicker}</span>
                <h3 className="ng-seal-name">{s.name}</h3>
                <p className="ng-seal-desc">{s.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ECOSYSTEM (NVIDIA Partner Expert) */}
      <section id="ecosystem" className="ng-section">
        <div className="ng-section-inner">
          <div className="ng-section-head reveal">
            <span className="tagline">{t.ecosystem.eyebrow}</span>
            <h2 className="ng-h2">{t.ecosystem.title}</h2>
            <p className="ng-section-sub">{t.ecosystem.subtitle}</p>
          </div>
          <div className="ng-ecosystem-grid">
            {t.ecosystem.items.map((c, i) => (
              <article
                key={i}
                className="ng-eco reveal"
                style={{ transitionDelay: `${i * 60}ms` }}
              >
                <span className="ng-eco-tag">{c.tag}</span>
                <h3 className="ng-eco-title">{c.title}</h3>
                <p
                  className="ng-eco-desc"
                  dangerouslySetInnerHTML={{
                    __html: c.desc.replace(/\*([^*]+)\*/g, "<em>$1</em>"),
                  }}
                />
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="ng-section">
        <div className="ng-section-inner">
          <div className="ng-section-head reveal">
            <span className="tagline">{t.pricing.eyebrow}</span>
            <h2 className="ng-h2">{t.pricing.title}</h2>
            <p className="ng-section-sub">{t.pricing.subtitle}</p>
          </div>
          <div className="ng-pricing-grid">
            {t.pricing.tiers.map((tier, i) => (
              <article key={i} className={"ng-tier reveal" + (tier.highlight ? " highlight" : "")} style={{ transitionDelay: `${i * 80}ms` }}>
                {tier.highlight && <span className="ng-tier-flag">★</span>}
                <h3 className="ng-tier-name">{tier.name}</h3>
                <div className="ng-tier-price"><strong>{tier.price}</strong><span>{tier.period}</span></div>
                <p className="ng-tier-desc">{tier.desc}</p>
                <ul className="ng-tier-features">
                  {tier.features.map((f, j) => <li key={j}>{f}</li>)}
                </ul>
                <a href="#contact" className={tier.highlight ? "btn-primary" : "btn-secondary"}>{tier.cta}</a>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section id="contact" className="ng-final-cta">
        <div className="ng-section-inner reveal">
          <span className="tagline">{t.finalCta.eyebrow}</span>
          <h2 className="ng-h2 ng-final-h2">{t.finalCta.title}</h2>
          <p className="ng-section-sub ng-final-sub">{t.finalCta.subtitle}</p>
          <div className="ng-hero-actions">
            <a href="mailto:helio@nowgo.com.br" className="btn-primary">{t.finalCta.ctaPrimary}</a>
            <a href="https://wa.me/5561992509494" target="_blank" rel="noreferrer" className="btn-secondary">{t.finalCta.ctaSecondary}</a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="ng-footer">
        <div className="ng-footer-inner">
          <div className="ng-footer-brand">
            <span className="tagline">{t.footer.tag}</span>
            <h3 className="ng-footer-h">{t.footer.brand}</h3>
            <p className="ng-footer-desc">{t.footer.desc}</p>
          </div>
          <div className="ng-footer-cols">
            {[t.footer.colA, t.footer.colB, t.footer.colC].map((col, i) => (
              <div key={i} className="ng-footer-col">
                <h4>{col.title}</h4>
                <ul>
                  {col.links.map((l, j) => {
                    const href = l.href;
                    const isAnchor = href.startsWith("#");
                    const isMail = href.startsWith("mailto:");
                    const isInternal = href.startsWith("/");
                    if (isInternal) {
                      return (
                        <li key={j}>
                          <Link href={href}>{l.label}</Link>
                        </li>
                      );
                    }
                    return (
                      <li key={j}>
                        <a
                          href={href}
                          {...(isMail || isAnchor ? {} : { target: "_blank", rel: "noreferrer" })}
                        >
                          {l.label}
                        </a>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="ng-footer-bottom">
          <span>{t.footer.copyright}</span>
          <span>NVIDIA Partner Expert · Top 50 Global · Built in Brazil</span>
        </div>
      </footer>
    </div>
  );
}
