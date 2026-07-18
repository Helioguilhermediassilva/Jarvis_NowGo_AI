import type { Lang } from "@/landing/copy";
import type { ArticleCopy } from "@/blog/BlogArticleLayout";

/** Conteúdo trilíngue do artigo "IA e Machine Learning". */

export const copyIaEMachineLearning: Record<Lang, ArticleCopy> = {
  /* ------------------------------------------------------------------ PT */
  pt: {
    seoTitle:
      "Inteligência Artificial e Machine Learning: qual a diferença (e o que isso muda na prática) · NowGo AI",
    seoDescription:
      "IA, machine learning, deep learning e IA generativa explicados sem jargão: como os conceitos se encaixam, exemplos práticos de cada um e qual deles a sua organização realmente precisa.",
    eyebrow: "Guia NowGo AI · Conceitos",
    title: "Inteligência Artificial e Machine Learning: qual a diferença — e o que isso muda na prática",
    subtitle:
      "IA, machine learning, deep learning e IA generativa formam camadas de um mesmo campo. Entenda como se encaixam, com exemplos reais — e descubra qual deles o seu problema realmente pede.",
    breadcrumbName: "IA e Machine Learning",
    tocLabel: "Neste guia",
    toc: [
      { href: "#resposta", label: "A resposta em um parágrafo" },
      { href: "#camadas", label: "As camadas: IA → machine learning → deep learning → IA generativa" },
      { href: "#exemplos", label: "Exemplos práticos de cada camada" },
      { href: "#qual", label: "Qual a sua organização precisa?" },
      { href: "#faq", label: "Perguntas frequentes" },
    ],
    sections: [
      {
        kind: "text",
        id: "resposta",
        heading: "A resposta em um parágrafo",
        paragraphs: [
          "<strong>Inteligência artificial</strong> é o campo amplo: construir sistemas que executam tarefas associadas à inteligência humana. <strong>Machine learning</strong> é uma subárea da IA: em vez de programar regras manualmente, o sistema aprende padrões a partir de dados. <strong>Deep learning</strong> é uma subárea do machine learning que usa redes neurais profundas para padrões complexos. E a <strong>IA generativa</strong> — a geração do ChatGPT e dos agentes — é construída sobre deep learning para criar conteúdo novo: texto, imagem, voz, código. São círculos concêntricos, não tecnologias rivais.",
        ],
      },
      {
        kind: "text",
        id: "camadas",
        heading: "As camadas, da mais ampla à mais específica",
        paragraphs: [
          '<strong>Inteligência artificial (o campo).</strong> Nasceu formalmente em 1956 e engloba tudo: dos antigos sistemas de regras ("se X, então Y") aos modelos atuais. Quando alguém diz que uma empresa "usa IA", está no nível mais genérico possível — a pergunta útil é sempre <em>qual técnica, para qual problema</em>.',
          "<strong>Machine learning (a técnica dominante).</strong> O sistema recebe exemplos históricos — transações legítimas e fraudulentas, pacientes que faltaram e que compareceram — e aprende os padrões que distinguem uns dos outros. O resultado é um modelo capaz de prever e classificar casos novos. É a técnica por trás da maioria do valor de IA gerado em empresas na última década.",
          "<strong>Deep learning (a técnica que destravou a era atual).</strong> Redes neurais com muitas camadas, treinadas com grandes volumes de dados e poder computacional — tipicamente GPUs. Foi o deep learning que tornou possível reconhecer imagens e voz com precisão prática e, depois, treinar os grandes modelos de linguagem.",
          '<strong>IA generativa e agentes (a fronteira).</strong> LLMs que compreendem e produzem linguagem, imagem e voz — e, quando conectados a sistemas e ferramentas, viram <a href="/blog/agentes-de-inteligencia-artificial">agentes de IA</a> que executam processos de ponta a ponta.',
        ],
      },
      {
        kind: "text",
        id: "exemplos",
        heading: "Exemplos práticos de cada camada",
        paragraphs: [
          "<strong>Machine learning tradicional:</strong> previsão de demanda e ocupação de leitos, detecção de fraude em pagamentos, score de risco de crédito, manutenção preditiva de equipamentos, previsão de evasão escolar. Dados estruturados, resposta numérica ou classificação.",
          '<strong>Deep learning:</strong> leitura assistida de exames de imagem na <a href="/blog/inteligencia-artificial-na-saude">saúde</a>, reconhecimento de voz, inspeção visual de qualidade na indústria, visão computacional em cidades (contagem de fluxo, detecção de incidentes).',
          "<strong>IA generativa e agentes:</strong> atendimento por voz que agenda e confirma, documentação assistida, análise e redação de documentos, copilotos internos treinados no conhecimento da organização, agentes de backoffice que operam sistemas legados.",
        ],
      },
      {
        kind: "cta",
        title: "Do conceito à aplicação certa",
        text: "A NowGo AI faz o diagnóstico do seu problema e desenha a combinação correta — machine learning para previsão, IA generativa e agentes para linguagem e processos — sobre uma infraestrutura soberana única.",
        waMsg:
          "Olá! Li o artigo sobre IA e machine learning da NowGo AI e quero avaliar aplicações na minha organização.",
        waLabel: "Avaliar meu caso",
      },
      {
        kind: "text",
        id: "qual",
        heading: "Qual a sua organização precisa?",
        paragraphs: [
          'A regra prática é olhar para o formato do problema. Se a pergunta é <em>"quanto/qual a chance/qual categoria"</em> sobre dados estruturados — quanto vamos vender, qual a chance deste cliente cancelar, esta transação é fraude? — o caminho é machine learning tradicional: mais barato de operar, mais fácil de auditar. Se o problema envolve <em>linguagem, documentos, conversa ou execução de processos</em> — atender, redigir, resumir, operar sistemas — o caminho é IA generativa e agentes.',
          'Operações maduras não escolhem: combinam as duas camadas sobre a mesma base de dados e a mesma governança. É a abordagem da <a href="/">plataforma soberana da NowGo AI</a> — modelos preditivos, LLMs customizados e agentes como módulos de uma infraestrutura única, e não como ferramentas desconexas. Para entender o campo completo, veja também o nosso <a href="/blog/inteligencia-artificial">guia completo de inteligência artificial</a>.',
        ],
      },
    ],
    faqTitle: "Perguntas frequentes",
    faq: [
      {
        q: "Qual é a diferença entre inteligência artificial e machine learning?",
        a: "Inteligência artificial é o campo amplo: sistemas que executam tarefas associadas à inteligência humana. Machine learning é uma subárea da IA: a técnica em que o sistema aprende padrões a partir de dados, em vez de seguir regras programadas manualmente. Todo machine learning é IA, mas IA inclui também outras abordagens.",
      },
      {
        q: "O que é deep learning?",
        a: "Deep learning (aprendizado profundo) é uma subárea do machine learning que usa redes neurais com muitas camadas para aprender padrões complexos — é a técnica por trás do reconhecimento de imagem e voz modernos e dos grandes modelos de linguagem (LLMs) que alimentam a IA generativa.",
      },
      {
        q: "IA generativa é a mesma coisa que machine learning?",
        a: "A IA generativa é construída com machine learning (mais precisamente, com deep learning), mas é um tipo específico: modelos que criam conteúdo novo — texto, imagem, voz, código. Já o machine learning tradicional se concentra em prever e classificar: risco de crédito, previsão de demanda, detecção de fraude.",
      },
      {
        q: "Minha empresa precisa de machine learning ou de IA generativa?",
        a: "Provavelmente dos dois, para problemas diferentes. Previsões sobre dados estruturados (demanda, inadimplência, manutenção) pedem machine learning tradicional. Tarefas de linguagem e atendimento (documentos, conversas, voz) pedem IA generativa e agentes. Operações maduras combinam ambos sobre a mesma infraestrutura de dados.",
      },
    ],
    finalTitle: "Quer aplicar a técnica certa ao seu problema?",
    finalSub:
      "Diagnóstico direto: onde machine learning resolve, onde agentes resolvem e como combinar os dois com soberania de dados.",
    ctaSchedule: "Agendar reunião",
    ctaWhatsapp: "Falar no WhatsApp",
    ctaThird: "Conhecer a plataforma",
    ctaThirdHref: "/#platform",
    ctaDiagnosis: "Agendar diagnóstico",
    finalWaMsg:
      "Olá! Li o artigo sobre IA e machine learning da NowGo AI e quero avaliar aplicações na minha organização.",
  },

  /* ------------------------------------------------------------------ EN */
  en: {
    seoTitle:
      "Artificial Intelligence and Machine Learning: What's the Difference (and Why It Matters in Practice) · NowGo AI",
    seoDescription:
      "AI, machine learning, deep learning and generative AI explained without jargon: how the concepts fit together, practical examples of each and which one your organization actually needs.",
    eyebrow: "NowGo AI Guide · Concepts",
    title: "Artificial Intelligence and Machine Learning: what's the difference — and why it matters in practice",
    subtitle:
      "AI, machine learning, deep learning and generative AI are layers of the same field. Understand how they fit together, with real examples — and find out which one your problem actually calls for.",
    breadcrumbName: "AI and Machine Learning",
    tocLabel: "In this guide",
    toc: [
      { href: "#resposta", label: "The answer in one paragraph" },
      { href: "#camadas", label: "The layers: AI → machine learning → deep learning → generative AI" },
      { href: "#exemplos", label: "Practical examples of each layer" },
      { href: "#qual", label: "Which one does your organization need?" },
      { href: "#faq", label: "Frequently asked questions" },
    ],
    sections: [
      {
        kind: "text",
        id: "resposta",
        heading: "The answer in one paragraph",
        paragraphs: [
          "<strong>Artificial intelligence</strong> is the broad field: building systems that perform tasks associated with human intelligence. <strong>Machine learning</strong> is a subfield of AI: instead of programming rules by hand, the system learns patterns from data. <strong>Deep learning</strong> is a subfield of machine learning that uses deep neural networks for complex patterns. And <strong>generative AI</strong> — the generation of ChatGPT and agents — is built on deep learning to create new content: text, images, voice, code. They are concentric circles, not rival technologies.",
        ],
      },
      {
        kind: "text",
        id: "camadas",
        heading: "The layers, from broadest to most specific",
        paragraphs: [
          '<strong>Artificial intelligence (the field).</strong> Formally born in 1956, it encompasses everything: from the old rule-based systems ("if X, then Y") to today\'s models. When someone says a company "uses AI", they are at the most generic level possible — the useful question is always <em>which technique, for which problem</em>.',
          "<strong>Machine learning (the dominant technique).</strong> The system receives historical examples — legitimate and fraudulent transactions, patients who showed up and those who didn't — and learns the patterns that distinguish them. The result is a model capable of predicting and classifying new cases. It is the technique behind most of the AI value generated in companies over the last decade.",
          "<strong>Deep learning (the technique that unlocked the current era).</strong> Neural networks with many layers, trained on large data volumes and computing power — typically GPUs. Deep learning is what made practical image and voice recognition possible, and later the training of large language models.",
          '<strong>Generative AI and agents (the frontier).</strong> LLMs that understand and produce language, images and voice — and, when connected to systems and tools, become <a href="/en/blog/agentes-de-inteligencia-artificial">AI agents</a> that execute processes end to end.',
        ],
      },
      {
        kind: "text",
        id: "exemplos",
        heading: "Practical examples of each layer",
        paragraphs: [
          "<strong>Traditional machine learning:</strong> demand and bed-occupancy forecasting, payment fraud detection, credit risk scoring, predictive equipment maintenance, school dropout prediction. Structured data, numeric answers or classification.",
          '<strong>Deep learning:</strong> assisted reading of imaging exams in <a href="/en/blog/inteligencia-artificial-na-saude">healthcare</a>, speech recognition, visual quality inspection in industry, computer vision in cities (flow counting, incident detection).',
          "<strong>Generative AI and agents:</strong> voice service that schedules and confirms, assisted documentation, document analysis and drafting, internal copilots trained on the organization's knowledge, back-office agents that operate legacy systems.",
        ],
      },
      {
        kind: "cta",
        title: "From concept to the right application",
        text: "NowGo AI diagnoses your problem and designs the right combination — machine learning for prediction, generative AI and agents for language and processes — on a single sovereign infrastructure.",
        waMsg:
          "Hello! I read NowGo AI's article on AI and machine learning and I'd like to evaluate applications in my organization.",
        waLabel: "Evaluate my case",
      },
      {
        kind: "text",
        id: "qual",
        heading: "Which one does your organization need?",
        paragraphs: [
          'The practical rule is to look at the shape of the problem. If the question is <em>"how much / what are the odds / which category"</em> over structured data — how much will we sell, what is the chance this customer churns, is this transaction fraud? — the path is traditional machine learning: cheaper to operate, easier to audit. If the problem involves <em>language, documents, conversation or process execution</em> — serving, drafting, summarizing, operating systems — the path is generative AI and agents.',
          'Mature operations don\'t choose: they combine both layers on the same data foundation and the same governance. That is the approach of the <a href="/">NowGo AI sovereign platform</a> — predictive models, custom LLMs and agents as modules of a single infrastructure, rather than disconnected tools. To understand the full field, see also our <a href="/en/blog/inteligencia-artificial">complete guide to artificial intelligence</a>.',
        ],
      },
    ],
    faqTitle: "Frequently asked questions",
    faq: [
      {
        q: "What is the difference between artificial intelligence and machine learning?",
        a: "Artificial intelligence is the broad field: systems that perform tasks associated with human intelligence. Machine learning is a subfield of AI: the technique in which the system learns patterns from data instead of following manually programmed rules. All machine learning is AI, but AI also includes other approaches.",
      },
      {
        q: "What is deep learning?",
        a: "Deep learning is a subfield of machine learning that uses neural networks with many layers to learn complex patterns — it is the technique behind modern image and speech recognition and the large language models (LLMs) that power generative AI.",
      },
      {
        q: "Is generative AI the same thing as machine learning?",
        a: "Generative AI is built with machine learning (more precisely, with deep learning), but it is a specific type: models that create new content — text, images, voice, code. Traditional machine learning, in contrast, focuses on predicting and classifying: credit risk, demand forecasting, fraud detection.",
      },
      {
        q: "Does my company need machine learning or generative AI?",
        a: "Probably both, for different problems. Predictions over structured data (demand, delinquency, maintenance) call for traditional machine learning. Language and service tasks (documents, conversations, voice) call for generative AI and agents. Mature operations combine both on the same data infrastructure.",
      },
    ],
    finalTitle: "Want to apply the right technique to your problem?",
    finalSub:
      "Straightforward diagnosis: where machine learning solves it, where agents solve it, and how to combine both with data sovereignty.",
    ctaSchedule: "Schedule a meeting",
    ctaWhatsapp: "Chat on WhatsApp",
    ctaThird: "Explore the platform",
    ctaThirdHref: "/#platform",
    ctaDiagnosis: "Schedule a diagnosis",
    finalWaMsg:
      "Hello! I read NowGo AI's article on AI and machine learning and I'd like to evaluate applications in my organization.",
  },

  /* ------------------------------------------------------------------ ES */
  es: {
    seoTitle:
      "Inteligencia Artificial y Machine Learning: cuál es la diferencia (y qué cambia en la práctica) · NowGo AI",
    seoDescription:
      "IA, machine learning, deep learning e IA generativa explicados sin jerga: cómo encajan los conceptos, ejemplos prácticos de cada uno y cuál necesita realmente su organización.",
    eyebrow: "Guía NowGo AI · Conceptos",
    title: "Inteligencia Artificial y Machine Learning: cuál es la diferencia — y qué cambia en la práctica",
    subtitle:
      "IA, machine learning, deep learning e IA generativa forman capas de un mismo campo. Entienda cómo encajan, con ejemplos reales — y descubra cuál pide realmente su problema.",
    breadcrumbName: "IA y Machine Learning",
    tocLabel: "En esta guía",
    toc: [
      { href: "#resposta", label: "La respuesta en un párrafo" },
      { href: "#camadas", label: "Las capas: IA → machine learning → deep learning → IA generativa" },
      { href: "#exemplos", label: "Ejemplos prácticos de cada capa" },
      { href: "#qual", label: "¿Cuál necesita su organización?" },
      { href: "#faq", label: "Preguntas frecuentes" },
    ],
    sections: [
      {
        kind: "text",
        id: "resposta",
        heading: "La respuesta en un párrafo",
        paragraphs: [
          "<strong>Inteligencia artificial</strong> es el campo amplio: construir sistemas que ejecutan tareas asociadas a la inteligencia humana. <strong>Machine learning</strong> es una subárea de la IA: en lugar de programar reglas manualmente, el sistema aprende patrones a partir de datos. <strong>Deep learning</strong> es una subárea del machine learning que usa redes neuronales profundas para patrones complejos. Y la <strong>IA generativa</strong> — la generación de ChatGPT y de los agentes — se construye sobre deep learning para crear contenido nuevo: texto, imagen, voz, código. Son círculos concéntricos, no tecnologías rivales.",
        ],
      },
      {
        kind: "text",
        id: "camadas",
        heading: "Las capas, de la más amplia a la más específica",
        paragraphs: [
          '<strong>Inteligencia artificial (el campo).</strong> Nació formalmente en 1956 y engloba todo: de los antiguos sistemas de reglas ("si X, entonces Y") a los modelos actuales. Cuando alguien dice que una empresa "usa IA", está en el nivel más genérico posible — la pregunta útil es siempre <em>qué técnica, para qué problema</em>.',
          "<strong>Machine learning (la técnica dominante).</strong> El sistema recibe ejemplos históricos — transacciones legítimas y fraudulentas, pacientes que faltaron y que asistieron — y aprende los patrones que los distinguen. El resultado es un modelo capaz de predecir y clasificar casos nuevos. Es la técnica detrás de la mayor parte del valor de IA generado en las empresas en la última década.",
          "<strong>Deep learning (la técnica que destrabó la era actual).</strong> Redes neuronales con muchas capas, entrenadas con grandes volúmenes de datos y poder computacional — típicamente GPUs. Fue el deep learning lo que hizo posible reconocer imágenes y voz con precisión práctica y, después, entrenar los grandes modelos de lenguaje.",
          '<strong>IA generativa y agentes (la frontera).</strong> LLMs que comprenden y producen lenguaje, imagen y voz — y, cuando se conectan a sistemas y herramientas, se convierten en <a href="/es/blog/agentes-de-inteligencia-artificial">agentes de IA</a> que ejecutan procesos de punta a punta.',
        ],
      },
      {
        kind: "text",
        id: "exemplos",
        heading: "Ejemplos prácticos de cada capa",
        paragraphs: [
          "<strong>Machine learning tradicional:</strong> previsión de demanda y ocupación de camas, detección de fraude en pagos, score de riesgo de crédito, mantenimiento predictivo de equipos, predicción de deserción escolar. Datos estructurados, respuesta numérica o clasificación.",
          '<strong>Deep learning:</strong> lectura asistida de exámenes de imagen en la <a href="/es/blog/inteligencia-artificial-na-saude">salud</a>, reconocimiento de voz, inspección visual de calidad en la industria, visión computacional en ciudades (conteo de flujo, detección de incidentes).',
          "<strong>IA generativa y agentes:</strong> atención por voz que agenda y confirma, documentación asistida, análisis y redacción de documentos, copilotos internos entrenados en el conocimiento de la organización, agentes de backoffice que operan sistemas legados.",
        ],
      },
      {
        kind: "cta",
        title: "Del concepto a la aplicación correcta",
        text: "NowGo AI diagnostica su problema y diseña la combinación correcta — machine learning para predicción, IA generativa y agentes para lenguaje y procesos — sobre una infraestructura soberana única.",
        waMsg:
          "¡Hola! Leí el artículo sobre IA y machine learning de NowGo AI y quiero evaluar aplicaciones en mi organización.",
        waLabel: "Evaluar mi caso",
      },
      {
        kind: "text",
        id: "qual",
        heading: "¿Cuál necesita su organización?",
        paragraphs: [
          'La regla práctica es mirar la forma del problema. Si la pregunta es <em>"cuánto / qué probabilidad / qué categoría"</em> sobre datos estructurados — cuánto venderemos, qué probabilidad hay de que este cliente cancele, ¿esta transacción es fraude? — el camino es machine learning tradicional: más barato de operar, más fácil de auditar. Si el problema involucra <em>lenguaje, documentos, conversación o ejecución de procesos</em> — atender, redactar, resumir, operar sistemas — el camino es IA generativa y agentes.',
          'Las operaciones maduras no eligen: combinan las dos capas sobre la misma base de datos y la misma gobernanza. Es el enfoque de la <a href="/">plataforma soberana de NowGo AI</a> — modelos predictivos, LLMs personalizados y agentes como módulos de una infraestructura única, y no como herramientas desconectadas. Para entender el campo completo, vea también nuestra <a href="/es/blog/inteligencia-artificial">guía completa de inteligencia artificial</a>.',
        ],
      },
    ],
    faqTitle: "Preguntas frecuentes",
    faq: [
      {
        q: "¿Cuál es la diferencia entre inteligencia artificial y machine learning?",
        a: "La inteligencia artificial es el campo amplio: sistemas que ejecutan tareas asociadas a la inteligencia humana. El machine learning es una subárea de la IA: la técnica en la que el sistema aprende patrones a partir de datos, en lugar de seguir reglas programadas manualmente. Todo machine learning es IA, pero la IA también incluye otros enfoques.",
      },
      {
        q: "¿Qué es el deep learning?",
        a: "El deep learning (aprendizaje profundo) es una subárea del machine learning que usa redes neuronales con muchas capas para aprender patrones complejos — es la técnica detrás del reconocimiento moderno de imagen y voz y de los grandes modelos de lenguaje (LLMs) que alimentan la IA generativa.",
      },
      {
        q: "¿La IA generativa es lo mismo que el machine learning?",
        a: "La IA generativa se construye con machine learning (más precisamente, con deep learning), pero es un tipo específico: modelos que crean contenido nuevo — texto, imagen, voz, código. El machine learning tradicional, en cambio, se concentra en predecir y clasificar: riesgo de crédito, previsión de demanda, detección de fraude.",
      },
      {
        q: "¿Mi empresa necesita machine learning o IA generativa?",
        a: "Probablemente ambos, para problemas diferentes. Las predicciones sobre datos estructurados (demanda, morosidad, mantenimiento) piden machine learning tradicional. Las tareas de lenguaje y atención (documentos, conversaciones, voz) piden IA generativa y agentes. Las operaciones maduras combinan ambos sobre la misma infraestructura de datos.",
      },
    ],
    finalTitle: "¿Quiere aplicar la técnica correcta a su problema?",
    finalSub:
      "Diagnóstico directo: dónde resuelve el machine learning, dónde resuelven los agentes y cómo combinar ambos con soberanía de datos.",
    ctaSchedule: "Agendar reunión",
    ctaWhatsapp: "Hablar por WhatsApp",
    ctaThird: "Conocer la plataforma",
    ctaThirdHref: "/#platform",
    ctaDiagnosis: "Agendar diagnóstico",
    finalWaMsg:
      "¡Hola! Leí el artículo sobre IA y machine learning de NowGo AI y quiero evaluar aplicaciones en mi organización.",
  },
};
