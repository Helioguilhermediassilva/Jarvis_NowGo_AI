import { createRemoteJWKSet, jwtVerify } from "jose";
import type { SocialProvider, SocialProfile } from "../../../../server/auth/socialAuth.js";
import {
  getJson,
  getSocialProviderConfig,
  postForm,
  type SocialState,
} from "./_shared.js";

const GOOGLE_JWKS = createRemoteJWKSet(
  new URL("https://www.googleapis.com/oauth2/v3/certs"),
);
const LINKEDIN_JWKS = createRemoteJWKSet(
  new URL("https://www.linkedin.com/oauth/openid/jwks"),
);

interface GoogleClaims {
  iss?: string;
  aud?: string;
  sub?: string;
  email?: string;
  email_verified?: boolean;
  name?: string;
  picture?: string;
  nonce?: string;
}

interface LinkedInClaims {
  iss?: string;
  aud?: string;
  sub?: string;
  email?: string;
  email_verified?: boolean;
  name?: string;
  picture?: string;
  nonce?: string;
}

interface GitHubProfile {
  id?: number;
  login?: string;
  name?: string | null;
  avatar_url?: string | null;
}

interface GitHubEmail {
  email?: string;
  primary?: boolean;
  verified?: boolean;
}

function requireEmail(
  email: string | undefined,
  verified: boolean | undefined,
  requireVerified = false,
): string {
  const normalized = email?.trim().toLowerCase();
  if (!normalized || !normalized.includes("@") || verified === false || (requireVerified && verified !== true)) {
    throw new Error("O provedor não retornou um e-mail verificado.");
  }
  return normalized;
}

async function googleProfile(code: string, redirectUri: string, state: SocialState): Promise<SocialProfile> {
  const config = getSocialProviderConfig("google");
  const token = await postForm<{ id_token?: string }>(config.tokenEndpoint, {
    code,
    client_id: config.clientId,
    client_secret: config.clientSecret,
    redirect_uri: redirectUri,
    grant_type: "authorization_code",
  });
  if (!token.id_token) throw new Error("Google não retornou id_token.");

  const { payload } = await jwtVerify<GoogleClaims>(token.id_token, GOOGLE_JWKS, {
    issuer: ["https://accounts.google.com", "accounts.google.com"],
    audience: config.clientId,
  });
  if (payload.nonce !== state.nonce) throw new Error("Nonce Google inválido.");
  const email = requireEmail(payload.email, payload.email_verified, true);
  if (!payload.sub) throw new Error("Google não retornou subject.");
  return {
    providerUserId: payload.sub,
    email,
    name: payload.name ?? null,
    avatarUrl: payload.picture ?? null,
  };
}

async function githubProfile(code: string, redirectUri: string): Promise<SocialProfile> {
  const config = getSocialProviderConfig("github");
  const token = await postForm<{ access_token?: string; error?: string }>(config.tokenEndpoint, {
    code,
    client_id: config.clientId,
    client_secret: config.clientSecret,
    redirect_uri: redirectUri,
  });
  if (!token.access_token) throw new Error("GitHub não retornou access_token.");

  const profile = await getJson<GitHubProfile>("https://api.github.com/user", token.access_token, {
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "NowGo-AI",
  });
  const emails = await getJson<GitHubEmail[]>("https://api.github.com/user/emails", token.access_token, {
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "NowGo-AI",
  });
  const verified = emails.filter((item) => item.verified);
  const primary = verified.find((item) => item.primary) ?? verified[0];
  const email = requireEmail(primary?.email, primary?.verified, true);
  if (!profile.id) throw new Error("GitHub não retornou user id.");
  return {
    providerUserId: String(profile.id),
    email,
    name: profile.name ?? profile.login ?? null,
    avatarUrl: profile.avatar_url ?? null,
  };
}

async function linkedinProfile(code: string, redirectUri: string, state: SocialState): Promise<SocialProfile> {
  const config = getSocialProviderConfig("linkedin");
  const token = await postForm<{ access_token?: string; id_token?: string }>(config.tokenEndpoint, {
    code,
    client_id: config.clientId,
    client_secret: config.clientSecret,
    redirect_uri: redirectUri,
    grant_type: "authorization_code",
  });
  if (!token.access_token || !token.id_token) throw new Error("LinkedIn não retornou tokens OIDC.");

  const { payload } = await jwtVerify<LinkedInClaims>(token.id_token, LINKEDIN_JWKS, {
    issuer: "https://www.linkedin.com",
    audience: config.clientId,
  });
  if (payload.nonce !== state.nonce) throw new Error("Nonce LinkedIn inválido.");

  const userinfo = await getJson<LinkedInClaims>("https://api.linkedin.com/v2/userinfo", token.access_token);
  const email = requireEmail(userinfo.email ?? payload.email, userinfo.email_verified ?? payload.email_verified);
  const providerUserId = userinfo.sub ?? payload.sub;
  if (!providerUserId) throw new Error("LinkedIn não retornou subject.");
  return {
    providerUserId,
    email,
    name: userinfo.name ?? payload.name ?? null,
    avatarUrl: userinfo.picture ?? payload.picture ?? null,
  };
}

export async function fetchSocialProfile(
  provider: SocialProvider,
  code: string,
  redirectUri: string,
  state: SocialState,
): Promise<SocialProfile> {
  if (provider === "google") return googleProfile(code, redirectUri, state);
  if (provider === "github") return githubProfile(code, redirectUri);
  return linkedinProfile(code, redirectUri, state);
}
