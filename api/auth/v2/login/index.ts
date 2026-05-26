/**
 * api/auth/v2/login/index.ts  →  POST /api/auth/v2/login
 *
 * F47 — Login com e-mail + senha local (Argon2id).
 *
 * Fluxo:
 *   1. Rate limit por IP+email (5 / 15min).
 *   2. Resolve user por e-mail (case-insensitive). Se não existir, devolve
 *      erro genérico `invalid_credentials` (anti-enumeração).
 *   3. Resolve tenant alvo:
 *      • Se body informa `tenantSlug`, valida que o user é membro;
 *      • Caso contrário, pega o primeiro `tenant_members` do usuário.
 *      • Se nenhuma membership existe, devolve `invalid_credentials`.
 *   4. Chama `verifyPasswordCredential(userId, password)`. Erros tipados
 *      (account_locked, email_not_verified, invalid_credentials) viram
 *      status apropriados via handlerFactory.
 *   5. Se o usuário tem MFA ativo, NÃO emite cookie de sessão final;
 *      retorna `{ requiresMfa: true, mfaTicket }` — um token curto
 *      (15min) referenciando a credencial parcial. O frontend redireciona
 *      para `/login/mfa` com o ticket.
 *   6. Se não tem MFA ativo, mas a role exige (superadmin/owner/admin),
 *      retorna `{ requiresMfaSetup: true, mfaTicket }`.
 *   7. Caso contrário, cria sessão V2 e devolve cookie `nowgo_session_v2`.
 *
 * O `mfaTicket` é um JWT-like (HS256) curto contendo userId+tenantId+iat+exp,
 * assinado com `JWT_SECRET`. NÃO é cookie — o frontend o carrega no body do
 * próximo POST.
 */
import { z } from "zod";
import { eq, and } from "drizzle-orm";
import { createHmac, randomBytes } from "node:crypto";

import { createApiHandler } from "../../../../server/http/handlerFactory.js";
import { db } from "../../../../server/db/client.js";
import {
  users,
  tenantMembers,
  tenants,
} from "../../../../server/db/schema.js";
import {
  verifyPasswordCredential,
  PasswordError,
} from "../../../../server/auth/passwordCredentials.js";
import { hasMfa } from "../../../../server/auth/mfaTotp.js";
import {
  createSession,
  serializeCookie,
} from "../../../../server/auth/sessions.js";
import { tryConsume, rlKey } from "../../../../server/http/rateLimit.js";

// ---------------------------------------------------------------------------
// Ticket helper (HS256 mini-JWT) — usado entre /login e /login/mfa
// ---------------------------------------------------------------------------

const TICKET_TTL_SEC = 15 * 60; // 15 min

interface MfaTicketPayload {
  userId: string;
  tenantId: string;
  /** "challenge" | "setup" — para o frontend diferenciar telas. */
  intent: "challenge" | "setup";
  iat: number;
  exp: number;
  /** Nonce aleatório p/ impedir reuso. */
  nonce: string;
}

function b64url(buf: Buffer): string {
  return buf
    .toString("base64")
    .replace(/=+$/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function getJwtSecret(): string {
  const s = process.env.JWT_SECRET;
  if (!s || s.length < 16) {
    throw new Error("JWT_SECRET ausente ou muito curto");
  }
  return s;
}

export function signMfaTicket(payload: Omit<MfaTicketPayload, "iat" | "exp" | "nonce">): string {
  const now = Math.floor(Date.now() / 1000);
  const full: MfaTicketPayload = {
    ...payload,
    iat: now,
    exp: now + TICKET_TTL_SEC,
    nonce: randomBytes(8).toString("hex"),
  };
  const body = b64url(Buffer.from(JSON.stringify(full)));
  const sig = b64url(
    createHmac("sha256", getJwtSecret()).update(body).digest(),
  );
  return `${body}.${sig}`;
}

// ---------------------------------------------------------------------------
// Schema + handler
// ---------------------------------------------------------------------------

const InputSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1).max(256),
  /** Slug do tenant para login. Se omitido, usa primeiro membership. */
  tenantSlug: z.string().min(1).max(80).optional(),
});

type Input = z.infer<typeof InputSchema>;

interface LoginOk {
  ok: true;
  userId: string;
  tenantId: string;
  requiresMfa: false;
  requiresMfaSetup: false;
}
interface LoginNeedMfa {
  ok: false;
  requiresMfa: true;
  requiresMfaSetup: false;
  mfaTicket: string;
}
interface LoginNeedSetup {
  ok: false;
  requiresMfa: false;
  requiresMfaSetup: true;
  mfaTicket: string;
}
type Output = LoginOk | LoginNeedMfa | LoginNeedSetup;

const ROLES_REQUIRING_MFA: ReadonlySet<string> = new Set([
  "superadmin",
  "owner",
  "admin",
]);

