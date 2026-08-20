/**
 * server/email/resendClient.ts
 *
 * Cliente unificado de envio de e-mails transacionais via Resend.
 *
 * Modos de operação:
 *   • PRODUCTION (RESEND_API_KEY definida): envia de verdade pela API.
 *   • LOG-ONLY (RESEND_API_KEY ausente): grava o e-mail em log estruturado
 *     e retorna ok=true. Permite desenvolver/testar sem credencial e sem
 *     enviar e-mails reais.
 *
 * Decisões de produto (Hélio, 2026-05-26):
 *   • Provedor: Resend (free tier 3k e-mails/mês).
 *   • Domínio remetente: parametrizado via env `RESEND_FROM_EMAIL`.
 *     Default: `noreply@nowgoai.com`.
 *   • Reply-to: parametrizado via `RESEND_REPLY_TO`.
 *     Default: `contato@nowgo.com.br` (caixa institucional monitorada).
 *     Pode ser sobrescrito por chamada via `input.replyTo`.
 *   • Templates: render via funções TS puras em `templates.ts`. NÃO usar
 *     templates do Resend dashboard (templates ficam no repo, versionados).
 *
 * Segurança:
 *   • Nunca logar tokens/senhas/MFA codes mesmo em modo log-only — apenas
 *     o e-mail destino, assunto e timestamp.
 *   • Se a API do Resend falhar com 4xx/5xx, propagar `EmailDeliveryError`
 *     para a camada chamadora decidir se retenta.
 */

// ---------------------------------------------------------------------------
// Tipos públicos
// ---------------------------------------------------------------------------

export interface SendEmailInput {
  to: string;
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
  /** Tag opcional para auditoria (não enviada ao destinatário). */
  tag?: string;
}

export interface SendEmailResult {
  ok: true;
  /** ID do Resend em modo PRODUCTION; "log-only" no modo dev. */
  id: string;
  mode: "production" | "log-only";
}

export class EmailDeliveryError extends Error {
  constructor(
    public readonly code:
      | "missing_to"
      | "missing_subject"
      | "missing_body"
      | "provider_error"
      | "internal_error",
    message?: string,
    public readonly providerStatus?: number,
  ) {
    super(message ?? code);
    this.name = "EmailDeliveryError";
  }
}

// ---------------------------------------------------------------------------
// Implementação
// ---------------------------------------------------------------------------

const DEFAULT_FROM = "noreply@nowgoai.com";
const DEFAULT_REPLY_TO = "contato@nowgo.com.br";

function getFrom(): string {
  return process.env.RESEND_FROM_EMAIL ?? DEFAULT_FROM;
}

function getReplyTo(): string {
  return process.env.RESEND_REPLY_TO ?? DEFAULT_REPLY_TO;
}

function isProduction(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
}

/** Logger estruturado simples para modo log-only (sem PII sensível). */
function logEmail(
  mode: "production" | "log-only",
  input: SendEmailInput,
  resultId: string,
): void {
  // eslint-disable-next-line no-console
  console.info(
    JSON.stringify({
      kind: "email",
      mode,
      to: input.to,
      subject: input.subject,
      tag: input.tag ?? null,
      id: resultId,
      at: new Date().toISOString(),
    }),
  );
}

