import type { Lang } from "@/landing/copy";
import type { ArticleCopy } from "@/blog/ArticleI18n";

/** Conteúdo trilíngue do artigo "Agentes de IA". */

export const agentesCopy: Record<Lang, ArticleCopy> = {
  /* ------------------------------------------------------------------ PT */
  pt: {
    seoTitle:
      "Agentes de IA: o que são, como funcionam e o que muda para empresas e governos · NowGo AI",
    seoDescription:
      "Agentes de inteligência artificial explicados: a diferença entre chatbot, copiloto e agente autônomo, como agentes executam processos de ponta a ponta, e o que é preciso para usá-los com segurança em empresas e governos.",
    eyebrow: "Guia NowGo AI · Conceitos",
    title: "Agentes de IA: o que são, como funcionam e o que muda para empresas e governos",
    subtitle:
      "O chatbot responde; o agente executa. Entenda a tecnologia que transforma IA de ferramenta de produtividade em força de trabalho digital — e o que é preciso para usá-la com governança.",
    tocLabel: "Neste guia",
    toc: [
      { href: "#definicao", label: "O que é um agente de IA" },
      { href: "#niveis", label: "Chatbot, copiloto e agente: os três níveis de autonomia" },
      { href: "#anatomia", label: "Como um agente funciona por dentro" },
      { href: "#casos", label: "O que agentes já fazem em operações reais" },
      { href: "#governanca", label: "Governança: como usar agentes com segurança" },
      { href: "#faq", label: "Perguntas frequentes" },
    ],
    sections: [
      {
        kind: "text",
        id: "definicao",
        heading: "O que é um agente de inteligência artificial",
        paragraphs: [
          'Um agente de IA é um sistema que recebe um objetivo — "confirme as consultas de amanhã", "concilie estes pagamentos", "responda esta solicitação do cidadão" — e executa as etapas necessárias para cumpri-lo: consulta sistemas, toma decisões dentro de regras definidas, aciona outras ferramentas e reporta o resultado. É a evolução natural da <a href="/blog/inteligencia-artificial">inteligência artificial</a> generativa: o modelo de linguagem deixa de apenas conversar e passa a operar.',
          'A distinção importa porque muda a pergunta que a organização deve fazer. Com chatbots, a pergunta era "como a IA pode ajudar minha equipe a responder mais rápido?". Com agentes, a pergunta passa a ser "quais processos inteiros posso delegar, mantendo supervisão humana nos pontos que importam?".',
        ],
      },
      {
        kind: "text",
        id: "niveis",
        heading: "Chatbot, copiloto e agente: os três níveis de autonomia",
        paragraphs: [
          "<strong>Chatbot</strong> — responde perguntas em linguagem natural. Útil, mas passivo: toda ação continua com o humano.",
          "<strong>Copiloto</strong> — trabalha lado a lado com uma pessoa dentro de uma ferramenta: rascunha o texto, sugere o código, resume a reunião. A produtividade sobe, mas o ritmo continua limitado pela jornada humana.",
          "<strong>Agente autônomo</strong> — recebe o objetivo e conduz o fluxo de ponta a ponta, acionando sistemas e pessoas quando necessário. Opera 24/7, em escala, com cada ação registrada. É o nível em que a IA passa a compor a capacidade operacional da organização — e o nível que exige arquitetura e governança de verdade.",
        ],
      },
      {
        kind: "text",
        id: "anatomia",
        heading: "Como um agente funciona por dentro",
        paragraphs: [
          "Todo agente combina quatro componentes. O <strong>cérebro</strong> é um modelo de linguagem (LLM) — em contextos corporativos e públicos, idealmente customizado com o vocabulário, as regras e os dados da organização. A <strong>memória e o contexto</strong> conectam o agente às fontes de verdade da operação: agenda, ERP, CRM, prontuário, bases de dados. As <strong>ferramentas</strong> são as ações que ele pode executar — enviar mensagem, atualizar registro, fazer uma ligação por voz, acionar outro sistema. E a <strong>orquestração</strong> é a camada que coordena tudo: define o que o agente pode fazer sozinho, o que exige aprovação humana e como cada passo é registrado para auditoria.",
          'É por isso que agentes isolados, comprados como apps avulsos, entregam pouco: sem integração com os sistemas reais e sem camada de orquestração, o "agente" volta a ser um chatbot. O valor está na infraestrutura que conecta modelos, dados e sistemas — modular, interoperável e sob controle da organização.',
        ],
      },
      {
        kind: "cta",
        title: "Agentes autônomos integrados à sua operação",
        text: "A NowGo AI desenha e implanta agentes de IA — de voz e de backoffice — como módulos de uma camada de orquestração soberana, conectada aos sistemas que sua organização já usa.",
        waMsg:
          "Olá! Li o artigo sobre agentes de IA da NowGo AI e quero avaliar agentes autônomos para a minha operação.",
        waLabel: "Avaliar agentes na minha operação",
      },
      {
        kind: "text",
        id: "casos",
        heading: "O que agentes já fazem em operações reais",
        paragraphs: [
          '<strong>Atendimento por voz</strong> — agentes que atendem e fazem ligações em linguagem natural: agendamento e confirmação na <a href="/blog/inteligencia-artificial-na-saude">saúde</a>, atendimento ao cidadão em serviços públicos, cobrança e pós-venda em empresas.',
          "<strong>Backoffice</strong> — conciliação financeira, conferência de faturamento, follow-up de pendências, atualização de cadastros: fluxos repetitivos de várias etapas que o agente executa nos próprios sistemas da organização.",
          "<strong>Gestão e decisão</strong> — agentes que monitoram indicadores, cruzam bases públicas e internas e produzem briefings operacionais para gestores, transformando dado disperso em decisão diária. É o padrão que orienta plataformas de orquestração urbana e corporativa.",
        ],
      },
      {
        kind: "text",
        id: "governanca",
        heading: "Governança: como usar agentes com segurança",
        paragraphs: [
          "Autonomia sem governança é passivo, não ativo. Quatro princípios separam projetos maduros de experimentos arriscados: <strong>permissão mínima</strong> (o agente só acessa o que a tarefa exige), <strong>aprovação humana</strong> em ações sensíveis ou irreversíveis, <strong>trilha de auditoria</strong> de cada ação executada e <strong>soberania</strong> — dados e modelos operando em infraestrutura sob controle e jurisdição da organização, requisito inegociável para governos e para setores regulados.",
          'Com esses guarda-corpos, o agente deixa de ser uma caixa-preta e vira o que deve ser: força de trabalho digital auditável, que amplia a equipe humana em vez de criar risco novo. É o modelo de arquitetura que a NowGo AI, parceira NVIDIA, aplica em seus projetos de <a href="/">infraestrutura soberana de IA para empresas, governos e cidades</a>.',
        ],
      },
    ],
    faqTitle: "Perguntas frequentes sobre agentes de IA",
    faq: [
      {
        q: "O que é um agente de inteligência artificial?",
        a: "Um agente de IA é um sistema que, além de compreender e gerar linguagem, executa ações para cumprir um objetivo: consulta sistemas, preenche registros, envia comunicações, aciona outros softwares e conduz fluxos de trabalho de várias etapas — com supervisão humana definida em pontos críticos. A diferença para um chatbot é o verbo: o chatbot responde; o agente faz.",
      },
      {
        q: "Qual a diferença entre um agente de IA e o ChatGPT?",
        a: "O ChatGPT é um assistente de conversa de propósito geral: você pergunta, ele responde. Um agente corporativo é especializado em processos da organização e conectado aos seus sistemas — agenda, ERP, CRM, prontuário — podendo executar tarefas de ponta a ponta dentro de regras e permissões definidas. Muitos agentes usam LLMs como 'cérebro', mas o valor está na integração e na governança, não apenas no modelo.",
      },
      {
        q: "O que é um LLM?",
        a: "LLM (Large Language Model, ou grande modelo de linguagem) é o tipo de modelo de IA treinado com volumes massivos de texto para compreender e gerar linguagem natural. É a tecnologia base da IA generativa e dos agentes. Em contexto empresarial e governamental, LLMs podem ser customizados com os dados e as regras da organização e executados em infraestrutura própria — o que garante especialização e soberania.",
      },
      {
        q: "Agentes de IA são seguros para uso em empresas e governos?",
        a: "Sim, quando desenhados com guarda-corpos: permissões mínimas por tarefa, pontos de aprovação humana em ações sensíveis, trilha de auditoria completa de tudo que o agente fez e infraestrutura sob controle da organização. Agente sem governança é risco; agente com arquitetura correta é força de trabalho digital auditável.",
      },
      {
        q: "Por onde começar com agentes de IA?",
        a: "Pelo processo repetitivo de maior volume e regras mais claras: confirmação e agendamento por voz, triagem de solicitações, conciliações e follow-ups de backoffice. Um piloto de escopo fechado, com indicador numérico e supervisão humana, prova o valor em semanas e define o padrão de governança para escalar.",
      },
    ],
    finalTitle: "Pronto para colocar agentes de IA para trabalhar?",
    finalSub:
      "Diagnóstico dos processos com maior potencial de automação e desenho da arquitetura de agentes com governança — direto ao ponto, sem compromisso.",
    ctaSchedule: "Agendar reunião",
    ctaWhatsapp: "Falar no WhatsApp",
    ctaPlatform: "Conhecer a plataforma",
    ctaDiagnosis: "Agendar diagnóstico",
    finalWaMsg:
      "Olá! Li o artigo sobre agentes de IA da NowGo AI e quero avaliar agentes autônomos para a minha operação.",
  },

  /* ------------------------------------------------------------------ EN */
  en: {
    seoTitle:
      "AI Agents: What They Are, How They Work and What Changes for Companies and Governments · NowGo AI",
    seoDescription:
      "AI agents explained: the difference between chatbot, copilot and autonomous agent, how agents execute end-to-end processes, and what it takes to use them safely in companies and governments.",
    eyebrow: "NowGo AI Guide · Concepts",
    title: "AI Agents: what they are, how they work and what changes for companies and governments",
    subtitle:
      "The chatbot answers; the agent executes. Understand the technology that turns AI from a productivity tool into a digital workforce — and what it takes to use it with governance.",
    tocLabel: "In this guide",
    toc: [
      { href: "#definicao", label: "What an AI agent is" },
      { href: "#niveis", label: "Chatbot, copilot and agent: the three levels of autonomy" },
      { href: "#anatomia", label: "How an agent works inside" },
      { href: "#casos", label: "What agents already do in real operations" },
      { href: "#governanca", label: "Governance: how to use agents safely" },
      { href: "#faq", label: "Frequently asked questions" },
    ],
    sections: [
      {
        kind: "text",
        id: "definicao",
        heading: "What an artificial intelligence agent is",
        paragraphs: [
          'An AI agent is a system that receives a goal — "confirm tomorrow\'s appointments", "reconcile these payments", "answer this citizen\'s request" — and executes the steps needed to accomplish it: it queries systems, makes decisions within defined rules, triggers other tools and reports the result. It is the natural evolution of generative AI: the language model stops just conversing and starts operating.',
          'The distinction matters because it changes the question the organization should ask. With chatbots, the question was "how can AI help my team respond faster?". With agents, the question becomes "which entire processes can I delegate, keeping human supervision at the points that matter?".',
        ],
      },
      {
        kind: "text",
        id: "niveis",
        heading: "Chatbot, copilot and agent: the three levels of autonomy",
        paragraphs: [
          "<strong>Chatbot</strong> — answers questions in natural language. Useful, but passive: every action remains with the human.",
          "<strong>Copilot</strong> — works side by side with a person inside a tool: drafts the text, suggests the code, summarizes the meeting. Productivity rises, but the pace is still limited by the human workday.",
          "<strong>Autonomous agent</strong> — receives the goal and runs the workflow end to end, engaging systems and people when needed. It operates 24/7, at scale, with every action logged. This is the level at which AI becomes part of the organization's operational capacity — and the level that demands real architecture and governance.",
        ],
      },
      {
        kind: "text",
        id: "anatomia",
        heading: "How an agent works inside",
        paragraphs: [
          "Every agent combines four components. The <strong>brain</strong> is a language model (LLM) — in corporate and public contexts, ideally customized with the organization's vocabulary, rules and data. <strong>Memory and context</strong> connect the agent to the operation's sources of truth: calendar, ERP, CRM, medical records, databases. <strong>Tools</strong> are the actions it can perform — send a message, update a record, make a voice call, trigger another system. And <strong>orchestration</strong> is the layer that coordinates everything: it defines what the agent can do alone, what requires human approval and how each step is logged for auditing.",
          'That is why isolated agents, bought as standalone apps, deliver little: without integration with real systems and without an orchestration layer, the "agent" becomes a chatbot again. The value lies in the infrastructure that connects models, data and systems — modular, interoperable and under the organization\'s control.',
        ],
      },
      {
        kind: "cta",
        title: "Autonomous agents integrated into your operation",
        text: "NowGo AI designs and deploys AI agents — voice and back office — as modules of a sovereign orchestration layer, connected to the systems your organization already uses.",
        waMsg:
          "Hello! I read NowGo AI's article on AI agents and I'd like to evaluate autonomous agents for my operation.",
        waLabel: "Evaluate agents for my operation",
      },
      {
        kind: "text",
        id: "casos",
        heading: "What agents already do in real operations",
        paragraphs: [
          "<strong>Voice service</strong> — agents that answer and place calls in natural language: scheduling and confirmation in healthcare, citizen services in the public sector, collections and after-sales in companies.",
          "<strong>Back office</strong> — financial reconciliation, billing checks, follow-up on pending items, record updates: repetitive multi-step flows the agent executes in the organization's own systems.",
          "<strong>Management and decision</strong> — agents that monitor indicators, cross public and internal databases and produce operational briefings for managers, turning scattered data into daily decisions. It is the pattern behind urban and corporate orchestration platforms.",
        ],
      },
      {
        kind: "text",
        id: "governanca",
        heading: "Governance: how to use agents safely",
        paragraphs: [
          "Autonomy without governance is a liability, not an asset. Four principles separate mature projects from risky experiments: <strong>least privilege</strong> (the agent only accesses what the task requires), <strong>human approval</strong> for sensitive or irreversible actions, an <strong>audit trail</strong> of every action executed, and <strong>sovereignty</strong> — data and models operating on infrastructure under the organization's control and jurisdiction, a non-negotiable requirement for governments and regulated sectors.",
          'With these guardrails, the agent stops being a black box and becomes what it should be: an auditable digital workforce that amplifies the human team instead of creating new risk. It is the architecture model that NowGo AI, an NVIDIA partner, applies in its projects of <a href="/">sovereign AI infrastructure for companies, governments and cities</a>.',
        ],
      },
    ],
    faqTitle: "Frequently asked questions about AI agents",
    faq: [
      {
        q: "What is an artificial intelligence agent?",
        a: "An AI agent is a system that, beyond understanding and generating language, executes actions to accomplish a goal: it queries systems, fills in records, sends communications, triggers other software and runs multi-step workflows — with human supervision defined at critical points. The difference from a chatbot is the verb: the chatbot answers; the agent does.",
      },
      {
        q: "What is the difference between an AI agent and ChatGPT?",
        a: "ChatGPT is a general-purpose conversational assistant: you ask, it answers. A corporate agent is specialized in the organization's processes and connected to its systems — calendar, ERP, CRM, medical records — and can execute tasks end to end within defined rules and permissions. Many agents use LLMs as their 'brain', but the value lies in integration and governance, not just the model.",
      },
      {
        q: "What is an LLM?",
        a: "An LLM (Large Language Model) is the type of AI model trained on massive volumes of text to understand and generate natural language. It is the base technology of generative AI and agents. In business and government contexts, LLMs can be customized with the organization's data and rules and run on its own infrastructure — ensuring specialization and sovereignty.",
      },
      {
        q: "Are AI agents safe for use in companies and governments?",
        a: "Yes, when designed with guardrails: least-privilege permissions per task, human approval points for sensitive actions, a complete audit trail of everything the agent did, and infrastructure under the organization's control. An agent without governance is a risk; an agent with the right architecture is an auditable digital workforce.",
      },
      {
        q: "Where should we start with AI agents?",
        a: "With the highest-volume repetitive process with the clearest rules: voice confirmation and scheduling, request triage, reconciliations and back-office follow-ups. A closed-scope pilot, with a numerical indicator and human supervision, proves value in weeks and sets the governance standard for scaling.",
      },
    ],
    finalTitle: "Ready to put AI agents to work?",
    finalSub:
      "Diagnosis of the processes with the highest automation potential and design of the agent architecture with governance — straight to the point, no commitment.",
    ctaSchedule: "Schedule a meeting",
    ctaWhatsapp: "Chat on WhatsApp",
    ctaPlatform: "Explore the platform",
    ctaDiagnosis: "Schedule a diagnosis",
    finalWaMsg:
      "Hello! I read NowGo AI's article on AI agents and I'd like to evaluate autonomous agents for my operation.",
  },

  /* ------------------------------------------------------------------ ES */
  es: {
    seoTitle:
      "Agentes de IA: qué son, cómo funcionan y qué cambia para empresas y gobiernos · NowGo AI",
    seoDescription:
      "Agentes de inteligencia artificial explicados: la diferencia entre chatbot, copiloto y agente autónomo, cómo los agentes ejecutan procesos de punta a punta, y qué se necesita para usarlos con seguridad en empresas y gobiernos.",
    eyebrow: "Guía NowGo AI · Conceptos",
    title: "Agentes de IA: qué son, cómo funcionan y qué cambia para empresas y gobiernos",
    subtitle:
      "El chatbot responde; el agente ejecuta. Entienda la tecnología que transforma la IA de herramienta de productividad en fuerza de trabajo digital — y qué se necesita para usarla con gobernanza.",
    tocLabel: "En esta guía",
    toc: [
      { href: "#definicao", label: "Qué es un agente de IA" },
      { href: "#niveis", label: "Chatbot, copiloto y agente: los tres niveles de autonomía" },
      { href: "#anatomia", label: "Cómo funciona un agente por dentro" },
      { href: "#casos", label: "Qué hacen ya los agentes en operaciones reales" },
      { href: "#governanca", label: "Gobernanza: cómo usar agentes con seguridad" },
      { href: "#faq", label: "Preguntas frecuentes" },
    ],
    sections: [
      {
        kind: "text",
        id: "definicao",
        heading: "Qué es un agente de inteligencia artificial",
        paragraphs: [
          'Un agente de IA es un sistema que recibe un objetivo — "confirma las consultas de mañana", "concilia estos pagos", "responde esta solicitud del ciudadano" — y ejecuta las etapas necesarias para cumplirlo: consulta sistemas, toma decisiones dentro de reglas definidas, acciona otras herramientas y reporta el resultado. Es la evolución natural de la IA generativa: el modelo de lenguaje deja de solo conversar y pasa a operar.',
          'La distinción importa porque cambia la pregunta que la organización debe hacerse. Con chatbots, la pregunta era "¿cómo puede la IA ayudar a mi equipo a responder más rápido?". Con agentes, la pregunta pasa a ser "¿qué procesos enteros puedo delegar, manteniendo supervisión humana en los puntos que importan?".',
        ],
      },
      {
        kind: "text",
        id: "niveis",
        heading: "Chatbot, copiloto y agente: los tres niveles de autonomía",
        paragraphs: [
          "<strong>Chatbot</strong> — responde preguntas en lenguaje natural. Útil, pero pasivo: toda acción sigue con el humano.",
          "<strong>Copiloto</strong> — trabaja lado a lado con una persona dentro de una herramienta: borra el texto, sugiere el código, resume la reunión. La productividad sube, pero el ritmo sigue limitado por la jornada humana.",
          "<strong>Agente autónomo</strong> — recibe el objetivo y conduce el flujo de punta a punta, accionando sistemas y personas cuando es necesario. Opera 24/7, a escala, con cada acción registrada. Es el nivel en el que la IA pasa a componer la capacidad operativa de la organización — y el nivel que exige arquitectura y gobernanza de verdad.",
        ],
      },
      {
        kind: "text",
        id: "anatomia",
        heading: "Cómo funciona un agente por dentro",
        paragraphs: [
          "Todo agente combina cuatro componentes. El <strong>cerebro</strong> es un modelo de lenguaje (LLM) — en contextos corporativos y públicos, idealmente personalizado con el vocabulario, las reglas y los datos de la organización. La <strong>memoria y el contexto</strong> conectan al agente con las fuentes de verdad de la operación: agenda, ERP, CRM, historia clínica, bases de datos. Las <strong>herramientas</strong> son las acciones que puede ejecutar — enviar un mensaje, actualizar un registro, hacer una llamada de voz, accionar otro sistema. Y la <strong>orquestación</strong> es la capa que coordina todo: define qué puede hacer el agente solo, qué exige aprobación humana y cómo se registra cada paso para auditoría.",
          'Por eso los agentes aislados, comprados como apps sueltas, entregan poco: sin integración con los sistemas reales y sin capa de orquestación, el "agente" vuelve a ser un chatbot. El valor está en la infraestructura que conecta modelos, datos y sistemas — modular, interoperable y bajo control de la organización.',
        ],
      },
      {
        kind: "cta",
        title: "Agentes autónomos integrados a su operación",
        text: "NowGo AI diseña e implementa agentes de IA — de voz y de backoffice — como módulos de una capa de orquestación soberana, conectada a los sistemas que su organización ya usa.",
        waMsg:
          "¡Hola! Leí el artículo sobre agentes de IA de NowGo AI y quiero evaluar agentes autónomos para mi operación.",
        waLabel: "Evaluar agentes en mi operación",
      },
      {
        kind: "text",
        id: "casos",
        heading: "Qué hacen ya los agentes en operaciones reales",
        paragraphs: [
          "<strong>Atención por voz</strong> — agentes que atienden y hacen llamadas en lenguaje natural: agendamiento y confirmación en salud, atención al ciudadano en servicios públicos, cobranza y posventa en empresas.",
          "<strong>Backoffice</strong> — conciliación financiera, verificación de facturación, seguimiento de pendientes, actualización de registros: flujos repetitivos de varias etapas que el agente ejecuta en los propios sistemas de la organización.",
          "<strong>Gestión y decisión</strong> — agentes que monitorean indicadores, cruzan bases públicas e internas y producen briefings operativos para gestores, transformando datos dispersos en decisión diaria. Es el patrón que orienta las plataformas de orquestación urbana y corporativa.",
        ],
      },
      {
        kind: "text",
        id: "governanca",
        heading: "Gobernanza: cómo usar agentes con seguridad",
        paragraphs: [
          "Autonomía sin gobernanza es pasivo, no activo. Cuatro principios separan los proyectos maduros de los experimentos riesgosos: <strong>permiso mínimo</strong> (el agente solo accede a lo que la tarea exige), <strong>aprobación humana</strong> en acciones sensibles o irreversibles, <strong>trazabilidad de auditoría</strong> de cada acción ejecutada y <strong>soberanía</strong> — datos y modelos operando en infraestructura bajo control y jurisdicción de la organización, requisito innegociable para gobiernos y sectores regulados.",
          'Con esas salvaguardas, el agente deja de ser una caja negra y se convierte en lo que debe ser: fuerza de trabajo digital auditable, que amplía al equipo humano en lugar de crear riesgo nuevo. Es el modelo de arquitectura que NowGo AI, socia de NVIDIA, aplica en sus proyectos de <a href="/">infraestructura soberana de IA para empresas, gobiernos y ciudades</a>.',
        ],
      },
    ],
    faqTitle: "Preguntas frecuentes sobre agentes de IA",
    faq: [
      {
        q: "¿Qué es un agente de inteligencia artificial?",
        a: "Un agente de IA es un sistema que, además de comprender y generar lenguaje, ejecuta acciones para cumplir un objetivo: consulta sistemas, completa registros, envía comunicaciones, acciona otros softwares y conduce flujos de trabajo de varias etapas — con supervisión humana definida en puntos críticos. La diferencia con un chatbot es el verbo: el chatbot responde; el agente hace.",
      },
      {
        q: "¿Cuál es la diferencia entre un agente de IA y ChatGPT?",
        a: "ChatGPT es un asistente de conversación de propósito general: usted pregunta, él responde. Un agente corporativo está especializado en los procesos de la organización y conectado a sus sistemas — agenda, ERP, CRM, historia clínica — pudiendo ejecutar tareas de punta a punta dentro de reglas y permisos definidos. Muchos agentes usan LLMs como 'cerebro', pero el valor está en la integración y la gobernanza, no solo en el modelo.",
      },
      {
        q: "¿Qué es un LLM?",
        a: "LLM (Large Language Model, o gran modelo de lenguaje) es el tipo de modelo de IA entrenado con volúmenes masivos de texto para comprender y generar lenguaje natural. Es la tecnología base de la IA generativa y de los agentes. En contexto empresarial y gubernamental, los LLMs pueden personalizarse con los datos y las reglas de la organización y ejecutarse en infraestructura propia — lo que garantiza especialización y soberanía.",
      },
      {
        q: "¿Los agentes de IA son seguros para empresas y gobiernos?",
        a: "Sí, cuando se diseñan con salvaguardas: permisos mínimos por tarea, puntos de aprobación humana en acciones sensibles, trazabilidad completa de todo lo que hizo el agente e infraestructura bajo control de la organización. Un agente sin gobernanza es riesgo; un agente con la arquitectura correcta es fuerza de trabajo digital auditable.",
      },
      {
        q: "¿Por dónde empezar con agentes de IA?",
        a: "Por el proceso repetitivo de mayor volumen y reglas más claras: confirmación y agendamiento por voz, triaje de solicitudes, conciliaciones y seguimientos de backoffice. Un piloto de alcance cerrado, con indicador numérico y supervisión humana, prueba el valor en semanas y define el estándar de gobernanza para escalar.",
      },
    ],
    finalTitle: "¿Listo para poner agentes de IA a trabajar?",
    finalSub:
      "Diagnóstico de los procesos con mayor potencial de automatización y diseño de la arquitectura de agentes con gobernanza — directo al punto, sin compromiso.",
    ctaSchedule: "Agendar reunión",
    ctaWhatsapp: "Hablar por WhatsApp",
    ctaPlatform: "Conocer la plataforma",
    ctaDiagnosis: "Agendar diagnóstico",
    finalWaMsg:
      "¡Hola! Leí el artículo sobre agentes de IA de NowGo AI y quiero evaluar agentes autónomos para mi operación.",
  },
};
