/**
 * ttsWarmup.ts
 *
 * Pre-popula o cache de áudio TTS (IndexedDB) com frases canônicas que o Jarvis
 * usa com altíssima frequência, eliminando o TTFB de ~900ms na primeira execução
 * de cada frase. Dispara em background logo após o cockpit montar — não bloqueia
 * nem afeta a interação.
 *
 * Política:
 *  - Só roda uma vez por sessão (flag em memória + chave no localStorage).
 *  - Roda em paralelo (até 4 concorrentes) para não saturar a aba.
 *  - Falhas são silenciosas — warmup é puramente opcional.
 *  - Detecta cache hit prévio antes de chamar o backend.
 */

import {
  getCachedTtsBlob,
  isCacheableText,
  putCachedTtsBlob,
  ttsCacheKey,
} from "./ttsAudioCache";

const DEFAULT_VOICE_ID = "F1W6zKJWyDQD3yKJc4A6";
const WARMUP_STAMP_KEY = "jarvis.ttsWarmup.v1";
const WARMUP_STAMP_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 dias
const MAX_CONCURRENT = 4;

/**
 * Frases canônicas. Mantenha curtas (≤80 chars) e exatamente como o Jarvis as
 * pronuncia em produção. Mudar a frase = nova chave de cache = perda de hit.
 */
export const WARMUP_PHRASES: readonly string[] = [
  "À disposição, senhor.",
  "Sim, senhor.",
  "Compreendido, senhor.",
  "Em andamento, senhor.",
  "Em que posso ajudar?",
  "Um momento, senhor.",
  "Consultando o Brain, senhor.",
  "Concluído, senhor.",
  "Confirma?",
  "Posso prosseguir?",
];

let warmupStarted = false;

/**
 * Dispara o warmup em background. Idempotente. Pode ser chamado a cada mount
 * do cockpit — só efetivamente executa uma vez por janela de TTL.
 */
export function startTtsWarmup(opts?: {
  voiceId?: string;
  phrases?: readonly string[];
}): void {
  if (warmupStarted) return;
  warmupStarted = true;

  // Checa stamp no localStorage para não repetir em janelas curtas.
  try {
    const raw = localStorage.getItem(WARMUP_STAMP_KEY);
    if (raw) {
      const ts = Number(raw);
      if (Number.isFinite(ts) && Date.now() - ts < WARMUP_STAMP_TTL_MS) {
        // Já warmed up recentemente — assume cache populado.
        return;
      }
    }
  } catch {
    // localStorage indisponível → segue com warmup mesmo assim.
  }

  const voiceId = opts?.voiceId ?? DEFAULT_VOICE_ID;
  const phrases = (opts?.phrases ?? WARMUP_PHRASES).filter(isCacheableText);

  // Dispara em background sem await — não bloqueia nada.
  void runWarmup(phrases, voiceId).then(() => {
    try {
      localStorage.setItem(WARMUP_STAMP_KEY, String(Date.now()));
    } catch {
      /* ignore */
    }
  });
}

async function runWarmup(phrases: readonly string[], voiceId: string): Promise<void> {
  // Pool simples de concorrência.
  const queue = [...phrases];
  const workers: Promise<void>[] = [];
  for (let i = 0; i < MAX_CONCURRENT; i += 1) {
    workers.push(
      (async () => {
        while (queue.length > 0) {
          const phrase = queue.shift();
          if (!phrase) return;
          try {
            await warmupOne(phrase, voiceId);
          } catch {
            // Silencioso — warmup é best-effort.
          }
        }
      })(),
    );
  }
  await Promise.all(workers);
}

async function warmupOne(text: string, voiceId: string): Promise<void> {
  const key = await ttsCacheKey(text, voiceId);
  const existing = await getCachedTtsBlob(key);
  if (existing) return; // já em cache
  const resp = await fetch("/api/jarvis/tts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, voiceId }),
  });
  if (!resp.ok || !resp.body) return;
  const reader = resp.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value && value.length > 0) {
      chunks.push(value);
      total += value.length;
    }
  }
  if (total === 0) return;
  const blob = new Blob(chunks as BlobPart[], { type: "audio/mpeg" });
  await putCachedTtsBlob(key, blob, text);
}
