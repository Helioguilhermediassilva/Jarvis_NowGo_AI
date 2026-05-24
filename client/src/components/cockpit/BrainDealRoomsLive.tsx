/**
 * BrainDealRoomsLive.tsx
 *
 * Top 5 Deal Rooms ao vivo, calculados automaticamente pelo Brain.
 *
 * - Ranking = top 5 oportunidades ATIVAS (não fechadas) por score, descendente
 * - F30: editar Decisor inline + marcar como Resolvido com nota final opcional
 * - Quando uma oportunidade é resolvida (UI, voz ou Notion), o próximo refresh
 *   recalcula o ranking e a 6ª sobe ao slot vago
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
  decisor?: string | null;
  contatoDecisor?: string | null;
}

const fmtMoney = (v: number | null) => {
  if (v == null) return "—";
  if (v >= 1_000_000) return `R$ ${(v / 1_000_000).toFixed(1)}MM`;
  if (v >= 1_000) return `R$ ${(v / 1_000).toFixed(0)}K`;
  return `R$ ${v.toFixed(0)}`;
};

interface Props {
  role?: "leitor" | "operador" | "superadmin";
}

export default function BrainDealRoomsLive({ role = "leitor" }: Props) {
  const [dealRooms, setDealRooms] = useState<DealRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);
  const canWrite = role !== "leitor";

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
    const interval = setInterval(load, 30_000);
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
          <DealRoomCard
            key={dr.id}
            dr={dr}
            rank={idx + 1}
            canWrite={canWrite}
            onChange={load}
          />
        ))}
      </div>

      <div
        style={{
          fontSize: 9,
          color: C.TXT_DIM,
          letterSpacing: 0.8,
          paddingTop: 6,
          borderTop: `1px dashed ${C.BORDER}`,
        }}
      >
        Ranking automático. Ao resolver um deal, o próximo de maior score sobe ao
        slot vago. Edite decisor e contato direto no card.
      </div>
    </div>
  );
}

function DealRoomCard({
  dr,
  rank,
  canWrite,
  onChange,
}: {
  dr: DealRoom;
  rank: number;
  canWrite: boolean;
  onChange: () => void;
}) {
  const accent =
    rank === 1 ? C.ACC2 : rank === 2 ? C.PRI : rank === 3 ? C.ACC : C.TXT_DIM;

  const [editingDecisor, setEditingDecisor] = useState(false);
  const [decisor, setDecisor] = useState(dr.decisor ?? "");
  const [contato, setContato] = useState(dr.contatoDecisor ?? "");
  const [saving, setSaving] = useState(false);
  const [resolveOpen, setResolveOpen] = useState(false);
  const [notaFinal, setNotaFinal] = useState("");
  const [resolving, setResolving] = useState(false);
  const [errMsg, setErrMsg] = useState<string | null>(null);

  // Sincroniza state local quando o card é re-renderizado com dados novos.
  useEffect(() => {
    if (!editingDecisor) {
      setDecisor(dr.decisor ?? "");
      setContato(dr.contatoDecisor ?? "");
    }
  }, [dr.decisor, dr.contatoDecisor, editingDecisor]);

  async function saveDecisor() {
    if (!canWrite) return;
    setSaving(true);
    setErrMsg(null);
    try {
      const r = await fetch("/api/brain/deal-rooms", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pageId: dr.id,
          decisor: decisor.trim(),
          contato: contato.trim(),
        }),
      });
      if (!r.ok) {
        const text = await r.text();
        throw new Error(text.slice(0, 160) || `HTTP ${r.status}`);
      }
      setEditingDecisor(false);
      window.dispatchEvent(new Event("cockpit:refresh"));
      onChange();
    } catch (e: any) {
      setErrMsg(e?.message ?? "Falha ao salvar.");
    } finally {
      setSaving(false);
    }
  }

  async function resolve() {
    if (!canWrite) return;
    setResolving(true);
    setErrMsg(null);
    try {
      const r = await fetch("/api/brain/deal-rooms?action=resolve", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pageId: dr.id,
          notaFinal: notaFinal.trim() || undefined,
        }),
      });
      if (!r.ok) {
        const text = await r.text();
        throw new Error(text.slice(0, 160) || `HTTP ${r.status}`);
      }
      setResolveOpen(false);
      setNotaFinal("");
      window.dispatchEvent(new Event("cockpit:refresh"));
      onChange();
    } catch (e: any) {
      setErrMsg(e?.message ?? "Falha ao resolver.");
    } finally {
      setResolving(false);
    }
  }

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

      {/* Linha 4 — decisor (F30) */}
      {!editingDecisor && (
        <div
          style={{
            fontSize: 10,
            color: C.TXT_DIM,
            display: "flex",
            alignItems: "center",
            gap: 6,
            paddingTop: 2,
            borderTop: `1px dashed ${C.BORDER}`,
            marginTop: 2,
          }}
        >
          <span style={{ color: C.PRI, fontWeight: 700, letterSpacing: 0.5 }}>
            DECISOR:
          </span>
          <span
            style={{
              color: dr.decisor ? C.TXT : C.TXT_DIM,
              flex: 1,
              minWidth: 0,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
            title={
              dr.decisor
                ? `${dr.decisor}${dr.contatoDecisor ? ` · ${dr.contatoDecisor}` : ""}`
                : "Não informado"
            }
          >
            {dr.decisor
              ? `${dr.decisor}${dr.contatoDecisor ? ` · ${dr.contatoDecisor}` : ""}`
              : "—"}
          </span>
          {canWrite && (
            <button
              type="button"
              onClick={() => setEditingDecisor(true)}
              style={{
                background: "transparent",
                border: `1px solid ${C.BORDER}`,
                color: C.PRI,
                fontSize: 9,
                padding: "2px 6px",
                borderRadius: 4,
                cursor: "pointer",
                letterSpacing: 0.5,
              }}
            >
              EDITAR
            </button>
          )}
        </div>
      )}
      {editingDecisor && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 6,
            paddingTop: 4,
            borderTop: `1px dashed ${C.BORDER}`,
            marginTop: 2,
          }}
        >
          <input
            type="text"
            placeholder="Nome do decisor (ex.: Ana Silva)"
            value={decisor}
            onChange={(e) => setDecisor(e.target.value)}
            disabled={saving}
            style={inputStyle}
          />
          <input
            type="text"
            placeholder="Contato (ex.: CEO · WhatsApp +55 61 9...)"
            value={contato}
            onChange={(e) => setContato(e.target.value)}
            disabled={saving}
            style={inputStyle}
          />
          <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
            <button
              type="button"
              onClick={() => {
                setEditingDecisor(false);
                setDecisor(dr.decisor ?? "");
                setContato(dr.contatoDecisor ?? "");
                setErrMsg(null);
              }}
              disabled={saving}
              style={btnGhost}
            >
              CANCELAR
            </button>
            <button
              type="button"
              onClick={saveDecisor}
              disabled={saving}
              style={btnPrimary}
            >
              {saving ? "SALVANDO…" : "SALVAR"}
            </button>
          </div>
        </div>
      )}

      {/* Linha 5 — botão Resolver (F30) */}
      {canWrite && !resolveOpen && (
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 2 }}>
          <button
            type="button"
            onClick={() => setResolveOpen(true)}
            style={{
              background: "transparent",
              border: `1px solid ${C.ACC2}66`,
              color: C.ACC2,
              fontSize: 9,
              padding: "3px 8px",
              borderRadius: 4,
              cursor: "pointer",
              letterSpacing: 0.6,
              fontWeight: 700,
            }}
          >
            ✓ MARCAR COMO RESOLVIDO
          </button>
        </div>
      )}
      {canWrite && resolveOpen && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 6,
            paddingTop: 4,
            borderTop: `1px dashed ${C.ACC2}55`,
            marginTop: 2,
          }}
        >
          <span
            style={{
              fontSize: 9,
              color: C.ACC2,
              letterSpacing: 0.6,
              fontWeight: 700,
            }}
          >
            RESOLVER — NOTA FINAL (OPCIONAL)
          </span>
          <textarea
            placeholder="Aprendizados, valor final, condições, próximos passos pós-fechamento…"
            value={notaFinal}
            onChange={(e) => setNotaFinal(e.target.value)}
            disabled={resolving}
            rows={3}
            style={{ ...inputStyle, fontFamily: "inherit", resize: "vertical" }}
          />
          <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
            <button
              type="button"
              onClick={() => {
                setResolveOpen(false);
                setNotaFinal("");
                setErrMsg(null);
              }}
              disabled={resolving}
              style={btnGhost}
            >
              CANCELAR
            </button>
            <button
              type="button"
              onClick={resolve}
              disabled={resolving}
              style={{ ...btnPrimary, borderColor: `${C.ACC2}88`, color: C.ACC2 }}
            >
              {resolving ? "RESOLVENDO…" : "CONFIRMAR FECHAMENTO"}
            </button>
          </div>
        </div>
      )}

      {errMsg && (
        <div style={{ fontSize: 9, color: C.WARN, paddingTop: 2 }}>{errMsg}</div>
      )}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  background: "rgba(0,30,50,0.5)",
  border: `1px solid ${C.BORDER}`,
  borderRadius: 4,
  color: C.TXT,
  fontSize: 11,
  padding: "5px 8px",
  outline: "none",
};

const btnGhost: React.CSSProperties = {
  background: "transparent",
  border: `1px solid ${C.BORDER}`,
  color: C.TXT_DIM,
  fontSize: 9,
  padding: "3px 8px",
  borderRadius: 4,
  cursor: "pointer",
  letterSpacing: 0.6,
  fontWeight: 600,
};

const btnPrimary: React.CSSProperties = {
  background: "transparent",
  border: `1px solid ${C.PRI}88`,
  color: C.PRI,
  fontSize: 9,
  padding: "3px 8px",
  borderRadius: 4,
  cursor: "pointer",
  letterSpacing: 0.6,
  fontWeight: 700,
};
