/**
 * api/brain/diag.ts
 *
 * Endpoint de diagnóstico — devolve apenas presença/comprimento das variáveis
 * críticas (jamais o valor) para podermos investigar falhas em produção sem
 * abrir os logs do Vercel.
 *
 * NUNCA loga o conteúdo das chaves. Apenas comprimento e primeiros 4 chars do
 * prefixo (que são públicos por convenção: `ntn_`, `xai-`, `sk_`).
 */

import type { VercelRequest, VercelResponse } from "@vercel/node";

function maskKey(value: string | undefined): { present: boolean; length: number; prefix: string } {
  if (!value) return { present: false, length: 0, prefix: "" };
  return { present: true, length: value.length, prefix: value.slice(0, 4) };
}

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  const env = process.env;

  const diag = {
    runtime: {
      node: process.version,
      platform: process.platform,
      vercelEnv: env.VERCEL_ENV ?? null,
      vercelRegion: env.VERCEL_REGION ?? null,
      gitSha: env.VERCEL_GIT_COMMIT_SHA ?? null,
    },
    envs: {
      NOTION_API_KEY: maskKey(env.NOTION_API_KEY),
      XAI_API_KEY: maskKey(env.XAI_API_KEY),
      ELEVENLABS_API_KEY: maskKey(env.ELEVENLABS_API_KEY),
      JARVIS_COCKPIT_SECRET: maskKey(env.JARVIS_COCKPIT_SECRET),
    },
    // Testa um fetch real à API do Notion (só status, sem expor dados).
    notionPing: await pingNotion(env.NOTION_API_KEY),
  };

  return res.status(200).json(diag);
}

async function pingNotion(token: string | undefined): Promise<{
  reachable: boolean;
  status: number | null;
  errorBody: string | null;
}> {
  if (!token) return { reachable: false, status: null, errorBody: "no_token" };
  try {
    const r = await fetch("https://api.notion.com/v1/users/me", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Notion-Version": "2022-06-28",
      },
    });
    return {
      reachable: true,
      status: r.status,
      errorBody: r.ok ? null : (await r.text()).slice(0, 200),
    };
  } catch (e) {
    return { reachable: false, status: null, errorBody: (e as Error).message.slice(0, 200) };
  }
}
