/**
 * client/src/components/auth/AuthShell.tsx
 *
 * Shell visual reaproveitado por todas as telas de autenticação V2 da F47:
 *  - /login, /cadastro, /aceitar-convite/:token, /verificar-email/:token
 *  - /esqueci-senha, /redefinir-senha/:token
 *  - /mfa/configurar, /mfa/desafio
 *
 * Herda exatamente os tokens visuais do design system NowGo
 * (paleta cyan, fonte Outfit, ambient layers) sem alterar layout/conteúdo
 * existente da landing/cockpit. Tudo é escopado por .nowgoai-landing.
 */

import { Link } from "wouter";
import "@/landing/styles/design-system.css";
import "./auth.css";
import type { ReactNode } from "react";

type Props = {
  /** Tagline curta acima do título (ex.: "Acesso · Login"). Maiúsculas. */
  tagline: string;
  /** Título principal da tela (suporte a JSX para destaque cyan opcional). */
  title: ReactNode;
  /** Texto descritivo curto abaixo do título. */
  subtitle?: ReactNode;
  /** Conteúdo central (formulário). */
  children: ReactNode;
  /** Rodapé com links auxiliares (ex.: "Esqueci minha senha"). */
  footer?: ReactNode;
};

export default function AuthShell({ tagline, title, subtitle, children, footer }: Props) {
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
          <div className="ng-header-actions">
            <Link href="/" className="ng-header-login" aria-label="Voltar à landing">
              <span aria-hidden="true" className="ng-header-login-lock">←</span>
              Voltar
            </Link>
          </div>
        </div>
      </header>

      <main className="ng-auth-main">
        <div className="ng-auth-shell">
          <span className="ng-auth-tagline">{tagline}</span>
          <h1 className="ng-auth-title">{title}</h1>
          {subtitle ? <p className="ng-auth-subtitle">{subtitle}</p> : null}
          <div className="ng-auth-card">{children}</div>
          {footer ? <div className="ng-auth-footer">{footer}</div> : null}
        </div>
      </main>
    </div>
  );
}
