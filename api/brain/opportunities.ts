/**
 * api/brain/opportunities.ts
 *
 * CRUD de Oportunidades do Pipeline NowGo.
 *
 *  POST   /api/brain/opportunities            → cria nova oportunidade
 *  PATCH  /api/brain/opportunities            → atualiza campos { pageId, ... }
 *  DELETE /api/brain/opportunities?id=...     → arquiva oportunidade (soft delete)
 *
 * RBAC:
 *  - leitor: 403 (somente leitura)
 *  - operador: pode criar/atualizar; pode arquivar (com motivo)
 *  - superadmin: pode tudo
 */

import { requireAuth } from "../../server/auth.js";
import {
  criarOportunidade,
  atualizarOportunidade,
  arquivarOportunidade,
} from "../../server/brainMutations.js";
import {
  listarOportunidadesQuentes,
  listarTopPorScore,
} from "../../server/brainQueries.js";
import { PIPELINE_STAGES } from "../../server/brainSchema.js";

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
  // 1. Validar sessão
  const claims = await requireAuth(req).catch(() => null);
  if (!claims) {
    return res.status(401).json({ error: "Não autenticado." });
  }

  const method = (req.method ?? "GET").toUpperCase();
  res.setHeader("Cache-Control", "private, no-store");

  // Leitor só pode GET
  if (claims.role === "leitor" && method !== "GET") {
    return res
      .status(403)
      .json({ error: "Apenas leitura. Solicite acesso operador para escrever." });
  }

  try {
    if (method === "GET") {
      // Lista oportunidades vivas do Brain (lícito a todos os papéis incl. leitor)
      const url =
        typeof req.url === "string" ? new URL(req.url, "http://x") : null;
      const mode = url?.searchParams.get("mode") ?? "hot";
      const limit = Math.min(
        100,
        Math.max(1, parseInt(url?.searchParams.get("limit") ?? "50", 10)),
      );

      const opps =
        mode === "top"
          ? await listarTopPorScore(limit)
          : await listarOportunidadesQuentes(limit);

      return res.status(200).json({ opportunities: opps, mode, limit });
    }

    if (method === "POST") {
      const body = await readJsonBody(req);
      const nome = String(body.nome ?? "").trim();
      if (!nome) {
        return res.status(400).json({ error: "Campo 'nome' é obrigatório." });
      }
      if (body.estagio && !PIPELINE_STAGES.includes(body.estagio)) {
        return res
          .status(400)
          .json({ error: `Estágio inválido. Use: ${PIPELINE_STAGES.join(", ")}` });
      }

      const result = await criarOportunidade({
        nome,
        empresa: body.empresa,
        estagio: body.estagio,
        valorEstimado:
          typeof body.valorEstimado === "number" ? body.valorEstimado : undefined,
        probabilidade:
          typeof body.probabilidade === "number" ? body.probabilidade : undefined,
        score: typeof body.score === "number" ? body.score : undefined,
        proximoFollowUp: body.proximoFollowUp,
        urgencia: body.urgencia,
        pontoTensao: body.pontoTensao,
        criterioProximaFase: body.criterioProximaFase,
        notas: body.notas,
        cluster: body.cluster,
        agenteResponsavel: body.agenteResponsavel,
        confirmedByUser: true,
      });

      console.log(
        `[opportunities] CREATE by ${claims.sub}: ${nome} → ${result.pageId}`,
      );
      return res.status(201).json(result);
    }

    if (method === "PATCH") {
      const body = await readJsonBody(req);
      const pageId = String(body.pageId ?? "").trim();
      if (!pageId) {
        return res.status(400).json({ error: "pageId é obrigatório." });
      }
      if (body.estagio && !PIPELINE_STAGES.includes(body.estagio)) {
        return res.status(400).json({ error: "Estágio inválido." });
      }

      const result = await atualizarOportunidade({
        pageId,
        estagio: body.estagio,
        score: typeof body.score === "number" ? body.score : undefined,
        probabilidade:
          typeof body.probabilidade === "number" ? body.probabilidade : undefined,
        valorEstimado:
          typeof body.valorEstimado === "number" ? body.valorEstimado : undefined,
        proximoFollowUp: body.proximoFollowUp,
        urgencia: body.urgencia,
        pontoTensao: body.pontoTensao,
        criterioProximaFase: body.criterioProximaFase,
        notas: body.notas,
        confirmedByUser: true,
      });

      console.log(
        `[opportunities] UPDATE by ${claims.sub}: ${pageId} (${result.updatedFields.join(",")})`,
      );
      return res.status(200).json(result);
    }

    if (method === "DELETE") {
      const pageId =
        (req.query?.id as string | undefined) ??
        (typeof req.url === "string"
          ? new URL(req.url, "http://x").searchParams.get("id") ?? undefined
          : undefined);
      const motivo = (req.query?.motivo as string | undefined) ?? undefined;

      if (!pageId) {
        return res.status(400).json({ error: "Parâmetro ?id=... é obrigatório." });
      }

      const result = await arquivarOportunidade({
        pageId,
        motivo,
        confirmedByUser: true,
      });

      console.log(
        `[opportunities] ARCHIVE by ${claims.sub}: ${pageId}${motivo ? ` (${motivo})` : ""}`,
      );
      return res.status(200).json(result);
    }

    res.setHeader("Allow", "POST, PATCH, DELETE");
    return res.status(405).json({ error: "Método não permitido." });
  } catch (err: any) {
    console.error("[/api/brain/opportunities] erro:", err?.message);
    return res
      .status(500)
      .json({ error: err?.message ?? "Erro interno do servidor." });
  }
}
