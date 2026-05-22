import type { CSSProperties } from "react";

export interface Priority {
  id: string;
  nome: string;
  idHumano: string | null;
  estagio: string | null;
  score: number | null;
  valorEstimado: number | null;
  proximoFollowUp: string | null;
  status: "verde" | "amarelo" | "vermelho";
  motivo: string;
}

interface Props {
  priority: Priority;
  index: number;
  onRegistrarMovimento: (p: Priority) => void;
  onAbrirDealRoom: (p: Priority) => void;
}

const STATUS_COLOR: Record<Priority["status"], { dot: string; border: string; label: string }> = {
  verde: { dot: "#00ff88", border: "#00aa55", label: "EM MARCHA" },
  amarelo: { dot: "#ffcc00", border: "#ccaa00", label: "ATENÇÃO" },
  vermelho: { dot: "#ff3355", border: "#aa1133", label: "AÇÃO URGENTE" },
};

function formatCurrency(v: number | null): string {
  if (v == null) return "—";
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(v);
}

export default function PriorityCard({ priority, index, onRegistrarMovimento, onAbrirDealRoom }: Props) {
  const c = STATUS_COLOR[priority.status];

  const cardStyle: CSSProperties = {
    background: "linear-gradient(135deg, #010d14 0%, #00060a 100%)",
    border: `1px solid ${c.border}`,
    borderRadius: "8px",
    padding: "20px 22px",
    position: "relative",
    overflow: "hidden",
    transition: "transform 200ms cubic-bezier(0.23, 1, 0.32, 1), box-shadow 200ms cubic-bezier(0.23, 1, 0.32, 1)",
  };

  return (
    <div
      style={cardStyle}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = `0 8px 24px -8px ${c.dot}33`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      {/* Top accent line */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "2px",
          background: `linear-gradient(90deg, transparent 0%, ${c.dot} 50%, transparent 100%)`,
        }}
      />

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: c.dot,
              boxShadow: `0 0 8px ${c.dot}`,
            }}
          />
          <span style={{ fontSize: 11, letterSpacing: 1.5, color: c.dot, fontWeight: 600 }}>{c.label}</span>
        </div>
        <span style={{ fontSize: 11, color: "#3a8a9a", letterSpacing: 1 }}>P{index + 1}</span>
      </div>

      <h3
        style={{
          fontSize: 16,
          color: "#d8f8ff",
          fontWeight: 600,
          margin: 0,
          marginBottom: 6,
          lineHeight: 1.3,
        }}
      >
        {priority.nome}
      </h3>

      {priority.idHumano && (
        <div style={{ fontSize: 10, color: "#5ab8cc", letterSpacing: 0.5, marginBottom: 12 }}>
          {priority.idHumano}
        </div>
      )}

      <div style={{ fontSize: 13, color: "#8ffcff", marginBottom: 14, lineHeight: 1.4 }}>{priority.motivo}</div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 8,
          marginBottom: 16,
          padding: "10px 12px",
          background: "#011520",
          borderRadius: 6,
          border: "1px solid #0d3347",
        }}
      >
        <Metric label="Score" value={priority.score?.toString() ?? "—"} color="#00d4ff" />
        <Metric label="Estágio" value={priority.estagio ?? "—"} color="#8ffcff" small />
        <Metric label="Valor" value={formatCurrency(priority.valorEstimado)} color="#00ff88" small />
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <button
          onClick={() => onRegistrarMovimento(priority)}
          style={{
            flex: 1,
            background: "#001f2e",
            border: "1px solid #007a99",
            color: "#00d4ff",
            padding: "10px 12px",
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: 0.5,
            cursor: "pointer",
            borderRadius: 4,
            transition: "all 160ms cubic-bezier(0.23, 1, 0.32, 1)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#00d4ff";
            e.currentTarget.style.color = "#000d14";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "#001f2e";
            e.currentTarget.style.color = "#00d4ff";
          }}
          onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.97)")}
          onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          REGISTRAR MOVIMENTO
        </button>
        <button
          onClick={() => onAbrirDealRoom(priority)}
          style={{
            flex: 1,
            background: "transparent",
            border: "1px solid #0d3347",
            color: "#5ab8cc",
            padding: "10px 12px",
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: 0.5,
            cursor: "pointer",
            borderRadius: 4,
            transition: "all 160ms cubic-bezier(0.23, 1, 0.32, 1)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "#5ab8cc";
            e.currentTarget.style.color = "#d8f8ff";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "#0d3347";
            e.currentTarget.style.color = "#5ab8cc";
          }}
          onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.97)")}
          onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          ABRIR DEAL ROOM
        </button>
      </div>
    </div>
  );
}

function Metric({ label, value, color, small }: { label: string; value: string; color: string; small?: boolean }) {
  return (
    <div>
      <div style={{ fontSize: 9, color: "#3a8a9a", letterSpacing: 1, marginBottom: 4 }}>{label.toUpperCase()}</div>
      <div style={{ fontSize: small ? 11 : 18, color, fontWeight: small ? 500 : 700, lineHeight: 1.1 }}>{value}</div>
    </div>
  );
}
