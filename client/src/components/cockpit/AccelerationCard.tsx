export interface Acceleration {
  titulo: string;
  proposicao: string;
  fazSentido: "sim" | "talvez" | "validar";
}

interface Props {
  items: Acceleration[];
  onRegistrarMissao: (a: Acceleration) => void;
  onGuardarParaDepois: (a: Acceleration) => void;
}

const SENTIDO_COLOR: Record<Acceleration["fazSentido"], string> = {
  sim: "#00ff88",
  talvez: "#ffcc00",
  validar: "#00d4ff",
};

export default function AccelerationCard({ items, onRegistrarMissao, onGuardarParaDepois }: Props) {
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
        Sem sugestões de aceleração agora. O sistema reavalia padrões a cada três horas.
      </div>
    );
  }

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
        gap: 12,
      }}
    >
      {items.map((a, i) => {
        const accent = SENTIDO_COLOR[a.fazSentido];
        return (
          <div
            key={`accel-${i}`}
            style={{
              background: "linear-gradient(135deg, #010f18 0%, #00060a 100%)",
              border: `1px solid ${accent}33`,
              borderRadius: 8,
              padding: "16px 18px",
              position: "relative",
              transition: "all 200ms cubic-bezier(0.23, 1, 0.32, 1)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = `${accent}88`;
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = `0 8px 24px -8px ${accent}33`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = `${accent}33`;
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: accent,
                  boxShadow: `0 0 6px ${accent}`,
                }}
              />
              <span style={{ fontSize: 10, color: accent, letterSpacing: 1.5, fontWeight: 700 }}>
                ACELERAR / ESCALA
              </span>
            </div>

            <h4 style={{ fontSize: 14, color: "#d8f8ff", fontWeight: 600, margin: 0, marginBottom: 8, lineHeight: 1.3 }}>
              {a.titulo}
            </h4>

            <p style={{ fontSize: 12, color: "#8ffcff", lineHeight: 1.5, margin: 0, marginBottom: 16 }}>{a.proposicao}</p>

            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={() => onRegistrarMissao(a)}
                style={{
                  flex: 1,
                  background: "transparent",
                  border: `1px solid ${accent}`,
                  color: accent,
                  padding: "8px 10px",
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: 0.5,
                  cursor: "pointer",
                  borderRadius: 4,
                  transition: "all 160ms cubic-bezier(0.23, 1, 0.32, 1)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = `${accent}1a`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                }}
                onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.97)")}
                onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
              >
                REGISTRAR COMO MISSÃO
              </button>
              <button
                onClick={() => onGuardarParaDepois(a)}
                style={{
                  flex: 1,
                  background: "transparent",
                  border: "1px solid #0d3347",
                  color: "#5ab8cc",
                  padding: "8px 10px",
                  fontSize: 11,
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
                NÃO AGORA
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
