/**
 * client/src/pages/EsqueciSenha.tsx
 *
 * Tela /esqueci-senha. Consome POST /api/auth/v2/password/reset-request.
 *
 * Importante: o endpoint sempre retorna 200 (anti-enumeração). A tela
 * exibe a mesma mensagem genérica de sucesso independentemente de o
 * e-mail existir ou não no banco.
 */

import { useState, type FormEvent } from "react";
import { Link } from "wouter";
import AuthShell from "@/components/auth/AuthShell";
import { requestPasswordResetV2, type ApiError } from "@/lib/authV2Client";

export default function EsqueciSenhaPage() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await requestPasswordResetV2({
        email: email.trim().toLowerCase(),
        origin: window.location.origin,
      });
      setSubmitted(true);
    } catch (e) {
      const err = e as ApiError;
      if (err.code === "rate_limited") {
        setError(
          "Muitas tentativas em pouco tempo. Aguarde alguns minutos e tente de novo.",
        );
      } else {
        setError("Não foi possível concluir a operação. Tente novamente em instantes.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <AuthShell
        tagline="ACESSO · RECUPERAÇÃO"
        title={
          <>
            Verifique sua <span className="accent">caixa de entrada</span>
          </>
        }
        subtitle="Se o e-mail estiver cadastrado, você receberá um link para redefinir sua senha em alguns minutos. Confira também a pasta de spam."
        footer={
          <>
            <Link href="/login">Voltar ao login</Link>
          </>
        }
      >
        <div className="ng-auth-success" role="status">
          Solicitação registrada. O link de redefinição expira em 1 hora.
        </div>
        <p className="ng-auth-help">
          Não recebeu o e-mail em alguns minutos? Tente novamente ou contate o
          administrador da sua organização.
        </p>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      tagline="ACESSO · RECUPERAÇÃO"
      title={
        <>
          Recuperar acesso ao <span className="accent">cockpit</span>
        </>
      }
      subtitle="Informe o e-mail cadastrado e enviaremos um link para você criar uma nova senha."
      footer={
        <>
          Lembrou a senha? <Link href="/login">Entrar</Link>
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
        <button type="submit" className="ng-auth-submit" disabled={submitting}>
          {submitting ? "Enviando…" : "Enviar link de recuperação"}
        </button>
        <p className="ng-auth-help">
          Por segurança, sempre exibimos a mesma resposta — independentemente de
          o e-mail estar cadastrado.
        </p>
      </form>
    </AuthShell>
  );
}
