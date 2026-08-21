/**
 * server/auth/socialAuth.ts
 *
 * Provisão idempotente de login social para a sessão V2.
 *
 * Regras:
 *  - A identidade é única por provider + providerUserId.
 *  - Um e-mail já existente sempre reaproveita o usuário; nunca criamos
 *    uma segunda conta apenas porque o provedor mudou.
 *  - Um primeiro login social sem membership recebe um tenant pessoal e uma
 *    membership owner com platformAccess=false, preservando o gate comercial
 *    do Checkout.
 *  - Os callbacks validam o e-mail no provedor antes de chamar este helper.
 */

import { and, eq } from "drizzle-orm";
import { db } from "../db/client.js";
import {
  socialIdentities,
  tenantMembers,
  tenants,
  users,
} from "../db/schema.js";

export type SocialProvider = "google" | "github" | "linkedin";

export interface SocialProfile {
  providerUserId: string;
  email: string;
  name?: string | null;
  avatarUrl?: string | null;
}

export interface SocialRequestContext {
  headers?: Record<string, string | string[] | undefined>;
}

export interface ProvisionedSocialLogin {
  userId: string;
  tenantId: string;
}

export class SocialAuthError extends Error {
  readonly code: "invalid_profile" | "identity_user_missing";

  constructor(code: "invalid_profile" | "identity_user_missing", message: string) {
    super(message);
    this.name = "SocialAuthError";
    this.code = code;
  }
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function displayName(profile: SocialProfile, email: string): string {
  const name = profile.name?.trim();
  return name || email.split("@")[0] || "Usuário NowGo";
}

/**
 * Vincula uma identidade social e garante que o usuário tenha um tenant alvo
 * para a emissão de sessão V2. `req` fica no contrato para permitir auditoria
 * futura de IP/user-agent sem acoplar os callbacks à persistência.
 */
export async function provisionSocialLogin(
  provider: SocialProvider,
  profile: SocialProfile,
  req?: SocialRequestContext,
): Promise<ProvisionedSocialLogin> {
  void req;

  const providerUserId = profile.providerUserId.trim();
  const email = normalizeEmail(profile.email);
  if (!providerUserId || !email || !email.includes("@")) {
    throw new SocialAuthError(
      "invalid_profile",
      "O provedor não retornou um perfil social utilizável.",
    );
  }

  const existingIdentity = await db()
    .select({ userId: socialIdentities.userId })
    .from(socialIdentities)
    .where(
      and(
        eq(socialIdentities.provider, provider),
        eq(socialIdentities.providerUserId, providerUserId),
      ),
    )
    .limit(1);

  const existingUserByIdentity = existingIdentity[0]
    ? await db()
        .select({ id: users.id })
        .from(users)
        .where(eq(users.id, existingIdentity[0].userId))
        .limit(1)
    : [];

  if (existingIdentity[0] && !existingUserByIdentity[0]) {
    throw new SocialAuthError(
      "identity_user_missing",
      "A identidade social está vinculada a uma conta inexistente.",
    );
  }

  const existingUserByEmail = existingIdentity[0]
    ? []
    : await db()
        .select({ id: users.id })
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

  const result = await db().transaction(async (tx) => {
    const userId = existingIdentity[0]?.userId ?? existingUserByEmail[0]?.id ?? null;

    let resolvedUserId = userId;
    if (!resolvedUserId) {
      const [createdUser] = await tx
        .insert(users)
        .values({
          email,
          name: displayName(profile, email),
          avatarUrl: profile.avatarUrl?.trim() || null,
          googleId: provider === "google" ? providerUserId : null,
          role: "user",
        })
        .returning({ id: users.id });
      if (!createdUser) {
        throw new SocialAuthError("invalid_profile", "Não foi possível criar a conta social.");
      }
      resolvedUserId = createdUser.id;
    }

    const membership = await tx
      .select({ tenantId: tenantMembers.tenantId })
      .from(tenantMembers)
      .where(eq(tenantMembers.userId, resolvedUserId))
      .limit(1);

    let tenantId = membership[0]?.tenantId;
    if (!tenantId) {
      const [tenant] = await tx
        .insert(tenants)
        .values({
          slug: `social-${resolvedUserId}`,
          name: `NowGo AI — ${displayName(profile, email)}`,
          plan: "starter",
          createdByUserId: resolvedUserId,
        })
        .returning({ id: tenants.id });
      if (!tenant) {
        throw new SocialAuthError("invalid_profile", "Não foi possível criar o tenant social.");
      }
      tenantId = tenant.id;

      await tx.insert(tenantMembers).values({
        tenantId,
        userId: resolvedUserId,
        role: "owner",
        platformAccess: false,
      });
    }

    if (!existingIdentity[0]) {
      await tx.insert(socialIdentities).values({
        userId: resolvedUserId,
        provider,
        providerUserId,
        email,
        name: profile.name?.trim() || null,
        avatarUrl: profile.avatarUrl?.trim() || null,
      });
    }

    await tx
      .update(users)
      .set({ lastLoginAt: new Date() })
      .where(eq(users.id, resolvedUserId));

    return { userId: resolvedUserId, tenantId };
  });

  return result;
}
