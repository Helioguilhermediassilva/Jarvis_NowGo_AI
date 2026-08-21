/**
 * Handoff seguro do NowGo para o Xavier.
 *
 * O token é uma credencial transitória, criptografada com AES-256-GCM,
 * expira rapidamente e não contém o cookie/sessão V2. O mesmo segredo deve
 * ser configurado em ambos os projetos Vercel como NOWGO_XAVIER_HANDOFF_SECRET.
 */
import { createCipheriv, createHash, randomBytes } from "node:crypto";

const TOKEN_VERSION = "v1";
const IV_BYTES = 12;
const MIN_SECRET_LENGTH = 32;

export interface XavierHandoffPayload {
  userId: string;
  tenantId: string;
  email: string;
  locale: "pt" | "en" | "es";
  issuedAt: number;
  expiresAt: number;
  nonce: string;
}

function secretKey(): Buffer {
  const secret = process.env.NOWGO_XAVIER_HANDOFF_SECRET?.trim();
  if (!secret || secret.length < MIN_SECRET_LENGTH) {
    throw new Error("NOWGO_XAVIER_HANDOFF_SECRET não configurado corretamente");
  }
  return createHash("sha256").update(secret, "utf8").digest();
}

function encode(value: Buffer): string {
  return value.toString("base64url");
}

/** Cria um token de handoff com validade padrão de dois minutos. */
export function createXavierHandoffToken(input: {
  userId: string;
  tenantId: string;
  email: string;
  locale: "pt" | "en" | "es";
  ttlSeconds?: number;
}): string {
  const issuedAt = Math.floor(Date.now() / 1000);
  const expiresAt = issuedAt + Math.min(Math.max(input.ttlSeconds ?? 120, 30), 300);
  const payload: XavierHandoffPayload = {
    userId: input.userId,
    tenantId: input.tenantId,
    email: input.email,
    locale: input.locale,
    issuedAt,
    expiresAt,
    nonce: randomBytes(16).toString("hex"),
  };

  const iv = randomBytes(IV_BYTES);
  const cipher = createCipheriv("aes-256-gcm", secretKey(), iv);
  const encrypted = Buffer.concat([
    cipher.update(JSON.stringify(payload), "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();
  return [TOKEN_VERSION, encode(iv), encode(tag), encode(encrypted)].join(".");
}

export const _internal = { secretKey, encode };
