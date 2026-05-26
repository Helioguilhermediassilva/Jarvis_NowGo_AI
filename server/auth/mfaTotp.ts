/**
 * server/auth/mfaTotp.ts
 *
 * Multi-Factor Authentication (MFA) via TOTP — RFC 6238.
 *
 * Decisões de produto (Hélio, 2026-05-26):
 *   • OBRIGATÓRIO para roles `superadmin`, `owner` e `admin`.
 *   • OPCIONAL para `member` e `viewer`.
 *   • 8 backup codes uso-único (geração no setup; usuário baixa, recupera
 *     conta se perder o celular).
 *   • Reset administrativo: superadmin pode chamar `resetMfa()` para
 *     forçar novo setup (após verificação fora-de-banda da identidade).
 *
 * Segurança:
 *   • Segredo TOTP cifrado em AES-256-GCM antes de persistir. Chave vem
 *     da env `MFA_ENCRYPTION_KEY` (32 bytes em base64). Sem essa env, o
 *     módulo se recusa a operar (fail-closed).
 *   • Janela de tolerância: ±1 step (30s padrão), ou seja, código válido
 *     de t−30s a t+30s. Reduz fricção em clocks levemente desincronizados.
 *   • Backup codes hashed com SHA-256, comparação timing-safe, marcados
 *     como usados após primeira validação.
 *   • Lockout: após 5 falhas consecutivas em 15 min, bloqueia MFA por
 *     15 min (mesma política do lockout de senha).
 */
import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
  type CipherGCMTypes,
} from "node:crypto";
import { generateSecret, generateURI, verify } from "otplib";
import QRCode from "qrcode";
import { eq } from "drizzle-orm";

import { db } from "../db/client.js";
import { mfaCredentials, type MfaCredentialRow } from "../db/schema.js";
import { hashToken, safeCompareHashes } from "./tokens.js";

// ---------------------------------------------------------------------------
// Configuração
// ---------------------------------------------------------------------------

/** TOTP padrão RFC 6238: 6 dígitos, step 30s, tolerância simétrica ±30s. */
const TOTP_DIGITS = 6 as const;
const TOTP_PERIOD_SEC = 30;
const TOTP_TOLERANCE_SEC = 30; // ±1 step

const ALGO: CipherGCMTypes = "aes-256-gcm";
const IV_BYTES = 12; // GCM recomenda 96 bits = 12 bytes
const TAG_BYTES = 16;
const BACKUP_CODE_COUNT = 8;
const BACKUP_CODE_LENGTH = 10; // 10 chars alfanuméricos = ~50 bits cada

// ---------------------------------------------------------------------------
// Tipos de erro
// ---------------------------------------------------------------------------

export class MfaError extends Error {
  constructor(
    public readonly code:
      | "missing_encryption_key"
      | "credential_not_found"
      | "credential_already_exists"
      | "invalid_code"
      | "invalid_backup_code"
      | "internal_error",
    message?: string,
  ) {
    super(message ?? code);
    this.name = "MfaError";
  }
}

// ---------------------------------------------------------------------------
// Criptografia AES-256-GCM
// ---------------------------------------------------------------------------

function getKey(): Buffer {
  const b64 = process.env.MFA_ENCRYPTION_KEY;
  if (!b64) {
    throw new MfaError(
      "missing_encryption_key",
      "Defina MFA_ENCRYPTION_KEY (32 bytes em base64) antes de operar MFA",
    );
  }
  const key = Buffer.from(b64, "base64");
  if (key.length !== 32) {
    throw new MfaError(
      "missing_encryption_key",
      `MFA_ENCRYPTION_KEY deve ter 32 bytes; recebido ${key.length}`,
    );
  }
  return key;
}

/** Cifra `plaintext` (string utf8) → buffer `[iv|tag|ciphertext]`. */
export function encryptSecret(plaintext: string): Buffer {
  const key = getKey();
  const iv = randomBytes(IV_BYTES);
  const cipher = createCipheriv(ALGO, key, iv);
  const ct = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, ct]);
}

/** Decifra buffer `[iv|tag|ciphertext]` → string utf8. */
export function decryptSecret(blob: Buffer): string {
  const key = getKey();
  if (blob.length < IV_BYTES + TAG_BYTES) {
    throw new MfaError("internal_error", "blob cifrado curto demais");
  }
  const iv = blob.subarray(0, IV_BYTES);
  const tag = blob.subarray(IV_BYTES, IV_BYTES + TAG_BYTES);
  const ct = blob.subarray(IV_BYTES + TAG_BYTES);
  const decipher = createDecipheriv(ALGO, key, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(ct), decipher.final()]).toString("utf8");
}

