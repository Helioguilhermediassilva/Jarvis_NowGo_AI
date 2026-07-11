import type { Lang } from "@/landing/copy";

/**
 * Conteúdo trilíngue (PT/EN/ES) da página pilar do blog.
 * Segue o padrão editorial do copy.ts: toda string do artigo vive aqui.
 * Parágrafos aceitam HTML inline seguro (<strong>, <a>) — conteúdo estático.
 */

export type PillarSection =
  | { kind: "text"; id: string; heading: string; paragraphs: string[] }
  | { kind: "cta"; title: string; text: string; waMsg: string; waLabel: string };

export type PillarCopy = {
  seoTitle: string;
  seoDescription: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  tocLabel: string;
  toc: { href: string; label: string }[];
  sections: PillarSection[];
  faqTitle: string;
  faq: { q: string; a: string }[];
  finalTitle: string;
  finalSub: string;
  ctaSchedule: string;
  ctaWhatsapp: string;
  ctaPlatform: string;
  ctaDiagnosis: string;
  finalWaMsg: string;
};

export const pilarCopy: Record<Lang, PillarCopy> = {
  /* ------------------------------------------------------------------ PT */
  pt: {
    seoTitle:
      "Inteligência Artificial: o que é, como funciona, tipos e como usar (Guia Completo) · NowGo AI",
    seoDescription:
      "Guia completo de inteligência artificial: o que é, como funciona, tipos, IA generativa e agentes, aplicações em saúde, governo, educação e indústria, e como adotar IA soberana na sua organização.",
    eyebrow: "Guia NowGo AI",
    title:
      "Inteligência Artificial: o que é, como funciona e como aplicá-la em empresas, governos e cidades",
    subtitle:
      "Um guia direto ao ponto para líderes que precisam decidir sobre IA — dos conceitos fundamentais à adoção de infraestrutura soberana, com exemplos reais por setor.",
    tocLabel: "Neste guia",
    toc: [
      { href: "#o-que-e", label: "O que é inteligência artificial" },
      { href: "#como-funciona", label: "Como funciona a inteligência artificial" },
      { href: "#tipos", label: "Tipos de IA: generativa, agentes e machine learning" },
      { href: "#vantagens", label: "Vantagens e desvantagens" },
      { href: "#setores", label: "IA aplicada: saúde, governo, educação e indústria" },
      { href: "#soberania", label: "IA soberana: por que o Brasil precisa de infraestrutura própria" },
      { href: "#como-adotar", label: "Como levar IA para a sua organização" },
      { href: "#faq", label: "Perguntas frequentes" },
    ],
    sections: [
      {
        kind: "text",
        id: "o-que-e",
        heading: "O que é inteligência artificial",
        paragraphs: [
          "Inteligência artificial (IA) é o campo da tecnologia dedicado a construir sistemas capazes de executar tarefas que, até pouco tempo, exigiam inteligência humana: interpretar textos e imagens, conversar em linguagem natural, reconhecer padrões em grandes volumes de dados e tomar decisões com base neles.",
          "Na prática, quando falamos de IA hoje, falamos principalmente de modelos treinados com dados — dos assistentes de conversa aos sistemas que preveem demanda hospitalar, otimizam o trânsito de uma cidade ou automatizam o backoffice de uma empresa. A diferença entre um experimento e um resultado real está menos no modelo e mais na forma como ele é integrado à operação.",
        ],
      },
      {
        kind: "text",
        id: "como-funciona",
        heading: "Como funciona a inteligência artificial",
        paragraphs: [
          "O ciclo básico de qualquer sistema de IA tem três etapas: <strong>dados</strong> (o sistema é alimentado com exemplos — textos, imagens, registros operacionais), <strong>treinamento</strong> (algoritmos identificam padrões estatísticos nesses exemplos) e <strong>inferência</strong> (o modelo treinado responde a situações novas: classifica, prevê, gera conteúdo ou aciona um processo).",
          "Nos modelos de linguagem (LLMs) que popularizaram a IA generativa, esse treinamento acontece sobre volumes gigantescos de texto, e o resultado é um sistema capaz de compreender e produzir linguagem natural. Para uso corporativo e governamental, esses modelos são especializados com os dados e as regras da própria organização — é aí que entram os LLMs customizados e a infraestrutura dedicada.",
        ],
      },
      {
        kind: "text",
        id: "tipos",
        heading: "Tipos de IA: generativa, agentes e machine learning",
        paragraphs: [
          '<strong>Machine learning</strong> é a base: sistemas que aprendem padrões a partir de dados para prever e classificar — detecção de fraude, previsão de demanda, manutenção preditiva. Explicamos a diferença em detalhe no guia de <a href="/blog/inteligencia-artificial-e-machine-learning">IA e machine learning</a>.',
          '<strong>IA generativa</strong> é a geração mais recente: modelos que criam conteúdo novo — texto, imagem, voz, código — a partir de instruções em linguagem natural. É a tecnologia por trás do ChatGPT, do Gemini e dos copilotos corporativos.',
          '<strong>Agentes autônomos</strong> são o passo seguinte: sistemas de IA que não apenas respondem, mas executam — consultam bases, acionam sistemas, conduzem atendimentos por voz e completam fluxos de trabalho inteiros com supervisão humana. É nessa camada que a IA deixa de ser uma ferramenta de produtividade individual e passa a operar processos da organização — o tema do nosso guia de <a href="/blog/agentes-de-inteligencia-artificial">agentes de IA</a>.',
        ],
      },
      {
        kind: "text",
        id: "vantagens",
        heading: "Vantagens e desvantagens da inteligência artificial",
        paragraphs: [
          "<strong>Vantagens:</strong> escala (atendimento e análise 24/7), velocidade de decisão, redução de custo operacional em tarefas repetitivas, personalização em massa e capacidade de encontrar padrões invisíveis ao olho humano.",
          "<strong>Desvantagens e riscos:</strong> dependência da qualidade dos dados, possibilidade de respostas incorretas quando o sistema opera sem guarda-corpos, custo energético dos grandes modelos e — o risco mais subestimado por organizações públicas e privadas — a <strong>perda de soberania sobre dados</strong> quando informações sensíveis trafegam por plataformas de terceiros, fora do controle e da jurisdição da organização.",
          "A boa notícia: todos esses riscos são endereçáveis com arquitetura adequada — modelos especializados, infraestrutura dimensionada e governança de dados desde o desenho do projeto.",
        ],
      },
      {
        kind: "text",
        id: "setores",
        heading: "IA aplicada: exemplos reais por setor",
        paragraphs: [
          '<strong>Saúde.</strong> Agentes de voz que agendam consultas e fazem triagem, IA que apoia laudos e radiologia, e automação de backoffice hospitalar. O impacto é direto: menos fila, menos glosa, mais tempo de equipe clínica dedicado ao paciente. Detalhamos tudo no guia de <a href="/blog/inteligencia-artificial-na-saude">IA na saúde</a>.',
        ],
      },
      {
        kind: "cta",
        title: "IA para hospitais e operadoras de saúde",
        text: "A NowGo AI implanta agentes de voz e automação hospitalar como módulos de uma infraestrutura integrada — não como softwares isolados.",
        waMsg:
          "Olá! Li o guia de IA da NowGo AI e tenho interesse em IA para saúde (hospitais, voz e backoffice).",
        waLabel: "Falar sobre IA na saúde",
      },
      {
        kind: "text",
        id: "setores-gov",
        heading: "",
        paragraphs: [
          "<strong>Governos e cidades inteligentes.</strong> Um Smart Cities OS conecta dados urbanos — mobilidade, segurança, serviços públicos — em uma camada única de orquestração, permitindo que gestores enxerguem a cidade em tempo real e que o cidadão seja atendido por canais inteligentes. A condição inegociável nesse setor é a soberania: dados públicos precisam permanecer sob jurisdição e controle públicos.",
        ],
      },
      {
        kind: "cta",
        title: "IA soberana para governos e cidades",
        text: "Infraestrutura operacional soberana, modular e interoperável para gestão pública — do atendimento ao cidadão à orquestração de dados urbanos.",
        waMsg:
          "Olá! Li o guia de IA da NowGo AI e tenho interesse em IA soberana para governos e cidades inteligentes.",
        waLabel: "Falar sobre governo e cidades",
      },
      {
        kind: "text",
        id: "setores-edu",
        heading: "",
        paragraphs: [
          "<strong>Educação.</strong> Para redes de ensino e universidades, a IA atua em duas frentes: eficiência institucional (matrículas, atendimento, evasão) e apoio pedagógico (tutores inteligentes, produção de material, avaliação assistida por professores). O desafio não é a ferramenta — é a implantação com governança, para que a IA amplie o professor em vez de substituí-lo.",
          "<strong>Indústria e empresas.</strong> Da indústria 4.0 ao setor financeiro, os casos mais maduros combinam previsão (demanda, manutenção, risco) com automação de processos e agentes que operam sistemas legados. A régua de sucesso é uma só: redução mensurável de custo ou aumento mensurável de receita.",
          "<strong>Direito e serviços profissionais.</strong> Análise de contratos, pesquisa de jurisprudência e automação de rotinas processuais já são realidade em escritórios e departamentos jurídicos — com o cuidado obrigatório de manter revisão humana e confidencialidade dos dados.",
        ],
      },
      {
        kind: "cta",
        title: "IA para indústria, educação e empresas",
        text: "Diagnóstico do processo, desenho da arquitetura e implantação com metas mensuráveis — a IA integrada à sua operação, não mais um software na prateleira.",
        waMsg:
          "Olá! Li o guia de IA da NowGo AI e tenho interesse em IA para instituições de ensino, indústria ou empresas.",
        waLabel: "Falar sobre minha operação",
      },
      {
        kind: "text",
        id: "soberania",
        heading: "IA soberana: por que o Brasil precisa de infraestrutura própria",
        paragraphs: [
          "A corrida global de IA deixou de ser apenas tecnológica — é geopolítica. Estados Unidos e China tratam modelos e data centers como ativos estratégicos. Para o Brasil, depender exclusivamente de plataformas estrangeiras significa exportar dados sensíveis de cidadãos, hospitais e governos e importar decisões tomadas fora da nossa jurisdição.",
          'IA soberana não significa isolamento: significa que os dados críticos são processados em infraestrutura sob controle nacional, que os modelos podem ser auditados e especializados para a realidade local, e que a organização — pública ou privada — mantém autonomia estratégica. É o princípio que orienta a arquitetura da NowGo AI: modular, soberana, interoperável e preparada para os requisitos de empresas e governos. Aprofundamos o tema no artigo sobre <a href="/blog/inteligencia-artificial-no-brasil">IA no Brasil</a>.',
        ],
      },
      {
        kind: "text",
        id: "como-adotar",
        heading: "Como levar inteligência artificial para a sua organização",
        paragraphs: [
          "A maioria dos projetos de IA que fracassam morre pelos mesmos motivos: começar pela ferramenta em vez do problema, ignorar a qualidade dos dados e tratar IA como projeto de TI em vez de projeto de operação. O caminho que funciona tem quatro passos:",
          "<strong>1. Diagnóstico do processo</strong> — identificar onde há custo repetitivo, fila ou decisão baseada em dados que hoje ninguém consegue analisar. <strong>2. Piloto com meta mensurável</strong> — um escopo pequeno, com indicador claro (tempo, custo, receita), em semanas e não anos. <strong>3. Arquitetura soberana</strong> — definir desde o início onde os dados residem, quem audita o modelo e como ele se integra aos sistemas existentes. <strong>4. Escala por módulos</strong> — expandir a partir do que provou valor, sobre a mesma infraestrutura, em vez de acumular ferramentas desconexas.",
          'É exatamente esse o modelo de trabalho da NowGo AI, parceira NVIDIA e reconhecida entre as Top 50 inovadoras globais: LLMs customizados, agentes autônomos e infraestrutura de IA sob medida, implantados como um ecossistema integrado para <a href="/">empresas, governos e cidades</a>.',
        ],
      },
    ],
    faqTitle: "Perguntas frequentes sobre inteligência artificial",
    faq: [
      {
        q: "O que significa inteligência artificial?",
        a: "Inteligência artificial (IA) é o campo da computação dedicado a criar sistemas capazes de executar tarefas que normalmente exigiriam inteligência humana: compreender linguagem, reconhecer padrões, tomar decisões e aprender com dados. Na prática empresarial, IA significa software que aprende com as informações da sua operação para automatizar processos e apoiar decisões.",
      },
      {
        q: "Qual é a diferença entre inteligência artificial e machine learning?",
        a: "Machine learning (aprendizado de máquina) é uma subárea da inteligência artificial. IA é o conceito amplo de máquinas que simulam capacidades cognitivas; machine learning é a técnica em que os sistemas aprendem padrões a partir de dados, sem serem programados regra a regra. Todo machine learning é IA, mas nem toda IA usa machine learning.",
      },
      {
        q: "Qual inteligência artificial é melhor?",
        a: "Depende do objetivo. Para uso pessoal, assistentes como ChatGPT, Gemini e Claude resolvem a maioria das tarefas. Para empresas e governos, a pergunta certa é outra: qual arquitetura de IA atende aos requisitos de soberania de dados, integração com sistemas existentes e escala? Nesses casos, LLMs customizados e infraestrutura dedicada superam ferramentas genéricas.",
      },
      {
        q: "Quem inventou a inteligência artificial e quando ela surgiu?",
        a: "O termo 'inteligência artificial' foi cunhado por John McCarthy em 1956, na conferência de Dartmouth, considerada o marco de nascimento do campo. Nomes como Alan Turing, Marvin Minsky e Claude Shannon estabeleceram as bases teóricas nas décadas de 1940 e 1950.",
      },
      {
        q: "Por que a inteligência artificial gasta água e energia?",
        a: "Modelos de IA rodam em data centers cujos servidores geram calor intenso e precisam de refrigeração, que em muitos casos consome água. O treinamento e a operação de grandes modelos também demandam energia significativa. Por isso, eficiência energética e infraestrutura bem dimensionada são critérios centrais em projetos sérios de IA.",
      },
      {
        q: "A inteligência artificial vai substituir os humanos?",
        a: "A evidência até aqui aponta para transformação, não substituição em massa: a IA automatiza tarefas, e as pessoas passam a atuar na supervisão, na estratégia e no relacionamento. Organizações que tratam IA como ferramenta de ampliação da capacidade humana tendem a colher os melhores resultados.",
      },
    ],
    finalTitle: "Pronto para aplicar IA na sua organização?",
    finalSub:
      "Converse com quem constrói infraestrutura soberana de IA para empresas, governos e cidades. Diagnóstico direto, sem compromisso.",
    ctaSchedule: "Agendar reunião",
    ctaWhatsapp: "Falar no WhatsApp",
    ctaPlatform: "Conhecer a plataforma",
    ctaDiagnosis: "Agendar diagnóstico",
    finalWaMsg:
      "Olá! Li o guia de Inteligência Artificial da NowGo AI e quero avaliar como aplicar IA na minha organização.",
  },

  /* ------------------------------------------------------------------ EN */
  en: {
    seoTitle:
      "Artificial Intelligence: What It Is, How It Works, Types and How to Use It (Complete Guide) · NowGo AI",
    seoDescription:
      "Complete guide to artificial intelligence: what it is, how it works, types, generative AI and agents, applications in healthcare, government, education and industry, and how to adopt sovereign AI in your organization.",
    eyebrow: "NowGo AI Guide",
    title:
      "Artificial Intelligence: what it is, how it works and how to apply it in companies, governments and cities",
    subtitle:
      "A straight-to-the-point guide for leaders who need to make decisions about AI — from fundamental concepts to adopting sovereign infrastructure, with real examples by sector.",
    tocLabel: "In this guide",
    toc: [
      { href: "#o-que-e", label: "What artificial intelligence is" },
      { href: "#como-funciona", label: "How artificial intelligence works" },
      { href: "#tipos", label: "Types of AI: generative, agents and machine learning" },
      { href: "#vantagens", label: "Advantages and disadvantages" },
      { href: "#setores", label: "Applied AI: healthcare, government, education and industry" },
      { href: "#soberania", label: "Sovereign AI: why nations need their own infrastructure" },
      { href: "#como-adotar", label: "How to bring AI into your organization" },
      { href: "#faq", label: "Frequently asked questions" },
    ],
    sections: [
      {
        kind: "text",
        id: "o-que-e",
        heading: "What artificial intelligence is",
        paragraphs: [
          "Artificial intelligence (AI) is the field of technology dedicated to building systems capable of performing tasks that, until recently, required human intelligence: interpreting text and images, conversing in natural language, recognizing patterns in large volumes of data and making decisions based on them.",
          "In practice, when we talk about AI today, we are mostly talking about models trained on data — from conversational assistants to systems that forecast hospital demand, optimize a city's traffic or automate a company's back office. The difference between an experiment and a real result lies less in the model and more in how it is integrated into operations.",
        ],
      },
      {
        kind: "text",
        id: "como-funciona",
        heading: "How artificial intelligence works",
        paragraphs: [
          "The basic cycle of any AI system has three stages: <strong>data</strong> (the system is fed with examples — text, images, operational records), <strong>training</strong> (algorithms identify statistical patterns in those examples) and <strong>inference</strong> (the trained model responds to new situations: it classifies, predicts, generates content or triggers a process).",
          "In the language models (LLMs) that made generative AI mainstream, this training happens over massive volumes of text, and the result is a system capable of understanding and producing natural language. For corporate and government use, these models are specialized with the organization's own data and rules — that is where custom LLMs and dedicated infrastructure come in.",
        ],
      },
      {
        kind: "text",
        id: "tipos",
        heading: "Types of AI: generative, agents and machine learning",
        paragraphs: [
          "<strong>Machine learning</strong> is the foundation: systems that learn patterns from data to predict and classify — fraud detection, demand forecasting, predictive maintenance.",
          "<strong>Generative AI</strong> is the latest generation: models that create new content — text, images, voice, code — from natural language instructions. It is the technology behind ChatGPT, Gemini and corporate copilots.",
          "<strong>Autonomous agents</strong> are the next step: AI systems that don't just answer, they execute — they query databases, operate systems, handle voice interactions and complete entire workflows under human supervision. This is the layer where AI stops being an individual productivity tool and starts operating the organization's processes.",
        ],
      },
      {
        kind: "text",
        id: "vantagens",
        heading: "Advantages and disadvantages of artificial intelligence",
        paragraphs: [
          "<strong>Advantages:</strong> scale (24/7 service and analysis), faster decisions, lower operating costs on repetitive tasks, mass personalization and the ability to find patterns invisible to the human eye.",
          "<strong>Disadvantages and risks:</strong> dependence on data quality, the possibility of incorrect answers when the system operates without guardrails, the energy cost of large models and — the risk most underestimated by public and private organizations — the <strong>loss of data sovereignty</strong> when sensitive information flows through third-party platforms, outside the organization's control and jurisdiction.",
          "The good news: all of these risks can be addressed with the right architecture — specialized models, properly sized infrastructure and data governance from the project's design stage.",
        ],
      },
      {
        kind: "text",
        id: "setores",
        heading: "Applied AI: real examples by sector",
        paragraphs: [
          "<strong>Healthcare.</strong> Voice agents that schedule appointments and perform triage, AI that supports reporting and radiology, and hospital back-office automation. The impact is direct: shorter queues, fewer claim denials, more clinical staff time dedicated to patients.",
        ],
      },
      {
        kind: "cta",
        title: "AI for hospitals and healthcare operators",
        text: "NowGo AI deploys voice agents and hospital automation as modules of an integrated infrastructure — not as isolated software.",
        waMsg:
          "Hello! I read NowGo AI's Artificial Intelligence guide and I'm interested in AI for healthcare (hospitals, voice and back office).",
        waLabel: "Talk about AI in healthcare",
      },
      {
        kind: "text",
        id: "setores-gov",
        heading: "",
        paragraphs: [
          "<strong>Governments and smart cities.</strong> A Smart Cities OS connects urban data — mobility, security, public services — into a single orchestration layer, allowing managers to see the city in real time and citizens to be served through intelligent channels. The non-negotiable condition in this sector is sovereignty: public data must remain under public jurisdiction and control.",
        ],
      },
      {
        kind: "cta",
        title: "Sovereign AI for governments and cities",
        text: "Sovereign, modular and interoperable operational infrastructure for public management — from citizen services to urban data orchestration.",
        waMsg:
          "Hello! I read NowGo AI's Artificial Intelligence guide and I'm interested in sovereign AI for governments and smart cities.",
        waLabel: "Talk about government and cities",
      },
      {
        kind: "text",
        id: "setores-edu",
        heading: "",
        paragraphs: [
          "<strong>Education.</strong> For school networks and universities, AI works on two fronts: institutional efficiency (enrollment, service, dropout prevention) and pedagogical support (intelligent tutors, material production, teacher-assisted assessment). The challenge is not the tool — it is deployment with governance, so that AI amplifies teachers instead of replacing them.",
          "<strong>Industry and business.</strong> From Industry 4.0 to the financial sector, the most mature cases combine prediction (demand, maintenance, risk) with process automation and agents that operate legacy systems. The measure of success is a single one: measurable cost reduction or measurable revenue increase.",
          "<strong>Law and professional services.</strong> Contract analysis, case-law research and automation of procedural routines are already a reality in law firms and legal departments — with the mandatory care of maintaining human review and data confidentiality.",
        ],
      },
      {
        kind: "cta",
        title: "AI for industry, education and business",
        text: "Process diagnosis, architecture design and deployment with measurable goals — AI integrated into your operation, not another piece of shelfware.",
        waMsg:
          "Hello! I read NowGo AI's Artificial Intelligence guide and I'm interested in AI for education, industry or business.",
        waLabel: "Talk about my operation",
      },
      {
        kind: "text",
        id: "soberania",
        heading: "Sovereign AI: why nations need their own infrastructure",
        paragraphs: [
          "The global AI race is no longer just technological — it is geopolitical. The United States and China treat models and data centers as strategic assets. For countries like Brazil, depending exclusively on foreign platforms means exporting sensitive data from citizens, hospitals and governments, and importing decisions made outside their jurisdiction.",
          "Sovereign AI does not mean isolation: it means that critical data is processed on infrastructure under national control, that models can be audited and specialized for local reality, and that the organization — public or private — maintains strategic autonomy. This is the principle that guides NowGo AI's architecture: modular, sovereign, interoperable and built for the requirements of enterprises and governments.",
        ],
      },
      {
        kind: "text",
        id: "como-adotar",
        heading: "How to bring artificial intelligence into your organization",
        paragraphs: [
          "Most AI projects that fail die for the same reasons: starting with the tool instead of the problem, ignoring data quality, and treating AI as an IT project instead of an operations project. The path that works has four steps:",
          "<strong>1. Process diagnosis</strong> — identify where there is repetitive cost, queues or data-driven decisions no one can analyze today. <strong>2. Pilot with a measurable goal</strong> — a small scope, with a clear indicator (time, cost, revenue), in weeks rather than years. <strong>3. Sovereign architecture</strong> — define from the start where data resides, who audits the model and how it integrates with existing systems. <strong>4. Scale by modules</strong> — expand from what has proven value, on the same infrastructure, instead of accumulating disconnected tools.",
          'This is exactly how NowGo AI works — an NVIDIA partner recognized among the Top 50 global innovators: custom LLMs, autonomous agents and tailored AI infrastructure, deployed as an integrated ecosystem for <a href="/">companies, governments and cities</a>.',
        ],
      },
    ],
    faqTitle: "Frequently asked questions about artificial intelligence",
    faq: [
      {
        q: "What does artificial intelligence mean?",
        a: "Artificial intelligence (AI) is the field of computing dedicated to creating systems capable of performing tasks that would normally require human intelligence: understanding language, recognizing patterns, making decisions and learning from data. In business practice, AI means software that learns from your operation's information to automate processes and support decisions.",
      },
      {
        q: "What is the difference between artificial intelligence and machine learning?",
        a: "Machine learning is a subfield of artificial intelligence. AI is the broad concept of machines simulating cognitive capabilities; machine learning is the technique in which systems learn patterns from data without being programmed rule by rule. All machine learning is AI, but not all AI uses machine learning.",
      },
      {
        q: "Which artificial intelligence is the best?",
        a: "It depends on the goal. For personal use, assistants like ChatGPT, Gemini and Claude handle most tasks. For companies and governments, the right question is different: which AI architecture meets the requirements of data sovereignty, integration with existing systems and scale? In those cases, custom LLMs and dedicated infrastructure outperform generic tools.",
      },
      {
        q: "Who invented artificial intelligence and when did it emerge?",
        a: "The term 'artificial intelligence' was coined by John McCarthy in 1956 at the Dartmouth conference, considered the birth of the field. Names like Alan Turing, Marvin Minsky and Claude Shannon laid the theoretical foundations in the 1940s and 1950s.",
      },
      {
        q: "Why does artificial intelligence consume water and energy?",
        a: "AI models run in data centers whose servers generate intense heat and need cooling, which in many cases consumes water. Training and operating large models also demand significant energy. That is why energy efficiency and well-sized infrastructure are central criteria in serious AI projects.",
      },
      {
        q: "Will artificial intelligence replace humans?",
        a: "The evidence so far points to transformation, not mass replacement: AI automates tasks, and people shift to supervision, strategy and relationships. Organizations that treat AI as a tool to amplify human capability tend to reap the best results.",
      },
    ],
    finalTitle: "Ready to apply AI in your organization?",
    finalSub:
      "Talk to the team that builds sovereign AI infrastructure for companies, governments and cities. Straightforward diagnosis, no commitment.",
    ctaSchedule: "Schedule a meeting",
    ctaWhatsapp: "Chat on WhatsApp",
    ctaPlatform: "Explore the platform",
    ctaDiagnosis: "Schedule a diagnosis",
    finalWaMsg:
      "Hello! I read NowGo AI's Artificial Intelligence guide and I want to evaluate how to apply AI in my organization.",
  },

  /* ------------------------------------------------------------------ ES */
  es: {
    seoTitle:
      "Inteligencia Artificial: qué es, cómo funciona, tipos y cómo usarla (Guía Completa) · NowGo AI",
    seoDescription:
      "Guía completa de inteligencia artificial: qué es, cómo funciona, tipos, IA generativa y agentes, aplicaciones en salud, gobierno, educación e industria, y cómo adoptar IA soberana en su organización.",
    eyebrow: "Guía NowGo AI",
    title:
      "Inteligencia Artificial: qué es, cómo funciona y cómo aplicarla en empresas, gobiernos y ciudades",
    subtitle:
      "Una guía directa al punto para líderes que necesitan decidir sobre IA — de los conceptos fundamentales a la adopción de infraestructura soberana, con ejemplos reales por sector.",
    tocLabel: "En esta guía",
    toc: [
      { href: "#o-que-e", label: "Qué es la inteligencia artificial" },
      { href: "#como-funciona", label: "Cómo funciona la inteligencia artificial" },
      { href: "#tipos", label: "Tipos de IA: generativa, agentes y machine learning" },
      { href: "#vantagens", label: "Ventajas y desventajas" },
      { href: "#setores", label: "IA aplicada: salud, gobierno, educación e industria" },
      { href: "#soberania", label: "IA soberana: por qué se necesita infraestructura propia" },
      { href: "#como-adotar", label: "Cómo llevar la IA a su organización" },
      { href: "#faq", label: "Preguntas frecuentes" },
    ],
    sections: [
      {
        kind: "text",
        id: "o-que-e",
        heading: "Qué es la inteligencia artificial",
        paragraphs: [
          "La inteligencia artificial (IA) es el campo de la tecnología dedicado a construir sistemas capaces de ejecutar tareas que, hasta hace poco, exigían inteligencia humana: interpretar textos e imágenes, conversar en lenguaje natural, reconocer patrones en grandes volúmenes de datos y tomar decisiones con base en ellos.",
          "En la práctica, cuando hablamos de IA hoy, hablamos principalmente de modelos entrenados con datos — desde los asistentes de conversación hasta los sistemas que predicen la demanda hospitalaria, optimizan el tránsito de una ciudad o automatizan el backoffice de una empresa. La diferencia entre un experimento y un resultado real está menos en el modelo y más en cómo se integra a la operación.",
        ],
      },
      {
        kind: "text",
        id: "como-funciona",
        heading: "Cómo funciona la inteligencia artificial",
        paragraphs: [
          "El ciclo básico de cualquier sistema de IA tiene tres etapas: <strong>datos</strong> (el sistema se alimenta con ejemplos — textos, imágenes, registros operativos), <strong>entrenamiento</strong> (los algoritmos identifican patrones estadísticos en esos ejemplos) e <strong>inferencia</strong> (el modelo entrenado responde a situaciones nuevas: clasifica, predice, genera contenido o acciona un proceso).",
          "En los modelos de lenguaje (LLMs) que popularizaron la IA generativa, ese entrenamiento ocurre sobre volúmenes gigantescos de texto, y el resultado es un sistema capaz de comprender y producir lenguaje natural. Para uso corporativo y gubernamental, esos modelos se especializan con los datos y las reglas de la propia organización — ahí entran los LLMs personalizados y la infraestructura dedicada.",
        ],
      },
      {
        kind: "text",
        id: "tipos",
        heading: "Tipos de IA: generativa, agentes y machine learning",
        paragraphs: [
          "<strong>Machine learning</strong> es la base: sistemas que aprenden patrones a partir de datos para predecir y clasificar — detección de fraude, previsión de demanda, mantenimiento predictivo.",
          "<strong>IA generativa</strong> es la generación más reciente: modelos que crean contenido nuevo — texto, imagen, voz, código — a partir de instrucciones en lenguaje natural. Es la tecnología detrás de ChatGPT, Gemini y los copilotos corporativos.",
          "<strong>Agentes autónomos</strong> son el paso siguiente: sistemas de IA que no solo responden, sino que ejecutan — consultan bases, accionan sistemas, conducen atenciones por voz y completan flujos de trabajo enteros con supervisión humana. En esa capa la IA deja de ser una herramienta de productividad individual y pasa a operar procesos de la organización.",
        ],
      },
      {
        kind: "text",
        id: "vantagens",
        heading: "Ventajas y desventajas de la inteligencia artificial",
        paragraphs: [
          "<strong>Ventajas:</strong> escala (atención y análisis 24/7), velocidad de decisión, reducción de costos operativos en tareas repetitivas, personalización masiva y capacidad de encontrar patrones invisibles al ojo humano.",
          "<strong>Desventajas y riesgos:</strong> dependencia de la calidad de los datos, posibilidad de respuestas incorrectas cuando el sistema opera sin salvaguardas, costo energético de los grandes modelos y — el riesgo más subestimado por organizaciones públicas y privadas — la <strong>pérdida de soberanía sobre los datos</strong> cuando información sensible circula por plataformas de terceros, fuera del control y de la jurisdicción de la organización.",
          "La buena noticia: todos esos riesgos pueden abordarse con la arquitectura adecuada — modelos especializados, infraestructura bien dimensionada y gobernanza de datos desde el diseño del proyecto.",
        ],
      },
      {
        kind: "text",
        id: "setores",
        heading: "IA aplicada: ejemplos reales por sector",
        paragraphs: [
          "<strong>Salud.</strong> Agentes de voz que agendan consultas y hacen triaje, IA que apoya informes y radiología, y automatización del backoffice hospitalario. El impacto es directo: menos filas, menos rechazos de facturación, más tiempo del equipo clínico dedicado al paciente.",
        ],
      },
      {
        kind: "cta",
        title: "IA para hospitales y operadoras de salud",
        text: "NowGo AI implementa agentes de voz y automatización hospitalaria como módulos de una infraestructura integrada — no como softwares aislados.",
        waMsg:
          "¡Hola! Leí la guía de Inteligencia Artificial de NowGo AI y me interesa la IA para salud (hospitales, voz y backoffice).",
        waLabel: "Hablar sobre IA en salud",
      },
      {
        kind: "text",
        id: "setores-gov",
        heading: "",
        paragraphs: [
          "<strong>Gobiernos y ciudades inteligentes.</strong> Un Smart Cities OS conecta los datos urbanos — movilidad, seguridad, servicios públicos — en una capa única de orquestación, permitiendo que los gestores vean la ciudad en tiempo real y que el ciudadano sea atendido por canales inteligentes. La condición innegociable en este sector es la soberanía: los datos públicos deben permanecer bajo jurisdicción y control públicos.",
        ],
      },
      {
        kind: "cta",
        title: "IA soberana para gobiernos y ciudades",
        text: "Infraestructura operativa soberana, modular e interoperable para la gestión pública — de la atención al ciudadano a la orquestación de datos urbanos.",
        waMsg:
          "¡Hola! Leí la guía de Inteligencia Artificial de NowGo AI y me interesa la IA soberana para gobiernos y ciudades inteligentes.",
        waLabel: "Hablar sobre gobierno y ciudades",
      },
      {
        kind: "text",
        id: "setores-edu",
        heading: "",
        paragraphs: [
          "<strong>Educación.</strong> Para redes de enseñanza y universidades, la IA actúa en dos frentes: eficiencia institucional (matrículas, atención, deserción) y apoyo pedagógico (tutores inteligentes, producción de material, evaluación asistida por profesores). El desafío no es la herramienta — es la implementación con gobernanza, para que la IA amplíe al profesor en lugar de sustituirlo.",
          "<strong>Industria y empresas.</strong> De la industria 4.0 al sector financiero, los casos más maduros combinan predicción (demanda, mantenimiento, riesgo) con automatización de procesos y agentes que operan sistemas legados. La regla de éxito es una sola: reducción medible de costos o aumento medible de ingresos.",
          "<strong>Derecho y servicios profesionales.</strong> Análisis de contratos, investigación de jurisprudencia y automatización de rutinas procesales ya son realidad en estudios y departamentos jurídicos — con el cuidado obligatorio de mantener revisión humana y confidencialidad de los datos.",
        ],
      },
      {
        kind: "cta",
        title: "IA para industria, educación y empresas",
        text: "Diagnóstico del proceso, diseño de la arquitectura e implementación con metas medibles — la IA integrada a su operación, no otro software en el estante.",
        waMsg:
          "¡Hola! Leí la guía de Inteligencia Artificial de NowGo AI y me interesa la IA para instituciones educativas, industria o empresas.",
        waLabel: "Hablar sobre mi operación",
      },
      {
        kind: "text",
        id: "soberania",
        heading: "IA soberana: por qué se necesita infraestructura propia",
        paragraphs: [
          "La carrera global de la IA dejó de ser solo tecnológica — es geopolítica. Estados Unidos y China tratan modelos y data centers como activos estratégicos. Para países como Brasil, depender exclusivamente de plataformas extranjeras significa exportar datos sensibles de ciudadanos, hospitales y gobiernos, e importar decisiones tomadas fuera de su jurisdicción.",
          "IA soberana no significa aislamiento: significa que los datos críticos se procesan en infraestructura bajo control nacional, que los modelos pueden ser auditados y especializados para la realidad local, y que la organización — pública o privada — mantiene autonomía estratégica. Es el principio que orienta la arquitectura de NowGo AI: modular, soberana, interoperable y preparada para los requisitos de empresas y gobiernos.",
        ],
      },
      {
        kind: "text",
        id: "como-adotar",
        heading: "Cómo llevar la inteligencia artificial a su organización",
        paragraphs: [
          "La mayoría de los proyectos de IA que fracasan mueren por los mismos motivos: comenzar por la herramienta en lugar del problema, ignorar la calidad de los datos y tratar la IA como proyecto de TI en lugar de proyecto de operación. El camino que funciona tiene cuatro pasos:",
          "<strong>1. Diagnóstico del proceso</strong> — identificar dónde hay costo repetitivo, filas o decisiones basadas en datos que hoy nadie logra analizar. <strong>2. Piloto con meta medible</strong> — un alcance pequeño, con indicador claro (tiempo, costo, ingresos), en semanas y no años. <strong>3. Arquitectura soberana</strong> — definir desde el inicio dónde residen los datos, quién audita el modelo y cómo se integra a los sistemas existentes. <strong>4. Escala por módulos</strong> — expandir a partir de lo que probó valor, sobre la misma infraestructura, en lugar de acumular herramientas desconectadas.",
          'Ese es exactamente el modelo de trabajo de NowGo AI, socia de NVIDIA y reconocida entre las Top 50 innovadoras globales: LLMs personalizados, agentes autónomos e infraestructura de IA a medida, implementados como un ecosistema integrado para <a href="/">empresas, gobiernos y ciudades</a>.',
        ],
      },
    ],
    faqTitle: "Preguntas frecuentes sobre inteligencia artificial",
    faq: [
      {
        q: "¿Qué significa inteligencia artificial?",
        a: "La inteligencia artificial (IA) es el campo de la computación dedicado a crear sistemas capaces de ejecutar tareas que normalmente exigirían inteligencia humana: comprender lenguaje, reconocer patrones, tomar decisiones y aprender de los datos. En la práctica empresarial, IA significa software que aprende de la información de su operación para automatizar procesos y apoyar decisiones.",
      },
      {
        q: "¿Cuál es la diferencia entre inteligencia artificial y machine learning?",
        a: "El machine learning (aprendizaje automático) es una subárea de la inteligencia artificial. IA es el concepto amplio de máquinas que simulan capacidades cognitivas; machine learning es la técnica en la que los sistemas aprenden patrones a partir de datos, sin ser programados regla por regla. Todo machine learning es IA, pero no toda IA usa machine learning.",
      },
      {
        q: "¿Cuál inteligencia artificial es mejor?",
        a: "Depende del objetivo. Para uso personal, asistentes como ChatGPT, Gemini y Claude resuelven la mayoría de las tareas. Para empresas y gobiernos, la pregunta correcta es otra: ¿qué arquitectura de IA cumple los requisitos de soberanía de datos, integración con sistemas existentes y escala? En esos casos, los LLMs personalizados y la infraestructura dedicada superan a las herramientas genéricas.",
      },
      {
        q: "¿Quién inventó la inteligencia artificial y cuándo surgió?",
        a: "El término 'inteligencia artificial' fue acuñado por John McCarthy en 1956, en la conferencia de Dartmouth, considerada el hito de nacimiento del campo. Nombres como Alan Turing, Marvin Minsky y Claude Shannon establecieron las bases teóricas en las décadas de 1940 y 1950.",
      },
      {
        q: "¿Por qué la inteligencia artificial gasta agua y energía?",
        a: "Los modelos de IA funcionan en data centers cuyos servidores generan calor intenso y necesitan refrigeración, que en muchos casos consume agua. El entrenamiento y la operación de grandes modelos también demandan energía significativa. Por eso, la eficiencia energética y la infraestructura bien dimensionada son criterios centrales en proyectos serios de IA.",
      },
      {
        q: "¿La inteligencia artificial va a sustituir a los humanos?",
        a: "La evidencia hasta ahora apunta a transformación, no a sustitución masiva: la IA automatiza tareas, y las personas pasan a actuar en la supervisión, la estrategia y las relaciones. Las organizaciones que tratan la IA como herramienta de ampliación de la capacidad humana tienden a cosechar los mejores resultados.",
      },
    ],
    finalTitle: "¿Listo para aplicar IA en su organización?",
    finalSub:
      "Converse con quien construye infraestructura soberana de IA para empresas, gobiernos y ciudades. Diagnóstico directo, sin compromiso.",
    ctaSchedule: "Agendar reunión",
    ctaWhatsapp: "Hablar por WhatsApp",
    ctaPlatform: "Conocer la plataforma",
    ctaDiagnosis: "Agendar diagnóstico",
    finalWaMsg:
      "¡Hola! Leí la guía de Inteligencia Artificial de NowGo AI y quiero evaluar cómo aplicar IA en mi organización.",
  },
};
