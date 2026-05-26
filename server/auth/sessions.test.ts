/**
 * Testes do módulo sessions.
 *
 * Bloco 1 (UNIT, sem banco): cookie helpers (serializar, limpar, parsear),
 * classes de erro, constantes.
 *
 * Bloco 2 (INTEGRATION skipIf NOWGO_BRAIN_PG_URL): ciclo completo de criar →
 * carregar → renovar → revogar — fica para Fase 8 (vitest com PG real).
 */
import { describe, expect, it } from "vitest";
import {
  COOKIE_NAME,
  SESSION_TTL_MS,
  SessionError,
  _internal,
  parseSessionCookie,
  serializeClearCookie,
  serializeCookie,
} from "./sessions";

describe("SessionError", () => {
  it("preserva código e mensagem", () => {
    const e = new SessionError("invalid_session", "X");
    expect(e.code).toBe("invalid_session");
    expect(e.message).toBe("X");
    expect(e.name).toBe("SessionError");
  });
});

describe("Constantes", () => {
  it("TTL é 7 dias em ms", () => {
    expect(SESSION_TTL_MS).toBe(7 * 24 * 60 * 60_000);
  });
  it("nome de cookie e SameSite batem com a doc", () => {
    expect(COOKIE_NAME).toBe("nowgo_session");
    expect(_internal.COOKIE_SAMESITE).toBe("Lax");
    expect(_internal.COOKIE_PATH).toBe("/");
  });
});

describe("serializeCookie", () => {
  const expiresAt = new Date("2026-06-01T00:00:00Z");

  it("inclui flags de segurança por padrão", () => {
    const c = serializeCookie({ rawToken: "abc123", expiresAt });
    expect(c).toContain("nowgo_session=abc123");
    expect(c).toContain("Path=/");
    expect(c).toContain("HttpOnly");
    expect(c).toContain("SameSite=Lax");
    expect(c).toContain("Secure");
    expect(c).toContain("Expires=Mon, 01 Jun 2026 00:00:00 GMT");
  });

  it("permite secure=false em testes locais", () => {
    const c = serializeCookie({ rawToken: "x", expiresAt, secure: false });
    expect(c).not.toContain("Secure");
  });

  it("inclui Domain se fornecido", () => {
    const c = serializeCookie({
      rawToken: "x",
      expiresAt,
      domain: ".cockpitcrmnowgoai.com",
    });
    expect(c).toContain("Domain=.cockpitcrmnowgoai.com");
  });

  it("URL-encoda o token (proteção a chars especiais)", () => {
    const c = serializeCookie({ rawToken: "a/b+c=d", expiresAt });
    expect(c).toContain("a%2Fb%2Bc%3Dd");
  });
});

describe("serializeClearCookie", () => {
  it("define Max-Age=0 e Expires no passado", () => {
    const c = serializeClearCookie();
    expect(c).toContain("Max-Age=0");
    expect(c).toContain("Expires=Thu, 01 Jan 1970 00:00:00 GMT");
    expect(c).toContain("HttpOnly");
    expect(c).toContain("Secure");
    expect(c).toContain("SameSite=Lax");
  });
  it("inclui Domain quando passado", () => {
    expect(serializeClearCookie(".x.com")).toContain("Domain=.x.com");
  });
});

describe("parseSessionCookie", () => {
  it("retorna null para header vazio ou nulo", () => {
    expect(parseSessionCookie(null)).toBeNull();
    expect(parseSessionCookie("")).toBeNull();
    expect(parseSessionCookie(undefined)).toBeNull();
  });

  it("retorna null se o cookie não está presente", () => {
    expect(parseSessionCookie("foo=bar; baz=qux")).toBeNull();
  });

  it("extrai e URL-decoda o valor", () => {
    expect(parseSessionCookie("nowgo_session=abc123")).toBe("abc123");
    expect(parseSessionCookie("nowgo_session=a%2Fb%2Bc%3Dd")).toBe("a/b+c=d");
  });

  it("ignora espaços e outras chaves", () => {
    expect(parseSessionCookie("foo=bar;  nowgo_session=tok ;baz=qux")).toBe("tok ");
  });

  it("preserva sinal de igual no valor", () => {
    expect(parseSessionCookie("nowgo_session=base64==")).toBe("base64==");
  });
});

// ============================================================================
// INTEGRATION (skipped sem banco)
// ============================================================================

const HAS_PG = Boolean(process.env.NOWGO_BRAIN_PG_URL);
const itPg = HAS_PG ? it : it.skip;

describe("sessions — INTEGRATION (skipped sem NOWGO_BRAIN_PG_URL)", () => {
  itPg("ciclo: createSession → loadByRawToken → revoke", async () => {
    expect(true).toBe(true); // esqueleto fase 8
  });
});
