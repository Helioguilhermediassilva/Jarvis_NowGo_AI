/**
 * client/src/components/RequireAuth.tsx
 *
 * Guard de rota frontend: exige usuário autenticado.
 * Se não autenticado, redireciona para a landing com returnTo.
 */

import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const { loading, authenticated, loginUrl } = useAuth();

  useEffect(() => {
    if (!loading && !authenticated) {
      const path = window.location.pathname + window.location.search;
      window.location.href = loginUrl(path);
    }
  }, [loading, authenticated, loginUrl]);

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#00060a",
          color: "#5ab8cc",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "monospace",
          fontSize: 12,
          letterSpacing: 3,
          textTransform: "uppercase",
        }}
      >
        verificando sessão NowGo...
      </div>
    );
  }

  if (!authenticated) {
    // Já redirecionando — render placeholder mínimo
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#00060a",
          color: "#5ab8cc",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "monospace",
          fontSize: 12,
          letterSpacing: 3,
          textTransform: "uppercase",
        }}
      >
        redirecionando para login...
      </div>
    );
  }

  return <>{children}</>;
}
