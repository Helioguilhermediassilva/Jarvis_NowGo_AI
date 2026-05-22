/**
 * client/src/pages/Welcome.tsx
 *
 * Landing institucional da NowGo AI Native Company.
 * Narrativa encadeada: missão social → demanda → plataforma própria →
 * stack soberana → arquitetura de agentes → AI Native operação →
 * parcerias e reconhecimentos → soberania → 3 ofertas → acesso interno.
 *
 * Sem revelar fornecedores externos. Sem revelar clientes específicos.
 * Login restrito ao superadmin nesta primeira fase.
 */

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/hooks/useAuth";

const C = {
  BG: "#00060a",
  PANEL: "#020c14",
  BORDER_DIM: "#0d3347",
  BORDER: "#1a5c7a",
  TXT: "#d8f8ff",
  TXT_DIM: "#5ab8cc",
  TXT_FAINT: "#3a8a9a",
  PRI: "#00d4ff",
  ACC: "#bb88ff",
  ACC2: "#00ffaa",
};

function useDeniedQuery(): { denied: boolean; reason: string | null; email: string | null } {
  const [state] = useState(() => {
    if (typeof window === "undefined")
      return { denied: false, reason: null, email: null };
    const p = new URLSearchParams(window.location.search);
    return {
      denied: p.get("denied") === "1",
      reason: p.get("reason"),
      email: p.get("email"),
    };
  });
  return state;
}

function Section({
  id,
  eyebrow,
  title,
  children,
  accent = C.PRI,
}: {
  id: string;
  eyebrow: string;
  title: string;
  children: React.ReactNode;
  accent?: string;
}) {
  return (
    <section
      id={id}
      style={{
        padding: "120px 0",
        position: "relative",
        borderTop: `1px solid ${C.BORDER_DIM}`,
      }}
    >
      <div className="container" style={{ maxWidth: 1180 }}>
        <div
          style={{
            color: accent,
            fontSize: 11,
            letterSpacing: 4,
            textTransform: "uppercase",
            fontWeight: 700,
            marginBottom: 16,
          }}
        >
          {eyebrow}
        </div>
        <h2
          style={{
            fontSize: 44,
            lineHeight: 1.15,
            fontWeight: 600,
            color: C.TXT,
            margin: 0,
            marginBottom: 28,
            letterSpacing: "-0.01em",
            maxWidth: 820,
          }}
        >
          {title}
        </h2>
        <div style={{ color: C.TXT_DIM, fontSize: 17, lineHeight: 1.75 }}>
          {children}
        </div>
      </div>
    </section>
  );
}

function GlowOrb({
  color,
  size = 600,
  top,
  left,
  right,
  bottom,
  opacity = 0.5,
}: {
  color: string;
  size?: number;
  top?: number | string;
  left?: number | string;
  right?: number | string;
  bottom?: number | string;
  opacity?: number;
}) {
  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        width: size,
        height: size,
        top,
        left,
        right,
        bottom,
        background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
        opacity,
        pointerEvents: "none",
        filter: "blur(40px)",
      }}
    />
  );
}

