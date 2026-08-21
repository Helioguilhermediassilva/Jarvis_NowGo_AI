import type { Lang } from "@/landing/copy";

interface SocialLoginButtonsProps {
  lang: Lang;
  returnTo?: string;
  billingOffer?: string | null;
  entry?: "login" | "signup";
  compact?: boolean;
}

const LABELS: Record<Lang, {
  divider: string;
  signupDivider: string;
  google: string;
  github: string;
  signupGoogle: string;
  signupGithub: string;
}> = {
  pt: {
    divider: "ou continue com",
    signupDivider: "ou cadastre-se com",
    google: "Continuar com Google",
    github: "Continuar com GitHub",
    signupGoogle: "Cadastrar com Google",
    signupGithub: "Cadastrar com GitHub",
  },
  en: {
    divider: "or continue with",
    signupDivider: "or sign up with",
    google: "Continue with Google",
    github: "Continue with GitHub",
    signupGoogle: "Sign up with Google",
    signupGithub: "Sign up with GitHub",
  },
  es: {
    divider: "o continúa con",
    signupDivider: "o regístrate con",
    google: "Continuar con Google",
    github: "Continuar con GitHub",
    signupGoogle: "Registrarse con Google",
    signupGithub: "Registrarse con GitHub",
  },
};

function safeReturnTo(value: string | undefined): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/";
  return value;
}

function socialHref(
  provider: string,
  returnTo: string,
  billingOffer: string | null | undefined,
  entry: "login" | "signup",
): string {
  const params = new URLSearchParams({ returnTo: safeReturnTo(returnTo), entry });
  if (billingOffer && /^[a-z0-9_]{1,80}$/.test(billingOffer)) {
    params.set("billingOffer", billingOffer);
  }
  return `/api/auth/v2/social/${provider}/start?${params.toString()}`;
}

export default function SocialLoginButtons({
  lang,
  returnTo = "/",
  billingOffer,
  entry = "login",
  compact = false,
}: SocialLoginButtonsProps) {
  const copy = LABELS[lang];
  const labels = entry === "signup"
    ? { google: copy.signupGoogle, github: copy.signupGithub }
    : { google: copy.google, github: copy.github };
  const divider = entry === "signup" ? copy.signupDivider : copy.divider;
  const className = compact ? "ng-auth-social-button ng-auth-social-button-compact" : "ng-auth-social-button";
  return (
    <div className="ng-auth-social" aria-label={divider}>
      <div className="ng-auth-social-divider"><span>{divider}</span></div>
      <div className="ng-auth-social-grid">
        <a className={className} href={socialHref("google", returnTo, billingOffer, entry)}>
          <span className="ng-auth-social-mark" aria-hidden="true">G</span>
          {labels.google}
        </a>
        <a className={className} href={socialHref("github", returnTo, billingOffer, entry)}>
          <span className="ng-auth-social-mark" aria-hidden="true">GH</span>
          {labels.github}
        </a>
      </div>
    </div>
  );
}
