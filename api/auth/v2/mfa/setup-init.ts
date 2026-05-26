/**
 * api/auth/v2/mfa/setup-init.ts  →  POST /api/auth/v2/mfa/setup-init
 *
 * F47 — Inicia o cadastro de MFA TOTP para o usuário.
 *
 * Aceita dois modos de chamada:
 *   1. Sessão V2 ativa (usuário logado quer ativar MFA voluntariamente).
 *      Lê `requireV2Auth` e usa o e-mail do contexto.
 *   2. Pós-login com `mfaTicket` de intent="setup" (role exigia MFA mas
 *      o usuário ainda não tinha enrolado). Aceita o ticket no body.
 *
 * Retorna `{ secret, otpauthUri, qrCodeDataUrl }`. O segredo é devolvido
 * em CLARO porque o frontend precisa exibir a chave manualmente como
 * fallback do QR code; nada é persistido até o /setup-confirm.
 */
import { z } from "zod";
import { eq } from "drizzle-orm";

import { createApiHandler } from "../../../../server/http/handlerFactory.js";
import { requireV2Auth } from "../../../../server/http/authMiddlewareV2.js";
import { db } from "../../../../server/db/client.js";
import { users } from "../../../../server/db/schema.js";
import {
  generateMfaSetup,
  hasMfa,
  MfaError,
} from "../../../../server/auth/mfaTotp.js";
import { verifyMfaTicket } from "../login/index.js";

const InputSchema = z.object({
  mfaTicket: z.string().min(8).optional(),
  issuer: z.string().min(1).max(60).optional(),
});

type Input = z.infer<typeof InputSchema>;

interface Output {
  ok: true;
  secret: string;
  otpauthUri: string;
  qrCodeDataUrl: string;
}

export default createApiHandler<Input, Output>({
  methods: ["POST"],
  schema: InputSchema,
  tag: "auth.v2.mfa.setup_init",
  handler: async ({ req, res, input }) => {
    let userId: string;
    let userEmail: string;

    if (input.mfaTicket) {
      const ticket = verifyMfaTicket(input.mfaTicket);
      if (ticket.intent !== "setup") {
        throw new MfaError("internal_error", "ticket não é de setup");
      }
      userId = ticket.userId;
      const rows = await db()
        .select({ email: users.email })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);
      if (!rows[0]) throw new MfaError("internal_error", "user_missing");
      userEmail = rows[0].email;
    } else {
      const ctx = await requireV2Auth(req, res);
      userId = ctx.userId;
      userEmail = ctx.email;
    }

    // Bloqueia se o usuário já tem MFA ativo — usar /admin/mfa/reset primeiro.
    if (await hasMfa(userId)) {
      throw new MfaError("credential_already_exists");
    }

    const setup = await generateMfaSetup({
      userEmail,
      issuer: input.issuer,
    });
    return {
      ok: true,
      secret: setup.secret,
      otpauthUri: setup.otpauthUri,
      qrCodeDataUrl: setup.qrCodeDataUrl,
    };
  },
});
