/**
 * client/src/hooks/useAuth.ts
 *
 * Hook de autenticação NowGo. Sincroniza estado da sessão Jarvis NowGo AI.
 * Não persiste token no JS — o cookie nowgo_session é HttpOnly.
 */

import { useEffect, useState, useCallback } from "react";

export type AuthRole = "superadmin" | "operador" | "leitor";

export interface AuthUser {
  email: string;
  name: string | null;
  picture: string | null;
  role: AuthRole;
}

export interface AuthState {
  loading: boolean;
  authenticated: boolean;
  user: AuthUser | null;
  refresh: () => Promise<void>;
  loginUrl: (returnTo?: string) => string;
  logout: () => Promise<void>;
}

const ME_ENDPOINT = "/api/auth/me";

export function useAuth(): AuthState {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);

  const refresh = useCallback(async () => {
    try {
      const r = await fetch(ME_ENDPOINT, {
        credentials: "include",
        cache: "no-store",
      });
      if (!r.ok) {
        setAuthenticated(false);
        setUser(null);
      } else {
        const j = (await r.json()) as
          | { authenticated: false }
          | { authenticated: true; user: AuthUser };
        if (j.authenticated) {
          setAuthenticated(true);
          setUser(j.user);
        } else {
          setAuthenticated(false);
          setUser(null);
        }
      }
    } catch {
      setAuthenticated(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const loginUrl = useCallback((returnTo?: string) => {
    const safe =
      returnTo && returnTo.startsWith("/") && !returnTo.startsWith("//")
        ? returnTo
        : "/cockpit";
    const q = new URLSearchParams({ returnTo: safe });
    return `/api/auth/google/start?${q.toString()}`;
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch {
      // ignore
    }
    setAuthenticated(false);
    setUser(null);
    window.location.href = "/";
  }, []);

  return { loading, authenticated, user, refresh, loginUrl, logout };
}
