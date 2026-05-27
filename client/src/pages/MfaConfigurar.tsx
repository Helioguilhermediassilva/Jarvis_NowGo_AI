/**
 * client/src/pages/MfaConfigurar.tsx
 *
 * Tela /mfa/configurar. Dois cenários de uso:
 *  1. Configuração inicial (login → mfa_setup_required): consome o `mfaTicket`
 *     do sessionStorage para autenticar `setup-init` e `setup-confirm`.
 *  2. Configuração de usuário já autenticado (cockpit → "Ativar MFA"): usa
 *     o cookie de sessão V2 ativo.
 *
 * Fluxo:
 *  a) Ao montar, chama POST /api/auth/v2/mfa/setup-init → recebe otpauthUri
 *     (renderizamos como QR via Google Charts) + secret base32 visível.
 *  b) Usuário escaneia, digita um código de 6 dígitos.
 *  c) POST /api/auth/v2/mfa/setup-confirm → recebe array de backup codes.
 *  d) Tela exibe os 8 backup codes para o usuário copiar/imprimir antes
 *     de continuar para o cockpit.
 */

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link, useLocation } from "wouter";
import AuthShell from "@/components/auth/AuthShell";
import { mfaSetupInitV2, mfaSetupConfirmV2, type ApiError } from "@/lib/authV2Client";

type Stage =
  | { kind: "loading" }
  | { kind: "scan"; secret: string; otpauthUri: string }
  | { kind: "confirming"; secret: string; otpauthUri: string }
  | { kind: "done"; backupCodes: string[] }
  | { kind: "error"; message: string };

const ERROR_LABELS: Record<string, string> = {
  invalid_mfa_ticket: "Sua sessão expirou. Faça login novamente.",
  mfa_ticket_expired: "Sua sessão expirou. Faça login novamente.",
  invalid_session: "Sua sessão expirou. Faça login novamente.",
  invalid_mfa_code: "Código inválido. Tente outro código do app.",
  mfa_already_enabled: "O MFA já está ativo nesta conta.",
  http_error: "Não foi possível concluir a operação. Tente novamente.",
};

