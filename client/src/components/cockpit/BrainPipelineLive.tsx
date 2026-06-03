/**
 * BrainPipelineLive.tsx
 *
 * Painel de Pipeline ligado diretamente à database NowGo Brain (Notion).
 * Exibe oportunidades reais com CRUD: criar, editar, arquivar.
 *
 * Permissões:
 *   - leitor: vê a lista; botões de mutação ficam desabilitados
 *   - operador / superadmin: pode criar, editar e arquivar
 *
 * Mutação dispara `cockpit:refresh` para outros painéis revalidarem.
 */

import { useCallback, useEffect, useMemo, useState } from "react";

const C = {
  PANEL: "rgba(2,12,20,0.96)",
  PANEL_2: "rgba(8,20,32,0.92)",
  BORDER: "#1a5c7a",
  BORDER_DIM: "rgba(0,212,255,0.18)",
  PRI: "#00d4ff",
  ACC: "#bb88ff",
  ACC2: "#00ffaa",
  WARN: "#ffcc00",
  DANGER: "#ff7799",
  TXT: "#d8f8ff",
  TXT_DIM: "#5ab8cc",
  TXT_FAINT: "#3a8a9a",
};

const PIPELINE_STAGES = [
  "Lead",
  "Qualificado",
  "Proposta",
  "Negociação",
  "Fechado-Ganho",
  "Fechado-Perdido",
] as const;
type Stage = (typeof PIPELINE_STAGES)[number];

const STAGE_COLOR: Record<Stage, string> = {
  Lead: "#5ab8cc",
  Qualificado: "#00d4ff",
  Proposta: "#bb88ff",
  Negociação: "#ffcc00",
  "Fechado-Ganho": "#00ffaa",
  "Fechado-Perdido": "#ff7799",
};

const CLASSIFICACAO_SUN = [
  "Missão Ativa",
  "Radar",
  "Pausada",
  "Descartada",
] as const;
type ClassSun = (typeof CLASSIFICACAO_SUN)[number];

const CLASS_COLOR: Record<ClassSun, string> = {
  "Missão Ativa": "#00ffaa",
  Radar: "#00d4ff",
  Pausada: "#ffcc00",
  Descartada: "#ff7799",
};

/**
 * Mapeia o estágio comercial exibido (PT) para o status EXATO da base
 * ATIVOS CRM IA no Notion (com emojis). Fonte de verdade do funil.
 */
const STAGE_TO_CRM_STATUS: Record<Stage, string> = {
  Lead: "Lead",
  Qualificado: "Qualified",
  Proposta: "Proposal 👀",
  "Negociação": "Negotiation",
  "Fechado-Ganho": "Closed 💪",
  "Fechado-Perdido": "Lost",
};

/** Oportunidade sem classificação cai em Radar por default. */
function classDefault(c: string | null | undefined): ClassSun {
  return (c && (CLASSIFICACAO_SUN as readonly string[]).includes(c)
    ? c
    : "Radar") as ClassSun;
}

interface Opp {
  id: string;
  nome: string;
  idHumano: string | null;
  estagio: Stage | null;
  score: number | null;
  valorEstimado: number | null;
  probabilidade: number | null;
  urgencia: string | null;
  proximoFollowUp: string | null;
  classificacaoSun: string | null;
}

interface Props {
  /** Papel do usuário corrente (do useAuth). */
  role: "superadmin" | "operador" | "leitor";
}