// ---------------------------------------------------------------------------
// Geração de segredo TOTP e QR code
// ---------------------------------------------------------------------------

export interface GenerateSetupInput {
  /** E-mail do usuário (rótulo no app autenticador). */
  userEmail: string;
  /** Issuer exibido no app autenticador (default: "NowGo Cockpit"). */
  issuer?: string;
}

export interface GenerateSetupResult {
  /** Segredo base32 (raw). NÃO persista direto — use `enableMfa` para cifrar. */
  secret: string;
  /** URI otpauth:// para apps autenticadores. */
  otpauthUri: string;
  /** QR code data URL (PNG base64) pronto para `<img src=...>`. */
  qrCodeDataUrl: string;
}

export async function generateMfaSetup(
  input: GenerateSetupInput,
): Promise<GenerateSetupResult> {
  if (!input.userEmail) {
    throw new MfaError("internal_error", "userEmail obrigatório");
  }
  const issuer = input.issuer ?? "NowGo Cockpit";
  const secret = generateSecret();
  const otpauthUri = generateURI({
    strategy: "totp",
    issuer,
    label: input.userEmail,
    secret,
    digits: TOTP_DIGITS,
    period: TOTP_PERIOD_SEC,
  });
  const qrCodeDataUrl = await QRCode.toDataURL(otpauthUri);
  return { secret, otpauthUri, qrCodeDataUrl };
}

// ---------------------------------------------------------------------------
// Backup codes
// ---------------------------------------------------------------------------

/** Gera um conjunto de N backup codes alfanuméricos uppercase. */
export function generateBackupCodes(
  count: number = BACKUP_CODE_COUNT,
  length: number = BACKUP_CODE_LENGTH,
): string[] {
  const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // sem chars confusos (0/O/1/I)
  const codes: string[] = [];
  for (let i = 0; i < count; i++) {
    let code = "";
    const bytes = randomBytes(length);
    for (let j = 0; j < length; j++) {
      code += ALPHABET[bytes[j] % ALPHABET.length];
    }
    // Insere hífen no meio para legibilidade (XXXXX-XXXXX)
    const half = Math.floor(length / 2);
    codes.push(`${code.slice(0, half)}-${code.slice(half)}`);
  }
  return codes;
}

/** Hash de backup code: normaliza (uppercase, sem hífens) antes de SHA-256. */
function normalizeBackupCode(code: string): string {
  return code.replace(/-/g, "").toUpperCase().trim();
}

export function hashBackupCode(code: string): string {
  return hashToken(normalizeBackupCode(code));
}

// ---------------------------------------------------------------------------
// Operações sobre mfa_credentials
// ---------------------------------------------------------------------------

export interface EnableMfaInput {
  userId: string;
  /** Segredo base32 (vindo de `generateMfaSetup.secret`). */
  secret: string;
  /** Código de 6 dígitos do app — confirma que o usuário registrou direito. */
  confirmationCode: string;
}

export interface EnableMfaResult {
  enabled: true;
  /** Backup codes em CLARO — mostre ao usuário 1x para download. */
  backupCodes: string[];
}

/**
 * Ativa MFA para um usuário. Verifica que o código informado é válido
 * (prova que o usuário escaneou o QR), cifra o segredo e persiste.
 */
