import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import PriorityCard, { type Priority } from "@/components/cockpit/PriorityCard";
import AttentionPanel, { type AttentionItem } from "@/components/cockpit/AttentionPanel";
import AccelerationCard, { type Acceleration } from "@/components/cockpit/AccelerationCard";

interface CockpitData {
  generatedAt: string;
  priorities: Priority[];
  attentions: AttentionItem[];
  accelerations: Acceleration[];
  summary: {
    topScore: number | null;
    atrasosCount: number;
    bloqueiosCount: number;
  };
}

function greeting(now: Date): string {
  const h = now.getHours();
  if (h < 12) return "Bom dia, Senhor Hélio";
  if (h < 18) return "Boa tarde, Senhor Hélio";
  return "Boa noite, Senhor Hélio";
}

function summaryHeadline(d: CockpitData | null): string {
  if (!d) return "Carregando contexto da operação…";
  const n = d.priorities.length;
  const blq = d.summary.bloqueiosCount;
  const atr = d.summary.atrasosCount;
  if (n === 0 && blq === 0 && atr === 0) return "Operação fluida — nenhum ponto crítico no momento.";
  const parts: string[] = [];
  if (n > 0) parts.push(`${n} prioridade${n === 1 ? "" : "s"} no foco`);
  if (atr > 0) parts.push(`${atr} follow-up${atr === 1 ? "" : "s"} atrasado${atr === 1 ? "" : "s"}`);
  if (blq > 0) parts.push(`${blq} bloqueio${blq === 1 ? "" : "s"} crítico${blq === 1 ? "" : "s"}`);
  return parts.join(" · ");
}

export default function Cockpit() {
  const [data, setData] = useState<CockpitData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [now] = useState(() => new Date());

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/brain/status");
        if (!res.ok) {
          const body = await res.text();
          throw new Error(`HTTP ${res.status}: ${body.slice(0, 120)}`);
        }
        const json = (await res.json()) as CockpitData;
        if (!cancelled) setData(json);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : String(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const headline = useMemo(() => summaryHeadline(data), [data]);

  function onRegistrarMovimento(p: Priority) {
    toast.info(`Registrar movimento em "${p.nome}" — fluxo de voz será aberto na F3.`, { duration: 4000 });
  }
  function onAbrirDealRoom(p: Priority) {
    toast.info(`Abrir Deal Room "${p.nome}" — disponível na F4.`, { duration: 3000 });
  }
  function onTratar(it: AttentionItem) {
    toast.info(`Tratar: ${it.titulo} — fluxo de voz na F3.`, { duration: 3000 });
  }
  function onRegistrarMissao(a: Acceleration) {
    toast.success(`"${a.titulo}" será registrado como missão na F3.`, { duration: 3000 });
  }
  function onGuardarParaDepois(a: Acceleration) {
    toast(`"${a.titulo}" guardado para revisão posterior.`, { duration: 2500 });
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "radial-gradient(ellipse at top, #00121e 0%, #00060a 60%)",
        color: "#d8f8ff",
        padding: "24px 32px 80px",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      {/* Header */}
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 32,
          paddingBottom: 16,
          borderBottom: "1px solid #0d3347",
        }}
      >
        <div>
          <div style={{ fontSize: 10, color: "#5ab8cc", letterSpacing: 2, marginBottom: 4 }}>
            NOWGO JARVIS AI · COCKPIT INTERNO · v0.2
          </div>
          <h1 style={{ fontSize: 24, color: "#d8f8ff", fontWeight: 600, margin: 0, letterSpacing: 0.3 }}>
            {greeting(now)}
          </h1>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 10, color: "#3a8a9a", letterSpacing: 1.5, marginBottom: 4 }}>BRAIN STATUS</div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "flex-end" }}>
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: error ? "#ff3355" : loading ? "#ffcc00" : "#00ff88",
                boxShadow: `0 0 8px ${error ? "#ff3355" : loading ? "#ffcc00" : "#00ff88"}`,
              }}
            />
            <span style={{ fontSize: 12, color: "#8ffcff" }}>
              {error ? "Erro" : loading ? "Sincronizando" : "Conectado"}
            </span>
          </div>
        </div>
      </header>

      {/* Resumo headline */}
      <div
        style={{
          background: "#011520",
          border: "1px solid #0d3347",
          borderRadius: 8,
          padding: "14px 20px",
          marginBottom: 32,
          fontSize: 13,
          color: "#8ffcff",
        }}
      >
        {headline}
      </div>

      {error && (
        <div
          style={{
            background: "#1a0a10",
            border: "1px solid #ff335566",
            borderRadius: 8,
            padding: 16,
            marginBottom: 32,
            color: "#ff8899",
            fontSize: 13,
          }}
        >
          Falha ao consultar o Brain: {error}
        </div>
      )}

      {/* Zona 1 — Top 3 prioridades */}
      <section style={{ marginBottom: 36 }}>
        <SectionHeader title="Top 3 prioridades do dia" subtitle="ranqueado por Score, urgência e proximidade do próximo passo" />
        {data && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 16 }}>
            {data.priorities.map((p, i) => (
              <PriorityCard
                key={p.id}
                priority={p}
                index={i}
                onRegistrarMovimento={onRegistrarMovimento}
                onAbrirDealRoom={onAbrirDealRoom}
              />
            ))}
          </div>
        )}
        {loading && !data && <Skeleton n={3} />}
      </section>

      {/* Zona 2 — Pontos de atenção */}
      <section style={{ marginBottom: 36 }}>
        <SectionHeader title="Pontos de atenção" subtitle="bloqueios, follow-ups atrasados e prazos críticos" />
        {data && <AttentionPanel items={data.attentions} onTratar={onTratar} />}
      </section>

      {/* Zona 3 — Acelerar e ganhar escala */}
      <section>
        <SectionHeader
          title="Acelerar e ganhar escala"
          subtitle="padrões repetidos, oportunidades dormentes, alavancas não óbvias"
        />
        {data && (
          <AccelerationCard
            items={data.accelerations}
            onRegistrarMissao={onRegistrarMissao}
            onGuardarParaDepois={onGuardarParaDepois}
          />
        )}
      </section>

      {/* Footer */}
      <footer
        style={{
          marginTop: 60,
          paddingTop: 16,
          borderTop: "1px solid #0d3347",
          display: "flex",
          justifyContent: "space-between",
          fontSize: 10,
          color: "#3a8a9a",
          letterSpacing: 1,
        }}
      >
        <span>NOWGO HOLDING · USO INTERNO · CONFIDENCIAL</span>
        <span>{data ? `Atualizado em ${new Date(data.generatedAt).toLocaleString("pt-BR")}` : ""}</span>
      </footer>
    </div>
  );
}

function SectionHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <h2 style={{ fontSize: 13, color: "#00d4ff", letterSpacing: 1.5, fontWeight: 600, margin: 0, marginBottom: 2 }}>
        {title.toUpperCase()}
      </h2>
      <div style={{ fontSize: 11, color: "#5ab8cc", fontStyle: "italic" }}>{subtitle}</div>
    </div>
  );
}

function Skeleton({ n }: { n: number }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 16 }}>
      {Array.from({ length: n }).map((_, i) => (
        <div
          key={i}
          style={{
            background: "#010d14",
            border: "1px solid #0d3347",
            borderRadius: 8,
            height: 200,
            padding: 20,
            opacity: 0.5,
            animation: "pulse 1.5s ease-in-out infinite",
          }}
        />
      ))}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}
