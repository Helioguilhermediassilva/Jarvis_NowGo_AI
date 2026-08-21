/**
 * api/auth/v2/invite/create.ts
 *
 * F47 — Emite um convite (invite-only). Restrito a superadmin/owner/admin.
 *
 * Fluxo:
 *   1. Verifica sessão V2 + role permitido (não dá mais detalhe se a role não bate).
 *   2. Resolve o tenant alvo pelo `tenantId` informado no body.
 *   3. Cria o convite via `createInvitation` (gera rawToken + grava só o hash).
 *   4. Monta `inviteUrl` baseado no header `Origin` informado pelo frontend
 *      (boas práticas de OAuth) e envia e-mail via Resend (log-only fallback).
 *   5. Retorna apenas metadados não sensíveis ao chamador autenticado.
 *
 * Resposta de sucesso (200):
 *   { invitationId, expiresAt, mode: "production" | "log-only" }
 */
import { z } from "zod";

import { createApiHandler } from "../../../../server/http/handlerFactory.js";
import { requireV2Role } from "../../../../server/http/authMiddlewareV2.js";
import {
  createInvitation,
  revokeInvitation,
  type TenantRole,
} from "../../../../server/auth/invitations.js";
import { getTenantById } from "../../../../server/auth/tenants.js";
import {
  renderInviteEmail,
  sendEmail,
  type SendEmailResult,
} from "../../../../server/email/resendClient.js";

const InputSchema = z.object({
  email: z.string().email(),
  tenantId: z.string().uuid(),
  role: z.enum(["owner", "admin", "member", "viewer"]),
  platformAccess: z.boolean().default(true),
  ttlHours: z.number().int().min(1).max(168).optional(),
  /** Origem da app (frontend deve enviar `window.location.origin`). */
  origin: z.string().url(),
});

type Input = z.infer<typeof InputSchema>;

export default createApiHandler<Input, {
  invitationId: string;
  expiresAt: string;
  mode: "production" | "log-only";
}>({
  methods: ["POST"],
  schema: InputSchema,
  tag: "auth.v2.invite.create",
  handler: async ({ req, res, input }) => {
    // 1) Auth + role allowlist
    const ctx = await requireV2Role(req, res, ["superadmin", "owner", "admin"]);

    // 2) Resolver tenant
    const tenant = await getTenantById(input.tenantId);
    if (!tenant) {
      // Mantemos status genérico do handlerFactory (404 não está mapeado lá);
      // usamos InvitationError para reaproveitar o mapping.
      const { InvitationError } = await import(
        "../../../../server/auth/invitations.js"
      );
      throw new InvitationError("invalid_token", "tenant não encontrado");
    }

    // 3) Criar convite
    const created = await createInvitation({
      email: input.email,
      tenantId: input.tenantId,
      role: input.role as TenantRole,
      platformAccess: input.platformAccess,
      ttlHours: input.ttlHours,
      invitedBy: ctx.userId,
    });

    // 4) Enviar e-mail (log-only se RESEND_API_KEY ausente)
    const inviteUrl = `${input.origin.replace(/\/$/, "")}/aceitar-convite/${created.rawToken}`;
    const tpl = renderInviteEmail({
      to: input.email,
      inviterName: ctx.email,
      tenantName: tenant.name,
      inviteUrl,
      expiresAt: created.expiresAt,
      platformAccess: input.platformAccess,
    });
    let sent: SendEmailResult;
    try {
      sent = await sendEmail({
        to: input.email,
        subject: tpl.subject,
        html: tpl.html,
        text: tpl.text,
        tag: "f47.invite",
      });
    } catch (error) {
      // Não deixar um convite pendente quando o provedor de e-mail rejeita o envio.
      // Assim o administrador pode corrigir o Resend e tentar novamente sem receber
      // um falso erro de "convite já pendente".
      try {
        await revokeInvitation({ invitationId: created.invitationId });
      } catch (cleanupError) {
        console.error("auth.v2.invite.create cleanup failed", cleanupError);
      }
      throw error;
    }

    return {
      invitationId: created.invitationId,
      expiresAt: created.expiresAt.toISOString(),
      mode: sent.mode,
    };
  },
});
