/**
 * client/src/pages/AceitarConvite.tsx
 *
 * Tela /aceitar-convite/:token e /cadastro (sem token).
 *
 * Fluxo:
 *  1. Se a rota tem :token na URL → valida token via GET /api/auth/v2/invite/validate.
 *  2. Token válido → exibe formulário de senha (mín 12 chars).
 *  3. Submete via POST /api/auth/v2/invite/accept.
 *  4. Sucesso → orienta o usuário a verificar e-mail + redireciona para /login.
 *
 * Quando aberto sem :token (rota /cadastro), exibe campo "cole aqui seu token"
 * e mensagem orientando que o cadastro é por convite.
 */

import { useEffect, useState, type FormEvent } from "react";
import { Link, useLocation, useRoute } from "wouter";
import AuthShell from "@/components/auth/AuthShell";
import SocialLoginButtons from "@/components/auth/SocialLoginButtons";
import { useLang } from "@/landing/useLang";
import {
  acceptInviteV2,
  validateInviteV2,
  type ApiError,
  type InviteValidationResult,
} from "@/lib/authV2Client";

const ERROR_LABELS: Record<string, string> = {
  invalid_or_expired:
    "Este convite já não está mais válido. Solicite um novo ao administrador.",
  invitation_not_found:
    "Não localizamos esse convite. Confira se o link está completo ou solicite um novo.",
  invitation_expired:
    "Este convite expirou. Solicite um novo link ao administrador.",
  invitation_revoked:
    "Este convite foi revogado pelo administrador.",
  invitation_already_used:
    "Este convite já foi utilizado. Tente entrar com seu e-mail e senha.",
  weak_password:
    "Sua senha precisa ter pelo menos 12 caracteres, com maiúsculas, minúsculas, números e um caractere especial.",
  http_error:
    "Não foi possível concluir a operação. Tente novamente em instantes.",
};

