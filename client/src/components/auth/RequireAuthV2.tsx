/**
 * client/src/components/auth/RequireAuthV2.tsx
 *
 * Guard para rotas que exigem sessão V2 (cookie nowgo_session_v2).
 * - Se loading: mostra fallback discreto.
 * - Se não autenticado: redireciona para /login preservando returnTo.
 * - Se requireRole definido e usuário não tem o papel: 403 amigável.
 * - Se requirePlatformAccess definido e o tenant ainda não foi habilitado
 *   pelo billing: mantém o usuário fora do cockpit e oferece a rota /billing.
 */

import { useEffect, type ReactNode } from "react";
import { useLocation } from "wouter";
import { useAuthV2 } from "@/contexts/AuthV2Context";

type V2Role = "superadmin" | "owner" | "admin" | "manager" | "operator" | "viewer";

export default function RequireAuthV2({
  children,
  requireRole,
  requirePlatformAccess = false,
}: {
  children: ReactNode;
  requireRole?: V2Role | V2Role[];
  requirePlatformAccess?: boolean;
}) {
  const { authenticated, user, loading } = useAuthV2();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (loading) return;
    if (!authenticated) {
      const returnTo = encodeURIComponent(window.location.pathname + window.location.search);
      navigate(`/login?returnTo=${returnTo}`);
    }
  }, [loading, authenticated, navigate]);

  if (loading) {
    return (
      <div
        style={{
          minHeight: "60vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "rgba(255,255,255,0.55)",
          fontFamily: "var(--ng-font-body, Inter, sans-serif)",
          fontSize: "0.95rem",
        }}
      >
        Verificando sessão…
      </div>
    );
  }

  if (!authenticated || !user) return null; // navigation já disparada

  if (requireRole) {
    const roles = Array.isArray(requireRole) ? requireRole : [requireRole];
    if (!roles.includes(user.role as V2Role)) {
      return (
        <div
          style={{
            minHeight: "60vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            color: "rgba(255,255,255,0.78)",
            fontFamily: "var(--ng-font-body, Inter, sans-serif)",
            textAlign: "center",
            padding: "2rem",
          }}
        >
          <h2 style={{ margin: 0, marginBottom: "0.75rem" }}>Acesso restrito</h2>
          <p style={{ margin: 0, opacity: 0.78, maxWidth: "32rem" }}>
            Esta área é exclusiva para perfis administrativos. Se você acredita
            que deveria ter acesso, fale com o administrador da sua organização.
          </p>
        </div>
      );
    }
  }

  if (requirePlatformAccess && !user.platformAccess) {
    return (
      <div
        style={{
          minHeight: "60vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          color: "rgba(255,255,255,0.82)",
          fontFamily: "var(--ng-font-body, Inter, sans-serif)",
          textAlign: "center",
          padding: "2rem",
        }}
      >
        <h2 style={{ margin: 0, marginBottom: "0.75rem" }}>
          Configure seu acesso à Plataforma
        </h2>
        <p style={{ margin: 0, opacity: 0.78, maxWidth: "34rem", lineHeight: 1.6 }}>
          Para abrir o cockpit, conclua a assinatura e informe os dados do seu
          cartão no Stripe. O acesso será liberado automaticamente após a
          confirmação da assinatura, inclusive durante o período de teste.
        </p>
        <a
          href="/billing"
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            marginTop: "1.5rem",
            minHeight: "2.75rem",
            padding: "0.75rem 1.25rem",
            borderRadius: "0.75rem",
            background: "#ffffff",
            color: "#071018",
            fontWeight: 700,
            textDecoration: "none",
          }}
        >
          Configurar assinatura
        </a>
      </div>
    );
  }

  return <>{children}</>;
}
