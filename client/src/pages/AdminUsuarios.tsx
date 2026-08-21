/**
 * client/src/pages/AdminUsuarios.tsx
 *
 * Tela /admin/usuarios — gestão de membros do tenant atual.
 * Acessível apenas para roles superadmin/owner/admin (via RequireAuthV2).
 *
 * Funcionalidade mínima desta fase:
 *  - Formulário de convite: email + role + (opcional) tenantId.
 *  - Aciona POST /api/auth/v2/invite/create.
 *  - Mostra link de convite gerado (caso a API retorne) e mensagem de sucesso.
 *
 * Em fases futuras, esta tela ganhará: lista de membros ativos, lista de
 * convites pendentes, ação de revogar convite, ação de remover membro,
 * troca de role e MFA reset administrativo.
 */

import { useEffect, useState, type FormEvent } from "react";
import { Link } from "wouter";
import AuthShell from "@/components/auth/AuthShell";
import { useAuthV2 } from "@/contexts/AuthV2Context";
import {
  createInviteV2,
  listMembersV2,
  updateMemberPlatformAccessV2,
  type ApiError,
  type MemberProfileV2,
} from "@/lib/authV2Client";

type InviteRole = "owner" | "admin" | "member" | "viewer";

const ROLE_OPTIONS: Array<{ value: InviteRole; label: string }> = [
  { value: "viewer", label: "Viewer (somente leitura)" },
  { value: "member", label: "Member (acesso operacional)" },
  { value: "admin", label: "Admin (pode convidar e gerenciar)" },
  { value: "owner", label: "Owner (controle total do tenant)" },
];

const ERROR_LABELS: Record<string, string> = {
  forbidden: "Você não tem permissão para convidar usuários neste tenant.",
  invalid_email: "E-mail inválido.",
  invalid_ttl: "O prazo do convite precisa estar entre 1 e 168 horas.",
  invalid_token: "O tenant selecionado não foi encontrado. Atualize a página e tente novamente.",
  user_already_member: "Este e-mail já é membro deste tenant.",
  tenant_member_already_exists: "Este e-mail já possui acesso a este tenant.",
  invitation_already_pending:
    "Já existe um convite pendente para este e-mail. Aguarde ou revogue antes de criar um novo.",
  rate_limited:
    "Muitos convites em pouco tempo. Aguarde alguns minutos e tente novamente.",
  invalid_role: "O perfil selecionado não é compatível com convites. Escolha Viewer, Member, Admin ou Owner.",
  validation_failed: "Confira o e-mail, o perfil e tente novamente.",
  provider_error:
    "O convite não pôde ser enviado pelo serviço de e-mail. Verifique a configuração do Resend e tente novamente.",
  internal_error: "O servidor não conseguiu concluir o convite. Tente novamente em alguns instantes.",
  invalid_session: "Sua sessão expirou. Faça login novamente para enviar o convite.",
  http_error: "Não foi possível concluir a operação. Tente novamente.",
};

