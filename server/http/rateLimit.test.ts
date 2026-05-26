import { describe, it, expect, beforeEach } from "vitest";
import {
  tryConsume,
  rlKey,
  _resetAllBuckets,
  _internal,
} from "./rateLimit.js";

describe("rateLimit: tryConsume", () => {
  beforeEach(() => {
    _resetAllBuckets();
  });

  it("primeira chamada com bucket vazio é permitida (bucket inicializa cheio)", () => {
    const r = tryConsume("k1", { capacity: 5, refillPerSec: 1 });
    expect(r.allowed).toBe(true);
    expect(r.remaining).toBe(4);
  });

  it("esgota bucket após capacity chamadas", () => {
    const opts = { capacity: 3, refillPerSec: 0, nowMs: 1000 };
    expect(tryConsume("k", opts).allowed).toBe(true);
    expect(tryConsume("k", opts).allowed).toBe(true);
    expect(tryConsume("k", opts).allowed).toBe(true);
    const denied = tryConsume("k", opts);
    expect(denied.allowed).toBe(false);
    expect(denied.remaining).toBe(0);
  });

  it("refill por tempo libera novas requests", () => {
    const t0 = 1000;
    expect(tryConsume("k", { capacity: 1, refillPerSec: 1, nowMs: t0 }).allowed).toBe(true);
    expect(tryConsume("k", { capacity: 1, refillPerSec: 1, nowMs: t0 + 100 }).allowed).toBe(false);
    // 1.1s depois → refilled 1+ token
    expect(
      tryConsume("k", { capacity: 1, refillPerSec: 1, nowMs: t0 + 1100 }).allowed,
    ).toBe(true);
  });

  it("refill nunca ultrapassa capacity", () => {
    const t0 = 1000;
    tryConsume("k", { capacity: 2, refillPerSec: 10, nowMs: t0 });
    // Espera 100s → bucket teoricamente teria 1000 tokens
    const r = tryConsume("k", { capacity: 2, refillPerSec: 10, nowMs: t0 + 100_000 });
    expect(r.allowed).toBe(true);
    expect(r.remaining).toBe(1); // capacity 2 - 1 consumido = 1
  });

  it("custo customizado consome múltiplos tokens", () => {
    const r1 = tryConsume("k", { capacity: 5, refillPerSec: 0, cost: 3, nowMs: 1000 });
    expect(r1.allowed).toBe(true);
    expect(r1.remaining).toBe(2);
    const r2 = tryConsume("k", { capacity: 5, refillPerSec: 0, cost: 3, nowMs: 1000 });
    expect(r2.allowed).toBe(false);
  });

  it("chaves diferentes têm buckets independentes", () => {
    const opts = { capacity: 1, refillPerSec: 0, nowMs: 1000 };
    expect(tryConsume("user-a", opts).allowed).toBe(true);
    expect(tryConsume("user-a", opts).allowed).toBe(false);
    expect(tryConsume("user-b", opts).allowed).toBe(true);
  });

  it("rlKey monta chave canônica", () => {
    expect(rlKey("login", "1.2.3.4:user@x.com")).toBe(
      "login:1.2.3.4:user@x.com",
    );
  });

  it("validação de input: capacity<=0 lança", () => {
    expect(() => tryConsume("k", { capacity: 0, refillPerSec: 1 })).toThrow();
  });

  it("validação de input: refillPerSec<0 lança", () => {
    expect(() => tryConsume("k", { capacity: 5, refillPerSec: -1 })).toThrow();
  });

  it("resetSec retorna Infinity quando refillPerSec=0", () => {
    const r = tryConsume("k", { capacity: 1, refillPerSec: 0, nowMs: 1000 });
    expect(r.resetSec).toBe(Infinity);
  });

  it("eviction quando MAX_KEYS é atingido", () => {
    // Cria MAX_KEYS+5 chaves para forçar eviction
    const total = _internal.MAX_KEYS + 5;
    for (let i = 0; i < total; i++) {
      tryConsume(`key-${i}`, { capacity: 1, refillPerSec: 0, nowMs: 1000 });
    }
    expect(_internal.BUCKETS.size).toBeLessThanOrEqual(_internal.MAX_KEYS);
  });
});
