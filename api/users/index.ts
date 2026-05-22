/**
 * api/users/index.ts
 *
 * NowGo Users — endpoints de Gestão de Acesso (somente superadmin).
 *
 *  GET    /api/users          → lista todos os usuários da whitelist
 *  POST   /api/users          → adiciona novo usuário { email, name?, role? }
 *  PATCH  /api/users          → atualiza { email, active?, role? }
 *
 * Todas as rotas exigem cookie de sessão válido com role=superadmin.
 */

import { requireAuth, isSuperadmin } from "../../server/auth.js";
import {
  listAllUsers,
  upsertUser,
  setUserActive,
  setUserRole,
} from "../../server/nowgoUsersStore.js";

const VALID_ROLES = ["superadmin", "operador", "leitor"] as const;
type Role = (typeof VALID_ROLES)[number];

function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

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
  if (!isSuperadmin(claims)) {
    return res.status(403).json({ error: "Acesso restrito ao superadmin." });
  }

  // 2. Roteamento por método
  try {
    const method = (req.method ?? "GET").toUpperCase();

    if (method === "GET") {
      const users = await listAllUsers();
      // Ordena: superadmin primeiro, depois por email
      users.sort((a, b) => {
        if (a.role === "superadmin" && b.role !== "superadmin") return -1;
        if (b.role === "superadmin" && a.role !== "superadmin") return 1;
        return a.email.localeCompare(b.email);
      });
      res.setHeader("Cache-Control", "private, no-store");
      return res.status(200).json({ users });
    }

    if (method === "POST") {
      const body = await readJsonBody(req);
      const email = String(body.email ?? "").trim().toLowerCase();
      const name = body.name ? String(body.name).trim() : undefined;
      const roleRaw = String(body.role ?? "operador") as Role;

      if (!email || !isEmail(email)) {
        return res.status(400).json({ error: "E-mail inválido." });
      }
      if (!VALID_ROLES.includes(roleRaw)) {
        return res
          .status(400)
          .json({ error: `Papel inválido. Use: ${VALID_ROLES.join(", ")}` });
      }

      const created = await upsertUser({
        email,
        name,
        role: roleRaw,
        active: true,
      });

      return res.status(201).json({ user: created });
    }

    if (method === "PATCH") {
      const body = await readJsonBody(req);
      const email = String(body.email ?? "").trim().toLowerCase();
      if (!email || !isEmail(email)) {
        return res.status(400).json({ error: "E-mail inválido." });
      }

      // Proteção: superadmin não pode desativar a si mesmo
      if (
        email === (claims.sub ?? "").toLowerCase() &&
        body.active === false
      ) {
        return res.status(400).json({
          error: "Você não pode desativar sua própria conta superadmin.",
        });
      }

      if (typeof body.active === "boolean") {
        await setUserActive(email, body.active);
      }
      if (typeof body.role === "string" && VALID_ROLES.includes(body.role)) {
        await setUserRole(email, body.role as Role);
      }

      return res.status(200).json({ ok: true });
    }

    res.setHeader("Allow", "GET, POST, PATCH");
    return res.status(405).json({ error: "Método não permitido." });
  } catch (err: any) {
    console.error("[/api/users] erro:", err?.message);
    return res
      .status(500)
      .json({ error: err?.message ?? "Erro interno do servidor." });
  }
}
