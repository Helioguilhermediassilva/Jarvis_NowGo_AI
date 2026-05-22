/**
 * client/src/pages/Welcome.tsx
 *
 * Landing institucional da NowGo AI Native Company — versão alinhada ao
 * padrão visual de www.nowgoai.com.
 *
 * Linguagem visual:
 *  - Hero: gradiente azul-marinho profundo → teal/verde
 *  - Body: fundo claro azulado com cards brancos
 *  - Tipografia: Fraunces (serif moderna) + Inter (sans)
 *  - Cards com sombra suave, raio grande
 *  - Mobile-first, fluidez tipográfica via clamp()
 *
 * Conteúdo institucional preservado e o login Google restrito permanece
 * como CTA de "Acesso Interno" no header e em seção dedicada.
 */

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";

// ---------------------------------------------------------------------------
// Paleta nowgoai.com
// ---------------------------------------------------------------------------

const C = {
  // Hero
  HERO_FROM: "#0a1f3a",
  HERO_VIA: "#0e3a4a",
  HERO_TO: "#0e6651",
  // Body
  BG_LIGHT: "#f6f8fb",
  BG_LIGHT_2: "#eef3f8",
  CARD: "#ffffff",
  // Texto
  TXT_DARK: "#0f172a",
  TXT_BODY: "#334155",
  TXT_MUTED: "#64748b",
  TXT_INV: "#ffffff",
  TXT_INV_DIM: "rgba(255,255,255,0.78)",
  // Acentos
  PRIMARY: "#0a1f3a", // azul-marinho profundo
  ACCENT: "#22c55e", // verde-esmeralda do título
  ACCENT_2: "#16a34a",
  TAG_BG: "#dcfce7",
  TAG_TXT: "#166534",
  BORDER: "#e2e8f0",
  // Footer
  FOOTER_BG: "#0a1628",
};

// ---------------------------------------------------------------------------
// Hooks de UI
// ---------------------------------------------------------------------------

function useDeniedQuery() {
  const [state] = useState(() => {
    if (typeof window === "undefined")
      return { denied: false, reason: null as string | null, email: null as string | null };
    const p = new URLSearchParams(window.location.search);
    return {
      denied: p.get("denied") === "1",
      reason: p.get("reason"),
      email: p.get("email"),
    };
  });
  return state;
}

// ---------------------------------------------------------------------------
// CSS responsivo injetado uma vez
// ---------------------------------------------------------------------------

