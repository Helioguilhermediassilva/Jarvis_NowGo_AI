import { describe, it, expect, vi } from "vitest";
import { z } from "zod";

import {
  createApiHandler,
  pickClientIp,
  _internal,
} from "./handlerFactory.js";
import { InvitationError } from "../auth/invitations.js";
import { MfaError } from "../auth/mfaTotp.js";
import { PasswordError } from "../auth/passwordCredentials.js";
import { SessionError } from "../auth/sessions.js";
import { EmailDeliveryError } from "../email/resendClient.js";

// Mock helpers para Vercel req/res
function mockReq(overrides: Partial<any> = {}): any {
  return {
    method: "GET",
    headers: {},
    query: {},
    body: undefined,
    socket: { remoteAddress: "10.0.0.1" },
    ...overrides,
  };
}

function mockRes(): any {
  const headers: Record<string, string | string[]> = {};
  let statusCode = 200;
  let payload: unknown = undefined;
  const res = {
    headersSent: false,
    statusCode,
    setHeader: vi.fn((k: string, v: string | string[]) => {
      headers[k] = v;
    }),
    status(code: number) {
      statusCode = code;
      this.statusCode = code;
      return this;
    },
    json(p: unknown) {
      payload = p;
      this.headersSent = true;
      return this;
    },
    _payload: () => payload,
    _headers: () => headers,
    _status: () => statusCode,
  };
  return res;
}

// ============================================================================
// Allowlist
// ============================================================================
describe("handlerFactory: allowlist HTTP", () => {
  it("aceita método permitido", async () => {
    const handler = createApiHandler({
      methods: ["POST"],
      handler: () => ({ ok: true }),
    });
    const req = mockReq({ method: "POST" });
    const res = mockRes();
    await handler(req, res);
    expect(res._status()).toBe(200);
    expect(res._payload()).toEqual({ ok: true });
  });

  it("rejeita método não permitido com 405 e header Allow", async () => {
    const handler = createApiHandler({
      methods: ["GET"],
      handler: () => ({ ok: true }),
    });
    const req = mockReq({ method: "POST" });
    const res = mockRes();
    await handler(req, res);
    expect(res._status()).toBe(405);
    expect(res._payload()).toEqual({ error: "method_not_allowed" });
    expect(res._headers()["Allow"]).toBe("GET");
  });

  it("normaliza método para uppercase", async () => {
    const handler = createApiHandler({
      methods: ["GET"],
      handler: () => ({ ok: true }),
    });
    const req = mockReq({ method: "get" });
    const res = mockRes();
    await handler(req, res);
    expect(res._status()).toBe(200);
  });
});

// ============================================================================
// Zod validation
// ============================================================================
describe("handlerFactory: validação Zod", () => {
  const schema = z.object({ name: z.string().min(1), age: z.number().int() });

  it("valida body em POST", async () => {
    const handler = createApiHandler({
      methods: ["POST"],
      schema,
      handler: ({ input }) => ({ received: input }),
    });
    const req = mockReq({ method: "POST", body: { name: "X", age: 30 } });
    const res = mockRes();
    await handler(req, res);
    expect(res._status()).toBe(200);
    expect(res._payload()).toEqual({ received: { name: "X", age: 30 } });
  });

  it("valida query em GET", async () => {
    const handler = createApiHandler({
      methods: ["GET"],
      schema: z.object({ q: z.string() }),
      handler: ({ input }) => ({ q: input.q }),
    });
    const req = mockReq({ method: "GET", query: { q: "hello" } });
    const res = mockRes();
    await handler(req, res);
    expect(res._payload()).toEqual({ q: "hello" });
  });

  it("retorna 400 quando schema falha", async () => {
    const handler = createApiHandler({
      methods: ["POST"],
      schema,
      handler: () => ({ ok: true }),
    });
    const req = mockReq({ method: "POST", body: { name: "", age: "lol" } });
    const res = mockRes();
    await handler(req, res);
    expect(res._status()).toBe(400);
    const payload = res._payload() as any;
    expect(payload.error).toBe("validation_failed");
    expect(payload.issues.length).toBeGreaterThan(0);
  });
});