function qrUrl(otpauthUri: string): string {
  const encoded = encodeURIComponent(otpauthUri);
  return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&margin=2&data=${encoded}`;
}

export default function MfaConfigurarPage() {
  const [, navigate] = useLocation();
  const [stage, setStage] = useState<Stage>({ kind: "loading" });
  const [code, setCode] = useState("");

  const intent = useMemo(() => sessionStorage.getItem("nowgo.mfaIntent"), []);
  const ticket = useMemo(() => sessionStorage.getItem("nowgo.mfaTicket"), []);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const result = await mfaSetupInitV2(
          intent === "setup" && ticket ? { mfaTicket: ticket } : undefined,
        );
        if (!cancelled) {
          setStage({
            kind: "scan",
            secret: result.secret,
            otpauthUri: result.otpauthUri,
          });
        }
      } catch (e) {
        if (cancelled) return;
        const err = e as ApiError;
        setStage({
          kind: "error",
          message: ERROR_LABELS[err.code] ?? ERROR_LABELS.http_error,
        });
        if (err.code === "invalid_mfa_ticket" || err.code === "mfa_ticket_expired") {
          sessionStorage.removeItem("nowgo.mfaTicket");
          sessionStorage.removeItem("nowgo.mfaIntent");
          setTimeout(() => navigate("/login"), 2500);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [intent, ticket, navigate]);

  async function handleConfirm(e: FormEvent) {
    e.preventDefault();
    if (stage.kind !== "scan") return;
    const trimmed = code.trim();
    if (!/^\d{6}$/.test(trimmed)) return;
    setStage({ kind: "confirming", secret: stage.secret, otpauthUri: stage.otpauthUri });
    try {
      const result = await mfaSetupConfirmV2(
        intent === "setup" && ticket
          ? { mfaTicket: ticket, code: trimmed }
          : { code: trimmed },
      );
      sessionStorage.removeItem("nowgo.mfaTicket");
      sessionStorage.removeItem("nowgo.mfaIntent");
      setStage({ kind: "done", backupCodes: result.backupCodes });
    } catch (e) {
      const err = e as ApiError;
      setStage({
        kind: "error",
        message: ERROR_LABELS[err.code] ?? ERROR_LABELS.http_error,
      });
    }
  }

  if (stage.kind === "loading") {
    return (
      <AuthShell tagline="MFA · CONFIGURAÇÃO" title="Preparando seu MFA…">
        <p className="ng-auth-help" style={{ textAlign: "center", margin: 0 }}>
          Aguarde alguns segundos.
        </p>
      </AuthShell>
    );
  }

  if (stage.kind === "error") {
    return (
      <AuthShell
        tagline="MFA · CONFIGURAÇÃO"
        title="Não foi possível configurar"
        subtitle={stage.message}
        footer={
          <>
            <Link href="/login">Voltar ao login</Link>
          </>
        }
      >
        <p className="ng-auth-help" style={{ textAlign: "center", margin: 0 }}>
          Se o problema persistir, contate o administrador.
        </p>
      </AuthShell>
    );
  }

  if (stage.kind === "done") {
    return (
      <AuthShell
        tagline="MFA · ATIVO"
        title={
          <>
            MFA configurado com <span className="accent">sucesso</span>
          </>
        }
        subtitle="Guarde os backup codes abaixo em local seguro. Eles permitem entrar caso você perca acesso ao app autenticador. Cada código só pode ser usado uma vez."
        footer={
          <>
            <Link href="/login">Ir para o login</Link>
          </>
        }
      >
        <div className="ng-auth-success" role="status">
          MFA ativo. Cada login exigirá um código do app autenticador.
        </div>
        <div className="ng-auth-mfa-grid">
          {stage.backupCodes.map((bc) => (
            <span key={bc}>{bc}</span>
          ))}
        </div>
        <button
          type="button"
          className="ng-auth-submit"
          onClick={() => {
            const blob = new Blob(
              [
                "NowGo AI — Backup codes do MFA\n\n" +
                  stage.backupCodes.join("\n") +
                  "\n\nGuarde este arquivo em local seguro. Cada código só pode ser usado uma vez.",
              ],
              { type: "text/plain" },
            );
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "nowgo-mfa-backup-codes.txt";
            a.click();
            URL.revokeObjectURL(url);
          }}
        >
          Baixar backup codes (.txt)
        </button>
        <p className="ng-auth-help">
          Recomendamos imprimir ou armazenar em gerenciador de senhas (1Password,
          Bitwarden, etc.) antes de prosseguir.
        </p>
      </AuthShell>
    );
  }

  // stage.kind === "scan" || "confirming"
  const submitting = stage.kind === "confirming";
  return (
    <AuthShell
      tagline="MFA · CONFIGURAÇÃO"
      title={
        <>
          Ative o <span className="accent">2º fator</span> de autenticação
        </>
      }
      subtitle="Escaneie o QR code com Google Authenticator, 1Password, Authy ou similar. Depois digite o código de 6 dígitos para confirmar."
      footer={
        <>
          <Link href="/login">Voltar ao login</Link>
        </>
      }
    >
      <img src={qrUrl(stage.otpauthUri)} alt="QR code do MFA" className="ng-auth-qr" />
      <p className="ng-auth-help" style={{ textAlign: "center" }}>
        Não consegue escanear? Insira a chave manualmente no app:
      </p>
      <div
        className="ng-auth-mfa-grid"
        style={{ gridTemplateColumns: "1fr", textAlign: "center" }}
      >
        <span>{stage.secret}</span>
      </div>
      <form onSubmit={handleConfirm} noValidate style={{ marginTop: "1rem" }}>
        <label className="ng-auth-field">
          <span className="ng-auth-field-label">Código de 6 dígitos</span>
          <input
            type="text"
            className="ng-auth-input"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            placeholder="000000"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            required
            disabled={submitting}
            style={{
              letterSpacing: "0.6em",
              textAlign: "center",
              fontSize: "1.1rem",
            }}
          />
        </label>
        <button
          type="submit"
          className="ng-auth-submit"
          disabled={submitting || !/^\d{6}$/.test(code)}
        >
          {submitting ? "Confirmando…" : "Ativar MFA"}
        </button>
      </form>
    </AuthShell>
  );
}
