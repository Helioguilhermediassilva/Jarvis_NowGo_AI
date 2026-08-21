import { randomBytes } from "node:crypto";
import type { ApiRequest, ApiResponse } from "../_shared.js";
import {
  callbackUri,
  firstQuery,
  getSocialProviderConfig,
  isSocialProvider,
  redirect,
  redirectWithError,
  safeReturnTo,
  safeSocialEntry,
  signSocialState,
} from "../_shared.js";

function validBillingOffer(value: unknown): string | undefined {
  return typeof value === "string" && /^[a-z0-9_]{1,80}$/.test(value) ? value : undefined;
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method && req.method !== "GET") {
    res.status(405).json({ error: "method_not_allowed" });
    return;
  }

  const provider = firstQuery(req.query?.provider);
  if (!isSocialProvider(provider)) {
    res.status(400).json({ error: "social_provider_invalid" });
    return;
  }

  const returnTo = safeReturnTo(firstQuery(req.query?.returnTo), "/");
  const billingOffer = validBillingOffer(firstQuery(req.query?.billingOffer));
  const entry = safeSocialEntry(firstQuery(req.query?.entry));

  try {
    const config = getSocialProviderConfig(provider);
    const nonce = randomBytes(24).toString("base64url");
    const state = await signSocialState(provider, returnTo, nonce, billingOffer, entry);
    const redirectUri = callbackUri(req);
    const params = new URLSearchParams({
      client_id: config.clientId,
      redirect_uri: redirectUri,
      response_type: "code",
      state,
    });

    if (provider === "google") {
      params.set("scope", "openid email profile");
      params.set("access_type", "online");
      params.set("prompt", "select_account");
      params.set("nonce", nonce);
    } else if (provider === "github") {
      params.set("scope", "read:user user:email");
    } else {
      params.set("scope", "openid profile email");
      params.set("nonce", nonce);
    }

    redirect(res, `${config.authorizationEndpoint}?${params.toString()}`);
  } catch (error: any) {
    console.error(`[/api/auth/v2/social/${provider}/start]`, error?.message);
    redirectWithError(req, res, returnTo, "social_provider_unconfigured", billingOffer, entry);
  }
}
