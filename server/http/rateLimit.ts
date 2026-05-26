/**
 * server/http/rateLimit.ts
 *
 * Token-bucket em memória do processo (por instância serverless).
 *
 * Limitações conhecidas (aceitáveis para a fase 1 da F47):
 *   • Em serverless multi-instance (Vercel), cada cold start tem seu próprio
 *     bucket. Um atacante distribuindo 1 req por instância contornaria o limite.
 *     Mitigação: tunelaremos para Upstash Redis se virar problema (F48).
 *   • Em cold start, o bucket está cheio (defesa "graceful": não bloqueia
 *     usuário legítimo na primeira request).
 *
 * Limites recomendados (ajuste conforme telemetria):
 *   • /api/auth/v2/login: 5 req / 15min por IP+email
 *   • /api/auth/v2/login/mfa: 5 req / 15min por sessão de MFA
 *   • /api/auth/v2/password/reset-request: 3 req / 1h por IP+email
 *   • /api/auth/v2/invite/accept: 10 req / 15min por IP
 */

// ---------------------------------------------------------------------------
// Bucket
// ---------------------------------------------------------------------------

interface Bucket {
  /** Tokens disponíveis (float — refill é contínuo). */
  tokens: number;
  /** Última atualização em ms (Date.now). */
  lastRefillMs: number;
}

const BUCKETS = new Map<string, Bucket>();
/** Limite de chaves para evitar memory leak em serverless. */
const MAX_KEYS = 5000;

// ---------------------------------------------------------------------------
// API pública
// ---------------------------------------------------------------------------

export interface RateLimitOptions {
  /** Capacidade do bucket (tokens iniciais e máx). */
  capacity: number;
  /** Tokens adicionados por segundo. */
  refillPerSec: number;
  /** Custo desta requisição (default 1). */
  cost?: number;
  /** Now em ms (override para testes). */
  nowMs?: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  /** Segundos até o bucket ter capacity tokens novamente. */
  resetSec: number;
}

/**
 * Tenta consumir um token do bucket identificado por `key`. Retorna se foi
 * permitido + tokens restantes + ETA até bucket cheio.
 */
export function tryConsume(
  key: string,
  opts: RateLimitOptions,
): RateLimitResult {
  if (opts.capacity <= 0 || opts.refillPerSec < 0) {
    throw new Error("rateLimit: capacity>0 e refillPerSec>=0 obrigatórios");
  }
  const cost = opts.cost ?? 1;
  const now = opts.nowMs ?? Date.now();

  let bucket = BUCKETS.get(key);
  if (!bucket) {
    if (BUCKETS.size >= MAX_KEYS) {
      // Eviction simples: remove o mais antigo
      const firstKey = BUCKETS.keys().next().value;
      if (firstKey !== undefined) BUCKETS.delete(firstKey);
    }
    bucket = { tokens: opts.capacity, lastRefillMs: now };
    BUCKETS.set(key, bucket);
  } else {
    // Refill proporcional ao tempo passado
    const elapsedSec = (now - bucket.lastRefillMs) / 1000;
    const refilled = bucket.tokens + elapsedSec * opts.refillPerSec;
    bucket.tokens = Math.min(opts.capacity, refilled);
    bucket.lastRefillMs = now;
  }

  if (bucket.tokens >= cost) {
    bucket.tokens -= cost;
    return {
      allowed: true,
      remaining: Math.floor(bucket.tokens),
      resetSec:
        opts.refillPerSec > 0
          ? Math.ceil((opts.capacity - bucket.tokens) / opts.refillPerSec)
          : Infinity,
    };
  }

  return {
    allowed: false,
    remaining: Math.floor(bucket.tokens),
    resetSec:
      opts.refillPerSec > 0
        ? Math.ceil((cost - bucket.tokens) / opts.refillPerSec)
        : Infinity,
  };
}

/**
 * Helper: monta a chave canônica `prefix:identifier`. Ex:
 *   rlKey("login", `${ip}:${email}`)  → "login:1.2.3.4:user@x.com"
 */
export function rlKey(prefix: string, identifier: string): string {
  return `${prefix}:${identifier}`;
}

/** Reseta TUDO. Apenas para testes. */
export function _resetAllBuckets(): void {
  BUCKETS.clear();
}

export const _internal = { BUCKETS, MAX_KEYS };