export default function BrainPipelineLive({ role }: Props) {
  const [opps, setOpps] = useState<Opp[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Opp | null>(null);
  const [creating, setCreating] = useState(false);
  const [query, setQuery] = useState("");

  const canWrite = role !== "leitor";

  const fetchOpps = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await fetch(
        "/api/brain/opportunities?mode=portfolio&limit=100",
        { credentials: "include" },
      );
      if (!r.ok) {
        const j = await r.json().catch(() => ({}));
        throw new Error(j?.error ?? `Falha ${r.status}`);
      }
      const j = await r.json();
      setOpps(Array.isArray(j.opportunities) ? j.opportunities : []);
    } catch (e: any) {
      setError(e.message ?? "Erro ao carregar.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchOpps();
    const onRefresh = () => void fetchOpps();
    window.addEventListener("cockpit:refresh", onRefresh);
    return () => window.removeEventListener("cockpit:refresh", onRefresh);
  }, [fetchOpps]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? opps.filter((o) => o.nome.toLowerCase().includes(q)) : opps;
  }, [opps, query]);

  const handleArchive = async (op: Opp) => {
    if (!canWrite) return;
    const motivo = window.prompt(
      `Arquivar "${op.nome}"?\n\nMotivo (opcional, será gravado em Notas):`,
      "",
    );
    if (motivo === null) return; // cancelado

    try {
      const url = `/api/brain/opportunities?id=${encodeURIComponent(op.id)}${
        motivo ? `&motivo=${encodeURIComponent(motivo)}` : ""
      }`;
      const r = await fetch(url, { method: "DELETE", credentials: "include" });
      if (!r.ok) {
        const j = await r.json().catch(() => ({}));
        throw new Error(j?.error ?? `Falha ${r.status}`);
      }
      window.dispatchEvent(new CustomEvent("cockpit:refresh"));
    } catch (e: any) {
      alert(`Erro ao arquivar: ${e.message}`);
    }
  };

  return (
    <section
      style={{
        background:
          "linear-gradient(180deg, rgba(8,18,30,0.85), rgba(2,8,16,0.95))",
        border: `1px solid ${C.BORDER_DIM}`,
        borderRadius: 10,
        display: "flex",
        flexDirection: "column",
        height: "100%",
        minHeight: 0,
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "10px 12px 8px",
          borderBottom: `1px solid ${C.BORDER_DIM}`,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 8,
          }}
        >
          <div
            style={{
              fontSize: 10,
              letterSpacing: 1.6,
              color: C.PRI,
              fontWeight: 700,
              textTransform: "uppercase",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: C.ACC2,
                boxShadow: `0 0 8px ${C.ACC2}`,
                animation: "pulse 1.6s ease-in-out infinite",
              }}
            />
            Brain · Live ({opps.length})
          </div>
          {canWrite && (
            <button
              onClick={() => setCreating(true)}
              style={{
                background: `${C.ACC2}22`,
                border: `1px solid ${C.ACC2}66`,
                color: C.ACC2,
                fontSize: 10,
                padding: "4px 10px",
                borderRadius: 6,
                cursor: "pointer",
                fontWeight: 700,
                letterSpacing: 1,
                textTransform: "uppercase",
              }}
            >
              + nova
            </button>
          )}
        </div>
        <input
          type="search"
          placeholder="Buscar..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{
            width: "100%",
            background: "rgba(0,20,30,0.6)",
            border: `1px solid ${C.BORDER_DIM}`,
            color: C.TXT,
            padding: "6px 10px",
            borderRadius: 6,
            fontSize: 12,
            outline: "none",
            boxSizing: "border-box",
          }}
        />
      </div>

      {/* Lista */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "8px 12px 14px",
          minHeight: 0,
        }}
      >
        {error && (
          <div
            style={{
              background: "rgba(255,119,153,0.08)",
              border: `1px solid ${C.DANGER}66`,
              color: C.DANGER,
              padding: "8px 10px",
              borderRadius: 6,
              fontSize: 11,
              marginBottom: 8,
            }}
          >
            {error}
          </div>
        )}

        {loading ? (
          <div
            style={{
              color: C.TXT_FAINT,
              textAlign: "center",
              padding: 16,
              fontSize: 11,
              letterSpacing: 1.5,
              textTransform: "uppercase",
            }}
          >
            Carregando Brain...
          </div>
        ) : filtered.length === 0 ? (
          <div
            style={{
              color: C.TXT_FAINT,
              fontSize: 11,
              padding: 12,
              fontStyle: "italic",
            }}
          >
            Nenhuma oportunidade no Brain.
          </div>
        ) : (
          filtered.map((op) => {
            const stageColor = op.estagio
              ? STAGE_COLOR[op.estagio] ?? C.TXT_DIM
              : C.TXT_DIM;
            const classColor = CLASS_COLOR[classDefault(op.classificacaoSun)];
            return (
              <div
                key={op.id}
                style={{
                  background: "rgba(8,20,32,0.72)",
                  border: `1px solid ${C.BORDER_DIM}`,
                  borderLeft: `3px solid ${classColor}`,
                  borderRadius: 6,
                  padding: "8px 10px",
                  marginBottom: 6,
                  color: C.TXT,
                  display: "grid",
                  gap: 4,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: 8,
                  }}
                >
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div
                      style={{
                        fontSize: 9,
                        letterSpacing: 1.4,
                        color: stageColor,
                        fontWeight: 700,
                        textTransform: "uppercase",
                        marginBottom: 2,
                      }}
                    >
                      {op.estagio ?? "—"}
                      {op.score !== null && (
                        <span
                          style={{
                            marginLeft: 6,
                            color: C.ACC,
                            opacity: 0.85,
                          }}
                        >
                          · {op.score}
                        </span>
                      )}
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: 500,
                        lineHeight: 1.3,
                        color: C.TXT,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {op.nome}
                    </div>
                  </div>
                  {canWrite && (
                    <div
                      style={{
                        display: "flex",
                        gap: 4,
                        flexShrink: 0,
                      }}
                    >
                      <button
                        onClick={() => setEditing(op)}
                        title="Editar"
                        style={iconBtn(C.PRI)}
                      >
                        ✎
                      </button>
                      <button
                        onClick={() => void handleArchive(op)}
                        title="Arquivar"
                        style={iconBtn(C.DANGER)}
                      >
                        🗑
                      </button>
                    </div>
                  )}
                </div>
                <div
                  style={{
                    fontSize: 10,
                    color: C.TXT_DIM,
                    opacity: 0.85,
                    display: "flex",
                    gap: 10,
                    flexWrap: "wrap",
                  }}
                >
                  {op.valorEstimado !== null && (
                    <span>
                      💰{" "}
                      {op.valorEstimado.toLocaleString("pt-BR", {
                        notation: "compact",
                        maximumFractionDigits: 1,
                      })}
                    </span>
                  )}
                  {op.probabilidade !== null && (
                    <span>{op.probabilidade}%</span>
                  )}
                  {op.proximoFollowUp && (
                    <span>📅 {op.proximoFollowUp.slice(0, 10)}</span>
                  )}
                </div>

                {/* Classificação SUN — automática (derivada do blueprint, somente leitura) */}
                <div
                  style={{
                    display: "flex",
                    gap: 6,
                    alignItems: "center",
                    flexWrap: "wrap",
                    marginTop: 2,
                    paddingTop: 6,
                    borderTop: `1px dashed ${C.BORDER_DIM}`,
                  }}
                  title="Classificação calculada automaticamente pelo Blueprint SUN a partir de status, valor, prazo e segmento. Para mudar a classe, ajuste o status do funil ao editar o ativo."
                >
                  {(() => {
                    const cls = classDefault(op.classificacaoSun);
                    const col = CLASS_COLOR[cls];
                    return (
                      <span
                        style={{
                          background: `${col}22`,
                          border: `1px solid ${col}aa`,
                          color: col,
                          fontSize: 8.5,
                          letterSpacing: 0.8,
                          padding: "3px 8px",
                          borderRadius: 20,
                          fontWeight: 700,
                          textTransform: "uppercase",
                        }}
                      >
                        {cls}
                      </span>
                    );
                  })()}
                  <span
                    style={{
                      fontSize: 8,
                      letterSpacing: 0.6,
                      color: C.TXT_FAINT,
                      textTransform: "uppercase",
                    }}
                  >
                    auto · blueprint
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modais */}
      {(editing || creating) && (
        <OppEditModal
          op={editing}
          mode={editing ? "edit" : "create"}
          onClose={() => {
            setEditing(null);
            setCreating(false);
          }}
          onSaved={() => {
            setEditing(null);
            setCreating(false);
            window.dispatchEvent(new CustomEvent("cockpit:refresh"));
          }}
        />
      )}
    </section>
  );
}

function iconBtn(color: string): React.CSSProperties {
  return {
    background: `${color}18`,
    border: `1px solid ${color}55`,
    color: color,
    width: 24,
    height: 24,
    borderRadius: 4,
    cursor: "pointer",
    fontSize: 11,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 0,
    transition: "all 140ms ease-out",
  };
}

// ---------------------------------------------------------------------------
// Modal de criação/edição
// ---------------------------------------------------------------------------

interface ModalProps {
  op: Opp | null;
  mode: "create" | "edit";
  onClose: () => void;
  onSaved: () => void;
}

function OppEditModal({ op, mode, onClose, onSaved }: ModalProps) {
  const [nome, setNome] = useState(op?.nome ?? "");
  const [estagio, setEstagio] = useState<Stage>(op?.estagio ?? "Lead");
  const [valor, setValor] = useState<string>(
    op?.valorEstimado != null ? String(op.valorEstimado) : "",
  );
  const [probabilidade, setProbabilidade] = useState<string>(
    op?.probabilidade != null ? String(op.probabilidade) : "",
  );
  const [score, setScore] = useState<string>(
    op?.score != null ? String(op.score) : "",
  );
  const [followUp, setFollowUp] = useState<string>(
    op?.proximoFollowUp ? op.proximoFollowUp.slice(0, 10) : "",
  );
  const [empresa, setEmpresa] = useState("");
  const [classSun, setClassSun] = useState<ClassSun>(
    classDefault(op?.classificacaoSun),
  );
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // ESC fecha
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    if (!nome.trim()) {
      setErr("Nome é obrigatório.");
      return;
    }
    setSubmitting(true);
    try {
      let r: Response;
      if (mode === "edit" && op) {
        // Write-back na ATIVOS CRM IA (fonte de verdade). A classe SUN NÃO
        // é enviada — é derivada pelo blueprint a cada leitura. Mudar o
        // status do funil reclassifica automaticamente.
        const payload: any = {
          source: "crm-ia",
          pageId: op.id,
          status: STAGE_TO_CRM_STATUS[estagio],
        };
        if (valor.trim()) payload.estimatedValueBrl = Number(valor);
        if (followUp.trim()) payload.expectedClose = followUp;
        r = await fetch("/api/brain/opportunities", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        });
      } else {
        // Criação segue na Pipeline (fluxo legado de cadastro).
        const payload: any = { nome: nome.trim(), estagio };
        if (valor.trim()) payload.valorEstimado = Number(valor);
        if (probabilidade.trim()) payload.probabilidade = Number(probabilidade);
        if (score.trim()) payload.score = Number(score);
        if (followUp.trim()) payload.proximoFollowUp = followUp;
        if (empresa.trim()) payload.empresa = empresa.trim();
        r = await fetch("/api/brain/opportunities", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        });
      }
      if (!r.ok) {
        const j = await r.json().catch(() => ({}));
        throw new Error(j?.error ?? `Falha ${r.status}`);
      }
      onSaved();
    } catch (e: any) {
      setErr(e.message ?? "Erro ao salvar.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,6,10,0.75)",
        backdropFilter: "blur(4px)",
        zIndex: 250,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
    >
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
        style={{
          background: C.PANEL,
          border: `1px solid ${C.BORDER}`,
          borderRadius: 12,
          padding: 24,
          width: "min(480px, 100%)",
          maxHeight: "90vh",
          overflow: "auto",
          display: "grid",
          gap: 12,
          fontFamily: "'Inter', system-ui, sans-serif",
          color: C.TXT,
        }}
      >
        <div
          style={{
            fontSize: 10,
            letterSpacing: 2.5,
            color: C.ACC,
            textTransform: "uppercase",
            fontWeight: 700,
          }}
        >
          {mode === "edit" ? "Editar oportunidade" : "Nova oportunidade"}
        </div>
        <h3
          style={{
            margin: 0,
            fontSize: 18,
            fontFamily: "'Fraunces', serif",
            fontWeight: 600,
          }}
        >
          {op?.nome ?? "Pipeline NowGo Brain"}
        </h3>

        <Field label="Nome *">
          <input
            type="text"
            required
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            style={inputStyle()}
          />
        </Field>

        <Field label="Empresa">
          <input
            type="text"
            value={empresa}
            onChange={(e) => setEmpresa(e.target.value)}
            placeholder="(opcional)"
            style={inputStyle()}
          />
        </Field>

        <Field label="Estágio (comercial)">
          <select
            value={estagio}
            onChange={(e) => setEstagio(e.target.value as Stage)}
            style={inputStyle()}
          >
            {PIPELINE_STAGES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </Field>

        {mode === "edit" && (
          <div
            style={{
              background: `${CLASS_COLOR[classSun]}14`,
              border: `1px solid ${CLASS_COLOR[classSun]}55`,
              borderRadius: 8,
              padding: "8px 10px",
              fontSize: 11,
              color: C.TXT_DIM,
              lineHeight: 1.4,
            }}
          >
            <span
              style={{
                color: CLASS_COLOR[classSun],
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: 1,
              }}
            >
              Classe SUN: {classSun}
            </span>
            <br />
            Calculada automaticamente pelo Blueprint a partir de status, valor,
            prazo e segmento. Ajuste o <strong>status</strong> para reclassificar.
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <Field label="Valor estimado (R$)">
            <input
              type="number"
              step="1000"
              min="0"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              style={inputStyle()}
            />
          </Field>
          <Field label="Probabilidade (%)">
            <input
              type="number"
              min="0"
              max="100"
              value={probabilidade}
              onChange={(e) => setProbabilidade(e.target.value)}
              style={inputStyle()}
            />
          </Field>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <Field label="Score (0-100)">
            <input
              type="number"
              min="0"
              max="100"
              value={score}
              onChange={(e) => setScore(e.target.value)}
              style={inputStyle()}
            />
          </Field>
          <Field label="Próximo Follow-up">
            <input
              type="date"
              value={followUp}
              onChange={(e) => setFollowUp(e.target.value)}
              style={inputStyle()}
            />
          </Field>
        </div>

        {err && (
          <div
            style={{
              background: "rgba(255,119,153,0.08)",
              border: `1px solid ${C.DANGER}66`,
              color: C.DANGER,
              padding: 8,
              borderRadius: 6,
              fontSize: 12,
            }}
          >
            {err}
          </div>
        )}

        <div
          style={{
            display: "flex",
            gap: 10,
            justifyContent: "flex-end",
            marginTop: 8,
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              background: "transparent",
              border: `1px solid ${C.BORDER}`,
              color: C.TXT_DIM,
              padding: "10px 18px",
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: 1.4,
              textTransform: "uppercase",
              cursor: "pointer",
            }}
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={submitting || !nome.trim()}
            style={{
              background: `${C.ACC2}22`,
              border: `1px solid ${C.ACC2}88`,
              color: C.ACC2,
              padding: "10px 22px",
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: 1.4,
              textTransform: "uppercase",
              cursor: submitting ? "wait" : "pointer",
              opacity: submitting || !nome.trim() ? 0.5 : 1,
            }}
          >
            {submitting ? "Salvando..." : mode === "edit" ? "Salvar" : "Criar"}
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label style={{ display: "grid", gap: 4 }}>
      <span
        style={{
          fontSize: 10,
          letterSpacing: 1.5,
          color: C.TXT_DIM,
          textTransform: "uppercase",
          fontWeight: 600,
        }}
      >
        {label}
      </span>
      {children}
    </label>
  );
}

function inputStyle(): React.CSSProperties {
  return {
    background: "rgba(0,16,28,0.6)",
    border: `1px solid ${C.BORDER}55`,
    color: C.TXT,
    padding: "10px 12px",
    borderRadius: 8,
    fontSize: 13,
    fontFamily: "'Inter', system-ui, sans-serif",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
  };
}
