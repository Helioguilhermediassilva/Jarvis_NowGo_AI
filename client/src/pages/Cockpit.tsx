import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import SunMissionsBar from "@/components/cockpit/SunMissionsBar";
import SunPipelinePanel from "@/components/cockpit/SunPipelinePanel";
import SunControlPanel from "@/components/cockpit/SunControlPanel";
import JarvisCore from "@/components/cockpit/JarvisCore";
import SetupOverlay, {
  loadPrefs,
  DEFAULT_PREFS,
  type JarvisPrefs,
} from "@/components/SetupOverlay";
import type { Priority } from "@/components/cockpit/PriorityCard";
import type { AttentionItem } from "@/components/cockpit/AttentionPanel";
import type { Acceleration } from "@/components/cockpit/AccelerationCard";
import type { SunApiResponse, SunMission, SunOpportunity } from "@/lib/sunTypes";

interface BrainData {
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

function useClock(): { time: string; date: string } {
  const [time, setTime] = useState("");
  const [date, setDate] = useState("");
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString("pt-BR", { hour12: false }));
      const days = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
      const months = [
        "Jan",
        "Fev",
        "Mar",
        "Abr",
        "Mai",
        "Jun",
        "Jul",
        "Ago",
        "Set",
        "Out",
        "Nov",
        "Dez",
      ];
      setDate(
        `${days[now.getDay()]} ${now.getDate().toString().padStart(2, "0")} ${
          months[now.getMonth()]
        } ${now.getFullYear()}`,
      );
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return { time, date };
}

/**
 * Cockpit cinematográfico do Jarvis NowGo.
 * Layout em grid 3 colunas (esquerda Pipeline SUN, centro Jarvis Core,
 * direita Controle Operacional) com faixa superior de Missões Ativas.
 */
