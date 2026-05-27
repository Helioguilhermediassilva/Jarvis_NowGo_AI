/**
 * client/src/components/auth/RequireAuthV2.tsx
 *
 * Guard para rotas que exigem sessão V2 (cookie nowgo_session_v2).
 * - Se loading: mostra fallback discreto.
 * - Se não autenticado: redireciona para /login preservando returnTo.
 * - Se requireRole definido e usuário não tem o papel: 403 amigável.
 */

import { useEffect, type ReactNode } from "react";
import { useLocation } from "wouter";
import { useAuthV2 } from "@/contexts/AuthV2Context";

type V2Role = "superadmin" | "owner" | "admin" | "manager" | "operator" | "viewer";

export default function RequireAuthV2({
  children,
  requireRole,
}: {
  children: ReactNode;
  requireRole?: V2Role | V2Role[];
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

  return <>{children}</>;
}
