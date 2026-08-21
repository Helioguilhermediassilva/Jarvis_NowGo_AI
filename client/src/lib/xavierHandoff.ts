import type { Lang } from "@/landing/copy";

const DEFAULT_XAVIER_URL = "https://jarvisnowgo.com";
const XAVIER_URL = import.meta.env.VITE_XAVIER_URL || DEFAULT_XAVIER_URL;

/**
 * Builds a same-purpose, allowlisted handoff URL to Xavier.
 * No credentials or authentication tokens are placed in the URL.
 */
export function buildXavierLoginUrl(lang: Lang): string {
  const url = new URL("/login", XAVIER_URL);
  url.searchParams.set("locale", lang);
  url.searchParams.set("source", "nowgoai");
  return url.toString();
}

export function openXavierLogin(lang: Lang): void {
  window.location.assign(buildXavierLoginUrl(lang));
}

export function buildXavierStartUrl(lang: Lang): string {
  const url = new URL("/api/auth/v2/xavier/start", window.location.origin);
  url.searchParams.set("locale", lang);
  return url.toString();
}

/** Inicia o handoff somente para uma sessão V2 já autenticada no NowGo. */
export function openXavierHome(lang: Lang): void {
  window.location.assign(buildXavierStartUrl(lang));
}

export function buildXavierHomeUrl(lang: Lang): string {
  const url = new URL("/", XAVIER_URL);
  url.searchParams.set("locale", lang);
  url.searchParams.set("source", "nowgoai");
  return url.toString();
}
