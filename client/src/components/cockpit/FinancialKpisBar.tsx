/**
 * client/src/components/cockpit/FinancialKpisBar.tsx
 *
 * Faixa horizontal de KPIs financeiros (Revenue Cockpit) — fica entre o
 * SunMissionsBar e o grid principal do Cockpit.
 *
 * Indicadores:
 *  - Volume em pipeline aberto (R$)
 *  - Realizado YTD (R$)
 *  - Perspectiva ponderada (R$, forecast end-of-year)
 *  - Meta 2026 (R$ 100MM) com barra de progresso e gauge
 *  - Deals para meta (com base no ticket médio)
 *  - Contagens: novas oportunidades, propostas em curso, propostas fechadas, reuniões agendadas
 */

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";

const C = {
  PANEL: "rgba(2,12,20,0.7)",
  BORDER: "#1a5c7a",
  BORDER_DIM: "#0d3347",
  PRI: "#00d4ff",
  ACC: "#bb88ff",
  ACC2: "#00ffaa",
  WARN: "#ffcc00",
  TXT: "#d8f8ff",
  TXT_DIM: "#5ab8cc",
  TXT_FAINT: "#3a8a9a",
};

interface MissionKpi {
  pipelineAbertoBrl: number;
  realizadoYtdBrl: number;
  perspectivaBrl: number;
  contagem: number;
}

interface FinancialKpis {
  generatedAt: string;
  ano: number;
  metaAnualBrl: number;
  realizadoYtdBrl: number;
  pipelineAbertoBrl: number;
  perspectivaBrl: number;
  mrrTotalBrl: number;
  arrTotalBrl: number;
  dealsComRecorrencia: number;
  pctMetaAtingida: number;
  pctMetaPerspectiva: number;
  faltaParaMetaBrl: number;
  dealsParaMeta: number;
  contagens: {
    novasOportunidades: number;
    propostas: number;
    negociacoes: number;
    fechadasYtd: number;
    perdidasYtd: number;
    totalAtivas: number;
  };
  ticketMedioObservadoBrl: number | null;
  ticketMedioConsideradoBrl: number;
  porMissao: { 1: MissionKpi; 2: MissionKpi; 3: MissionKpi };
}

function formatBrlCompact(v: number): string {
  if (!isFinite(v)) return "—";
  if (v >= 1_000_000) {
    return `R$ ${(v / 1_000_000).toLocaleString("pt-BR", {
      minimumFractionDigits: 1,
      maximumFractionDigits: 2,
    })}MM`;
  }
  if (v >= 1_000) {
    return `R$ ${(v / 1_000).toLocaleString("pt-BR", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 1,
    })}K`;
  }
  return `R$ ${v.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}`;
}

function pctColor(pct: number): string {
  if (pct >= 80) return C.ACC2;
  if (pct >= 40) return C.PRI;
  if (pct >= 15) return C.WARN;
  return "#ff7799";
}

