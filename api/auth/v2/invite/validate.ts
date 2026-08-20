/**
 * api/auth/v2/invite/validate.ts
 *
 * F47 — Valida (sem consumir) um token de convite. Endpoint público:
 * usado pelo frontend ao abrir `/convite/<rawToken>` para decidir se
 * exibe o formulário de cadastro ou uma mensagem genérica de "link inválido
 * ou expirado".
 *
 * Anti-enumeração:
 *   • Qualquer falha (token errado, expirado, revogado, já usado) é
 *     traduzida em uma resposta uniforme 410 + `{ valid: false }`.
 *     Não revelamos qual dos quatro motivos ocorreu para visitantes externos.
 *   • A latência de erro é homogênea porque sempre passamos por
 *     `validateInvitationToken` (que faz hash + lookup), antes de devolver.
 *
 * Resposta de sucesso (200):
 *   { valid: true, tenantName, role, platformAccess, expiresAt, email }
 *
 * Resposta de falha (410):
 *   { error: "invalid_or_expired", valid: false }
 */
import { z } from "zod";

import { createApiHandler } from "../../../../server/http/handlerFactory.js";
import {
  validateInvitationToken,
  InvitationError,
} from "../../../../server/auth/invitations.js";
import { getTenantById } from "../../../../server/auth/tenants.js";

const InputSchema = z.object({
  token: z.string().min(8),
});

type Input = z.infer<typeof InputSchema>;

interface SuccessResponse {
  valid: true;
  tenantName: string;
  role: string;
  platformAccess: boolean;
  expiresAt: string;
  email: string;
}

interface FailureResponse {
  valid: false;
  error: "invalid_or_expired";
}

export default createApiHandler<Input, SuccessResponse | FailureResponse>({
  methods: ["GET"],
  schema: InputSchema,
  tag: "auth.v2.invite.validate",
  handler: async ({ res, input }) => {
    try {
      const { invitation } = await validateInvitationToken(input.token);
      const tenant = await getTenantById(invitation.tenantId);
      if (!tenant) {
        // Convite aponta para tenant inexistente: estado inválido. Trata como 410.
        res.status(410).json({ valid: false, error: "invalid_or_expired" });
        return undefined as unknown as SuccessResponse;
      }
      return {
        valid: true,
        tenantName: tenant.name,
        role: invitation.role,
        platformAccess: invitation.platformAccess,
        expiresAt: invitation.expiresAt.toISOString(),
        email: invitation.email,
      };
    } catch (err) {
      // Qualquer InvitationError vira 410 genérico (não revela motivo).
      if (err instanceof InvitationError) {
        res.status(410).json({ valid: false, error: "invalid_or_expired" });
        return undefined as unknown as SuccessResponse;
      }
      throw err;
    }
  },
});
