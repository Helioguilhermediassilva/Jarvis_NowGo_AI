/**
 * client/src/lib/authV2Client.ts
 *
 * Cliente HTTP centralizado para os endpoints /api/auth/v2/* da F47.
 *
 * Responsabilidades:
 *  - Centralizar fetch com `credentials: "include"` (cookie nowgo_session_v2 HttpOnly).
 *  - Mapear códigos de erro tipados retornados pelo handlerFactory do servidor.
 *  - Manter este módulo puramente declarativo (sem React) para ser testável.
 *
 * Não altera os hooks/endpoints da V1. V1 usa /api/auth/me (cookie nowgo_session)
 * e continua funcionando em paralelo.
 */

export type AuthV2Role = "superadmin" | "owner" | "admin" | "manager" | "operator" | "viewer";

export interface AuthV2User {
  userId: string;
  email: string;
  role: AuthV2Role;
  tenantId: string;
  tenantSlug: string;
  platformAccess: boolean;
  mfaEnabled: boolean;
}

export interface ApiError {
  status: number;
  code: string;
  message?: string;
}

async function request<T>(input: string, init: RequestInit = {}): Promise<T> {
  const r = await fetch(input, {
    ...init,
    credentials: "include",
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
  });
  let body: unknown = null;
  const text = await r.text();
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = { raw: text };
    }
  }
  if (!r.ok) {
    const code =
      (body && typeof body === "object" && "error" in body && typeof (body as { error: unknown }).error === "string"
        ? ((body as { error: string }).error)
        : "http_error");
    const message =
      body && typeof body === "object" && "message" in body && typeof (body as { message: unknown }).message === "string"
        ? ((body as { message: string }).message)
        : undefined;
    const err: ApiError = { status: r.status, code, message };
    throw err;
  }
  return body as T;
}

// ─────────────────────────────────────────────────────────────────────────────
// /api/auth/v2/me
// ─────────────────────────────────────────────────────────────────────────────

