/**
 * client/src/pages/RedefinirSenha.tsx
 *
 * Tela /redefinir-senha/:token. Consome POST /api/auth/v2/password/reset-confirm.
 *
 * Sucesso → backend revoga TODAS as sessões ativas (logout-everywhere)
 * e redireciona para /login com mensagem de sucesso.
 */

import { useMemo, useState, type FormEvent } from "react";
import { Link, useLocation, useRoute } from "wouter";
import AuthShell from "@/components/auth/AuthShell";
import { confirmPasswordResetV2, type ApiError } from "@/lib/authV2Client";

const ERROR_LABELS: Record<string, string> = {
  invalid_reset_token:
    "Este link de redefinição não é mais válido. Solicite um novo em /esqueci-senha.",
  invalid_or_expired:
    "Este link expirou ou já foi usado. Solicite um novo em /esqueci-senha.",
  weak_password:
    "Sua senha precisa ter pelo menos 12 caracteres, com maiúsculas, minúsculas, números e um caractere especial.",
  http_error:
    "Não foi possível concluir a operação. Tente novamente em instantes.",
};

export default function RedefinirSenhaPage() {
  const [, navigate] = useLocation();
  const [, params] = useRoute<{ token: string }>("/redefinir-senha/:token");
  const token = params?.token ?? null;

  // E-mail vem como query string ?email=... no link enviado por e-mail.
  // Fallback: campo manual abaixo, caso o link tenha sido encurtado/copy-paste.
  const initialEmail = useMemo(() => {
    if (typeof window === "undefined") return "";
    const sp = new URLSearchParams(window.location.search);
    return (sp.get("email") ?? "").trim().toLowerCase();
  }, []);

  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError("Token ausente. Use o link enviado por e-mail.");
      return;
    }
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !/.+@.+\..+/.test(cleanEmail)) {
      setError("Informe o e-mail associado a esta redefinição.");
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
      await confirmPasswordResetV2({ email: cleanEmail, token, password });
      setSuccess(true);
      setTimeout(() => navigate("/login"), 3000);
    } catch (e) {
      const err = e as ApiError;
      setError(ERROR_LABELS[err.code] ?? ERROR_LABELS.http_error);
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <AuthShell
        tagline="SENHA REDEFINIDA"
        title={
          <>
            Senha atualizada com <span className="accent">sucesso</span>
          </>
        }
        subtitle="Por segurança, todas as sessões ativas foram encerradas. Faça login novamente."
        footer={
          <>
            <Link href="/login">Ir para o login</Link>
          </>
        }
      >
        <div className="ng-auth-success" role="status">
          Redirecionando para a tela de login…
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      tagline="ACESSO · NOVA SENHA"
      title={
        <>
          Defina uma <span className="accent">nova senha</span>
        </>
      }
      subtitle="Após salvar, todas as suas outras sessões ativas serão encerradas."
      footer={
        <>
          <Link href="/login">Voltar ao login</Link>
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
            onChange={(ev) => setEmail(ev.target.value)}
            placeholder="voce@empresa.com.br"
            autoComplete="email"
            required
            disabled={submitting || !!initialEmail}
            readOnly={!!initialEmail}
          />
        </label>
        <label className="ng-auth-field">
          <span className="ng-auth-field-label">Nova senha</span>
          <input
            type="password"
            className="ng-auth-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mínimo 12 caracteres"
            autoComplete="new-password"
            required
            minLength={12}
            disabled={submitting}
          />
        </label>
        <label className="ng-auth-field">
          <span className="ng-auth-field-label">Confirme a nova senha</span>
          <input
            type="password"
            className="ng-auth-input"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Repita a senha"
            autoComplete="new-password"
            required
            minLength={12}
            disabled={submitting}
          />
        </label>
        <p className="ng-auth-help">
          Use ao menos 12 caracteres, com maiúsculas, minúsculas, números e um símbolo.
        </p>
        <button
          type="submit"
          className="ng-auth-submit"
          disabled={submitting}
          style={{ marginTop: "1rem" }}
        >
          {submitting ? "Salvando…" : "Salvar nova senha"}
        </button>
      </form>
    </AuthShell>
  );
}
