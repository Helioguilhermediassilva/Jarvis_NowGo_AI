import type { SocialProvider } from "../../../../../server/auth/socialAuth.js";
import { provisionSocialLogin } from "../../../../../server/auth/socialAuth.js";
import { fetchSocialProfile } from "../providers.js";
import type { ApiRequest, ApiResponse } from "../_shared.js";
import {
  callbackUri,
  firstQuery,
  isSocialProvider,
  completeSocialSession,
  redirectWithError,
  requestOrigin,
  verifySocialState,
} from "../_shared.js";

function errorCode(error: unknown): string {
  const message = error instanceof Error ? error.message.toLowerCase() : "";
  if (message.includes("e-mail") || message.includes("email")) return "social_email_unverified";
  if (message.includes("state") || message.includes("nonce") || message.includes("token")) return "social_state_invalid";
  if (message.includes("credenciais") || message.includes("unconfigured")) return "social_provider_unconfigured";
  return "social_callback_failed";
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

  const code = firstQuery(req.query?.code);
  const rawState = firstQuery(req.query?.state);
  const providerError = firstQuery(req.query?.error);
  if (providerError && rawState) {
    try {
      const canceledState = await verifySocialState(rawState, provider as SocialProvider);
      redirectWithError(
        req,
        res,
        canceledState.returnTo,
        "social_authorization_denied",
        canceledState.billingOffer,
      );
    } catch {
      res.status(400).json({ error: "social_authorization_denied" });
    }
    return;
  }
  if (providerError) {
    res.status(400).json({ error: "social_authorization_denied" });
    return;
  }
  if (!code || !rawState) {
    res.status(400).json({ error: "social_callback_missing_parameters" });
    return;
  }

  let state: Awaited<ReturnType<typeof verifySocialState>>;
  try {
    state = await verifySocialState(rawState, provider as SocialProvider);
  } catch (error) {
    console.error(`[/api/auth/v2/social/${provider}/callback] state inválido`, error);
    redirectWithError(req, res, "/", "social_state_invalid");
    return;
  }

  try {
    const profile = await fetchSocialProfile(
      provider,
      code,
      callbackUri(req),
      state,
    );
    const provisioned = await provisionSocialLogin(provider, profile, req);
    await completeSocialSession(
      req,
      res,
      provisioned.userId,
      provisioned.tenantId,
      state.returnTo,
      state.billingOffer,
    );
  } catch (error: any) {
    console.error(`[/api/auth/v2/social/${provider}/callback]`, error?.message);
    redirectWithError(
      req,
      res,
      state.returnTo,
      errorCode(error),
      state.billingOffer,
    );
  }
}