export default function AdminUsuariosPage() {
  const { user } = useAuthV2();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<InviteRole>("viewer");
  const [platformAccess, setPlatformAccess] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastInvitationId, setLastInvitationId] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [members, setMembers] = useState<MemberProfileV2[]>([]);
  const [membersLoading, setMembersLoading] = useState(true);
  const [membersError, setMembersError] = useState<string | null>(null);
  const [updatingMemberId, setUpdatingMemberId] = useState<string | null>(null);

  const canManageMembers =
    user?.role === "superadmin" || user?.role === "owner" || user?.role === "admin";

  async function loadMembers() {
    if (!canManageMembers) return;
    setMembersLoading(true);
    setMembersError(null);
    try {
      setMembers(await listMembersV2());
    } catch {
      setMembersError("Não foi possível carregar os perfis deste tenant.");
    } finally {
      setMembersLoading(false);
    }
  }

  useEffect(() => {
    void loadMembers();
  }, [canManageMembers]);

  async function handlePlatformAccessChange(member: MemberProfileV2, nextValue: boolean) {
    setUpdatingMemberId(member.memberId);
    setMembersError(null);
    setMembers((current) =>
      current.map((item) =>
        item.memberId === member.memberId
          ? { ...item, platformAccess: nextValue }
          : item,
      ),
    );
    try {
      await updateMemberPlatformAccessV2(member.memberId, nextValue);
    } catch {
      setMembersError("Não foi possível atualizar a permissão. Tente novamente.");
      await loadMembers();
    } finally {
      setUpdatingMemberId(null);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLastInvitationId(null);
    if (!user?.tenantId) {
      setError("Sessão V2 sem tenantId. Faça logout e logue novamente.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await createInviteV2({
        email: email.trim().toLowerCase(),
        role,
        platformAccess,
        origin: window.location.origin,
        tenantId: user.tenantId,
      });
      setSuccess(
        `Convite enviado para ${email}. Validade: 7 dias. O usuário receberá um e-mail com o link de cadastro.`,
      );
      setLastInvitationId(res.invitationId);
      setEmail("");
      setPlatformAccess(true);
    } catch (e) {
      const err = e as ApiError;
      setError(
        ERROR_LABELS[err.code] ??
          (err.message ? `Não foi possível enviar o convite: ${err.message}` : ERROR_LABELS.http_error),
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthShell
      tagline="ADMIN · USUÁRIOS"
      title={
        <>
          Convidar pessoas para o <span className="accent">cockpit NowGo</span>
        </>
      }
      subtitle={
        user
          ? `Tenant atual: ${user.tenantSlug}. O usuário receberá um e-mail com link de validade de 7 dias.`
          : "Convidar membros para o cockpit."
      }
      footer={
        <>
          <Link href="/cockpit">Voltar ao cockpit</Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate>
        {error && <div className="ng-auth-error" role="alert">{error}</div>}
        {success && <div className="ng-auth-success" role="status">{success}</div>}
        {lastInvitationId && (
          <div
            className="ng-auth-help"
            style={{
              border: "1px solid rgba(51, 210, 255, 0.3)",
              borderRadius: "8px",
              padding: "0.75rem 1rem",
              marginBottom: "1rem",
              background: "rgba(51, 210, 255, 0.05)",
            }}
          >
            <strong style={{ color: "var(--accent-cyan, #33D2FF)" }}>
              Convite registrado:
            </strong>{" "}
            <code
              style={{
                fontSize: "0.78rem",
                wordBreak: "break-all",
                color: "rgba(255,255,255,0.78)",
              }}
            >
              ID {lastInvitationId}
            </code>
          </div>
        )}
        <label className="ng-auth-field">
          <span className="ng-auth-field-label">E-mail do convidado</span>
          <input
            type="email"
            className="ng-auth-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="pessoa@empresa.com"
            autoComplete="off"
            required
            disabled={submitting}
          />
        </label>
        <label className="ng-auth-field">
          <span className="ng-auth-field-label">Perfil</span>
          <select
            className="ng-auth-input"
            value={role}
            onChange={(e) => setRole(e.target.value as InviteRole)}
            disabled={submitting}
          >
            {ROLE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>
        <label
          className="ng-auth-field"
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "flex-start",
            gap: "0.65rem",
            cursor: submitting ? "default" : "pointer",
          }}
        >
          <input
            type="checkbox"
            checked={platformAccess}
            onChange={(e) => setPlatformAccess(e.target.checked)}
            disabled={submitting}
            style={{ marginTop: "0.2rem" }}
          />
          <span>
            <span className="ng-auth-field-label" style={{ display: "block" }}>
              Permitir acesso à Plataforma
            </span>
            <span className="ng-auth-help" style={{ display: "block", marginTop: "0.2rem" }}>
              O usuário poderá abrir a Plataforma NowGo/Xavier após aceitar o convite.
            </span>
          </span>
        </label>
        <button type="submit" className="ng-auth-submit" disabled={submitting}>
          {submitting ? "Enviando convite…" : "Enviar convite"}
        </button>
        <p className="ng-auth-help">
          O convite é válido por 7 dias. A permissão de acesso à Plataforma é
          registrada no vínculo do usuário e pode ser desativada antes de enviar.
        </p>
      </form>

      <section
        aria-labelledby="member-profiles-title"
        style={{
          marginTop: "2rem",
          paddingTop: "1.5rem",
          borderTop: "1px solid rgba(255,255,255,0.12)",
        }}
      >
        <h2
          id="member-profiles-title"
          style={{ margin: 0, fontSize: "1.05rem", color: "rgba(255,255,255,0.92)" }}
        >
          Perfis e permissões
        </h2>
        <p className="ng-auth-help" style={{ marginTop: "0.45rem" }}>
          Ajuste o acesso à Plataforma de cada usuário já vinculado ao tenant.
          O acesso ao Cockpit continua exclusivo para superadmin.
        </p>

        {membersError && <div className="ng-auth-error" role="alert">{membersError}</div>}
        {membersLoading ? (
          <p className="ng-auth-help">Carregando perfis…</p>
        ) : members.length === 0 ? (
          <p className="ng-auth-help">Nenhum perfil vinculado encontrado.</p>
        ) : (
          <div style={{ display: "grid", gap: "0.75rem" }}>
            {members.map((member) => (
              <div
                key={member.memberId}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "1rem",
                  padding: "0.9rem 1rem",
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: "10px",
                  background: "rgba(255,255,255,0.035)",
                }}
              >
                <div style={{ minWidth: 0 }}>
                  <strong style={{ display: "block", color: "rgba(255,255,255,0.92)" }}>
                    {member.name || member.email}
                  </strong>
                  <span className="ng-auth-help" style={{ display: "block", marginTop: "0.2rem" }}>
                    {member.email} · {member.role}
                  </span>
                </div>
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.45rem",
                    flexShrink: 0,
                    cursor: updatingMemberId === member.memberId ? "wait" : "pointer",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={member.platformAccess}
                    disabled={updatingMemberId === member.memberId}
                    onChange={(event) =>
                      void handlePlatformAccessChange(member, event.target.checked)
                    }
                  />
                  <span style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.82)" }}>
                    Permitir acesso à Plataforma
                  </span>
                </label>
              </div>
            ))}
          </div>
        )}
      </section>
    </AuthShell>
  );
}
