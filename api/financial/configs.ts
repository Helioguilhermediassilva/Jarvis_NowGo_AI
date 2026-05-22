/**
 * api/financial/configs.ts
 *
 * Persistência de overrides de configuração financeira no NowGo Configs.
 *
 *  GET  /api/financial/configs           → lista valores atuais (qualquer auth)
 *  POST /api/financial/configs           → define um override (superadmin only)
 *      body: { key: "META_2026_BRL" | "TICKET_MEDIO_BRL" | "REALIZADO_YTD_OVERRIDE_BRL", value: number, notas?: string }
 *
 * Reflete imediatamente no próximo GET /api/financial/kpis.
 */

import { requireAuth } from "../../server/auth.js";
import {
  getConfigNumber,
  setConfig,
} from "../../server/nowgoConfigsStore.js";
import {
  META_2026_BRL,
  TICKET_MEDIO_BRL,
} from "../../server/financialKpis.js";

const KEYS_PERMITIDAS = new Set([
  "META_2026_BRL",
  "TICKET_MEDIO_BRL",
  "REALIZADO_YTD_OVERRIDE_BRL",
]);

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

  try {
    if (method === "GET") {
      const [meta, ticket, realizado] = await Promise.all([
        getConfigNumber("META_2026_BRL", META_2026_BRL),
        getConfigNumber("TICKET_MEDIO_BRL", TICKET_MEDIO_BRL),
        getConfigNumber("REALIZADO_YTD_OVERRIDE_BRL", -1),
      ]);
      return res.status(200).json({
        configs: {
          META_2026_BRL: meta,
          TICKET_MEDIO_BRL: ticket,
          REALIZADO_YTD_OVERRIDE_BRL:
            realizado >= 0 ? realizado : null,
        },
        defaults: {
          META_2026_BRL: META_2026_BRL,
          TICKET_MEDIO_BRL: TICKET_MEDIO_BRL,
        },
      });
    }

    if (method === "POST") {
      // Apenas superadmin pode mudar configs financeiras
      if (claims.role !== "superadmin") {
        return res.status(403).json({
          error: "Apenas superadmin pode editar configurações financeiras.",
        });
      }

      const body = await readJsonBody(req);
      const key = String(body.key ?? "").trim();
      const value = Number(body.value);
      const notas = body.notas ? String(body.notas).slice(0, 200) : undefined;

      if (!KEYS_PERMITIDAS.has(key)) {
        return res
          .status(400)
          .json({
            error: `Chave inválida. Permitidas: ${Array.from(KEYS_PERMITIDAS).join(", ")}`,
          });
      }
      if (!Number.isFinite(value) || value < 0) {
        return res
          .status(400)
          .json({ error: "Valor deve ser número positivo." });
      }

      const result = await setConfig(key, value, claims.sub, notas);
      console.log(
        `[configs] ${claims.sub} alterou ${key} = ${value}${notas ? ` (${notas})` : ""}`,
      );
      return res.status(200).json({ ok: true, config: result });
    }

    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ error: "Método não permitido." });
  } catch (err: any) {
    console.error("[/api/financial/configs] erro:", err?.message);
    return res
      .status(500)
      .json({ error: err?.message ?? "Erro interno." });
  }
}