export async function sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
  if (!input.to) throw new EmailDeliveryError("missing_to");
  if (!input.subject) throw new EmailDeliveryError("missing_subject");
  if (!input.html && !input.text) throw new EmailDeliveryError("missing_body");

  const mode = isProduction() ? "production" : "log-only";

  if (mode === "log-only") {
    const id = `log-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    logEmail(mode, input, id);
    return { ok: true, id, mode };
  }

  // Lazy-import para não exigir Resend instalado em sandboxes que rodam testes
  // unit puros — `resend` está nas dependências, mas seu construtor faz fetch.
  const { Resend } = await import("resend");
  const client = new Resend(process.env.RESEND_API_KEY);
  const { data, error } = await client.emails.send({
    from: getFrom(),
    to: [input.to],
    subject: input.subject,
    html: input.html,
    text: input.text,
    replyTo: input.replyTo ?? getReplyTo(),
  });

  if (error) {
    throw new EmailDeliveryError(
      "provider_error",
      error.message ?? "Resend retornou erro",
      undefined,
    );
  }
  if (!data?.id) {
    throw new EmailDeliveryError("provider_error", "Resend não retornou id");
  }

  logEmail(mode, input, data.id);
  return { ok: true, id: data.id, mode };
}

// ---------------------------------------------------------------------------
// Templates render-only (HTML mínimo, sem dependência de framework)
// ---------------------------------------------------------------------------

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function htmlShell(title: string, bodyHtml: string): string {
  const safeTitle = escapeHtml(title);
  return `<!doctype html>
<html lang="pt-BR">
<head><meta charset="utf-8"><title>${safeTitle}</title></head>
<body style="font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;line-height:1.5;color:#0f172a;max-width:560px;margin:0 auto;padding:24px">
<h2 style="margin:0 0 16px">${safeTitle}</h2>
${bodyHtml}
<hr style="margin:32px 0;border:0;border-top:1px solid #e2e8f0">
<p style="font-size:12px;color:#64748b">NowGo AI · nowgoai.com</p>
</body></html>`;
}

export interface InviteEmailInput {
  to: string;
  inviterName: string;
  tenantName: string;
  inviteUrl: string;
  expiresAt: Date;
  platformAccess?: boolean;
}

export function renderInviteEmail(input: InviteEmailInput): {
  subject: string;
  html: string;
  text: string;
} {
  const subject = `Convite para o Cockpit ${input.tenantName} (NowGo AI)`;
  const expires = input.expiresAt.toLocaleString("pt-BR", {
    timeZone: "America/Sao_Paulo",
  });
  const safeUrl = escapeHtml(input.inviteUrl);
  const safeInviter = escapeHtml(input.inviterName);
  const safeTenant = escapeHtml(input.tenantName);
  const html = htmlShell(
    "Você foi convidado",
    `<p>${safeInviter} convidou você para acessar o Cockpit <strong>${safeTenant}</strong> no NowGo AI.</p>
<p style="font-size:13px;color:#475569">Permissão incluída: <strong>${input.platformAccess === false ? "sem acesso à Plataforma" : "acesso à Plataforma"}</strong>.</p>
<p style="margin:24px 0"><a href="${safeUrl}" style="display:inline-block;padding:12px 20px;background:#0f172a;color:#fff;text-decoration:none;border-radius:8px">Aceitar convite</a></p>
<p style="font-size:13px;color:#475569">Ou copie e cole no navegador:<br><span style="word-break:break-all">${safeUrl}</span></p>
<p style="font-size:13px;color:#475569">Este link expira em ${escapeHtml(expires)} e só pode ser usado uma vez.</p>`,
  );
  const text =
    `${input.inviterName} convidou você para o Cockpit ${input.tenantName}.\n` +
    `Permissão: ${input.platformAccess === false ? "sem acesso à Plataforma" : "acesso à Plataforma"}.\n\n` +
    `Aceitar: ${input.inviteUrl}\n\nLink expira em ${expires}.`;
  return { subject, html, text };
}

export interface VerifyEmailInput {
  to: string;
  verifyUrl: string;
}

export function renderVerifyEmail(input: VerifyEmailInput): {
  subject: string;
  html: string;
  text: string;
} {
  const subject = "Confirme seu e-mail no NowGo AI Cockpit";
  const safeUrl = escapeHtml(input.verifyUrl);
  const html = htmlShell(
    "Confirme seu e-mail",
    `<p>Para concluir o cadastro, confirme seu e-mail clicando no botão abaixo.</p>
<p style="margin:24px 0"><a href="${safeUrl}" style="display:inline-block;padding:12px 20px;background:#0f172a;color:#fff;text-decoration:none;border-radius:8px">Confirmar e-mail</a></p>
<p style="font-size:13px;color:#475569">Ou copie e cole no navegador:<br><span style="word-break:break-all">${safeUrl}</span></p>`,
  );
  const text = `Confirme seu e-mail: ${input.verifyUrl}`;
  return { subject, html, text };
}

export interface ResetPasswordInput {
  to: string;
  resetUrl: string;
}

export function renderResetPasswordEmail(input: ResetPasswordInput): {
  subject: string;
  html: string;
  text: string;
} {
  const subject = "Redefinir sua senha no NowGo AI Cockpit";
  const safeUrl = escapeHtml(input.resetUrl);
  const html = htmlShell(
    "Redefinir senha",
    `<p>Recebemos um pedido para redefinir sua senha. Se foi você, clique no botão.</p>
<p style="margin:24px 0"><a href="${safeUrl}" style="display:inline-block;padding:12px 20px;background:#0f172a;color:#fff;text-decoration:none;border-radius:8px">Redefinir senha</a></p>
<p style="font-size:13px;color:#475569">Este link expira em 1 hora. Se não foi você, ignore este e-mail.</p>`,
  );
  const text = `Redefinir senha: ${input.resetUrl} (expira em 1h)`;
  return { subject, html, text };
}

// ---------------------------------------------------------------------------
// Helpers para testes
// ---------------------------------------------------------------------------

export const _internal = {
  DEFAULT_FROM,
  isProduction,
  escapeHtml,
};
