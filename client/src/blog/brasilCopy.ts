import type { Lang } from "@/landing/copy";
import type { ArticleCopy } from "@/blog/ArticleI18n";

/** Conteúdo trilíngue do artigo "IA no Brasil / soberania". */

export const brasilCopy: Record<Lang, ArticleCopy> = {
  /* ------------------------------------------------------------------ PT */
  pt: {
    seoTitle:
      "Inteligência Artificial no Brasil: por que soberania é a decisão estratégica da década · NowGo AI",
    seoDescription:
      "O cenário da IA no Brasil, a corrida geopolítica entre EUA e China e por que empresas e governos brasileiros precisam de IA soberana: dados sob jurisdição nacional, modelos auditáveis e autonomia estratégica.",
    eyebrow: "Guia NowGo AI · Brasil",
    title:
      "Inteligência Artificial no Brasil: por que soberania é a decisão estratégica da década",
    subtitle:
      "A corrida de IA virou geopolítica. Entre os modelos americanos e os chineses, a pergunta que importa para empresas e governos brasileiros é outra: quem controla os dados, os modelos e as decisões?",
    tocLabel: "Neste guia",
    toc: [
      { href: "#corrida", label: "A corrida global: EUA, China e o resto do mundo" },
      { href: "#brasil", label: "Onde o Brasil está — dependências e ativos" },
      { href: "#soberania", label: "O que é IA soberana (e o que não é)" },
      { href: "#pratica", label: "Soberania na prática: a arquitetura que funciona" },
      { href: "#agenda", label: "A agenda para empresas e governos brasileiros" },
      { href: "#faq", label: "Perguntas frequentes" },
    ],
    sections: [
      {
        kind: "text",
        id: "corrida",
        heading: "A corrida global: EUA, China e o resto do mundo",
        paragraphs: [
          'A <a href="/blog/inteligencia-artificial">inteligência artificial</a> deixou de ser uma disputa entre empresas e virou uma disputa entre potências. Os Estados Unidos lideram em modelos de fronteira e concentram a infraestrutura de chips e nuvem; a China respondeu com modelos competitivos e uma estratégia industrial explícita de IA. Controles de exportação de chips, data centers tratados como ativos estratégicos e modelos usados como instrumento de influência compõem o novo tabuleiro.',
          "Para os demais países, esse cenário coloca uma escolha silenciosa mas decisiva: ser apenas <em>consumidor</em> de inteligência produzida fora — exportando dados e importando decisões — ou construir camadas próprias de capacidade sobre o que o mundo oferece. É a mesma encruzilhada que o mundo já viu com energia, telecomunicações e sistema financeiro. Em todas, quem tratou infraestrutura crítica como commodity pagou caro depois.",
        ],
      },
      {
        kind: "text",
        id: "brasil",
        heading: "Onde o Brasil está: dependências e ativos",
        paragraphs: [
          "O retrato brasileiro tem dois lados. O lado da <strong>dependência</strong>: a adoção de IA por empresas e governos cresce rápido, mas quase inteiramente sobre modelos e nuvens estrangeiros — com dados sensíveis de cidadãos, pacientes e operações críticas processados fora da jurisdição nacional, custo recorrente em dólar e zero capacidade de auditoria sobre os modelos.",
          "O lado dos <strong>ativos</strong>: o Brasil tem uma das maiores bases de dados públicos digitalizados do mundo — o SUS e seus sistemas de saúde, o governo digital, o sistema financeiro com Pix e Open Finance —, talento técnico reconhecido e um mercado interno de escala continental. Poucos países têm, ao mesmo tempo, tanta matéria-prima (dados e demanda) e tanta dependência da inteligência dos outros. Fechar essa distância é a oportunidade da década.",
        ],
      },
      {
        kind: "text",
        id: "soberania",
        heading: "O que é IA soberana — e o que não é",
        paragraphs: [
          "IA soberana <strong>não é</strong> isolamento tecnológico, nem recusar modelos globais, nem reinventar tudo do zero. Isso seria caro, lento e contraproducente.",
          "IA soberana <strong>é</strong> controle sobre o que é crítico: (1) <strong>dados residentes</strong> — informações sensíveis processadas em infraestrutura sob jurisdição e controle nacional ou da própria organização; (2) <strong>modelos auditáveis e especializados</strong> — a capacidade de inspecionar, ajustar e treinar modelos com a realidade local, do vocabulário do SUS às regras do direito brasileiro; (3) <strong>autonomia estratégica</strong> — funções críticas que não param se um fornecedor estrangeiro mudar preço, política ou disponibilidade.",
          "Com modelos abertos de alta qualidade e infraestrutura de GPU disponível no país, essa arquitetura deixou de ser privilégio de superpotências: é uma decisão de desenho ao alcance de hospitais, empresas e governos subnacionais.",
        ],
      },
      {
        kind: "cta",
        title: "Infraestrutura soberana de IA",
        text: "A NowGo AI projeta e implanta a camada soberana da sua organização: LLMs customizados, agentes e orquestração operando sobre dados residentes — com o melhor da tecnologia global onde ela não compromete o controle.",
        waMsg:
          "Olá! Li o artigo sobre IA soberana no Brasil da NowGo AI e quero conversar sobre infraestrutura soberana para minha organização.",
        waLabel: "Falar sobre soberania",
      },
      {
        kind: "text",
        id: "pratica",
        heading: "Soberania na prática: a arquitetura que funciona",
        paragraphs: [
          'A arquitetura soberana madura é <strong>híbrida e modular</strong>. Dados sensíveis e funções críticas rodam em modelos especializados sobre infraestrutura controlada; tarefas genéricas e não sensíveis podem usar plataformas globais, com política clara do que trafega onde. Entre as duas camadas, uma <strong>camada de orquestração</strong> decide, registra e audita — os <a href="/blog/agentes-de-inteligencia-artificial">agentes de IA</a> operam dentro dela, com permissões e trilha completa.',
          'Os princípios de desenho são os mesmos que aplicamos em qualquer projeto: modular (cada capacidade é um módulo que se integra, não um silo), interoperável (conversa com os sistemas existentes), enterprise-grade e government-grade (segurança, auditoria e conformidade — LGPD incluída — desde a origem). É o padrão da <a href="/">plataforma da NowGo AI</a> para saúde, cidades, educação e indústria.',
        ],
      },
      {
        kind: "text",
        id: "agenda",
        heading: "A agenda para empresas e governos brasileiros",
        paragraphs: [
          "<strong>Para empresas:</strong> mapear quais dados e funções são críticos demais para depender de terceiros; começar a especializar modelos com o conhecimento proprietário do negócio — que é, cada vez mais, o único diferencial que um concorrente não copia contratando a mesma plataforma.",
          "<strong>Para governos:</strong> tratar dados de cidadãos como ativo estratégico sob jurisdição nacional; exigir auditabilidade e residência de dados nas contratações de IA; e usar o poder de compra público para desenvolver capacidade local — como fizeram os países que hoje lideram.",
          "<strong>Para ambos:</strong> começar agora, por um módulo, com indicador claro — e escalar sobre a mesma infraestrutura. Soberania não se decreta; se constrói, projeto a projeto. E cada projeto construído sobre arquitetura dependente é retrabalho futuro garantido.",
        ],
      },
    ],
    faqTitle: "Perguntas frequentes sobre IA soberana no Brasil",
    faq: [
      {
        q: "O que é inteligência artificial soberana?",
        a: "IA soberana é a capacidade de uma organização ou país desenvolver e operar sistemas de IA sob seu próprio controle: dados processados em infraestrutura sob jurisdição nacional, modelos que podem ser auditados e especializados para a realidade local, e independência estratégica de plataformas estrangeiras para funções críticas. Não significa isolamento tecnológico — significa controle sobre o que é crítico.",
      },
      {
        q: "Como está a inteligência artificial no Brasil hoje?",
        a: "O Brasil combina adoção acelerada de IA por empresas e governos com dependência quase total de modelos e nuvens estrangeiros. Ao mesmo tempo, o país tem ativos reais: uma das maiores bases de dados públicos digitalizados do mundo (saúde, governo digital, sistema financeiro), talento técnico e demanda interna de escala continental — condições para construir uma camada soberana de IA em vez de apenas consumir a dos outros.",
      },
      {
        q: "Por que não usar apenas ChatGPT, Gemini e outras plataformas globais?",
        a: "Para uso individual e tarefas genéricas, elas são excelentes. O problema aparece em funções críticas de empresas e governos: dados sensíveis de cidadãos e pacientes trafegando fora da jurisdição nacional, impossibilidade de auditar o modelo, dependência de decisões comerciais e geopolíticas de terceiros, e custo recorrente em moeda estrangeira. Para essas funções, a arquitetura correta combina o melhor dos modelos globais com camadas soberanas onde importa.",
      },
      {
        q: "IA soberana é viável para uma organização, ou só para países?",
        a: "É viável — e cada vez mais acessível. Modelos abertos de alta qualidade, infraestrutura de GPU disponível no país e técnicas de especialização (fine-tuning, RAG) permitem que hospitais, empresas e governos operem IA de nível internacional com dados residentes em infraestrutura própria ou nacional. A decisão é de arquitetura, não de orçamento de superpotência.",
      },
    ],
    finalTitle: "Construa a camada soberana da sua organização",
    finalSub:
      "Converse com quem projeta infraestrutura soberana de IA para empresas, governos e cidades — módulo a módulo, com controle e auditoria desde o desenho.",
    ctaSchedule: "Agendar reunião",
    ctaWhatsapp: "Falar no WhatsApp",
    ctaPlatform: "Conhecer a plataforma",
    ctaDiagnosis: "Agendar diagnóstico",
    finalWaMsg:
      "Olá! Li o artigo sobre IA soberana no Brasil da NowGo AI e quero conversar sobre infraestrutura soberana para minha organização.",
  },

  /* ------------------------------------------------------------------ EN */
  en: {
    seoTitle:
      "Artificial Intelligence in Brazil: Why Sovereignty Is the Strategic Decision of the Decade · NowGo AI",
    seoDescription:
      "The AI landscape in Brazil, the geopolitical race between the US and China, and why Brazilian companies and governments need sovereign AI: data under national jurisdiction, auditable models and strategic autonomy.",
    eyebrow: "NowGo AI Guide · Brazil",
    title:
      "Artificial Intelligence in Brazil: why sovereignty is the strategic decision of the decade",
    subtitle:
      "The AI race has turned geopolitical. Between American and Chinese models, the question that matters for companies and governments is a different one: who controls the data, the models and the decisions?",
    tocLabel: "In this guide",
    toc: [
      { href: "#corrida", label: "The global race: US, China and the rest of the world" },
      { href: "#brasil", label: "Where Brazil stands — dependencies and assets" },
      { href: "#soberania", label: "What sovereign AI is (and what it is not)" },
      { href: "#pratica", label: "Sovereignty in practice: the architecture that works" },
      { href: "#agenda", label: "The agenda for companies and governments" },
      { href: "#faq", label: "Frequently asked questions" },
    ],
    sections: [
      {
        kind: "text",
        id: "corrida",
        heading: "The global race: US, China and the rest of the world",
        paragraphs: [
          "Artificial intelligence is no longer a contest between companies — it has become a contest between powers. The United States leads in frontier models and concentrates chip and cloud infrastructure; China responded with competitive models and an explicit industrial AI strategy. Chip export controls, data centers treated as strategic assets and models used as instruments of influence make up the new board.",
          "For every other country, this scenario poses a silent but decisive choice: to be merely a <em>consumer</em> of intelligence produced elsewhere — exporting data and importing decisions — or to build its own layers of capability on top of what the world offers. It is the same crossroads the world has seen with energy, telecommunications and the financial system. In all of them, whoever treated critical infrastructure as a commodity paid dearly later.",
        ],
      },
      {
        kind: "text",
        id: "brasil",
        heading: "Where Brazil stands: dependencies and assets",
        paragraphs: [
          "The Brazilian picture has two sides. The <strong>dependency</strong> side: AI adoption by companies and governments is growing fast, but almost entirely on foreign models and clouds — with sensitive data from citizens, patients and critical operations processed outside national jurisdiction, recurring costs in dollars and zero ability to audit the models.",
          "The <strong>assets</strong> side: Brazil has one of the largest digitized public data bases in the world — SUS and its health systems, digital government, a financial system with Pix and Open Finance —, recognized technical talent and a domestic market of continental scale. Few countries have, at the same time, so much raw material (data and demand) and so much dependence on other people's intelligence. Closing that gap is the opportunity of the decade.",
        ],
      },
      {
        kind: "text",
        id: "soberania",
        heading: "What sovereign AI is — and what it is not",
        paragraphs: [
          "Sovereign AI is <strong>not</strong> technological isolation, nor refusing global models, nor reinventing everything from scratch. That would be expensive, slow and counterproductive.",
          "Sovereign AI <strong>is</strong> control over what is critical: (1) <strong>resident data</strong> — sensitive information processed on infrastructure under national or organizational jurisdiction and control; (2) <strong>auditable, specialized models</strong> — the ability to inspect, tune and train models with local reality, from public-health vocabulary to Brazilian legal rules; (3) <strong>strategic autonomy</strong> — critical functions that do not stop if a foreign supplier changes price, policy or availability.",
          "With high-quality open models and GPU infrastructure available in the country, this architecture is no longer the privilege of superpowers: it is a design decision within reach of hospitals, companies and subnational governments.",
        ],
      },
      {
        kind: "cta",
        title: "Sovereign AI infrastructure",
        text: "NowGo AI designs and deploys your organization's sovereign layer: custom LLMs, agents and orchestration operating on resident data — using the best of global technology where it does not compromise control.",
        waMsg:
          "Hello! I read NowGo AI's article on sovereign AI and I'd like to talk about sovereign infrastructure for my organization.",
        waLabel: "Talk about sovereignty",
      },
      {
        kind: "text",
        id: "pratica",
        heading: "Sovereignty in practice: the architecture that works",
        paragraphs: [
          "Mature sovereign architecture is <strong>hybrid and modular</strong>. Sensitive data and critical functions run on specialized models over controlled infrastructure; generic, non-sensitive tasks can use global platforms, with a clear policy on what flows where. Between the two layers, an <strong>orchestration layer</strong> decides, records and audits — AI agents operate within it, with permissions and a complete trail.",
          'The design principles are the same we apply to any project: modular (each capability is a module that integrates, not a silo), interoperable (it talks to existing systems), enterprise-grade and government-grade (security, auditing and compliance from the origin). It is the standard of the <a href="/">NowGo AI platform</a> for healthcare, cities, education and industry.',
        ],
      },
      {
        kind: "text",
        id: "agenda",
        heading: "The agenda for companies and governments",
        paragraphs: [
          "<strong>For companies:</strong> map which data and functions are too critical to depend on third parties; start specializing models with the business's proprietary knowledge — which is, increasingly, the only differentiator a competitor cannot copy by hiring the same platform.",
          "<strong>For governments:</strong> treat citizen data as a strategic asset under national jurisdiction; require auditability and data residency in AI procurement; and use public purchasing power to develop local capability — as the countries that lead today have done.",
          "<strong>For both:</strong> start now, with one module and a clear indicator — and scale on the same infrastructure. Sovereignty is not decreed; it is built, project by project. And every project built on dependent architecture is guaranteed future rework.",
        ],
      },
    ],
    faqTitle: "Frequently asked questions about sovereign AI",
    faq: [
      {
        q: "What is sovereign artificial intelligence?",
        a: "Sovereign AI is the ability of an organization or country to develop and operate AI systems under its own control: data processed on infrastructure under national jurisdiction, models that can be audited and specialized for local reality, and strategic independence from foreign platforms for critical functions. It does not mean technological isolation — it means control over what is critical.",
      },
      {
        q: "What is the state of artificial intelligence in Brazil today?",
        a: "Brazil combines fast AI adoption by companies and governments with near-total dependence on foreign models and clouds. At the same time, the country holds real assets: one of the world's largest digitized public data bases (health, digital government, financial system), technical talent and continental-scale domestic demand — the conditions to build a sovereign AI layer instead of only consuming others'.",
      },
      {
        q: "Why not just use ChatGPT, Gemini and other global platforms?",
        a: "For individual use and generic tasks, they are excellent. The problem appears in critical functions of companies and governments: sensitive citizen and patient data flowing outside national jurisdiction, inability to audit the model, dependence on third parties' commercial and geopolitical decisions, and recurring costs in foreign currency. For those functions, the right architecture combines the best of global models with sovereign layers where it matters.",
      },
      {
        q: "Is sovereign AI feasible for a single organization, or only for countries?",
        a: "It is feasible — and increasingly accessible. High-quality open models, GPU infrastructure available locally and specialization techniques (fine-tuning, RAG) allow hospitals, companies and governments to operate world-class AI with data residing on their own or national infrastructure. It is an architecture decision, not a superpower budget.",
      },
    ],
    finalTitle: "Build your organization's sovereign layer",
    finalSub:
      "Talk to the team that designs sovereign AI infrastructure for companies, governments and cities — module by module, with control and auditing from the design stage.",
    ctaSchedule: "Schedule a meeting",
    ctaWhatsapp: "Chat on WhatsApp",
    ctaPlatform: "Explore the platform",
    ctaDiagnosis: "Schedule a diagnosis",
    finalWaMsg:
      "Hello! I read NowGo AI's article on sovereign AI and I'd like to talk about sovereign infrastructure for my organization.",
  },

  /* ------------------------------------------------------------------ ES */
  es: {
    seoTitle:
      "Inteligencia Artificial en Brasil: por qué la soberanía es la decisión estratégica de la década · NowGo AI",
    seoDescription:
      "El escenario de la IA en Brasil, la carrera geopolítica entre EE. UU. y China, y por qué empresas y gobiernos necesitan IA soberana: datos bajo jurisdicción nacional, modelos auditables y autonomía estratégica.",
    eyebrow: "Guía NowGo AI · Brasil",
    title:
      "Inteligencia Artificial en Brasil: por qué la soberanía es la decisión estratégica de la década",
    subtitle:
      "La carrera de la IA se volvió geopolítica. Entre los modelos americanos y los chinos, la pregunta que importa para empresas y gobiernos es otra: ¿quién controla los datos, los modelos y las decisiones?",
    tocLabel: "En esta guía",
    toc: [
      { href: "#corrida", label: "La carrera global: EE. UU., China y el resto del mundo" },
      { href: "#brasil", label: "Dónde está Brasil — dependencias y activos" },
      { href: "#soberania", label: "Qué es la IA soberana (y qué no es)" },
      { href: "#pratica", label: "Soberanía en la práctica: la arquitectura que funciona" },
      { href: "#agenda", label: "La agenda para empresas y gobiernos" },
      { href: "#faq", label: "Preguntas frecuentes" },
    ],
    sections: [
      {
        kind: "text",
        id: "corrida",
        heading: "La carrera global: EE. UU., China y el resto del mundo",
        paragraphs: [
          "La inteligencia artificial dejó de ser una disputa entre empresas y se convirtió en una disputa entre potencias. Estados Unidos lidera en modelos de frontera y concentra la infraestructura de chips y nube; China respondió con modelos competitivos y una estrategia industrial explícita de IA. Controles de exportación de chips, data centers tratados como activos estratégicos y modelos usados como instrumento de influencia componen el nuevo tablero.",
          "Para los demás países, ese escenario plantea una elección silenciosa pero decisiva: ser apenas <em>consumidor</em> de inteligencia producida afuera — exportando datos e importando decisiones — o construir capas propias de capacidad sobre lo que el mundo ofrece. Es la misma encrucijada que el mundo ya vio con la energía, las telecomunicaciones y el sistema financiero. En todas, quien trató la infraestructura crítica como commodity pagó caro después.",
        ],
      },
      {
        kind: "text",
        id: "brasil",
        heading: "Dónde está Brasil: dependencias y activos",
        paragraphs: [
          "El retrato brasileño tiene dos lados. El lado de la <strong>dependencia</strong>: la adopción de IA por empresas y gobiernos crece rápido, pero casi enteramente sobre modelos y nubes extranjeros — con datos sensibles de ciudadanos, pacientes y operaciones críticas procesados fuera de la jurisdicción nacional, costo recurrente en dólares y cero capacidad de auditoría sobre los modelos.",
          "El lado de los <strong>activos</strong>: Brasil tiene una de las mayores bases de datos públicos digitalizados del mundo — el SUS y sus sistemas de salud, el gobierno digital, el sistema financiero con Pix y Open Finance —, talento técnico reconocido y un mercado interno de escala continental. Pocos países tienen, al mismo tiempo, tanta materia prima (datos y demanda) y tanta dependencia de la inteligencia de otros. Cerrar esa distancia es la oportunidad de la década.",
        ],
      },
      {
        kind: "text",
        id: "soberania",
        heading: "Qué es la IA soberana — y qué no es",
        paragraphs: [
          "IA soberana <strong>no es</strong> aislamiento tecnológico, ni rechazar modelos globales, ni reinventar todo desde cero. Eso sería caro, lento y contraproducente.",
          "IA soberana <strong>es</strong> control sobre lo que es crítico: (1) <strong>datos residentes</strong> — información sensible procesada en infraestructura bajo jurisdicción y control nacional o de la propia organización; (2) <strong>modelos auditables y especializados</strong> — la capacidad de inspeccionar, ajustar y entrenar modelos con la realidad local, del vocabulario de la salud pública a las reglas del derecho local; (3) <strong>autonomía estratégica</strong> — funciones críticas que no se detienen si un proveedor extranjero cambia precio, política o disponibilidad.",
          "Con modelos abiertos de alta calidad e infraestructura de GPU disponible en el país, esa arquitectura dejó de ser privilegio de superpotencias: es una decisión de diseño al alcance de hospitales, empresas y gobiernos subnacionales.",
        ],
      },
      {
        kind: "cta",
        title: "Infraestructura soberana de IA",
        text: "NowGo AI proyecta e implementa la capa soberana de su organización: LLMs personalizados, agentes y orquestación operando sobre datos residentes — con lo mejor de la tecnología global donde no compromete el control.",
        waMsg:
          "¡Hola! Leí el artículo sobre IA soberana de NowGo AI y quiero conversar sobre infraestructura soberana para mi organización.",
        waLabel: "Hablar sobre soberanía",
      },
      {
        kind: "text",
        id: "pratica",
        heading: "Soberanía en la práctica: la arquitectura que funciona",
        paragraphs: [
          "La arquitectura soberana madura es <strong>híbrida y modular</strong>. Los datos sensibles y las funciones críticas corren en modelos especializados sobre infraestructura controlada; las tareas genéricas y no sensibles pueden usar plataformas globales, con una política clara de qué circula por dónde. Entre las dos capas, una <strong>capa de orquestación</strong> decide, registra y audita — los agentes de IA operan dentro de ella, con permisos y trazabilidad completa.",
          'Los principios de diseño son los mismos que aplicamos en cualquier proyecto: modular (cada capacidad es un módulo que se integra, no un silo), interoperable (conversa con los sistemas existentes), enterprise-grade y government-grade (seguridad, auditoría y conformidad desde el origen). Es el estándar de la <a href="/">plataforma de NowGo AI</a> para salud, ciudades, educación e industria.',
        ],
      },
      {
        kind: "text",
        id: "agenda",
        heading: "La agenda para empresas y gobiernos",
        paragraphs: [
          "<strong>Para empresas:</strong> mapear qué datos y funciones son demasiado críticos para depender de terceros; empezar a especializar modelos con el conocimiento propietario del negocio — que es, cada vez más, el único diferencial que un competidor no copia contratando la misma plataforma.",
          "<strong>Para gobiernos:</strong> tratar los datos de los ciudadanos como activo estratégico bajo jurisdicción nacional; exigir auditabilidad y residencia de datos en las contrataciones de IA; y usar el poder de compra público para desarrollar capacidad local — como hicieron los países que hoy lideran.",
          "<strong>Para ambos:</strong> empezar ahora, por un módulo, con indicador claro — y escalar sobre la misma infraestructura. La soberanía no se decreta; se construye, proyecto a proyecto. Y cada proyecto construido sobre arquitectura dependiente es retrabajo futuro garantizado.",
        ],
      },
    ],
    faqTitle: "Preguntas frecuentes sobre IA soberana",
    faq: [
      {
        q: "¿Qué es la inteligencia artificial soberana?",
        a: "IA soberana es la capacidad de una organización o país de desarrollar y operar sistemas de IA bajo su propio control: datos procesados en infraestructura bajo jurisdicción nacional, modelos que pueden ser auditados y especializados para la realidad local, e independencia estratégica de plataformas extranjeras para funciones críticas. No significa aislamiento tecnológico — significa control sobre lo que es crítico.",
      },
      {
        q: "¿Cómo está la inteligencia artificial en Brasil hoy?",
        a: "Brasil combina una adopción acelerada de IA por empresas y gobiernos con una dependencia casi total de modelos y nubes extranjeros. Al mismo tiempo, el país tiene activos reales: una de las mayores bases de datos públicos digitalizados del mundo (salud, gobierno digital, sistema financiero), talento técnico y demanda interna de escala continental — condiciones para construir una capa soberana de IA en lugar de solo consumir la de otros.",
      },
      {
        q: "¿Por qué no usar solo ChatGPT, Gemini y otras plataformas globales?",
        a: "Para uso individual y tareas genéricas, son excelentes. El problema aparece en funciones críticas de empresas y gobiernos: datos sensibles de ciudadanos y pacientes circulando fuera de la jurisdicción nacional, imposibilidad de auditar el modelo, dependencia de decisiones comerciales y geopolíticas de terceros, y costo recurrente en moneda extranjera. Para esas funciones, la arquitectura correcta combina lo mejor de los modelos globales con capas soberanas donde importa.",
      },
      {
        q: "¿La IA soberana es viable para una organización, o solo para países?",
        a: "Es viable — y cada vez más accesible. Modelos abiertos de alta calidad, infraestructura de GPU disponible localmente y técnicas de especialización (fine-tuning, RAG) permiten que hospitales, empresas y gobiernos operen IA de nivel internacional con datos residentes en infraestructura propia o nacional. Es una decisión de arquitectura, no un presupuesto de superpotencia.",
      },
    ],
    finalTitle: "Construya la capa soberana de su organización",
    finalSub:
      "Converse con quien proyecta infraestructura soberana de IA para empresas, gobiernos y ciudades — módulo a módulo, con control y auditoría desde el diseño.",
    ctaSchedule: "Agendar reunión",
    ctaWhatsapp: "Hablar por WhatsApp",
    ctaPlatform: "Conocer la plataforma",
    ctaDiagnosis: "Agendar diagnóstico",
    finalWaMsg:
      "¡Hola! Leí el artículo sobre IA soberana de NowGo AI y quiero conversar sobre infraestructura soberana para mi organización.",
  },
};
