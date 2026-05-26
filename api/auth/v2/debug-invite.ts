/**
 * api/auth/v2/debug-invite.ts
 *
 * ENDPOINT DEBUG TEMPORÁRIO — F47.
 * Vai SER REMOVIDO após o diagnóstico estar concluído.
 *
 * Versão 2: enriquecida para extrair `code`/`cause`/host:port da string
 * de conexão PG sem revelar senha. Também tenta uma query SELECT 1
 * direta no driver pg para isolar Drizzle do driver.
 *
 * Modos:
 *   ?action=env   → mostra hostname/port/parâmetros da NOWGO_BRAIN_PG_URL
 *   ?action=ping  → faz SELECT 1 direto via driver pg
 *   default       → tenta validateInvitationToken com token=...
 */
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { Pool } from "pg";

import { validateInvitationToken } from "../../../server/auth/invitations.js";

interface PgError extends Error {
  code?: string;
  errno?: string | number;
  syscall?: string;
  hostname?: string;
  cause?: unknown;
  severity?: string;
  detail?: string;
  routine?: string;
}

function describeError(err: unknown): Record<string, unknown> {
  const e = err as PgError;
  const cause = e?.cause as PgError | undefined;
  return {
    name: e?.name ?? typeof err,
    message: e?.message ?? String(err),
    code: e?.code ?? null,
    errno: e?.errno ?? null,
    syscall: e?.syscall ?? null,
    hostname: e?.hostname ?? null,
    severity: e?.severity ?? null,
    detail: e?.detail ?? null,
    routine: e?.routine ?? null,
    causeName: cause?.name ?? null,
    causeMessage: cause?.message ?? null,
    causeCode: cause?.code ?? null,
    causeErrno: cause?.errno ?? null,
    causeSyscall: cause?.syscall ?? null,
    causeHostname: cause?.hostname ?? null,
    stack:
      typeof e?.stack === "string" ? e.stack.split("\n").slice(0, 8) : null,
  };
}

function describeUrl(url: string | undefined): Record<string, unknown> {
  if (!url) return { present: false };
  try {
    const u = new URL(url);
    return {
      present: true,
      protocol: u.protocol,
      hostname: u.hostname,
      port: u.port,
      pathname: u.pathname,
      hasPassword: u.password.length > 0,
      passwordLength: u.password.length,
      searchParams: Object.fromEntries(u.searchParams.entries()),
      // mascarado para evitar vazamento
      userPrefix: u.username.slice(0, 12),
      isPooler: u.hostname.endsWith(".pooler.supabase.com"),
      isTransactionPort: u.port === "6543",
    };
  } catch (err) {
    return { present: true, parseError: String(err) };
  }
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
): Promise<void> {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "GET") {
    res.status(405).json({ error: "method_not_allowed" });
    return;
  }
  const action = String(req.query.action ?? "validate");

  const envInfo = {
    nodeEnv: process.env.NODE_ENV ?? null,
    vercelEnv: process.env.VERCEL_ENV ?? null,
    pgUrl: describeUrl(process.env.NOWGO_BRAIN_PG_URL),
  };

  if (action === "env") {
    res.status(200).json({ env: envInfo });
    return;
  }

  if (action === "ping") {
    // Conexão crua via pg, sem Drizzle, para isolar a camada de driver.
    let pool: Pool | null = null;
    try {
      pool = new Pool({
        connectionString: process.env.NOWGO_BRAIN_PG_URL,
        ssl: { rejectUnauthorized: false },
        max: 1,
        connectionTimeoutMillis: 8000,
      });
      const r = await pool.query("SELECT 1 AS ok, current_user, version() AS v");
      res.status(200).json({
        ok: true,
        result: r.rows[0],
        env: envInfo,
      });
    } catch (err) {
      res.status(200).json({ ok: false, error: describeError(err), env: envInfo });
    } finally {
      try {
        await pool?.end();
      } catch {
        // ignore
      }
    }
    return;
  }

  // Default: validate via módulo F47
  const token = String(req.query.token ?? "test_token_12345678");
  if (token.length < 8) {
    res.status(400).json({ error: "token_too_short" });
    return;
  }
  try {
    const result = await validateInvitationToken(token);
    res
      .status(200)
      .json({ ok: true, found: true, invitation: result.invitation, env: envInfo });
  } catch (err) {
    res.status(200).json({ ok: false, error: describeError(err), env: envInfo });
  }
}
