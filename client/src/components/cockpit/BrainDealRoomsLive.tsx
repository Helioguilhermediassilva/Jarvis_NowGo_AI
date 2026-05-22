/**
 * BrainDealRoomsLive.tsx
 *
 * Top 5 Deal Rooms ao vivo, calculados automaticamente pelo Brain.
 *
 * - Ranking = top 5 oportunidades ATIVAS (não fechadas) por score, descendente
 * - Quando uma oportunidade do top é movida para Fechado-Ganho/Perdido (em
 *   qualquer canal: UI, voz, Notion direto), o próximo `cockpit:refresh` ou o
 *   polling de 30s recalcula o ranking e a 6ª sobe para o slot vago
 * - Animação suave de reordenação (FLIP via translate)
 */

import { useEffect, useState } from "react";

const C = {
  PRI: "#00d4ff",
  ACC: "#bb88ff",
  ACC2: "#00ffaa",
  WARN: "#ffaa00",
  TXT: "#e6f7ff",
  TXT_DIM: "#5ab8cc",
  BG: "rgba(8,18,30,0.9)",
  BORDER: "rgba(0,212,255,0.2)",
};

interface DealRoom {
  id: string;
  nome: string;
  empresa: string | null;
  estagio: string | null;
  score: number | null;
  valorEstimado: number | null;
  probabilidade: number | null;
  proximoFollowUp: string | null;
  urgencia: string | null;
  pontoTensao: string | null;
}

const fmtMoney = (v: number | null) => {
  if (v == null) return "—";
  if (v >= 1_000_000) return `R$ ${(v / 1_000_000).toFixed(1)}MM`;
  if (v >= 1_000) return `R$ ${(v / 1_000).toFixed(0)}K`;
  return `R$ ${v.toFixed(0)}`;
};

export default function BrainDealRoomsLive() {
  const [dealRooms, setDealRooms] = useState<DealRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);

  async function load() {
    try {
      const r = await fetch("/api/brain/deal-rooms?limit=5", {
        credentials: "include",
      });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const data = await r.json();
      setDealRooms(data.dealRooms ?? []);
      setUpdatedAt(new Date());
      setError(null);
    } catch (e: any) {
      setError(e?.message ?? "Falha ao carregar.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // Auto-refresh a cada 30s (fallback caso outro canal mute)
    const interval = setInterval(load, 30_000);
    // Reage a cockpit:refresh global
    const onRefresh = () => load();
    window.addEventListener("cockpit:refresh", onRefresh);
    return () => {
      clearInterval(interval);
      window.removeEventListener("cockpit:refresh", onRefresh);
    };
  }, []);

  return (
    <div
      style={{
        background: C.BG,
        border: `1px solid ${C.BORDER}`,
        borderRadius: 12,
        padding: 14,
        display: "flex",
        flexDirection: "column",
        gap: 10,
        height: "100%",
        minHeight: 0,
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: C.ACC2,
              boxShadow: `0 0 8px ${C.ACC2}`,
            }}
          />
          <span
            style={{
              fontSize: 11,
              letterSpacing: 1.8,
              color: C.PRI,
              fontWeight: 700,
              textTransform: "uppercase",
            }}
          >
            Top 5 Deal Rooms · Live
          </span>
        </div>
        {updatedAt && (
          <span style={{ fontSize: 9, color: C.TXT_DIM }}>
            {updatedAt.toLocaleTimeString("pt-BR", {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })}
          </span>
        )}
      </div>

      {/* Conteúdo */}
      {loading && (
        <div style={{ color: C.TXT_DIM, fontSize: 12, padding: 12 }}>
          Carregando ranking…
        </div>
      )}
      {error && !loading && (
        <div style={{ color: C.WARN, fontSize: 12, padding: 12 }}>
          Falha: {error}
        </div>
      )}
      {!loading && !error && dealRooms.length === 0 && (
        <div style={{ color: C.TXT_DIM, fontSize: 12, padding: 12 }}>
          Nenhuma oportunidade ativa no momento.
        </div>
      )}

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 8,
          flex: 1,
          minHeight: 0,
          overflowY: "auto",
        }}
      >
        {dealRooms.map((dr, idx) => (
          <DealRoomCard key={dr.id} dr={dr} rank={idx + 1} />
        ))}
      </div>

      {/* Rodapé explicativo */}
      <div
        style={{
          fontSize: 9,
          color: C.TXT_DIM,
          letterSpacing: 0.8,
          paddingTop: 6,
          borderTop: `1px dashed ${C.BORDER}`,
        }}
      >
        Ranking automático. Ao encerrar um deal (Fechado-Ganho/Perdido), o próximo
        de maior score sobe ao slot vago.
      </div>
    </div>
  );
}

function DealRoomCard({ dr, rank }: { dr: DealRoom; rank: number }) {
  const accent =
    rank === 1 ? C.ACC2 : rank === 2 ? C.PRI : rank === 3 ? C.ACC : C.TXT_DIM;

  return (
    <div
      style={{
        background: "rgba(0,20,30,0.5)",
        border: `1px solid ${accent}33`,
        borderLeft: `3px solid ${accent}`,
        borderRadius: 8,
        padding: "10px 12px",
        display: "flex",
        flexDirection: "column",
        gap: 6,
        transition: "all 240ms cubic-bezier(0.23,1,0.32,1)",
      }}
    >
      {/* Linha 1 — rank, nome, score */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
          <span
            style={{
              fontSize: 10,
              fontWeight: 800,
              color: accent,
              minWidth: 18,
              fontFamily: "ui-monospace, monospace",
            }}
          >
            #{rank}
          </span>
          <span
            style={{
              fontSize: 12,
              color: C.TXT,
              fontWeight: 600,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              minWidth: 0,
              flex: 1,
            }}
            title={dr.nome}
          >
            {dr.nome}
          </span>
        </div>
        {dr.score != null && (
          <span
            style={{
              fontSize: 10,
              color: accent,
              fontFamily: "ui-monospace, monospace",
              fontWeight: 700,
            }}
          >
            {dr.score}
          </span>
        )}
      </div>

      {/* Linha 2 — empresa, valor, estágio */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
          fontSize: 10,
          color: C.TXT_DIM,
        }}
      >
        <span
          style={{
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            flex: 1,
            minWidth: 0,
          }}
        >
          {dr.empresa ?? "—"}
        </span>
        <span style={{ color: C.TXT, fontFamily: "ui-monospace, monospace" }}>
          {fmtMoney(dr.valorEstimado)}
        </span>
        {dr.estagio && (
          <span
            style={{
              padding: "2px 6px",
              borderRadius: 3,
              background: `${accent}1a`,
              color: accent,
              fontSize: 9,
              letterSpacing: 0.5,
            }}
          >
            {dr.estagio}
          </span>
        )}
      </div>

      {/* Linha 3 — ponto de tensão */}
      {dr.pontoTensao && (
        <div
          style={{
            fontSize: 9.5,
            color: C.WARN,
            fontStyle: "italic",
            opacity: 0.85,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
          title={dr.pontoTensao}
        >
          ⚠ {dr.pontoTensao}
        </div>
      )}
    </div>
  );
}