function PasswordHint() {
  return (
    <p className="ng-auth-help">
      Use pelo menos 12 caracteres, combinando maiúsculas, minúsculas, números e
      um símbolo (!@#$ etc).
    </p>
  );
}

export default function AceitarConvitePage() {
  const [, navigate] = useLocation();
  const { lang } = useLang();
  const cadastroParams = new URLSearchParams(window.location.search);
  const requestedParam = cadastroParams.get("returnTo");
  const requestedReturnTo = requestedParam && requestedParam.startsWith("/") && !requestedParam.startsWith("//")
    ? requestedParam
    : "/";
  const billingOffer = cadastroParams.get("billingOffer");
  const [matchToken, paramsToken] = useRoute<{ token: string }>("/aceitar-convite/:token");
  const tokenFromUrl = matchToken && paramsToken ? paramsToken.token : null;

  const [tokenInput, setTokenInput] = useState(tokenFromUrl ?? "");
  const [validating, setValidating] = useState<boolean>(!!tokenFromUrl);
  const [validation, setValidation] = useState<InviteValidationResult | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (!tokenFromUrl) {
      setValidating(false);
      return;
    }
    void (async () => {
      try {
        const v = await validateInviteV2(tokenFromUrl);
        if (cancelled) return;
        if (!v.valid) {
          setValidationError(ERROR_LABELS.invalid_or_expired);
        } else {
          setValidation(v);
        }
      } catch (e) {
        if (cancelled) return;
        const err = e as ApiError;
        setValidationError(ERROR_LABELS[err.code] ?? ERROR_LABELS.http_error);
      } finally {
        if (!cancelled) setValidating(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [tokenFromUrl]);

  async function handleValidateToken(e: FormEvent) {
    e.preventDefault();
    if (!tokenInput.trim()) return;
    navigate(`/aceitar-convite/${encodeURIComponent(tokenInput.trim())}`);
  }

  async function handleAccept(e: FormEvent) {
    e.preventDefault();
    setSubmitError(null);

    if (password.length < 12) {
      setSubmitError(ERROR_LABELS.weak_password);
      return;
    }
    if (password !== passwordConfirm) {
      setSubmitError("As senhas não coincidem.");
      return;
    }

    setSubmitting(true);
    try {
      await acceptInviteV2({
        token: tokenFromUrl!,
        password,
        mode: "password",
        origin: window.location.origin,
      });
      setSuccess(
        "Cadastro concluído! Verifique seu e-mail para confirmar o endereço e depois faça login.",
      );
      setTimeout(() => navigate("/login"), 4000);
    } catch (e) {
      const err = e as ApiError;
      setSubmitError(ERROR_LABELS[err.code] ?? ERROR_LABELS.http_error);
    } finally {
      setSubmitting(false);
    }
  }

  // ─── Estado: sem token na URL → tela "cole aqui seu token" ───────────────
  if (!tokenFromUrl) {
    return (
      <AuthShell
        tagline="ACESSO · CADASTRO"
        title={
          <>
            O acesso ao cockpit é por <span className="accent">convite</span>
          </>
        }
        subtitle="Você recebeu um link com seu token? Cole-o abaixo. Se ainda não tem convite, fale com o administrador da sua organização."
        footer={
          <>
            Já tem conta? <Link href="/login">Entrar</Link>
          </>
        }
      >
        <form onSubmit={handleValidateToken} noValidate>
          <label className="ng-auth-field">
            <span className="ng-auth-field-label">Token de convite</span>
            <input
              type="text"
              className="ng-auth-input"
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              placeholder="Cole aqui o token recebido por e-mail"
              autoComplete="off"
              required
              minLength={8}
            />
          </label>
          <button type="submit" className="ng-auth-submit">
            Continuar
          </button>
          <p className="ng-auth-help">
            Para solicitar um convite, entre em contato com{" "}
            <a href="mailto:helio@nowgo.com.br" style={{ color: "var(--accent-cyan)" }}>
              helio@nowgo.com.br
            </a>
            .
          </p>
        </form>
        <SocialLoginButtons
          lang={lang}
          returnTo={requestedReturnTo}
          billingOffer={billingOffer}
        />
      </AuthShell>
    );
  }

  // ─── Estado: validando token ─────────────────────────────────────────────
  if (validating) {
    return (
      <AuthShell tagline="VALIDANDO" title="Verificando seu convite…">
        <p className="ng-auth-help" style={{ textAlign: "center", margin: 0 }}>
          Aguarde alguns segundos.
        </p>
      </AuthShell>
    );
  }

  // ─── Estado: token inválido ──────────────────────────────────────────────
  if (validationError || !validation || !validation.valid) {
    return (
      <AuthShell
        tagline="ACESSO · CADASTRO"
        title="Não foi possível usar este convite"
        subtitle={validationError ?? ERROR_LABELS.invalid_or_expired}
        footer={
          <>
            <Link href="/cadastro">Tentar com outro token</Link>
            {" · "}
            <Link href="/login">Voltar ao login</Link>
          </>
        }
      >
        <p className="ng-auth-help" style={{ textAlign: "center" }}>
          Para solicitar um novo convite, contate o administrador da sua organização.
        </p>
      </AuthShell>
    );
  }

  // ─── Estado: token válido → formulário de senha ──────────────────────────
  return (
    <AuthShell
      tagline="ACESSO · CADASTRO"
      title={
        <>
          Defina sua <span className="accent">senha de acesso</span>
        </>
      }
      subtitle={
        validation.email ? (
          <>
            Você foi convidado como <strong style={{ color: "var(--text-main)" }}>{validation.email}</strong>
            {validation.role ? (
              <>
                {" "}com perfil <strong style={{ color: "var(--text-main)" }}>{validation.role}</strong>
              </>
            ) : null}
            {validation.platformAccess !== undefined ? (
              <>
                {" "}e {validation.platformAccess ? "com acesso à Plataforma" : "sem acesso à Plataforma"}
              </>
            ) : null}
            .
          </>
        ) : (
          "Defina sua senha para concluir o cadastro."
        )
      }
      footer={
        <>
          Já é cadastrado? <Link href="/login">Entrar</Link>
        </>
      }
    >
      <form onSubmit={handleAccept} noValidate>
        {submitError && <div className="ng-auth-error" role="alert">{submitError}</div>}
        {success && <div className="ng-auth-success" role="status">{success}</div>}
        <label className="ng-auth-field">
          <span className="ng-auth-field-label">Senha</span>
          <input
            type="password"
            className="ng-auth-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mínimo 12 caracteres"
            autoComplete="new-password"
            required
            minLength={12}
            disabled={submitting || !!success}
          />
        </label>
        <label className="ng-auth-field">
          <span className="ng-auth-field-label">Confirme a senha</span>
          <input
            type="password"
            className="ng-auth-input"
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            placeholder="Repita a senha"
            autoComplete="new-password"
            required
            minLength={12}
            disabled={submitting || !!success}
          />
        </label>
        <PasswordHint />
        <button
          type="submit"
          className="ng-auth-submit"
          disabled={submitting || !!success}
          style={{ marginTop: "1rem" }}
        >
          {submitting ? "Concluindo cadastro…" : "Concluir cadastro"}
        </button>
      </form>
    </AuthShell>
  );
}
