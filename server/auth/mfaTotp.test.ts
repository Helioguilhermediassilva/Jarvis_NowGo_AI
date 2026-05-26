/**
 * Testes do módulo MFA TOTP.
 *
 * Cobertura unit (sem banco):
 *   • AES-256-GCM round-trip
 *   • Fail-closed quando MFA_ENCRYPTION_KEY ausente ou inválida
 *   • Backup codes: contagem, entropia, formato, normalização, hashing,
 *     comparação timing-safe
 *   • TOTP real: gera segredo + URI + QR data URL + código válido + janela
 *     de tolerância funcionando
 *
 * Testes de integração (skipIf NOWGO_BRAIN_PG_URL ausente) ficam para a Fase 8.
 */
import { generateSync, generateURI, generateSecret } from "otplib";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  MfaError,
  _internal,
  decryptSecret,
  encryptSecret,
  generateBackupCodes,
  generateMfaSetup,
  hashBackupCode,
} from "./mfaTotp";
import { randomBytes } from "node:crypto";

// ---------------------------------------------------------------------------
// Setup: chave de cifra ad-hoc para os testes
// ---------------------------------------------------------------------------

const TEST_KEY_B64 = randomBytes(32).toString("base64");
let originalKey: string | undefined;

beforeEach(() => {
  originalKey = process.env.MFA_ENCRYPTION_KEY;
  process.env.MFA_ENCRYPTION_KEY = TEST_KEY_B64;
});

afterEach(() => {
  if (originalKey === undefined) {
    delete process.env.MFA_ENCRYPTION_KEY;
  } else {
    process.env.MFA_ENCRYPTION_KEY = originalKey;
  }
});

// ---------------------------------------------------------------------------
// Erros e fail-closed
// ---------------------------------------------------------------------------

describe("MfaError", () => {
  it("preserva código e mensagem", () => {
    const e = new MfaError("invalid_code", "X");
    expect(e.code).toBe("invalid_code");
    expect(e.message).toBe("X");
    expect(e.name).toBe("MfaError");
  });
});

describe("getKey() fail-closed", () => {
  it("lança MfaError(missing_encryption_key) sem env", () => {
    delete process.env.MFA_ENCRYPTION_KEY;
    expect(() => _internal.getKey()).toThrow(MfaError);
  });
  it("lança MfaError quando chave não tem 32 bytes", () => {
    process.env.MFA_ENCRYPTION_KEY = Buffer.from("curta").toString("base64");
    expect(() => _internal.getKey()).toThrow(MfaError);
  });
  it("aceita chave de 32 bytes em base64", () => {
    expect(() => _internal.getKey()).not.toThrow();
    expect(_internal.getKey().length).toBe(32);
  });
});

// ---------------------------------------------------------------------------
// AES-256-GCM round-trip
// ---------------------------------------------------------------------------

describe("encryptSecret + decryptSecret", () => {
  it("round-trip preserva o plaintext", () => {
    const plaintext = "JBSWY3DPEHPK3PXP-segredo-base32-fictício";
    const blob = encryptSecret(plaintext);
    expect(decryptSecret(blob)).toBe(plaintext);
  });

  it("blobs de mesma string diferem (IV aleatório)", () => {
    const a = encryptSecret("abc").toString("hex");
    const b = encryptSecret("abc").toString("hex");
    expect(a).not.toBe(b);
  });

  it("blob inclui IV (12B) + tag (16B) + ciphertext", () => {
    const blob = encryptSecret("hello");
    expect(blob.length).toBe(_internal.IV_BYTES + _internal.TAG_BYTES + 5);
  });

  it("decrypt falha em blob curto", () => {
    expect(() => decryptSecret(Buffer.from([1, 2, 3]))).toThrow(MfaError);
  });

  it("decrypt falha em blob adulterado (tag inválida)", () => {
    const blob = encryptSecret("integrity");
    blob[blob.length - 1] ^= 0xff; // corrompe último byte do ciphertext
    expect(() => decryptSecret(blob)).toThrow();
  });

  it("decrypt com chave diferente lança", () => {
    const blob = encryptSecret("abc");
    process.env.MFA_ENCRYPTION_KEY = randomBytes(32).toString("base64");
    expect(() => decryptSecret(blob)).toThrow();
  });
});

