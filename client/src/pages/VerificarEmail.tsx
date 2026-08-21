/**
 * client/src/pages/VerificarEmail.tsx
 *
 * Tela /verificar-email/:token. Ao montar, dispara POST /api/auth/v2/email/verify.
 * Em qualquer falha mostra mensagem genérica anti-enumeração com link de voltar.
 */

import { useEffect, useState } from "react";
import { Link, useRoute } from "wouter";
import AuthShell from "@/components/auth/AuthShell";
import { verifyEmailV2, type ApiError } from "@/lib/authV2Client";

type State =
  | { kind: "loading" }
  | { kind: "success" }
  | { kind: "error"; message: string };

export default function VerificarEmailPage() {
  const [, params] = useRoute<{ token: string }>("/verificar-email/:token");
  const token = params?.token ?? null;
  const email = new URLSearchParams(window.location.search).get("email")?.trim().toLowerCase() ?? null;
  const [state, setState] = useState<State>({ kind: "loading" });

  useEffect(() => {
    if (!token || !email) {
      setState({
        kind: "error",
        message: "Link incompleto. Use o link enviado por e-mail para confirmar seu endereço.",
      });
      return;
    }
    let cancelled = false;
    void (async () => {
      try {
        await verifyEmailV2(token, email);
        if (!cancelled) setState({ kind: "success" });
      } catch (e) {
        if (cancelled) return;
        const err = e as ApiError;
        const message =
          err.status === 410 || err.code === "invalid_or_expired"
            ? "Este link de verificação expirou ou já foi utilizado."
            : "Não foi possível verificar seu e-mail. Tente novamente em alguns minutos.";
        setState({ kind: "error", message });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token, email]);

  if (state.kind === "loading") {
    return (
      <AuthShell tagline="VERIFICANDO" title="Confirmando seu e-mail…">
        <p className="ng-auth-help" style={{ textAlign: "center", margin: 0 }}>
          Aguarde alguns segundos.
        </p>
      </AuthShell>
    );
  }

  if (state.kind === "success") {
    return (
      <AuthShell
        tagline="E-MAIL CONFIRMADO"
        title={
          <>
            Seu e-mail foi <span className="accent">verificado</span>
          </>
        }
        subtitle="Tudo pronto. Agora você já pode entrar no cockpit com seu e-mail e senha."
        footer={
          <>
            <Link href="/login">Ir para o login</Link>
          </>
        }
      >
        <div className="ng-auth-success" role="status">
          Verificação concluída com sucesso.
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      tagline="VERIFICAÇÃO"
      title="Não foi possível verificar"
      subtitle={state.message}
      footer={
        <>
          <Link href="/login">Voltar ao login</Link>
          {" · "}
          <Link href="/cadastro">Solicitar novo cadastro</Link>
        </>
      }
    >
      <p className="ng-auth-help" style={{ textAlign: "center", margin: 0 }}>
        Se o problema persistir, contate o administrador da sua organização.
      </p>
    </AuthShell>
  );
}
