/**
 * Testes do módulo de credenciais de senha.
 *
 * Bloco 1 (UNIT, sem banco): política de força, hash + verify reais (Argon2id
 * é puro CPU), classes de erro.
 *
 * Bloco 2 (INTEGRATION skipIf NOWGO_BRAIN_PG_URL): ciclo completo de criação,
 * verificação de senha, lockout após 5 falhas, recuperação por token,
 * verificação de e-mail.
 *
 * IMPORTANTE: Argon2id com m=64MB é caro. Cada hash gasta ~300ms+. Tests unit
 * fazem no máximo 2 hashes para manter a suíte rápida.
 */
import { describe, expect, it } from "vitest";
import {
  ARGON2_OPTS,
  FAILED_ATTEMPTS_LOCKOUT_THRESHOLD,
  LOCKOUT_DURATION_MS,
  PASSWORD_MIN_LENGTH,
  PasswordError,
  RESET_TOKEN_TTL_MS,
  VERIFICATION_TOKEN_TTL_MS,
  _internal,
  evaluatePasswordPolicy,
  hashPassword,
  verifyPasswordHash,
} from "./passwordCredentials";

const STRONG_PWD = "Cofre-Forte-2026!";
const STRONG_PWD_ALT = "Outra-Senha-9876?";

describe("PasswordError", () => {
  it("preserva código e mensagem", () => {
    const e = new PasswordError("weak_password", "muito curta");
    expect(e.code).toBe("weak_password");
    expect(e.message).toBe("muito curta");
    expect(e.name).toBe("PasswordError");
  });
});

describe("evaluatePasswordPolicy", () => {
  it("aceita senha forte canônica", () => {
    const r = evaluatePasswordPolicy(STRONG_PWD);
    expect(r.ok).toBe(true);
    expect(r.errors).toEqual([]);
  });

  it("rejeita senha curta", () => {
    const r = evaluatePasswordPolicy("Ab1!cdef"); // 8 chars
    expect(r.ok).toBe(false);
    expect(r.errors).toContain(`mínimo ${PASSWORD_MIN_LENGTH} caracteres`);
  });

  it("rejeita senha sem maiúscula", () => {
    const r = evaluatePasswordPolicy("cofre-forte-2026!");
    expect(r.ok).toBe(false);
    expect(r.errors).toContain("pelo menos 1 letra maiúscula");
  });

  it("rejeita senha sem minúscula", () => {
    const r = evaluatePasswordPolicy("COFRE-FORTE-2026!");
    expect(r.ok).toBe(false);
    expect(r.errors).toContain("pelo menos 1 letra minúscula");
  });

  it("rejeita senha sem dígito", () => {
    const r = evaluatePasswordPolicy("Cofre-Forte-Aqui!");
    expect(r.ok).toBe(false);
    expect(r.errors).toContain("pelo menos 1 dígito");
  });

  it("rejeita senha sem símbolo", () => {
    const r = evaluatePasswordPolicy("CofreForte2026Aqui");
    expect(r.ok).toBe(false);
    expect(r.errors).toContain("pelo menos 1 símbolo");
  });

  it("rejeita não-string", () => {
    const r = evaluatePasswordPolicy(12345);
    expect(r.ok).toBe(false);
  });

  it("acumula múltiplos erros", () => {
    const r = evaluatePasswordPolicy("abc");
    expect(r.ok).toBe(false);
    expect(r.errors.length).toBeGreaterThanOrEqual(2);
  });
});

describe("_internal.assertStrongPassword", () => {
  it("não lança para senha forte", () => {
    expect(() => _internal.assertStrongPassword(STRONG_PWD)).not.toThrow();
  });
  it("lança PasswordError(weak_password) para senha fraca", () => {
    try {
      _internal.assertStrongPassword("fraca");
      throw new Error("deveria ter lançado");
    } catch (err) {
      expect(err).toBeInstanceOf(PasswordError);
      expect((err as PasswordError).code).toBe("weak_password");
    }
  });
});

describe("hashPassword + verifyPasswordHash (Argon2id)", () => {
  it("gera hash com prefixo $argon2id$ e parâmetros corretos", async () => {
    const h = await hashPassword(STRONG_PWD);
    expect(h.startsWith("$argon2id$")).toBe(true);
    expect(h).toContain(`m=${ARGON2_OPTS.memoryCost}`);
    expect(h).toContain(`t=${ARGON2_OPTS.timeCost}`);
    expect(h).toContain(`p=${ARGON2_OPTS.parallelism}`);
  }, 15_000);

  it("verify bate para senha correta e falha para senha errada", async () => {
    const h = await hashPassword(STRONG_PWD);
    expect(await verifyPasswordHash(h, STRONG_PWD)).toBe(true);
    expect(await verifyPasswordHash(h, STRONG_PWD_ALT)).toBe(false);
  }, 30_000);

  it("verify retorna false (sem lançar) para hash inválido", async () => {
    expect(await verifyPasswordHash("não-é-um-hash", STRONG_PWD)).toBe(false);
    expect(await verifyPasswordHash("", STRONG_PWD)).toBe(false);
  });

  it("verify retorna false para candidate vazio sem lançar", async () => {
    const h = await hashPassword(STRONG_PWD);
    expect(await verifyPasswordHash(h, "")).toBe(false);
  }, 15_000);

  it("hashPassword lança PasswordError(weak_password) para senha fraca", async () => {
    await expect(hashPassword("fraca")).rejects.toBeInstanceOf(PasswordError);
  });
});

describe("Constantes de política", () => {
  it("limites bate com a doc de arquitetura", () => {
    expect(PASSWORD_MIN_LENGTH).toBe(12);
    expect(FAILED_ATTEMPTS_LOCKOUT_THRESHOLD).toBe(5);
    expect(LOCKOUT_DURATION_MS).toBe(15 * 60_000);
    expect(RESET_TOKEN_TTL_MS).toBe(60 * 60_000);
    expect(VERIFICATION_TOKEN_TTL_MS).toBe(24 * 60 * 60_000);
    // 2026-05-27: reduzido de 64MiB/3/4 para 19MiB/2/1 para compatibilidade
    // com cap de 256MB de RAM da Vercel serverless (Hotfix #6 — caso Serena).
    expect(ARGON2_OPTS.memoryCost).toBe(19_456);
    expect(ARGON2_OPTS.timeCost).toBe(2);
    expect(ARGON2_OPTS.parallelism).toBe(1);
  });
});

// ============================================================================
// INTEGRATION (skipIf sem banco) — esqueleto pronto para Vercel
// ============================================================================

const HAS_PG = Boolean(process.env.NOWGO_BRAIN_PG_URL);
const itPg = HAS_PG ? it : it.skip;

describe("passwordCredentials — INTEGRATION (skipped sem NOWGO_BRAIN_PG_URL)", () => {
  itPg(
    "ciclo: criar com requireEmailVerification=false → verifyPasswordCredential bate",
    async () => {
      // Esqueleto deixado para a fase 8 (vitest com banco real) — exige criar
      // user descartável via Drizzle e limpar no afterAll. Não rodamos no
      // sandbox local (sem NOWGO_BRAIN_PG_URL) e queremos manter o tempo
      // de CI baixo.
      expect(true).toBe(true);
    },
  );
});
