/**
 * client/src/components/cockpit/UserManagementDrawer.tsx
 *
 * Gestão de Acesso NowGo Holding (visível apenas ao superadmin).
 *
 * Permite listar, adicionar e ativar/desativar usuários da whitelist
 * armazenada na database "NowGo Users" do Notion. As mutações vão para
 * o endpoint `/api/users` que valida superadmin no servidor.
 */

import { useCallback, useEffect, useState } from "react";

const C = {
  PANEL: "rgba(2,12,20,0.96)",
  PANEL_2: "rgba(8,20,32,0.92)",
  BORDER: "#1a5c7a",
  BORDER_DIM: "#0d3347",
  PRI: "#00d4ff",
  ACC: "#bb88ff",
  ACC2: "#00ffaa",
  WARN: "#ffcc00",
  DANGER: "#ff7799",
  TXT: "#d8f8ff",
  TXT_DIM: "#5ab8cc",
  TXT_FAINT: "#3a8a9a",
};

type Role = "superadmin" | "operador" | "leitor";

interface NowGoUser {
  email: string;
  name?: string;
  picture?: string;
  role: Role;
  active: boolean;
}

interface Props {
  open: boolean;
  onClose: () => void;
  currentUserEmail: string;
}

export default function UserManagementDrawer({
  open,
  onClose,
  currentUserEmail,
}: Props) {
  const [users, setUsers] = useState<NowGoUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form de novo usuário
  const [newEmail, setNewEmail] = useState("");
  const [newName, setNewName] = useState("");
  const [newRole, setNewRole] = useState<Role>("operador");
  const [submitting, setSubmitting] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await fetch("/api/users", { credentials: "include" });
      if (!r.ok) {
        const j = await r.json().catch(() => ({}));
        throw new Error(j?.error ?? `Falha (${r.status})`);
      }
      const j = await r.json();
      setUsers(Array.isArray(j.users) ? j.users : []);
    } catch (e: any) {
      setError(e.message ?? "Erro ao carregar usuários.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) void fetchUsers();
  }, [open, fetchUsers]);

  // ESC fecha
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const r = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email: newEmail.trim().toLowerCase(),
          name: newName.trim() || undefined,
          role: newRole,
        }),
      });
      if (!r.ok) {
        const j = await r.json().catch(() => ({}));
        throw new Error(j?.error ?? `Falha (${r.status})`);
      }
      setNewEmail("");
      setNewName("");
      setNewRole("operador");
      await fetchUsers();
    } catch (e: any) {
      setError(e.message ?? "Erro ao adicionar usuário.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (email: string, current: boolean) => {
    try {
      const r = await fetch("/api/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, active: !current }),
      });
      if (!r.ok) {
        const j = await r.json().catch(() => ({}));
        throw new Error(j?.error ?? `Falha (${r.status})`);
      }
      await fetchUsers();
    } catch (e: any) {
      setError(e.message ?? "Erro ao atualizar usuário.");
    }
  };

  const handleChangeRole = async (email: string, role: Role) => {
    try {
      const r = await fetch("/api/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, role }),
      });
      if (!r.ok) {
        const j = await r.json().catch(() => ({}));
        throw new Error(j?.error ?? `Falha (${r.status})`);
      }
      await fetchUsers();
    } catch (e: any) {
      setError(e.message ?? "Erro ao alterar papel.");
    }
  };

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,6,10,0.7)",
          backdropFilter: "blur(4px)",
          zIndex: 200,
        }}
      />
      {/* Drawer */}
      <aside
        role="dialog"
        aria-label="Gestão de Acesso NowGo"
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          width: "min(560px, 100vw)",
          background: C.PANEL,
          borderLeft: `1px solid ${C.BORDER}`,
          boxShadow: "-12px 0 40px rgba(0,0,0,0.6)",
          zIndex: 201,
          display: "flex",
          flexDirection: "column",
          fontFamily: "'Inter', system-ui, sans-serif",
        }}
      >
        {/* Header */}
        <header
          style={{
            padding: "20px 24px",
            borderBottom: `1px solid ${C.BORDER_DIM}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div
              style={{
                fontSize: 10,
                letterSpacing: 3,
                color: C.ACC,
                textTransform: "uppercase",
                fontWeight: 700,
                marginBottom: 4,
              }}
            >
              Gestão de Acesso
            </div>
            <h2
              style={{
                margin: 0,
                fontSize: 20,
                color: C.TXT,
                fontFamily: "'Fraunces', serif",
                fontWeight: 600,
                letterSpacing: -0.5,
              }}
            >
              NowGo Holding · Whitelist
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Fechar"
            style={{
              background: "transparent",
              border: `1px solid ${C.BORDER_DIM}`,
              color: C.TXT_DIM,
              borderRadius: 8,
              width: 36,
              height: 36,
              cursor: "pointer",
              fontSize: 16,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ×
          </button>
        </header>

        {/* Body */}
        <div style={{ flex: 1, overflow: "auto", padding: 24 }}>
          {error && (
            <div
              style={{
                background: "rgba(255,119,153,0.08)",
                border: `1px solid ${C.DANGER}66`,
                color: C.DANGER,
                padding: "10px 14px",
                borderRadius: 8,
                fontSize: 13,
                marginBottom: 16,
              }}
            >
              {error}
            </div>
          )}

          {/* Form adicionar */}
          <form
            onSubmit={handleAddUser}
            style={{
              background: C.PANEL_2,
              border: `1px solid ${C.BORDER_DIM}`,
              borderRadius: 12,
              padding: 16,
              marginBottom: 24,
              display: "grid",
              gap: 12,
            }}
          >
            <div
              style={{
                fontSize: 11,
                letterSpacing: 2,
                color: C.PRI,
                textTransform: "uppercase",
                fontWeight: 700,
              }}
            >
              + Adicionar usuário
            </div>
            <input
              type="email"
              required
              placeholder="email@nowgo.com.br"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              style={inputStyle()}
            />
            <input
              type="text"
              placeholder="Nome (opcional)"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              style={inputStyle()}
            />
            <select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value as Role)}
              style={inputStyle()}
            >
              <option value="leitor">Leitor (somente leitura)</option>
              <option value="operador">Operador (operação padrão)</option>
              <option value="superadmin">Superadmin (gestão de acesso)</option>
            </select>
            <button
              type="submit"
              disabled={submitting || !newEmail.trim()}
              style={{
                ...buttonStyle(C.ACC2),
                opacity: submitting || !newEmail.trim() ? 0.5 : 1,
                cursor:
                  submitting || !newEmail.trim() ? "not-allowed" : "pointer",
              }}
            >
              {submitting ? "Adicionando..." : "Adicionar"}
            </button>
          </form>

          {/* Lista */}
          <div
            style={{
              fontSize: 11,
              letterSpacing: 2,
              color: C.TXT_FAINT,
              textTransform: "uppercase",
              fontWeight: 700,
              marginBottom: 12,
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <span>Usuários autorizados</span>
            <span>{users.length}</span>
          </div>

          {loading ? (
            <div
              style={{
                color: C.TXT_FAINT,
                textAlign: "center",
                padding: 24,
                fontSize: 12,
                letterSpacing: 2,
                textTransform: "uppercase",
              }}
            >
              carregando...
            </div>
          ) : users.length === 0 ? (
            <div
              style={{
                color: C.TXT_FAINT,
                textAlign: "center",
                padding: 24,
                fontSize: 13,
              }}
            >
              Nenhum usuário cadastrado.
            </div>
          ) : (
            <ul
              style={{
                listStyle: "none",
                padding: 0,
                margin: 0,
                display: "grid",
                gap: 10,
              }}
            >
              {users.map((u) => {
                const isMe = u.email === currentUserEmail.toLowerCase();
                return (
                  <li
                    key={u.email}
                    style={{
                      background: C.PANEL_2,
                      border: `1px solid ${
                        u.active ? C.BORDER_DIM : "rgba(255,119,153,0.3)"
                      }`,
                      borderRadius: 10,
                      padding: 14,
                      display: "grid",
                      gap: 8,
                      opacity: u.active ? 1 : 0.55,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 10,
                      }}
                    >
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div
                          style={{
                            color: C.TXT,
                            fontSize: 14,
                            fontWeight: 600,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {u.email}
                          {isMe && (
                            <span
                              style={{
                                marginLeft: 8,
                                fontSize: 10,
                                color: C.ACC2,
                                fontWeight: 700,
                                letterSpacing: 1,
                              }}
                            >
                              · VOCÊ
                            </span>
                          )}
                        </div>
                        {u.name && (
                          <div
                            style={{
                              color: C.TXT_DIM,
                              fontSize: 12,
                              marginTop: 2,
                            }}
                          >
                            {u.name}
                          </div>
                        )}
                      </div>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        gap: 8,
                        alignItems: "center",
                        flexWrap: "wrap",
                      }}
                    >
                      <select
                        value={u.role}
                        disabled={isMe}
                        onChange={(e) =>
                          handleChangeRole(u.email, e.target.value as Role)
                        }
                        style={{
                          ...inputStyle(),
                          padding: "6px 10px",
                          fontSize: 12,
                          flex: "1 1 auto",
                        }}
                      >
                        <option value="leitor">Leitor</option>
                        <option value="operador">Operador</option>
                        <option value="superadmin">Superadmin</option>
                      </select>
                      <button
                        onClick={() => handleToggleActive(u.email, u.active)}
                        disabled={isMe}
                        style={{
                          background: u.active
                            ? "rgba(255,119,153,0.12)"
                            : "rgba(0,255,170,0.12)",
                          border: `1px solid ${
                            u.active ? C.DANGER : C.ACC2
                          }66`,
                          color: u.active ? C.DANGER : C.ACC2,
                          padding: "6px 12px",
                          borderRadius: 8,
                          fontSize: 11,
                          fontWeight: 700,
                          letterSpacing: 1,
                          textTransform: "uppercase",
                          cursor: isMe ? "not-allowed" : "pointer",
                          opacity: isMe ? 0.4 : 1,
                          transition: "all 140ms ease-out",
                        }}
                      >
                        {u.active ? "Desativar" : "Ativar"}
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Footer */}
        <footer
          style={{
            padding: "12px 24px",
            borderTop: `1px solid ${C.BORDER_DIM}`,
            fontSize: 11,
            color: C.TXT_FAINT,
            letterSpacing: 1,
          }}
        >
          Whitelist soberana · armazenada no NowGo Brain (Notion)
        </footer>
      </aside>
    </>
  );
}

function inputStyle(): React.CSSProperties {
  return {
    background: "rgba(0,16,28,0.6)",
    border: "1px solid #1a5c7a55",
    color: "#d8f8ff",
    padding: "10px 12px",
    borderRadius: 8,
    fontSize: 13,
    fontFamily: "'Inter', system-ui, sans-serif",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
  };
}

function buttonStyle(color: string): React.CSSProperties {
  return {
    background: `${color}22`,
    border: `1px solid ${color}66`,
    color: color,
    padding: "10px 16px",
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 700,
    letterSpacing: 1,
    textTransform: "uppercase",
    cursor: "pointer",
    transition: "all 160ms cubic-bezier(0.23,1,0.32,1)",
  };
}
