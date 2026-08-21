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
      cockpitCta: "Acessar Cockpit",
    },
    hero: {
      tag: "XAVIER · VOICE-FIRST INTELLIGENCE · NOWGO AI",
      titleA: "XAVIER",
      titleB: "Sua inteligência soberana pessoal.",
      subtitle:
        "Sua inteligência. Sua memória. Seu controle. Uma inteligência que entende seu contexto, preserva o que importa e trabalha com pesquisa, criação e execução — por voz ou texto — em uma experiência simples.",
      ctaPrimary: "Começar com Xavier",
      ctaSecondary: "IA soberana para organizações",
      kpiA: "Memória e contexto por sessão",
      kpiB: "Voz e texto na mesma inteligência",
      kpiC: "NowGo · Sovereign Intelligence",
    },
    platform: {
      eyebrow: "XAVIER · UMA INTELIGÊNCIA. CONTEXTO CONTÍNUO.",
      title: "A inteligência que cuida da complexidade para você.",
      subtitle:
        "Xavier entende seu contexto e ajuda você a pesquisar, pensar, criar e executar — por voz ou texto — sem exigir que você gerencie modelos, ferramentas ou complexidade técnica.",
      pillars: [
        {
          tag: "01 · MEMÓRIA + CONTEXTO",
          title: "Seu trabalho continua conectado",
          desc: "Xavier preserva o contexto das suas sessões para que você retome ideias, decisões e arquivos sem começar do zero.",
        },
        {
          tag: "02 · VOICE-FIRST",
          title: "Fale ou digite. A inteligência é a mesma.",
          desc: "Use voz ou texto para pesquisar, analisar, criar e executar tarefas suportadas pelo sistema.",
        },
        {
          tag: "03 · INTELLIGENCE OS",
          title: "Uma experiência simples sobre muita complexidade",
          desc: "Xavier conecta memória, modelos, ferramentas, pesquisa e dados sem exigir que você gerencie APIs, provedores ou roteamento.",
        },
        {
          tag: "04 · RESEARCH + THINKING",
          title: "Pesquise, pense e decida melhor",
          desc: "Transforme perguntas em briefing, análise e próximos passos com o contexto do seu trabalho.",
        },
        {
          tag: "05 · DOCUMENTS + PRESENTATIONS",
          title: "De briefing a entrega",
          desc: "Gere documentos, PDFs e apresentações quando precisar transformar uma ideia em um artefato pronto para usar.",
        },
        {
          tag: "06 · MULTI-CHANNEL CONTINUITY",
          title: "Continue além do navegador",
          desc: "Mantenha a continuidade da sua inteligência nos canais já conectados, incluindo texto e voz pelo Telegram.",
        },
      ],
    },
    verticals: {
      eyebrow: "DA INTELIGÊNCIA PESSOAL À INFRAESTRUTURA SOBERANA",
      title: "NowGo leva Inteligência Soberana para organizações.",
      subtitle:
        "Xavier torna a Inteligência Soberana acessível a uma pessoa. A NowGo conecta inteligência, dados, fluxos e contexto institucional para empresas e governos — com a mesma base soberana e um modelo consultivo adequado a cada domínio.",
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
        kicker: "PARA ORGANIZAÇÕES",
        name: "NowGo Sovereign Intelligence",
        desc: "Inteligência soberana para empresas e governos que precisam conectar dados, fluxos de trabalho e contexto institucional. LLMs proprietárias, infraestrutura GPU dedicada e agentes que executam fluxos críticos, com governança corporativa.",
        items: [
          { name: "Health", desc: "Agentes de voz para redes hospitalares, triagem inteligente, prontuários e suporte a equipes clínicas." },
          { name: "Education", desc: "Tutores adaptativos, automação acadêmica e assistentes para gestão escolar pública e privada." },
          { name: "Environment", desc: "Monitoramento ambiental, ESG operacional e analytics para órgãos reguladores." },
          { name: "Agtech", desc: "Otimização de safra, suporte a cooperativas e agentes para gestão de propriedades rurais." },
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
          title: "Plataforma Pública Integrada",
          metric: "",
          metricLabel: "Smart City",
          desc: "Pronta para implantação — gabinete digital, atendimento ao cidadão e operação 24/7, escopo dimensionado por território, secretarias e sistemas legados.",
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
      footer: "",
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
      eyebrow: "DUAS PORTAS PARA A INTELIGÊNCIA SOBERANA",
      title: "Comece com Xavier ou fale com a NowGo para sua organização.",
      subtitle:
        "Xavier é a porta direta para profissionais. Empresas e governos encontram na NowGo uma camada de Inteligência Soberana para conectar dados, fluxos e contexto institucional.",
      enterpriseEyebrow: "PARA ORGANIZAÇÕES",
      enterpriseTitle: "Sovereign Intelligence para empresas e governos.",
      selfService: {
        eyebrow: "PARA PROFISSIONAIS · XAVIER",
        title: "Xavier · Sua inteligência soberana pessoal.",
        subtitle: "Comece agora com memória por sessão, voz, texto e geração de artefatos em uma experiência simples sobre uma infraestrutura sofisticada.",
        plans: [
          {
            code: "sovereign_platform_pro_monthly",
            name: "Plataforma de Inteligência Soberana Pro",
            price: "US$499",
            period: "/mês",
            credits: "5.000 créditos mensais",
            desc: "Para profissionais e equipes que precisam transformar informação em decisões e entregas com inteligência soberana.",
            features: ["Acesso à Plataforma de Inteligência Soberana", "Memória e contexto por sessão", "Voz, texto e geração de artefatos", "Suporte padrão"],
            cta: "Começar agora",
            highlight: true,
          },
          {
            code: "sovereign_platform_business_monthly",
            name: "Plataforma de Inteligência Soberana Business",
            price: "US$999",
            period: "/mês",
            credits: "15.000 créditos mensais",
            desc: "Para equipes que precisam de maior capacidade operacional, uso compartilhado e governança de trabalho.",
            features: ["Tudo do plano Pro", "Maior franquia mensal de créditos", "Prioridade operacional", "Customer Portal para gestão da assinatura"],
            cta: "Escolher Business",
            highlight: false,
          },
        ],
        creditsTitle: "Pacotes adicionais de créditos",
        creditsSubtitle: "Amplie sua capacidade sem alterar o plano mensal. Os créditos adicionais têm validade de 12 meses.",
        loginRequired: "Entre ou crie sua conta para continuar para o Checkout seguro.",
        guestTitle: "Continue para o pagamento",
        guestDescription: "Informe seu email para abrir o Checkout seguro. A conta será configurada após a confirmação do pagamento.",
        guestEmailLabel: "Email de cobrança",
        guestContinue: "Ir para o pagamento",
        guestCancel: "Cancelar",
        guestLogin: "Entrar e continuar",
        guestAccountExists: "Este email já possui uma conta. Entre para continuar com sua compra.",
        accessDenied: "Sua conta ainda não tem acesso à Plataforma de Inteligência Soberana. Fale com o administrador.",
        unavailable: "O Checkout está temporariamente indisponível. Tente novamente ou fale com a equipe.",
        packs: [
          { code: "sovereign_credits_1000", name: "1.000 créditos", price: "US$49", unit: "US$0,049 por crédito", cta: "Adicionar créditos" },
          { code: "sovereign_credits_3000", name: "3.000 créditos", price: "US$129", unit: "US$0,043 por crédito", cta: "Adicionar créditos" },
          { code: "sovereign_credits_10000", name: "10.000 créditos", price: "US$399", unit: "US$0,0399 por crédito", cta: "Adicionar créditos" },
        ],
      },
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
      title: "Da sua inteligência à inteligência da sua organização.",
      subtitle:
        "Comece com Xavier no nível pessoal e profissional. Se você representa uma empresa ou governo, converse com a NowGo sobre Inteligência Soberana, contexto institucional e infraestrutura sob medida.",
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
      cockpitCta: "Access Cockpit",
    },
    hero: {
      tag: "XAVIER · VOICE-FIRST INTELLIGENCE · NOWGO AI",
      titleA: "XAVIER",
      titleB: "Your Personal Sovereign Intelligence.",
      subtitle:
        "Your intelligence. Your memory. Your control. An intelligence that understands your context, preserves what matters and works across research, creation and execution — through voice or text — in one simple experience.",
      ctaPrimary: "Start with Xavier",
      ctaSecondary: "Sovereign AI for organizations",
      kpiA: "Session memory and context",
      kpiB: "Voice and text, one intelligence",
      kpiC: "NowGo · Sovereign Intelligence",
    },
    platform: {
      eyebrow: "XAVIER · ONE INTELLIGENCE. CONTINUOUS CONTEXT.",
      title: "The intelligence that handles complexity for you.",
      subtitle:
        "Xavier understands your context and helps you research, think, create and execute — through voice or text — without making you manage models, tools or technical complexity.",
      pillars: [
        {
          tag: "01 · MEMORY + CONTEXT",
          title: "Your work stays connected",
          desc: "Xavier preserves the context of your sessions so you can return to ideas, decisions and files without starting from zero.",
        },
        {
          tag: "02 · VOICE-FIRST",
          title: "Talk or type. The intelligence is the same.",
          desc: "Use voice or text to research, analyze, create and execute tasks supported by the system.",
        },
        {
          tag: "03 · INTELLIGENCE OS",
          title: "One simple experience over deep complexity",
          desc: "Xavier connects memory, models, tools, research and data without asking you to manage APIs, providers or routing.",
        },
        {
          tag: "04 · RESEARCH + THINKING",
          title: "Research, think and decide better",
          desc: "Turn questions into briefings, analysis and next steps with the context of your work.",
        },
        {
          tag: "05 · DOCUMENTS + PRESENTATIONS",
          title: "From briefing to deliverable",
          desc: "Generate documents, PDFs and presentations when you need to turn an idea into an artifact ready to use.",
        },
        {
          tag: "06 · MULTI-CHANNEL CONTINUITY",
          title: "Continue beyond the browser",
          desc: "Keep your intelligence continuous across connected channels, including text and voice through Telegram.",
        },
      ],
    },
    verticals: {
      eyebrow: "FROM PERSONAL INTELLIGENCE TO SOVEREIGN INFRASTRUCTURE",
      title: "NowGo brings Sovereign Intelligence to organizations.",
      subtitle:
        "Xavier makes Sovereign Intelligence accessible to an individual. NowGo connects intelligence, data, workflows and institutional context for enterprises and governments — with the same sovereign foundation and a playbook tuned to each domain.",
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
        kicker: "FOR ORGANIZATIONS",
        name: "NowGo Sovereign Intelligence",
        desc: "Sovereign Intelligence for enterprises and governments that need to connect data, workflows and institutional context. Proprietary LLMs, dedicated GPU infrastructure and agents that execute critical workflows with corporate governance.",
        items: [
          { name: "Health", desc: "Voice agents for hospital networks, intelligent triage, medical records and clinical support." },
          { name: "Education", desc: "Adaptive tutors, academic automation and assistants for public and private school management." },
          { name: "Environment", desc: "Environmental monitoring, operational ESG and analytics for regulators." },
          { name: "Agtech", desc: "Crop optimization, support for cooperatives and agents for rural property management." },
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
          title: "Integrated Public Platform",
          metric: "",
          metricLabel: "Smart City",
          desc: "Ready for deployment — digital cabinet, citizen services and 24/7 operation, scope sized by territory, departments and legacy systems.",
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
      footer: "",
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
      eyebrow: "TWO DOORS INTO SOVEREIGN INTELLIGENCE",
      title: "Start with Xavier or talk to NowGo for your organization.",
      subtitle:
        "Xavier is the direct door for professionals. Enterprises and governments can work with NowGo on a Sovereign Intelligence layer that connects data, workflows and institutional context.",
      enterpriseEyebrow: "FOR ORGANIZATIONS",
      enterpriseTitle: "Sovereign Intelligence for enterprises and governments.",
      selfService: {
        eyebrow: "FOR PROFESSIONALS · XAVIER",
        title: "Xavier · Your Personal Sovereign Intelligence.",
        subtitle: "Start now with session memory, voice, text and artifact generation through one simple experience over sophisticated infrastructure.",
        plans: [
          {
            code: "sovereign_platform_pro_monthly",
            name: "Sovereign Intelligence Platform Pro",
            price: "US$499",
            period: "/month",
            credits: "5,000 monthly credits",
            desc: "For professionals and teams that need to turn information into decisions and deliverables with sovereign intelligence.",
            features: ["Access to the Sovereign Intelligence Platform", "Session memory and context", "Voice, text and artifact generation", "Standard support"],
            cta: "Start now",
            highlight: true,
          },
          {
            code: "sovereign_platform_business_monthly",
            name: "Sovereign Intelligence Platform Business",
            price: "US$999",
            period: "/month",
            credits: "15,000 monthly credits",
            desc: "For teams that need greater operational capacity, shared use and work governance.",
            features: ["Everything in Pro", "Larger monthly credit allowance", "Operational priority", "Customer Portal for subscription management"],
            cta: "Choose Business",
            highlight: false,
          },
        ],
        creditsTitle: "Additional credit packs",
        creditsSubtitle: "Expand capacity without changing the monthly plan. Additional credits are valid for 12 months.",
        loginRequired: "Log in or create your account to continue to secure Checkout.",
        guestTitle: "Continue to payment",
        guestDescription: "Enter your email to open secure Checkout. Your account will be configured after payment is confirmed.",
        guestEmailLabel: "Billing email",
        guestContinue: "Go to payment",
        guestCancel: "Cancel",
        guestLogin: "Log in and continue",
        guestAccountExists: "This email already has an account. Log in to continue your purchase.",
        accessDenied: "Your account does not have access to the Sovereign Intelligence Platform yet. Contact your administrator.",
        unavailable: "Checkout is temporarily unavailable. Try again or contact the team.",
        packs: [
          { code: "sovereign_credits_1000", name: "1,000 credits", price: "US$49", unit: "US$0.049 per credit", cta: "Add credits" },
          { code: "sovereign_credits_3000", name: "3,000 credits", price: "US$129", unit: "US$0.043 per credit", cta: "Add credits" },
          { code: "sovereign_credits_10000", name: "10,000 credits", price: "US$399", unit: "US$0.0399 per credit", cta: "Add credits" },
        ],
      },
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
      title: "From your intelligence to your organization's intelligence.",
      subtitle:
        "Start with Xavier at the personal and professional level. If you represent an enterprise or government, talk to NowGo about Sovereign Intelligence, institutional context and tailored infrastructure.",
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
      cockpitCta: "Acceder al Cockpit",
    },
    hero: {
      tag: "XAVIER · VOICE-FIRST INTELLIGENCE · NOWGO AI",
      titleA: "XAVIER",
      titleB: "Tu inteligencia soberana personal.",
      subtitle:
        "Tu inteligencia. Tu memoria. Tu control. Una inteligencia que entiende tu contexto, preserva lo que importa y trabaja con investigación, creación y ejecución — por voz o texto — en una experiencia simple.",
      ctaPrimary: "Empezar con Xavier",
      ctaSecondary: "IA soberana para organizaciones",
      kpiA: "Memoria y contexto por sesión",
      kpiB: "Voz y texto, una inteligencia",
      kpiC: "NowGo · Sovereign Intelligence",
    },
    platform: {
      eyebrow: "XAVIER · UNA INTELIGENCIA. CONTEXTO CONTINUO.",
      title: "La inteligencia que gestiona la complejidad por usted.",
      subtitle:
        "Xavier entiende su contexto y le ayuda a investigar, pensar, crear y ejecutar — por voz o texto — sin exigirle gestionar modelos, herramientas o complejidad técnica.",
      pillars: [
        {
          tag: "01 · MEMORIA + CONTEXTO",
          title: "Su trabajo permanece conectado",
          desc: "Xavier preserva el contexto de sus sesiones para que retome ideas, decisiones y archivos sin empezar desde cero.",
        },
        {
          tag: "02 · VOICE-FIRST",
          title: "Hable o escriba. La inteligencia es la misma.",
          desc: "Use voz o texto para investigar, analizar, crear y ejecutar tareas compatibles con el sistema.",
        },
        {
          tag: "03 · INTELLIGENCE OS",
          title: "Una experiencia simple sobre mucha complejidad",
          desc: "Xavier conecta memoria, modelos, herramientas, investigación y datos sin pedirle gestionar APIs, proveedores o enrutamiento.",
        },
        {
          tag: "04 · RESEARCH + THINKING",
          title: "Investigue, piense y decida mejor",
          desc: "Convierta preguntas en briefings, análisis y próximos pasos con el contexto de su trabajo.",
        },
        {
          tag: "05 · DOCUMENTS + PRESENTATIONS",
          title: "Del briefing al entregable",
          desc: "Genere documentos, PDFs y presentaciones cuando necesite convertir una idea en un artefacto listo para usar.",
        },
        {
          tag: "06 · MULTI-CHANNEL CONTINUITY",
          title: "Continúe más allá del navegador",
          desc: "Mantenga la continuidad de su inteligencia en los canales conectados, incluido texto y voz a través de Telegram.",
        },
      ],
    },
    verticals: {
      eyebrow: "DE LA INTELIGENCIA PERSONAL A LA INFRAESTRUCTURA SOBERANA",
      title: "NowGo lleva Inteligencia Soberana a las organizaciones.",
      subtitle:
        "Xavier hace accesible la Inteligencia Soberana a una persona. NowGo conecta inteligencia, datos, flujos de trabajo y contexto institucional para empresas y gobiernos — con la misma base soberana y un playbook adaptado a cada dominio.",
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
        kicker: "PARA ORGANIZACIONES",
        name: "NowGo Sovereign Intelligence",
        desc: "Inteligencia soberana para empresas y gobiernos que necesitan conectar datos, flujos de trabajo y contexto institucional. LLMs propietarios, infraestructura GPU dedicada y agentes que ejecutan flujos críticos con gobernanza corporativa.",
        items: [
          { name: "Health", desc: "Agentes de voz para redes hospitalarias, triaje inteligente, historia clínica y soporte a equipos médicos." },
          { name: "Education", desc: "Tutores adaptativos, automatización académica y asistentes para gestión escolar pública y privada." },
          { name: "Environment", desc: "Monitoreo ambiental, ESG operativo y analítica para órganos reguladores." },
          { name: "Agtech", desc: "Optimización de cosecha, soporte a cooperativas y agentes para gestión de propiedades rurales." },
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
          title: "Plataforma Pública Integrada",
          metric: "",
          metricLabel: "Smart City",
          desc: "Lista para despliegue — gabinete digital, atención al ciudadano y operación 24/7, alcance dimensionado por territorio, secretarías y sistemas legados.",
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
      footer: "",
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
      eyebrow: "DOS PUERTAS A LA INTELIGENCIA SOBERANA",
      title: "Empiece con Xavier o hable con NowGo para su organización.",
      subtitle:
        "Xavier es la puerta directa para profesionales. Empresas y gobiernos pueden trabajar con NowGo en una capa de Inteligencia Soberana que conecta datos, flujos y contexto institucional.",
      enterpriseEyebrow: "PARA ORGANIZACIONES",
      enterpriseTitle: "Sovereign Intelligence para empresas y gobiernos.",
      selfService: {
        eyebrow: "PARA PROFESIONALES · XAVIER",
        title: "Xavier · Tu inteligencia soberana personal.",
        subtitle: "Empiece ahora con memoria por sesión, voz, texto y generación de artefactos en una experiencia simple sobre una infraestructura sofisticada.",
        plans: [
          {
            code: "sovereign_platform_pro_monthly",
            name: "Plataforma de Inteligencia Soberana Pro",
            price: "US$499",
            period: "/mes",
            credits: "5.000 créditos mensuales",
            desc: "Para profesionales y equipos que necesitan convertir información en decisiones y entregas con inteligencia soberana.",
            features: ["Acceso a la Plataforma de Inteligencia Soberana", "Memoria y contexto por sesión", "Voz, texto y generación de artefactos", "Soporte estándar"],
            cta: "Comenzar ahora",
            highlight: true,
          },
          {
            code: "sovereign_platform_business_monthly",
            name: "Plataforma de Inteligencia Soberana Business",
            price: "US$999",
            period: "/mes",
            credits: "15.000 créditos mensuales",
            desc: "Para equipos que necesitan mayor capacidad operativa, uso compartido y gobernanza del trabajo.",
            features: ["Todo lo incluido en Pro", "Mayor franquicia mensual de créditos", "Prioridad operativa", "Customer Portal para gestionar la suscripción"],
            cta: "Elegir Business",
            highlight: false,
          },
        ],
        creditsTitle: "Paquetes adicionales de créditos",
        creditsSubtitle: "Amplíe su capacidad sin cambiar el plan mensual. Los créditos adicionales tienen validez de 12 meses.",
        loginRequired: "Inicie sesión o cree su cuenta para continuar al Checkout seguro.",
        guestTitle: "Continuar al pago",
        guestDescription: "Informe su email para abrir el Checkout seguro. La cuenta se configurará después de confirmar el pago.",
        guestEmailLabel: "Email de facturación",
        guestContinue: "Ir al pago",
        guestCancel: "Cancelar",
        guestLogin: "Iniciar sesión y continuar",
        guestAccountExists: "Este email ya tiene una cuenta. Inicie sesión para continuar la compra.",
        accessDenied: "Su cuenta aún no tiene acceso a la Plataforma de Inteligencia Soberana. Hable con el administrador.",
        unavailable: "El Checkout no está disponible temporalmente. Inténtelo de nuevo o hable con el equipo.",
        packs: [
          { code: "sovereign_credits_1000", name: "1.000 créditos", price: "US$49", unit: "US$0,049 por crédito", cta: "Añadir créditos" },
          { code: "sovereign_credits_3000", name: "3.000 créditos", price: "US$129", unit: "US$0,043 por crédito", cta: "Añadir créditos" },
          { code: "sovereign_credits_10000", name: "10.000 créditos", price: "US$399", unit: "US$0,0399 por crédito", cta: "Añadir créditos" },
        ],
      },
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
      title: "De tu inteligencia a la inteligencia de tu organización.",
      subtitle:
        "Empieza con Xavier en el nivel personal y profesional. Si representa a una empresa o gobierno, hable con NowGo sobre Inteligencia Soberana, contexto institucional e infraestructura a medida.",
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
          { label: "Manifesto", href: "/manifesto" },
          { label: "Política de Privacidad", href: "/privacidade" },
          { label: "Contacto", href: "#contact" },
        ],
      },
      copyright: "© 2026 NowGo AI. Todos los derechos reservados.",
    },
  },
} as const;

export type Copy = typeof copy.pt;
