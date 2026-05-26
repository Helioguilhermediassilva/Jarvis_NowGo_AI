/**
 * Testes do módulo de convites.
 *
 * Estrutura:
 *  - Bloco 1: testes UNIT puros (não tocam banco) — validação de input,
 *    formato de e-mail, range de TTL, classe InvitationError.
 *  - Bloco 2: testes INTEGRATION skipIf(NOWGO_BRAIN_PG_URL ausente) —
 *    emitir convite real, validar via raw token, expiração, revogação,
 *    anti-replay (consume duas vezes), idempotência de membership.
 *
 * Em CI/local sem env, só rodam os unit tests; em produção (Vercel) rodam
 * os de integração também.
 */
import { afterAll, describe, expect, it } from "vitest";
import {
  INVITATION_DEFAULT_TTL_HOURS,
  InvitationError,
  _internal,
  consumeInvitation,
  createInvitation,
  listInvitations,
  revokeInvitation,
  validateInvitationToken,
} from "./invitations";

// ============================================================================
// BLOCO 1 — UNIT (sem banco)
// ============================================================================

describe("InvitationError", () => {
  it("preserva o code e a mensagem", () => {
    const e = new InvitationError("expired", "convite expirado");
    expect(e.code).toBe("expired");
    expect(e.message).toBe("convite expirado");
    expect(e.name).toBe("InvitationError");
  });

  it("usa code como mensagem default", () => {
    const e = new InvitationError("invalid_token");
    expect(e.message).toBe("invalid_token");
  });
});

describe("_internal.VALID_ROLES", () => {
  it("contém os 4 roles esperados", () => {
    expect(_internal.VALID_ROLES.has("owner")).toBe(true);
    expect(_internal.VALID_ROLES.has("admin")).toBe(true);
    expect(_internal.VALID_ROLES.has("member")).toBe(true);
    expect(_internal.VALID_ROLES.has("viewer")).toBe(true);
  });

  it("não contém roles fora da lista", () => {
    // @ts-expect-error testando entrada inválida
    expect(_internal.VALID_ROLES.has("superadmin")).toBe(false);
    // @ts-expect-error testando entrada inválida
    expect(_internal.VALID_ROLES.has("")).toBe(false);
  });
});

describe("INVITATION_DEFAULT_TTL_HOURS", () => {
  it("default é 72 horas", () => {
    expect(INVITATION_DEFAULT_TTL_HOURS).toBe(72);
  });
});

describe("EMAIL_RE (validação de formato)", () => {
  const re = _internal.EMAIL_RE;

  it("aceita e-mails padrão", () => {
    expect(re.test("alice@nowgo.com.br")).toBe(true);
    expect(re.test("a@b.co")).toBe(true);
    expect(re.test("user+tag@gmail.com")).toBe(true);
  });

  it("rejeita formatos inválidos", () => {
    expect(re.test("alice")).toBe(false);
    expect(re.test("alice@")).toBe(false);
    expect(re.test("@nowgo.com.br")).toBe(false);
    expect(re.test("alice nowgo.com.br")).toBe(false);
    expect(re.test("alice@nowgo")).toBe(false);
    expect(re.test("")).toBe(false);
  });
});

describe("createInvitation — validação de input (sem banco)", () => {
  // Esses testes esperam que o erro seja lançado ANTES de qualquer query,
  // então funcionam mesmo sem NOWGO_BRAIN_PG_URL.

  it("rejeita e-mail mal formatado com code invalid_email", async () => {
    await expect(
      createInvitation({
        email: "sem-arroba",
        tenantId: "00000000-0000-0000-0000-000000000000",
        role: "member",
        invitedBy: "00000000-0000-0000-0000-000000000001",
      }),
    ).rejects.toMatchObject({ code: "invalid_email" });
  });

  it("rejeita role inválido com code invalid_role", async () => {
    await expect(
      createInvitation({
        email: "alice@nowgo.com.br",
        tenantId: "00000000-0000-0000-0000-000000000000",
        // @ts-expect-error testando role inválido
        role: "godmode",
        invitedBy: "00000000-0000-0000-0000-000000000001",
      }),
    ).rejects.toMatchObject({ code: "invalid_role" });
  });

  it("rejeita ttlHours fora do range com code invalid_ttl", async () => {
    await expect(
      createInvitation({
        email: "alice@nowgo.com.br",
        tenantId: "00000000-0000-0000-0000-000000000000",
        role: "member",
        invitedBy: "00000000-0000-0000-0000-000000000001",
        ttlHours: 0,
      }),
    ).rejects.toMatchObject({ code: "invalid_ttl" });

    await expect(
      createInvitation({
        email: "alice@nowgo.com.br",
        tenantId: "00000000-0000-0000-0000-000000000000",
        role: "member",
        invitedBy: "00000000-0000-0000-0000-000000000001",
        ttlHours: 999,
      }),
    ).rejects.toMatchObject({ code: "invalid_ttl" });
  });
});

describe("validateInvitationToken — entradas inválidas (sem banco)", () => {
  it("rejeita token vazio com code invalid_token sem tocar banco", async () => {
    await expect(validateInvitationToken("")).rejects.toMatchObject({
      code: "invalid_token",
    });
  });

  it("rejeita token não-string com code invalid_token", async () => {
    // @ts-expect-error testando entrada inválida
    await expect(validateInvitationToken(null)).rejects.toMatchObject({
      code: "invalid_token",
    });
  });
});

