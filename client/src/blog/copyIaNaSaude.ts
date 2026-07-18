import type { Lang } from "@/landing/copy";
import type { ArticleCopy } from "@/blog/BlogArticleLayout";

/** Conteúdo trilíngue do artigo "IA na Saúde". */

export const copyIaNaSaude: Record<Lang, ArticleCopy> = {
  /* ------------------------------------------------------------------ PT */
  pt: {
    seoTitle:
      "Inteligência Artificial na Saúde: aplicações reais em hospitais, clínicas e operadoras · NowGo AI",
    seoDescription:
      "Como a inteligência artificial já funciona na saúde e na medicina: agentes de voz para agendamento e triagem, apoio à radiologia, automação de backoffice hospitalar, LGPD e soberania de dados, e por onde começar.",
    eyebrow: "Guia NowGo AI · Saúde",
    title: "Inteligência Artificial na Saúde: aplicações reais em hospitais, clínicas e operadoras",
    subtitle:
      "Onde a IA já entrega resultado na medicina — do agente de voz que elimina fila de agendamento ao apoio à radiologia e ao backoffice hospitalar — e como implantar com segurança clínica, LGPD e soberania de dados.",
    breadcrumbName: "IA na Saúde",
    tocLabel: "Neste guia",
    toc: [
      { href: "#panorama", label: "O que a IA muda na saúde, na prática" },
      { href: "#paciente", label: "Relacionamento com o paciente: agentes de voz e triagem" },
      { href: "#clinico", label: "Apoio clínico: radiologia, laudos e documentação" },
      { href: "#operacao", label: "Operação e backoffice: leitos, faltas e glosas" },
      { href: "#lgpd", label: "LGPD, ética e soberania de dados na saúde" },
      { href: "#implantar", label: "Como implantar: do diagnóstico ao piloto" },
      { href: "#faq", label: "Perguntas frequentes" },
    ],
    sections: [
      {
        kind: "text",
        id: "panorama",
        heading: "O que a inteligência artificial muda na saúde, na prática",
        paragraphs: [
          'A saúde é o setor onde a distância entre o hype e a operação real é mais visível. De um lado, promessas de diagnóstico automático; de outro, hospitais com fila no agendamento, equipes assistenciais consumidas por tarefa administrativa e receita perdida em glosas. A <a href="/blog/inteligencia-artificial">inteligência artificial</a> que gera resultado hoje ataca exatamente essa segunda lista — os gargalos operacionais — enquanto apoia, sem substituir, a decisão clínica.',
          "Uma forma útil de organizar as aplicações é em três camadas: o relacionamento com o paciente, o apoio ao trabalho clínico e a operação do negócio de saúde. As três funcionam melhor quando fazem parte de uma mesma infraestrutura — falando com o prontuário, com a agenda e com o faturamento — em vez de chegarem como ferramentas isoladas que criam novos silos.",
        ],
      },
      {
        kind: "text",
        id: "paciente",
        heading: "Relacionamento com o paciente: agentes de voz e triagem inteligente",
        paragraphs: [
          "O primeiro contato do paciente com a instituição é telefônico ou digital — e é onde mais se perde eficiência. <strong>Agentes de voz com IA</strong> atendem ligações em linguagem natural, agendam, remarcam e confirmam consultas e exames, respondem dúvidas frequentes de preparo e fazem triagem inicial de urgência para direcionar o caso ao canal certo.",
          "O impacto é mensurável em três indicadores: taxa de absenteísmo (confirmação ativa reduz faltas), tempo de espera no atendimento telefônico e horas de recepção liberadas para o atendimento presencial. E, ao contrário das URAs tradicionais, o agente de voz conversa — o que muda a experiência do paciente, em especial de populações com menos familiaridade digital, que resolvem tudo por uma ligação comum.",
        ],
      },
      {
        kind: "cta",
        title: "Agente de voz para agendamento e confirmação",
        text: "A NowGo AI implanta agentes de voz integrados à agenda e ao backoffice da instituição — como módulo de uma infraestrutura soberana, não como mais um software isolado.",
        waMsg:
          "Olá! Li o artigo sobre IA na saúde da NowGo AI e quero conversar sobre agente de voz para minha instituição.",
        waLabel: "Falar sobre agente de voz",
      },
      {
        kind: "text",
        id: "clinico",
        heading: "Apoio clínico: radiologia, laudos e documentação assistida",
        paragraphs: [
          "Na camada clínica, o papel da IA é organizar informação e priorizar — nunca decidir sozinha. Em <strong>radiologia</strong>, sistemas de IA ordenam a fila de leitura destacando exames com suspeita de achados críticos e sugerem regiões de atenção para revisão do radiologista, o que reduz tempo até o laudo nos casos que não podem esperar.",
          "Na <strong>documentação clínica</strong>, a IA transcreve e estrutura o registro da consulta para validação do profissional, devolvendo ao médico minutos de cada atendimento que hoje são gastos digitando. E na gestão do cuidado, modelos preditivos ajudam a identificar pacientes com maior risco de agravamento ou reinternação, apoiando protocolos de acompanhamento.",
          "Em todos esses usos, dois princípios são inegociáveis: <strong>supervisão humana</strong> — a responsabilidade diagnóstica é do médico — e <strong>rastreabilidade</strong> — a instituição precisa poder auditar o que o sistema sugeriu e por quê. É por isso que modelos especializados e auditáveis, rodando em infraestrutura controlada pela instituição, são o padrão correto para o ambiente clínico.",
        ],
      },
      {
        kind: "text",
        id: "operacao",
        heading: "Operação e backoffice: leitos, faltas, faturamento e glosas",
        paragraphs: [
          "É a camada menos glamourosa e a de retorno mais rápido. <strong>Previsão de demanda</strong> (ocupação de leitos, volume de pronto atendimento, escala de equipes) permite planejar em vez de reagir. <strong>Automação de faturamento</strong> confere guias, checa conformidade com regras de convênios antes do envio e reduz a principal fonte de perda silenciosa de receita dos hospitais brasileiros: a glosa.",
          "Agentes de IA também assumem rotinas administrativas inteiras — conciliação, follow-up de pendências, atualização de cadastros — operando os sistemas que a instituição já usa. Para a gestão, o efeito combinado é caixa mais previsível e equipe administrativa focada em exceções, não em digitação.",
        ],
      },
      {
        kind: "cta",
        title: "Backoffice hospitalar com IA",
        text: "Diagnóstico dos processos de faturamento, glosas e agendamento, e implantação de automação com metas mensuráveis — integrada aos sistemas que seu hospital já usa.",
        waMsg:
          "Olá! Li o artigo sobre IA na saúde da NowGo AI e quero conversar sobre automação do backoffice do meu hospital.",
        waLabel: "Falar sobre meu hospital",
      },
      {
        kind: "text",
        id: "lgpd",
        heading: "LGPD, ética e soberania de dados na saúde",
        paragraphs: [
          "Dado de saúde é dado sensível — a LGPD é explícita. Isso impõe três exigências a qualquer projeto de IA no setor: base legal e finalidade claras, minimização e controle de acesso, e transparência sobre <strong>onde e por quem</strong> os dados são processados.",
          'É nesse último ponto que muitos projetos falham: ao usar plataformas genéricas de IA, dados de pacientes podem trafegar por infraestruturas fora do controle da instituição e fora da jurisdição brasileira. A alternativa é a <strong>arquitetura soberana</strong>: modelos especializados processando dados em infraestrutura sob controle da instituição, com trilha de auditoria completa — o princípio que detalhamos no artigo sobre <a href="/blog/inteligencia-artificial-no-brasil">IA soberana</a>. Além de reduzir risco regulatório, essa abordagem protege o ativo mais estratégico de um hospital: a confiança do paciente.',
        ],
      },
      {
        kind: "text",
        id: "implantar",
        heading: "Como implantar IA na sua instituição de saúde",
        paragraphs: [
          'O roteiro que funciona é o mesmo que descrevemos no <a href="/blog/inteligencia-artificial">guia completo de inteligência artificial</a>, aplicado à realidade da saúde:',
          "<strong>1. Diagnóstico</strong> — mapear onde estão fila, falta, glosa e hora administrativa desperdiçada. <strong>2. Piloto com indicador</strong> — um escopo fechado (por exemplo, agente de voz para confirmação de consultas em uma unidade), com meta numérica e prazo de semanas. <strong>3. Governança desde o desenho</strong> — LGPD, supervisão clínica e residência dos dados definidos antes da primeira linha de integração. <strong>4. Escala por módulos</strong> — expandir do agendamento ao backoffice e ao apoio clínico sobre a mesma infraestrutura.",
          'É assim que a NowGo AI — parceira NVIDIA e reconhecida entre as Top 50 inovadoras globais — estrutura seus projetos de saúde: voz, automação e inteligência operacional como módulos de uma <a href="/">plataforma soberana para empresas, governos e cidades</a>, com o paciente e a equipe de saúde no centro.',
        ],
      },
    ],
    faqTitle: "Perguntas frequentes sobre IA na saúde",
    faq: [
      {
        q: "Como a inteligência artificial é usada na medicina hoje?",
        a: "As aplicações mais maduras estão em três camadas: relacionamento com o paciente (agentes de voz e chat para agendamento, confirmação e triagem inicial), apoio clínico (priorização de exames de imagem, sugestão de achados para revisão do radiologista, documentação assistida de consultas) e operação (previsão de demanda e de faltas, gestão de leitos, faturamento e combate a glosas). Em todas elas, a decisão clínica permanece com o profissional de saúde.",
      },
      {
        q: "A inteligência artificial pode substituir médicos?",
        a: "Não — e os projetos sérios não tentam isso. A IA atua como camada de apoio: reduz tarefa administrativa, prioriza casos e organiza informação para que o médico decida melhor e mais rápido. A responsabilidade pelo diagnóstico e pela conduta é sempre do profissional habilitado, e a supervisão humana é requisito de desenho, não um detalhe.",
      },
      {
        q: "IA na saúde é compatível com a LGPD?",
        a: "Sim, desde que o projeto nasça com governança: dados de saúde são dados sensíveis pela LGPD, o que exige base legal adequada, minimização, controle de acesso e — ponto crítico — clareza sobre onde os dados são processados. Arquiteturas soberanas, em que os dados permanecem em infraestrutura sob controle da instituição e em jurisdição nacional, simplificam a conformidade e reduzem risco regulatório.",
      },
      {
        q: "Por onde um hospital ou clínica deve começar com IA?",
        a: "Pelo processo com fila ou custo mais evidente e resultado mais fácil de medir. Na prática, os pontos de partida mais comuns são o agendamento e confirmação por agente de voz (reduz falta e libera a recepção) e a automação de rotinas de backoffice como faturamento e glosas. Um piloto bem delimitado, com indicador claro, prova valor em semanas e cria a base para escalar por módulos.",
      },
      {
        q: "Quanto custa implantar inteligência artificial na saúde?",
        a: "Varia com o escopo: um agente de voz para agendamento tem custo e prazo muito diferentes de uma plataforma integrada ao prontuário. A referência correta não é o preço da ferramenta, e sim o retorno mensurável — redução de faltas, de glosas e de horas administrativas. Por isso o caminho recomendado é começar com diagnóstico e piloto de escopo fechado antes de qualquer contrato amplo.",
      },
    ],
    finalTitle: "Quer levar IA para o seu hospital, clínica ou operadora?",
    finalSub:
      "Converse com quem implanta IA na saúde com soberania de dados, supervisão clínica e metas mensuráveis. Diagnóstico direto, sem compromisso.",
    ctaSchedule: "Agendar reunião",
    ctaWhatsapp: "Falar no WhatsApp",
    ctaThird: "Ver soluções por setor",
    ctaThirdHref: "/#verticals",
    ctaDiagnosis: "Agendar diagnóstico",
    finalWaMsg:
      "Olá! Li o artigo sobre IA na saúde da NowGo AI e quero conversar sobre aplicação no meu hospital/clínica/operadora.",
  },

  /* ------------------------------------------------------------------ EN */
  en: {
    seoTitle:
      "Artificial Intelligence in Healthcare: Real Applications in Hospitals, Clinics and Health Plans · NowGo AI",
    seoDescription:
      "How AI already works in healthcare and medicine: voice agents for scheduling and triage, radiology support, hospital back-office automation, data protection and sovereignty, and where to start.",
    eyebrow: "NowGo AI Guide · Healthcare",
    title: "Artificial Intelligence in Healthcare: real applications in hospitals, clinics and health plans",
    subtitle:
      "Where AI already delivers results in medicine — from the voice agent that eliminates scheduling queues to radiology support and hospital back office — and how to deploy it with clinical safety, data protection and sovereignty.",
    breadcrumbName: "AI in Healthcare",
    tocLabel: "In this guide",
    toc: [
      { href: "#panorama", label: "What AI changes in healthcare, in practice" },
      { href: "#paciente", label: "Patient relations: voice agents and smart triage" },
      { href: "#clinico", label: "Clinical support: radiology, reports and documentation" },
      { href: "#operacao", label: "Operations and back office: beds, no-shows and claim denials" },
      { href: "#lgpd", label: "Data protection, ethics and sovereignty in healthcare" },
      { href: "#implantar", label: "How to deploy: from diagnosis to pilot" },
      { href: "#faq", label: "Frequently asked questions" },
    ],
    sections: [
      {
        kind: "text",
        id: "panorama",
        heading: "What artificial intelligence changes in healthcare, in practice",
        paragraphs: [
          'Healthcare is the sector where the distance between hype and real operations is most visible. On one side, promises of automatic diagnosis; on the other, hospitals with scheduling queues, clinical teams consumed by administrative work and revenue lost to claim denials. The <a href="/en/blog/inteligencia-artificial">artificial intelligence</a> that produces results today attacks exactly that second list — the operational bottlenecks — while supporting, not replacing, clinical decisions.',
          "A useful way to organize the applications is in three layers: patient relations, clinical support and the operations of the healthcare business. All three work best when they belong to the same infrastructure — talking to the medical record, the calendar and billing — instead of arriving as isolated tools that create new silos.",
        ],
      },
      {
        kind: "text",
        id: "paciente",
        heading: "Patient relations: voice agents and smart triage",
        paragraphs: [
          "The patient's first contact with the institution is by phone or digital channel — and that is where the most efficiency is lost. <strong>AI voice agents</strong> answer calls in natural language, schedule, reschedule and confirm appointments and exams, answer common preparation questions and perform initial urgency triage to route each case to the right channel.",
          "The impact is measurable in three indicators: no-show rate (active confirmation reduces absences), waiting time on the phone and front-desk hours freed for in-person care. And unlike traditional IVRs, the voice agent converses — which changes the patient experience, especially for populations less familiar with digital tools, who can solve everything with an ordinary phone call.",
        ],
      },
      {
        kind: "cta",
        title: "Voice agent for scheduling and confirmation",
        text: "NowGo AI deploys voice agents integrated with the institution's calendar and back office — as a module of a sovereign infrastructure, not another isolated piece of software.",
        waMsg:
          "Hello! I read NowGo AI's article on AI in healthcare and I'd like to discuss a voice agent for my institution.",
        waLabel: "Talk about voice agents",
      },
      {
        kind: "text",
        id: "clinico",
        heading: "Clinical support: radiology, reports and assisted documentation",
        paragraphs: [
          "In the clinical layer, AI's role is to organize information and prioritize — never to decide alone. In <strong>radiology</strong>, AI systems sort the reading queue by flagging exams with suspected critical findings and suggest regions of attention for the radiologist's review, reducing time to report in cases that cannot wait.",
          "In <strong>clinical documentation</strong>, AI transcribes and structures the consultation record for the professional's validation, giving physicians back minutes of every appointment currently spent typing. And in care management, predictive models help identify patients at higher risk of deterioration or readmission, supporting follow-up protocols.",
          "In all of these uses, two principles are non-negotiable: <strong>human supervision</strong> — diagnostic responsibility belongs to the physician — and <strong>traceability</strong> — the institution must be able to audit what the system suggested and why. That is why specialized, auditable models running on infrastructure controlled by the institution are the right standard for the clinical environment.",
        ],
      },
      {
        kind: "text",
        id: "operacao",
        heading: "Operations and back office: beds, no-shows, billing and claim denials",
        paragraphs: [
          "It is the least glamorous layer and the fastest to pay back. <strong>Demand forecasting</strong> (bed occupancy, emergency volume, staff scheduling) allows planning instead of reacting. <strong>Billing automation</strong> checks claims, verifies compliance with payer rules before submission and reduces one of the main sources of silent revenue loss in hospitals: claim denials.",
          "AI agents also take over entire administrative routines — reconciliation, follow-up of pending items, record updates — operating the systems the institution already uses. For management, the combined effect is a more predictable cash flow and an administrative team focused on exceptions, not typing.",
        ],
      },
      {
        kind: "cta",
        title: "Hospital back office with AI",
        text: "Diagnosis of billing, claim-denial and scheduling processes, and deployment of automation with measurable goals — integrated with the systems your hospital already uses.",
        waMsg:
          "Hello! I read NowGo AI's article on AI in healthcare and I'd like to discuss back-office automation for my hospital.",
        waLabel: "Talk about my hospital",
      },
      {
        kind: "text",
        id: "lgpd",
        heading: "Data protection, ethics and data sovereignty in healthcare",
        paragraphs: [
          "Health data is sensitive data — data-protection laws like Brazil's LGPD and Europe's GDPR are explicit about it. This imposes three requirements on any AI project in the sector: clear legal basis and purpose, minimization and access control, and transparency about <strong>where and by whom</strong> the data is processed.",
          'That last point is where many projects fail: when using generic AI platforms, patient data may flow through infrastructure outside the institution\'s control and outside national jurisdiction. The alternative is <strong>sovereign architecture</strong>: specialized models processing data on infrastructure under the institution\'s control, with a complete audit trail — the principle we detail in the article on <a href="/en/blog/inteligencia-artificial-no-brasil">sovereign AI</a>. Beyond reducing regulatory risk, this approach protects a hospital\'s most strategic asset: patient trust.',
        ],
      },
      {
        kind: "text",
        id: "implantar",
        heading: "How to deploy AI in your healthcare institution",
        paragraphs: [
          'The playbook that works is the same we describe in the <a href="/en/blog/inteligencia-artificial">complete guide to artificial intelligence</a>, applied to healthcare reality:',
          "<strong>1. Diagnosis</strong> — map where the queues, no-shows, claim denials and wasted administrative hours are. <strong>2. Pilot with an indicator</strong> — a closed scope (for example, a voice agent for appointment confirmation in one unit), with a numeric goal and a timeline of weeks. <strong>3. Governance from the design stage</strong> — data protection, clinical supervision and data residency defined before the first line of integration. <strong>4. Scale by modules</strong> — expand from scheduling to back office and clinical support on the same infrastructure.",
          'That is how NowGo AI — an NVIDIA partner recognized among the Top 50 global innovators — structures its healthcare projects: voice, automation and operational intelligence as modules of a <a href="/">sovereign platform for companies, governments and cities</a>, with the patient and the care team at the center.',
        ],
      },
    ],
    faqTitle: "Frequently asked questions about AI in healthcare",
    faq: [
      {
        q: "How is artificial intelligence used in medicine today?",
        a: "The most mature applications sit in three layers: patient relations (voice and chat agents for scheduling, confirmation and initial triage), clinical support (prioritization of imaging exams, suggested findings for the radiologist's review, assisted consultation documentation) and operations (demand and no-show forecasting, bed management, billing and claim-denial prevention). In all of them, the clinical decision remains with the healthcare professional.",
      },
      {
        q: "Can artificial intelligence replace doctors?",
        a: "No — and serious projects do not try to. AI acts as a support layer: it reduces administrative work, prioritizes cases and organizes information so the physician can decide better and faster. Responsibility for diagnosis and treatment always belongs to the licensed professional, and human supervision is a design requirement, not a detail.",
      },
      {
        q: "Is AI in healthcare compatible with data-protection laws?",
        a: "Yes, as long as the project is born with governance: health data is sensitive data under laws like the LGPD and GDPR, which requires an adequate legal basis, minimization, access control and — critically — clarity about where the data is processed. Sovereign architectures, in which data remains on infrastructure under the institution's control and within national jurisdiction, simplify compliance and reduce regulatory risk.",
      },
      {
        q: "Where should a hospital or clinic start with AI?",
        a: "With the process that has the most evident queue or cost and the easiest result to measure. In practice, the most common starting points are scheduling and confirmation via voice agent (reduces no-shows and frees the front desk) and the automation of back-office routines such as billing and claim denials. A well-delimited pilot, with a clear indicator, proves value within weeks and creates the base to scale by modules.",
      },
      {
        q: "How much does it cost to deploy AI in healthcare?",
        a: "It varies with scope: a voice agent for scheduling has a very different cost and timeline from a platform integrated with the medical record. The correct reference is not the tool's price but the measurable return — reduction in no-shows, claim denials and administrative hours. That is why the recommended path is to start with a diagnosis and a closed-scope pilot before any broad contract.",
      },
    ],
    finalTitle: "Want to bring AI to your hospital, clinic or health plan?",
    finalSub:
      "Talk to the team that deploys AI in healthcare with data sovereignty, clinical supervision and measurable goals. Straightforward diagnosis, no commitment.",
    ctaSchedule: "Schedule a meeting",
    ctaWhatsapp: "Chat on WhatsApp",
    ctaThird: "See solutions by sector",
    ctaThirdHref: "/#verticals",
    ctaDiagnosis: "Schedule a diagnosis",
    finalWaMsg:
      "Hello! I read NowGo AI's article on AI in healthcare and I'd like to discuss applying it in my hospital/clinic/health plan.",
  },

  /* ------------------------------------------------------------------ ES */
  es: {
    seoTitle:
      "Inteligencia Artificial en la Salud: aplicaciones reales en hospitales, clínicas y aseguradoras · NowGo AI",
    seoDescription:
      "Cómo la inteligencia artificial ya funciona en la salud y la medicina: agentes de voz para agendamiento y triaje, apoyo a la radiología, automatización del backoffice hospitalario, protección de datos y soberanía, y por dónde empezar.",
    eyebrow: "Guía NowGo AI · Salud",
    title: "Inteligencia Artificial en la Salud: aplicaciones reales en hospitales, clínicas y aseguradoras",
    subtitle:
      "Dónde la IA ya entrega resultados en la medicina — del agente de voz que elimina las filas de agendamiento al apoyo a la radiología y al backoffice hospitalario — y cómo implementarla con seguridad clínica, protección de datos y soberanía.",
    breadcrumbName: "IA en la Salud",
    tocLabel: "En esta guía",
    toc: [
      { href: "#panorama", label: "Qué cambia la IA en la salud, en la práctica" },
      { href: "#paciente", label: "Relación con el paciente: agentes de voz y triaje" },
      { href: "#clinico", label: "Apoyo clínico: radiología, informes y documentación" },
      { href: "#operacao", label: "Operación y backoffice: camas, ausencias y rechazos" },
      { href: "#lgpd", label: "Protección de datos, ética y soberanía en la salud" },
      { href: "#implantar", label: "Cómo implementar: del diagnóstico al piloto" },
      { href: "#faq", label: "Preguntas frecuentes" },
    ],
    sections: [
      {
        kind: "text",
        id: "panorama",
        heading: "Qué cambia la inteligencia artificial en la salud, en la práctica",
        paragraphs: [
          'La salud es el sector donde la distancia entre el hype y la operación real es más visible. De un lado, promesas de diagnóstico automático; del otro, hospitales con filas en el agendamiento, equipos asistenciales consumidos por tareas administrativas e ingresos perdidos en rechazos de facturación. La <a href="/es/blog/inteligencia-artificial">inteligencia artificial</a> que genera resultados hoy ataca exactamente esa segunda lista — los cuellos de botella operativos — mientras apoya, sin sustituir, la decisión clínica.',
          "Una forma útil de organizar las aplicaciones es en tres capas: la relación con el paciente, el apoyo al trabajo clínico y la operación del negocio de salud. Las tres funcionan mejor cuando forman parte de una misma infraestructura — conversando con la historia clínica, la agenda y la facturación — en lugar de llegar como herramientas aisladas que crean nuevos silos.",
        ],
      },
      {
        kind: "text",
        id: "paciente",
        heading: "Relación con el paciente: agentes de voz y triaje inteligente",
        paragraphs: [
          "El primer contacto del paciente con la institución es telefónico o digital — y es donde más eficiencia se pierde. Los <strong>agentes de voz con IA</strong> atienden llamadas en lenguaje natural, agendan, reagendan y confirman consultas y exámenes, responden dudas frecuentes de preparación y hacen triaje inicial de urgencia para dirigir el caso al canal correcto.",
          "El impacto es medible en tres indicadores: tasa de ausentismo (la confirmación activa reduce las faltas), tiempo de espera en la atención telefónica y horas de recepción liberadas para la atención presencial. Y, a diferencia de los IVR tradicionales, el agente de voz conversa — lo que cambia la experiencia del paciente, en especial de poblaciones con menor familiaridad digital, que resuelven todo con una llamada común.",
        ],
      },
      {
        kind: "cta",
        title: "Agente de voz para agendamiento y confirmación",
        text: "NowGo AI implementa agentes de voz integrados a la agenda y al backoffice de la institución — como módulo de una infraestructura soberana, no como otro software aislado.",
        waMsg:
          "¡Hola! Leí el artículo sobre IA en la salud de NowGo AI y quiero conversar sobre un agente de voz para mi institución.",
        waLabel: "Hablar sobre agentes de voz",
      },
      {
        kind: "text",
        id: "clinico",
        heading: "Apoyo clínico: radiología, informes y documentación asistida",
        paragraphs: [
          "En la capa clínica, el papel de la IA es organizar información y priorizar — nunca decidir sola. En <strong>radiología</strong>, los sistemas de IA ordenan la fila de lectura destacando exámenes con sospecha de hallazgos críticos y sugieren regiones de atención para revisión del radiólogo, lo que reduce el tiempo hasta el informe en los casos que no pueden esperar.",
          "En la <strong>documentación clínica</strong>, la IA transcribe y estructura el registro de la consulta para validación del profesional, devolviendo al médico minutos de cada atención que hoy se gastan tecleando. Y en la gestión del cuidado, los modelos predictivos ayudan a identificar pacientes con mayor riesgo de agravamiento o reinternación, apoyando protocolos de seguimiento.",
          "En todos esos usos, dos principios son innegociables: <strong>supervisión humana</strong> — la responsabilidad diagnóstica es del médico — y <strong>trazabilidad</strong> — la institución debe poder auditar qué sugirió el sistema y por qué. Por eso los modelos especializados y auditables, ejecutándose en infraestructura controlada por la institución, son el estándar correcto para el ambiente clínico.",
        ],
      },
      {
        kind: "text",
        id: "operacao",
        heading: "Operación y backoffice: camas, ausencias, facturación y rechazos",
        paragraphs: [
          "Es la capa menos glamorosa y la de retorno más rápido. La <strong>previsión de demanda</strong> (ocupación de camas, volumen de urgencias, turnos de equipos) permite planificar en lugar de reaccionar. La <strong>automatización de facturación</strong> verifica las guías, chequea la conformidad con las reglas de las aseguradoras antes del envío y reduce una de las principales fuentes de pérdida silenciosa de ingresos de los hospitales: los rechazos.",
          "Los agentes de IA también asumen rutinas administrativas enteras — conciliación, seguimiento de pendientes, actualización de registros — operando los sistemas que la institución ya usa. Para la gestión, el efecto combinado es una caja más previsible y un equipo administrativo enfocado en excepciones, no en digitación.",
        ],
      },
      {
        kind: "cta",
        title: "Backoffice hospitalario con IA",
        text: "Diagnóstico de los procesos de facturación, rechazos y agendamiento, e implementación de automatización con metas medibles — integrada a los sistemas que su hospital ya usa.",
        waMsg:
          "¡Hola! Leí el artículo sobre IA en la salud de NowGo AI y quiero conversar sobre automatización del backoffice de mi hospital.",
        waLabel: "Hablar sobre mi hospital",
      },
      {
        kind: "text",
        id: "lgpd",
        heading: "Protección de datos, ética y soberanía de datos en la salud",
        paragraphs: [
          "El dato de salud es dato sensible — las leyes de protección de datos son explícitas. Eso impone tres exigencias a cualquier proyecto de IA en el sector: base legal y finalidad claras, minimización y control de acceso, y transparencia sobre <strong>dónde y por quién</strong> se procesan los datos.",
          'En ese último punto es donde muchos proyectos fallan: al usar plataformas genéricas de IA, los datos de pacientes pueden circular por infraestructuras fuera del control de la institución y fuera de la jurisdicción nacional. La alternativa es la <strong>arquitectura soberana</strong>: modelos especializados procesando datos en infraestructura bajo control de la institución, con trazabilidad completa — el principio que detallamos en el artículo sobre <a href="/es/blog/inteligencia-artificial-no-brasil">IA soberana</a>. Además de reducir el riesgo regulatorio, ese enfoque protege el activo más estratégico de un hospital: la confianza del paciente.',
        ],
      },
      {
        kind: "text",
        id: "implantar",
        heading: "Cómo implementar IA en su institución de salud",
        paragraphs: [
          'La hoja de ruta que funciona es la misma que describimos en la <a href="/es/blog/inteligencia-artificial">guía completa de inteligencia artificial</a>, aplicada a la realidad de la salud:',
          "<strong>1. Diagnóstico</strong> — mapear dónde están las filas, ausencias, rechazos y horas administrativas desperdiciadas. <strong>2. Piloto con indicador</strong> — un alcance cerrado (por ejemplo, agente de voz para confirmación de consultas en una unidad), con meta numérica y plazo de semanas. <strong>3. Gobernanza desde el diseño</strong> — protección de datos, supervisión clínica y residencia de los datos definidas antes de la primera línea de integración. <strong>4. Escala por módulos</strong> — expandir del agendamiento al backoffice y al apoyo clínico sobre la misma infraestructura.",
          'Así es como NowGo AI — socia de NVIDIA y reconocida entre las Top 50 innovadoras globales — estructura sus proyectos de salud: voz, automatización e inteligencia operativa como módulos de una <a href="/">plataforma soberana para empresas, gobiernos y ciudades</a>, con el paciente y el equipo de salud en el centro.',
        ],
      },
    ],
    faqTitle: "Preguntas frecuentes sobre IA en la salud",
    faq: [
      {
        q: "¿Cómo se usa la inteligencia artificial en la medicina hoy?",
        a: "Las aplicaciones más maduras están en tres capas: relación con el paciente (agentes de voz y chat para agendamiento, confirmación y triaje inicial), apoyo clínico (priorización de exámenes de imagen, sugerencia de hallazgos para revisión del radiólogo, documentación asistida de consultas) y operación (previsión de demanda y ausencias, gestión de camas, facturación y prevención de rechazos). En todas ellas, la decisión clínica permanece con el profesional de salud.",
      },
      {
        q: "¿La inteligencia artificial puede sustituir a los médicos?",
        a: "No — y los proyectos serios no lo intentan. La IA actúa como capa de apoyo: reduce la tarea administrativa, prioriza casos y organiza información para que el médico decida mejor y más rápido. La responsabilidad por el diagnóstico y la conducta es siempre del profesional habilitado, y la supervisión humana es requisito de diseño, no un detalle.",
      },
      {
        q: "¿La IA en la salud es compatible con las leyes de protección de datos?",
        a: "Sí, siempre que el proyecto nazca con gobernanza: los datos de salud son datos sensibles, lo que exige base legal adecuada, minimización, control de acceso y — punto crítico — claridad sobre dónde se procesan los datos. Las arquitecturas soberanas, en las que los datos permanecen en infraestructura bajo control de la institución y en jurisdicción nacional, simplifican el cumplimiento y reducen el riesgo regulatorio.",
      },
      {
        q: "¿Por dónde debe empezar un hospital o clínica con IA?",
        a: "Por el proceso con la fila o el costo más evidente y el resultado más fácil de medir. En la práctica, los puntos de partida más comunes son el agendamiento y confirmación por agente de voz (reduce ausencias y libera la recepción) y la automatización de rutinas de backoffice como facturación y rechazos. Un piloto bien delimitado, con indicador claro, prueba el valor en semanas y crea la base para escalar por módulos.",
      },
      {
        q: "¿Cuánto cuesta implementar inteligencia artificial en la salud?",
        a: "Varía con el alcance: un agente de voz para agendamiento tiene un costo y un plazo muy diferentes de una plataforma integrada a la historia clínica. La referencia correcta no es el precio de la herramienta, sino el retorno medible — reducción de ausencias, de rechazos y de horas administrativas. Por eso el camino recomendado es comenzar con diagnóstico y piloto de alcance cerrado antes de cualquier contrato amplio.",
      },
    ],
    finalTitle: "¿Quiere llevar IA a su hospital, clínica o aseguradora?",
    finalSub:
      "Converse con quien implementa IA en la salud con soberanía de datos, supervisión clínica y metas medibles. Diagnóstico directo, sin compromiso.",
    ctaSchedule: "Agendar reunión",
    ctaWhatsapp: "Hablar por WhatsApp",
    ctaThird: "Ver soluciones por sector",
    ctaThirdHref: "/#verticals",
    ctaDiagnosis: "Agendar diagnóstico",
    finalWaMsg:
      "¡Hola! Leí el artículo sobre IA en la salud de NowGo AI y quiero conversar sobre su aplicación en mi hospital/clínica/aseguradora.",
  },
};