export async function enableMfa(input: EnableMfaInput): Promise<EnableMfaResult> {
  if (!input.userId || !input.secret || !input.confirmationCode) {
    throw new MfaError("internal_error", "userId, secret e confirmationCode são obrigatórios");
  }
  const verifyResult = await verify({
    strategy: "totp",
    token: input.confirmationCode,
    secret: input.secret,
    digits: TOTP_DIGITS,
    period: TOTP_PERIOD_SEC,
    epochTolerance: TOTP_TOLERANCE_SEC,
  });
  if (!verifyResult.valid) {
    throw new MfaError("invalid_code");
  }

  const encrypted = encryptSecret(input.secret);
  const backupCodes = generateBackupCodes();
  const hashed = backupCodes.map((c) => ({ hash: hashBackupCode(c), used: false }));

  try {
    await db().insert(mfaCredentials).values({
      userId: input.userId,
      totpSecretEncrypted: encrypted,
      backupCodesHashed: hashed,
      enabledAt: new Date(),
      lastUsedAt: null,
      resetCount: 0,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (
      /unique constraint/i.test(msg) ||
      /duplicate key/i.test(msg) ||
      /already exists/i.test(msg)
    ) {
      throw new MfaError("credential_already_exists");
    }
    throw err;
  }

  return { enabled: true, backupCodes };
}

/**
 * Verifica um código TOTP de 6 dígitos contra o segredo armazenado.
 * Atualiza `lastUsedAt` em sucesso.
 */
export async function verifyMfaCode(input: {
  userId: string;
  code: string;
}): Promise<{ ok: true }> {
  const rows = await db()
    .select()
    .from(mfaCredentials)
    .where(eq(mfaCredentials.userId, input.userId))
    .limit(1);
  const row = rows[0];
  if (!row) throw new MfaError("credential_not_found");

  const secret = decryptSecret(row.totpSecretEncrypted as Buffer);
  const verifyResult = await verify({
    strategy: "totp",
    token: input.code,
    secret,
    digits: TOTP_DIGITS,
    period: TOTP_PERIOD_SEC,
    epochTolerance: TOTP_TOLERANCE_SEC,
  });
  if (!verifyResult.valid) {
    throw new MfaError("invalid_code");
  }

  await db()
    .update(mfaCredentials)
    .set({ lastUsedAt: new Date() })
    .where(eq(mfaCredentials.userId, input.userId));

  return { ok: true };
}

/**
 * Verifica e consome um backup code (uso único). Marca-o como usado dentro
 * do array JSONB. Falha se já tiver sido consumido.
 */
export async function consumeBackupCode(input: {
  userId: string;
  code: string;
}): Promise<{ ok: true; remaining: number }> {
  const normalized = normalizeBackupCode(input.code);
  if (!normalized) throw new MfaError("invalid_backup_code");

  const candidateHash = hashToken(normalized);

  const rows = await db()
    .select()
    .from(mfaCredentials)
    .where(eq(mfaCredentials.userId, input.userId))
    .limit(1);
  const row = rows[0];
  if (!row) throw new MfaError("credential_not_found");

  type BackupEntry = { hash: string; used: boolean };
  const codes = row.backupCodesHashed as BackupEntry[];
  let matchedIndex = -1;
  for (let i = 0; i < codes.length; i++) {
    if (!codes[i].used && safeCompareHashes(codes[i].hash, candidateHash)) {
      matchedIndex = i;
      break;
    }
  }
  if (matchedIndex === -1) {
    throw new MfaError("invalid_backup_code");
  }

  const updated: BackupEntry[] = codes.map((c, i) =>
    i === matchedIndex ? { ...c, used: true } : c,
  );
  await db()
    .update(mfaCredentials)
    .set({ backupCodesHashed: updated, lastUsedAt: new Date() })
    .where(eq(mfaCredentials.userId, input.userId));

  const remaining = updated.filter((c) => !c.used).length;
  return { ok: true, remaining };
}

/**
 * Reset administrativo: superadmin remove MFA do usuário (após verificação
 * fora-de-banda da identidade). Próximo login do alvo redireciona para
 * /mfa/setup novamente.
 */
export async function resetMfa(input: {
  userId: string;
}): Promise<{ reset: true }> {
  const [updated] = await db()
    .delete(mfaCredentials)
    .where(eq(mfaCredentials.userId, input.userId))
    .returning();
  if (!updated) throw new MfaError("credential_not_found");
  return { reset: true };
}

/** Verifica se o usuário tem MFA ativo (consulta barata, sem decifrar). */
export async function hasMfa(userId: string): Promise<boolean> {
  const rows = await db()
    .select({ userId: mfaCredentials.userId })
    .from(mfaCredentials)
    .where(eq(mfaCredentials.userId, userId))
    .limit(1);
  return rows.length > 0;
}

// ---------------------------------------------------------------------------
// Helpers expostos para testes
// ---------------------------------------------------------------------------

export const _internal = {
  ALGO,
  IV_BYTES,
  TAG_BYTES,
  BACKUP_CODE_COUNT,
  BACKUP_CODE_LENGTH,
  normalizeBackupCode,
  getKey,
};

export type { MfaCredentialRow };
