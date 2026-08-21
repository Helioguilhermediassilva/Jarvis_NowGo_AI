/**
 * server/http/handlerFactory.ts
 *
 * Factory para Vercel API Routes da F47. Centraliza:
 *   • Allowlist de métodos HTTP
 *   • Parse + validação Zod do body/query
 *   • Mapeamento de classes de erro tipadas (InvitationError, MfaError,
 *     PasswordError, SessionError, EmailDeliveryError) → HTTP status
 *   • Cabeçalhos seguros default (Cache-Control no-store, Content-Type JSON)
 *   • Log estruturado de erro (sem PII sensível)
 *
 * Coexiste com os handlers atuais do projeto sem interferir. Apenas novos
 * endpoints F47 (sob /api/cockpit/* e /api/auth/v2/*) usam este factory.
 */
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { ZodError, type ZodSchema } from "zod";

import { InvitationError } from "../auth/invitations.js";
import { MfaError } from "../auth/mfaTotp.js";
import { PasswordError } from "../auth/passwordCredentials.js";
import { SessionError } from "../auth/sessions.js";
import { EmailDeliveryError } from "../email/resendClient.js";
import { BillingError } from "../billing/errors.js";

// ---------------------------------------------------------------------------
// Tipos públicos
// ---------------------------------------------------------------------------

export type HttpMethod = "GET" | "POST" | "PATCH" | "PUT" | "DELETE";

export interface HandlerContext<TInput> {
  req: VercelRequest;
  res: VercelResponse;
  /** Body/query validados pelo schema. */
  input: TInput;
  /** IP do cliente (usado por rate limit e auditoria). */
  clientIp: string;
}

export interface HandlerOptions<TInput, TOutput> {
  methods: ReadonlyArray<HttpMethod>;
  /** Schema Zod aplicado ao body (POST/PATCH/PUT/DELETE) ou query (GET). */
  schema?: ZodSchema<TInput>;
  /** Tag livre para logs estruturados. */
  tag?: string;
  /** Implementação do handler. Pode lançar classes de erro tipadas. */
  handler: (ctx: HandlerContext<TInput>) => Promise<TOutput> | TOutput;
}

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

export function createApiHandler<TInput, TOutput>(
  opts: HandlerOptions<TInput, TOutput>,
): (req: VercelRequest, res: VercelResponse) => Promise<void> {
  const allowed = new Set<string>(opts.methods);
  return async function vercelHandler(
    req: VercelRequest,
    res: VercelResponse,
  ): Promise<void> {
    res.setHeader("Cache-Control", "no-store");

    // 1) Allowlist de métodos
    const method = (req.method ?? "GET").toUpperCase();
    if (!allowed.has(method)) {
      res.setHeader("Allow", Array.from(allowed).join(", "));
      res.status(405).json({ error: "method_not_allowed" });
      return;
    }

    // 2) Parse de input via Zod (se fornecido)
    let input: TInput;
    if (opts.schema) {
      const raw = method === "GET" ? req.query : req.body;
      const parsed = opts.schema.safeParse(raw);
      if (!parsed.success) {
        const issues = (parsed.error as ZodError).issues.map((e) => ({
          path: e.path.join("."),
          code: e.code,
          message: e.message,
        }));
        res.status(400).json({ error: "validation_failed", issues });
        return;
      }
      input = parsed.data;
    } else {
      input = (method === "GET" ? req.query : req.body) as TInput;
    }

    // 3) Resolver IP do cliente
    const clientIp = pickClientIp(req);

    // 4) Executar handler com tratamento de erro
    try {
      const result = await opts.handler({ req, res, input, clientIp });
      if (!res.headersSent) {
        res.status(200).json(result);
      }
    } catch (err) {
      handleError(res, err, opts.tag ?? "api");
    }
  };
}

// ---------------------------------------------------------------------------
// Erros → HTTP
// ---------------------------------------------------------------------------

const ERR_STATUS_MAP: Record<string, number> = {
  // InvitationError
  invalid_email: 400,
  invalid_role: 400,
  invalid_ttl: 400,
  invalid_token: 401,
  expired: 410,
  revoked: 410,
  already_used: 409,
  // PasswordError
  weak_password: 400,
  email_not_verified: 403,
  invalid_credentials: 401,
  account_locked: 423,
  // MfaError
  invalid_code: 401,
  missing_encryption_key: 500,
  mfa_not_enrolled: 412,
  // SessionError
  invalid_session: 401,
  expired_session: 401,
  revoked_session: 401,
  // EmailDeliveryError
  missing_to: 400,
  missing_subject: 400,
  missing_body: 400,
  provider_error: 502,
  // BillingError
  offer_invalid: 400,
  platform_access_required: 403,
  billing_not_configured: 500,
  billing_customer_missing: 404,
  stripe_provider_error: 502,
  guest_email_invalid: 400,
  guest_claim_invalid: 401,
  guest_claim_expired: 410,
  guest_account_exists: 409,
  // genérico
  internal_error: 500,
};

function isTypedError(
  err: unknown,
): err is
  | InvitationError
  | MfaError
  | PasswordError
  | SessionError
  | EmailDeliveryError
  | BillingError {
  return (
    err instanceof InvitationError ||
    err instanceof MfaError ||
    err instanceof PasswordError ||
    err instanceof SessionError ||
    err instanceof EmailDeliveryError ||
    err instanceof BillingError
  );
}

function handleError(res: VercelResponse, err: unknown, tag: string): void {
  if (isTypedError(err)) {
    const status = ERR_STATUS_MAP[err.code] ?? 500;
    if (!res.headersSent) {
      res.status(status).json({ error: err.code });
    }
    if (status >= 500) {
      // eslint-disable-next-line no-console
      console.error(
        JSON.stringify({
          tag,
          code: err.code,
          name: err.name,
          message: err.message,
        }),
      );
    }
    return;
  }
  const message = err instanceof Error ? err.message : String(err);
  // eslint-disable-next-line no-console
  console.error(JSON.stringify({ tag, code: "unhandled", message }));
  if (!res.headersSent) {
    res.status(500).json({ error: "internal_error" });
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export function pickClientIp(req: VercelRequest): string {
  // Vercel popula x-forwarded-for. Pega o primeiro IP da cadeia.
  const fwd = req.headers["x-forwarded-for"];
  if (typeof fwd === "string" && fwd.length > 0) {
    return fwd.split(",")[0].trim();
  }
  if (Array.isArray(fwd) && fwd.length > 0) {
    return fwd[0].split(",")[0].trim();
  }
  const real = req.headers["x-real-ip"];
  if (typeof real === "string") return real;
  return req.socket?.remoteAddress ?? "unknown";
}

/** Helpers para testes. */
export const _internal = {
  ERR_STATUS_MAP,
  isTypedError,
  handleError,
};
