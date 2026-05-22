export interface AttentionItem {
  tipo: "bloqueio" | "follow-up-atrasado" | "deadline";
  titulo: string;
  detalhe: string;
}

interface Props {
  items: AttentionItem[];
  onTratar: (item: AttentionItem) => void;
}

const TIPO_LABEL: Record<AttentionItem["tipo"], { label: string; color: string }> = {
  bloqueio: { label: "BLOQUEIO", color: "#ff3355" },
  "follow-up-atrasado": { label: "FOLLOW-UP ATRASADO", color: "#ffcc00" },
  deadline: { label: "DEADLINE", color: "#ff6b00" },
};

export default function AttentionPanel({ items, onTratar }: Props) {
  if (items.length === 0) {
    return (
      <div
        style={{
          background: "#010d14",
          border: "1px solid #0d3347",
          borderRadius: 8,
          padding: 16,
          color: "#5ab8cc",
          fontSize: 13,
          fontStyle: "italic",
        }}
      >
        Sem pontos de atenção neste momento. Operação fluindo dentro dos parâmetros esperados.
      </div>
    );
  }

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
        gap: 10,
      }}
    >
      {items.map((it, i) => {
        const tag = TIPO_LABEL[it.tipo];
        return (
          <div
            key={`${it.tipo}-${i}`}
            style={{
              background: "#010d14",
              border: `1px solid ${tag.color}33`,
              borderLeft: `3px solid ${tag.color}`,
              borderRadius: 6,
              padding: "12px 14px",
              transition: "all 200ms cubic-bezier(0.23, 1, 0.32, 1)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = `${tag.color}88`;
              e.currentTarget.style.background = "#011520";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = `${tag.color}33`;
              e.currentTarget.style.background = "#010d14";
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
              <span style={{ fontSize: 9, color: tag.color, letterSpacing: 1, fontWeight: 700 }}>{tag.label}</span>
            </div>
            <div style={{ fontSize: 13, color: "#d8f8ff", fontWeight: 500, marginBottom: 4, lineHeight: 1.3 }}>{it.titulo}</div>
            <div style={{ fontSize: 11, color: "#5ab8cc", marginBottom: 10, lineHeight: 1.4 }}>{it.detalhe}</div>
            <button
              onClick={() => onTratar(it)}
              style={{
                width: "100%",
                background: "transparent",
                border: `1px solid ${tag.color}66`,
                color: tag.color,
                padding: "6px 10px",
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: 0.5,
                cursor: "pointer",
                borderRadius: 4,
                transition: "all 160ms cubic-bezier(0.23, 1, 0.32, 1)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = `${tag.color}1a`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
              }}
              onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.97)")}
              onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
            >
              TRATAR AGORA
            </button>
          </div>
        );
      })}
    </div>
  );
}
