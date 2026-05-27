/**
 * api/auth/v2/admin/bootstrap-helio.ts
 *
 * F47 — Endpoint admin TEMPORÁRIO para bootstrap do superadmin
 * `helio@nowgo.com.br` no banco de produção.
 *
 * Por que existe: a migration 0004 (`db/migrations/0004_seed_owner.sql`)
 * cria o tenant `nowgo-ai` + user superadmin Hélio + membership owner,
 * mas se ela não foi aplicada na produção, ninguém consegue logar.
 *
 * O que faz (idempotente):
 *   1. Garante o tenant `nowgo-ai` (plan enterprise).
 *   2. Garante o user `helio@nowgo.com.br` com `users.role = 'superadmin'`.
 *   3. Garante a membership `owner` em `nowgo_brain.tenant_members`.
 *   4. Garante uma `password_credentials` (com senha placeholder forte
 *      e `verified_at = now()`), e gera um token de reset válido por 1h.
 *   5. Retorna a URL completa de redefinição (a placeholder é destruída
 *      assim que o reset é consumido).
 *
 * Segurança:
 *   • Protegido por header `x-admin-token`. O token esperado é o próprio
 *     `JWT_SECRET` (já é segredo e não vaza ao client). Falta de match → 401.
 *   • Rejeita métodos diferentes de POST.
 *   • Não revela detalhes do banco em caso de erro.
 *
 * Plano de remoção: deletar este arquivo após o primeiro uso.
 */
import { sql } from "drizzle-orm";

import { createApiHandler } from "../../../../server/http/handlerFactory.js";
import { db } from "../../../../server/db/client.js";
import {
  hashPassword,
} from "../../../../server/auth/passwordCredentials.js";
import { generateTokenPair } from "../../../../server/auth/tokens.js";
import { z } from "zod";

const SUPERADMIN_EMAIL = "helio@nowgo.com.br";
const TENANT_SLUG = "nowgo-ai";
const RESET_TTL_MS = 60 * 60_000; // 1h

const InputSchema = z.object({
  origin: z.string().url(),
});

type Input = z.infer<typeof InputSchema>;

interface Output {
  ok: true;
  tenantId: string;
  userId: string;
  resetUrl: string;
  resetExpiresAt: string;
}

export default createApiHandler<Input, Output>({
  methods: ["POST"],
  schema: InputSchema,
  tag: "auth.v2.admin.bootstrap_helio",
  handler: async ({ req, input }) => {
    // 1) Auth simples por header (segredo já injetado em runtime)
    const provided = String(req.headers["x-admin-token"] ?? "");
    const expected = process.env.JWT_SECRET ?? "";
    if (!expected || provided.length === 0 || provided !== expected) {
      const err = new Error("unauthorized");
      (err as { httpStatus?: number }).httpStatus = 401;
      throw err;
    }

    // 2) Roda upserts idempotentes em uma transação
    //    Tenant → User → Membership → Credential → Reset Token
    const placeholderPassword =
      // Senha forte sintética; nunca é exposta ao usuário e é descartada
      // assim que ele consome o token de reset.
      "PlaceHolder!" + generateTokenPair(16).raw + "X1";
    const argon2Hash = await hashPassword(placeholderPassword);
    const { raw: resetRaw, hash: resetHash } = generateTokenPair();
    const resetExpiresAt = new Date(Date.now() + RESET_TTL_MS);

    const rows = await db().execute(sql`
      WITH t_up AS (
        INSERT INTO nowgo_brain.tenants (slug, name, plan, settings)
        VALUES (${TENANT_SLUG}, 'NowGo AI', 'enterprise',
                jsonb_build_object('is_internal', true,
                                   'description', 'Tenant interno do time NowGo AI'))
        ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
        RETURNING id
      ),
      u_up AS (
        INSERT INTO nowgo_brain.users (email, name, role)
        VALUES (${SUPERADMIN_EMAIL}, 'Hélio Guilherme', 'superadmin')
        ON CONFLICT (email) DO UPDATE
          SET role = 'superadmin', name = COALESCE(nowgo_brain.users.name, EXCLUDED.name)
        RETURNING id
      ),
      t_id AS (
        SELECT COALESCE((SELECT id FROM t_up),
                        (SELECT id FROM nowgo_brain.tenants WHERE slug = ${TENANT_SLUG})) AS id
      ),
      u_id AS (
        SELECT COALESCE((SELECT id FROM u_up),
                        (SELECT id FROM nowgo_brain.users WHERE email = ${SUPERADMIN_EMAIL})) AS id
      ),
      m_up AS (
        INSERT INTO nowgo_brain.tenant_members (tenant_id, user_id, role)
        SELECT (SELECT id FROM t_id), (SELECT id FROM u_id), 'owner'
        ON CONFLICT (tenant_id, user_id) DO UPDATE SET role = 'owner'
        RETURNING tenant_id, user_id
      ),
      t_owner AS (
        UPDATE nowgo_brain.tenants
           SET created_by_user_id = (SELECT id FROM u_id)
         WHERE slug = ${TENANT_SLUG}
           AND created_by_user_id IS NULL
        RETURNING id
      ),
      pc_up AS (
        INSERT INTO nowgo_brain.password_credentials
          (user_id, argon2_hash, verified_at, password_changed_at,
           failed_attempts, locked_until, reset_token_hash, reset_token_expires_at)
        SELECT (SELECT id FROM u_id), ${argon2Hash}, now(), now(),
               0, NULL, ${resetHash}, ${resetExpiresAt.toISOString()}::timestamptz
        ON CONFLICT (user_id) DO UPDATE
          SET reset_token_hash = ${resetHash},
              reset_token_expires_at = ${resetExpiresAt.toISOString()}::timestamptz,
              verified_at = COALESCE(nowgo_brain.password_credentials.verified_at, now()),
              failed_attempts = 0,
              locked_until = NULL
        RETURNING user_id
      )
      SELECT (SELECT id FROM t_id) AS tenant_id,
             (SELECT id FROM u_id) AS user_id,
             (SELECT user_id FROM m_up) AS membership_user_id,
             (SELECT user_id FROM pc_up) AS credential_user_id;
    `);

    const row = (rows as unknown as { rows?: Array<Record<string, unknown>> })
      .rows?.[0];
    const tenantId = String(row?.tenant_id ?? "");
    const userId = String(row?.user_id ?? "");
    if (!tenantId || !userId) {
      throw new Error("bootstrap_failed");
    }

    const resetUrl = `${input.origin.replace(/\/$/, "")}/redefinir-senha/${resetRaw}?email=${encodeURIComponent(SUPERADMIN_EMAIL)}`;

    return {
      ok: true,
      tenantId,
      userId,
      resetUrl,
      resetExpiresAt: resetExpiresAt.toISOString(),
    };
  },
});
