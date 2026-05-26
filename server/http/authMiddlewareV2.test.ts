import { describe, it, expect, afterEach } from "vitest";
import { _internal } from "./authMiddlewareV2.js";

describe("authMiddlewareV2: cookieDomainFromEnv", () => {
  const original = process.env.NOWGO_COOKIE_DOMAIN;

  afterEach(() => {
    if (original === undefined) {
      delete process.env.NOWGO_COOKIE_DOMAIN;
    } else {
      process.env.NOWGO_COOKIE_DOMAIN = original;
    }
  });

  it("retorna undefined quando env ausente", () => {
    delete process.env.NOWGO_COOKIE_DOMAIN;
    expect(_internal.cookieDomainFromEnv()).toBeUndefined();
  });

  it("retorna undefined quando env vazia", () => {
    process.env.NOWGO_COOKIE_DOMAIN = "";
    expect(_internal.cookieDomainFromEnv()).toBeUndefined();
  });

  it("retorna undefined quando env só whitespace", () => {
    process.env.NOWGO_COOKIE_DOMAIN = "   ";
    expect(_internal.cookieDomainFromEnv()).toBeUndefined();
  });

  it("retorna valor trimmed quando env presente", () => {
    process.env.NOWGO_COOKIE_DOMAIN = "  .nowgoai.com  ";
    expect(_internal.cookieDomainFromEnv()).toBe(".nowgoai.com");
  });
});
