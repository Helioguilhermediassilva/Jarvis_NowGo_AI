/**
 * client/src/components/cockpit/ImpactDashboard.tsx
 *
 * Dashboard de Impacto — Números que Importam.
 *
 * Seção institucional do Cockpit que consolida os indicadores de impacto
 * global da NowGo Holding (alcance social, energia limpa, M&A, ecossistema)
 * e os reconhecimentos formais da organização.
 *
 * Estética: navy/azul escuro, tipografia Inter, cards premium minimalistas
 * com accent bar luminosa — alinhado ao design system HUD do Cockpit.
 * Responsivo (mobile-first) via grid auto-fit; animação sutil de count-up
 * nos números, respeitando prefers-reduced-motion.
 */

import { useEffect, useRef, useState } from "react";

/* Paleta alinhada aos tokens HUD do cockpit (index.css) */
const C = {
  PANEL: "rgba(2,12,20,0.7)",
  BORDER: "#1a5c7a",
  BORDER_DIM: "#0d3347",
  PRI: "#00d4ff",
  ACC: "#bb88ff",
  ACC2: "#00ffaa",
  WARN: "#ffcc00",
  TXT: "#d8f8ff",
  TXT_DIM: "#5ab8cc",
  TXT_FAINT: "#3a8a9a",
  NAVY: "#0a1628",
};

const INTER =
  "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

interface ImpactMetric {
  /** Valor numérico alvo para o count-up (null = estático) */
  target: number;
  /** Prefixo exibido antes do número (ex.: "US$ ") */
  prefix?: string;
  /** Sufixo exibido após o número (ex.: "M+", " GW") */
  suffix?: string;
  /** Casas decimais do número */
  decimals?: number;
  label: string;
  sub?: string;
  accent: string;
}

const METRICS: ImpactMetric[] = [
  {
    target: 12,
    suffix: "M+",
    label: "Pessoas alcançadas globalmente",
    sub: "alcance cumulativo de programas e plataformas",
    accent: C.PRI,
  },
  {
    target: 1000,
    suffix: "+",
    label: "Vidas de crianças impactadas",
    sub: "projetos sociais estruturados",
    accent: C.ACC2,
  },
  {
    target: 80000,
    suffix: "+",
    label: "Jovens impactados no Brasil",
    sub: "educação, formação e empregabilidade",
    accent: C.PRI,
  },
  {
    target: 15,
    suffix: "+ GW",
    label: "Capacidade em energia limpa",
    sub: "portfólio de projetos de transição energética",
    accent: C.ACC2,
  },
  {
    target: 8.5,
    prefix: "US$ ",
    suffix: "B+",
    decimals: 1,
    label: "Mandatos ativos em M&A",
    sub: "América Latina",
    accent: C.ACC,
  },
  {
    target: 14,
    label: "Universidades africanas parceiras",
    sub: "rede acadêmica continental",
    accent: C.PRI,
  },
  {
    target: 40,
    suffix: "+",
    label: "Parceiros de mídia globais",
    sub: "distribuição e alcance editorial",
    accent: C.WARN,
  },
  {
    target: 100,
    suffix: "+",
    label: "Colaboradores",
    sub: "time multidisciplinar global",
    accent: C.ACC,
  },
];

interface Recognition {
  title: string;
  detail?: string;
  accent: string;
}

const RECOGNITIONS: Recognition[] = [
  {
    title: "Top 50 Global Innovators",
    detail: "COP30 · Gates Foundation · JICA · BCG",
    accent: C.WARN,
  },
  {
    title: "NVIDIA Partner Expert",
    accent: "#76b900",
  },
  {
    title: "GFLM — Brazilian Ambassador & Board Member",
    detail: "Global Financial Literacy Movement",
    accent: C.PRI,
  },
];

/* ------------------------------------------------------------------ */
/* Count-up hook — animação sutil, respeita prefers-reduced-motion     */
/* ------------------------------------------------------------------ */
function useCountUp(target: number, durationMs = 1400): number {
  const [value, setValue] = useState(0);
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setValue(target);
      return;
    }

    let raf = 0;
    const t0 = performance.now();
    const step = (now: number) => {
      const p = Math.min(1, (now - t0) / durationMs);
      // easeOutCubic para desaceleração suave
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(target * eased);
      if (p < 1) raf = requestAnimationFrame(step);
      else setValue(target);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, durationMs]);

  return value;
}

