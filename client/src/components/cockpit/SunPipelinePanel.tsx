import { useMemo, useState } from "react";
import {
  styleForClass,
  type SunOpportunity,
  type SunClass,
} from "@/lib/sunTypes";

interface Props {
  oportunidades: SunOpportunity[];
  onAsk?: (op: SunOpportunity) => void;
}

type Tab = "portfolio" | "smart_city_2036";

const TAB_LABELS: Record<Tab, string> = {
  portfolio: "Portfólio",
  smart_city_2036: "Smart City 2036",
};

// Ordem de classe na lista (Ativa primeiro, depois Radar, etc.)
const CLASS_ORDER: SunClass[] = [
  "MISSAO_ATIVA",
  "RADAR",
  "RADAR_CONDICIONADO",
  "PAUSADA",
  "DESCARTADA",
  "DESCARTADA_AGORA",
];

/**
 * Painel esquerdo do cockpit — matriz Ativa/Radar/Pausada/Descartada
 * com tabs (Portfólio vs Smart City 2036), busca instantânea e filtro por classe.
 */
export default function SunPipelinePanel({ oportunidades, onAsk }: Props) {
  const [tab, setTab] = useState<Tab>("portfolio");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<SunClass | "ALL">("ALL");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = oportunidades.filter((o) => (o.contexto ?? "portfolio") === tab);
    return list
      .filter((o) => (filter === "ALL" ? true : o.classificacao === filter))
      .filter((o) => (q ? o.nome.toLowerCase().includes(q) : true))
      .sort((a, b) => {
        const ai = CLASS_ORDER.indexOf(a.classificacao);
        const bi = CLASS_ORDER.indexOf(b.classificacao);
        if (ai !== bi) return ai - bi;
        return a.nome.localeCompare(b.nome, "pt-BR");
      });
  }, [oportunidades, tab, query, filter]);

  const totalsByClass = useMemo(() => {
    const list = oportunidades.filter((o) => (o.contexto ?? "portfolio") === tab);
    const map: Record<string, number> = {};
    for (const op of list) map[op.classificacao] = (map[op.classificacao] ?? 0) + 1;
    return map;
  }, [oportunidades, tab]);

  return (
    <section
      style={{
        background: "linear-gradient(180deg, rgba(8,18,30,0.85), rgba(2,8,16,0.95))",
        border: "1px solid rgba(0,212,255,0.18)",
        borderRadius: 10,
        display: "flex",
        flexDirection: "column",
        height: "100%",
        minHeight: 0,
      }}
    >
      {/* Tabs */}
      <div
        style={{
          display: "flex",
          borderBottom: "1px solid rgba(0,212,255,0.18)",
          padding: "0 4px",
        }}
      >
        {(Object.keys(TAB_LABELS) as Tab[]).map((t) => {
          const active = tab === t;
          return (
            <button
              key={t}
              onClick={() => {
                setTab(t);
                setFilter("ALL");
              }}
              style={{
                background: "transparent",
                border: "none",
                color: active ? "#00d4ff" : "#5ab8cc",
                padding: "12px 14px",
                fontSize: 11,
                letterSpacing: 1.6,
                cursor: "pointer",
                fontWeight: active ? 700 : 500,
                borderBottom: active ? "2px solid #00d4ff" : "2px solid transparent",
                textTransform: "uppercase",
                transition: "color 160ms",
              }}
            >
              {TAB_LABELS[t]}
              <span style={{ marginLeft: 6, fontSize: 10, opacity: 0.7 }}>
                {oportunidades.filter((o) => (o.contexto ?? "portfolio") === t).length}
              </span>
            </button>
          );
        })}
      </div>

      {/* Busca + filtros */}
      <div style={{ padding: "10px 12px 6px" }}>
        <input
          type="search"
          placeholder="Buscar oportunidade..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{
            width: "100%",
            background: "rgba(0,20,30,0.6)",
            border: "1px solid rgba(0,212,255,0.22)",
            color: "#d8f8ff",
            padding: "6px 10px",
            borderRadius: 6,
            fontSize: 12,
            outline: "none",
          }}
        />
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 4,
            marginTop: 8,
          }}
        >
          <ClassChip
            label={`Todos (${oportunidades.filter((o) => (o.contexto ?? "portfolio") === tab).length})`}
            active={filter === "ALL"}
            onClick={() => setFilter("ALL")}
            color="#8ffcff"
          />
          {CLASS_ORDER.map((c) => {
            const count = totalsByClass[c] ?? 0;
            if (count === 0) return null;
            const s = styleForClass(c);
            return (
              <ClassChip
                key={c}
                label={`${s.label} (${count})`}
                active={filter === c}
                onClick={() => setFilter(c)}
                color={s.text}
              />
            );
          })}
        </div>
      </div>

      {/* Lista scrollável */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "4px 12px 14px",
          minHeight: 0,
        }}
      >
        {filtered.length === 0 ? (
          <div style={{ color: "#3a8a9a", fontSize: 11, padding: 12, fontStyle: "italic" }}>
            Nenhuma oportunidade nesta visão.
          </div>
        ) : (
          filtered.map((op) => {
            const s = styleForClass(op.classificacao);
            return (
              <button
                key={op.nome}
                onClick={() => onAsk?.(op)}
                style={{
                  display: "block",
                  width: "100%",
                  textAlign: "left",
                  background: s.bg,
                  border: `1px solid ${s.border}`,
                  borderLeft: `3px solid ${s.text}`,
                  borderRadius: 6,
                  padding: "8px 10px",
                  marginBottom: 6,
                  cursor: onAsk ? "pointer" : "default",
                  color: "#d8f8ff",
                  transition: "all 180ms cubic-bezier(0.23, 1, 0.32, 1)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateX(2px)";
                  e.currentTarget.style.boxShadow = `0 0 10px -3px ${s.glow}`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateX(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <div
                  style={{
                    fontSize: 9,
                    letterSpacing: 1.4,
                    color: s.text,
                    fontWeight: 700,
                    marginBottom: 3,
                  }}
                >
                  {s.label}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: "#d8f8ff",
                    fontWeight: 500,
                    lineHeight: 1.3,
                    marginBottom: 4,
                  }}
                >
                  {op.nome}
                </div>
                <div
                  style={{
                    fontSize: 10,
                    color: "#8ffcff",
                    opacity: 0.75,
                    lineHeight: 1.4,
                  }}
                >
                  {op.acao}
                </div>
              </button>
            );
          })
        )}
      </div>
    </section>
  );
}

function ClassChip({
  label,
  active,
  onClick,
  color,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  color: string;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        background: active ? `${color}24` : "transparent",
        border: `1px solid ${active ? color : "rgba(0,212,255,0.22)"}`,
        color: active ? color : "#5ab8cc",
        fontSize: 9,
        letterSpacing: 1,
        padding: "3px 8px",
        borderRadius: 999,
        cursor: "pointer",
        fontWeight: 600,
        transition: "all 160ms",
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </button>
  );
}