const RESPONSIVE_CSS = `
.nowgo-page * { box-sizing: border-box; }
.nowgo-page {
  background: ${C.BG_LIGHT};
  color: ${C.TXT_DARK};
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  -webkit-font-smoothing: antialiased;
  line-height: 1.55;
}
.nowgo-container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 clamp(20px, 4vw, 40px);
}
.nowgo-h1 {
  font-family: 'Fraunces', Georgia, serif;
  font-size: clamp(36px, 6vw, 72px);
  line-height: 1.05;
  letter-spacing: -0.02em;
  font-weight: 600;
  color: ${C.TXT_INV};
  margin: 0;
}
.nowgo-h1-accent {
  color: ${C.ACCENT};
  display: block;
}
.nowgo-h2 {
  font-family: 'Fraunces', Georgia, serif;
  font-size: clamp(28px, 4.5vw, 48px);
  line-height: 1.15;
  letter-spacing: -0.015em;
  font-weight: 600;
  color: ${C.TXT_DARK};
  margin: 0 0 16px;
  text-align: center;
}
.nowgo-h3 {
  font-family: 'Fraunces', Georgia, serif;
  font-size: clamp(20px, 2.4vw, 26px);
  line-height: 1.25;
  font-weight: 600;
  color: ${C.TXT_DARK};
  margin: 0 0 8px;
}
.nowgo-lead {
  font-size: clamp(15px, 1.5vw, 18px);
  color: ${C.TXT_BODY};
  line-height: 1.6;
}
.nowgo-section { padding: clamp(60px, 8vw, 110px) 0; }
.nowgo-grid-3 {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr));
  gap: clamp(16px, 2vw, 28px);
}
.nowgo-grid-2 {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 320px), 1fr));
  gap: clamp(20px, 3vw, 36px);
  align-items: center;
}
.nowgo-card {
  background: ${C.CARD};
  border-radius: 18px;
  padding: clamp(20px, 2.5vw, 32px);
  box-shadow: 0 1px 2px rgba(15,23,42,0.04), 0 4px 16px rgba(15,23,42,0.06);
  transition: transform 200ms cubic-bezier(0.23,1,0.32,1), box-shadow 200ms;
  border: 1px solid ${C.BORDER};
}
.nowgo-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 1px 2px rgba(15,23,42,0.05), 0 12px 32px rgba(15,23,42,0.10);
}
.nowgo-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: linear-gradient(135deg, #eaf3ff 0%, #e0f2ee 100%);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: ${C.PRIMARY};
  margin-bottom: 16px;
  font-size: 22px;
  font-weight: 700;
}
.nowgo-tag {
  display: inline-block;
  background: ${C.TAG_BG};
  color: ${C.TAG_TXT};
  font-size: 12px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 999px;
  margin-right: 6px;
  margin-top: 4px;
  letter-spacing: 0.01em;
}
.nowgo-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-family: 'Inter', sans-serif;
  font-weight: 600;
  font-size: 15px;
  padding: 12px 22px;
  border-radius: 12px;
  border: none;
  cursor: pointer;
  text-decoration: none;
  transition: all 180ms cubic-bezier(0.23,1,0.32,1);
  letter-spacing: 0.005em;
}
.nowgo-btn:active { transform: scale(0.97); }
.nowgo-btn-primary {
  background: ${C.ACCENT};
  color: #ffffff;
}
.nowgo-btn-primary:hover { background: ${C.ACCENT_2}; }
.nowgo-btn-outline {
  background: transparent;
  color: ${C.TXT_INV};
  border: 1.5px solid rgba(255,255,255,0.4);
}
.nowgo-btn-outline:hover {
  background: rgba(255,255,255,0.1);
  border-color: rgba(255,255,255,0.7);
}
.nowgo-btn-light {
  background: #ffffff;
  color: ${C.PRIMARY};
}
.nowgo-btn-light:hover { background: #f1f5f9; }

/* Header */
.nowgo-header {
  position: sticky;
  top: 0;
  z-index: 100;
  width: 100%;
  background: rgba(255,255,255,0.85);
  backdrop-filter: saturate(180%) blur(20px);
  -webkit-backdrop-filter: saturate(180%) blur(20px);
  border-bottom: 1px solid ${C.BORDER};
}
.nowgo-header-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 0;
  gap: 16px;
}
.nowgo-logo {
  font-family: 'Fraunces', Georgia, serif;
  font-size: 22px;
  font-weight: 700;
  color: ${C.PRIMARY};
  letter-spacing: -0.01em;
}
.nowgo-logo-accent { color: ${C.ACCENT}; }
.nowgo-nav {
  display: flex;
  gap: 6px;
  align-items: center;
}
.nowgo-nav a {
  font-size: 14px;
  font-weight: 500;
  color: ${C.TXT_BODY};
  text-decoration: none;
  padding: 8px 12px;
  border-radius: 8px;
  transition: all 140ms ease-out;
}
.nowgo-nav a:hover { color: ${C.PRIMARY}; background: ${C.BG_LIGHT_2}; }

@media (max-width: 760px) {
  .nowgo-nav { display: none; }
}

/* Hero */
.nowgo-hero {
  background:
    radial-gradient(ellipse at 30% 20%, rgba(34,197,94,0.18) 0%, transparent 55%),
    radial-gradient(ellipse at 80% 80%, rgba(59,130,246,0.15) 0%, transparent 55%),
    linear-gradient(135deg, ${C.HERO_FROM} 0%, ${C.HERO_VIA} 50%, ${C.HERO_TO} 100%);
  color: ${C.TXT_INV};
  padding: clamp(72px, 10vw, 140px) 0 clamp(72px, 10vw, 140px);
  position: relative;
  overflow: hidden;
}
.nowgo-hero-inner { text-align: center; max-width: 920px; margin: 0 auto; }
.nowgo-badge {
  display: inline-block;
  background: rgba(255,255,255,0.12);
  border: 1px solid rgba(255,255,255,0.25);
  border-radius: 999px;
  padding: 6px 16px;
  font-size: 13px;
  font-weight: 500;
  color: ${C.TXT_INV};
  margin-bottom: 28px;
  backdrop-filter: blur(8px);
}
.nowgo-hero-cta {
  display: flex;
  gap: 14px;
  justify-content: center;
  flex-wrap: wrap;
  margin-top: 36px;
}

/* Stats bar */
.nowgo-stats {
  background: ${C.CARD};
  padding: clamp(40px, 5vw, 64px) 0;
  border-bottom: 1px solid ${C.BORDER};
}
.nowgo-stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 200px), 1fr));
  gap: clamp(20px, 3vw, 40px);
  text-align: center;
}
.nowgo-stat-num {
  font-family: 'Fraunces', Georgia, serif;
  font-size: clamp(32px, 4.5vw, 52px);
  font-weight: 600;
  color: ${C.PRIMARY};
  line-height: 1;
  margin-bottom: 8px;
  letter-spacing: -0.02em;
}
.nowgo-stat-num.green { color: ${C.ACCENT_2}; }
.nowgo-stat-label {
  font-size: 14px;
  color: ${C.TXT_MUTED};
  font-weight: 500;
}

/* Footer */
.nowgo-footer {
  background: ${C.FOOTER_BG};
  color: rgba(255,255,255,0.75);
  padding: clamp(40px, 5vw, 60px) 0;
}
.nowgo-footer h4 {
  font-size: 14px;
  font-weight: 600;
  color: #ffffff;
  margin: 0 0 12px;
  letter-spacing: 0.02em;
}
.nowgo-footer ul { list-style: none; padding: 0; margin: 0; display: grid; gap: 8px; }
.nowgo-footer a {
  color: rgba(255,255,255,0.7);
  text-decoration: none;
  font-size: 14px;
  transition: color 140ms;
}
.nowgo-footer a:hover { color: ${C.ACCENT}; }
.nowgo-footer-grid {
  display: grid;
  grid-template-columns: 1.4fr repeat(3, 1fr);
  gap: clamp(20px, 3vw, 40px);
}
@media (max-width: 760px) {
  .nowgo-footer-grid { grid-template-columns: 1fr 1fr; }
}

/* Denied banner */
.nowgo-denied {
  background: #fff7ed;
  border-left: 4px solid #f97316;
  padding: 14px 20px;
  margin: 0 0 20px;
  border-radius: 10px;
  color: #7c2d12;
  font-size: 14px;
}
`;

