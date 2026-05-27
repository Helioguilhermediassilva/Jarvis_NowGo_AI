/**
 * api/auth/v2/admin/diag-user-state.ts → POST /api/auth/v2/admin/diag-user-state
 *
 * Endpoint admin temporário para diagnóstico do fluxo de auth V2.
 * Recebe { adminToken, email } e devolve:
 *   - existe user com esse e-mail?
 *   - tem password_credentials? verifiedAt? lockedUntil?
 *   - tem tenant_members? em qual tenant e role?
 *   - tem invitation pendente? estado do convite?
 *   - tem mfa_credentials?
 *
 * Protegido por JWT_SECRET. SERÁ REMOVIDO após o uso.
 */
import { z } from "zod";
import { eq } from "drizzle-orm";
import crypto from "node:crypto";

import { createApiHandler } from "../../../../server/http/handlerFactory.js";
import { db } from "../../../../server/db/client.js";
import {
  users,
  passwordCredentials,
  tenantMembers,
  invitations,
  mfaCredentials,
  tenants,
} from "../../../../server/db/schema.js";

const InputSchema = z.object({
  adminToken: z.string().min(8),
  email: z.string().email().toLowerCase(),
});

type Input = z.infer<typeof InputSchema>;

interface Output {
  ok: true;
  email: string;
  user: null | {
    id: string;
    name: string | null;
    role: string;
    createdAt: string | null;
  };
  passwordCredential: null | {
    hasCredential: true;
    verifiedAt: string | null;
    verificationSentAt: string | null;
    hasVerificationToken: boolean;
    failedAttempts: number;
    lockedUntil: string | null;
    hasResetToken: boolean;
    resetTokenExpiresAt: string | null;
    passwordChangedAt: string | null;
  };
  tenantMemberships: Array<{
    tenantId: string;
    tenantSlug: string | null;
    tenantName: string | null;
    role: string;
    joinedAt: string | null;
  }>;
  invitations: Array<{
    id: string;
    tenantId: string;
    role: string;
    consumedAt: string | null; // mapeia usedAt
    expiresAt: string | null;
    createdAt: string | null;
  }>;
  mfa: null | {
    enabled: true;
    enabledAt: string | null;
    lastUsedAt: string | null;
  };
}

export default createApiHandler<Input, Output>({
  methods: ["POST"],
  schema: InputSchema,
  tag: "auth.v2.admin.diag",
  handler: async ({ input }) => {
    const expected = process.env.JWT_SECRET ?? "";
    if (
      !expected ||
      !crypto.timingSafeEqual(
        Buffer.from(expected.padEnd(64, "0").slice(0, 64)),
        Buffer.from(input.adminToken.padEnd(64, "0").slice(0, 64)),
      )
    ) {
      throw new Error("forbidden");
    }

    const userRows = await db()
      .select()
      .from(users)
      .where(eq(users.email, input.email))
      .limit(1);
    const user = userRows[0] ?? null;

    if (!user) {
      // procura convite pendente pelo e-mail mesmo sem user
      const inv = await db()
        .select()
        .from(invitations)
        .where(eq(invitations.email, input.email));
      return {
        ok: true,
        email: input.email,
        user: null,
        passwordCredential: null,
        tenantMemberships: [],
        invitations: inv.map((i) => ({
          id: i.id,
          tenantId: i.tenantId,
          role: i.role,
          consumedAt: i.usedAt?.toISOString() ?? null,
          expiresAt: i.expiresAt?.toISOString() ?? null,
          createdAt: i.createdAt?.toISOString() ?? null,
        })),
        mfa: null,
      };
    }

    const credRows = await db()
      .select()
      .from(passwordCredentials)
      .where(eq(passwordCredentials.userId, user.id))
      .limit(1);
    const cred = credRows[0] ?? null;

    const memberRows = await db()
      .select({
        tm: tenantMembers,
        t: tenants,
      })
      .from(tenantMembers)
      .leftJoin(tenants, eq(tenants.id, tenantMembers.tenantId))
      .where(eq(tenantMembers.userId, user.id));

    const invRows = await db()
      .select()
      .from(invitations)
      .where(eq(invitations.email, input.email));

    const mfaRows = await db()
      .select()
      .from(mfaCredentials)
      .where(eq(mfaCredentials.userId, user.id))
      .limit(1);
    const mfa = mfaRows[0] ?? null;

    return {
      ok: true,
      email: input.email,
      user: {
        id: user.id,
        name: user.name ?? null,
        role: user.role ?? "user",
        createdAt: user.createdAt?.toISOString() ?? null,
      },
      passwordCredential: cred
        ? {
            hasCredential: true,
            verifiedAt: cred.verifiedAt?.toISOString() ?? null,
            verificationSentAt: cred.verificationSentAt?.toISOString() ?? null,
            hasVerificationToken: cred.verificationTokenHash !== null,
            failedAttempts: cred.failedAttempts ?? 0,
            lockedUntil: cred.lockedUntil?.toISOString() ?? null,
            hasResetToken: cred.resetTokenHash !== null,
            resetTokenExpiresAt:
              cred.resetTokenExpiresAt?.toISOString() ?? null,
            passwordChangedAt: cred.passwordChangedAt?.toISOString() ?? null,
          }
        : null,
      tenantMemberships: memberRows.map((r) => ({
        tenantId: r.tm.tenantId,
        tenantSlug: r.t?.slug ?? null,
        tenantName: r.t?.name ?? null,
        role: r.tm.role,
        joinedAt: r.tm.joinedAt?.toISOString() ?? null,
      })),
      invitations: invRows.map((i) => ({
        id: i.id,
        tenantId: i.tenantId,
        role: i.role,
        consumedAt: i.usedAt?.toISOString() ?? null,
        expiresAt: i.expiresAt?.toISOString() ?? null,
        createdAt: i.createdAt?.toISOString() ?? null,
      })),
      mfa: mfa
        ? {
            enabled: true,
            enabledAt: mfa.enabledAt?.toISOString() ?? null,
            lastUsedAt: mfa.lastUsedAt?.toISOString() ?? null,
          }
        : null,
    };
  },
});
