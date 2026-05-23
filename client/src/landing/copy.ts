/**
 * Conteúdo bilíngue (PT-BR / EN) da landing page nowgo ai.
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

export type Lang = "pt" | "en";

export const copy = {
  pt: {
    nav: {
      platform: "Plataforma",
      verticals: "Verticais",
      cases: "Cases",
      pricing: "Investimento",
      cockpitCta: "Acessar Cockpit",
    },
    hero: {
      tag: "AI NATIVE COMPANY · NVIDIA PARTNER EXPERT",
      titleA: "Inteligência soberana",
      titleB: "para empresas e governos.",
      subtitle:
        "Construímos LLMs proprietárias, infraestrutura de IA sob medida e agentes autônomos que substituem fluxos manuais inteiros — com dados sob jurisdição nacional e operação 24/7.",
      ctaPrimary: "Solicitar Acesso Estratégico",
      ctaSecondary: "Acessar Cockpit",
      kpiA: "108 oportunidades ativas",
      kpiB: "R$ 63,07MM em pipeline",
      kpiC: "Smart City Fase 1",
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
      eyebrow: "VERTICAIS",
      title: "Seis frentes onde já operamos com profundidade.",
      subtitle:
        "A nowgo ai foi reconhecida no Top 50 Global pelo trabalho aplicado em mercados sensíveis. Cada vertical tem playbook próprio, parceiros tecnológicos e métricas de impacto.",
      items: [
        { name: "Smart Cities", desc: "Plataformas Públicas Integradas, gabinetes digitais, atendimento ao cidadão e gestão de cidades inteligentes." },
        { name: "Health", desc: "Agentes de voz para redes hospitalares, triagem inteligente, prontuários e suporte a equipes clínicas." },
        { name: "Education", desc: "Tutores adaptativos, automação acadêmica e assistentes para gestão escolar pública e privada." },
        { name: "Environment", desc: "Monitoramento ambiental, ESG operacional e analytics para órgãos reguladores." },
        { name: "Agro", desc: "Otimização de safra, suporte a cooperativas e agentes para gestão de propriedades rurais." },
        { name: "Entertainment", desc: "Personalização em escala, agentes de fan engagement e produção assistida por IA." },
      ],
    },
    cases: {
      eyebrow: "CASES E PROVAS",
      title: "Resultados auditáveis, não promessas.",
      subtitle:
        "Cada número abaixo foi conferido contra a base ATIVOS CRM IA da nowgo ai e contra contratos formais. Nada inventado.",
      items: [
        {
          tag: "SMART CITY",
          title: "Smart City — Plataforma Pública Integrada",
          metric: "",
          metricLabel: "Fase 1 contratada",
          desc: "Implementação inicial em curso na esfera de governo, com escopo de expansão direto por fases subsequentes — gabinete digital, atendimento ao cidadão e operação 24/7.",
        },
        {
          tag: "FINTECH",
          title: "Orquestra de Agentes de IA com receita recorrente",
          metric: "",
          metricLabel: "Setup + recorrência mensal",
          desc: "Múltiplos agentes orquestrados em produção, com contrato assinado em cliente do setor financeiro. Modelo replicável de setup + MRR aplicado a serviços financeiros, compliance e operações.",
        },
        {
          tag: "JURÍDICO",
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
          desc: "Plataforma Pública Integrada para governos. Fase 1 contratada com expansão programada por etapas — escopo dimensionado conforme território, secretarias e sistemas legados.",
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
      title: "Sua próxima década será AI Native. A pergunta é quem vai construir.",
      subtitle:
        "A nowgo ai opera com método, governança e equipe própria. Conversamos primeiro, propomos depois — só formalizamos quando o caso de uso realmente faz sentido.",
      ctaPrimary: "Solicitar Acesso Estratégico",
      ctaSecondary: "Falar no WhatsApp",
    },
    footer: {
      tag: "AI NATIVE COMPANY",
      brand: "nowgo ai",
      desc: "Plataforma de IA empresarial para um mundo soberano e humano. Built in Brazil. Trusted globally.",
      colA: { title: "Plataforma", links: ["Custom LLMs", "Tailored IaaS", "Autonomous Agents", "Smart City 2036"] },
      colB: { title: "Empresa", links: ["Sobre", "Cases", "Carreiras", "Imprensa"] },
      colC: { title: "Recursos", links: ["Cockpit interno", "Manifesto", "Política de Privacidade", "Contato"] },
      copyright: "© 2026 nowgo ai. Todos os direitos reservados.",
    },
  },
  en: {
    nav: {
      platform: "Platform",
      verticals: "Verticals",
      cases: "Cases",
      pricing: "Investment",
      cockpitCta: "Open Cockpit",
    },
    hero: {
      tag: "AI NATIVE COMPANY · NVIDIA PARTNER EXPERT",
      titleA: "Sovereign intelligence",
      titleB: "for enterprises and governments.",
      subtitle:
        "We build proprietary LLMs, tailored AI infrastructure and autonomous agents that replace entire manual workflows — with data under sovereign jurisdiction and 24/7 operation.",
      ctaPrimary: "Request Strategic Access",
      ctaSecondary: "Open Cockpit",
      kpiA: "108 active opportunities",
      kpiB: "BRL 63.07 MM in pipeline",
      kpiC: "Smart City Phase 1",
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
      eyebrow: "VERTICALS",
      title: "Six fronts where we already operate with depth.",
      subtitle:
        "nowgo ai was recognized in the Top 50 Global for applied work in sensitive markets. Each vertical has its own playbook, technology partners and impact metrics.",
      items: [
        { name: "Smart Cities", desc: "Integrated Public Platforms, digital cabinets, citizen services and smart city operations." },
        { name: "Health", desc: "Voice agents for hospital networks, intelligent triage, medical records and clinical support." },
        { name: "Education", desc: "Adaptive tutors, academic automation and assistants for public and private school management." },
        { name: "Environment", desc: "Environmental monitoring, operational ESG and analytics for regulators." },
        { name: "Agro", desc: "Crop optimization, support for cooperatives and agents for rural property management." },
        { name: "Entertainment", desc: "Personalization at scale, fan engagement agents and AI-assisted production." },
      ],
    },
    cases: {
      eyebrow: "CASES AND PROOFS",
      title: "Auditable results, not promises.",
      subtitle:
        "Every number below was verified against nowgo ai's ATIVOS CRM IA database and against formal contracts. Nothing made up.",
      items: [
        {
          tag: "SMART CITY",
          title: "Smart City — Integrated Public Platform",
          metric: "",
          metricLabel: "Phase 1 contracted",
          desc: "Initial implementation underway at the government level, with planned expansion across subsequent phases — digital cabinet, citizen services and 24/7 operation.",
        },
        {
          tag: "FINTECH",
          title: "AI Agent Orchestra with recurring revenue",
          metric: "",
          metricLabel: "Setup + monthly recurring",
          desc: "Multi-agent orchestration in production, with a signed contract at a financial-sector client. Replicable setup + MRR model applied to financial services, compliance and operations.",
        },
        {
          tag: "LEGAL",
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
          desc: "Integrated Public Platform for governments. Phase 1 contracted with planned multi-stage expansion — scope sized by territory, departments and legacy systems.",
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
      title: "Your next decade will be AI Native. The question is who will build it.",
      subtitle:
        "nowgo ai operates with method, governance and an in-house team. We talk first, then propose — and only formalize when the use case truly makes sense.",
      ctaPrimary: "Request Strategic Access",
      ctaSecondary: "WhatsApp us",
    },
    footer: {
      tag: "AI NATIVE COMPANY",
      brand: "nowgo ai",
      desc: "Enterprise AI platform for a sovereign and human world. Built in Brazil. Trusted globally.",
      colA: { title: "Platform", links: ["Custom LLMs", "Tailored IaaS", "Autonomous Agents", "Smart City 2036"] },
      colB: { title: "Company", links: ["About", "Cases", "Careers", "Press"] },
      colC: { title: "Resources", links: ["Internal cockpit", "Manifesto", "Privacy policy", "Contact"] },
      copyright: "© 2026 nowgo ai. All rights reserved.",
    },
  },
} as const;

export type Copy = typeof copy.pt;