function formatMetric(m: ImpactMetric, current: number): string {
  const decimals = m.decimals ?? 0;
  const num = current.toLocaleString("pt-BR", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  return `${m.prefix ?? ""}${num}${m.suffix ?? ""}`;
}

/* ------------------------------------------------------------------ */
/* Card de indicador                                                   */
/* ------------------------------------------------------------------ */
function MetricCard({
  metric,
  index,
}: {
  metric: ImpactMetric;
  index: number;
}) {
  const current = useCountUp(metric.target);
  return (
    <div
      style={{
        padding: "16px 18px",
        background: C.PANEL,
        border: `1px solid ${C.BORDER_DIM}`,
        borderRadius: 10,
        position: "relative",
        overflow: "hidden",
        animation: `cockpit-card-enter 480ms ease-out both`,
        animationDelay: `${index * 60}ms`,
        transition: "border-color 200ms ease-out, transform 200ms ease-out",
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = metric.accent;
        e.currentTarget.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = C.BORDER_DIM;
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      <div
        aria-hidden
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: 3,
          background: metric.accent,
          boxShadow: `0 0 12px ${metric.accent}`,
        }}
      />
      <div
        style={{
          fontSize: 26,
          color: metric.accent,
          fontWeight: 700,
          letterSpacing: -0.5,
          fontVariantNumeric: "tabular-nums",
          lineHeight: 1.1,
          marginBottom: 6,
        }}
      >
        {formatMetric(metric, current)}
      </div>
      <div
        style={{
          fontSize: 11,
          color: C.TXT,
          fontWeight: 600,
          letterSpacing: 0.3,
          lineHeight: 1.35,
        }}
      >
        {metric.label}
      </div>
      {metric.sub && (
        <div
          style={{
            fontSize: 10,
            color: C.TXT_FAINT,
            marginTop: 4,
            letterSpacing: 0.4,
          }}
        >
          {metric.sub}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Badge de reconhecimento                                             */
/* ------------------------------------------------------------------ */
function RecognitionBadge({ rec }: { rec: Recognition }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "10px 16px",
        background: "rgba(2,12,20,0.55)",
        border: `1px solid ${C.BORDER_DIM}`,
        borderRadius: 999,
        transition: "border-color 200ms ease-out, box-shadow 200ms ease-out",
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = rec.accent;
        e.currentTarget.style.boxShadow = `0 0 16px ${rec.accent}33`;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = C.BORDER_DIM;
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      <span
        aria-hidden
        style={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          background: rec.accent,
          boxShadow: `0 0 8px ${rec.accent}`,
          flexShrink: 0,
        }}
      />
      <div>
        <div
          style={{
            fontSize: 11,
            color: C.TXT,
            fontWeight: 600,
            letterSpacing: 0.4,
            lineHeight: 1.3,
          }}
        >
          {rec.title}
        </div>
        {rec.detail && (
          <div
            style={{
              fontSize: 9,
              color: C.TXT_FAINT,
              letterSpacing: 0.6,
              marginTop: 1,
            }}
          >
            {rec.detail}
          </div>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Seção principal                                                     */
/* ------------------------------------------------------------------ */
export default function ImpactDashboard() {
  return (
    <section
      aria-label="Dashboard de Impacto — Números que Importam"
      style={{
        fontFamily: INTER,
        background: `linear-gradient(180deg, ${C.NAVY}cc 0%, rgba(2,12,20,0.7) 100%)`,
        border: `1px solid ${C.BORDER_DIM}`,
        borderRadius: 12,
        padding: "20px 22px 18px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Glow decorativo de fundo */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: -80,
          right: -60,
          width: 320,
          height: 320,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(0,212,255,0.08) 0%, transparent 65%)",
          pointerEvents: "none",
        }}
      />

      {/* Cabeçalho da seção */}
      <header style={{ marginBottom: 16, position: "relative" }}>
        <div
          style={{
            fontSize: 10,
            color: C.PRI,
            letterSpacing: 2.4,
            textTransform: "uppercase",
            marginBottom: 6,
            fontWeight: 600,
          }}
        >
          Dashboard de Impacto
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 8,
          }}
        >
          <h2
            style={{
              fontSize: 17,
              color: C.TXT,
              fontWeight: 700,
              margin: 0,
              letterSpacing: 0.2,
            }}
          >
            Números que Importam
          </h2>
          <span
            style={{
              fontSize: 10,
              color: C.TXT_FAINT,
              letterSpacing: 1.2,
              textTransform: "uppercase",
            }}
          >
            NowGo Holding · Impacto Global
          </span>
        </div>
      </header>

      {/* Grid responsivo de indicadores (mobile-first, auto-fit) */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 12,
          position: "relative",
        }}
      >
        {METRICS.map((m, i) => (
          <MetricCard key={m.label} metric={m} index={i} />
        ))}
      </div>

      {/* Bloco de reconhecimentos */}
      <div style={{ marginTop: 18, position: "relative" }}>
        <div
          style={{
            fontSize: 9,
            color: C.TXT_FAINT,
            letterSpacing: 2,
            textTransform: "uppercase",
            marginBottom: 10,
          }}
        >
          Reconhecimentos
        </div>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 10,
          }}
        >
          {RECOGNITIONS.map(r => (
            <RecognitionBadge key={r.title} rec={r} />
          ))}
        </div>
      </div>
    </section>
  );
}
