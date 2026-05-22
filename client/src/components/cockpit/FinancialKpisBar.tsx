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
  const [kpis, setKpis] = useState<FinancialKpis | null>(null);
  const [loading, setLoading] = useState(true);

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
        />
      </div>

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
}: {
  metaAnualBrl: number;
  pctRealizado: number;
  pctPerspectiva: number;
  dealsParaMeta: number;
  ticketMedio: number;
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
        <div style={{ fontSize: 10, color: C.TXT_FAINT, letterSpacing: 1 }}>
          {dealsParaMeta} deals × {formatBrlCompact(ticketMedio)}
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
