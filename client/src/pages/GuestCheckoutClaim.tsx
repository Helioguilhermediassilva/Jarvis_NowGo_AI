import { useMemo, useState, type FormEvent } from "react";
import { Link, useLocation } from "wouter";
import AuthShell from "@/components/auth/AuthShell";
import { claimGuestBillingCheckout, type ApiError } from "@/lib/authV2Client";

const ERROR_LABELS: Record<string, string> = {
  guest_claim_invalid: "Este link de configuração não é válido. Solicite um novo link de acesso.",
  guest_claim_expired: "Este link de configuração expirou. Solicite um novo link de acesso.",
  weak_password: "Sua senha precisa ter pelo menos 12 caracteres, com maiúsculas, minúsculas, números e um símbolo.",
  http_error: "Não foi possível concluir a configuração. Tente novamente em instantes.",
};

export default function GuestCheckoutClaimPage() {
  const [, navigate] = useLocation();
  const token = useMemo(() => {
    if (typeof window === "undefined") return "";
    return new URLSearchParams(window.location.search).get("claim")?.trim() ?? "";
  }, []);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    if (!token) {
      setError(ERROR_LABELS.guest_claim_invalid);
      return;
    }
    if (password.length < 12) {
      setError(ERROR_LABELS.weak_password);
      return;
    }
    if (password !== confirm) {
      setError("As senhas não coincidem.");
      return;
    }

    setSubmitting(true);
    try {
      await claimGuestBillingCheckout({ token, password });
      navigate("/billing?checkout=success");
    } catch (rawError) {
      const err = rawError as ApiError;
      setError(ERROR_LABELS[err.code] ?? ERROR_LABELS.http_error);
    } finally {
      setSubmitting(false);
    }
  }

  if (!token) {
    return (
      <AuthShell
        tagline="PAGAMENTO RECEBIDO"
        title={
          <>
            Verifique seu <span className="accent">email</span>
          </>
        }
        subtitle="Recebemos seu pagamento. Enviamos um link seguro para o email informado no Checkout para você configurar a senha e acessar a plataforma."
        footer={
          <>
            <Link href="/">Voltar para a página inicial</Link>
          </>
        }
      >
        <div className="ng-auth-success" role="status">
          O link de configuração é válido por 24 horas. Se não encontrar a mensagem, verifique a pasta de spam.
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      tagline="PAGAMENTO CONFIRMADO · CONFIGURE SUA CONTA"
      title={
        <>
          Crie sua <span className="accent">senha de acesso</span>
        </>
      }
      subtitle="Seu pagamento foi confirmado. Defina uma senha para acessar a Plataforma de Inteligência Soberana."
      footer={
        <>
          <Link href="/">Voltar para a página inicial</Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate>
        {error && <div className="ng-auth-error" role="alert">{error}</div>}
        <label className="ng-auth-field">
          <span className="ng-auth-field-label">Nova senha</span>
          <input
            type="password"
            className="ng-auth-input"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Mínimo 12 caracteres"
            autoComplete="new-password"
            minLength={12}
            required
            disabled={submitting}
          />
        </label>
        <label className="ng-auth-field">
          <span className="ng-auth-field-label">Confirme a senha</span>
          <input
            type="password"
            className="ng-auth-input"
            value={confirm}
            onChange={(event) => setConfirm(event.target.value)}
            placeholder="Repita a senha"
            autoComplete="new-password"
            minLength={12}
            required
            disabled={submitting}
          />
        </label>
        <p className="ng-auth-help">
          Use pelo menos 12 caracteres, combinando maiúsculas, minúsculas, números e um símbolo. O MFA poderá ser habilitado depois, nas configurações de segurança.
        </p>
        <button type="submit" className="ng-auth-submit" disabled={submitting}>
          {submitting ? "Configurando…" : "Acessar plataforma"}
        </button>
      </form>
    </AuthShell>
  );
}