export default function FinancialKpisBar() {
  const auth = useAuth();
  const isSuperadmin = auth.user?.role === "superadmin";
  const [kpis, setKpis] = useState<FinancialKpis | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<
    null | "META_2026_BRL" | "TICKET_MEDIO_BRL" | "REALIZADO_YTD_OVERRIDE_BRL"
  >(null);

  const refresh = useCallback(async () => {
    try {
      const r = await fetch("/api/financial/kpis", { cache: "no-store" });
      if (!r.ok) return;
      const j = (await r.json()) as { kpis: FinancialKpis };
      setKpis(j.kpis);
    } catch {
      // mantém estado anterior
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
    const onMutate = () => void refresh();
    window.addEventListener("cockpit:refresh", onMutate);
    return () => window.removeEventListener("cockpit:refresh", onMutate);
  }, [refresh]);

  if (loading || !kpis) {
    return (
      <div
        style={{
          padding: 14,
          color: C.TXT_FAINT,
          fontSize: 11,
          letterSpacing: 2,
          textAlign: "center",
          textTransform: "uppercase",
        }}
      >
        carregando indicadores financeiros...
      </div>
    );
  }

  const pctMeta = Math.min(100, Math.max(0, kpis.pctMetaAtingida));
  const pctPersp = Math.min(100, Math.max(0, kpis.pctMetaPerspectiva));

  return (
    <div
      style={{
        display: "grid",
        gap: 14,
      }}
    >
      {/* Linha 1: Pipeline | Fechado | Perspectiva | Meta + barra */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 12,
        }}
      >
        <KpiCard
          label="Pipeline Aberto"
          value={formatBrlCompact(kpis.pipelineAbertoBrl)}
          accent={C.PRI}
          sub={`${kpis.contagens.totalAtivas} oportunidades ativas`}
        />
        <KpiCard
          label="Realizado YTD 2026"
          value={formatBrlCompact(kpis.realizadoYtdBrl)}
          accent={C.ACC2}
          sub={`${kpis.contagens.fechadasYtd} contratos fechados`}
        />
        <KpiCard
          label="Perspectiva Ponderada"
          value={formatBrlCompact(kpis.perspectivaBrl)}
          accent={C.ACC}
          sub={`forecast ${kpis.ano}`}
        />
        <MetaCard
          metaAnualBrl={kpis.metaAnualBrl}
          pctRealizado={pctMeta}
          pctPerspectiva={pctPersp}
          dealsParaMeta={kpis.dealsParaMeta}
          ticketMedio={kpis.ticketMedioConsideradoBrl}
          editable={isSuperadmin}
          onEdit={() => setEditing("META_2026_BRL")}
        />
      </div>

      {editing && (
        <ConfigEditorModal
          configKey={editing}
          currentMeta={kpis.metaAnualBrl}
          currentTicket={kpis.ticketMedioConsideradoBrl}
          currentRealizado={kpis.realizadoYtdBrl}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            void refresh();
            window.dispatchEvent(new CustomEvent("cockpit:refresh"));
          }}
        />
      )}

      {/* Linha 2: KPIs operacionais + por missão */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(4, minmax(120px, 1fr)) repeat(3, minmax(150px, 1fr))",
          gap: 10,
        }}
      >
        <CountCard
          label="Novas Oportunidades"
          value={kpis.contagens.novasOportunidades}
          accent={C.PRI}
          hint="(mês corrente)"
        />
        <CountCard
          label="Reuniões Agendadas"
          value={kpis.contagens.negociacoes}
          accent={C.PRI}
          hint="(em negociação)"
        />
        <CountCard
          label="Propostas em Curso"
          value={kpis.contagens.propostas}
          accent={C.WARN}
        />
        <CountCard
          label="Fechadas YTD"
          value={kpis.contagens.fechadasYtd}
          accent={C.ACC2}
        />

        <MissionMicro id={1} kpi={kpis.porMissao[1]} color="#00d4ff" />
        <MissionMicro id={2} kpi={kpis.porMissao[2]} color="#00ffaa" />
        <MissionMicro id={3} kpi={kpis.porMissao[3]} color="#bb88ff" />
      </div>

      {/* Linha 3: Receita Recorrente (MRR / ARR) */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 12,
        }}
      >
        <KpiCard
          label="MRR — Receita Recorrente Mensal"
          value={formatBrlCompact(kpis.mrrTotalBrl)}
          accent="#ff88dd"
          sub={`${kpis.dealsComRecorrencia} deals com recorrência`}
        />
        <KpiCard
          label="ARR — Receita Recorrente Anual"
          value={formatBrlCompact(kpis.arrTotalBrl)}
          accent="#ff88dd"
          sub="MRR × 12 (forecast 12 meses)"
        />
        <KpiCard
          label="Recorrência vs Meta"
          value={
            kpis.metaAnualBrl > 0
              ? `${((kpis.arrTotalBrl / kpis.metaAnualBrl) * 100).toFixed(1).replace(".", ",")}%`
              : "—"
          }
          accent={C.ACC}
          sub={`do ARR sobre a meta ${kpis.ano}`}
        />
      </div>
    </div>
  );
}

