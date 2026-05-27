/**
 * client/src/pages/MfaDesafio.tsx
 *
 * Tela /mfa/desafio. Acionada pelo /login quando o backend retorna mfa_required.
 *
 * Lê o `nowgo.mfaTicket` do sessionStorage, aceita um código TOTP de 6 dígitos
 * OU um backup code, chama POST /api/auth/v2/login/mfa e — em sucesso — redireciona
 * para /cockpit (cookie já gravado pelo backend).
 */

import { useEffect, useState, type FormEvent } from "react";
import { Link, useLocation } from "wouter";
import AuthShell from "@/components/auth/AuthShell";
import { loginMfaV2, type ApiError } from "@/lib/authV2Client";

const ERROR_LABELS: Record<string, string> = {
  invalid_mfa_ticket:
    "Sua sessão de verificação expirou. Faça login novamente.",
  mfa_ticket_expired:
    "Sua sessão de verificação expirou. Faça login novamente.",
  invalid_mfa_code:
    "Código inválido. Confira o app autenticador ou use um backup code.",
  rate_limited:
    "Muitas tentativas em pouco tempo. Aguarde alguns minutos e tente de novo.",
  http_error:
    "Não foi possível concluir a verificação. Tente novamente em instantes.",
};

export default function MfaDesafioPage() {
  const [, navigate] = useLocation();
  const [ticket, setTicket] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [useBackup, setUseBackup] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("nowgo.mfaTicket");
    const intent = sessionStorage.getItem("nowgo.mfaIntent");
    if (!stored || intent !== "challenge") {
      navigate("/login");
      return;
    }
    setTicket(stored);
  }, [navigate]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!ticket) return;
    setError(null);
    setSubmitting(true);
    try {
      await loginMfaV2({
        mfaTicket: ticket,
        code: code.trim(),
        method: useBackup ? "backup" : "totp",
      });
      sessionStorage.removeItem("nowgo.mfaTicket");
      sessionStorage.removeItem("nowgo.mfaIntent");
      window.location.href = "/cockpit";
    } catch (e) {
      const err = e as ApiError;
      setError(ERROR_LABELS[err.code] ?? ERROR_LABELS.http_error);
      if (err.code === "invalid_mfa_ticket" || err.code === "mfa_ticket_expired") {
        sessionStorage.removeItem("nowgo.mfaTicket");
        sessionStorage.removeItem("nowgo.mfaIntent");
        setTimeout(() => navigate("/login"), 2500);
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (!ticket) {
    return (
      <AuthShell tagline="MFA · DESAFIO" title="Carregando…">
        <p className="ng-auth-help" style={{ textAlign: "center", margin: 0 }}>
          Aguarde alguns instantes.
        </p>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      tagline="MFA · VERIFICAÇÃO"
      title={
        <>
          Confirme seu <span className="accent">código de acesso</span>
        </>
      }
      subtitle={
        useBackup
          ? "Insira um dos backup codes que você guardou ao configurar o MFA."
          : "Abra seu app autenticador (Google Authenticator, 1Password etc.) e digite o código de 6 dígitos."
      }
      footer={
        <>
          <Link href="/login">Voltar ao login</Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate>
        {error && <div className="ng-auth-error" role="alert">{error}</div>}
        <label className="ng-auth-field">
          <span className="ng-auth-field-label">
            {useBackup ? "Backup code" : "Código de 6 dígitos"}
          </span>
          <input
            type="text"
            className="ng-auth-input"
            value={code}
            onChange={(e) =>
              setCode(useBackup ? e.target.value.trim() : e.target.value.replace(/\D/g, ""))
            }
            placeholder={useBackup ? "ex.: F47-XK9Q-2BTR" : "000000"}
            inputMode={useBackup ? "text" : "numeric"}
            autoComplete="one-time-code"
            maxLength={useBackup ? 32 : 6}
            required
            disabled={submitting}
            style={{
              fontFamily: useBackup ? "Menlo, Consolas, monospace" : undefined,
              letterSpacing: useBackup ? "0.05em" : "0.6em",
              textAlign: "center",
              fontSize: "1.1rem",
            }}
          />
        </label>
        <button type="submit" className="ng-auth-submit" disabled={submitting}>
          {submitting ? "Verificando…" : "Confirmar"}
        </button>
        <p className="ng-auth-help" style={{ textAlign: "center" }}>
          {useBackup ? (
            <>
              Voltei a ter acesso ao app autenticador.{" "}
              <button
                type="button"
                onClick={() => {
                  setUseBackup(false);
                  setCode("");
                  setError(null);
                }}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--accent-cyan)",
                  cursor: "pointer",
                  font: "inherit",
                  padding: 0,
                }}
              >
                Usar código TOTP
              </button>
            </>
          ) : (
            <>
              Sem acesso ao app?{" "}
              <button
                type="button"
                onClick={() => {
                  setUseBackup(true);
                  setCode("");
                  setError(null);
                }}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--accent-cyan)",
                  cursor: "pointer",
                  font: "inherit",
                  padding: 0,
                }}
              >
                Usar backup code
              </button>
            </>
          )}
        </p>
      </form>
    </AuthShell>
  );
}
