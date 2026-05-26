/**
 * server/auth/passwordCredentials.ts
 *
 * Credenciais por senha local (alternativa ao Google OAuth).
 *
 * Decisões de produto (confirmadas pelo Hélio em 2026-05-26):
 *   • Política: mínimo 12 caracteres, com pelo menos 1 maiúscula, 1 minúscula,
 *     1 dígito e 1 símbolo.
 *   • Hashing: Argon2id (m=64MB, t=3, p=4) — padrão OWASP 2026.
 *   • Verificação de e-mail OBRIGATÓRIA antes do primeiro login com senha.
 *   • Lockout: após 5 tentativas falhas em 15 minutos, bloqueia por 15 min.
 *   • Recuperação: token único válido por 1h, enviado via Resend (módulo
 *     servirá apenas log-only enquanto RESEND_API_KEY não estiver setada).
 *
 * Arquitetura:
 *   • A tabela `password_credentials` (1:1 com `users`) guarda hash, status de
 *     verificação, contador de falhas e tokens (verificação + reset) em hash.
 *   • Os tokens em si nunca são persistidos — só `*_token_hash`.
 *   • Funções aqui são síncronas em contrato e usam o Pool global do
 *     `server/db/client.ts`. Os efeitos colaterais (envio de e-mail) são
 *     responsabilidade da camada de API/tRPC que invoca este módulo.
 */
import argon2 from "argon2";
import { eq } from "drizzle-orm";

import { db } from "../db/client.js";
import {
  passwordCredentials,
  type PasswordCredentialRow,
} from "../db/schema.js";
import { generateTokenPair, hashToken } from "./tokens.js";

// ---------------------------------------------------------------------------
// Constantes da política
// ---------------------------------------------------------------------------

export const PASSWORD_MIN_LENGTH = 12;
export const PASSWORD_MAX_LENGTH = 256; // contra DoS no hashing
export const FAILED_ATTEMPTS_LOCKOUT_THRESHOLD = 5;
export const LOCKOUT_DURATION_MS = 15 * 60_000; // 15 min
export const RESET_TOKEN_TTL_MS = 60 * 60_000; // 1h
export const VERIFICATION_TOKEN_TTL_MS = 24 * 60 * 60_000; // 24h

/** Configuração Argon2id alinhada à OWASP 2026 (m=64MiB, t=3, p=4). */
export const ARGON2_OPTS = {
  type: argon2.argon2id,
  memoryCost: 65_536, // 64 MiB
  timeCost: 3,
  parallelism: 4,
} as const;

// ---------------------------------------------------------------------------
// Tipos de erro
// ---------------------------------------------------------------------------

export class PasswordError extends Error {
  constructor(
    public readonly code:
      | "weak_password"
      | "user_not_found"
      | "credential_not_found"
      | "credential_already_exists"
      | "invalid_credentials"
      | "account_locked"
      | "email_not_verified"
      | "invalid_reset_token"
      | "invalid_verification_token"
      | "internal_error",
    message?: string,
  ) {
    super(message ?? code);
    this.name = "PasswordError";
  }
}

// ---------------------------------------------------------------------------
// Validação de força da senha
// ---------------------------------------------------------------------------

const RE_UPPER = /[A-Z]/;
const RE_LOWER = /[a-z]/;
const RE_DIGIT = /\d/;
const RE_SYMBOL = /[^A-Za-z0-9]/;

export interface PasswordPolicyResult {
  ok: boolean;
  errors: string[];
}

export function evaluatePasswordPolicy(password: unknown): PasswordPolicyResult {
  const errors: string[] = [];
  if (typeof password !== "string") {
    return { ok: false, errors: ["senha deve ser uma string"] };
  }
  if (password.length < PASSWORD_MIN_LENGTH) {
    errors.push(`mínimo ${PASSWORD_MIN_LENGTH} caracteres`);
  }
  if (password.length > PASSWORD_MAX_LENGTH) {
    errors.push(`máximo ${PASSWORD_MAX_LENGTH} caracteres`);
  }
  if (!RE_UPPER.test(password)) errors.push("pelo menos 1 letra maiúscula");
  if (!RE_LOWER.test(password)) errors.push("pelo menos 1 letra minúscula");
  if (!RE_DIGIT.test(password)) errors.push("pelo menos 1 dígito");
  if (!RE_SYMBOL.test(password)) errors.push("pelo menos 1 símbolo");
  return { ok: errors.length === 0, errors };
}

function assertStrongPassword(password: unknown): asserts password is string {
  const result = evaluatePasswordPolicy(password);
  if (!result.ok) {
    throw new PasswordError("weak_password", result.errors.join("; "));
  }
}