function KpiCard({
  label,
  value,
  accent,
  sub,
}: {
  label: string;
  value: string;
  accent: string;
  sub?: string;
}) {
  return (
    <div
      style={{
        padding: "14px 16px",
        background: C.PANEL,
        border: `1px solid ${C.BORDER_DIM}`,
        borderRadius: 10,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        aria-hidden
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: 3,
          background: accent,
          boxShadow: `0 0 12px ${accent}`,
        }}
      />
      <div
        style={{
          fontSize: 10,
          letterSpacing: 2,
          color: C.TXT_FAINT,
          textTransform: "uppercase",
          marginBottom: 6,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 24,
          color: accent,
          fontWeight: 700,
          letterSpacing: -0.5,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {value}
      </div>
      {sub && (
        <div
          style={{
            fontSize: 10,
            color: C.TXT_FAINT,
            marginTop: 4,
            letterSpacing: 0.5,
          }}
        >
          {sub}
        </div>
      )}
    </div>
  );
}

function MetaCard({
  metaAnualBrl,
  pctRealizado,
  pctPerspectiva,
  dealsParaMeta,
  ticketMedio,
  editable,
  onEdit,
}: {
  metaAnualBrl: number;
  pctRealizado: number;
  pctPerspectiva: number;
  dealsParaMeta: number;
  ticketMedio: number;
  editable?: boolean;
  onEdit?: () => void;
}) {
  const colorRealizado = pctColor(pctRealizado);
  const colorPersp = pctColor(pctPerspectiva);

  return (
    <div
      style={{
        padding: "14px 16px",
        background:
          "linear-gradient(135deg, rgba(0,40,60,0.6) 0%, rgba(40,20,70,0.5) 100%)",
        border: `1px solid ${C.BORDER}`,
        borderRadius: 10,
        position: "relative",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 6,
        }}
      >
        <div
          style={{
            fontSize: 10,
            letterSpacing: 2,
            color: C.TXT_FAINT,
            textTransform: "uppercase",
          }}
        >
          Meta 2026
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontSize: 10,
            color: C.TXT_FAINT,
            letterSpacing: 1,
          }}
        >
          <span>
            {dealsParaMeta} deals × {formatBrlCompact(ticketMedio)}
          </span>
          {editable && (
            <button
              onClick={onEdit}
              title="Editar meta, ticket médio ou realizado YTD"
              style={{
                background: "rgba(187,136,255,0.12)",
                border: `1px solid ${C.ACC}55`,
                color: C.ACC,
                fontSize: 10,
                padding: "3px 7px",
                borderRadius: 5,
                cursor: "pointer",
                letterSpacing: 1,
                fontWeight: 700,
                textTransform: "uppercase",
                transition: "all 160ms cubic-bezier(0.23,1,0.32,1)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(187,136,255,0.22)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(187,136,255,0.12)";
              }}
            >
              ✎ Editar
            </button>
          )}
        </div>
      </div>

      <div
        style={{
          fontSize: 22,
          color: C.TXT,
          fontWeight: 700,
          letterSpacing: -0.5,
          fontVariantNumeric: "tabular-nums",
          marginBottom: 8,
        }}
      >
        {formatBrlCompact(metaAnualBrl)}
      </div>

      {/* Barra dupla: realizado (sólido) + perspectiva (translúcido) */}
      <div
        style={{
          width: "100%",
          height: 8,
          background: "rgba(0,12,20,0.6)",
          borderRadius: 999,
          overflow: "hidden",
          position: "relative",
          border: `1px solid ${C.BORDER_DIM}`,
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: `${pctPerspectiva}%`,
            background: `${colorPersp}55`,
            transition: "width 600ms cubic-bezier(0.23, 1, 0.32, 1)",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: `${pctRealizado}%`,
            background: colorRealizado,
            boxShadow: `0 0 12px ${colorRealizado}aa`,
            transition: "width 600ms cubic-bezier(0.23, 1, 0.32, 1)",
          }}
        />
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: 6,
          fontSize: 10,
          color: C.TXT_DIM,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        <span style={{ color: colorRealizado }}>
          {pctRealizado.toFixed(1).replace(".", ",")}% atingido
        </span>
        <span style={{ color: colorPersp }}>
          {pctPerspectiva.toFixed(1).replace(".", ",")}% projetado
        </span>
      </div>
    </div>
  );
}

function CountCard({
  label,
  value,
  accent,
  hint,
}: {
  label: string;
  value: number;
  accent: string;
  hint?: string;
}) {
  return (
    <div
      style={{
        padding: "10px 14px",
        background: C.PANEL,
        border: `1px solid ${C.BORDER_DIM}`,
        borderRadius: 10,
        textAlign: "center",
      }}
    >
      <div
        style={{
          fontSize: 9,
          letterSpacing: 1.5,
          color: C.TXT_FAINT,
          textTransform: "uppercase",
          marginBottom: 4,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 26,
          color: accent,
          fontWeight: 700,
          fontVariantNumeric: "tabular-nums",
          letterSpacing: -1,
        }}
      >
        {value}
      </div>
      {hint && (
        <div
          style={{
            fontSize: 9,
            color: C.TXT_FAINT,
            letterSpacing: 0.5,
            marginTop: 2,
          }}
        >
          {hint}
        </div>
      )}
    </div>
  );
}

