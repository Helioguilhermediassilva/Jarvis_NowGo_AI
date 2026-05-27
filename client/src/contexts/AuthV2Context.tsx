/**
 * client/src/contexts/AuthV2Context.tsx
 *
 * Context React que expõe a sessão V2 (cookie nowgo_session_v2 HttpOnly).
 *
 * Coexiste com o useAuth() V1 (Google OAuth, cookie nowgo_session) sem conflito.
 * Cada hook gerencia o próprio fluxo; nenhum lê o cookie diretamente.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  fetchMeV2,
  logoutV2,
  type AuthV2User,
} from "@/lib/authV2Client";

export interface AuthV2State {
  loading: boolean;
  authenticated: boolean;
  user: AuthV2User | null;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthV2Ctx = createContext<AuthV2State | null>(null);

export function AuthV2Provider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<AuthV2User | null>(null);

  const refresh = useCallback(async () => {
    try {
      const u = await fetchMeV2();
      setUser(u);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutV2();
    } catch {
      // logout é idempotente; ignora erro
    }
    setUser(null);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const value = useMemo<AuthV2State>(
    () => ({
      loading,
      authenticated: !!user,
      user,
      refresh,
      logout,
    }),
    [loading, user, refresh, logout],
  );

  return <AuthV2Ctx.Provider value={value}>{children}</AuthV2Ctx.Provider>;
}

export function useAuthV2(): AuthV2State {
  const ctx = useContext(AuthV2Ctx);
  if (!ctx) {
    throw new Error("useAuthV2 must be used within AuthV2Provider");
  }
  return ctx;
}