// ---------------------------------------------------------------------------
// Página
// ---------------------------------------------------------------------------

export default function Welcome() {
  const { authenticated, user, loginUrl } = useAuth();
  const denied = useDeniedQuery();

  useEffect(() => {
    document.title = "NowGo AI — AI Native Company para um mundo soberano e humano";
  }, []);

  const handleLogin = () => {
    const target = "/cockpit";
    window.location.href = loginUrl(target);
  };

  return (
    <div className="nowgo-page">
      <style>{RESPONSIVE_CSS}</style>

      {/* HEADER */}
      <header className="nowgo-header">
        <div className="nowgo-container nowgo-header-inner">
          <div className="nowgo-logo">
            NowGo<span className="nowgo-logo-accent">AI</span>
          </div>
          <nav className="nowgo-nav">
            <a href="#missao">Missão</a>
            <a href="#stack">Stack</a>
            <a href="#arquitetura">Arquitetura</a>
            <a href="#ofertas">Soluções</a>
            <a href="#parcerias">Parcerias</a>
            <a href="#acesso">Acesso</a>
          </nav>
          {authenticated ? (
            <button
              className="nowgo-btn nowgo-btn-primary"
              onClick={() => (window.location.href = "/cockpit")}
            >
              Abrir Cockpit
            </button>
          ) : (
            <button
              className="nowgo-btn nowgo-btn-primary"
              onClick={handleLogin}
            >
              Acesso Interno
            </button>
          )}
        </div>
      </header>

      {/* HERO */}
      <section className="nowgo-hero">
        <div className="nowgo-container nowgo-hero-inner">
          <span className="nowgo-badge">
            ★ Official NVIDIA Partner · DPI · JICA · BCG · Top 50 Global
          </span>
          <h1 className="nowgo-h1">
            AI Native Company.
            <span className="nowgo-h1-accent">Soberana e Humana.</span>
          </h1>
          <p
            className="nowgo-lead"
            style={{
              color: C.TXT_INV_DIM,
              maxWidth: 720,
              margin: "28px auto 0",
            }}
          >
            A NowGo AI desenvolve soluções customizadas de Inteligência Artificial
            que capacitam indústrias, cidades e ecossistemas a escalar com
            responsabilidade, eficiência e impacto humano — colocando a tecnologia
            a serviço dos que mais precisam.
          </p>
          <div className="nowgo-hero-cta">
            <button className="nowgo-btn nowgo-btn-primary" onClick={handleLogin}>
              Entrar no Cockpit
            </button>
            <a href="#ofertas" className="nowgo-btn nowgo-btn-outline">
              Conhecer as Soluções
            </a>
          </div>

          {denied.denied && (
            <div className="nowgo-denied" style={{ marginTop: 28, textAlign: "left" }}>
              <strong>Acesso restrito.</strong>{" "}
              {denied.reason === "not_in_whitelist"
                ? `O e-mail ${denied.email ?? ""} não consta na whitelist da NowGo Holding. Solicite acesso ao superadmin (helio@nowgo.com.br).`
                : "Não foi possível concluir o login. Tente novamente em alguns instantes."}
            </div>
          )}
        </div>
      </section>

      {/* STATS */}
      <section className="nowgo-stats">
        <div className="nowgo-container">
          <div className="nowgo-stats-grid">
            <div>
              <div className="nowgo-stat-num">75%</div>
              <div className="nowgo-stat-label">
                das grandes empresas já implementaram IA
              </div>
            </div>
            <div>
              <div className="nowgo-stat-num">USD 2.7T</div>
              <div className="nowgo-stat-label">mercado projetado para 2030</div>
            </div>
            <div>
              <div className="nowgo-stat-num green">Global</div>
              <div className="nowgo-stat-label">presença ativa em escala global</div>
            </div>
          </div>
        </div>
      </section>

      {/* MISSÃO */}
      <section id="missao" className="nowgo-section">
        <div className="nowgo-container" style={{ textAlign: "center", maxWidth: 880 }}>
          <Eyebrow color={C.ACCENT_2}>Nossa Missão</Eyebrow>
          <h2 className="nowgo-h2">
            Servir os mais vulneráveis e os invisíveis.
          </h2>
          <p className="nowgo-lead" style={{ marginTop: 12 }}>
            Acreditamos que a Inteligência Artificial atinge o seu propósito
            mais elevado quando é colocada a serviço dos que historicamente
            ficaram à margem da tecnologia: cidadãos vulneráveis, populações
            invisíveis aos sistemas tradicionais, instituições públicas
            sobrecarregadas e comunidades sem acesso a soluções de classe
            mundial. Construímos a NowGo AI para fechar essa distância.
          </p>
        </div>
      </section>

      {/* STACK */}
      <section
        id="stack"
        className="nowgo-section"
        style={{ background: C.BG_LIGHT_2 }}
      >
        <div className="nowgo-container">
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <Eyebrow color={C.ACCENT_2}>Stack Soberana</Eyebrow>
            <h2 className="nowgo-h2">Software e Hardware sob jurisdição nacional.</h2>
            <p className="nowgo-lead" style={{ maxWidth: 760, margin: "12px auto 0" }}>
              Toda a operação da NowGo AI roda em uma stack soberana — código, dados
              e infraestrutura mantidos sob nossa governança e responsabilidade.
            </p>
          </div>
          <div className="nowgo-grid-3">
            <FeatureCard
              icon="◉"
              title="NowGo Brain"
              text="Núcleo de conhecimento operacional unificado. Toda decisão estratégica é registrada, versionada e auditável."
            />
            <FeatureCard
              icon="⬢"
              title="NowGo Sovereign Stack"
              text="Software e hardware proprietários, sem exposição de fornecedores externos a clientes finais. Soberania total."
            />
            <FeatureCard
              icon="◈"
              title="NowGo Vault"
              text="Armazenamento e versionamento de documentos sensíveis com criptografia ponta-a-ponta e controle granular de acesso."
            />
          </div>
        </div>
      </section>

      {/* ARQUITETURA */}
      <section id="arquitetura" className="nowgo-section">
        <div className="nowgo-container">
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <Eyebrow color={C.ACCENT_2}>Arquitetura de Agentes</Eyebrow>
            <h2 className="nowgo-h2">Topologia A — Jarvis & SUN.</h2>
            <p className="nowgo-lead" style={{ maxWidth: 760, margin: "12px auto 0" }}>
              Dois agentes complementares operam a NowGo Holding em tempo real.
            </p>
          </div>
          <div className="nowgo-grid-2">
            <div className="nowgo-card">
              <div className="nowgo-icon" style={{ background: "linear-gradient(135deg,#eef6ff,#e0f2ff)" }}>
                J
              </div>
              <h3 className="nowgo-h3">Jarvis</h3>
              <p style={{ color: C.TXT_BODY, margin: 0 }}>
                Copiloto conversacional do founder. Lê, escreve e atualiza o NowGo
                Brain em linguagem natural, gera documentos comerciais por voz e
                preserva contexto longitudinal das decisões estratégicas.
              </p>
            </div>
            <div className="nowgo-card">
              <div className="nowgo-icon" style={{ background: "linear-gradient(135deg,#fef3e2,#ffe9d2)" }}>
                ☀
              </div>
              <h3 className="nowgo-h3">SUN</h3>
              <p style={{ color: C.TXT_BODY, margin: 0 }}>
                Plano operacional vivo. Mantém apenas três missões ativas (regra
                3+1) e executa tarefas longas em background, devolvendo o
                resultado ao Jarvis e ao Brain quando concluídas.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* OFERTAS */}
      <section
        id="ofertas"
        className="nowgo-section"
        style={{ background: C.BG_LIGHT_2 }}
      >
        <div className="nowgo-container">
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <Eyebrow color={C.ACCENT_2}>Soluções Globais</Eyebrow>
            <h2 className="nowgo-h2">Três ofertas. Um propósito.</h2>
            <p className="nowgo-lead" style={{ maxWidth: 760, margin: "12px auto 0" }}>
              Personalizadas, soberanas e sustentáveis — desenhadas para
              transformar indústrias, cidades e ecossistemas.
            </p>
          </div>
          <div className="nowgo-grid-3">
            <OfferCard
              icon="🏛"
              title="NowGo Cities"
              tags={["Smart Cities", "Setor Público"]}
              text="Plataforma de gestão urbana inteligente para administrações municipais, estaduais e nacionais. Integra dados da cidade, dos cidadãos e dos serviços públicos para decisão em tempo real."
            />
            <OfferCard
              icon="⚙"
              title="NowGo Enterprise"
              tags={["Custom LLMs", "Tailored IaaS"]}
              text="LLMs personalizados, infraestrutura sob medida e agentes autônomos integrados aos processos de grandes empresas. Compliance regulatório e escalabilidade automática de origem."
            />
            <OfferCard
              icon="✦"
              title="NowGo Modules"
              tags={["AI Hospital", "AI Schools", "AgriAI"]}
              text="Módulos especializados — saúde 100% AI, escolas com aprendizagem adaptativa, agricultura de precisão, monitoramento ambiental e estúdios criativos com IA."
            />
          </div>
        </div>
      </section>

      {/* AI NATIVE */}
      <section className="nowgo-section">
        <div className="nowgo-container" style={{ textAlign: "center", maxWidth: 880 }}>
          <Eyebrow color={C.ACCENT_2}>Como Operamos</Eyebrow>
          <h2 className="nowgo-h2">Somos uma AI Native Company.</h2>
          <p className="nowgo-lead" style={{ marginTop: 12 }}>
            Não usamos IA como ferramenta acessória — é a espinha dorsal da
            empresa. Cada decisão, documento, follow-up e proposta passa pelo
            Brain antes de virar ação. O resultado é uma operação enxuta,
            auditável e capaz de escalar com poucas pessoas e altíssima
            densidade de impacto.
          </p>
        </div>
      </section>

      {/* PARCERIAS */}
      <section
        id="parcerias"
        className="nowgo-section"
        style={{ background: C.BG_LIGHT_2 }}
      >
        <div className="nowgo-container">
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <Eyebrow color={C.ACCENT_2}>Parcerias e Reconhecimentos</Eyebrow>
            <h2 className="nowgo-h2">Construímos com quem lidera o mundo.</h2>
          </div>
          <div className="nowgo-grid-3">
            <FeatureCard icon="★" title="NVIDIA Partner Expert" text="Parceria oficial com a líder global em computação acelerada para IA." />
            <FeatureCard icon="◆" title="DPI · JICA" text="Aliança com Digital Public Infrastructure e Japan International Cooperation Agency." />
            <FeatureCard icon="●" title="BCG · Gates" text="Colaboração estratégica com Boston Consulting Group e iniciativas Gates Foundation." />
            <FeatureCard icon="✦" title="Top 50 Global" text="Reconhecida entre as 50 empresas globais mais relevantes em IA aplicada." />
            <FeatureCard icon="◉" title="Inovaskill · Jacto" text="Programas de capacitação executados em parceria com grupos industriais brasileiros." />
            <FeatureCard icon="◈" title="Bluefields · Mentto" text="Mentoria e aceleração de startups com foco em IA aplicada." />
          </div>
        </div>
      </section>

      {/* SOBERANIA */}
      <section className="nowgo-section">
        <div className="nowgo-container" style={{ textAlign: "center", maxWidth: 880 }}>
          <Eyebrow color={C.ACCENT_2}>Soberania Nacional</Eyebrow>
          <h2 className="nowgo-h2">Dados e código sob jurisdição brasileira.</h2>
          <p className="nowgo-lead" style={{ marginTop: 12 }}>
            Em um momento histórico onde dados são ativo estratégico, a NowGo AI
            se posiciona como plataforma soberana — código próprio, governança
            local e infraestrutura sob nossa responsabilidade direta. Trabalhamos
            para que governos e empresas brasileiras tenham acesso à classe
            mundial em IA sem abrir mão da soberania nacional.
          </p>
        </div>
      </section>

      {/* ACESSO INTERNO */}
      <section
        id="acesso"
        className="nowgo-section"
        style={{
          background:
            `linear-gradient(135deg, ${C.HERO_FROM} 0%, ${C.HERO_VIA} 100%)`,
          color: C.TXT_INV,
        }}
      >
        <div className="nowgo-container" style={{ textAlign: "center", maxWidth: 720 }}>
          <Eyebrow color={C.ACCENT}>Acesso Interno</Eyebrow>
          <h2 className="nowgo-h2" style={{ color: C.TXT_INV }}>
            Cockpit operacional restrito.
          </h2>
          <p className="nowgo-lead" style={{ color: C.TXT_INV_DIM, marginTop: 12 }}>
            Pelo alto volume de informações sensíveis e pela responsabilidade da
            inteligência artificial nas decisões da Holding, o acesso ao
            cockpit é restrito a integrantes autorizados da NowGo Holding.
          </p>
          <div style={{ marginTop: 36 }}>
            {authenticated && user ? (
              <div>
                <p style={{ color: C.TXT_INV_DIM, marginBottom: 16 }}>
                  Logado como <strong style={{ color: C.TXT_INV }}>{user.email}</strong>
                </p>
                <button
                  className="nowgo-btn nowgo-btn-light"
                  onClick={() => (window.location.href = "/cockpit")}
                >
                  Abrir Cockpit
                </button>
              </div>
            ) : (
              <button className="nowgo-btn nowgo-btn-primary" onClick={handleLogin}>
                Entrar com Google
              </button>
            )}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="nowgo-footer">
        <div className="nowgo-container">
          <div className="nowgo-footer-grid">
            <div>
              <div className="nowgo-logo" style={{ color: "#ffffff" }}>
                NowGo<span className="nowgo-logo-accent">AI</span>
              </div>
              <p style={{ marginTop: 12, fontSize: 14, lineHeight: 1.6 }}>
                Transformando o futuro através da inteligência artificial
                empresarial soberana e humana.
              </p>
            </div>
            <div>
              <h4>Soluções</h4>
              <ul>
                <li><a href="#ofertas">NowGo Cities</a></li>
                <li><a href="#ofertas">NowGo Enterprise</a></li>
                <li><a href="#ofertas">NowGo Modules</a></li>
              </ul>
            </div>
            <div>
              <h4>Empresa</h4>
              <ul>
                <li><a href="#missao">Missão</a></li>
                <li><a href="#stack">Stack</a></li>
                <li><a href="#parcerias">Parcerias</a></li>
              </ul>
            </div>
            <div>
              <h4>Contato</h4>
              <ul>
                <li><a href="mailto:helio@nowgo.com.br">helio@nowgo.com.br</a></li>
                <li><a href="https://www.nowgoai.com" target="_blank" rel="noreferrer">www.nowgoai.com</a></li>
              </ul>
            </div>
          </div>
          <div
            style={{
              marginTop: 40,
              paddingTop: 24,
              borderTop: "1px solid rgba(255,255,255,0.1)",
              fontSize: 13,
              color: "rgba(255,255,255,0.5)",
              textAlign: "center",
            }}
          >
            © {new Date().getFullYear()} NowGo AI · NowGo Holding · Todos os direitos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-componentes
// ---------------------------------------------------------------------------

function Eyebrow({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <div
      style={{
        color,
        fontSize: 12,
        fontWeight: 700,
        letterSpacing: "0.18em",
        textTransform: "uppercase",
        marginBottom: 14,
      }}
    >
      {children}
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  text,
}: {
  icon: string;
  title: string;
  text: string;
}) {
  return (
    <div className="nowgo-card">
      <div className="nowgo-icon">{icon}</div>
      <h3 className="nowgo-h3">{title}</h3>
      <p style={{ color: C.TXT_BODY, margin: 0 }}>{text}</p>
    </div>
  );
}

function OfferCard({
  icon,
  title,
  tags,
  text,
}: {
  icon: string;
  title: string;
  tags: string[];
  text: string;
}) {
  return (
    <div className="nowgo-card">
      <div className="nowgo-icon">{icon}</div>
      <h3 className="nowgo-h3">{title}</h3>
      <p style={{ color: C.TXT_BODY, margin: "0 0 12px" }}>{text}</p>
      <div>
        {tags.map((t) => (
          <span key={t} className="nowgo-tag">{t}</span>
        ))}
      </div>
    </div>
  );
}
