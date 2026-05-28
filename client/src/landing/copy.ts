/**
 * Conteúdo bilíngue (PT-BR / EN) da landing page NowGo AI.
 *
 * Toda string usada na landing fica aqui, em duas chaves espelhadas (`pt` e `en`).
 * O objetivo é permitir o toggle PT|EN no header com persistência em localStorage,
 * e ao mesmo tempo manter o conteúdo auditável (sem strings perdidas no JSX).
 *
 * Princípios editoriais:
 *  - PT-BR: tom brasileiro, direto, com a precisão de quem opera o que vende.
 *  - EN: tom enterprise global, alinhado a investidores e parceiros internacionais.
 *  - Nenhum dado financeiro fabricado: todos os números aqui foram conferidos
 *    contra a base ATIVOS CRM IA (Notion) e contra o site oficial nowgoai.com.
 */

export type Lang = "pt" | "en" | "es";

export const copy = {
  pt: {
    nav: {
      platform: "Plataforma",
      verticals: "Verticais",
      cases: "Cases",
      ecosystem: "Ecossistema",
      pricing: "Investimento",
      cockpitCta: "Login",
    },
    hero: {
      tag: "AI NATIVE COMPANY · NVIDIA PARTNER EXPERT",
      titleA: "Inteligência soberana",
      titleB: "para empresas e governos.",
      subtitle:
        "Tecnologia que serve, conecta e transforma vidas — para cidades, empresas e pessoas, com cuidado especial pelos invisíveis e vulneráveis. Construímos LLMs proprietárias, infraestrutura de IA sob medida e agentes autônomos com dados sob jurisdição nacional e operação 24/7.",
      ctaPrimary: "Agendar reunião",
      ctaSecondary: "Falar no WhatsApp",
      kpiA: "Brasil · jurisdição soberana",
      kpiB: "NVIDIA Partner Expert 2026",
      kpiC: "Top 50 Global · DPI",
    },
    platform: {
      eyebrow: "PLATAFORMA",
      title: "Três pilares que tornam a IA um ativo da empresa, não um custo.",
      subtitle:
        "Combinamos modelos proprietários, infraestrutura dedicada e agentes operacionais. Cada cliente recebe uma stack pensada para o seu domínio, seus dados e sua governança.",
      pillars: [
        {
          tag: "01 · CUSTOM LLMS",
          title: "Modelos de linguagem proprietários",
          desc: "Treinados sobre seus dados privados, com vocabulário, regras de negócio e tom de voz da empresa. Modelos que falam o idioma do seu cliente, do seu setor e do seu jurídico.",
        },
        {
          tag: "02 · TAILORED IaaS",
          title: "Infraestrutura de IA sob medida",
          desc: "GPU dedicada, observabilidade ponta-a-ponta, deploy soberano em jurisdição nacional ou em nuvem do cliente. Sem dependência de fornecedor único.",
        },
        {
          tag: "03 · AUTONOMOUS AGENTS",
          title: "Agentes que executam, não só conversam",
          desc: "Workers que abrem chamados, fecham vendas, aprovam contratos, atualizam CRMs e operam Smart Cities. Voz, texto e ações reais — com supervisão humana onde importa.",
        },
      ],
    },
    verticals: {
      eyebrow: "FRENTES DE ATUAÇÃO",
      title: "Duas frentes, uma stack soberana.",
      subtitle:
        "Operamos com profundidade em Smart Cities (frente pública) e em Enterprise (frente privada). Mesma stack, governança soberana e equipe própria — com playbook adequado a cada domínio.",
      smartCity: {
        kicker: "FRENTE PÚBLICA",
        name: "Smart Cities",
        desc: "Plataformas Públicas Integradas, gabinetes digitais, atendimento ao cidadão e gestão de cidades inteligentes — com soberania de dados em jurisdição nacional. Cada projeto contempla cuidado especial pelos invisíveis e mais vulneráveis.",
        bullets: [
          "Gabinete digital + atendimento ao cidadão",
          "Agentes autônomos por secretaria",
          "Operacional 24/7 com supervisão humana",
          "Marcos auditáveis por fase",
        ],
      },
      enterprise: {
        kicker: "FRENTE PRIVADA",
        name: "Enterprise AI-Native",
        desc: "LLMs proprietárias, infraestrutura GPU dedicada e agentes que executam fluxos críticos. Setup rápido + recorrência mensal, com governança corporativa e benchmark de ROI 17x em 24 meses.",
        items: [
          { name: "Health", desc: "Agentes de voz para redes hospitalares, triagem inteligente, prontuários e suporte a equipes clínicas." },
          { name: "Education", desc: "Tutores adaptativos, automação acadêmica e assistentes para gestão escolar pública e privada." },
          { name: "Environment", desc: "Monitoramento ambiental, ESG operacional e analytics para órgãos reguladores." },
          { name: "Agro", desc: "Otimização de safra, suporte a cooperativas e agentes para gestão de propriedades rurais." },
          { name: "Finance", desc: "Orquestra de agentes para serviços financeiros, automação documental, KYC/AML e operações regulatórias." },
          { name: "Entertainment", desc: "Personalização em escala, agentes de fan engagement, produção assistida por IA e experiências imersivas para mídia, esporte e cultura." },
          { name: "Real Estate", desc: "Agentes para incorporadoras e imobiliárias: prospecção qualificada, atendimento 24/7, análise de portfólio e gestão preditiva de ativos." },
          { name: "Energy", desc: "Agentes para operadoras de energia, utilities e smart grids: previsão de demanda, manutenção preditiva e eficiência energética." },
        ],
      },
    },
    cases: {
      eyebrow: "CASES E PROVAS",
      title: "Resultados auditáveis, não promessas.",
      subtitle: "",
      items: [
        {
          tag: "SMART CITY",
          title: "Smart City — Plataforma Pública Integrada",
          metric: "",
          metricLabel: "Fase 1",
          desc: "Plataforma Pública Integrada pronta para implantação — gabinete digital, atendimento ao cidadão e operação 24/7, escopo dimensionado por território, secretarias e sistemas legados.",
        },
        {
          tag: "ENTERPRISE · FINTECH",
          title: "Orquestra de Agentes de IA com receita recorrente",
          metric: "",
          metricLabel: "Setup + recorrência mensal",
          desc: "Múltiplos agentes orquestrados em produção, com contrato assinado em cliente do setor financeiro. Modelo replicável de setup + MRR aplicado a serviços financeiros, compliance e operações.",
        },
        {
          tag: "ENTERPRISE · LEGAL",
          title: "Cartório RN — Automação Documental",
          metric: "",
          metricLabel: "Contrato fechado",
          desc: "Primeiro de uma série planejada de automações documentais e fluxos cartoriais. Caso de validação rápida com expansão regional.",
        },
      ],
      footer:
        "Cases ativos com contratos formais em curso. Pipeline aberto e métricas detalhadas disponíveis sob NDA mediante solicitação.",
    },
    seals: {
      eyebrow: "PARCERIAS E RECONHECIMENTOS",
      title: "Validados por quem leva IA a sério.",
      subtitle:
        "Selo Top 50 Global concedido pela DPI · JICA · BCG · Bill & Melinda Gates Foundation. Parceria oficial NVIDIA Partner Expert para infraestrutura de IA empresarial.",
      items: [
        { kicker: "INFRA", name: "NVIDIA Partner Expert", desc: "Acesso direto à roadmap, GPU prioritária e suporte técnico especializado." },
        { kicker: "TOP 50 GLOBAL", name: "DPI · Digital Public Infrastructure", desc: "Reconhecimento internacional em infraestrutura digital pública soberana." },
        { kicker: "TOP 50 GLOBAL", name: "JICA · Japan International Cooperation", desc: "Parceiro elegível em projetos de cooperação internacional em tecnologia." },
        { kicker: "TOP 50 GLOBAL", name: "BCG · Boston Consulting Group", desc: "Reconhecida entre as 50 empresas globais com maior potencial em IA aplicada." },
        { kicker: "TOP 50 GLOBAL", name: "Bill & Melinda Gates Foundation", desc: "Selo de impacto em programas de transformação digital de larga escala." },
      ],
    },
    ecosystem: {
      eyebrow: "NVIDIA PARTNER EXPERT · ECOSSISTEMA GLOBAL",
      title: "A mesma stack Enterprise que move líderes globais.",
      subtitle:
        "Como NVIDIA Partner Expert, a NowGo AI opera sobre a mesma infraestrutura de IA Enterprise que sustenta referências mundiais em saúde, indústria, energia e cidades — adaptada à soberania brasileira. Os cases abaixo são do ecossistema oficial NVIDIA; nossa stack herda a mesma base.",
      items: [
        {
          tag: "PUBLIC · SMART CITIES",
          title: "Cidades em quatro continentes",
          desc: "Plataformas integradas de mobilidade, segurança e atendimento ao cidadão sobre NVIDIA. *Base direta da Plataforma Pública Integrada nowgo, com soberania brasileira e cuidado pelos invisíveis.*",
        },
        {
          tag: "ENTERPRISE · HEALTHCARE",
          title: "Redes hospitalares globais com IA generativa",
          desc: "Triagem, prontuários e descoberta de fármacos sobre stack NVIDIA Enterprise. *A nowgo aplica a mesma base com soberania brasileira.*",
        },
        {
          tag: "ENTERPRISE · EDUCATION",
          title: "Universidades de pesquisa com DGX e LLMs próprios",
          desc: "Aceleração científica e tutoria adaptativa em parceria com NVIDIA. *Mesmo padrão aplicado em programas acadêmicos e públicos brasileiros.*",
        },
        {
          tag: "ENTERPRISE · ENVIRONMENT",
          title: "Gêmeos digitais ambientais e ESG operacional",
          desc: "Sensoriamento remoto e simulação climática sobre GPU NVIDIA. *Vertical Environment da nowgo herda essa stack para ESG e analytics regulatórios.*",
        },
        {
          tag: "ENTERPRISE · AGRO",
          title: "Cooperativas com visão computacional",
          desc: "Monitoramento de safra, saúde animal e gestão preditiva acelerados por NVIDIA. *Vertical agro nowgo disponibiliza a stack equivalente para o Brasil.*",
        },
        {
          tag: "ENTERPRISE · FINANCE",
          title: "Bancos globais com IA preditiva e detecção de fraude",
          desc: "Risco, compliance e atendimento financeiro sobre infraestrutura NVIDIA. *Modelo aplicado pela nowgo em fintechs e operações regulatórias brasileiras.*",
        },
        {
          tag: "ENTERPRISE · ENTERTAINMENT",
          title: "Estúdios de cinema e TV com modelos generativos próprios",
          desc: "NVIDIA AI Foundry for Media para produção, personalização e experiências imersivas. *nowgo oferece a mesma capacidade para mídia, esporte e cultura no Brasil.*",
        },
        {
          tag: "ENTERPRISE · REAL ESTATE",
          title: "Incorporadoras com gêmeos digitais e analytics preditivo",
          desc: "Análise de portfólio, valuation e gestão de ativos acelerados por NVIDIA. *Aplicamos o mesmo padrão em incorporadoras e imobiliárias brasileiras.*",
        },
      ],
    },
    pricing: {
      eyebrow: "INVESTIMENTO",
      title: "Modelos comerciais alinhados ao seu nível de ambição.",
      subtitle:
        "Da prova de conceito enxuta ao programa de transformação completa. Sempre com setup + recorrência ou implementação plurianual com marcos auditáveis.",
      tiers: [
        {
          name: "Piloto Inteligente",
          price: "Sob consulta",
          period: "Fase única (60 a 120 dias)",
          desc: "Caso de uso priorizado, MVP do agente, integração com 1 a 2 sistemas, equipe humana acompanhando o ramp-up.",
          features: [
            "Workshop estratégico de descoberta",
            "MVP do agente (voz ou texto)",
            "Integração com 1 a 2 sistemas críticos",
            "Suporte premium nos primeiros 90 dias",
          ],
          cta: "Agendar conversa",
          highlight: false,
        },
        {
          name: "Enterprise Custom LLM",
          price: "Sob consulta",
          period: "Implementação 12 meses + recorrência",
          desc: "LLM proprietária treinada nos seus dados. Quatro marcos contratuais auditáveis (30/25/25/20). Após go-live, recorrência mensal para licenciamento, suporte e novos modelos.",
          features: [
            "LLM dedicada com seus dados privados",
            "Infraestrutura GPU sob medida",
            "Suporte premium 12 meses inclusos",
            "Recorrência mensal pós go-live",
            "Benchmark de ROI 17x em 24 meses",
          ],
          cta: "Solicitar proposta",
          highlight: true,
        },
        {
          name: "Programa Smart City",
          price: "Sob consulta",
          period: "Programa plurianual por fases",
          desc: "Plataforma Pública Integrada para governos, com implantação por fases sucessivas — escopo dimensionado conforme território, secretarias e sistemas legados.",
          features: [
            "Gabinete digital + atendimento ao cidadão",
            "Agentes autônomos por secretaria",
            "Soberania de dados em jurisdição nacional",
            "Marcos auditáveis por fase",
            "Manifesto institucional opcional",
          ],
          cta: "Falar com a equipe",
          highlight: false,
        },
      ],
    },
    finalCta: {
      eyebrow: "PRÓXIMO PASSO",
      title: "Construir hoje o futuro que vale a pena.",
      subtitle:
        "Tecnologia soberana, humana e inteligente — para cidades, empresas e pessoas. Conversamos primeiro, propomos depois, só formalizamos quando o caso de uso realmente faz sentido.",
      ctaPrimary: "Agendar reunião",
      ctaSecondary: "Falar no WhatsApp",
    },
    footer: {
      tag: "AI NATIVE COMPANY",
      brand: "NowGo AI",
      desc: "Plataforma de IA empresarial para um mundo soberano e humano. Built in Brazil. Trusted globally.",
      colA: {
        title: "Plataforma",
        links: [
          { label: "Custom LLMs", href: "#platform" },
          { label: "Tailored IaaS", href: "#platform" },
          { label: "Autonomous Agents", href: "#platform" },
          { label: "Smart City 2036", href: "#verticals" },
        ],
      },
      colB: {
        title: "Empresa",
        links: [
          { label: "Sobre", href: "/sobre" },
          { label: "Cases", href: "#cases" },
          { label: "Carreiras", href: "/carreiras" },
          { label: "Imprensa", href: "/imprensa" },
        ],
      },
      colC: {
        title: "Recursos",
        links: [
          { label: "Cockpit interno", href: "/cockpit" },
          { label: "Manifesto", href: "/manifesto" },
          { label: "Política de Privacidade", href: "/privacidade" },
          { label: "Contato", href: "#contact" },
        ],
      },
      copyright: "© 2026 NowGo AI. Todos os direitos reservados.",
    },
  },
  en: {
    nav: {
      platform: "Platform",
      verticals: "Verticals",
      cases: "Cases",
      ecosystem: "Ecosystem",
      pricing: "Investment",
      cockpitCta: "Login",
    },
    hero: {
      tag: "AI NATIVE COMPANY · NVIDIA PARTNER EXPERT",
      titleA: "Sovereign intelligence",
      titleB: "for enterprises and governments.",
      subtitle:
        "Technology that serves, connects and transforms lives — for cities, enterprises and people, with special care for the invisible and the most vulnerable. We build proprietary LLMs, tailored AI infrastructure and autonomous agents with data under sovereign jurisdiction and 24/7 operation.",
      ctaPrimary: "Schedule a meeting",
      ctaSecondary: "Chat on WhatsApp",
      kpiA: "Brazil · sovereign jurisdiction",
      kpiB: "NVIDIA Partner Expert 2026",
      kpiC: "Top 50 Global · DPI",
    },
    platform: {
      eyebrow: "PLATFORM",
      title: "Three pillars that turn AI into an enterprise asset, not a cost.",
      subtitle:
        "We combine proprietary models, dedicated infrastructure and operational agents. Each client gets a stack designed for their domain, their data and their governance.",
      pillars: [
        {
          tag: "01 · CUSTOM LLMS",
          title: "Proprietary language models",
          desc: "Trained on your private data, with your vocabulary, business rules and brand voice. Models that speak your customer's, your industry's and your legal team's language.",
        },
        {
          tag: "02 · TAILORED IaaS",
          title: "Tailored AI infrastructure",
          desc: "Dedicated GPU, end-to-end observability, sovereign deployment in your country or your own cloud. No vendor lock-in.",
        },
        {
          tag: "03 · AUTONOMOUS AGENTS",
          title: "Agents that execute, not just chat",
          desc: "Workers that open tickets, close deals, approve contracts, update CRMs and operate Smart Cities. Voice, text and real actions — with human supervision where it matters.",
        },
      ],
    },
    verticals: {
      eyebrow: "OPERATING FRONTS",
      title: "Two fronts, one sovereign stack.",
      subtitle:
        "We operate in depth across Smart Cities (public front) and Enterprise (private front). Same stack, sovereign governance and an in-house team — with a playbook tuned to each domain.",
      smartCity: {
        kicker: "PUBLIC FRONT",
        name: "Smart Cities",
        desc: "Integrated Public Platforms, digital cabinets, citizen services and smart city operations — with data sovereignty under national jurisdiction. Every project includes special care for the invisible and the most vulnerable.",
        bullets: [
          "Digital cabinet + citizen services",
          "Autonomous agents per department",
          "24/7 operation with human oversight",
          "Auditable milestones per phase",
        ],
      },
      enterprise: {
        kicker: "PRIVATE FRONT",
        name: "Enterprise AI-Native",
        desc: "Proprietary LLMs, dedicated GPU infrastructure and agents that execute critical workflows. Fast setup + monthly recurring, with corporate governance and an industry benchmark of 17x ROI in 24 months.",
        items: [
          { name: "Health", desc: "Voice agents for hospital networks, intelligent triage, medical records and clinical support." },
          { name: "Education", desc: "Adaptive tutors, academic automation and assistants for public and private school management." },
          { name: "Environment", desc: "Environmental monitoring, operational ESG and analytics for regulators." },
          { name: "Agro", desc: "Crop optimization, support for cooperatives and agents for rural property management." },
          { name: "Finance", desc: "Agent orchestra for financial services, document automation, KYC/AML and regulatory operations." },
          { name: "Entertainment", desc: "Personalization at scale, fan engagement agents, AI-assisted production and immersive experiences for media, sports and culture." },
          { name: "Real Estate", desc: "Agents for developers and brokerages: qualified lead generation, 24/7 service, portfolio analytics and predictive asset management." },
          { name: "Energy", desc: "Agents for energy operators, utilities and smart grids: demand forecasting, predictive maintenance and energy efficiency." },
        ],
      },
    },
    cases: {
      eyebrow: "CASES AND PROOFS",
      title: "Auditable results, not promises.",
      subtitle: "",
      items: [
        {
          tag: "SMART CITY",
          title: "Smart City — Integrated Public Platform",
          metric: "",
          metricLabel: "Phase 1",
          desc: "Integrated Public Platform ready for deployment — digital cabinet, citizen services and 24/7 operation, scope sized by territory, departments and legacy systems.",
        },
        {
          tag: "ENTERPRISE · FINTECH",
          title: "AI Agent Orchestra with recurring revenue",
          metric: "",
          metricLabel: "Setup + monthly recurring",
          desc: "Multi-agent orchestration in production, with a signed contract at a financial-sector client. Replicable setup + MRR model applied to financial services, compliance and operations.",
        },
        {
          tag: "ENTERPRISE · LEGAL",
          title: "Cartório RN — Document Automation",
          metric: "",
          metricLabel: "Closed contract",
          desc: "First of a planned series of document automations and notary workflows. Fast validation case with regional expansion roadmap.",
        },
      ],
      footer:
        "Active cases with formal contracts in progress. Open pipeline and detailed metrics available under NDA upon request.",
    },
    seals: {
      eyebrow: "PARTNERSHIPS AND RECOGNITION",
      title: "Validated by those who take AI seriously.",
      subtitle:
        "Top 50 Global seal granted by DPI · JICA · BCG · Bill & Melinda Gates Foundation. Official NVIDIA Partner Expert partnership for enterprise AI infrastructure.",
      items: [
        { kicker: "INFRA", name: "NVIDIA Partner Expert", desc: "Direct access to roadmap, priority GPU supply and specialized technical support." },
        { kicker: "TOP 50 GLOBAL", name: "DPI · Digital Public Infrastructure", desc: "International recognition for sovereign public digital infrastructure." },
        { kicker: "TOP 50 GLOBAL", name: "JICA · Japan International Cooperation", desc: "Eligible partner in international cooperation projects in technology." },
        { kicker: "TOP 50 GLOBAL", name: "BCG · Boston Consulting Group", desc: "Recognized among the top 50 global companies with the highest potential in applied AI." },
        { kicker: "TOP 50 GLOBAL", name: "Bill & Melinda Gates Foundation", desc: "Impact seal in large-scale digital transformation programs." },
      ],
    },
    ecosystem: {
      eyebrow: "NVIDIA PARTNER EXPERT · GLOBAL ECOSYSTEM",
      title: "The same Enterprise stack that powers global leaders.",
      subtitle:
        "As an NVIDIA Partner Expert, NowGo AI operates on the same Enterprise AI infrastructure that supports world-class references in healthcare, industry, energy and cities — adapted to Brazilian sovereignty. The cases below come from the official NVIDIA ecosystem; our stack inherits the same foundation.",
      items: [
        {
          tag: "PUBLIC · SMART CITIES",
          title: "Cities across four continents",
          desc: "Integrated platforms for mobility, public safety and citizen services on NVIDIA. *Direct foundation of nowgo's Integrated Public Platform, with Brazilian sovereignty and care for the invisible.*",
        },
        {
          tag: "ENTERPRISE · HEALTHCARE",
          title: "Global hospital networks with generative AI",
          desc: "Triage, medical records and drug discovery on NVIDIA Enterprise stack. *nowgo applies the same foundation with Brazilian sovereignty.*",
        },
        {
          tag: "ENTERPRISE · EDUCATION",
          title: "Research universities with DGX and proprietary LLMs",
          desc: "Scientific acceleration and adaptive tutoring in partnership with NVIDIA. *Same standard applied to Brazilian academic and public programs.*",
        },
        {
          tag: "ENTERPRISE · ENVIRONMENT",
          title: "Environmental digital twins and operational ESG",
          desc: "Remote sensing and climate simulation on NVIDIA GPUs. *nowgo's Environment vertical inherits this stack for ESG and regulatory analytics.*",
        },
        {
          tag: "ENTERPRISE · AGRO",
          title: "Cooperatives with computer vision",
          desc: "Crop monitoring, animal health and predictive management accelerated by NVIDIA. *nowgo's agro vertical brings the equivalent stack to Brazil.*",
        },
        {
          tag: "ENTERPRISE · FINANCE",
          title: "Global banks with predictive AI and fraud detection",
          desc: "Risk, compliance and financial customer service on NVIDIA infrastructure. *Model applied by nowgo in Brazilian fintech and regulatory operations.*",
        },
        {
          tag: "ENTERPRISE · ENTERTAINMENT",
          title: "Film and TV studios with proprietary generative models",
          desc: "NVIDIA AI Foundry for Media for production, personalization and immersive experiences. *nowgo offers the same capability for media, sports and culture in Brazil.*",
        },
        {
          tag: "ENTERPRISE · REAL ESTATE",
          title: "Developers with digital twins and predictive analytics",
          desc: "Portfolio analysis, valuation and asset management accelerated by NVIDIA. *We apply the same standard to Brazilian developers and brokerages.*",
        },
      ],
    },
    pricing: {
      eyebrow: "INVESTMENT",
      title: "Commercial models aligned with your level of ambition.",
      subtitle:
        "From lean proof of concept to full transformation programs. Always with setup + recurring or multi-year implementation with auditable milestones.",
      tiers: [
        {
          name: "Smart Pilot",
          price: "On request",
          period: "Single phase (60 to 120 days)",
          desc: "Prioritized use case, agent MVP, integration with 1 to 2 systems, human team tracking the ramp-up.",
          features: [
            "Strategic discovery workshop",
            "Agent MVP (voice or text)",
            "Integration with 1 to 2 critical systems",
            "Premium support in the first 90 days",
          ],
          cta: "Book a call",
          highlight: false,
        },
        {
          name: "Enterprise Custom LLM",
          price: "On request",
          period: "12-month implementation + recurring",
          desc: "Proprietary LLM trained on your data. Four auditable contractual milestones (30/25/25/20). After go-live, monthly recurring fee for licensing, support and new models.",
          features: [
            "Dedicated LLM with your private data",
            "Tailored GPU infrastructure",
            "Premium support included for 12 months",
            "Monthly recurring after go-live",
            "Industry benchmark of 17x ROI in 24 months",
          ],
          cta: "Request proposal",
          highlight: true,
        },
        {
          name: "Smart City Program",
          price: "On request",
          period: "Multi-year phased program",
          desc: "Integrated Public Platform for governments, deployed in successive phases — scope sized by territory, departments and legacy systems.",
          features: [
            "Digital cabinet + citizen services",
            "Autonomous agents per department",
            "Sovereign data under national jurisdiction",
            "Auditable milestones per phase",
            "Optional institutional manifesto",
          ],
          cta: "Talk to our team",
          highlight: false,
        },
      ],
    },
    finalCta: {
      eyebrow: "NEXT STEP",
      title: "Build today the future worth living.",
      subtitle:
        "Sovereign, human and intelligent technology — for cities, enterprises and people. We talk first, then propose, and only formalize when the use case truly makes sense.",
      ctaPrimary: "Schedule a meeting",
      ctaSecondary: "WhatsApp us",
    },
    footer: {
      tag: "AI NATIVE COMPANY",
      brand: "NowGo AI",
      desc: "Enterprise AI platform for a sovereign and human world. Built in Brazil. Trusted globally.",
      colA: {
        title: "Platform",
        links: [
          { label: "Custom LLMs", href: "#platform" },
          { label: "Tailored IaaS", href: "#platform" },
          { label: "Autonomous Agents", href: "#platform" },
          { label: "Smart City 2036", href: "#verticals" },
        ],
      },
      colB: {
        title: "Company",
        links: [
          { label: "About", href: "/sobre" },
          { label: "Cases", href: "#cases" },
          { label: "Careers", href: "/carreiras" },
          { label: "Press", href: "/imprensa" },
        ],
      },
      colC: {
        title: "Resources",
        links: [
          { label: "Internal cockpit", href: "/cockpit" },
          { label: "Manifesto", href: "/manifesto" },
          { label: "Privacy policy", href: "/privacy" },
          { label: "Contact", href: "#contact" },
        ],
      },
      copyright: "© 2026 NowGo AI. All rights reserved.",
    },
  },
  es: {
    nav: {
      platform: "Plataforma",
      verticals: "Verticales",
      cases: "Casos",
      ecosystem: "Ecosistema",
      pricing: "Inversión",
      cockpitCta: "Login",
    },
    hero: {
      tag: "AI NATIVE COMPANY · NVIDIA PARTNER EXPERT",
      titleA: "Inteligencia soberana",
      titleB: "para empresas y gobiernos.",
      subtitle:
        "Tecnología que sirve, conecta y transforma vidas — para ciudades, empresas y personas, con un cuidado especial por los invisibles y los más vulnerables. Construimos LLMs propietarios, infraestructura de IA a medida y agentes autónomos con datos bajo jurisdicción nacional y operación 24/7.",
      ctaPrimary: "Agendar reunión",
      ctaSecondary: "Hablar por WhatsApp",
      kpiA: "Brasil · jurisdicción soberana",
      kpiB: "NVIDIA Partner Expert 2026",
      kpiC: "Top 50 Global · DPI",
    },
    platform: {
      eyebrow: "PLATAFORMA",
      title: "Tres pilares que convierten la IA en un activo de la empresa, no en un costo.",
      subtitle:
        "Combinamos modelos propietarios, infraestructura dedicada y agentes operativos. Cada cliente recibe un stack pensado para su dominio, sus datos y su gobernanza.",
      pillars: [
        {
          tag: "01 · CUSTOM LLMS",
          title: "Modelos de lenguaje propietarios",
          desc: "Entrenados sobre sus datos privados, con vocabulario, reglas de negocio y voz de marca de la empresa. Modelos que hablan el idioma de su cliente, de su sector y de su área legal.",
        },
        {
          tag: "02 · TAILORED IaaS",
          title: "Infraestructura de IA a medida",
          desc: "GPU dedicada, observabilidad de extremo a extremo, despliegue soberano en su país o en la nube del cliente. Sin dependencia de un único proveedor.",
        },
        {
          tag: "03 · AUTONOMOUS AGENTS",
          title: "Agentes que ejecutan, no solo conversan",
          desc: "Workers que abren tickets, cierran ventas, aprueban contratos, actualizan CRMs y operan Smart Cities. Voz, texto y acciones reales — con supervisión humana donde importa.",
        },
      ],
    },
    verticals: {
      eyebrow: "FRENTES DE OPERACIÓN",
      title: "Dos frentes, un stack soberano.",
      subtitle:
        "Operamos con profundidad en Smart Cities (frente pública) y Enterprise (frente privada). Mismo stack, gobernanza soberana y equipo propio — con un playbook adaptado a cada dominio.",
      smartCity: {
        kicker: "FRENTE PÚBLICA",
        name: "Smart Cities",
        desc: "Plataformas Públicas Integradas, gabinetes digitales, atención al ciudadano y gestión de ciudades inteligentes — con soberanía de datos en jurisdicción nacional. Cada proyecto incluye un cuidado especial por los invisibles y los más vulnerables.",
        bullets: [
          "Gabinete digital + atención al ciudadano",
          "Agentes autónomos por secretaría",
          "Operación 24/7 con supervisión humana",
          "Hitos auditables por fase",
        ],
      },
      enterprise: {
        kicker: "FRENTE PRIVADA",
        name: "Enterprise AI-Native",
        desc: "LLMs propietarios, infraestructura GPU dedicada y agentes que ejecutan flujos críticos. Setup rápido + recurrencia mensual, con gobernanza corporativa y benchmark de ROI 17x en 24 meses.",
        items: [
          { name: "Health", desc: "Agentes de voz para redes hospitalarias, triaje inteligente, historia clínica y soporte a equipos médicos." },
          { name: "Education", desc: "Tutores adaptativos, automatización académica y asistentes para gestión escolar pública y privada." },
          { name: "Environment", desc: "Monitoreo ambiental, ESG operativo y analítica para órganos reguladores." },
          { name: "Agro", desc: "Optimización de cosecha, soporte a cooperativas y agentes para gestión de propiedades rurales." },
          { name: "Finance", desc: "Orquesta de agentes para servicios financieros, automatización documental, KYC/AML y operaciones regulatorias." },
          { name: "Entertainment", desc: "Personalización a escala, agentes de fan engagement, producción asistida por IA y experiencias inmersivas para medios, deporte y cultura." },
          { name: "Real Estate", desc: "Agentes para desarrolladoras e inmobiliarias: prospección calificada, atención 24/7, análisis de portafolio y gestión predictiva de activos." },
          { name: "Energy", desc: "Agentes para operadoras de energía, utilities y smart grids: previsión de demanda, mantenimiento predictivo y eficiencia energética." },
        ],
      },
    },
    cases: {
      eyebrow: "CASOS Y PRUEBAS",
      title: "Resultados auditables, no promesas.",
      subtitle: "",
      items: [
        {
          tag: "SMART CITY",
          title: "Smart City — Plataforma Pública Integrada",
          metric: "",
          metricLabel: "Fase 1",
          desc: "Plataforma Pública Integrada lista para despliegue — gabinete digital, atención al ciudadano y operación 24/7, alcance dimensionado por territorio, secretarías y sistemas legados.",
        },
        {
          tag: "ENTERPRISE · FINTECH",
          title: "Orquesta de Agentes de IA con ingresos recurrentes",
          metric: "",
          metricLabel: "Setup + recurrencia mensual",
          desc: "Orquestación multi-agente en producción, con contrato firmado en un cliente del sector financiero. Modelo replicable de setup + MRR aplicado a servicios financieros, compliance y operaciones.",
        },
        {
          tag: "ENTERPRISE · LEGAL",
          title: "Cartorio RN — Automatización Documental",
          metric: "",
          metricLabel: "Contrato cerrado",
          desc: "Primero de una serie planeada de automatizaciones documentales y flujos notariales. Caso de validación rápida con expansión regional.",
        },
      ],
      footer:
        "Casos activos con contratos formales en curso. Pipeline abierto y métricas detalladas disponibles bajo NDA por solicitud.",
    },
    seals: {
      eyebrow: "ALIANZAS Y RECONOCIMIENTOS",
      title: "Validados por quienes toman la IA en serio.",
      subtitle:
        "Sello Top 50 Global otorgado por DPI · JICA · BCG · Bill & Melinda Gates Foundation. Alianza oficial NVIDIA Partner Expert para infraestructura de IA empresarial.",
      items: [
        { kicker: "INFRA", name: "NVIDIA Partner Expert", desc: "Acceso directo a la roadmap, GPU prioritaria y soporte técnico especializado." },
        { kicker: "TOP 50 GLOBAL", name: "DPI · Digital Public Infrastructure", desc: "Reconocimiento internacional en infraestructura digital pública soberana." },
        { kicker: "TOP 50 GLOBAL", name: "JICA · Japan International Cooperation", desc: "Socio elegible en proyectos de cooperación internacional en tecnología." },
        { kicker: "TOP 50 GLOBAL", name: "BCG · Boston Consulting Group", desc: "Reconocida entre las 50 empresas globales con mayor potencial en IA aplicada." },
        { kicker: "TOP 50 GLOBAL", name: "Bill & Melinda Gates Foundation", desc: "Sello de impacto en programas de transformación digital a gran escala." },
      ],
    },
    ecosystem: {
      eyebrow: "NVIDIA PARTNER EXPERT · ECOSISTEMA GLOBAL",
      title: "El mismo stack Enterprise que mueve a los líderes globales.",
      subtitle:
        "Como NVIDIA Partner Expert, NowGo AI opera sobre la misma infraestructura de IA Enterprise que sustenta referencias mundiales en salud, industria, energía y ciudades — adaptada a la soberanía brasileña. Los casos a continuación provienen del ecosistema oficial NVIDIA; nuestro stack hereda la misma base.",
      items: [
        {
          tag: "PUBLIC · SMART CITIES",
          title: "Ciudades en cuatro continentes",
          desc: "Plataformas integradas de movilidad, seguridad y atención al ciudadano sobre NVIDIA. *Base directa de la Plataforma Pública Integrada nowgo, con soberanía brasileña y cuidado por los invisibles.*",
        },
        {
          tag: "ENTERPRISE · HEALTHCARE",
          title: "Redes hospitalarias globales con IA generativa",
          desc: "Triaje, historia clínica y descubrimiento de fármacos sobre stack NVIDIA Enterprise. *nowgo aplica la misma base con soberanía brasileña.*",
        },
        {
          tag: "ENTERPRISE · EDUCATION",
          title: "Universidades de investigación con DGX y LLMs propios",
          desc: "Aceleración científica y tutoría adaptativa en colaboración con NVIDIA. *Mismo estándar aplicado en programas académicos y públicos brasileños.*",
        },
        {
          tag: "ENTERPRISE · ENVIRONMENT",
          title: "Gemelos digitales ambientales y ESG operativo",
          desc: "Sensorización remota y simulación climática sobre GPU NVIDIA. *La vertical Environment de nowgo hereda este stack para ESG y analítica regulatoria.*",
        },
        {
          tag: "ENTERPRISE · AGRO",
          title: "Cooperativas con visión por computadora",
          desc: "Monitoreo de cosecha, salud animal y gestión predictiva acelerados por NVIDIA. *La vertical agro de nowgo lleva el stack equivalente a Brasil.*",
        },
        {
          tag: "ENTERPRISE · FINANCE",
          title: "Bancos globales con IA predictiva y detección de fraude",
          desc: "Riesgo, compliance y atención financiera sobre infraestructura NVIDIA. *Modelo aplicado por nowgo en fintechs y operaciones regulatorias brasileñas.*",
        },
        {
          tag: "ENTERPRISE · ENTERTAINMENT",
          title: "Estudios de cine y TV con modelos generativos propios",
          desc: "NVIDIA AI Foundry for Media para producción, personalización y experiencias inmersivas. *nowgo ofrece la misma capacidad para medios, deporte y cultura en Brasil.*",
        },
        {
          tag: "ENTERPRISE · REAL ESTATE",
          title: "Desarrolladoras con gemelos digitales y analítica predictiva",
          desc: "Análisis de portafolio, valuación y gestión de activos acelerados por NVIDIA. *Aplicamos el mismo estándar en desarrolladoras e inmobiliarias brasileñas.*",
        },
      ],
    },
    pricing: {
      eyebrow: "INVERSIÓN",
      title: "Modelos comerciales alineados con su nivel de ambición.",
      subtitle:
        "Desde la prueba de concepto enfocada hasta el programa de transformación completo. Siempre con setup + recurrencia o implementación plurianual con hitos auditables.",
      tiers: [
        {
          name: "Piloto Inteligente",
          price: "A consultar",
          period: "Fase única (60 a 120 días)",
          desc: "Caso de uso priorizado, MVP del agente, integración con 1 a 2 sistemas, equipo humano acompañando el ramp-up.",
          features: [
            "Workshop estratégico de descubrimiento",
            "MVP del agente (voz o texto)",
            "Integración con 1 a 2 sistemas críticos",
            "Soporte premium en los primeros 90 días",
          ],
          cta: "Agendar conversación",
          highlight: false,
        },
        {
          name: "Enterprise Custom LLM",
          price: "A consultar",
          period: "Implementación 12 meses + recurrencia",
          desc: "LLM propietario entrenado con sus datos. Cuatro hitos contractuales auditables (30/25/25/20). Tras el go-live, recurrencia mensual para licenciamiento, soporte y nuevos modelos.",
          features: [
            "LLM dedicado con sus datos privados",
            "Infraestructura GPU a medida",
            "Soporte premium 12 meses incluido",
            "Recurrencia mensual post go-live",
            "Benchmark de ROI 17x en 24 meses",
          ],
          cta: "Solicitar propuesta",
          highlight: true,
        },
        {
          name: "Programa Smart City",
          price: "A consultar",
          period: "Programa plurianual por fases",
          desc: "Plataforma Pública Integrada para gobiernos, con despliegue en fases sucesivas — alcance dimensionado según territorio, secretarías y sistemas legados.",
          features: [
            "Gabinete digital + atención al ciudadano",
            "Agentes autónomos por secretaría",
            "Soberanía de datos en jurisdicción nacional",
            "Hitos auditables por fase",
            "Manifiesto institucional opcional",
          ],
          cta: "Hablar con el equipo",
          highlight: false,
        },
      ],
    },
    finalCta: {
      eyebrow: "PRÓXIMO PASO",
      title: "Construir hoy el futuro que vale la pena.",
      subtitle:
        "Tecnología soberana, humana e inteligente — para ciudades, empresas y personas. Conversamos primero, proponemos después, solo formalizamos cuando el caso de uso realmente tiene sentido.",
      ctaPrimary: "Agendar reunión",
      ctaSecondary: "Hablar por WhatsApp",
    },
    footer: {
      tag: "AI NATIVE COMPANY",
      brand: "NowGo AI",
      desc: "Plataforma de IA empresarial para un mundo soberano y humano. Built in Brazil. Trusted globally.",
      colA: {
        title: "Plataforma",
        links: [
          { label: "Custom LLMs", href: "#platform" },
          { label: "Tailored IaaS", href: "#platform" },
          { label: "Autonomous Agents", href: "#platform" },
          { label: "Smart City 2036", href: "#verticals" },
        ],
      },
      colB: {
        title: "Empresa",
        links: [
          { label: "Acerca de", href: "/sobre" },
          { label: "Casos", href: "#cases" },
          { label: "Carreras", href: "/carreiras" },
          { label: "Prensa", href: "/imprensa" },
        ],
      },
      colC: {
        title: "Recursos",
        links: [
          { label: "Cockpit interno", href: "/cockpit" },
          { label: "Manifiesto", href: "/manifesto" },
          { label: "Política de Privacidad", href: "/privacidade" },
          { label: "Contacto", href: "#contact" },
        ],
      },
      copyright: "© 2026 NowGo AI. Todos los derechos reservados.",
    },
  },
} as const;

export type Copy = typeof copy.pt;
