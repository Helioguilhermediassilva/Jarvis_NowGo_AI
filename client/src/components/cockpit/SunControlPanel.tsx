import type {
  SunDealRoom,
  SunRitual,
  SunDayAction,
  SunRemoveItem,
} from "@/lib/sunTypes";

interface Props {
  dealRooms: SunDealRoom[];
  rituais: SunRitual[];
  proximos7Dias: SunDayAction[];
  removerDaAgenda: SunRemoveItem[];
}

const MISSION_COLOR: Record<1 | 2 | 3, string> = {
  1: "#00d4ff",
  2: "#00ffaa",
  3: "#bb88ff",
};

/**
 * Painel direito do cockpit — controle operacional SUN:
 * Top 5 Deal Rooms, cadência (5 rituais), plano dos próximos 7 dias,
 * lista de remoção da agenda do founder.
 */
export default function SunControlPanel({
  dealRooms,
  rituais,
  proximos7Dias,
  removerDaAgenda,
}: Props) {
  return (
    <section
      style={{
        background: "linear-gradient(180deg, rgba(8,18,30,0.85), rgba(2,8,16,0.95))",
        border: "1px solid rgba(0,212,255,0.18)",
        borderRadius: 10,
        height: "100%",
        minHeight: 0,
        overflowY: "auto",
        padding: 14,
      }}
    >
      {/* Deal Rooms */}
      <Block title="Top 5 Deal Rooms" accent="#00d4ff">
        {dealRooms.map((dr) => (
          <div
            key={dr.id}
            style={{
              background: "rgba(0,20,30,0.4)",
              border: "1px solid rgba(0,212,255,0.18)",
              borderLeft: `3px solid ${MISSION_COLOR[dr.missao]}`,
              borderRadius: 6,
              padding: "8px 10px",
              marginBottom: 8,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 4,
              }}
            >
              <span
                style={{
                  fontSize: 9,
                  letterSpacing: 1.4,
                  color: MISSION_COLOR[dr.missao],
                  fontWeight: 700,
                }}
              >
                {dr.id} · MISSÃO {dr.missao}
              </span>
              <span style={{ fontSize: 9, color: "#5ab8cc", letterSpacing: 0.6 }}>
                {dr.owner}
              </span>
            </div>
            <div
              style={{
                fontSize: 12,
                color: "#d8f8ff",
                fontWeight: 600,
                marginBottom: 4,
                lineHeight: 1.3,
              }}
            >
              {dr.nome}
            </div>
            <div style={{ fontSize: 10, color: "#8ffcff", opacity: 0.8, marginBottom: 3 }}>
              <span style={{ color: "#3a8a9a" }}>STATUS:</span> {dr.status}
            </div>
            <div style={{ fontSize: 10, color: "#ffc880", opacity: 0.85, marginBottom: 3 }}>
              <span style={{ color: "#3a8a9a" }}>RISCO:</span> {dr.risco}
            </div>
            <div style={{ fontSize: 10, color: "#00ffaa", opacity: 0.9 }}>
              <span style={{ color: "#3a8a9a" }}>PRÓXIMO:</span> {dr.proximoPasso}
            </div>
          </div>
        ))}
      </Block>

      {/* Cadência operacional */}
      <Block title="Cadência operacional" accent="#bb88ff">
        {rituais.map((r) => (
          <div
            key={r.nome}
            style={{
              background: "rgba(20,10,40,0.3)",
              border: "1px solid rgba(187,136,255,0.25)",
              borderRadius: 6,
              padding: "8px 10px",
              marginBottom: 6,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 3,
              }}
            >
              <span style={{ fontSize: 12, color: "#d8f8ff", fontWeight: 600 }}>{r.nome}</span>
              <span
                style={{
                  fontSize: 9,
                  color: "#bb88ff",
                  background: "rgba(50,30,80,0.5)",
                  padding: "2px 6px",
                  borderRadius: 3,
                  letterSpacing: 0.5,
                }}
              >
                {r.frequencia} · {r.duracao}
              </span>
            </div>
            <div style={{ fontSize: 10, color: "#8ffcff", opacity: 0.75, marginBottom: 2 }}>
              {r.owner}
            </div>
            <div style={{ fontSize: 10, color: "#8ffcff", opacity: 0.85, lineHeight: 1.4 }}>
              {r.saidaObrigatoria}
            </div>
          </div>
        ))}
      </Block>

      {/* Próximos 7 dias */}
      <Block title="Plano dos próximos 7 dias" accent="#00ffaa">
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {proximos7Dias.map((d, idx) => (
            <div
              key={idx}
              style={{
                display: "grid",
                gridTemplateColumns: "32px 1fr",
                gap: 8,
                alignItems: "start",
                padding: "6px 8px",
                background: "rgba(0,30,20,0.3)",
                border: "1px solid rgba(0,255,170,0.2)",
                borderRadius: 6,
              }}
            >
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  background: "rgba(0,80,60,0.4)",
                  border: "1px solid #00ffaa",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#00ffaa",
                  fontSize: 11,
                  fontWeight: 700,
                }}
              >
                D{d.dia}
              </div>
              <div>
                <div
                  style={{
                    fontSize: 11,
                    color: "#d8f8ff",
                    fontWeight: 500,
                    lineHeight: 1.3,
                    marginBottom: 2,
                  }}
                >
                  {d.acao}
                </div>
                <div style={{ fontSize: 9, color: "#5ab8cc" }}>
                  <span style={{ color: "#3a8a9a" }}>OWNER:</span> {d.owner} ·{" "}
                  <span style={{ color: "#3a8a9a" }}>SAÍDA:</span> {d.saida}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Block>

      {/* Remover da agenda do founder */}
      <Block title="Remover da agenda do founder" accent="#ff5070">
        {removerDaAgenda.map((it, idx) => (
          <div
            key={idx}
            style={{
              background: "rgba(40,0,15,0.3)",
              border: "1px solid rgba(255,80,100,0.25)",
              borderRadius: 6,
              padding: "7px 10px",
              marginBottom: 5,
            }}
          >
            <div
              style={{
                fontSize: 11,
                color: "#ff8a99",
                fontWeight: 600,
                marginBottom: 3,
                lineHeight: 1.3,
              }}
            >
              {it.remover}
            </div>
            <div style={{ fontSize: 9, color: "#8ffcff", opacity: 0.7 }}>
              → {it.destino}
            </div>
          </div>
        ))}
      </Block>
    </section>
  );
}

function Block({
  title,
  accent,
  children,
}: {
  title: string;
  accent: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: 22 }}>
      <h3
        style={{
          fontSize: 10,
          letterSpacing: 1.8,
          color: accent,
          margin: 0,
          marginBottom: 8,
          textTransform: "uppercase",
          fontWeight: 700,
          paddingBottom: 4,
          borderBottom: `1px solid ${accent}33`,
        }}
      >
        {title}
      </h3>
      {children}
    </div>
  );
}
