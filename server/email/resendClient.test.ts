/**
 * Testes do cliente de e-mail Resend (modo log-only sem RESEND_API_KEY).
 *
 * Cobertura: validação de input, modo de operação, render dos 3 templates,
 * escape HTML.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  EmailDeliveryError,
  _internal,
  renderInviteEmail,
  renderResetPasswordEmail,
  renderVerifyEmail,
  sendEmail,
} from "./resendClient";

let originalKey: string | undefined;

beforeEach(() => {
  originalKey = process.env.RESEND_API_KEY;
  delete process.env.RESEND_API_KEY;
});

afterEach(() => {
  if (originalKey === undefined) {
    delete process.env.RESEND_API_KEY;
  } else {
    process.env.RESEND_API_KEY = originalKey;
  }
});

// ---------------------------------------------------------------------------
// EmailDeliveryError
// ---------------------------------------------------------------------------

describe("EmailDeliveryError", () => {
  it("preserva código e mensagem", () => {
    const e = new EmailDeliveryError("provider_error", "msg", 503);
    expect(e.code).toBe("provider_error");
    expect(e.message).toBe("msg");
    expect(e.providerStatus).toBe(503);
    expect(e.name).toBe("EmailDeliveryError");
  });
});

// ---------------------------------------------------------------------------
// sendEmail (modo log-only)
// ---------------------------------------------------------------------------

describe("sendEmail em modo log-only", () => {
  it("retorna mode='log-only' quando RESEND_API_KEY ausente", async () => {
    const spy = vi.spyOn(console, "info").mockImplementation(() => {});
    const result = await sendEmail({
      to: "x@y.com",
      subject: "Hi",
      html: "<p>Hello</p>",
    });
    expect(result.ok).toBe(true);
    expect(result.mode).toBe("log-only");
    expect(result.id).toMatch(/^log-/);
    expect(spy).toHaveBeenCalledTimes(1);
    spy.mockRestore();
  });

  it("loga e-mail destino, subject e tag — mas NÃO loga o html nem text", async () => {
    const spy = vi.spyOn(console, "info").mockImplementation(() => {});
    await sendEmail({
      to: "x@y.com",
      subject: "S",
      html: "<p>SECRETO</p>",
      text: "SEGREDO TEXTUAL",
      tag: "invite",
    });
    const logged = spy.mock.calls[0][0] as string;
    expect(logged).toContain("x@y.com");
    expect(logged).toContain("\"subject\":\"S\"");
    expect(logged).toContain("\"tag\":\"invite\"");
    expect(logged).not.toContain("SECRETO");
    expect(logged).not.toContain("SEGREDO");
    spy.mockRestore();
  });

  it("rejeita to vazio", async () => {
    await expect(sendEmail({ to: "", subject: "X", html: "<p/>" })).rejects.toBeInstanceOf(
      EmailDeliveryError,
    );
  });

  it("rejeita subject vazio", async () => {
    await expect(sendEmail({ to: "a@b.com", subject: "", html: "<p/>" })).rejects.toBeInstanceOf(
      EmailDeliveryError,
    );
  });

  it("rejeita corpo vazio (sem html nem text)", async () => {
    await expect(
      sendEmail({ to: "a@b.com", subject: "S", html: "" }),
    ).rejects.toBeInstanceOf(EmailDeliveryError);
  });
});

// ---------------------------------------------------------------------------
// isProduction()
// ---------------------------------------------------------------------------

describe("_internal.isProduction", () => {
  it("false quando RESEND_API_KEY ausente", () => {
    delete process.env.RESEND_API_KEY;
    expect(_internal.isProduction()).toBe(false);
  });
  it("true quando RESEND_API_KEY definida", () => {
    process.env.RESEND_API_KEY = "re_xxx";
    expect(_internal.isProduction()).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// escapeHtml
// ---------------------------------------------------------------------------

describe("_internal.escapeHtml", () => {
  it("escapa <, >, &, \", '", () => {
    expect(_internal.escapeHtml("<script>alert('x')</script>")).toBe(
      "&lt;script&gt;alert(&#39;x&#39;)&lt;/script&gt;",
    );
    expect(_internal.escapeHtml("a & b")).toBe("a &amp; b");
    expect(_internal.escapeHtml('"quote"')).toBe("&quot;quote&quot;");
  });

  it("preserva strings sem caracteres especiais", () => {
    expect(_internal.escapeHtml("simples")).toBe("simples");
  });
});

// ---------------------------------------------------------------------------
// Templates
// ---------------------------------------------------------------------------

describe("renderInviteEmail", () => {
  const expiresAt = new Date("2026-06-01T12:00:00Z");

  it("monta subject, html e text", () => {
    const r = renderInviteEmail({
      to: "convidado@cliente.com",
      inviterName: "Hélio",
      tenantName: "GDF Saúde",
      inviteUrl: "https://nowgoai.com/convite/abc123",
      expiresAt,
    });
    expect(r.subject).toContain("GDF Saúde");
    expect(r.html).toContain("Hélio");
    expect(r.html).toContain("https://nowgoai.com/convite/abc123");
    expect(r.text).toContain("Aceitar:");
  });

  it("escapa nome do inviter e tenant para evitar XSS", () => {
    const r = renderInviteEmail({
      to: "x@y.com",
      inviterName: "<script>alert(1)</script>",
      tenantName: "Tenant <>",
      inviteUrl: "https://example.com",
      expiresAt,
    });
    expect(r.html).not.toContain("<script>alert(1)</script>");
    expect(r.html).toContain("&lt;script&gt;");
  });

  it("escapa o URL de convite para evitar quebra de atributo", () => {
    const r = renderInviteEmail({
      to: "x@y.com",
      inviterName: "A",
      tenantName: "T",
      inviteUrl: 'https://x.com/"onclick=evil',
      expiresAt,
    });
    expect(r.html).not.toContain('"onclick=evil');
    expect(r.html).toContain("&quot;onclick=evil");
  });
});

describe("renderVerifyEmail", () => {
  it("monta subject e CTA", () => {
    const r = renderVerifyEmail({
      to: "x@y.com",
      verifyUrl: "https://app/v/tok",
    });
    expect(r.subject).toContain("Confirme");
    expect(r.html).toContain("https://app/v/tok");
    expect(r.text).toContain("https://app/v/tok");
  });
});

describe("renderResetPasswordEmail", () => {
  it("monta subject + CTA + aviso de 1h", () => {
    const r = renderResetPasswordEmail({
      to: "x@y.com",
      resetUrl: "https://app/r/tok",
    });
    expect(r.subject).toContain("Redefinir");
    expect(r.html).toContain("https://app/r/tok");
    expect(r.html).toContain("expira em 1 hora");
    expect(r.text).toContain("expira em 1h");
  });
});