export default function Welcome() {
  const { authenticated, loading, user, loginUrl } = useAuth();
  const denied = useDeniedQuery();

  // Quando autenticado, redireciona para o cockpit automaticamente
  useEffect(() => {
    if (!loading && authenticated) {
      window.location.href = "/cockpit";
    }
  }, [loading, authenticated]);

  const deniedBanner = useMemo(() => {
    if (!denied.denied) return null;
    let msg = "Acesso negado.";
    if (denied.reason === "not_whitelisted") {
      msg = denied.email
        ? `O e-mail ${denied.email} não está autorizado a acessar este cockpit.`
        : "Este e-mail não está autorizado a acessar o cockpit interno.";
    } else if (denied.reason === "oauth_error") {
      msg = "O Google retornou um erro durante a autenticação.";
    } else if (denied.reason === "missing_params") {
      msg = "Parâmetros de autenticação ausentes.";
    } else if (denied.reason === "bad_state") {
      msg = "A sessão de login expirou. Tente novamente.";
    } else if (denied.reason === "server_error") {
      msg = "Falha interna durante a autenticação.";
    }
    return msg;
  }, [denied]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: C.BG,
        color: C.TXT,
        fontFamily:
          "'Inter', -apple-system, BlinkMacSystemFont, system-ui, sans-serif",
        overflowX: "hidden",
      }}
    >
      {/* TOP NAV */}
      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          background: "rgba(0,6,10,0.78)",
          backdropFilter: "blur(20px)",
          borderBottom: `1px solid ${C.BORDER_DIM}`,
        }}
      >
        <div
          className="container"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 32px",
            maxWidth: 1280,
            margin: "0 auto",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              fontWeight: 700,
              letterSpacing: 4,
              fontSize: 14,
              color: C.TXT,
            }}
          >
            <span
              style={{
                width: 24,
                height: 24,
                borderRadius: 6,
                background: `linear-gradient(135deg, ${C.PRI}, ${C.ACC})`,
                boxShadow: `0 0 20px ${C.PRI}80`,
              }}
            />
            NOWGO AI
          </div>
          <div style={{ display: "flex", gap: 28, alignItems: "center" }}>
            <NavLink href="#missao">Missão</NavLink>
            <NavLink href="#stack">Stack</NavLink>
            <NavLink href="#arquitetura">Arquitetura</NavLink>
            <NavLink href="#ofertas">Ofertas</NavLink>
            <a
              href={loginUrl("/cockpit")}
              style={{
                background: `linear-gradient(135deg, ${C.PRI}, ${C.ACC})`,
                color: C.BG,
                padding: "10px 22px",
                borderRadius: 8,
                fontWeight: 700,
                fontSize: 13,
                letterSpacing: 1.2,
                textDecoration: "none",
                boxShadow: `0 0 24px ${C.PRI}50`,
                transition: "all 200ms cubic-bezier(0.23, 1, 0.32, 1)",
              }}
            >
              ACESSO INTERNO
            </a>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <header
        style={{
          position: "relative",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          padding: "80px 0",
          overflow: "hidden",
        }}
      >
        <GlowOrb color={C.PRI} size={900} top={-200} left={-200} opacity={0.18} />
        <GlowOrb color={C.ACC} size={700} bottom={-100} right={-100} opacity={0.16} />
        <GlowOrb color={C.ACC2} size={500} top={"40%"} right={"20%"} opacity={0.08} />

        {/* Grid sutil */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `linear-gradient(rgba(0,212,255,0.04) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(0,212,255,0.04) 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
            maskImage:
              "radial-gradient(ellipse at center, black 30%, transparent 75%)",
          }}
        />

        <div
          className="container"
          style={{
            maxWidth: 1180,
            position: "relative",
            zIndex: 2,
          }}
        >
          {deniedBanner && (
            <div
              role="alert"
              style={{
                background: "rgba(255,80,100,0.1)",
                border: "1px solid rgba(255,80,100,0.4)",
                padding: "14px 20px",
                borderRadius: 10,
                marginBottom: 32,
                color: "#ff8090",
                fontSize: 14,
                maxWidth: 720,
              }}
            >
              <strong style={{ color: "#ffb0bc" }}>Acesso restrito:</strong>{" "}
              {deniedBanner} Este cockpit está disponível apenas para a
              equipe interna autorizada da NowGo Holding.
            </div>
          )}

          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              padding: "8px 16px",
              borderRadius: 999,
              border: `1px solid ${C.BORDER}`,
              background: "rgba(0,40,60,0.4)",
              color: C.PRI,
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: 3,
              marginBottom: 32,
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: 999,
                background: C.ACC2,
                boxShadow: `0 0 12px ${C.ACC2}`,
              }}
            />
            AI NATIVE COMPANY · BRASÍLIA, BRASIL
          </div>

          <h1
            style={{
              fontSize: "clamp(48px, 7vw, 92px)",
              lineHeight: 1.05,
              fontWeight: 600,
              margin: 0,
              marginBottom: 32,
              letterSpacing: "-0.02em",
              maxWidth: 1100,
            }}
          >
            Inteligência soberana
            <br />
            para um mundo{" "}
            <span
              style={{
                background: `linear-gradient(135deg, ${C.PRI}, ${C.ACC})`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              mais humano.
            </span>
          </h1>

          <p
            style={{
              fontSize: 22,
              lineHeight: 1.55,
              color: C.TXT_DIM,
              margin: 0,
              maxWidth: 760,
              marginBottom: 48,
            }}
          >
            A NowGo AI nasceu para servir os mais vulneráveis e invisíveis. A
            força da demanda nos levou a construir nossa própria plataforma
            operacional — soberana em dados, soberana em decisão, soberana em
            propósito.
          </p>

          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            <a
              href="#missao"
              style={{
                background: "transparent",
                color: C.TXT,
                padding: "16px 28px",
                borderRadius: 10,
                fontWeight: 700,
                fontSize: 14,
                letterSpacing: 1.5,
                textDecoration: "none",
                border: `1px solid ${C.BORDER}`,
                transition: "all 200ms cubic-bezier(0.23, 1, 0.32, 1)",
              }}
            >
              CONHECER A NOWGO
            </a>
            <a
              href="#ofertas"
              style={{
                background: `linear-gradient(135deg, ${C.PRI}, ${C.ACC})`,
                color: C.BG,
                padding: "16px 28px",
                borderRadius: 10,
                fontWeight: 700,
                fontSize: 14,
                letterSpacing: 1.5,
                textDecoration: "none",
                boxShadow: `0 0 32px ${C.PRI}50`,
                transition: "all 200ms cubic-bezier(0.23, 1, 0.32, 1)",
              }}
            >
              VER A PLATAFORMA →
            </a>
          </div>

          {/* Selos / Reconhecimentos compactos */}
          <div
            style={{
              marginTop: 80,
              display: "flex",
              flexWrap: "wrap",
              gap: 32,
              alignItems: "center",
              opacity: 0.7,
            }}
          >
            <span style={{ fontSize: 11, color: C.TXT_FAINT, letterSpacing: 2 }}>
              RECONHECIMENTOS
            </span>
            <Pill text="NVIDIA Partner Expert" />
            <Pill text="Top 50 Global" />
            <Pill text="DPI" />
            <Pill text="JICA" />
            <Pill text="BCG" />
            <Pill text="Bill & Melinda Gates Foundation" />
          </div>
        </div>
      </header>

      {/* MISSÃO */}
      <Section
        id="missao"
        eyebrow="A Missão"
        title="Servir os mais vulneráveis e invisíveis. Antes de qualquer outra coisa."
        accent={C.ACC2}
      >
        <p>
          A inteligência artificial está redesenhando o mundo. A pergunta
          honesta é: <strong style={{ color: C.TXT }}>para quem</strong>?
          Acreditamos que o primeiro a ser servido por uma tecnologia desta
          magnitude precisa ser quem o sistema costuma esquecer — pacientes
          sem prontuário, cidadãos sem voz, comunidades sem dado.
        </p>
        <p style={{ marginTop: 24 }}>
          Nossa missão é colocar a IA a serviço dessa humanidade invisível,
          começando pela saúde pública, gestão urbana, segurança alimentar e
          inclusão social. Tudo o que construímos parte daí — e volta para
          isso.
        </p>
      </Section>

      {/* ORIGEM E DEMANDA */}
      <Section
        id="origem"
        eyebrow="A Origem"
        title="A demanda nos forçou a construir nossa própria plataforma operacional."
      >
        <p>
          Desde o início, a NowGo opera na fronteira da IA aplicada a desafios
          humanos. À medida que o impacto cresceu, percebemos que as
          plataformas disponíveis no mercado não atendiam ao nível de
          governança, soberania e velocidade que nossas missões exigiam.
        </p>
        <p style={{ marginTop: 24 }}>
          A escolha foi inevitável:{" "}
          <strong style={{ color: C.TXT }}>
            construir uma plataforma operacional própria
          </strong>{" "}
          — desenhada para sustentar a operação interna da empresa e,
          simultaneamente, ser entregue como produto soberano para cidades,
          governos e organizações que enfrentam a mesma exigência.
        </p>
      </Section>

      {/* STACK SOBERANA */}
      <Section
        id="stack"
        eyebrow="A Stack"
        title="Sovereign Stack — software e hardware desenhados para autonomia operacional."
        accent={C.ACC}
      >
        <p>
          A <strong style={{ color: C.TXT }}>NowGo Sovereign Stack</strong> é o
          conjunto de capacidades que sustenta toda a nossa operação interna e
          alimenta as soluções entregues a parceiros estratégicos. É um
          ecossistema desenhado para reduzir dependência externa em camadas
          críticas — sem comprometer performance.
        </p>

        <div
          style={{
            marginTop: 48,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 16,
          }}
        >
          <StackCard
            title="NowGo Brain"
            desc="Memória corporativa com persistência soberana e indexação semântica de oportunidades, atas, contratos e decisões."
          />
          <StackCard
            title="NowGo Cognition"
            desc="Camada de raciocínio multi-modelo com roteamento por capacidade e custo, mantida sob jurisdição soberana."
          />
          <StackCard
            title="NowGo Voice"
            desc="Voz clonada do líder operacional + síntese ultra-baixa latência para conversas naturais com o agente."
          />
          <StackCard
            title="NowGo Vault"
            desc="Camada documental cifrada para apresentações, propostas, contratos e ativos sensíveis."
          />
          <StackCard
            title="NowGo Jarvis"
            desc="Cockpit conversacional síncrono — o copiloto operacional do founder e do time executivo."
          />
          <StackCard
            title="NowGo SUN"
            desc="Executor assíncrono para missões longas em background — pesquisa, geração de documentos, automações."
          />
        </div>

        <div
          style={{
            marginTop: 64,
            padding: 32,
            borderRadius: 14,
            border: `1px solid ${C.BORDER}`,
            background:
              "linear-gradient(135deg, rgba(0,40,60,0.4), rgba(40,20,70,0.3))",
          }}
        >
          <div
            style={{
              fontSize: 11,
              letterSpacing: 3,
              color: C.ACC,
              fontWeight: 700,
              marginBottom: 12,
            }}
          >
            CAMADA DE INFRAESTRUTURA
          </div>
          <h3 style={{ fontSize: 28, margin: 0, marginBottom: 16, color: C.TXT, fontWeight: 600 }}>
            Hardware estratégico em parceria de classe mundial
          </h3>
          <p style={{ color: C.TXT_DIM, fontSize: 16, lineHeight: 1.7, margin: 0 }}>
            Operamos sobre infraestrutura de computação acelerada de última
            geração, viabilizada por nossa parceria estratégica como{" "}
            <strong style={{ color: C.TXT }}>NVIDIA Partner Expert</strong>.
            A combinação de modelos pré-treinados em larga escala com
            inferência local de alto desempenho viabiliza soluções
            embarcadas para cenários onde latência, sigilo e soberania de
            dados são inegociáveis.
          </p>
        </div>
      </Section>

      {/* ARQUITETURA DE AGENTES */}
      <Section
        id="arquitetura"
        eyebrow="A Arquitetura"
        title="Topologia A — Jarvis síncrono, SUN assíncrono. Coordenados por uma memória única."
      >
        <p>
          Nossa arquitetura de agentes é deliberadamente simples e
          auditável. Dois papéis primários trabalham em coordenação:
        </p>

        <div
          style={{
            marginTop: 40,
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 24,
          }}
        >
          <AgentCard
            color={C.PRI}
            title="JARVIS"
            role="Agente síncrono · diálogo em tempo real"
            desc="Conversa por voz e texto, executa ações no Brain via tools, gera documentos sob comando, aciona pesquisa externa, opera o cockpit."
            bullets={[
              "Voz clonada do líder",
              "Tools de leitura e escrita no Brain",
              "Geração de documentos por comando de voz",
              "Acionamento direto do SUN para tarefas longas",
            ]}
          />
          <AgentCard
            color={C.ACC}
            title="SUN"
            role="Agente assíncrono · executor de missões longas"
            desc="Recebe missões do Jarvis, opera em background, conduz pesquisas profundas, monta artefatos complexos e devolve resultados ao Brain."
            bullets={[
              "Execução paralela de missões",
              "Pesquisa multimodal em fontes confiáveis",
              "Geração de relatórios e apresentações de fôlego",
              "Persistência soberana dos resultados",
            ]}
          />
        </div>

        <p style={{ marginTop: 40 }}>
          Ambos compartilham o <strong style={{ color: C.TXT }}>NowGo Brain</strong>{" "}
          como fonte única de verdade. O resultado é uma operação onde nada se
          perde, nada precisa ser repetido, e cada decisão fica registrada
          junto do contexto que a originou.
        </p>
      </Section>

      {/* AI NATIVE COMPANY */}
      <Section
        id="ai-native"
        eyebrow="O Modelo Operacional"
        title="Operamos como uma AI Native Company — ponta a ponta."
        accent={C.ACC2}
      >
        <p>
          Não usamos IA como ferramenta. Operamos a empresa <em>através</em> da
          IA. O cockpit é o sistema operacional de fato da NowGo — pipeline,
          decisões estratégicas, geração de propostas, follow-ups, atas e
          execução acontecem dentro dele.
        </p>

        <div
          style={{
            marginTop: 48,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: 16,
          }}
        >
          <PrincipleCard
            num="01"
            title="Cada decisão registra contexto"
            desc="Nada se perde entre reuniões. Tudo vira memória ativa da empresa."
          />
          <PrincipleCard
            num="02"
            title="Agentes amplificam pessoas"
            desc="O time humano cuida do julgamento estratégico. Os agentes cuidam da execução repetível."
          />
          <PrincipleCard
            num="03"
            title="Founder não é gargalo"
            desc="O Jarvis assume a continuidade operacional 24/7 — sem descanso, sem esquecimento."
          />
          <PrincipleCard
            num="04"
            title="Auditabilidade por design"
            desc="Toda mutação no Brain registra autor, contexto e horário. Soberania é também transparência."
          />
        </div>
      </Section>

      {/* PARCERIAS */}
      <Section
        id="parcerias"
        eyebrow="Parcerias e Reconhecimentos"
        title="Construímos com quem está moldando o futuro responsável da IA."
      >
        <p style={{ marginBottom: 32 }}>
          Mantemos parcerias técnicas e institucionais com organizações de
          referência global em infraestrutura de IA, desenvolvimento
          internacional e pesquisa sobre o impacto humano da tecnologia.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 16,
            marginTop: 24,
          }}
        >
          <PartnerCard title="NVIDIA Partner Expert" desc="Parceria estratégica em infraestrutura acelerada." />
          <PartnerCard title="DPI" desc="Reconhecimento internacional pelo impacto." />
          <PartnerCard title="JICA" desc="Cooperação em desenvolvimento internacional." />
          <PartnerCard title="BCG" desc="Validação estratégica de impacto." />
          <PartnerCard title="Bill & Melinda Gates Foundation" desc="Reconhecimento NowGo AI Top 50 Global." />
          <PartnerCard title="Top 50 Global Seal" desc="Selo concedido por consórcio internacional de impacto." />
        </div>
      </Section>

      {/* SOBERANIA */}
      <Section
        id="soberania"
        eyebrow="A Soberania"
        title="Dados, modelo e código sob jurisdição que protege quem é servido."
        accent={C.ACC}
      >
        <p>
          Soberania, para a NowGo, não é um discurso — é uma decisão de
          arquitetura. Para nossos clientes institucionais e para o setor
          público, isso significa:
        </p>

        <ul
          style={{
            marginTop: 32,
            paddingLeft: 0,
            listStyle: "none",
            display: "grid",
            gap: 18,
          }}
        >
          <SovBullet text="Dados críticos não circulam por nuvens públicas de hyperscalers estrangeiros sem consentimento explícito do contratante." />
          <SovBullet text="Modelos podem operar localmente, em infraestrutura embarcada, quando a sensibilidade do caso exigir." />
          <SovBullet text="Toda mutação na memória corporativa é auditável — autor, horário, contexto e resultado preservados." />
          <SovBullet text="Posicionamento claro frente à proteção de propriedade intelectual e à conformidade regulatória do setor público brasileiro." />
        </ul>

        <p style={{ marginTop: 40 }}>
          Soberania nacional, neste contexto, não é nostalgia — é{" "}
          <strong style={{ color: C.TXT }}>condição estratégica</strong>. Em
          IA, quem perde controle sobre dado, modelo e infraestrutura perde
          também a autonomia para decidir o próprio futuro.
        </p>
      </Section>

      {/* OFERTAS */}
      <section
        id="ofertas"
        style={{
          padding: "120px 0",
          position: "relative",
          borderTop: `1px solid ${C.BORDER_DIM}`,
          background:
            "linear-gradient(180deg, transparent, rgba(0,30,50,0.4), transparent)",
        }}
      >
        <GlowOrb color={C.PRI} size={500} top={"30%"} left={"-10%"} opacity={0.12} />
        <GlowOrb color={C.ACC} size={500} bottom={"10%"} right={"-10%"} opacity={0.12} />

        <div className="container" style={{ maxWidth: 1180 }}>
          <div
            style={{
              color: C.PRI,
              fontSize: 11,
              letterSpacing: 4,
              textTransform: "uppercase",
              fontWeight: 700,
              marginBottom: 16,
            }}
          >
            A Oferta
          </div>
          <h2
            style={{
              fontSize: 44,
              lineHeight: 1.15,
              fontWeight: 600,
              color: C.TXT,
              margin: 0,
              marginBottom: 60,
              letterSpacing: "-0.01em",
              maxWidth: 820,
            }}
          >
            Três caminhos para acessar a NowGo Sovereign Stack.
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              gap: 24,
            }}
          >
            <OfferCard
              accent={C.PRI}
              tag="01 · Setor Público"
              title="NowGo Cities"
              subtitle="Plataforma operacional para cidades inteligentes e órgãos de governo."
              points={[
                "Cockpit executivo para gestores públicos",
                "Indicadores de impacto em tempo real",
                "Integração com bases públicas oficiais",
                "Conformidade regulatória e soberania de dados",
              ]}
            />
            <OfferCard
              accent={C.ACC2}
              tag="02 · Grandes Empresas"
              title="NowGo Enterprise"
              subtitle="Cockpit operacional para holdings, grupos e corporações de alta sensibilidade."
              points={[
                "Pipeline executivo unificado",
                "Geração de propostas, contratos e decks por voz",
                "Memória corporativa soberana e auditável",
                "Implantação dedicada e personalizada",
              ]}
            />
            <OfferCard
              accent={C.ACC}
              tag="03 · Modular"
              title="NowGo Modules"
              subtitle="Capacidades modulares da Stack disponíveis isoladamente para necessidades específicas."
              points={[
                "Módulos Brain, Voice, Vault, Jarvis e SUN sob medida",
                "Implantação em sistemas legados",
                "Integração com workflows existentes",
                "Modelo flexível e escalável",
              ]}
            />
          </div>
        </div>
      </section>

      {/* ACESSO INTERNO */}
      <section
        id="acesso"
        style={{
          padding: "120px 0",
          position: "relative",
          borderTop: `1px solid ${C.BORDER_DIM}`,
        }}
      >
        <GlowOrb color={C.PRI} size={700} top={"50%"} left={"50%"} opacity={0.06} />

        <div
          className="container"
          style={{
            maxWidth: 760,
            textAlign: "center",
            position: "relative",
            zIndex: 2,
          }}
        >
          <div
            style={{
              color: C.ACC,
              fontSize: 11,
              letterSpacing: 4,
              textTransform: "uppercase",
              fontWeight: 700,
              marginBottom: 16,
            }}
          >
            Acesso Interno
          </div>
          <h2
            style={{
              fontSize: 44,
              lineHeight: 1.15,
              fontWeight: 600,
              color: C.TXT,
              margin: 0,
              marginBottom: 28,
              letterSpacing: "-0.01em",
            }}
          >
            Cockpit operacional NowGo Holding.
          </h2>
          <p
            style={{
              fontSize: 18,
              lineHeight: 1.7,
              color: C.TXT_DIM,
              margin: 0,
              marginBottom: 40,
            }}
          >
            Por questões de soberania de dados, alta sensibilidade do setor
            de IA e pelo volume de negociações em curso, o cockpit operacional
            da NowGo Holding é restrito ao time interno autorizado.
          </p>

          {loading ? (
            <div style={{ color: C.TXT_FAINT, fontSize: 14 }}>
              Verificando sessão…
            </div>
          ) : authenticated && user ? (
            <div
              style={{
                display: "inline-flex",
                flexDirection: "column",
                gap: 16,
                alignItems: "center",
              }}
            >
              <div style={{ color: C.TXT_DIM, fontSize: 14 }}>
                Conectado como{" "}
                <strong style={{ color: C.TXT }}>{user.email}</strong>
              </div>
              <a
                href="/cockpit"
                style={{
                  background: `linear-gradient(135deg, ${C.PRI}, ${C.ACC})`,
                  color: C.BG,
                  padding: "18px 40px",
                  borderRadius: 12,
                  fontWeight: 700,
                  fontSize: 15,
                  letterSpacing: 1.5,
                  textDecoration: "none",
                  boxShadow: `0 0 40px ${C.PRI}50`,
                }}
              >
                ENTRAR NO COCKPIT →
              </a>
            </div>
          ) : (
            <a
              href={loginUrl("/cockpit")}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 14,
                background: "#fff",
                color: "#000",
                padding: "18px 32px",
                borderRadius: 12,
                fontWeight: 600,
                fontSize: 15,
                textDecoration: "none",
                boxShadow: "0 8px 32px rgba(0,212,255,0.25)",
                transition: "all 200ms cubic-bezier(0.23, 1, 0.32, 1)",
              }}
            >
              <GoogleGlyph />
              Entrar com Google
            </a>
          )}

          <div
            style={{
              marginTop: 48,
              fontSize: 12,
              color: C.TXT_FAINT,
              letterSpacing: 1,
              maxWidth: 540,
              margin: "48px auto 0",
            }}
          >
            O acesso é validado por uma whitelist soberana mantida pela
            NowGo Holding. Tentativas de acesso por contas não autorizadas
            são registradas e bloqueadas automaticamente.
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer
        style={{
          padding: "60px 0 40px",
          borderTop: `1px solid ${C.BORDER_DIM}`,
          color: C.TXT_FAINT,
          fontSize: 13,
        }}
      >
        <div
          className="container"
          style={{
            maxWidth: 1180,
            display: "flex",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 24,
          }}
        >
          <div>
            <div
              style={{
                fontWeight: 700,
                color: C.TXT_DIM,
                letterSpacing: 4,
                fontSize: 14,
                marginBottom: 6,
              }}
            >
              NOWGO HOLDING
            </div>
            <div>Brasília · Distrito Federal · Brasil</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div>© {new Date().getFullYear()} NowGo AI · Todos os direitos reservados.</div>
            <div style={{ marginTop: 6 }}>NowGo Sovereign Stack™</div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Componentes auxiliares
// ---------------------------------------------------------------------------

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      style={{
        color: C.TXT_DIM,
        textDecoration: "none",
        fontSize: 13,
        letterSpacing: 1.5,
        fontWeight: 500,
        transition: "color 200ms",
      }}
    >
      {children}
    </a>
  );
}

function Pill({ text }: { text: string }) {
  return (
    <span
      style={{
        padding: "6px 14px",
        borderRadius: 999,
        border: `1px solid ${C.BORDER_DIM}`,
        background: "rgba(0,20,30,0.4)",
        color: C.TXT_DIM,
        fontSize: 12,
        letterSpacing: 0.6,
        fontWeight: 500,
      }}
    >
      {text}
    </span>
  );
}

function StackCard({ title, desc }: { title: string; desc: string }) {
  return (
    <div
      style={{
        padding: 24,
        borderRadius: 12,
        border: `1px solid ${C.BORDER_DIM}`,
        background: "rgba(0,12,20,0.5)",
        transition: "all 200ms cubic-bezier(0.23, 1, 0.32, 1)",
      }}
    >
      <div
        style={{
          color: C.PRI,
          fontSize: 14,
          fontWeight: 700,
          letterSpacing: 1.5,
          marginBottom: 10,
        }}
      >
        {title}
      </div>
      <p style={{ color: C.TXT_DIM, fontSize: 14, lineHeight: 1.6, margin: 0 }}>{desc}</p>
    </div>
  );
}

function AgentCard({
  color,
  title,
  role,
  desc,
  bullets,
}: {
  color: string;
  title: string;
  role: string;
  desc: string;
  bullets: string[];
}) {
  return (
    <div
      style={{
        padding: 32,
        borderRadius: 14,
        border: `1px solid ${color}40`,
        background: `linear-gradient(135deg, ${color}10, transparent)`,
        boxShadow: `0 0 40px ${color}15`,
      }}
    >
      <div
        style={{
          fontSize: 11,
          letterSpacing: 3,
          color: color,
          fontWeight: 700,
          marginBottom: 8,
        }}
      >
        {role}
      </div>
      <h3
        style={{
          fontSize: 36,
          margin: 0,
          marginBottom: 16,
          color: C.TXT,
          fontWeight: 700,
          letterSpacing: 2,
        }}
      >
        {title}
      </h3>
      <p style={{ color: C.TXT_DIM, fontSize: 15, lineHeight: 1.6, margin: 0, marginBottom: 20 }}>
        {desc}
      </p>
      <ul style={{ paddingLeft: 0, listStyle: "none", margin: 0, display: "grid", gap: 10 }}>
        {bullets.map((b) => (
          <li
            key={b}
            style={{
              fontSize: 14,
              color: C.TXT_DIM,
              display: "flex",
              alignItems: "flex-start",
              gap: 10,
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: 999,
                background: color,
                marginTop: 8,
                flexShrink: 0,
                boxShadow: `0 0 8px ${color}`,
              }}
            />
            {b}
          </li>
        ))}
      </ul>
    </div>
  );
}

function PrincipleCard({ num, title, desc }: { num: string; title: string; desc: string }) {
  return (
    <div
      style={{
        padding: 24,
        borderRadius: 12,
        border: `1px solid ${C.BORDER_DIM}`,
        background: "rgba(0,12,20,0.4)",
      }}
    >
      <div style={{ color: C.ACC2, fontSize: 11, letterSpacing: 3, fontWeight: 700, marginBottom: 12 }}>
        {num}
      </div>
      <div style={{ color: C.TXT, fontSize: 17, fontWeight: 600, marginBottom: 8 }}>{title}</div>
      <p style={{ color: C.TXT_DIM, fontSize: 13, lineHeight: 1.6, margin: 0 }}>{desc}</p>
    </div>
  );
}

function PartnerCard({ title, desc }: { title: string; desc: string }) {
  return (
    <div
      style={{
        padding: 20,
        borderRadius: 10,
        border: `1px solid ${C.BORDER_DIM}`,
        background: "rgba(0,12,20,0.4)",
      }}
    >
      <div style={{ color: C.TXT, fontSize: 14, fontWeight: 700, marginBottom: 6 }}>{title}</div>
      <div style={{ color: C.TXT_FAINT, fontSize: 12, lineHeight: 1.5 }}>{desc}</div>
    </div>
  );
}

function SovBullet({ text }: { text: string }) {
  return (
    <li
      style={{
        display: "flex",
        gap: 14,
        alignItems: "flex-start",
        paddingLeft: 0,
      }}
    >
      <span
        style={{
          width: 24,
          height: 24,
          borderRadius: 999,
          background: `${C.ACC}30`,
          border: `1px solid ${C.ACC}80`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          marginTop: 2,
        }}
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M2 6L5 9L10 3" stroke={C.ACC} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      <span style={{ color: C.TXT_DIM, fontSize: 16, lineHeight: 1.6 }}>{text}</span>
    </li>
  );
}

function OfferCard({
  accent,
  tag,
  title,
  subtitle,
  points,
}: {
  accent: string;
  tag: string;
  title: string;
  subtitle: string;
  points: string[];
}) {
  return (
    <div
      style={{
        padding: 32,
        borderRadius: 14,
        border: `1px solid ${accent}50`,
        background: `linear-gradient(180deg, ${accent}08, rgba(0,12,20,0.6))`,
        boxShadow: `0 0 32px ${accent}15`,
        position: "relative",
      }}
    >
      <div
        style={{
          fontSize: 10,
          letterSpacing: 3,
          color: accent,
          fontWeight: 700,
          marginBottom: 14,
        }}
      >
        {tag}
      </div>
      <h3
        style={{
          fontSize: 26,
          margin: 0,
          marginBottom: 12,
          color: C.TXT,
          fontWeight: 600,
        }}
      >
        {title}
      </h3>
      <p
        style={{
          color: C.TXT_DIM,
          fontSize: 14,
          lineHeight: 1.6,
          margin: 0,
          marginBottom: 24,
        }}
      >
        {subtitle}
      </p>
      <ul style={{ paddingLeft: 0, listStyle: "none", margin: 0, display: "grid", gap: 12 }}>
        {points.map((p) => (
          <li
            key={p}
            style={{
              fontSize: 13,
              color: C.TXT_DIM,
              display: "flex",
              alignItems: "flex-start",
              gap: 10,
            }}
          >
            <span style={{ color: accent, flexShrink: 0 }}>▸</span>
            {p}
          </li>
        ))}
      </ul>
    </div>
  );
}

function GoogleGlyph() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48">
      <path
        fill="#FFC107"
        d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
      />
      <path
        fill="#FF3D00"
        d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571.001-.001.002-.001.003-.002l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"
      />
    </svg>
  );
}
