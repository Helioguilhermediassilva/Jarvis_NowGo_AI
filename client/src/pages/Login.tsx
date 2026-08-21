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

import { useEffect, useState, type FormEvent } from "react";
import { Link, useLocation } from "wouter";
import AuthShell from "@/components/auth/AuthShell";
import { useLang } from "@/landing/useLang";
import type { Lang } from "@/landing/copy";
import { buildXavierLoginUrl } from "@/lib/xavierHandoff";
import { loginV2, type ApiError } from "@/lib/authV2Client";
import { useAuthV2 } from "@/contexts/AuthV2Context";
import SocialLoginButtons from "@/components/auth/SocialLoginButtons";

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

const PENDING_BILLING_OFFER_KEY = "nowgo.pendingBillingOffer";
const PENDING_BILLING_RETURN_KEY = "nowgo.pendingBillingReturnTo";

const SOCIAL_ERROR_LABELS: Record<string, Record<Lang, string>> = {
  social_email_unverified: {
    pt: "O provedor não retornou um e-mail verificado. Escolha outro método de acesso.",
    en: "The provider did not return a verified email. Choose another sign-in method.",
    es: "El proveedor no devolvió un correo verificado. Elige otro método de acceso.",
  },
  social_authorization_denied: {
    pt: "O acesso social foi cancelado. Você pode tentar novamente ou usar e-mail e senha.",
    en: "Social sign-in was canceled. Try again or use email and password.",
    es: "El acceso social fue cancelado. Inténtalo de nuevo o usa correo y contraseña.",
  },
  social_state_invalid: {
    pt: "A sessão de acesso social expirou. Inicie o processo novamente.",
    en: "The social sign-in session expired. Start the process again.",
    es: "La sesión de acceso social expiró. Inicia el proceso nuevamente.",
  },
  social_callback_failed: {
    pt: "Não foi possível concluir o acesso social. Tente outro método.",
    en: "Social sign-in could not be completed. Try another method.",
    es: "No se pudo completar el acceso social. Prueba otro método.",
  },
  social_provider_unconfigured: {
    pt: "Este provedor ainda não está configurado. Tente Google ou e-mail e senha.",
    en: "This provider is not configured yet. Try Google or email and password.",
    es: "Este proveedor aún no está configurado. Prueba Google o correo y contraseña.",
  },
  social_callback_missing_parameters: {
    pt: "O retorno do provedor ficou incompleto. Inicie o acesso social novamente.",
    en: "The provider response was incomplete. Start social sign-in again.",
    es: "La respuesta del proveedor quedó incompleta. Inicia el acceso social nuevamente.",
  },
};

function isSafeBillingOffer(value: string | null): value is string {
  return Boolean(value && /^[a-z0-9_]{1,80}$/.test(value));
}

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
  const { authenticated, loading: authV2Loading, user: authV2User } = useAuthV2();
  const copy = LOGIN_COPY[lang];
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const authParams = new URLSearchParams(window.location.search);
  const requestedParam = authParams.get("returnTo");
  const requestedReturnTo = requestedParam && requestedParam.startsWith("/") && !requestedParam.startsWith("//")
    ? requestedParam
    : "/";
  const billingOffer = authParams.get("billingOffer");
  const socialError = authParams.get("socialError");
  const visibleError = error ?? SOCIAL_ERROR_LABELS[socialError ?? ""]?.[lang] ?? null;

  useEffect(() => {
    if (authV2Loading || !authenticated) return;
    if (!authV2User?.platformAccess) {
      const billingUrl = new URL("/billing", window.location.origin);
      billingUrl.searchParams.set("returnTo", requestedReturnTo);
      window.location.replace(billingUrl.toString());
      return;
    }
    const handoffUrl = new URL("/api/auth/v2/xavier/start", window.location.origin);
    handoffUrl.searchParams.set("locale", lang);
    window.location.replace(handoffUrl.toString());
  }, [authV2Loading, authenticated, authV2User, lang, requestedReturnTo]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const result = await loginV2({ email: email.trim().toLowerCase(), password });

      if (isSafeBillingOffer(billingOffer)) {
        // URL fallback complements sessionStorage for cross-navigation and MFA.
        sessionStorage.setItem(PENDING_BILLING_OFFER_KEY, billingOffer);
        if (requestedReturnTo !== "/") {
          sessionStorage.setItem(PENDING_BILLING_RETURN_KEY, requestedReturnTo);
        }
      }
      const billingReturnTo = sessionStorage.getItem(PENDING_BILLING_RETURN_KEY);
      const safeBillingReturnTo = billingReturnTo && billingReturnTo.startsWith("/") && !billingReturnTo.startsWith("//")
        ? billingReturnTo
        : null;

      if (result.kind === "session") {
        // O cookie V2 já foi gravado. Se o login veio de uma compra, prioriza
        // o destino salvo junto da oferta para a landing retomar o Checkout.
        window.location.href = safeBillingReturnTo ?? requestedReturnTo;
        return;
      }

      // O ticket MFA substitui temporariamente a sessão; guarde o destino para
      // que o desafio/configuração não descarte o Checkout pendente.
      sessionStorage.setItem("nowgo.mfaReturnTo", safeBillingReturnTo ?? requestedReturnTo);

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
        {visibleError && <div className="ng-auth-error" role="alert">{visibleError}</div>}
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
        <SocialLoginButtons
          lang={lang}
          returnTo={requestedReturnTo}
          billingOffer={billingOffer}
        />
      </form>
    </AuthShell>
  );
}