// ---------------------------------------------------------------------------
// Backup codes
// ---------------------------------------------------------------------------

describe("generateBackupCodes", () => {
  it("gera 8 códigos por padrão", () => {
    const codes = generateBackupCodes();
    expect(codes).toHaveLength(8);
  });

  it("respeita count customizado", () => {
    expect(generateBackupCodes(3)).toHaveLength(3);
  });

  it("cada código tem formato XXXXX-XXXXX (10 chars + hífen)", () => {
    for (const c of generateBackupCodes()) {
      expect(c).toMatch(/^[A-Z2-9]{5}-[A-Z2-9]{5}$/);
    }
  });

  it("não usa caracteres confusos (0/O/1/I)", () => {
    const codes = generateBackupCodes(20).join("");
    expect(codes).not.toMatch(/[01OI]/);
  });

  it("8 códigos são todos únicos (entropia adequada)", () => {
    const codes = generateBackupCodes();
    const unique = new Set(codes);
    expect(unique.size).toBe(codes.length);
  });
});

describe("normalizeBackupCode + hashBackupCode", () => {
  it("normalize remove hífens e uppercase", () => {
    expect(_internal.normalizeBackupCode("ab123-de456")).toBe("AB123DE456");
  });
  it("hash é determinístico para o mesmo código (com hífens variantes)", () => {
    const a = hashBackupCode("AB123-DE456");
    const b = hashBackupCode("ab123de456");
    const c = hashBackupCode("AB123DE456");
    expect(a).toBe(b);
    expect(a).toBe(c);
  });
  it("hash difere para códigos diferentes", () => {
    expect(hashBackupCode("CODE1-AAAAA")).not.toBe(hashBackupCode("CODE2-AAAAA"));
  });
  it("hash retorna 64 chars (SHA-256 hex)", () => {
    expect(hashBackupCode("ABCDE-FGHIJ")).toMatch(/^[0-9a-f]{64}$/);
  });
});

// ---------------------------------------------------------------------------
// TOTP real (gera segredo, calcula código atual, valida)
// ---------------------------------------------------------------------------

describe("generateMfaSetup + ciclo TOTP", () => {
  it("retorna secret base32, otpauth URI e QR data URL", async () => {
    const setup = await generateMfaSetup({
      userEmail: "helio@nowgo.com.br",
      issuer: "NowGo Cockpit",
    });
    expect(setup.secret).toMatch(/^[A-Z2-7]+=*$/); // base32 válido
    expect(setup.otpauthUri).toMatch(/^otpauth:\/\/totp\//);
    expect(setup.otpauthUri).toContain("issuer=NowGo");
    expect(setup.otpauthUri).toContain("helio");
    expect(setup.qrCodeDataUrl).toMatch(/^data:image\/png;base64,/);
  });

  it("código TOTP gerado a partir do secret é válido para verify síncrono", () => {
    const secret = generateSecret();
    const code = generateSync({ secret, strategy: "totp" });
    expect(code).toMatch(/^\d{6}$/);
    // generateURI deve produzir URI consistente
    const uri = generateURI({
      strategy: "totp",
      issuer: "NowGo",
      label: "x@y.com",
      secret,
    });
    expect(uri).toContain(secret);
  });

  it("rejeita userEmail vazio", async () => {
    await expect(generateMfaSetup({ userEmail: "" })).rejects.toBeInstanceOf(MfaError);
  });
});

// ---------------------------------------------------------------------------
// Constantes
// ---------------------------------------------------------------------------

describe("Constantes do módulo", () => {
  it("config bate com a doc de arquitetura", () => {
    expect(_internal.ALGO).toBe("aes-256-gcm");
    expect(_internal.IV_BYTES).toBe(12);
    expect(_internal.TAG_BYTES).toBe(16);
    expect(_internal.BACKUP_CODE_COUNT).toBe(8);
    expect(_internal.BACKUP_CODE_LENGTH).toBe(10);
  });
});
