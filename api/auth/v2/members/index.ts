/**
 * api/auth/v2/members/index.ts → GET/PATCH /api/auth/v2/members
 *
 * Gestão administrativa dos perfis vinculados ao tenant atual.
 * O endpoint não altera roles: permite apenas consultar membros e alternar
 * a permissão de acesso à Plataforma. O Cockpit continua protegido pelo
 * papel superadmin em sua rota própria.
 */
import { z } from "zod";
import { and, eq } from "drizzle-orm";

import { createApiHandler } from "../../../../server/http/handlerFactory.js";
import { requireV2Role } from "../../../../server/http/authMiddlewareV2.js";
import { db } from "../../../../server/db/client.js";
import { tenantMembers, users } from "../../../../server/db/schema.js";
import { SessionError } from "../../../../server/auth/sessions.js";

const GetSchema = z.object({}).passthrough();
const PatchSchema = z.object({
  memberId: z.string().uuid(),
  platformAccess: z.boolean(),
});
const InputSchema = z.union([GetSchema, PatchSchema]);

type MemberProfile = {
  memberId: string;
  userId: string;
  email: string;
  name: string | null;
  role: string;
  platformAccess: boolean;
};

type Output =
  | { ok: true; members: MemberProfile[] }
  | { ok: true; member: MemberProfile };

async function listMembers(tenantId: string): Promise<MemberProfile[]> {
  return db()
    .select({
      memberId: tenantMembers.id,
      userId: users.id,
      email: users.email,
      name: users.name,
      role: tenantMembers.role,
      platformAccess: tenantMembers.platformAccess,
    })
    .from(tenantMembers)
    .innerJoin(users, eq(users.id, tenantMembers.userId))
    .where(eq(tenantMembers.tenantId, tenantId));
}

export default createApiHandler<z.infer<typeof InputSchema>, Output>({
  methods: ["GET", "PATCH"],
  schema: InputSchema,
  tag: "auth.v2.members",
  handler: async ({ req, res, input }) => {
    const ctx = await requireV2Role(req, res, ["superadmin", "owner", "admin"]);

    if ((req.method ?? "GET").toUpperCase() === "GET") {
      return { ok: true, members: await listMembers(ctx.tenantId) };
    }

    const patch = PatchSchema.parse(input);
    const [updated] = await db()
      .update(tenantMembers)
      .set({ platformAccess: patch.platformAccess })
      .where(
        and(
          eq(tenantMembers.id, patch.memberId),
          eq(tenantMembers.tenantId, ctx.tenantId),
        ),
      )
      .returning({
        memberId: tenantMembers.id,
        userId: tenantMembers.userId,
        role: tenantMembers.role,
        platformAccess: tenantMembers.platformAccess,
      });

    if (!updated) {
      // Resposta uniforme para não revelar vínculos de outros tenants.
      throw new SessionError("invalid_session", "member_not_found");
    }

    const [profile] = await db()
      .select({
        memberId: tenantMembers.id,
        userId: users.id,
        email: users.email,
        name: users.name,
        role: tenantMembers.role,
        platformAccess: tenantMembers.platformAccess,
      })
      .from(tenantMembers)
      .innerJoin(users, eq(users.id, tenantMembers.userId))
      .where(eq(tenantMembers.id, updated.memberId))
      .limit(1);

    if (!profile) {
      throw new SessionError("invalid_session", "member_not_found");
    }

    return { ok: true, member: profile };
  },
});

export const _internal = { listMembers };

