/**
 * api/brain/deal-rooms.ts
 *
 *  GET   /api/brain/deal-rooms[?limit=5]                  → top-N ranking
 *  PATCH /api/brain/deal-rooms { pageId, decisor?, contato? }  → atualiza decisor (F30)
 *  POST  /api/brain/deal-rooms/resolve { pageId, notaFinal? } → marca como Fechado-Ganho (F30)
 *
 * NOTA: como o roteamento Vercel não tem subpath aqui, usamos `?action=resolve`
 * no POST para evitar criar outra função serverless.
 *
 * RBAC:
 *  - leitor: somente GET
 *  - operador/superadmin: GET + PATCH + POST
 */

import { requireAuth } from "../../server/auth.js";
import {
  listarTopDealRooms,
  proximoDealRoomCandidato,
} from "../../server/brainQueries.js";
import {
  atualizarDecisor,
  resolverDealAtivoCrm,
} from "../../server/brainMutations.js";

async function readJsonBody(req: any): Promise<any> {
  if (req.body && typeof req.body === "object") return req.body;
  if (typeof req.body === "string") {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }
  return await new Promise((resolve) => {
    let raw = "";
    req.on("data", (chunk: Buffer | string) => (raw += chunk));
    req.on("end", () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch {
        resolve({});
      }
    });
    req.on("error", () => resolve({}));
  });
}

export default async function handler(req: any, res: any) {
  const claims = await requireAuth(req).catch(() => null);
  if (!claims) {
    return res.status(401).json({ error: "Não autenticado." });
  }
  const method = (req.method ?? "GET").toUpperCase();
  res.setHeader("Cache-Control", "private, no-store");

  if (claims.role === "leitor" && method !== "GET") {
    return res
      .status(403)
      .json({ error: "Apenas leitura. Solicite acesso operador para escrever." });
  }

  const url =
    typeof req.url === "string" ? new URL(req.url, "http://x") : null;

  try {
    if (method === "GET") {
      const limit = Math.min(
        10,
        Math.max(1, parseInt(url?.searchParams.get("limit") ?? "5", 10)),
      );
      const dealRooms = await listarTopDealRooms(limit);
      return res.status(200).json({
        dealRooms,
        limit,
        generatedAt: new Date().toISOString(),
      });
    }

    if (method === "PATCH") {
      const body = await readJsonBody(req);
      const pageId = String(body?.pageId ?? "");
      if (!pageId) {
        return res.status(400).json({ error: "pageId obrigatório." });
      }
      const out = await atualizarDecisor({
        pageId,
        decisor: typeof body?.decisor === "string" ? body.decisor : undefined,
        contato: typeof body?.contato === "string" ? body.contato : undefined,
        confirmedByUser: true,
      });
      return res.status(200).json({ ok: true, ...out });
    }

    if (method === "POST") {
      const action = url?.searchParams.get("action") ?? "resolve";
      if (action !== "resolve") {
        return res.status(400).json({ error: `Action desconhecida: ${action}` });
      }
      const body = await readJsonBody(req);
      const pageId = String(body?.pageId ?? "");
      if (!pageId) {
        return res.status(400).json({ error: "pageId obrigatório." });
      }
      const notaFinal =
        typeof body?.notaFinal === "string" && body.notaFinal.trim().length > 0
          ? body.notaFinal
          : undefined;
      const top = await listarTopDealRooms(5);
      const currentTopIds = top.map((d) => d.id);
      const result = await resolverDealAtivoCrm({
        pageId,
        notaFinal,
        confirmedByUser: true,
      });
      const proximo = await proximoDealRoomCandidato(currentTopIds);
      return res.status(200).json({
        ok: true,
        pageId: result.pageId,
        ataPageId: result.ataPageId,
        proximoCandidato: proximo
          ? {
              pageId: proximo.id,
              nome: proximo.nome,
              estagio: proximo.estagio,
              score: proximo.score,
              valorEstimado: proximo.valorEstimado,
            }
          : null,
      });
    }

    return res.status(405).json({ error: `Method ${method} not allowed` });
  } catch (err: any) {
    console.error("[/api/brain/deal-rooms] erro:", err?.message);
    return res
      .status(500)
      .json({ error: err?.message ?? "Erro ao processar deal rooms." });
  }
}
