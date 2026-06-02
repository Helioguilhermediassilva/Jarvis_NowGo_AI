/**
 * PipelineLeftColumn.tsx
 *
 * Wrapper da coluna esquerda do cockpit. Apresenta duas visões alternadas:
 *  - Snapshot SUN (matriz Ativa/Radar/Pausada/Descartada — estática)
 *  - Brain Live (oportunidades reais do Brain Notion com CRUD)
 *
 * O usuário troca pelas tabs de cabeçalho. O Brain Live só é habilitado
 * para usuários com sessão válida; para leitor, exibe somente leitura.
 */

import { useState } from "react";
import SunPipelinePanel from "./SunPipelinePanel";
import BrainPipelineLive from "./BrainPipelineLive";
import type { SunOpportunity } from "@/lib/sunTypes";

type View = "snapshot" | "live";

const C = {
  PRI: "#00d4ff",
  ACC2: "#00ffaa",
  TXT_DIM: "#5ab8cc",
  BORDER: "rgba(0,212,255,0.18)",
};

interface Props {
  oportunidades: SunOpportunity[];
  onAsk?: (op: SunOpportunity) => void;
  role: "superadmin" | "operador" | "leitor";
}

export default function PipelineLeftColumn({
  oportunidades,
  onAsk,
  role,
}: Props) {
  const [view, setView] = useState<View>("live");

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        minHeight: 0,
        gap: 8,
      }}
    >
      {/* Toggle de visão */}
      <div
        style={{
          display: "flex",
          background: "rgba(8,18,30,0.85)",
          border: `1px solid ${C.BORDER}`,
          borderRadius: 8,
          padding: 3,
          gap: 2,
        }}
      >
        <ViewTab
          label="Snapshot"
          active={view === "snapshot"}
          color={C.PRI}
          onClick={() => setView("snapshot")}
        />
        <ViewTab
          label="Brain · Live"
          active={view === "live"}
          color={C.ACC2}
          onClick={() => setView("live")}
          dot
        />
      </div>

      {/* Conteúdo */}
      <div style={{ flex: 1, minHeight: 0 }}>
        {view === "snapshot" ? (
          <SunPipelinePanel oportunidades={oportunidades} onAsk={onAsk} />
        ) : (
          <BrainPipelineLive role={role} />
        )}
      </div>
    </div>
  );
}

function ViewTab({
  label,
  active,
  color,
  onClick,
  dot,
}: {
  label: string;
  active: boolean;
  color: string;
  onClick: () => void;
  dot?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1,
        background: active ? `${color}1a` : "transparent",
        border: active ? `1px solid ${color}55` : "1px solid transparent",
        color: active ? color : C.TXT_DIM,
        fontSize: 10,
        letterSpacing: 1.6,
        padding: "8px 10px",
        borderRadius: 6,
        cursor: "pointer",
        fontWeight: 700,
        textTransform: "uppercase",
        transition: "all 160ms cubic-bezier(0.23,1,0.32,1)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
      }}
    >
      {dot && (
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: color,
            boxShadow: active ? `0 0 8px ${color}` : "none",
            opacity: active ? 1 : 0.5,
          }}
        />
      )}
      {label}
    </button>
  );
}
