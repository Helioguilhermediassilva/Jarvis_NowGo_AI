/**
 * copyPages.ts — Conteúdo bilíngue PT/EN/ES das páginas institucionais
 * (Sobre, Manifesto, Privacidade) acessíveis via rodapé da landing.
 *
 * Mantido separado de copy.ts para isolar conteúdo institucional do conteúdo
 * comercial da landing. Estrutura espelhada nos 3 idiomas.
 */
import type { Lang } from "./copy";

type Section = {
  title: string;
  body: string[]; // parágrafos
};

type SobreContent = {
  hero: {
    eyebrow: string;
    title: string;
    subtitle: string;
  };
  bio: Section;
  founder: Section;
  philosophy: Section;
  contactCta: {
    title: string;
    subtitle: string;
    primary: string;
    secondary: string;
  };
};

type ManifestoBlock = {
  kicker: string;
  title: string;
  body: string;
};

type ManifestoContent = {
  hero: {
    eyebrow: string;
    title: string;
    subtitle: string;
  };
  pillars: ManifestoBlock[]; // Propósito, Missão, Visão
  values: { title: string; items: string[] };
  forces: { title: string; items: string[] };
  focus: { title: string; items: string[] };
  principles: { title: string; items: string[] };
  reminders: { title: string; items: string[] };
  closing: string;
};

type PrivacyContent = {
  hero: {
    eyebrow: string;
    title: string;
    subtitle: string;
    updated: string;
  };
  sections: Section[];
};

type PagesCopy = {
  sobre: SobreContent;
  manifesto: ManifestoContent;
  privacidade: PrivacyContent;
};