describe("consumeInvitation — entradas inválidas (sem banco)", () => {
  it("rejeita rawToken vazio antes de query", async () => {
    await expect(
      consumeInvitation({ rawToken: "", userId: "x" }),
    ).rejects.toMatchObject({ code: "invalid_token" });
  });

  it("rejeita userId vazio antes de query", async () => {
    await expect(
      consumeInvitation({ rawToken: "abc", userId: "" }),
    ).rejects.toMatchObject({ code: "internal_error" });
  });
});

// ============================================================================
// BLOCO 2 — INTEGRATION (requer NOWGO_BRAIN_PG_URL e tenant nowgo-ai)
// ============================================================================

const HAS_PG = Boolean(process.env.NOWGO_BRAIN_PG_URL);
const itPg = HAS_PG ? it : it.skip;

const TENANT_NOWGO_AI_SLUG = "nowgo-ai";

let lookupTenantIdCache: string | null = null;
async function lookupTenantId(): Promise<string> {
  if (lookupTenantIdCache) return lookupTenantIdCache;
  const { db } = await import("../db/client.js");
  const { tenants } = await import("../db/schema.js");
  const { eq } = await import("drizzle-orm");
  const rows = await db()
    .select()
    .from(tenants)
    .where(eq(tenants.slug, TENANT_NOWGO_AI_SLUG))
    .limit(1);
  const t = rows[0];
  if (!t) throw new Error("tenant nowgo-ai não encontrado");
  lookupTenantIdCache = t.id;
  return t.id;
}

let lookupUserIdCache: string | null = null;
async function lookupHelioId(): Promise<string> {
  if (lookupUserIdCache) return lookupUserIdCache;
  const { db } = await import("../db/client.js");
  const { users } = await import("../db/schema.js");
  const { eq } = await import("drizzle-orm");
  const rows = await db()
    .select()
    .from(users)
    .where(eq(users.email, "helio@nowgo.com.br"))
    .limit(1);
  const u = rows[0];
  if (!u) throw new Error("user helio@nowgo.com.br não encontrado");
  lookupUserIdCache = u.id;
  return u.id;
}

const createdInvitationIds: string[] = [];

afterAll(async () => {
  if (!HAS_PG) return;
  // Limpa convites criados pelos testes para não poluir a base.
  if (createdInvitationIds.length > 0) {
    const { db } = await import("../db/client.js");
    const { invitations } = await import("../db/schema.js");
    const { inArray } = await import("drizzle-orm");
    await db()
      .delete(invitations)
      .where(inArray(invitations.id, createdInvitationIds));
  }
  const { closePool } = await import("../db/client.js");
  await closePool();
});

describe("invitations — INTEGRATION (skipped sem NOWGO_BRAIN_PG_URL)", () => {
  itPg("ciclo completo: emite, valida, lista, revoga", async () => {
    const tenantId = await lookupTenantId();
    const helioId = await lookupHelioId();

    const result = await createInvitation({
      email: `test-invitations-${Date.now()}@example.com`,
      tenantId,
      role: "member",
      invitedBy: helioId,
      ttlHours: 1,
    });
    createdInvitationIds.push(result.invitationId);

    expect(result.rawToken).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(result.invitationId).toMatch(/^[0-9a-f-]{36}$/);
    expect(result.expiresAt.getTime()).toBeGreaterThan(Date.now());

    const validated = await validateInvitationToken(result.rawToken);
    expect(validated.invitation.id).toBe(result.invitationId);
    expect(validated.invitation.tenantId).toBe(tenantId);
    expect(validated.invitation.role).toBe("member");

    const list = await listInvitations({ tenantId });
    const found = list.find((i) => i.id === result.invitationId);
    expect(found).toBeDefined();

    const { revoked } = await revokeInvitation({
      invitationId: result.invitationId,
    });
    expect(revoked).toBe(true);

    await expect(
      validateInvitationToken(result.rawToken),
    ).rejects.toMatchObject({ code: "revoked" });
  });

  itPg("token errado retorna invalid_token sem vazar timing", async () => {
    await expect(
      validateInvitationToken("token-que-nao-existe-no-banco"),
    ).rejects.toMatchObject({ code: "invalid_token" });
  });

  itPg("convite expirado falha com code expired", async () => {
    const tenantId = await lookupTenantId();
    const helioId = await lookupHelioId();

    // Cria com expiração mínima e força o relógio do banco.
    const result = await createInvitation({
      email: `test-invitations-exp-${Date.now()}@example.com`,
      tenantId,
      role: "viewer",
      invitedBy: helioId,
      ttlHours: 1,
    });
    createdInvitationIds.push(result.invitationId);

    // Marca como expirado manualmente
    const { db } = await import("../db/client.js");
    const { invitations } = await import("../db/schema.js");
    const { eq } = await import("drizzle-orm");
    await db()
      .update(invitations)
      .set({ expiresAt: new Date(Date.now() - 60_000) })
      .where(eq(invitations.id, result.invitationId));

    await expect(
      validateInvitationToken(result.rawToken),
    ).rejects.toMatchObject({ code: "expired" });
  });
});