function MissionMicro({
  id,
  kpi,
  color,
}: {
  id: number;
  kpi: MissionKpi;
  color: string;
}) {
  return (
    <div
      style={{
        padding: "10px 12px",
        background: C.PANEL,
        border: `1px solid ${color}40`,
        borderRadius: 10,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        aria-hidden
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: 3,
          background: color,
          boxShadow: `0 0 8px ${color}`,
        }}
      />
      <div
        style={{
          fontSize: 9,
          letterSpacing: 1.5,
          color: color,
          textTransform: "uppercase",
          fontWeight: 700,
          marginBottom: 4,
        }}
      >
        Missão {id}
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 4,
          fontSize: 11,
          color: C.TXT_DIM,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        <div>
          <div style={{ fontSize: 8, color: C.TXT_FAINT }}>PIPE</div>
          <div style={{ color: C.TXT, fontWeight: 600 }}>
            {formatBrlCompact(kpi.pipelineAbertoBrl)}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 8, color: C.TXT_FAINT }}>FECHADO</div>
          <div style={{ color: C.TXT, fontWeight: 600 }}>
            {formatBrlCompact(kpi.realizadoYtdBrl)}
          </div>
        </div>
      </div>
    </div>
  );
}


// ===========================================================================
// ConfigEditorModal — superadmin edita Meta/Ticket/Realizado override
// ===========================================================================

