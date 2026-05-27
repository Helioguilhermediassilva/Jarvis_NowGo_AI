/**
 * client/src/pages/Login.tsx
 *
 * Tela de login da F47 (V2). Consome POST /api/auth/v2/login.
 * - Sucesso direto: cookie nowgo_session_v2 é setado pelo backend e o usuário
 *   é redirecionado ao /cockpit.
 * - mfa_required: redireciona para /mfa/desafio passando o ticket por sessionStorage.
 * - mfa_setup_required: redireciona para /mfa/configurar passando o ticket.
 *
 * Mantém identidade visual NowGo (paleta cyan, Outfit, Inter).
 */

import { useState, type FormEvent } from "react";
import { Link, useLocation } from "wouter";
import AuthShell from "@/components/auth/AuthShell";
import { loginV2, type ApiError } from "@/lib/authV2Client";

const ERROR_LABELS: Record<string, string> = {
  invalid_credentials: "E-mail ou senha incorretos.",
  email_not_verified:
    "Você precisa verificar seu e-mail antes de entrar. Confira sua caixa de entrada.",
  password_not_set:
    "Esta conta foi criada por convite e ainda não tem senha definida. Use o link recebido por e-mail para concluir o cadastro.",
  rate_limited:
    "Muitas tentativas em pouco tempo. Aguarde alguns minutos e tente novamente.",
  http_error: "Não foi possível concluir a requisição. Tente novamente.",
};

export default function LoginPage() {
  const [, navigate] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const result = await loginV2({ email: email.trim().toLowerCase(), password });

      if (result.kind === "session") {
        // Backend já gravou cookie nowgo_session_v2; redireciona ao cockpit.
        window.location.href = "/cockpit";
        return;
      }

      if (result.kind === "mfa_required") {
        sessionStorage.setItem("nowgo.mfaTicket", result.mfaTicket);
        sessionStorage.setItem("nowgo.mfaIntent", "challenge");
        navigate("/mfa/desafio");
        return;
      }

      // mfa_setup_required: usuário tem MFA pendente de configuração.
      sessionStorage.setItem("nowgo.mfaTicket", result.mfaTicket);
      sessionStorage.setItem("nowgo.mfaIntent", "setup");
      navigate("/mfa/configurar");
    } catch (e) {
      const err = e as ApiError;
      setError(ERROR_LABELS[err.code] ?? ERROR_LABELS.http_error);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthShell
      tagline="ACESSO · LOGIN"
      title={
        <>
          Bem-vindo de volta ao <span className="accent">cockpit NowGo</span>
        </>
      }
      subtitle="Entre com seu e-mail corporativo e senha para acessar o cockpit."
      footer={
        <>
          Não tem cadastro? <Link href="/cadastro">Solicitar acesso</Link>
          <br />
          <Link href="/esqueci-senha">Esqueci minha senha</Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate>
        {error && <div className="ng-auth-error" role="alert">{error}</div>}
        <label className="ng-auth-field">
          <span className="ng-auth-field-label">E-mail</span>
          <input
            type="email"
            className="ng-auth-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="voce@empresa.com"
            autoComplete="email"
            required
            disabled={submitting}
          />
        </label>
        <label className="ng-auth-field">
          <span className="ng-auth-field-label">Senha</span>
          <input
            type="password"
            className="ng-auth-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="current-password"
            required
            disabled={submitting}
            minLength={8}
          />
        </label>
        <button type="submit" className="ng-auth-submit" disabled={submitting}>
          {submitting ? "Entrando…" : "Entrar"}
        </button>
        <p className="ng-auth-help">
          Esta área é restrita aos times credenciados pelo administrador NowGo.
        </p>
      </form>
    </AuthShell>
  );
}
