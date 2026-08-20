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
import { useLang } from "@/landing/useLang";
import type { Lang } from "@/landing/copy";
import { buildXavierLoginUrl } from "@/lib/xavierHandoff";
import { loginV2, type ApiError } from "@/lib/authV2Client";

const LOGIN_COPY: Record<Lang, {
  tagline: string;
  titleLead: string;
  titleAccent: string;
  subtitle: string;
  noAccount: string;
  requestAccess: string;
  forgotPassword: string;
  submit: string;
  submitting: string;
  help: string;
  platform: string;
}> = {
  pt: {
    tagline: "ACESSO · LOGIN",
    titleLead: "Bem-vindo de volta ao",
    titleAccent: "cockpit NowGo",
    subtitle: "Entre com seu e-mail corporativo e senha para acessar o cockpit.",
    noAccount: "Não tem cadastro?",
    requestAccess: "Solicitar acesso",
    forgotPassword: "Esqueci minha senha",
    submit: "Entrar",
    submitting: "Entrando…",
    help: "Esta área é restrita aos times credenciados pelo administrador NowGo.",
    platform: "Abrir Plataforma",
  },
  en: {
    tagline: "ACCESS · LOGIN",
    titleLead: "Welcome back to the",
    titleAccent: "NowGo cockpit",
    subtitle: "Enter your corporate email and password to access the cockpit.",
    noAccount: "Do not have an account?",
    requestAccess: "Request access",
    forgotPassword: "Forgot my password",
    submit: "Log in",
    submitting: "Signing in…",
    help: "This area is restricted to teams authorized by the NowGo administrator.",
    platform: "Open Platform",
  },
  es: {
    tagline: "ACCESO · LOGIN",
    titleLead: "Bienvenido de nuevo al",
    titleAccent: "cockpit NowGo",
    subtitle: "Ingresa tu correo corporativo y contraseña para acceder al cockpit.",
    noAccount: "¿No tienes una cuenta?",
    requestAccess: "Solicitar acceso",
    forgotPassword: "Olvidé mi contraseña",
    submit: "Entrar",
    submitting: "Entrando…",
    help: "Esta área está restringida a equipos autorizados por el administrador de NowGo.",
    platform: "Abrir Plataforma",
  },
};

const ERROR_LABELS: Record<string, Record<Lang, string>> = {
  invalid_credentials: {
    pt: "E-mail ou senha incorretos.",
    en: "Incorrect email or password.",
    es: "Correo o contraseña incorrectos.",
  },
  email_not_verified: {
    pt: "Você precisa verificar seu e-mail antes de entrar. Confira sua caixa de entrada.",
    en: "You must verify your email before signing in. Check your inbox.",
    es: "Debes verificar tu correo antes de entrar. Revisa tu bandeja de entrada.",
  },
  password_not_set: {
    pt: "Esta conta foi criada por convite e ainda não tem senha definida. Use o link recebido por e-mail para concluir o cadastro.",
    en: "This account was created by invitation and does not have a password yet. Use the email link to finish setup.",
    es: "Esta cuenta fue creada por invitación y aún no tiene contraseña. Usa el enlace recibido por correo para completar el registro.",
  },
  rate_limited: {
    pt: "Muitas tentativas em pouco tempo. Aguarde alguns minutos e tente novamente.",
    en: "Too many attempts in a short period. Wait a few minutes and try again.",
    es: "Demasiados intentos en poco tiempo. Espera unos minutos y vuelve a intentarlo.",
  },
  http_error: {
    pt: "Não foi possível concluir a requisição. Tente novamente.",
    en: "The request could not be completed. Try again.",
    es: "No se pudo completar la solicitud. Inténtalo de nuevo.",
  },
};

export default function LoginPage() {
  const [, navigate] = useLocation();
  const { lang } = useLang();
  const copy = LOGIN_COPY[lang];
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
        // O cookie V2 já foi gravado. Só retorna a destinos internos seguros;
        // o acesso ao cockpit aparece depois no menu apenas para superadmin.
        const requested = new URLSearchParams(window.location.search).get("returnTo");
        const returnTo = requested && requested.startsWith("/") && !requested.startsWith("//")
          ? requested
          : "/";
        window.location.href = returnTo;
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
      setError(ERROR_LABELS[err.code]?.[lang] ?? ERROR_LABELS.http_error[lang]);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthShell
      tagline={copy.tagline}
      title={
        <>
          {copy.titleLead} <span className="accent">{copy.titleAccent}</span>
        </>
      }
      subtitle={copy.subtitle}
      footer={
        <>
          {copy.noAccount} <Link href="/cadastro">{copy.requestAccess}</Link>
          <br />
          <Link href="/esqueci-senha">{copy.forgotPassword}</Link>
          <br />
          <a href={buildXavierLoginUrl(lang)}>{copy.platform}</a>
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
          {submitting ? copy.submitting : copy.submit}
        </button>
        <p className="ng-auth-help">
          {copy.help}
        </p>
      </form>
    </AuthShell>
  );
}
