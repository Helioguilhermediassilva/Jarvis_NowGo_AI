import type { Lang } from "@/landing/copy";

interface SocialLoginButtonsProps {
  lang: Lang;
  returnTo?: string;
  billingOffer?: string | null;
  compact?: boolean;
}

const LABELS: Record<Lang, {
  divider: string;
  google: string;
  github: string;
  linkedin: string;
}> = {
  pt: {
    divider: "ou continue com",
    google: "Continuar com Google",
    github: "Continuar com GitHub",
    linkedin: "Continuar com LinkedIn",
  },
  en: {
    divider: "or continue with",
    google: "Continue with Google",
    github: "Continue with GitHub",
    linkedin: "Continue with LinkedIn",
  },
  es: {
    divider: "o continúa con",
    google: "Continuar con Google",
    github: "Continuar con GitHub",
    linkedin: "Continuar con LinkedIn",
  },
};

function safeReturnTo(value: string | undefined): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/";
  return value;
}

function socialHref(provider: string, returnTo: string, billingOffer?: string | null): string {
  const params = new URLSearchParams({ returnTo: safeReturnTo(returnTo) });
  if (billingOffer && /^[a-z0-9_]{1,80}$/.test(billingOffer)) {
    params.set("billingOffer", billingOffer);
  }
  return `/api/auth/v2/social/${provider}/start?${params.toString()}`;
}

export default function SocialLoginButtons({
  lang,
  returnTo = "/",
  billingOffer,
  compact = false,
}: SocialLoginButtonsProps) {
  const copy = LABELS[lang];
  const className = compact ? "ng-auth-social-button ng-auth-social-button-compact" : "ng-auth-social-button";
  return (
    <div className="ng-auth-social" aria-label={copy.divider}>
      <div className="ng-auth-social-divider"><span>{copy.divider}</span></div>
      <div className="ng-auth-social-grid">
        <a className={className} href={socialHref("google", returnTo, billingOffer)}>
          <span className="ng-auth-social-mark" aria-hidden="true">G</span>
          {copy.google}
        </a>
        <a className={className} href={socialHref("github", returnTo, billingOffer)}>
          <span className="ng-auth-social-mark" aria-hidden="true">GH</span>
          {copy.github}
        </a>
        <a className={className} href={socialHref("linkedin", returnTo, billingOffer)}>
          <span className="ng-auth-social-mark" aria-hidden="true">in</span>
          {copy.linkedin}
        </a>
      </div>
    </div>
  );
}
