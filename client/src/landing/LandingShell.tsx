import { ReactNode, useEffect } from "react";
import { Link } from "wouter";
import "@/landing/styles/design-system.css";
import { useLang } from "@/landing/useLang";
import { copy } from "@/landing/copy";
import CompanyDropdown from "@/landing/CompanyDropdown";
import AuthHeaderButtons from "@/components/auth/AuthHeaderButtons";

/**
 * LandingShell — wrapper visual reutilizado pelas páginas institucionais
 * (Sobre, Manifesto, Privacidade). Garante header + footer + design system
 * idênticos à landing principal e mantém o toggle PT/EN/ES funcionando
 * entre todas as rotas.
 *
 * Importante: este shell NÃO renderiza a landing-page principal. A `LandingPage`
 * preserva sua estrutura completa (hero, platform, verticals, cases, seals,
 * pricing, finalCta) e é o único componente que usa âncoras como `#platform`.
 * Aqui as âncoras do header apontam para `/#platform`, o que faz wouter rotear
 * para `/` e o navegador rolar até a seção desejada.
 */
type Props = {
  children: ReactNode;
  /** Slug ativo no header — usado para destacar o nav item atual, se existir. */
  activeNav?: "platform" | "verticals" | "cases" | "pricing";
};

export default function LandingShell({ children, activeNav: _activeNav }: Props) {
  const { lang, setLang } = useLang();
  const t = copy[lang];

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

  // Animação de entrada suave para seções marcadas com .reveal
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
  }, [lang, children]);

  return (
    <div className="nowgoai-landing">
      <div className="ambient-glow" aria-hidden="true" />
      <div className="grid-layer" aria-hidden="true" />
      <div className="noise-layer" aria-hidden="true" />

      <header id="header" className="ng-header">
        <div className="ng-header-inner">
          <Link href="/" className="ng-brand">
            <span className="ng-brand-mark">◇</span>
            <span className="ng-brand-text">NowGo AI</span>
          </Link>
          <nav className="ng-nav-links" aria-label="primary">
            <CompanyDropdown
              title={t.footer.colB.title}
              links={t.footer.colB.links}
              anchorPrefix="/"
            />
            <a href="/#platform">{t.nav.platform}</a>
            <a href="/#verticals">{t.nav.verticals}</a>
            <a href="/#cases">{t.nav.cases}</a>
            <a href="/#ecosystem">{t.nav.ecosystem}</a>
            <a href="/#pricing">{t.nav.pricing}</a>
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
            <AuthHeaderButtons cockpitLabel={t.nav.cockpitCta} />
          </div>
        </div>
      </header>

      <main>{children}</main>

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
                    if (isAnchor) {
                      // Em sub-páginas, reescreve âncora para apontar à home
                      return (
                        <li key={j}>
                          <a href={`/${href}`}>{l.label}</a>
                        </li>
                      );
                    }
                    return (
                      <li key={j}>
                        <a
                          href={href}
                          {...(isMail ? {} : { target: "_blank", rel: "noreferrer" })}
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

export function useLandingLang() {
  return useLang();
}
