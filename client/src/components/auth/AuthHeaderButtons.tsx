/**
 * client/src/components/auth/AuthHeaderButtons.tsx
 *
 * Substitui o single-button `ng-header-login` do LandingShell por um cluster
 * Login + Cadastro (quando não autenticado V2) OU por um menu de usuário
 * (quando autenticado V2).
 *
 * Reaproveita a classe `.ng-header-login` existente (paleta cyan, Outfit) sem
 * adicionar CSS novo. Apenas duplica o botão e adiciona uma variante secundária
 * que reusa o mesmo estilo com tonalidade ajustada via inline-style mínima.
 */

import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuthV2 } from "@/contexts/AuthV2Context";
import { useLang } from "@/landing/useLang";
import type { Lang } from "@/landing/copy";
import { openXavierLogin } from "@/lib/xavierHandoff";

/** Rótulos trilíngues dos botões/menus de autenticação (segue copy.ts). */
const AUTH_LABELS: Record<
  Lang,
  {
    signup: string;
    signupAria: string;
    login: string;
    loginAria: string;
    xavier: string;
    mfa: string;
    manage: string;
    logout: string;
  }
> = {
  pt: {
    signup: "Cadastro",
    signupAria: "Cadastro por convite",
    login: "Login",
    loginAria: "Login restrito",
    xavier: "Abrir Xavier",
    mfa: "Ativar MFA (recomendado)",
    manage: "Gerenciar usuários",
    logout: "Sair",
  },
  en: {
    signup: "Sign up",
    signupAria: "Sign up by invitation",
    login: "Log in",
    loginAria: "Restricted login",
    xavier: "Open Xavier",
    mfa: "Enable MFA (recommended)",
    manage: "Manage users",
    logout: "Sign out",
  },
  es: {
    signup: "Registro",
    signupAria: "Registro por invitación",
    login: "Acceder",
    loginAria: "Acceso restringido",
    xavier: "Abrir Xavier",
    mfa: "Activar MFA (recomendado)",
    manage: "Gestionar usuarios",
    logout: "Salir",
  },
};

export default function AuthHeaderButtons({
  cockpitLabel = "Cockpit",
}: {
  cockpitLabel?: string;
}) {
  const { authenticated, user, logout, loading } = useAuthV2();
  const { lang } = useLang();
  const t = AUTH_LABELS[lang];
  const [, navigate] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!menuOpen) return;
    function onClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [menuOpen]);

  if (loading) {
    return (
      <span
        className="ng-header-login"
        aria-busy="true"
        style={{ opacity: 0.5, pointerEvents: "none" }}
      >
        ···
      </span>
    );
  }

  if (!authenticated || !user) {
    return (
      <>
        <Link
          href="/cadastro"
          className="ng-header-login"
          aria-label={t.signupAria}
          style={{
            background: "transparent",
            color: "var(--accent-cyan, #33D2FF)",
            borderColor: "var(--accent-cyan, #33D2FF)",
          }}
        >
          {t.signup}
        </Link>
        <Link href="/login" className="ng-header-login" aria-label={t.loginAria}>
          <span aria-hidden="true" className="ng-header-login-lock">▢</span>
          {t.login}
        </Link>
      </>
    );
  }

  // Autenticado V2 → exibe menu de usuário.
  const initials = (user.email[0] ?? "?").toUpperCase();
  const canManage =
    user.role === "superadmin" || user.role === "owner" || user.role === "admin";

  return (
    <div ref={menuRef} style={{ position: "relative" }}>
      <button
        type="button"
        className="ng-header-login"
        aria-haspopup="menu"
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen((v) => !v)}
      >
        <span
          aria-hidden="true"
          style={{
            display: "inline-flex",
            width: "1.4rem",
            height: "1.4rem",
            borderRadius: "50%",
            background: "var(--accent-cyan, #33D2FF)",
            color: "#001120",
            fontWeight: 700,
            alignItems: "center",
            justifyContent: "center",
            marginRight: "0.5rem",
            fontSize: "0.85rem",
          }}
        >
          {initials}
        </span>
        {user.email.split("@")[0]}
      </button>
      {menuOpen && (
        <div
          role="menu"
          style={{
            position: "absolute",
            right: 0,
            top: "calc(100% + 0.5rem)",
            minWidth: "260px",
            background: "rgba(10, 16, 36, 0.98)",
            border: "1px solid rgba(51, 210, 255, 0.25)",
            borderRadius: "12px",
            padding: "0.75rem 0",
            boxShadow: "0 16px 40px rgba(0, 0, 0, 0.45)",
            backdropFilter: "blur(8px)",
            zIndex: 9999,
          }}
        >
          <div
            style={{
              padding: "0.5rem 1rem 0.75rem",
              borderBottom: "1px solid rgba(255,255,255,0.08)",
              marginBottom: "0.5rem",
            }}
          >
            <div
              style={{
                color: "rgba(255,255,255,0.92)",
                fontWeight: 600,
                fontSize: "0.95rem",
              }}
            >
              {user.email}
            </div>
            <div
              style={{
                color: "rgba(255,255,255,0.55)",
                fontSize: "0.78rem",
                marginTop: "0.15rem",
              }}
            >
              {user.role} · {user.tenantSlug}
            </div>
          </div>
          <MenuItem
            onClick={() => {
              setMenuOpen(false);
              openXavierLogin(lang);
            }}
          >
            {t.xavier}
          </MenuItem>
          <MenuItem onClick={() => { setMenuOpen(false); navigate("/cockpit"); }}>
            {cockpitLabel}
          </MenuItem>
          {!user.mfaEnabled && (
            <MenuItem
              onClick={() => {
                setMenuOpen(false);
                navigate("/mfa/configurar");
              }}
            >
              {t.mfa}
            </MenuItem>
          )}
          {canManage && (
            <MenuItem
              onClick={() => {
                setMenuOpen(false);
                navigate("/admin/usuarios");
              }}
            >
              {t.manage}
            </MenuItem>
          )}
          <div
            style={{
              borderTop: "1px solid rgba(255,255,255,0.08)",
              marginTop: "0.5rem",
              paddingTop: "0.5rem",
            }}
          >
            <MenuItem
              onClick={async () => {
                setMenuOpen(false);
                await logout();
                navigate("/");
              }}
              danger
            >
              {t.logout}
            </MenuItem>
          </div>
        </div>
      )}
    </div>
  );
}

function MenuItem({
  children,
  onClick,
  danger,
}: {
  children: React.ReactNode;
  onClick: () => void | Promise<void>;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={() => {
        void onClick();
      }}
      style={{
        display: "block",
        width: "100%",
        textAlign: "left",
        padding: "0.5rem 1rem",
        background: "transparent",
        border: "none",
        color: danger ? "#ff8a8a" : "rgba(255,255,255,0.88)",
        font: "inherit",
        fontSize: "0.9rem",
        cursor: "pointer",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.background =
          "rgba(51, 210, 255, 0.08)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.background = "transparent";
      }}
    >
      {children}
    </button>
  );
}