export const pagesCopy: Record<Lang, PagesCopy> = {
  pt: {
    sobre: {
      hero: {
        eyebrow: "SOBRE A NOWGO AI",
        title: "AI native company com soberania brasileira.",
        subtitle:
          "Plataforma operacional de inteligência artificial fundada por Hélio Guilherme — NVIDIA Partner Expert e referência Top 50 Global de IA aplicada.",
      },
      bio: {
        title: "A nowgo ai em uma frase",
        body: [
          "A nowgo ai é uma AI Native Company brasileira que combina infraestrutura NVIDIA Enterprise, modelos de linguagem soberanos e orquestração de agentes inteligentes para entregar transformação operacional real a empresas e governos.",
          "Operamos sobre uma stack modular que vai de dados a cidadão — dados, IA, automação e experiência humana — com a mesma base tecnológica que move líderes mundiais, adaptada à jurisdição e à realidade brasileira.",
          "Atendemos hoje frentes públicas (Smart Cities) e Enterprise (Saúde, Educação, Meio Ambiente, Agro, Finanças, Entretenimento e Imobiliário), sempre com soberania de dados, governança auditável e compromisso com quem é invisível ou vulnerável.",
        ],
      },
      founder: {
        title: "Fundador",
        body: [
          "Hélio Guilherme é fundador e CEO da nowgo ai. Engenheiro de origem, atuou por mais de duas décadas em transformação digital de larga escala — em projetos públicos e privados que combinam dados, automação e inteligência aplicada.",
          "É reconhecido como NVIDIA Partner Expert e figura entre as 50 lideranças globais com maior potencial em IA aplicada por organizações de referência. Sua tese: a próxima década será definida por quem dominar IA operacional soberana — não apenas modelos, mas todo o stack.",
          "Hoje conduz a nowgo ai com foco em impacto real: Smart Cities que cuidam dos invisíveis, hospitais que acolhem com dignidade, empresas que decidem com inteligência baseada em dados.",
        ],
      },
      philosophy: {
        title: "Como pensamos",
        body: [
          "Acreditamos que tecnologia só faz sentido quando serve, conecta e transforma vidas. Por isso desenhamos cada produto com três obrigações simultâneas: ser tecnicamente impecável, eticamente íntegro e humanamente relevante.",
          "Não vendemos modelos isolados; entregamos plataformas operacionais auditáveis. Não automatizamos pelo glamour da automação; automatizamos para liberar tempo humano para o que importa. E não esquecemos quem é invisível.",
        ],
      },
      contactCta: {
        title: "Vamos construir juntos.",
        subtitle:
          "Se sua organização busca um parceiro estratégico para infraestrutura de IA soberana e operação inteligente — fale conosco.",
        primary: "Falar com Hélio Guilherme",
        secondary: "WhatsApp",
      },
    },
    manifesto: {
      hero: {
        eyebrow: "MANIFESTO · CONSTRUTOR DE FUTURO",
        title: "Tecnologia que serve, conecta e transforma vidas.",
        subtitle:
          "O norte que orienta cada decisão da nowgo ai e do seu fundador, Hélio Guilherme.",
      },
      pillars: [
        {
          kicker: "PROPÓSITO",
          title: "Por que existimos",
          body: "Usar inteligência artificial e dados para transformar a vida das pessoas e construir cidades, empresas e serviços mais humanos, inteligentes e sustentáveis — com cuidado especial pelos invisíveis e mais vulneráveis.",
        },
        {
          kicker: "MISSÃO",
          title: "O que fazemos hoje",
          body: "Ser a camada operacional inteligente que conecta dados, cidadãos, empresas e serviços públicos para um futuro melhor — dando voz e dignidade a quem normalmente não é ouvido.",
        },
        {
          kicker: "VISÃO",
          title: "Onde queremos chegar",
          body: "Ser referência global em infraestrutura operacional soberana de IA para cidades, empresas e serviços públicos — gerando prosperidade que alcança quem mais precisa.",
        },
      ],
      forces: {
        title: "Forças",
        items: [
          "Mente estratégica",
          "Foco e disciplina",
          "Execução implacável",
          "Visão de longo prazo",
          "Resiliência",
          "Human-centered",
        ],
      },
      values: {
        title: "Valores",
        items: [
          "Integridade",
          "Excelência",
          "Responsabilidade",
          "Impacto humano profundo",
          "Liberdade com propósito",
          "Fé, família e equilíbrio",
          "Voz para os invisíveis",
        ],
      },
      focus: {
        title: "Foco de hoje",
        items: [
          "Infraestrutura AI-Native",
          "Soberania de dados",
          "Smart Cities",
          "Enterprise AI-Native",
          "Saúde & bem-estar",
          "Experiência humana",
          "Governança & segurança",
          "Dignidade para os invisíveis",
        ],
      },
      principles: {
        title: "Princípios inegociáveis",
        items: [
          "Fazer o certo",
          "Entregar excelência",
          "Pensar grande",
          "Agir rápido",
          "Aprender todo dia",
          "Deixar legado",
        ],
      },
      reminders: {
        title: "Lembretes",
        items: ["Deus", "Família", "Saúde", "Amigos", "Equilíbrio"],
      },
      closing: "Construir hoje o futuro que vale a pena.",
    },
    privacidade: {
      hero: {
        eyebrow: "POLÍTICA DE PRIVACIDADE",
        title: "Como tratamos seus dados.",
        subtitle:
          "Esta política descreve, em linguagem clara, como a nowgo ai coleta, utiliza, compartilha e protege dados pessoais — em conformidade com a Lei Geral de Proteção de Dados (LGPD, Lei 13.709/2018) e com o Regulamento Geral de Proteção de Dados (GDPR) europeu, quando aplicável.",
        updated: "Última atualização: 25 de maio de 2026",
      },
      sections: [
        {
          title: "1. Quem somos",
          body: [
            "A nowgo ai é uma plataforma operacional de inteligência artificial mantida por nowgo ai Tecnologia Ltda., com sede no Brasil, atuando como controladora de dados pessoais coletados em sua landing page e em produtos vinculados (Cockpit, agentes inteligentes e integrações).",
            "Para exercer direitos previstos em lei, ou para qualquer questão sobre privacidade, escreva para privacidade@nowgo.com.br.",
          ],
        },
        {
          title: "2. Quais dados coletamos",
          body: [
            "Coletamos os dados estritamente necessários para a finalidade declarada: nome, e-mail e mensagem em formulários de contato; identificadores de sessão (cookies funcionais e analíticos), endereço IP e dados de uso agregados.",
            "Em relacionamentos comerciais, coletamos dados profissionais (cargo, empresa, telefone) e, quando contratos exigirem, dados regulatórios necessários para faturamento e compliance.",
          ],
        },
        {
          title: "3. Para que usamos os dados",
          body: [
            "Os dados são usados para: responder solicitações de contato; conduzir relacionamentos comerciais; operar e melhorar nossos produtos; cumprir obrigações legais, regulatórias e contratuais; e prevenir fraudes e abusos.",
            "Não usamos dados pessoais para treinar modelos de IA de terceiros sem consentimento expresso.",
          ],
        },
        {
          title: "4. Bases legais",
          body: [
            "Tratamos dados com base em: (i) execução de contrato ou procedimentos preliminares; (ii) cumprimento de obrigação legal; (iii) legítimo interesse para operação e segurança da plataforma; e (iv) consentimento, quando aplicável.",
          ],
        },
        {
          title: "5. Compartilhamento",
          body: [
            "Compartilhamos dados apenas com operadores e parceiros estritamente necessários (provedores de infraestrutura, e-mail, analytics e processadores de pagamento), sob contratos que asseguram o mesmo padrão de proteção.",
            "Não vendemos dados pessoais a terceiros.",
          ],
        },
        {
          title: "6. Transferência internacional",
          body: [
            "Quando dados são tratados fora do Brasil, garantimos salvaguardas contratuais e técnicas adequadas, em conformidade com a LGPD e, quando aplicável, com cláusulas-padrão da União Europeia.",
          ],
        },
        {
          title: "7. Segurança",
          body: [
            "Aplicamos controles técnicos e organizacionais proporcionais ao risco — incluindo criptografia em trânsito e em repouso, segregação de ambientes, princípio do menor privilégio, registro auditável e revisão periódica de acessos.",
          ],
        },
        {
          title: "8. Retenção",
          body: [
            "Mantemos dados pessoais apenas pelo tempo necessário para cumprir as finalidades declaradas, atender obrigações legais e regulatórias ou exercer direitos em processos judiciais. Após esse período, dados são anonimizados ou eliminados de forma segura.",
          ],
        },
        {
          title: "9. Seus direitos",
          body: [
            "Você pode, a qualquer momento: confirmar o tratamento; acessar e corrigir dados; solicitar anonimização, bloqueio ou eliminação; solicitar portabilidade; revogar consentimento; e ser informado sobre compartilhamentos.",
            "Para exercer qualquer desses direitos, escreva para privacidade@nowgo.com.br. Responderemos em até 15 dias.",
          ],
        },
        {
          title: "10. Cookies",
          body: [
            "Usamos cookies funcionais (necessários ao funcionamento) e analíticos (para entender uso agregado e melhorar produto). Você pode gerenciá-los nas preferências do seu navegador.",
          ],
        },
        {
          title: "11. Atualizações desta política",
          body: [
            "Esta política pode ser atualizada para refletir mudanças regulatórias, técnicas ou de produto. A versão mais recente estará sempre nesta página, com a data da última atualização indicada acima.",
          ],
        },
      ],
    },
  },

  en: {
    sobre: {
      hero: {
        eyebrow: "ABOUT NOWGO AI",
        title: "AI native company with Brazilian sovereignty.",
        subtitle:
          "Operational AI platform founded by Hélio Guilherme — NVIDIA Partner Expert and Top 50 Global reference in applied AI.",
      },
      bio: {
        title: "nowgo ai in one sentence",
        body: [
          "nowgo ai is a Brazilian AI Native Company that combines NVIDIA Enterprise infrastructure, sovereign language models and intelligent agent orchestration to deliver real operational transformation to enterprises and governments.",
          "We operate on a modular stack that goes from data to citizen — data, AI, automation and human experience — on the same technological foundation that powers world leaders, adapted to Brazilian jurisdiction and reality.",
          "We currently serve public fronts (Smart Cities) and Enterprise (Health, Education, Environment, Agro, Finance, Entertainment and Real Estate), always with data sovereignty, auditable governance and commitment to those who are invisible or vulnerable.",
        ],
      },
      founder: {
        title: "Founder",
        body: [
          "Hélio Guilherme is founder and CEO of nowgo ai. An engineer by background, he has worked for over two decades on large-scale digital transformation — in public and private projects that combine data, automation and applied intelligence.",
          "He is recognized as NVIDIA Partner Expert and ranks among the 50 global leaders with the highest potential in applied AI by reference organizations. His thesis: the next decade will be defined by those who master sovereign operational AI — not just models, but the entire stack.",
          "He now leads nowgo ai with focus on real impact: Smart Cities that care for the invisible, hospitals that welcome with dignity, enterprises that decide with data-driven intelligence.",
        ],
      },
      philosophy: {
        title: "How we think",
        body: [
          "We believe technology only makes sense when it serves, connects and transforms lives. That's why we design every product with three simultaneous obligations: to be technically impeccable, ethically sound and humanly relevant.",
          "We don't sell isolated models; we deliver auditable operational platforms. We don't automate for the glamour of automation; we automate to free human time for what matters. And we never forget those who are invisible.",
        ],
      },
      contactCta: {
        title: "Let's build together.",
        subtitle:
          "If your organization is looking for a strategic partner for sovereign AI infrastructure and intelligent operation — let's talk.",
        primary: "Talk to Hélio Guilherme",
        secondary: "WhatsApp",
      },
    },
    manifesto: {
      hero: {
        eyebrow: "MANIFESTO · FUTURE BUILDER",
        title: "Technology that serves, connects and transforms lives.",
        subtitle:
          "The north that guides every decision at nowgo ai and its founder, Hélio Guilherme.",
      },
      pillars: [
        {
          kicker: "PURPOSE",
          title: "Why we exist",
          body: "To use artificial intelligence and data to transform people's lives and build more human, intelligent and sustainable cities, enterprises and services — with special care for the invisible and most vulnerable.",
        },
        {
          kicker: "MISSION",
          title: "What we do today",
          body: "To be the intelligent operational layer that connects data, citizens, enterprises and public services for a better future — giving voice and dignity to those who are usually not heard.",
        },
        {
          kicker: "VISION",
          title: "Where we want to go",
          body: "To be a global reference in sovereign operational AI infrastructure for cities, enterprises and public services — generating prosperity that reaches those who need it most.",
        },
      ],
      forces: {
        title: "Strengths",
        items: [
          "Strategic mind",
          "Focus and discipline",
          "Relentless execution",
          "Long-term vision",
          "Resilience",
          "Human-centered",
        ],
      },
      values: {
        title: "Values",
        items: [
          "Integrity",
          "Excellence",
          "Responsibility",
          "Profound human impact",
          "Freedom with purpose",
          "Faith, family and balance",
          "Voice for the invisible",
        ],
      },
      focus: {
        title: "Today's focus",
        items: [
          "AI-Native infrastructure",
          "Data sovereignty",
          "Smart Cities",
          "Enterprise AI-Native",
          "Health & well-being",
          "Human experience",
          "Governance & security",
          "Dignity for the invisible",
        ],
      },
      principles: {
        title: "Non-negotiable principles",
        items: [
          "Do the right thing",
          "Deliver excellence",
          "Think big",
          "Act fast",
          "Learn every day",
          "Leave a legacy",
        ],
      },
      reminders: {
        title: "Reminders",
        items: ["God", "Family", "Health", "Friends", "Balance"],
      },
      closing: "Build today the future worth living.",
    },
    privacidade: {
      hero: {
        eyebrow: "PRIVACY POLICY",
        title: "How we handle your data.",
        subtitle:
          "This policy describes, in clear language, how nowgo ai collects, uses, shares and protects personal data — in compliance with the Brazilian General Data Protection Law (LGPD, Law 13,709/2018) and the European General Data Protection Regulation (GDPR), when applicable.",
        updated: "Last update: May 25, 2026",
      },
      sections: [
        {
          title: "1. Who we are",
          body: [
            "nowgo ai is an operational artificial intelligence platform maintained by nowgo ai Tecnologia Ltda., headquartered in Brazil, acting as controller of personal data collected on its landing page and on linked products (Cockpit, intelligent agents and integrations).",
            "To exercise rights provided by law, or for any question about privacy, write to privacidade@nowgo.com.br.",
          ],
        },
        {
          title: "2. What data we collect",
          body: [
            "We collect data strictly necessary for the stated purpose: name, e-mail and message in contact forms; session identifiers (functional and analytical cookies), IP address and aggregate usage data.",
            "In commercial relationships, we collect professional data (role, company, phone) and, when contracts require, regulatory data necessary for billing and compliance.",
          ],
        },
        {
          title: "3. What we use the data for",
          body: [
            "Data is used to: respond to contact requests; conduct commercial relationships; operate and improve our products; comply with legal, regulatory and contractual obligations; and prevent fraud and abuse.",
            "We do not use personal data to train third-party AI models without express consent.",
          ],
        },
        {
          title: "4. Legal basis",
          body: [
            "We process data based on: (i) contract execution or preliminary procedures; (ii) compliance with legal obligation; (iii) legitimate interest for platform operation and security; and (iv) consent, when applicable.",
          ],
        },
        {
          title: "5. Sharing",
          body: [
            "We share data only with operators and partners strictly necessary (infrastructure providers, e-mail, analytics and payment processors), under contracts that ensure the same standard of protection.",
            "We do not sell personal data to third parties.",
          ],
        },
        {
          title: "6. International transfer",
          body: [
            "When data is processed outside Brazil, we ensure appropriate contractual and technical safeguards, in compliance with LGPD and, when applicable, with European Union standard clauses.",
          ],
        },
        {
          title: "7. Security",
          body: [
            "We apply technical and organizational controls proportional to risk — including encryption in transit and at rest, environment segregation, principle of least privilege, auditable logging and periodic access review.",
          ],
        },
        {
          title: "8. Retention",
          body: [
            "We keep personal data only for the time necessary to fulfill the stated purposes, meet legal and regulatory obligations or exercise rights in legal proceedings. After this period, data is anonymized or securely deleted.",
          ],
        },
        {
          title: "9. Your rights",
          body: [
            "You may, at any time: confirm processing; access and correct data; request anonymization, blocking or deletion; request portability; revoke consent; and be informed about sharing.",
            "To exercise any of these rights, write to privacidade@nowgo.com.br. We will respond within 15 days.",
          ],
        },
        {
          title: "10. Cookies",
          body: [
            "We use functional cookies (necessary for operation) and analytical cookies (to understand aggregate usage and improve product). You can manage them in your browser preferences.",
          ],
        },
        {
          title: "11. Updates to this policy",
          body: [
            "This policy may be updated to reflect regulatory, technical or product changes. The most recent version will always be on this page, with the date of the last update indicated above.",
          ],
        },
      ],
    },
  },

  es: {
    sobre: {
      hero: {
        eyebrow: "ACERCA DE NOWGO AI",
        title: "AI native company con soberanía brasileña.",
        subtitle:
          "Plataforma operacional de inteligencia artificial fundada por Hélio Guilherme — NVIDIA Partner Expert y referencia Top 50 Global en IA aplicada.",
      },
      bio: {
        title: "nowgo ai en una frase",
        body: [
          "nowgo ai es una AI Native Company brasileña que combina infraestructura NVIDIA Enterprise, modelos de lenguaje soberanos y orquestación de agentes inteligentes para entregar transformación operacional real a empresas y gobiernos.",
          "Operamos sobre un stack modular que va de datos al ciudadano — datos, IA, automatización y experiencia humana — sobre la misma base tecnológica que mueve a líderes mundiales, adaptada a la jurisdicción y realidad brasileñas.",
          "Hoy atendemos frentes públicos (Smart Cities) y Enterprise (Salud, Educación, Medio Ambiente, Agro, Finanzas, Entretenimiento e Inmobiliario), siempre con soberanía de datos, gobernanza auditable y compromiso con quienes son invisibles o vulnerables.",
        ],
      },
      founder: {
        title: "Fundador",
        body: [
          "Hélio Guilherme es fundador y CEO de nowgo ai. Ingeniero de origen, ha trabajado durante más de dos décadas en transformación digital a gran escala — en proyectos públicos y privados que combinan datos, automatización e inteligencia aplicada.",
          "Es reconocido como NVIDIA Partner Expert y figura entre los 50 líderes globales con mayor potencial en IA aplicada por organizaciones de referencia. Su tesis: la próxima década estará definida por quien domine la IA operacional soberana — no solo los modelos, sino todo el stack.",
          "Hoy lidera nowgo ai con foco en impacto real: Smart Cities que cuidan de los invisibles, hospitales que acogen con dignidad, empresas que deciden con inteligencia basada en datos.",
        ],
      },
      philosophy: {
        title: "Cómo pensamos",
        body: [
          "Creemos que la tecnología solo tiene sentido cuando sirve, conecta y transforma vidas. Por eso diseñamos cada producto con tres obligaciones simultáneas: ser técnicamente impecable, éticamente íntegro y humanamente relevante.",
          "No vendemos modelos aislados; entregamos plataformas operacionales auditables. No automatizamos por el glamour de la automatización; automatizamos para liberar tiempo humano para lo que importa. Y nunca olvidamos a quienes son invisibles.",
        ],
      },
      contactCta: {
        title: "Construyamos juntos.",
        subtitle:
          "Si su organización busca un socio estratégico para infraestructura de IA soberana y operación inteligente — hablemos.",
        primary: "Hablar con Hélio Guilherme",
        secondary: "WhatsApp",
      },
    },
    manifesto: {
      hero: {
        eyebrow: "MANIFIESTO · CONSTRUCTOR DE FUTURO",
        title: "Tecnología que sirve, conecta y transforma vidas.",
        subtitle:
          "El norte que orienta cada decisión de nowgo ai y de su fundador, Hélio Guilherme.",
      },
      pillars: [
        {
          kicker: "PROPÓSITO",
          title: "Por qué existimos",
          body: "Usar inteligencia artificial y datos para transformar la vida de las personas y construir ciudades, empresas y servicios más humanos, inteligentes y sostenibles — con cuidado especial por los invisibles y más vulnerables.",
        },
        {
          kicker: "MISIÓN",
          title: "Lo que hacemos hoy",
          body: "Ser la capa operacional inteligente que conecta datos, ciudadanos, empresas y servicios públicos para un futuro mejor — dando voz y dignidad a quienes normalmente no son escuchados.",
        },
        {
          kicker: "VISIÓN",
          title: "Dónde queremos llegar",
          body: "Ser referencia global en infraestructura operacional soberana de IA para ciudades, empresas y servicios públicos — generando prosperidad que alcanza a quienes más la necesitan.",
        },
      ],
      forces: {
        title: "Fuerzas",
        items: [
          "Mente estratégica",
          "Foco y disciplina",
          "Ejecución implacable",
          "Visión a largo plazo",
          "Resiliencia",
          "Human-centered",
        ],
      },
      values: {
        title: "Valores",
        items: [
          "Integridad",
          "Excelencia",
          "Responsabilidad",
          "Impacto humano profundo",
          "Libertad con propósito",
          "Fe, familia y equilibrio",
          "Voz para los invisibles",
        ],
      },
      focus: {
        title: "Foco de hoy",
        items: [
          "Infraestructura AI-Native",
          "Soberanía de datos",
          "Smart Cities",
          "Enterprise AI-Native",
          "Salud y bienestar",
          "Experiencia humana",
          "Gobernanza y seguridad",
          "Dignidad para los invisibles",
        ],
      },
      principles: {
        title: "Principios innegociables",
        items: [
          "Hacer lo correcto",
          "Entregar excelencia",
          "Pensar en grande",
          "Actuar rápido",
          "Aprender todos los días",
          "Dejar legado",
        ],
      },
      reminders: {
        title: "Recordatorios",
        items: ["Dios", "Familia", "Salud", "Amigos", "Equilibrio"],
      },
      closing: "Construir hoy el futuro que vale la pena.",
    },
    privacidade: {
      hero: {
        eyebrow: "POLÍTICA DE PRIVACIDAD",
        title: "Cómo tratamos sus datos.",
        subtitle:
          "Esta política describe, en lenguaje claro, cómo nowgo ai recopila, utiliza, comparte y protege datos personales — en cumplimiento con la Ley General de Protección de Datos brasileña (LGPD, Ley 13.709/2018) y con el Reglamento General de Protección de Datos (GDPR) europeo, cuando aplicable.",
        updated: "Última actualización: 25 de mayo de 2026",
      },
      sections: [
        {
          title: "1. Quiénes somos",
          body: [
            "nowgo ai es una plataforma operacional de inteligencia artificial mantenida por nowgo ai Tecnologia Ltda., con sede en Brasil, actuando como responsable de datos personales recopilados en su landing page y en productos vinculados (Cockpit, agentes inteligentes e integraciones).",
            "Para ejercer derechos previstos por ley, o para cualquier pregunta sobre privacidad, escriba a privacidade@nowgo.com.br.",
          ],
        },
        {
          title: "2. Qué datos recopilamos",
          body: [
            "Recopilamos los datos estrictamente necesarios para la finalidad declarada: nombre, correo electrónico y mensaje en formularios de contacto; identificadores de sesión (cookies funcionales y analíticas), dirección IP y datos de uso agregados.",
            "En relaciones comerciales, recopilamos datos profesionales (cargo, empresa, teléfono) y, cuando los contratos lo exijan, datos regulatorios necesarios para facturación y compliance.",
          ],
        },
        {
          title: "3. Para qué usamos los datos",
          body: [
            "Los datos se usan para: responder solicitudes de contacto; conducir relaciones comerciales; operar y mejorar nuestros productos; cumplir obligaciones legales, regulatorias y contractuales; y prevenir fraudes y abusos.",
            "No usamos datos personales para entrenar modelos de IA de terceros sin consentimiento expreso.",
          ],
        },
        {
          title: "4. Bases legales",
          body: [
            "Tratamos datos con base en: (i) ejecución de contrato o procedimientos preliminares; (ii) cumplimiento de obligación legal; (iii) interés legítimo para operación y seguridad de la plataforma; y (iv) consentimiento, cuando aplicable.",
          ],
        },
        {
          title: "5. Compartición",
          body: [
            "Compartimos datos solo con operadores y socios estrictamente necesarios (proveedores de infraestructura, correo electrónico, analytics y procesadores de pago), bajo contratos que aseguran el mismo estándar de protección.",
            "No vendemos datos personales a terceros.",
          ],
        },
        {
          title: "6. Transferencia internacional",
          body: [
            "Cuando los datos se tratan fuera de Brasil, garantizamos salvaguardias contractuales y técnicas adecuadas, en cumplimiento con la LGPD y, cuando aplicable, con cláusulas estándar de la Unión Europea.",
          ],
        },
        {
          title: "7. Seguridad",
          body: [
            "Aplicamos controles técnicos y organizacionales proporcionales al riesgo — incluyendo cifrado en tránsito y en reposo, segregación de entornos, principio del menor privilegio, registro auditable y revisión periódica de accesos.",
          ],
        },
        {
          title: "8. Retención",
          body: [
            "Mantenemos los datos personales solo durante el tiempo necesario para cumplir con las finalidades declaradas, atender obligaciones legales y regulatorias o ejercer derechos en procesos judiciales. Después de este período, los datos son anonimizados o eliminados de forma segura.",
          ],
        },
        {
          title: "9. Sus derechos",
          body: [
            "Usted puede, en cualquier momento: confirmar el tratamiento; acceder y corregir datos; solicitar anonimización, bloqueo o eliminación; solicitar portabilidad; revocar consentimiento; y ser informado sobre compartición.",
            "Para ejercer cualquiera de estos derechos, escriba a privacidade@nowgo.com.br. Responderemos en hasta 15 días.",
          ],
        },
        {
          title: "10. Cookies",
          body: [
            "Usamos cookies funcionales (necesarias para el funcionamiento) y analíticas (para entender uso agregado y mejorar el producto). Puede gestionarlas en las preferencias de su navegador.",
          ],
        },
        {
          title: "11. Actualizaciones de esta política",
          body: [
            "Esta política puede ser actualizada para reflejar cambios regulatorios, técnicos o de producto. La versión más reciente siempre estará en esta página, con la fecha de la última actualización indicada arriba.",
          ],
        },
      ],
    },
  },
};