// ============================================================================
// Error mapping
// ============================================================================
describe("handlerFactory: mapeamento de erros tipados", () => {
  it.each([
    [new InvitationError("expired"), 410],
    [new InvitationError("invalid_token"), 401],
    [new InvitationError("revoked"), 410],
    [new InvitationError("already_used"), 409],
    [new InvitationError("invalid_email"), 400],
    [new SessionError("invalid_session"), 401],
    [new SessionError("expired_session"), 401],
    [new SessionError("revoked_session"), 401],
    [new MfaError("invalid_code"), 401],
    [new MfaError("missing_encryption_key"), 500],
    [new PasswordError("invalid_credentials"), 401],
    [new PasswordError("account_locked"), 423],
    [new PasswordError("weak_password"), 400],
    [new EmailDeliveryError("provider_error"), 502],
  ])("%s → status %d", async (err, expectedStatus) => {
    const handler = createApiHandler({
      methods: ["POST"],
      handler: () => {
        throw err;
      },
    });
    const req = mockReq({ method: "POST" });
    const res = mockRes();
    await handler(req, res);
    expect(res._status()).toBe(expectedStatus);
    const payload = res._payload() as any;
    expect(payload.error).toBe((err as any).code);
  });

  it("erro genérico vira 500 internal_error", async () => {
    const handler = createApiHandler({
      methods: ["POST"],
      handler: () => {
        throw new Error("boom");
      },
    });
    const req = mockReq({ method: "POST" });
    const res = mockRes();
    await handler(req, res);
    expect(res._status()).toBe(500);
    expect(res._payload()).toEqual({ error: "internal_error" });
  });
});

// ============================================================================
// pickClientIp
// ============================================================================
describe("pickClientIp: extração de IP", () => {
  it("usa primeiro IP de x-forwarded-for", () => {
    expect(
      pickClientIp(
        mockReq({ headers: { "x-forwarded-for": "1.2.3.4, 5.6.7.8" } }),
      ),
    ).toBe("1.2.3.4");
  });

  it("aceita header como array", () => {
    expect(
      pickClientIp(
        mockReq({ headers: { "x-forwarded-for": ["9.9.9.9, 1.1.1.1"] } }),
      ),
    ).toBe("9.9.9.9");
  });

  it("fallback para x-real-ip", () => {
    expect(
      pickClientIp(mockReq({ headers: { "x-real-ip": "7.7.7.7" } })),
    ).toBe("7.7.7.7");
  });

  it("fallback final para socket.remoteAddress", () => {
    expect(pickClientIp(mockReq({ headers: {} }))).toBe("10.0.0.1");
  });

  it("retorna 'unknown' se tudo falhar", () => {
    expect(
      pickClientIp(mockReq({ headers: {}, socket: { remoteAddress: undefined } })),
    ).toBe("unknown");
  });
});

// ============================================================================
// Headers default
// ============================================================================
describe("handlerFactory: headers de segurança", () => {
  it("seta Cache-Control no-store por padrão", async () => {
    const handler = createApiHandler({
      methods: ["GET"],
      handler: () => ({ ok: true }),
    });
    const req = mockReq();
    const res = mockRes();
    await handler(req, res);
    expect(res._headers()["Cache-Control"]).toBe("no-store");
  });
});

// ============================================================================
// _internal
// ============================================================================
describe("handlerFactory: _internal", () => {
  it("ERR_STATUS_MAP cobre todos os códigos das classes de erro", () => {
    const expected = [
      "invalid_email",
      "invalid_role",
      "invalid_ttl",
      "invalid_token",
      "expired",
      "revoked",
      "already_used",
      "weak_password",
      "email_not_verified",
      "invalid_credentials",
      "account_locked",
      "invalid_code",
      "missing_encryption_key",
      "mfa_not_enrolled",
      "invalid_session",
      "expired_session",
      "revoked_session",
      "missing_to",
      "missing_subject",
      "missing_body",
      "provider_error",
      "internal_error",
    ];
    for (const code of expected) {
      expect(_internal.ERR_STATUS_MAP[code]).toBeDefined();
    }
  });
});