export default function Cockpit() {
  const [now] = useState(() => new Date());
  const { time, date } = useClock();

  // -------------- Setup gate (1º acesso) --------------
  const [showSetup, setShowSetup] = useState(() => {
    try {
      return !localStorage.getItem("jarvis.prefs");
    } catch {
      return true;
    }
  });
  const [, setPrefs] = useState<JarvisPrefs>(() => loadPrefs() ?? DEFAULT_PREFS);

  // -------------- Dados Brain + SUN --------------
  const [brain, setBrain] = useState<BrainData | null>(null);
  const [sun, setSun] = useState<SunApiResponse | null>(null);
  const [brainError, setBrainError] = useState<string | null>(null);
  const [sunError, setSunError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // External prompt para mandar para o JarvisCore (ex.: clique numa missão)
  const [externalPrompt, setExternalPrompt] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const [rBrain, rSun] = await Promise.all([
          fetch("/api/brain/status"),
          fetch("/api/sun/plan"),
        ]);
        if (rBrain.ok) {
          const j = (await rBrain.json()) as BrainData;
          if (!cancelled) setBrain(j);
        } else {
          const txt = await rBrain.text();
          if (!cancelled) setBrainError(`HTTP ${rBrain.status}: ${txt.slice(0, 120)}`);
        }
        if (rSun.ok) {
          const j = (await rSun.json()) as SunApiResponse;
          if (!cancelled) setSun(j);
        } else {
          const txt = await rSun.text();
          if (!cancelled) setSunError(`HTTP ${rSun.status}: ${txt.slice(0, 120)}`);
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        if (!cancelled) setBrainError(msg);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  // ----- Contexto SUN injetado no system prompt do Jarvis ------
  const cockpitContext = useMemo(() => {
    if (!sun) return "";
    const s = sun.snapshot;
    const stats = sun.stats;
    const missoesText = s.missoes
      .map(
        (m) =>
          `Missão ${m.id} — ${m.nome} (oportunidades: ${m.oportunidadesAgrupadas.join("; ")}). Limite: ${m.limiteOperacional}`,
      )
      .join("\n");
    const radar = s.oportunidades
      .filter((o) => o.classificacao === "RADAR" || o.classificacao === "RADAR_CONDICIONADO")
      .slice(0, 12)
      .map((o) => `${o.nome}: ${o.acao}`)
      .join("\n");
    const pausadas = s.oportunidades
      .filter((o) => o.classificacao === "PAUSADA")
      .map((o) => `${o.nome}: ${o.acao}`)
      .join("\n");
    const descartadas = s.oportunidades
      .filter(
        (o) => o.classificacao === "DESCARTADA" || o.classificacao === "DESCARTADA_AGORA",
      )
      .map((o) => `${o.nome}: ${o.acao}`)
      .join("\n");
    const dealRoomsText = s.dealRooms
      .map(
        (dr) =>
          `${dr.id} ${dr.nome} (Missão ${dr.missao}, owner ${dr.owner}). Status: ${dr.status}. Próximo: ${dr.proximoPasso}`,
      )
      .join("\n");
    const dias = s.proximos7Dias
      .map((d) => `D${d.dia} — ${d.acao} (owner ${d.owner}; saída: ${d.saida})`)
      .join("\n");
    return [
      `=== CONTEXTO SUN ATIVO (Plano Operacional v${s.versao} gerado em ${new Date(s.geradoEm).toLocaleString("pt-BR")}) ===`,
      `Você é o Jarvis NowGo, copiloto de gestão da NowGo Holding. SUN é o agente assíncrono interno da NowGo que executa missões longas em background. Você (Jarvis) é o maestro conversacional síncrono.`,
      ``,
      `COMANDO FINAL DO SUN (diretriz inquestionável):`,
      s.comandoFinal,
      ``,
      `ESTATÍSTICAS: ${stats.totalOportunidades} oportunidades classificadas, ${stats.totalMissoesAtivas} Missões Ativas, ${stats.totalDealRooms} Deal Rooms prioritários.`,
      ``,
      `3 MISSÕES ATIVAS (foco exclusivo do founder):`,
      missoesText,
      ``,
      `RADAR (não ativar agora, manter monitoramento):`,
      radar,
      ``,
      `PAUSADAS:`,
      pausadas,
      ``,
      `DESCARTADAS:`,
      descartadas,
      ``,
      `TOP 5 DEAL ROOMS:`,
      dealRoomsText,
      ``,
      `PLANO 7 DIAS:`,
      dias,
      ``,
      `REGRA 3+1: o founder só pode ter UMA missão por vez no foco; o portfólio mantém no máximo 3 Missões Ativas simultâneas. Se o usuário pedir para ativar uma 4ª missão, responda lembrando essa regra do blueprint operacional e proponha qual das ativas pausar.`,
    ].join("\n");
  }, [sun]);

  // -------------- Handlers --------------
  const onAskMission = useCallback((m: SunMission) => {
    setExternalPrompt(
      `Resuma o status da Missão Ativa ${m.id} (${m.nome}). Liste oportunidades agrupadas, próximos passos e onde estou mais exposto a risco.`,
    );
  }, []);
  const onAskOp = useCallback((op: SunOpportunity) => {
    setExternalPrompt(
      `O que devo fazer agora com "${op.nome}"? O SUN classificou como ${op.classificacao}. Confirme a ação operacional e me diga o próximo passo concreto.`,
    );
  }, []);
  const onPromptConsumed = useCallback(() => setExternalPrompt(null), []);

  const handleSetupDone = useCallback((p: JarvisPrefs) => {
    setPrefs(p);
    setShowSetup(false);
    toast.success("Jarvis online. Cockpit ativo.", { duration: 2500 });
  }, []);

  // -------------- Render --------------
  if (showSetup) {
    return (
      <div style={pageStyle()}>
        <SetupOverlay onDone={handleSetupDone} />
      </div>
    );
  }

  return (
    <div style={pageStyle()}>
      {/* Background nebulosa */}
      <div
        aria-hidden
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 0,
          background:
            "radial-gradient(ellipse at 30% 20%, rgba(0,80,140,0.18) 0%, transparent 50%), radial-gradient(ellipse at 75% 80%, rgba(60,30,140,0.18) 0%, transparent 50%), radial-gradient(ellipse at center, #001016 0%, #00060a 80%)",
          pointerEvents: "none",
        }}
      />
      <div style={{ position: "relative", zIndex: 1 }}>
        {/* Header */}
        <header style={headerStyle()}>
          <div>
            <div
              style={{
                fontSize: 10,
                color: "#5ab8cc",
                letterSpacing: 2,
                marginBottom: 4,
              }}
            >
              NOWGO JARVIS AI · COCKPIT INTERNO · {sun ? `SUN v${sun.snapshot.versao}` : "..."}
            </div>
            <h1
              style={{
                fontSize: 22,
                color: "#d8f8ff",
                fontWeight: 600,
                margin: 0,
                letterSpacing: 0.3,
              }}
            >
              {greeting(now)}
            </h1>
          </div>
          <div style={{ textAlign: "right" }}>
            <div
              style={{
                fontSize: 10,
                color: "#3a8a9a",
                letterSpacing: 1.5,
                marginBottom: 4,
              }}
            >
              {date.toUpperCase()} · {time}
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                justifyContent: "flex-end",
              }}
            >
              <StatusDot
                label="BRAIN"
                ok={!brainError && !!brain}
                loading={loading}
              />
              <StatusDot
                label="SUN"
                ok={!sunError && !!sun}
                loading={loading}
              />
            </div>
          </div>
        </header>

        {/* Faixa de Missões Ativas */}
        {sun && (
          <section style={{ padding: "0 24px 14px" }}>
            <SunMissionsBar missions={sun.snapshot.missoes} onAsk={onAskMission} />
          </section>
        )}

        {/* Grid principal */}
        <main style={mainStyle()}>
          {/* Esquerda — Pipeline */}
          <div style={{ minHeight: 0 }}>
            {sun ? (
              <SunPipelinePanel
                oportunidades={sun.snapshot.oportunidades}
                onAsk={onAskOp}
              />
            ) : (
              <PanelPlaceholder
                title="Pipeline SUN"
                msg={sunError ? `Falha: ${sunError}` : "Carregando..."}
              />
            )}
          </div>

          {/* Centro — Jarvis */}
          <div style={{ minHeight: 0 }}>
            <JarvisCore
              externalPrompt={externalPrompt}
              onPromptConsumed={onPromptConsumed}
              cockpitSystemContext={cockpitContext}
            />
          </div>

          {/* Direita — Controle operacional */}
          <div style={{ minHeight: 0 }}>
            {sun ? (
              <SunControlPanel
                dealRooms={sun.snapshot.dealRooms}
                rituais={sun.snapshot.rituais}
                proximos7Dias={sun.snapshot.proximos7Dias}
                removerDaAgenda={sun.snapshot.removerDaAgenda}
              />
            ) : (
              <PanelPlaceholder
                title="Controle SUN"
                msg={sunError ? `Falha: ${sunError}` : "Carregando..."}
              />
            )}
          </div>
        </main>

        {/* Ticker do comando final SUN */}
        {sun && (
          <footer style={tickerStyle()}>
            <div style={tickerInnerStyle()}>
              <span style={{ color: "#00d4ff", fontWeight: 700, letterSpacing: 1.6 }}>
                COMANDO SUN
              </span>{" "}
              · {sun.snapshot.comandoFinal} · {sun.snapshot.comandoFinal}
            </div>
          </footer>
        )}

        {/* Linha final */}
        <div
          style={{
            padding: "10px 24px 16px",
            display: "flex",
            justifyContent: "space-between",
            fontSize: 10,
            color: "#3a8a9a",
            letterSpacing: 1,
          }}
        >
          <span>NOWGO HOLDING · USO INTERNO · CONFIDENCIAL</span>
          <span>
            {brain
              ? `Brain ${new Date(brain.generatedAt).toLocaleTimeString("pt-BR")}`
              : ""}{" "}
            ·{" "}
            {sun
              ? `SUN ${new Date(sun.snapshot.geradoEm).toLocaleDateString("pt-BR")}`
              : ""}
          </span>
        </div>
      </div>
    </div>
  );
}