function ConfigEditorModal({
  configKey: initialKey,
  currentMeta,
  currentTicket,
  currentRealizado,
  onClose,
  onSaved,
}: {
  configKey: "META_2026_BRL" | "TICKET_MEDIO_BRL" | "REALIZADO_YTD_OVERRIDE_BRL";
  currentMeta: number;
  currentTicket: number;
  currentRealizado: number;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [activeKey, setActiveKey] = useState<
    "META_2026_BRL" | "TICKET_MEDIO_BRL" | "REALIZADO_YTD_OVERRIDE_BRL"
  >(initialKey);
  const initialFor = (
    k: "META_2026_BRL" | "TICKET_MEDIO_BRL" | "REALIZADO_YTD_OVERRIDE_BRL",
  ) =>
    k === "META_2026_BRL"
      ? currentMeta
      : k === "TICKET_MEDIO_BRL"
        ? currentTicket
        : currentRealizado;

  const [valueStr, setValueStr] = useState(() =>
    String(initialFor(initialKey)),
  );
  const [notas, setNotas] = useState("");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    setValueStr(String(initialFor(activeKey)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeKey]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const onSave = async () => {
    setErr(null);
    const v = parseFloat(valueStr.replace(/\./g, "").replace(",", "."));
    if (!Number.isFinite(v) || v < 0) {
      setErr("Valor inválido. Informe um número positivo (ex.: 25000000).");
      return;
    }
    setSaving(true);
    try {
      const r = await fetch("/api/financial/configs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: activeKey,
          value: v,
          notas: notas.trim() || undefined,
        }),
      });
      const j = await r.json();
      if (!r.ok) {
        setErr(j.error || "Falha ao salvar.");
        setSaving(false);
        return;
      }
      onSaved();
    } catch (e) {
      setErr((e as Error).message);
      setSaving(false);
    }
  };

  const labels: Record<typeof activeKey, { title: string; hint: string }> = {
    META_2026_BRL: {
      title: "Meta de Faturamento 2026",
      hint: "Valor total a atingir até 31/dez/2026 (em R$).",
    },
    TICKET_MEDIO_BRL: {
      title: "Ticket Médio Considerado",
      hint: "Usado no cálculo de 'deals para meta'. Ex.: 11000000 = R$ 11MM.",
    },
    REALIZADO_YTD_OVERRIDE_BRL: {
      title: "Realizado YTD (Override Manual)",
      hint: "Sobrescreve o cálculo automático do Brain. Use 0 para desativar override.",
    },
  };
  const cfg = labels[activeKey];

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,8,16,0.78)",
        backdropFilter: "blur(6px)",
        zIndex: 9000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 480,
          background: "linear-gradient(135deg, #0a1422 0%, #0d1a2e 100%)",
          border: `1px solid ${C.BORDER}`,
          borderRadius: 12,
          padding: 24,
          color: C.TXT,
          boxShadow: "0 20px 60px rgba(0,212,255,0.2)",
        }}
      >
        {/* Tabs de chave */}
        <div
          style={{
            display: "flex",
            gap: 4,
            marginBottom: 16,
            padding: 3,
            background: "rgba(0,12,20,0.6)",
            borderRadius: 8,
            border: `1px solid ${C.BORDER_DIM}`,
          }}
        >
          {(
            [
              "META_2026_BRL",
              "TICKET_MEDIO_BRL",
              "REALIZADO_YTD_OVERRIDE_BRL",
            ] as const
          ).map((k) => (
            <button
              key={k}
              onClick={() => setActiveKey(k)}
              style={{
                flex: 1,
                background: activeKey === k ? `${C.ACC}1a` : "transparent",
                border:
                  activeKey === k
                    ? `1px solid ${C.ACC}55`
                    : "1px solid transparent",
                color: activeKey === k ? C.ACC : C.TXT_DIM,
                fontSize: 9,
                letterSpacing: 1.2,
                padding: "7px 6px",
                borderRadius: 6,
                cursor: "pointer",
                fontWeight: 700,
                textTransform: "uppercase",
              }}
            >
              {k === "META_2026_BRL"
                ? "Meta"
                : k === "TICKET_MEDIO_BRL"
                  ? "Ticket"
                  : "Realizado"}
            </button>
          ))}
        </div>

        <div
          style={{
            fontSize: 16,
            fontWeight: 700,
            letterSpacing: -0.3,
            marginBottom: 4,
          }}
        >
          {cfg.title}
        </div>
        <div
          style={{
            fontSize: 11,
            color: C.TXT_DIM,
            marginBottom: 16,
            lineHeight: 1.5,
          }}
        >
          {cfg.hint}
        </div>

        <label
          style={{
            display: "block",
            fontSize: 10,
            letterSpacing: 1.5,
            color: C.TXT_FAINT,
            textTransform: "uppercase",
            marginBottom: 6,
          }}
        >
          Novo valor (R$)
        </label>
        <input
          type="text"
          inputMode="decimal"
          value={valueStr}
          onChange={(e) => setValueStr(e.target.value)}
          placeholder="ex.: 25000000"
          style={{
            width: "100%",
            background: "rgba(0,8,14,0.7)",
            border: `1px solid ${C.BORDER}`,
            borderRadius: 7,
            padding: "10px 12px",
            color: C.TXT,
            fontSize: 18,
            fontVariantNumeric: "tabular-nums",
            fontWeight: 600,
            letterSpacing: 0.5,
            outline: "none",
            marginBottom: 14,
          }}
        />

        <label
          style={{
            display: "block",
            fontSize: 10,
            letterSpacing: 1.5,
            color: C.TXT_FAINT,
            textTransform: "uppercase",
            marginBottom: 6,
          }}
        >
          Notas (opcional)
        </label>
        <input
          type="text"
          value={notas}
          onChange={(e) => setNotas(e.target.value)}
          placeholder="ex.: revisão Q3 após case GDF"
          style={{
            width: "100%",
            background: "rgba(0,8,14,0.7)",
            border: `1px solid ${C.BORDER}`,
            borderRadius: 7,
            padding: "8px 10px",
            color: C.TXT,
            fontSize: 12,
            outline: "none",
            marginBottom: 16,
          }}
        />

        {err && (
          <div
            style={{
              fontSize: 11,
              color: "#ff7799",
              marginBottom: 12,
              padding: 8,
              background: "rgba(255,80,120,0.08)",
              borderRadius: 5,
              border: "1px solid rgba(255,80,120,0.25)",
            }}
          >
            {err}
          </div>
        )}

        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button
            onClick={onClose}
            disabled={saving}
            style={{
              background: "transparent",
              border: `1px solid ${C.BORDER_DIM}`,
              color: C.TXT_DIM,
              padding: "9px 16px",
              borderRadius: 6,
              fontSize: 11,
              letterSpacing: 1.5,
              textTransform: "uppercase",
              fontWeight: 700,
              cursor: saving ? "not-allowed" : "pointer",
            }}
          >
            Cancelar
          </button>
          <button
            onClick={onSave}
            disabled={saving}
            style={{
              background: `${C.ACC2}22`,
              border: `1px solid ${C.ACC2}`,
              color: C.ACC2,
              padding: "9px 18px",
              borderRadius: 6,
              fontSize: 11,
              letterSpacing: 1.5,
              textTransform: "uppercase",
              fontWeight: 700,
              cursor: saving ? "not-allowed" : "pointer",
              boxShadow: `0 0 12px ${C.ACC2}33`,
            }}
          >
            {saving ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </div>
    </div>
  );
}
