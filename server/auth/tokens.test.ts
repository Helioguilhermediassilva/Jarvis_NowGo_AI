/**
 * Testes do módulo de tokens criptográficos.
 *
 * Cobertura:
 *  • Token bruto tem entropia mínima de 256 bits
 *  • Hash é determinístico e sempre 64 chars hex
 *  • Comparação timing-safe distingue corretamente match e mismatch
 *  • verifyTokenAgainstHash retorna false para token errado
 *  • Pares {raw, hash} são consistentes entre si
 *  • Validação de inputs degenerados (vazio, não-string)
 */
import { describe, it, expect } from "vitest";
import {
  TOKEN_RAW_BYTES,
  generateRawToken,
  generateTokenPair,
  hashToken,
  safeCompareHashes,
  verifyTokenAgainstHash,
} from "./tokens";

describe("generateRawToken", () => {
  it("gera token base64url de pelo menos 32 bytes (≈43 chars)", () => {
    const t = generateRawToken();
    expect(t).toMatch(/^[A-Za-z0-9_-]+$/);
    // 32 bytes em base64url sem padding = 43 chars
    expect(t.length).toBeGreaterThanOrEqual(43);
  });

  it("dois tokens consecutivos não colidem", () => {
    const a = generateRawToken();
    const b = generateRawToken();
    expect(a).not.toBe(b);
  });

  it("rejeita bytes < 16", () => {
    expect(() => generateRawToken(8)).toThrow(/menos de 16 bytes/);
  });

  it("aceita override para bytes maiores (ex: 64)", () => {
    const t = generateRawToken(64);
    // 64 bytes em base64url sem padding = ~86 chars
    expect(t.length).toBeGreaterThanOrEqual(86);
  });

  it("usa default de 32 bytes quando não especificado", () => {
    expect(TOKEN_RAW_BYTES).toBe(32);
  });
});

describe("hashToken", () => {
  it("retorna hex de 64 chars (SHA-256)", () => {
    const h = hashToken("hello");
    expect(h).toMatch(/^[0-9a-f]{64}$/);
  });

  it("é determinístico", () => {
    expect(hashToken("alice")).toBe(hashToken("alice"));
  });

  it("é sensível a alterações mínimas", () => {
    expect(hashToken("alice")).not.toBe(hashToken("Alice"));
    expect(hashToken("alice")).not.toBe(hashToken("alice "));
  });

  it("rejeita string vazia", () => {
    expect(() => hashToken("")).toThrow(/string não-vazia/);
  });

  it("rejeita não-string", () => {
    // @ts-expect-error testando entrada inválida em runtime
    expect(() => hashToken(null)).toThrow();
  });
});

describe("safeCompareHashes", () => {
  it("retorna true para hashes idênticos", () => {
    const h = hashToken("xyz");
    expect(safeCompareHashes(h, h)).toBe(true);
  });

  it("retorna false para hashes diferentes do mesmo tamanho", () => {
    const a = hashToken("xyz");
    const b = hashToken("xy z");
    expect(safeCompareHashes(a, b)).toBe(false);
  });

  it("retorna false se tamanhos divergem (sem vazar diferença)", () => {
    expect(safeCompareHashes("aa", "aaaa")).toBe(false);
  });

  it("retorna false para entradas inválidas", () => {
    // @ts-expect-error testando entrada inválida em runtime
    expect(safeCompareHashes(null, "abc")).toBe(false);
    // @ts-expect-error testando entrada inválida em runtime
    expect(safeCompareHashes("abc", undefined)).toBe(false);
  });
});

describe("verifyTokenAgainstHash", () => {
  it("retorna true quando o token bate com o hash armazenado", () => {
    const raw = generateRawToken();
    const hash = hashToken(raw);
    expect(verifyTokenAgainstHash(raw, hash)).toBe(true);
  });

  it("retorna false para token errado", () => {
    const hash = hashToken(generateRawToken());
    expect(verifyTokenAgainstHash("token-falso", hash)).toBe(false);
  });

  it("retorna false para token vazio sem lançar", () => {
    expect(verifyTokenAgainstHash("", "qualquer")).toBe(false);
  });

  it("retorna false para hash vazio sem lançar", () => {
    expect(verifyTokenAgainstHash("qualquer", "")).toBe(false);
  });
});

describe("generateTokenPair", () => {
  it("raw e hash são consistentes (verifyTokenAgainstHash retorna true)", () => {
    const { raw, hash } = generateTokenPair();
    expect(verifyTokenAgainstHash(raw, hash)).toBe(true);
  });

  it("hash sempre tem 64 chars hex", () => {
    const { hash } = generateTokenPair();
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
  });

  it("dois pares consecutivos não colidem", () => {
    const a = generateTokenPair();
    const b = generateTokenPair();
    expect(a.raw).not.toBe(b.raw);
    expect(a.hash).not.toBe(b.hash);
  });
});
