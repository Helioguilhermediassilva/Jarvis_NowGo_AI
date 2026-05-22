/**
 * api/brain/missions.ts
 *
 * CRUD de Missões SUN (reuso da database 📁 Projetos com Vertical=Missão SUN).
 *
 *  GET    /api/brain/missions                 → lista missões ativas
 *  POST   /api/brain/missions                 → cria nova missão
 *  PATCH  /api/brain/missions                 → atualiza missão { pageId, ... }
 *  DELETE /api/brain/missions?id=...          → arquiva missão
 *
 * RBAC:
 *  - leitor: GET only
 *  - operador / superadmin: tudo
 */

import { requireAuth } from "../../server/auth.js";
import { listarMissoesAtivas } from "../../server/brainQueries.js";
import {
  criarMissao,
  atualizarMissao,
  arquivarMissao,
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

const STATUS_VALIDOS = [
  "Ativo",
  "Em andamento",
  "Pausado",
  "Concluído",
  "Cancelado",
] as const;

const MAX_MISSOES_ATIVAS = 5;

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

  try {
    if (method === "GET") {
      const missions = await listarMissoesAtivas();
      return res.status(200).json({ missions });
    }

    if (method === "POST") {
      const body = await readJsonBody(req);
      const nome = String(body.nome ?? "").trim();
      if (!nome) {
        return res.status(400).json({ error: "Campo 'nome' é obrigatório." });
      }
      if (body.status && !STATUS_VALIDOS.includes(body.status)) {
        return res
          .status(400)
          .json({ error: `Status inválido. Use: ${STATUS_VALIDOS.join(", ")}` });
      }

      // Validação: máximo 5 missões ativas
      const ativas = await listarMissoesAtivas();
      if (ativas.length >= MAX_MISSOES_ATIVAS) {
        return res.status(409).json({
          error: `Já existem ${MAX_MISSOES_ATIVAS} missões ativas. Conclua ou arquive uma antes de criar outra.`,
        });
      }

      const result = await criarMissao({
        nome,
        status: body.status,
        scorePrioridade:
          typeof body.scorePrioridade === "number" ? body.scorePrioridade : undefined,
        proximoMarco: body.proximoMarco,
        dataProximoMarco: body.dataProximoMarco,
        valorContrato:
          typeof body.valorContrato === "number" ? body.valorContrato : undefined,
        notas: body.notas,
        confirmedByUser: true,
      });

      console.log(
        `[missions] CREATE by ${claims.sub}: ${nome} → ${result.pageId}`,
      );
      return res.status(201).json(result);
    }

    if (method === "PATCH") {
      const body = await readJsonBody(req);
      const pageId = String(body.pageId ?? "").trim();
      if (!pageId) {
        return res.status(400).json({ error: "pageId é obrigatório." });
      }
      if (body.status && !STATUS_VALIDOS.includes(body.status)) {
        return res.status(400).json({ error: "Status inválido." });
      }

      const result = await atualizarMissao({
        pageId,
        nome: body.nome,
        status: body.status,
        scorePrioridade:
          typeof body.scorePrioridade === "number" ? body.scorePrioridade : undefined,
        proximoMarco: body.proximoMarco,
        dataProximoMarco: body.dataProximoMarco,
        valorContrato:
          typeof body.valorContrato === "number" ? body.valorContrato : undefined,
        notas: body.notas,
        confirmedByUser: true,
      });

      console.log(
        `[missions] UPDATE by ${claims.sub}: ${pageId} (${result.updatedFields.join(",")})`,
      );
      return res.status(200).json(result);
    }

    if (method === "DELETE") {
      const url =
        typeof req.url === "string" ? new URL(req.url, "http://x") : null;
      const pageId =
        (req.query?.id as string | undefined) ??
        url?.searchParams.get("id") ??
        undefined;
      const motivo =
        (req.query?.motivo as string | undefined) ??
        url?.searchParams.get("motivo") ??
        undefined;

      if (!pageId) {
        return res.status(400).json({ error: "Parâmetro ?id=... é obrigatório." });
      }

      const result = await arquivarMissao({
        pageId,
        motivo,
        confirmedByUser: true,
      });

      console.log(
        `[missions] ARCHIVE by ${claims.sub}: ${pageId}${motivo ? ` (${motivo})` : ""}`,
      );
      return res.status(200).json(result);
    }

    res.setHeader("Allow", "GET, POST, PATCH, DELETE");
    return res.status(405).json({ error: "Método não permitido." });
  } catch (err: any) {
    console.error("[/api/brain/missions] erro:", err?.message);
    return res
      .status(500)
      .json({ error: err?.message ?? "Erro interno do servidor." });
  }
}