export default createApiHandler<Input, Output>({
  methods: ["POST"],
  schema: InputSchema,
  tag: "auth.v2.login",
  handler: async ({ req, res, input, clientIp }) => {
    const email = input.email.trim().toLowerCase();

    // 1) Rate limit por IP + email — 5 reqs / 15 min
    const rl = tryConsume(rlKey("login", `${clientIp}:${email}`), {
      capacity: 5,
      refillPerSec: 5 / (15 * 60),
    });
    if (!rl.allowed) {
      res.setHeader("Retry-After", String(rl.resetSec));
      throw new PasswordError(
        "account_locked",
        "muitas tentativas; tente novamente em alguns minutos",
      );
    }

    // 2) Resolver user (uniforme em caso de não-existência)
    const userRows = await db()
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    const user = userRows[0];
    if (!user) {
      throw new PasswordError("invalid_credentials");
    }

    // 3) Resolver tenant alvo
    let tenantId: string;
    if (input.tenantSlug) {
      const tRows = await db()
        .select()
        .from(tenants)
        .where(eq(tenants.slug, input.tenantSlug))
        .limit(1);
      const tenant = tRows[0];
      if (!tenant) throw new PasswordError("invalid_credentials");
      // Confirma membership (a menos que seja superadmin platform-wide)
      if (user.role !== "superadmin") {
        const mRows = await db()
          .select()
          .from(tenantMembers)
          .where(
            and(
              eq(tenantMembers.userId, user.id),
              eq(tenantMembers.tenantId, tenant.id),
            ),
          )
          .limit(1);
        if (!mRows[0]) throw new PasswordError("invalid_credentials");
      }
      tenantId = tenant.id;
    } else {
      const mRows = await db()
        .select()
        .from(tenantMembers)
        .where(eq(tenantMembers.userId, user.id))
        .limit(1);
      if (!mRows[0]) throw new PasswordError("invalid_credentials");
      tenantId = mRows[0].tenantId;
    }

    // 4) Verificar senha
    await verifyPasswordCredential({
      userId: user.id,
      password: input.password,
    });

    // 5) MFA branching
    const mfaEnabled = await hasMfa(user.id);
    if (mfaEnabled) {
      const ticket = signMfaTicket({
        userId: user.id,
        tenantId,
        intent: "challenge",
      });
      return {
        ok: false,
        requiresMfa: true,
        requiresMfaSetup: false,
        mfaTicket: ticket,
      };
    }

    // Determina role efetivo no tenant para policy MFA
    let effectiveRole = user.role;
    if (user.role !== "superadmin") {
      const mRows = await db()
        .select()
        .from(tenantMembers)
        .where(
          and(
            eq(tenantMembers.userId, user.id),
            eq(tenantMembers.tenantId, tenantId),
          ),
        )
        .limit(1);
      effectiveRole = mRows[0]?.role ?? "member";
    }
    if (ROLES_REQUIRING_MFA.has(effectiveRole)) {
      const ticket = signMfaTicket({
        userId: user.id,
        tenantId,
        intent: "setup",
      });
      return {
        ok: false,
        requiresMfa: false,
        requiresMfaSetup: true,
        mfaTicket: ticket,
      };
    }

    // 7) Cria sessão final + cookie
    const created = await createSession({
      userId: user.id,
      tenantId,
      ip: clientIp,
      userAgent: (req.headers["user-agent"] as string) ?? null,
    });
    res.setHeader(
      "Set-Cookie",
      serializeCookie({
        rawToken: created.rawToken,
        expiresAt: created.expiresAt,
        domain: process.env.NOWGO_COOKIE_DOMAIN || undefined,
        secure: process.env.NODE_ENV !== "test",
      }),
    );

    // Atualiza last_login_at (best-effort)
    await db()
      .update(users)
      .set({ lastLoginAt: new Date() })
      .where(eq(users.id, user.id))
      .catch(() => undefined);

    return {
      ok: true,
      userId: user.id,
      tenantId,
      requiresMfa: false,
      requiresMfaSetup: false,
    };
  },
});

/** Validação do mfaTicket — usada por /login/mfa e /mfa/setup-confirm. */
export function verifyMfaTicket(ticket: string): MfaTicketPayload {
  const parts = ticket.split(".");
  if (parts.length !== 2) {
    throw new PasswordError("invalid_credentials", "ticket malformado");
  }
  const [body, sig] = parts;
  const expected = b64url(
    createHmac("sha256", getJwtSecret()).update(body).digest(),
  );
  if (sig !== expected) {
    throw new PasswordError("invalid_credentials", "assinatura inválida");
  }
  const padded = body + "=".repeat((4 - (body.length % 4)) % 4);
  const json = Buffer.from(
    padded.replace(/-/g, "+").replace(/_/g, "/"),
    "base64",
  ).toString("utf8");
  const payload = JSON.parse(json) as MfaTicketPayload;
  if (payload.exp * 1000 < Date.now()) {
    throw new PasswordError("invalid_credentials", "ticket expirado");
  }
  return payload;
}
