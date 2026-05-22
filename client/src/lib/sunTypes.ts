/**
 * client/src/lib/sunTypes.ts
 *
 * Espelho frontend dos tipos definidos em server/sunPlan.ts. Mantido como
 * arquivo separado para evitar acoplar bundle do cliente ao servidor.
 */

export type SunClass =
  | "MISSAO_ATIVA"
  | "RADAR"
  | "RADAR_CONDICIONADO"
  | "PAUSADA"
  | "DESCARTADA"
  | "DESCARTADA_AGORA";

export interface SunOpportunity {
  nome: string;
  classificacao: SunClass;
  acao: string;
  contexto?: "portfolio" | "smart_city_2036";
}

export interface SunMission {
  id: 1 | 2 | 3;
  nome: string;
  oportunidadesAgrupadas: string[];
  porqueAtivaAgora: string;
  limiteOperacional: string;
  criterios: {
    reduzComplexidade: string;
    reduzFounderOverload: string;
    aumentaConversao: string;
    viraAtivoReutilizavel: string;
    deveExistirAgora: boolean;
  };
}

export interface SunDealRoom {
  id: string;
  nome: string;
  missao: 1 | 2 | 3;
  sponsor: string;
  stakeholders: string;
  status: string;
  risco: string;
  proximoPasso: string;
  owner: string;
  necessidadeDoFounder: string;
}

export interface SunRitual {
  nome: string;
  frequencia: string;
  duracao: string;
  owner: string;
  saidaObrigatoria: string;
}

export interface SunDayAction {
  dia: number;
  acao: string;
  owner: string;
  saida: string;
}

export interface SunRemoveItem {
  remover: string;
  destino: string;
  motivo: string;
}

export interface SunQuickWin {
  titulo: string;
  prazo: string;
  owner: string;
  resultado: string;
  criterio: string;
}

export interface SunSnapshot {
  versao: string;
  geradoEm: string;
  fonte: "blueprint_v1_pdf" | "auto_jarvis";
  comandoFinal: string;
  missoes: SunMission[];
  oportunidades: SunOpportunity[];
  dealRooms: SunDealRoom[];
  rituais: SunRitual[];
  proximos7Dias: SunDayAction[];
  removerDaAgenda: SunRemoveItem[];
  quickWins: SunQuickWin[];
}

export interface SunStats {
  totalOportunidades: number;
  porClassificacao: Record<SunClass, number>;
  totalMissoesAtivas: number;
  totalDealRooms: number;
  totalRituais: number;
}

export interface SunApiResponse {
  snapshot: SunSnapshot;
  stats: SunStats;
}

// ============================================================================
// Helpers visuais — paleta SUN
// ============================================================================

export interface SunClassStyle {
  label: string;
  glow: string;
  text: string;
  bg: string;
  border: string;
}

export const SUN_CLASS_STYLES: Record<SunClass, SunClassStyle> = {
  MISSAO_ATIVA: {
    label: "MISSÃO ATIVA",
    glow: "rgba(0, 255, 170, 0.45)",
    text: "#00ffaa",
    bg: "rgba(0, 80, 60, 0.18)",
    border: "rgba(0, 255, 170, 0.55)",
  },
  RADAR: {
    label: "RADAR",
    glow: "rgba(0, 212, 255, 0.45)",
    text: "#00d4ff",
    bg: "rgba(0, 60, 90, 0.18)",
    border: "rgba(0, 212, 255, 0.55)",
  },
  RADAR_CONDICIONADO: {
    label: "RADAR CONDICIONADO",
    glow: "rgba(140, 230, 255, 0.4)",
    text: "#8ce6ff",
    bg: "rgba(0, 40, 80, 0.18)",
    border: "rgba(140, 230, 255, 0.5)",
  },
  PAUSADA: {
    label: "PAUSADA",
    glow: "rgba(255, 200, 0, 0.4)",
    text: "#ffc800",
    bg: "rgba(60, 50, 0, 0.18)",
    border: "rgba(255, 200, 0, 0.5)",
  },
  DESCARTADA: {
    label: "DESCARTADA",
    glow: "rgba(255, 80, 100, 0.4)",
    text: "#ff5070",
    bg: "rgba(80, 0, 20, 0.18)",
    border: "rgba(255, 80, 100, 0.5)",
  },
  DESCARTADA_AGORA: {
    label: "DESCARTADA AGORA",
    glow: "rgba(255, 120, 60, 0.4)",
    text: "#ff8a40",
    bg: "rgba(80, 30, 0, 0.18)",
    border: "rgba(255, 120, 60, 0.5)",
  },
};

export function styleForClass(c: SunClass): SunClassStyle {
  return SUN_CLASS_STYLES[c];
}