export async function fetchMeV2(): Promise<AuthV2User | null> {
  try {
    const j = await request<AuthV2User>("/api/auth/v2/me", { method: "GET" });
    return j;
  } catch (e) {
    const err = e as ApiError;
    if (err.status === 401) return null;
    throw e;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// /api/auth/v2/login → pode resultar em sessão direta ou mfaTicket
// ─────────────────────────────────────────────────────────────────────────────

export interface LoginInput {
  email: string;
  password: string;
}

export type LoginResult =
  | { kind: "session"; user: AuthV2User }
  | { kind: "mfa_required"; mfaTicket: string; intent: "challenge" }
  | { kind: "mfa_setup_required"; mfaTicket: string; intent: "setup" };

/**
 * Contrato real retornado por POST /api/auth/v2/login (status 200):
 *  - Sessão emitida (cookie nowgo_session_v2 setado pelo backend):
 *      { ok: true; userId; tenantId; requiresMfa: false; requiresMfaSetup: false }
 *  - MFA exigido (usuário já tem TOTP cadastrado):
 *      { ok: false; requiresMfa: true; requiresMfaSetup: false; mfaTicket }
 *  - MFA requer cadastro inicial (role superadmin/owner/admin sem TOTP):
 *      { ok: false; requiresMfa: false; requiresMfaSetup: true; mfaTicket }
 */
interface LoginSessionResponse {
  ok: true;
  userId: string;
  tenantId: string;
  requiresMfa: false;
  requiresMfaSetup: false;
}
interface LoginMfaRequiredResponse {
  ok: false;
  requiresMfa: true;
  requiresMfaSetup: false;
  mfaTicket: string;
}
interface LoginMfaSetupResponse {
  ok: false;
  requiresMfa: false;
  requiresMfaSetup: true;
  mfaTicket: string;
}
type LoginRawResponse =
  | LoginSessionResponse
  | LoginMfaRequiredResponse
  | LoginMfaSetupResponse;

export async function loginV2(input: LoginInput): Promise<LoginResult> {
  const j = await request<LoginRawResponse>("/api/auth/v2/login", {
    method: "POST",
    body: JSON.stringify(input),
  });

  if (j.requiresMfaSetup) {
    return {
      kind: "mfa_setup_required",
      mfaTicket: j.mfaTicket,
      intent: "setup",
    };
  }
  if (j.requiresMfa) {
    return {
      kind: "mfa_required",
      mfaTicket: j.mfaTicket,
      intent: "challenge",
    };
  }

  // Sessão emitida diretamente: o backend setou o cookie HttpOnly
  // nowgo_session_v2; carregamos os dados completos via /api/auth/v2/me.
  const me = await fetchMeV2();
  if (!me) {
    const err: ApiError = {
      status: 500,
      code: "session_load_failed",
      message: "login bem-sucedido porém sessão não pode ser carregada",
    };
    throw err;
  }
  return { kind: "session", user: me };
}

// ─────────────────────────────────────────────────────────────────────────────
// /api/auth/v2/login/mfa
// ─────────────────────────────────────────────────────────────────────────────

export interface LoginMfaInput {
  mfaTicket: string;
  code: string; // TOTP 6 dígitos OU backup code
  method?: "totp" | "backup";
}

export async function loginMfaV2(input: LoginMfaInput): Promise<AuthV2User> {
  // Servidor (api/auth/v2/login/mfa.ts) aceita { ticket, code } para TOTP ou
  // { ticket, backupCode } para backup — não aceita campo "method" nem "mfaTicket".
  const body =
    input.method === "backup"
      ? { ticket: input.mfaTicket, backupCode: input.code }
      : { ticket: input.mfaTicket, code: input.code };
  await request<{ ok: true; userId: string; tenantId: string }>(
    "/api/auth/v2/login/mfa",
    {
      method: "POST",
      body: JSON.stringify(body),
    },
  );
  // Servidor não devolve "user"; carregamos via /me que agora tem cookie ativo.
  const me = await fetchMeV2();
  if (!me) {
    const err: ApiError = {
      status: 500,
      code: "unknown_error",
      message: "MFA confirmado, mas a sessão não pode ser carregada",
    };
    throw err;
  }
  return me;
}

// ─────────────────────────────────────────────────────────────────────────────
// /api/auth/v2/logout
// ─────────────────────────────────────────────────────────────────────────────

export async function logoutV2(): Promise<void> {
  await request<{ ok: true }>("/api/auth/v2/logout", { method: "POST", body: "{}" });
}

// ─────────────────────────────────────────────────────────────────────────────
// /api/auth/v2/invite/validate
// ─────────────────────────────────────────────────────────────────────────────

export interface InviteValidationResult {
  valid: boolean;
  email?: string;
  tenantSlug?: string;
  role?: AuthV2Role;
  platformAccess?: boolean;
}

export async function validateInviteV2(token: string): Promise<InviteValidationResult> {
  const j = await request<InviteValidationResult>(
    `/api/auth/v2/invite/validate?token=${encodeURIComponent(token)}`,
    { method: "GET" },
  );
  return j;
}

// ─────────────────────────────────────────────────────────────────────────────
// /api/auth/v2/invite/accept
// ─────────────────────────────────────────────────────────────────────────────

export interface AcceptInviteInput {
  token: string;
  password: string;
  mode?: "password" | "google";
  origin: string;
}

export async function acceptInviteV2(input: AcceptInviteInput): Promise<{
  ok: true;
  emailVerificationSent: boolean;
  platformAccess: boolean;
}> {
  return request<{
    ok: true;
    emailVerificationSent: boolean;
    platformAccess: boolean;
  }>("/api/auth/v2/invite/accept", {
    method: "POST",
    body: JSON.stringify({ mode: "password", ...input }),
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// /api/auth/v2/invite/create
// ─────────────────────────────────────────────────────────────────────────────

export interface CreateInviteInput {
  email: string;
  tenantId: string;
  role: AuthV2Role;
  platformAccess: boolean;
  origin: string;
}

export async function createInviteV2(input: CreateInviteInput): Promise<{ ok: true; invitationId: string }> {
  return request<{ ok: true; invitationId: string }>("/api/auth/v2/invite/create", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// /api/auth/v2/members — perfis e permissão de acesso à Plataforma
// ─────────────────────────────────────────────────────────────────────────────

export interface MemberProfileV2 {
  memberId: string;
  userId: string;
  email: string;
  name: string | null;
  role: string;
  platformAccess: boolean;
}

export async function listMembersV2(): Promise<MemberProfileV2[]> {
  const result = await request<{ ok: true; members: MemberProfileV2[] }>(
    "/api/auth/v2/members",
    { method: "GET" },
  );
  return result.members;
}

export async function updateMemberPlatformAccessV2(
  memberId: string,
  platformAccess: boolean,
): Promise<MemberProfileV2> {
  const result = await request<{ ok: true; member: MemberProfileV2 }>(
    "/api/auth/v2/members",
    {
      method: "PATCH",
      body: JSON.stringify({ memberId, platformAccess }),
    },
  );
  return result.member;
}

// ─────────────────────────────────────────────────────────────────────────────
// /api/auth/v2/email/verify
// ─────────────────────────────────────────────────────────────────────────────

export async function verifyEmailV2(token: string): Promise<{ ok: true }> {
  return request<{ ok: true }>("/api/auth/v2/email/verify", {
    method: "POST",
    body: JSON.stringify({ token }),
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// /api/auth/v2/password/reset-request
// ─────────────────────────────────────────────────────────────────────────────

export async function passwordResetRequestV2(email: string, origin: string): Promise<{ ok: true }> {
  return request<{ ok: true }>("/api/auth/v2/password/reset-request", {
    method: "POST",
    body: JSON.stringify({ email, origin }),
  });
}

// Alias com payload em objeto, usado pelas telas /esqueci-senha.
export async function requestPasswordResetV2(input: {
  email: string;
  origin: string;
}): Promise<{ ok: true }> {
  return passwordResetRequestV2(input.email, input.origin);
}

// ─────────────────────────────────────────────────────────────────────────────
// /api/auth/v2/password/reset-confirm
// ─────────────────────────────────────────────────────────────────────────────

export async function passwordResetConfirmV2(
  email: string,
  token: string,
  newPassword: string,
): Promise<{ ok: true }> {
  return request<{ ok: true }>("/api/auth/v2/password/reset-confirm", {
    method: "POST",
    body: JSON.stringify({ email, token, newPassword }),
  });
}

// Alias com payload em objeto, usado pelas telas /redefinir-senha.
export async function confirmPasswordResetV2(input: {
  email: string;
  token: string;
  password: string;
}): Promise<{ ok: true }> {
  return passwordResetConfirmV2(input.email, input.token, input.password);
}

// ─────────────────────────────────────────────────────────────────────────────
// /api/auth/v2/mfa/setup-init
// ─────────────────────────────────────────────────────────────────────────────

export interface MfaSetupInitResult {
  ok: true;
  secret: string;
  otpauthUri: string;
  qrCodeDataUrl: string;
  backupCodes: string[];
}

export async function mfaSetupInitV2(
  input?: { mfaTicket?: string } | string,
): Promise<MfaSetupInitResult> {
  const ticket =
    typeof input === "string" ? input : input?.mfaTicket;
  return request<MfaSetupInitResult>("/api/auth/v2/mfa/setup-init", {
    method: "POST",
    body: JSON.stringify(ticket ? { mfaTicket: ticket } : {}),
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// /api/auth/v2/mfa/setup-confirm
// ─────────────────────────────────────────────────────────────────────────────

export async function mfaSetupConfirmV2(input: {
  code: string;
  mfaTicket?: string;
}): Promise<{ ok: true; user: AuthV2User; backupCodes: string[] }> {
  return request<{ ok: true; user: AuthV2User; backupCodes: string[] }>(
    "/api/auth/v2/mfa/setup-confirm",
    {
      method: "POST",
      body: JSON.stringify(input),
    },
  );
}


// ─────────────────────────────────────────────────────────────────────────────
// Billing da Plataforma de Inteligência Soberana
// ─────────────────────────────────────────────────────────────────────────────

export interface BillingCheckoutResponse {
  ok: true;
  sessionId: string;
  url: string;
}

export interface BillingSummary {
  ok: true;
  subscription: {
    planCode: string;
    status: string;
    currentPeriodEnd: string | null;
    cancelAtPeriodEnd: boolean;
  } | null;
  creditBalance: number;
}

export async function createBillingCheckoutSession(offerCode: string): Promise<BillingCheckoutResponse> {
  return request<BillingCheckoutResponse>("/api/billing/checkout", {
    method: "POST",
    body: JSON.stringify({ offerCode }),
  });
}

export async function createBillingPortalSession(): Promise<{ ok: true; url: string }> {
  return request<{ ok: true; url: string }>("/api/billing/portal", {
    method: "POST",
    body: JSON.stringify({}),
  });
}

export async function fetchBillingSummary(): Promise<BillingSummary> {
  return request<BillingSummary>("/api/billing/summary", { method: "GET" });
}
