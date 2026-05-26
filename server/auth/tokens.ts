/**
 * server/auth/tokens.ts
 *
 * Utilidades para geração e verificação de tokens criptográficos (convites,
 * recuperação de senha, verificação de e-mail, sessões).
 *
 * Princípios:
 *  • Geração via `crypto.randomBytes` (CSPRNG do Node).
 *  • O TOKEN bruto é entregue ao usuário (link de convite, cookie de sessão).
 *  • Apenas o **hash SHA-256** é persistido no banco — se a tabela vazar,
 *    o atacante não consegue reconstruir os tokens.
 *  • Comparação sempre `timingSafeEqual` para impedir timing attacks.
 *
 * Compatível com:
 *  • `invitations.tokenHash`
 *  • `sessions.sessionTokenHash`
 *  • `passwordCredentials.resetTokenHash` / `verificationTokenHash`
 */
import { createHash, randomBytes, timingSafeEqual } from "node:crypto";

/**
 * Tamanho default em BYTES (não chars) do token bruto.
 * 32 bytes = 256 bits ≈ 43 chars em base64url, 64 chars em hex.
 *
 * 256 bits é o piso recomendado pelo OWASP para tokens de longa duração
 * (convites válidos por 72h, sessões de 7d).
 */
export const TOKEN_RAW_BYTES = 32;

/**
 * Gera um token aleatório seguro como string base64url (sem padding,
 * URL-safe). Use o retorno em links de convite ou cookies de sessão.
 *
 * Atenção: o token bruto NUNCA deve ser persistido. Use `hashToken()` antes.
 */
export function generateRawToken(bytes: number = TOKEN_RAW_BYTES): string {
  if (bytes < 16) {
    throw new Error(
      `tokens: gerar token com menos de 16 bytes é inseguro (recebido: ${bytes})`,
    );
  }
  return randomBytes(bytes).toString("base64url");
}

/**
 * Hash SHA-256 de um token bruto, devolvido em hex (64 chars).
 * Determinístico — mesmo input sempre dá o mesmo output.
 */
export function hashToken(rawToken: string): string {
  if (typeof rawToken !== "string" || rawToken.length === 0) {
    throw new Error("tokens: rawToken deve ser string não-vazia");
  }
  return createHash("sha256").update(rawToken, "utf8").digest("hex");
}

/**
 * Compara dois hashes em tempo constante. Use para validar token vindo
 * de request contra o hash persistido — evita timing attacks.
 *
 * Aceita strings de qualquer tamanho; retorna `false` se os tamanhos
 * diferem (sem vazar a diferença).
 */
export function safeCompareHashes(a: string, b: string): boolean {
  if (typeof a !== "string" || typeof b !== "string") return false;
  const bufA = Buffer.from(a, "utf8");
  const bufB = Buffer.from(b, "utf8");
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

/**
 * Conveniência: hash + comparação contra o hash armazenado.
 * Use direto nas rotas de validação de convite, reset de senha, etc.
 */
export function verifyTokenAgainstHash(
  rawToken: string,
  storedHash: string,
): boolean {
  if (typeof rawToken !== "string" || typeof storedHash !== "string") {
    return false;
  }
  if (rawToken.length === 0 || storedHash.length === 0) return false;
  let computed: string;
  try {
    computed = hashToken(rawToken);
  } catch {
    return false;
  }
  return safeCompareHashes(computed, storedHash);
}

/**
 * Gera um par {raw, hash} em uma chamada — atalho usado por
 * `invitations.create`, `sessions.create`, `password.requestReset`.
 */
export function generateTokenPair(bytes: number = TOKEN_RAW_BYTES): {
  raw: string;
  hash: string;
} {
  const raw = generateRawToken(bytes);
  return { raw, hash: hashToken(raw) };
}
