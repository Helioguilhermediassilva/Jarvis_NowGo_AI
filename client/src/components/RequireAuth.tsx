/**
 * client/src/components/RequireAuth.tsx
 *
 * Guard de rota frontend para o Cockpit NowGo AI.
 *
 * Regras:
 *  1. Se a sessão não está carregada, mostra placeholder neutro.
 *  2. Se o usuário não está autenticado, redireciona para o fluxo de login
 *     do Google preservando `returnTo` (caminho atual).
 *  3. Se o usuário está autenticado mas seu e-mail NÃO está na allowlist
 *     ALLOWED_COCKPIT_EMAILS, mostra uma tela de acesso restrito
 *     com link de logout e link para a landing pública (/).
 *
 * O conteúdo do cockpit em si (rotas filhas) nunca é renderizado quando o
 * acesso é negado. Em "primeiro momento" apenas o e-mail do founder
 * (helio@nowgo.com.br) entra. Para liberar mais pessoas, basta acrescentar
 * e-mails à constante ALLOWED_COCKPIT_EMAILS abaixo.
 */

import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";

const ALLOWED_COCKPIT_EMAILS: ReadonlyArray<string> = [
  "helio@nowgo.com.br",
];

function isAllowed(email: string | null | undefined): boolean {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  return ALLOWED_COCKPIT_EMAILS.some((allowed) => allowed.trim().toLowerCase() === normalized);
}

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const { loading, authenticated, loginUrl, user, logout } = useAuth();

  useEffect(() => {
    if (!loading && !authenticated) {
      const path = window.location.pathname + window.location.search;
      window.location.href = loginUrl(path);
    }
  }, [loading, authenticated, loginUrl]);

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#00060a",
          color: "#5ab8cc",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "monospace",
          fontSize: 12,
          letterSpacing: 3,
          textTransform: "uppercase",
        }}
      >
        verificando sessão NowGo...
      </div>
    );
  }

  if (!authenticated) {
    // Já redirecionando — render placeholder mínimo
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#00060a",
          color: "#5ab8cc",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "monospace",
          fontSize: 12,
          letterSpacing: 3,
          textTransform: "uppercase",
        }}
      >
        redirecionando para login...
      </div>
    );
  }

  // Usuário autenticado: verificar allowlist
  if (!isAllowed(user?.email)) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#030304",
          color: "#F4F4F6",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "Inter, -apple-system, sans-serif",
          padding: "2rem",
          textAlign: "center",
        }}
      >
        <div
          style={{
            maxWidth: 520,
            background: "rgba(10, 10, 12, 0.72)",
            border: "1px solid rgba(255, 255, 255, 0.06)",
            borderRadius: 16,
            padding: "2.5rem 2rem",
            backdropFilter: "blur(12px)",
          }}
        >
          <span
            style={{
              display: "inline-block",
              fontFamily: "Outfit, sans-serif",
              fontSize: "0.72rem",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "#33D2FF",
              padding: "0.35rem 0.75rem",
              border: "1px solid rgba(51, 210, 255, 0.28)",
              borderRadius: 999,
              background: "rgba(51, 210, 255, 0.04)",
              marginBottom: "1.25rem",
            }}
          >
            ACESSO RESTRITO · RESTRICTED ACCESS
          </span>
          <h1
            style={{
              fontFamily: "Outfit, sans-serif",
              fontSize: "1.6rem",
              fontWeight: 500,
              letterSpacing: "-0.01em",
              margin: "0 0 1rem",
              lineHeight: 1.2,
            }}
          >
            O cockpit nowgo ai está em acesso restrito neste primeiro momento.
          </h1>
          <p
            style={{
              fontSize: "0.95rem",
              lineHeight: 1.6,
              color: "#888894",
              margin: "0 0 1.75rem",
            }}
          >
            Sua conta {user?.email ? <strong style={{ color: "#F4F4F6" }}>({user.email})</strong> : null} está autenticada com sucesso, mas ainda não está habilitada para o painel interno. A liberação acontece em ondas controladas. Para solicitar acesso, fale com a equipe nowgo ai.
          </p>
          <div
            style={{
              display: "flex",
              gap: "0.85rem",
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <a
              href="/"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#FFFFFF",
                color: "#030304",
                fontFamily: "Outfit, sans-serif",
                fontWeight: 500,
                fontSize: "0.92rem",
                padding: "0.75rem 1.5rem",
                borderRadius: 999,
                textDecoration: "none",
                boxShadow: "0 8px 32px rgba(51, 210, 255, 0.12)",
              }}
            >
              Voltar à landing
            </a>
            <button
              type="button"
              onClick={() => {
                void logout();
              }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                background: "rgba(255, 255, 255, 0.04)",
                color: "#F4F4F6",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                fontFamily: "Outfit, sans-serif",
                fontWeight: 500,
                fontSize: "0.92rem",
                padding: "0.75rem 1.5rem",
                borderRadius: 999,
                cursor: "pointer",
              }}
            >
              Sair da conta
            </button>
          </div>
          <p
            style={{
              marginTop: "2rem",
              fontSize: "0.78rem",
              color: "#555562",
              letterSpacing: "0.04em",
            }}
          >
            Solicitar acesso: <a href="mailto:helio@nowgo.com.br" style={{ color: "#33D2FF" }}>helio@nowgo.com.br</a>
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