// =====================================================================
// Sub-componentes locais
// =====================================================================

function StatusDot({
  label,
  ok,
  loading,
}: {
  label: string;
  ok: boolean;
  loading: boolean;
}) {
  const color = loading ? "#ffcc00" : ok ? "#00ff88" : "#ff3355";
  const txt = loading ? "Sincronizando" : ok ? "Conectado" : "Erro";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <span style={{ fontSize: 9, color: "#3a8a9a", letterSpacing: 1.2 }}>
        {label}
      </span>
      <span
        style={{
          width: 7,
          height: 7,
          borderRadius: "50%",
          background: color,
          boxShadow: `0 0 8px ${color}`,
        }}
      />
      <span style={{ fontSize: 10, color: "#8ffcff" }}>{txt}</span>
    </div>
  );
}

function PanelPlaceholder({ title, msg }: { title: string; msg: string }) {
  return (
    <div
      style={{
        background: "rgba(8,18,30,0.85)",
        border: "1px solid rgba(0,212,255,0.18)",
        borderRadius: 10,
        height: "100%",
        minHeight: 200,
        padding: 18,
        color: "#5ab8cc",
        fontSize: 12,
      }}
    >
      <div style={{ fontSize: 10, letterSpacing: 1.6, color: "#00d4ff", marginBottom: 8 }}>
        {title.toUpperCase()}
      </div>
      <div>{msg}</div>
    </div>
  );
}

// =====================================================================
// Estilos
// =====================================================================

function pageStyle(): React.CSSProperties {
  return {
    minHeight: "100vh",
    background: "#00060a",
    color: "#d8f8ff",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    overflow: "hidden",
  };
}

function headerStyle(): React.CSSProperties {
  return {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "16px 24px 12px",
    borderBottom: "1px solid rgba(0,212,255,0.15)",
    marginBottom: 14,
  };
}

function mainStyle(): React.CSSProperties {
  return {
    display: "grid",
    gridTemplateColumns: "minmax(260px, 1fr) minmax(420px, 1.6fr) minmax(280px, 1fr)",
    gap: 14,
    padding: "0 24px 14px",
    height: "calc(100vh - 320px)",
    minHeight: 540,
  };
}

function tickerStyle(): React.CSSProperties {
  return {
    background: "linear-gradient(90deg, rgba(0,40,60,0.5), rgba(0,20,40,0.5))",
    borderTop: "1px solid rgba(0,212,255,0.3)",
    borderBottom: "1px solid rgba(0,212,255,0.3)",
    overflow: "hidden",
    margin: "0 24px",
    borderRadius: 6,
  };
}

function tickerInnerStyle(): React.CSSProperties {
  return {
    whiteSpace: "nowrap",
    fontSize: 11,
    color: "#8ffcff",
    padding: "6px 0",
    animation: "ticker 80s linear infinite",
    fontFamily: "ui-monospace, 'SF Mono', Menlo, monospace",
  };
}