// ---------------------------------------------------------------------------
// Hash + verify (Argon2id) — wrappers para facilitar mock em testes
// ---------------------------------------------------------------------------

export async function hashPassword(password: string): Promise<string> {
  assertStrongPassword(password);
  return argon2.hash(password, ARGON2_OPTS);
}

export async function verifyPasswordHash(
  storedHash: string,
  candidate: string,
): Promise<boolean> {
  if (typeof storedHash !== "string" || storedHash.length === 0) return false;
  if (typeof candidate !== "string" || candidate.length === 0) return false;
  try {
    return await argon2.verify(storedHash, candidate);
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Operações sobre password_credentials
// ---------------------------------------------------------------------------

export interface CreateCredentialInput {
  userId: string;
  password: string;
  /** Se true (default), gera token de verificação e marca verifiedAt=null. */
  requireEmailVerification?: boolean;
}

export interface CreateCredentialResult {
  userId: string;
  /** Token bruto de verificação (só presente se requireEmailVerification). */
  verificationRawToken?: string;
  verificationTokenExpiresAt?: Date;
}

/**
 * Cria credencial inicial. Falha se já existir credencial para o user
 * (idempotência seria perigosa aqui — quem cria credencial é o fluxo de
 * cadastro, e cadastrar duas vezes é um erro de fluxo).
 */
export async function createPasswordCredential(
  input: CreateCredentialInput,
): Promise<CreateCredentialResult> {
  if (!input.userId) {
    throw new PasswordError("internal_error", "userId obrigatório");
  }
  const argon2Hash = await hashPassword(input.password);

  const requireVerification = input.requireEmailVerification ?? true;
  let verificationRaw: string | undefined;
  let verificationHash: string | null = null;
  let verificationSentAt: Date | null = null;
  let verifiedAt: Date | null = null;
  let verificationExpiresAt: Date | undefined;

  if (requireVerification) {
    const pair = generateTokenPair();
    verificationRaw = pair.raw;
    verificationHash = pair.hash;
    verificationSentAt = new Date();
    verificationExpiresAt = new Date(Date.now() + VERIFICATION_TOKEN_TTL_MS);
  } else {
    verifiedAt = new Date();
  }

  try {
    await db().insert(passwordCredentials).values({
      userId: input.userId,
      argon2Hash,
      verifiedAt,
      verificationTokenHash: verificationHash,
      verificationSentAt,
      passwordChangedAt: new Date(),
      failedAttempts: 0,
      lockedUntil: null,
      resetTokenHash: null,
      resetTokenExpiresAt: null,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (
      /unique constraint/i.test(msg) ||
      /duplicate key/i.test(msg) ||
      /already exists/i.test(msg)
    ) {
      throw new PasswordError("credential_already_exists");
    }
    throw err;
  }

  return {
    userId: input.userId,
    verificationRawToken: verificationRaw,
    verificationTokenExpiresAt: verificationExpiresAt,
  };
}

/**
 * Verifica senha contra credencial armazenada e gerencia contador de falhas.
 *
 * Regras:
 *   • Se conta está em lockout, retorna `account_locked` sem tentar verificar.
 *   • Se senha bate, zera contador, atualiza lastUsedAt indiretamente (não
 *     persistido aqui — fica para sessions.ts).
 *   • Se senha não bate, incrementa contador. Atingindo limite, seta lockout.
 *   • Se e-mail não verificado, retorna `email_not_verified` para impedir login.
 */
export interface VerifyCredentialInput {
  userId: string;
  password: string;
}

export interface VerifyCredentialResult {
  ok: true;
  credential: PasswordCredentialRow;
}

export async function verifyPasswordCredential(
  input: VerifyCredentialInput,
): Promise<VerifyCredentialResult> {
  const rows = await db()
    .select()
    .from(passwordCredentials)
    .where(eq(passwordCredentials.userId, input.userId))
    .limit(1);
  const row = rows[0];
  if (!row) {
    throw new PasswordError("credential_not_found");
  }
  if (row.lockedUntil && row.lockedUntil.getTime() > Date.now()) {
    throw new PasswordError("account_locked");
  }
  if (row.verifiedAt === null) {
    throw new PasswordError("email_not_verified");
  }

  const ok = await verifyPasswordHash(row.argon2Hash, input.password);
  if (!ok) {
    const newCount = (row.failedAttempts ?? 0) + 1;
    const lockedUntil =
      newCount >= FAILED_ATTEMPTS_LOCKOUT_THRESHOLD
        ? new Date(Date.now() + LOCKOUT_DURATION_MS)
        : row.lockedUntil;
    await db()
      .update(passwordCredentials)
      .set({ failedAttempts: newCount, lockedUntil })
      .where(eq(passwordCredentials.userId, input.userId));
    if (newCount >= FAILED_ATTEMPTS_LOCKOUT_THRESHOLD) {
      throw new PasswordError("account_locked");
    }
    throw new PasswordError("invalid_credentials");
  }

  // Sucesso — zera contador e libera lockout
  if ((row.failedAttempts ?? 0) > 0 || row.lockedUntil !== null) {
    await db()
      .update(passwordCredentials)
      .set({ failedAttempts: 0, lockedUntil: null })
      .where(eq(passwordCredentials.userId, input.userId));
  }
  return { ok: true, credential: row };
}

// ---------------------------------------------------------------------------
// Verificação de e-mail
// ---------------------------------------------------------------------------

export interface ConfirmEmailInput {
  userId: string;
  rawToken: string;
}

export async function confirmEmailVerification(
  input: ConfirmEmailInput,
): Promise<{ verified: true }> {
  if (!input.rawToken) {
    throw new PasswordError("invalid_verification_token");
  }
  const tokenHash = hashToken(input.rawToken);
  const rows = await db()
    .select()
    .from(passwordCredentials)
    .where(eq(passwordCredentials.userId, input.userId))
    .limit(1);
  const row = rows[0];
  if (!row || row.verificationTokenHash !== tokenHash) {
    throw new PasswordError("invalid_verification_token");
  }
  if (row.verifiedAt !== null) {
    return { verified: true }; // idempotente
  }
  // Verificação não tem TTL explícito hoje — definimos 24h via verificationSentAt.
  if (
    row.verificationSentAt &&
    row.verificationSentAt.getTime() + VERIFICATION_TOKEN_TTL_MS < Date.now()
  ) {
    throw new PasswordError("invalid_verification_token", "token expirado");
  }
  await db()
    .update(passwordCredentials)
    .set({
      verifiedAt: new Date(),
      verificationTokenHash: null,
      verificationSentAt: null,
    })
    .where(eq(passwordCredentials.userId, input.userId));
  return { verified: true };
}

// ---------------------------------------------------------------------------
// Recuperação de senha
// ---------------------------------------------------------------------------

export interface RequestResetInput {
  userId: string;
}

export interface RequestResetResult {
  rawToken: string;
  expiresAt: Date;
}

export async function requestPasswordReset(
  input: RequestResetInput,
): Promise<RequestResetResult> {
  const { raw, hash } = generateTokenPair();
  const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MS);
  const [updated] = await db()
    .update(passwordCredentials)
    .set({ resetTokenHash: hash, resetTokenExpiresAt: expiresAt })
    .where(eq(passwordCredentials.userId, input.userId))
    .returning();
  if (!updated) {
    throw new PasswordError("credential_not_found");
  }
  return { rawToken: raw, expiresAt };
}

export interface ConsumeResetInput {
  userId: string;
  rawToken: string;
  newPassword: string;
}

export async function consumePasswordReset(
  input: ConsumeResetInput,
): Promise<{ reset: true }> {
  if (!input.rawToken) {
    throw new PasswordError("invalid_reset_token");
  }
  assertStrongPassword(input.newPassword);

  const rows = await db()
    .select()
    .from(passwordCredentials)
    .where(eq(passwordCredentials.userId, input.userId))
    .limit(1);
  const row = rows[0];
  if (!row || row.resetTokenHash === null) {
    throw new PasswordError("invalid_reset_token");
  }
  const expectedHash = hashToken(input.rawToken);
  if (row.resetTokenHash !== expectedHash) {
    throw new PasswordError("invalid_reset_token");
  }
  if (
    !row.resetTokenExpiresAt ||
    row.resetTokenExpiresAt.getTime() <= Date.now()
  ) {
    throw new PasswordError("invalid_reset_token", "token expirado");
  }

  const newHash = await hashPassword(input.newPassword);
  await db()
    .update(passwordCredentials)
    .set({
      argon2Hash: newHash,
      resetTokenHash: null,
      resetTokenExpiresAt: null,
      passwordChangedAt: new Date(),
      failedAttempts: 0,
      lockedUntil: null,
    })
    .where(eq(passwordCredentials.userId, input.userId));
  return { reset: true };
}

// ---------------------------------------------------------------------------
// Helpers expostos para testes unitários
// ---------------------------------------------------------------------------

export const _internal = {
  RE_UPPER,
  RE_LOWER,
  RE_DIGIT,
  RE_SYMBOL,
  assertStrongPassword,
};
