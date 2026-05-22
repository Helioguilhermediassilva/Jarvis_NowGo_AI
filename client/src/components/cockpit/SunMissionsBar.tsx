import type { SunMission } from "@/lib/sunTypes";

interface Props {
  missions: SunMission[];
  onAsk?: (mission: SunMission) => void;
}

const MISSION_ACCENTS: Record<1 | 2 | 3, { ring: string; chip: string; tint: string }> = {
  1: {
    ring: "rgba(0, 212, 255, 0.7)",
    chip: "#00d4ff",
    tint: "linear-gradient(135deg, rgba(0,80,120,0.35) 0%, rgba(0,30,60,0.0) 80%)",
  },
  2: {
    ring: "rgba(0, 255, 170, 0.7)",
    chip: "#00ffaa",
    tint: "linear-gradient(135deg, rgba(0,90,70,0.32) 0%, rgba(0,30,40,0.0) 80%)",
  },
  3: {
    ring: "rgba(170, 100, 255, 0.7)",
    chip: "#bb88ff",
    tint: "linear-gradient(135deg, rgba(50,30,90,0.32) 0%, rgba(20,10,40,0.0) 80%)",
  },
};

/**
 * Faixa superior do cockpit — 3 Missões Ativas do SUN com critérios visuais.
 * Cada card pulsa sutilmente no glow lateral (cor própria por missão).
 */
export default function SunMissionsBar({ missions, onAsk }: Props) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: 14,
      }}
    >
      {missions.map((m) => {
        const accent = MISSION_ACCENTS[m.id];
        return (
          <article
            key={m.id}
            style={{
              position: "relative",
              borderRadius: 12,
              padding: "16px 18px 14px",
              background:
                "linear-gradient(180deg, rgba(8,18,30,0.85) 0%, rgba(2,8,16,0.95) 100%)",
              border: `1px solid ${accent.ring}`,
              boxShadow: `0 0 24px -6px ${accent.ring}, inset 0 0 0 1px rgba(255,255,255,0.02)`,
              overflow: "hidden",
              minHeight: 220,
            }}
          >
            {/* Glow gradiente lateral */}
            <div
              aria-hidden
              style={{
                position: "absolute",
                inset: 0,
                pointerEvents: "none",
                background: accent.tint,
              }}
            />
            <div style={{ position: "relative" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 8,
                }}
              >
                <span
                  style={{
                    fontSize: 10,
                    letterSpacing: 2,
                    color: accent.chip,
                    fontWeight: 700,
                    textTransform: "uppercase",
                  }}
                >
                  Missão Ativa {m.id}
                </span>
                <span
                  style={{
                    fontSize: 9,
                    letterSpacing: 1,
                    color: "#5ab8cc",
                    background: "rgba(0,40,60,0.6)",
                    padding: "2px 8px",
                    borderRadius: 999,
                    border: "1px solid rgba(0,212,255,0.25)",
                  }}
                >
                  SUN · v1.0
                </span>
              </div>
              <h3
                style={{
                  margin: 0,
                  marginBottom: 10,
                  fontSize: 15,
                  fontWeight: 600,
                  color: "#d8f8ff",
                  letterSpacing: 0.2,
                  lineHeight: 1.25,
                }}
              >
                {m.nome}
              </h3>
              <div
                style={{
                  fontSize: 11,
                  color: "#8ffcff",
                  lineHeight: 1.5,
                  marginBottom: 10,
                  opacity: 0.85,
                }}
              >
                {m.porqueAtivaAgora}
              </div>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 4,
                  marginBottom: 10,
                }}
              >
                {m.oportunidadesAgrupadas.slice(0, 4).map((o) => (
                  <span
                    key={o}
                    style={{
                      fontSize: 10,
                      color: accent.chip,
                      background: "rgba(0,30,50,0.6)",
                      padding: "2px 7px",
                      borderRadius: 4,
                      border: `1px solid ${accent.ring}`,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      maxWidth: 180,
                    }}
                    title={o}
                  >
                    {o}
                  </span>
                ))}
                {m.oportunidadesAgrupadas.length > 4 && (
                  <span style={{ fontSize: 10, color: "#5ab8cc" }}>
                    +{m.oportunidadesAgrupadas.length - 4}
                  </span>
                )}
              </div>
              <div
                style={{
                  borderTop: "1px solid rgba(0,212,255,0.12)",
                  paddingTop: 8,
                  fontSize: 10,
                  color: "#5ab8cc",
                  lineHeight: 1.4,
                }}
              >
                <span style={{ color: "#3a8a9a", letterSpacing: 1 }}>LIMITE:</span>{" "}
                {m.limiteOperacional}
              </div>
              {onAsk && (
                <button
                  onClick={() => onAsk(m)}
                  style={{
                    marginTop: 10,
                    width: "100%",
                    background: "transparent",
                    border: `1px solid ${accent.ring}`,
                    color: accent.chip,
                    padding: "6px 8px",
                    borderRadius: 6,
                    fontSize: 10,
                    letterSpacing: 1.2,
                    cursor: "pointer",
                    fontWeight: 600,
                    transition: "all 200ms cubic-bezier(0.23, 1, 0.32, 1)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = `${accent.chip}18`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                  }}
                >
                  PERGUNTAR AO JARVIS
                </button>
              )}
            </div>
          </article>
        );
      })}
    </div>
  );
}
