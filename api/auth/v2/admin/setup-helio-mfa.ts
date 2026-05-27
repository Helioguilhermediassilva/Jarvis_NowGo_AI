/**
 * api/auth/v2/admin/setup-helio-mfa.ts → POST /api/auth/v2/admin/setup-helio-mfa
 *
 * ⚠️ ENDPOINT ADMIN TEMPORÁRIO — F47 hotfix #5
 *
 * Provisiona MFA TOTP para o superadmin `helio@nowgo.com.br` quando o frontend
 * ainda não foi re-deployado com a correção do branching mfa_setup_required.
 * Em vez de exigir a tela /mfa/configurar, este endpoint:
 *   1. Gera um novo secret base32 + 8 backup codes
 *   2. Cifra em AES-256-GCM e persiste em mfa_credentials (faz upsert: se já
 *      existe credencial, deleta antes — útil para refazer setup)
 *   3. Devolve o otpauth URI + QR code (PNG data URL base64)
 *
 * Autenticação: requer header `x-admin-token` igual a process.env.JWT_SECRET.
 * Esse endpoint deve ser REMOVIDO assim que o setup do founder for concluído.
 */
import { z } from "zod";
import { eq } from "drizzle-orm";
import { createHmac, timingSafeEqual } from "node:crypto";
import { generateSecret, generateURI } from "otplib";
import QRCode from "qrcode";

import { createApiHandler } from "../../../../server/http/handlerFactory.js";
import { db } from "../../../../server/db/client.js";
import { users, mfaCredentials } from "../../../../server/db/schema.js";
import {
  encryptSecret,
  generateBackupCodes,
  hashBackupCode,
} from "../../../../server/auth/mfaTotp.js";

const TARGET_EMAIL = "helio@nowgo.com.br";

const InputSchema = z.object({
  /** Token administrativo igual a JWT_SECRET (HMAC-SHA256 timing-safe). */
  adminToken: z.string().min(16).max(2048),
  /** Issuer mostrado no app autenticador. */
  issuer: z.string().min(1).max(80).optional(),
});
type Input = z.infer<typeof InputSchema>;

interface Output {
  ok: true;
  userId: string;
  email: string;
  secret: string;
  otpauthUri: string;
  qrCodePngDataUrl: string;
  backupCodes: string[];
  warning: string;
}

function timingEqual(a: string, b: string): boolean {
  const ah = createHmac("sha256", "salt-cmp").update(a).digest();
  const bh = createHmac("sha256", "salt-cmp").update(b).digest();
  return ah.length === bh.length && timingSafeEqual(ah, bh);
}

export default createApiHandler<Input, Output>({
  methods: ["POST"],
  schema: InputSchema,
  tag: "auth.v2.admin.setup_helio_mfa",
  handler: async ({ input }) => {
    const expected = process.env.JWT_SECRET;
    if (!expected || expected.length < 16) {
      throw new Error("JWT_SECRET ausente ou muito curto");
    }
    if (!timingEqual(input.adminToken, expected)) {
      const err: Error & { code?: string } = new Error("forbidden");
      err.code = "invalid_credentials";
      throw err;
    }

    // Localiza o superadmin Hélio
    const userRows = await db()
      .select()
      .from(users)
      .where(eq(users.email, TARGET_EMAIL))
      .limit(1);
    const user = userRows[0];
    if (!user) {
      throw new Error(
        `usuário ${TARGET_EMAIL} não existe no banco; rode o bootstrap antes.`,
      );
    }

    // Apaga credencial MFA antiga (se houver) para permitir setup limpo
    await db()
      .delete(mfaCredentials)
      .where(eq(mfaCredentials.userId, user.id));

    // Gera secret + URI + QR
    const secret = generateSecret();
    const otpauthUri = generateURI({
      strategy: "totp",
      issuer: input.issuer ?? "NowGo Cockpit",
      label: TARGET_EMAIL,
      secret,
      digits: 6,
      period: 30,
    });
    const qrCodePngDataUrl = await QRCode.toDataURL(otpauthUri);

    // Persiste cifrado + backup codes
    const encrypted = encryptSecret(secret);
    const backupCodes = generateBackupCodes();
    const hashed = backupCodes.map((c) => ({
      hash: hashBackupCode(c),
      used: false,
    }));

    await db().insert(mfaCredentials).values({
      userId: user.id,
      totpSecretEncrypted: encrypted,
      backupCodesHashed: hashed,
      enabledAt: new Date(),
      lastUsedAt: null,
      resetCount: 0,
    });

    return {
      ok: true,
      userId: user.id,
      email: TARGET_EMAIL,
      secret,
      otpauthUri,
      qrCodePngDataUrl,
      backupCodes,
      warning:
        "Endpoint temporário — remover após o setup do founder ser concluído. Guarde os backup codes em local seguro: cada um só pode ser usado uma vez.",
    };
  },
});
