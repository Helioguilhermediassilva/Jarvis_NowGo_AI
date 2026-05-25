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

type CarreiraVaga = {
  area: string; // ex: "Estágio · Administrativo"
  role: string; // ex: "Estagiário(a) Administrativo e Financeiro"
  meta: string; // ex: "Brasília · Presencial / Híbrido · Início: Jun/2026"
  intro: string;
  responsibilities: { title: string; items: string[] };
  requirements: { title: string; items: string[] };
  notRequired?: { title: string; items: string[] };
  differentials?: { title: string; items: string[] };
  apply: {
    text: string; // texto do parágrafo final com instruções
    subject: string; // assunto do email
    cta: string; // texto do botão
  };
};

type CarreirasContent = {
  hero: {
    eyebrow: string;
    title: string;
    subtitle: string;
  };
  intro: {
    body: string[];
  };
  vagas: CarreiraVaga[];
  contactCta: {
    title: string;
    subtitle: string;
    primary: string;
    secondary: string;
  };
};

type PagesCopy = {
  sobre: SobreContent;
  manifesto: ManifestoContent;
  privacidade: PrivacyContent;
  carreiras: CarreirasContent;
};

export const pagesCopy: Record<Lang, PagesCopy> = {
  pt: {
    sobre: {
      hero: {
        eyebrow: "SOBRE A NOWGO AI",
        title: "AI Native Company brasileira, soberana e operacional.",
        subtitle:
          "Infraestrutura operacional inteligente, modular e auditável para cidades, empresas e serviços públicos — sobre stack NVIDIA, com governança brasileira e cuidado pelos invisíveis.",
      },
      bio: {
        title: "A nowgo ai em uma frase",
        body: [
          "A nowgo ai é uma AI Native Company brasileira que entrega infraestrutura operacional inteligente, soberana, modular e auditável para cidades, empresas e serviços públicos — sobre stack NVIDIA Enterprise.",
          "<strong>Missão:</strong> conectar dados, cidadãos, empresas e serviços públicos para um futuro melhor — com cuidado especial pelos invisíveis e mais vulneráveis.",
          "<strong>Visão:</strong> ser referência global em infraestrutura operacional soberana de IA para cidades, empresas e serviços públicos.",
        ],
      },
      founder: {
        title: "Fundador — Hélio Guilherme Dias Silva",
        body: [
          "<a href=\"https://www.linkedin.com/in/helioguilherme/\" target=\"_blank\" rel=\"noopener noreferrer\">Hélio Guilherme</a> nasceu no Brasil de muitos Brasis e foi criado em Brasília. Carrega raízes mineiras, capixabas e nordestinas, e construiu sua trajetória entre o público e o privado, entre a engenharia e a visão de país. Aos 14 anos já sabia o que queria fazer: usar tecnologia para transformar vidas em escala.",
          "Aos 19 anos tornou-se instrutor oficial Oracle — um dos mais novos da América Latina à época. Ainda na universidade, cofundou uma das duas primeiras empresas latino-americanas selecionadas para o programa Top 10 Global da 500 Startups. A empresa foi vendida e não sobreviveu como organização, mas a visão e a missão continuaram — e se ampliaram. Hoje, com IA generativa e infraestrutura GPU, tudo o que parecia impensável se tornou possível.",
          "Hélio reúne equipe técnica nacional com bases em telecom e no setor de Justiça (CNJ), e teve passagem pelo Banco Mundial em projetos anteriores. Hoje está 100% dedicado à nowgo ai — a empresa que materializa, em escala, aquela visão de cidade, empresa e serviço público verdadeiramente humanos.",
          "É reconhecido entre as <strong>Top 50 Global</strong> lideranças em infraestrutura digital pública pela DPI · JICA · BCG · Bill & Melinda Gates Foundation, e é <strong>NVIDIA Partner Expert 2026</strong>. Atua como mentor de IA no programa <strong>InovaSkill da Bluefields</strong>, em parceria com a <strong>FATEC Pompeia</strong> (~80 mil alunos), e treinou mais de mil especialistas em IA em Brasília.",
          "É presidente da AACMB — Associação dos ex-alunos do Colégio Militar de Brasília, rede de cerca de 80 mil famílias que inclui empresários, artistas, ministros e o atual governador de São Paulo. Lidera ainda parcerias com 14 universidades africanas e coopera com o MEC e o Centro de Estudos Estratégicos Brasileiros para o desenvolvimento de LLMs em português.",
          "Como autor, publicou <em><a href=\"https://www.amazon.com.br/Vale-Aprendi-Desenvolvendo-Oportunidades-Sil%C3%ADcio/dp/8592864089\" target=\"_blank\" rel=\"noopener noreferrer\">Vale o que aprendi — Desenvolvendo oportunidades além do Vale do Silício</a></em> (Editora Trampolim), <em><a href=\"https://www.amazon.com.br/dp/B0DLP1CR61\" target=\"_blank\" rel=\"noopener noreferrer\">Next-Gen AI Automation: Frameworks and Tools for Machine Learning Mastery</a></em> (2024) e <em><a href=\"https://www.amazon.com.br/dp/B0DJV1JLXB\" target=\"_blank\" rel=\"noopener noreferrer\">Sistemas Computacionais: Fundamentos e Aplicações Inovadoras</a></em> (2024) — obras que consolidam sua trajetória entre tecnologia, empreendedorismo e visão de país.",
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
    carreiras: {
      hero: {
        eyebrow: "CARREIRAS",
        title: "Faça parte da nowgo ai",
        subtitle:
          "Construímos infraestrutura operacional soberana de inteligência artificial para tornar visível quem sempre foi invisível para as políticas públicas. Buscamos pessoas com fome de aprender, humildade real e conexão genuína com essa missão.",
      },
      intro: {
        body: [
          "Não buscamos currículos perfeitos. Buscamos pessoas que acordam pensando em como a tecnologia pode reduzir sofrimento humano — e que têm coragem de construir algo que ainda não existe.",
        ],
      },
      vagas: [
        {
          area: "Estágio · Administrativo",
          role: "Estagiário(a) Administrativo e Financeiro",
          meta: "Brasília · Presencial / Híbrido · Início: Jun/2026",
          intro:
            "Você vai estar no coração da operação da nowgo ai — organizando processos, gerenciando ferramentas, apoiando o time e garantindo que nada se perca no meio do crescimento acelerado. É uma posição para quem gosta de deixar tudo em ordem e quer aprender como uma empresa de tecnologia de impacto funciona por dentro.",
          responsibilities: {
            title: "O que você vai fazer",
            items: [
              "Gerenciar e alimentar o NowGo Brain — nossa base de conhecimento e memória operacional",
              "Acompanhar contratos, parceiros e processos administrativos do dia a dia",
              "Apoiar o controle financeiro básico: fluxo de caixa, pagamentos, notas fiscais",
              "Organizar agenda, reuniões e materiais do fundador",
              "Usar ferramentas de IA no trabalho desde o primeiro dia",
            ],
          },
          requirements: {
            title: "O que buscamos",
            items: [
              "Cursando administração, ciências contábeis, direito ou área correlata",
              "Organização e atenção a detalhes que outros não percebem",
              "Vontade genuína de aprender — não apenas executar tarefas",
              "Identificação com a missão de usar tecnologia para quem mais precisa",
              "Disposição para trabalhar num ambiente que ainda está sendo construído",
            ],
          },
          notRequired: {
            title: "O que não é requisito",
            items: [
              "Experiência anterior — ensinamos o que você não sabe",
              "Histórico específico ou origem social — o que importa é quem você é, não de onde veio",
            ],
          },
          apply: {
            text: "Para se candidatar, envie um e-mail para carreiras@nowgoai.com com o assunto \"Estágio ADM\" e conte, em poucas linhas, por que essa missão faz sentido para você.",
            subject: "Estágio ADM",
            cta: "Candidatar-se — Estágio ADM",
          },
        },
        {
          area: "Tecnologia · AI First",
          role: "Desenvolvedor(a) de Software AI First",
          meta: "Brasília / Remoto · Início: Jun/2026",
          intro:
            "Você vai construir a camada técnica da plataforma nowgo ai — agentes de inteligência artificial, integrações com sistemas públicos e hospitalares, automações e interfaces que chegam onde a tecnologia ainda não chega. Trabalhará diretamente com o arquiteto técnico da empresa em projetos que impactam cidadãos reais.",
          responsibilities: {
            title: "O que você vai fazer",
            items: [
              "Desenvolver e manter AI Workers especializados por domínio operacional",
              "Integrar a plataforma nowgo com sistemas externos — prontuários, BI governamental, APIs públicas",
              "Evoluir o stack proprietário de voz em português brasileiro",
              "Implementar specs técnicas com arquitetura modular e spec-driven development",
              "Garantir soberania de dados, conformidade LGPD e processamento local",
            ],
          },
          requirements: {
            title: "O que buscamos",
            items: [
              "Experiência sólida com Python e/ou TypeScript / Node.js",
              "Familiaridade real com LLMs, RAG, agentes de IA e orquestração",
              "Conhecimento de APIs REST, integrações e infraestrutura cloud (Google Cloud preferencial)",
              "Mentalidade AI First — usa IA no próprio processo de desenvolvimento",
              "Humildade técnica: sabe o que não sabe e pergunta antes de assumir",
              "Identificação com o propósito — tecnologia como instrumento de dignidade humana",
            ],
          },
          differentials: {
            title: "Diferenciais",
            items: [
              "Experiência com processamento de voz, STT/TTS ou NLP em português",
              "Conhecimento de NVIDIA NIMs, Triton ou modelos de linguagem locais",
              "Experiência com sistemas hospitalares ou governamentais",
              "Participação em projetos de impacto social com tecnologia",
            ],
          },
          apply: {
            text: "Para se candidatar, envie um e-mail para carreiras@nowgoai.com com o assunto \"Dev AI First\" e inclua exemplos do que você já construiu — links, repositórios ou projetos que mostram como você pensa.",
            subject: "Dev AI First",
            cta: "Candidatar-se — Dev AI First",
          },
        },
      ],
      contactCta: {
        title: "Não achou sua vaga?",
        subtitle:
          "Se você acredita na missão e tem algo a contribuir, escreva mesmo assim. Estamos sempre abertos a conversar com quem soma.",
        primary: "Enviar candidatura espontânea",
        secondary: "Falar pelo WhatsApp",
      },
    },
  },

  en: {
    sobre: {
      hero: {
        eyebrow: "ABOUT NOWGO AI",
        title: "Brazilian AI Native Company — sovereign and operational.",
        subtitle:
          "Sovereign, modular and auditable operational AI infrastructure for cities, enterprises and public services — on NVIDIA stack, with Brazilian governance and care for the invisible.",
      },
      bio: {
        title: "nowgo ai in one sentence",
        body: [
          "nowgo ai is a Brazilian AI Native Company that delivers sovereign, modular and auditable operational AI infrastructure for cities, enterprises and public services — on NVIDIA Enterprise stack.",
          "<strong>Mission:</strong> to connect data, citizens, enterprises and public services for a better future — with special care for the invisible and most vulnerable.",
          "<strong>Vision:</strong> to become the global reference in sovereign operational AI infrastructure for cities, enterprises and public services.",
        ],
      },
      founder: {
        title: "Founder — Hélio Guilherme Dias Silva",
        body: [
          "<a href=\"https://www.linkedin.com/in/helioguilherme/\" target=\"_blank\" rel=\"noopener noreferrer\">Hélio Guilherme</a> was born in the Brazil of many Brazils and was raised in Brasília. He carries roots from Minas Gerais, Espírito Santo and the Northeast, and built his career between the public and the private, between engineering and a vision for the country. At 14 he already knew what he wanted to do: use technology to transform lives at scale.",
          "At 19 he became an official Oracle instructor — one of the youngest in Latin America at the time. Still in university, he co-founded one of the first two Latin American companies selected for the Top 10 Global program at 500 Startups. The company was sold and did not survive as an organization, but the vision and mission continued — and grew. Today, with generative AI and GPU infrastructure, what once seemed impossible has become possible.",
          "Hélio leads a national technical team with backgrounds in telecom and the Brazilian Justice sector (CNJ), and previously worked on World Bank projects. He is now 100% dedicated to nowgo ai — the company that materializes, at scale, that vision of truly human cities, enterprises and public services.",
          "He is recognized among the <strong>Top 50 Global</strong> leaders in digital public infrastructure by DPI · JICA · BCG · Bill & Melinda Gates Foundation, and is an <strong>NVIDIA Partner Expert 2026</strong>. He acts as AI mentor in the <strong>InovaSkill program by Bluefields</strong>, in partnership with <strong>FATEC Pompeia</strong> (~80,000 students), and has trained over a thousand AI specialists in Brasília.",
          "He is president of AACMB — the alumni association of the Brasília Military College, a network of around 80,000 families that includes entrepreneurs, artists, ministers and the current governor of São Paulo. He also leads partnerships with 14 African universities and cooperates with Brazil's Ministry of Education and the Brazilian Strategic Studies Center on the development of Portuguese-language LLMs.",
          "As an author, he has published <em><a href=\"https://www.amazon.com.br/Vale-Aprendi-Desenvolvendo-Oportunidades-Sil%C3%ADcio/dp/8592864089\" target=\"_blank\" rel=\"noopener noreferrer\">Vale o que aprendi — Developing opportunities beyond Silicon Valley</a></em> (Trampolim Publishing), <em><a href=\"https://www.amazon.com.br/dp/B0DLP1CR61\" target=\"_blank\" rel=\"noopener noreferrer\">Next-Gen AI Automation: Frameworks and Tools for Machine Learning Mastery</a></em> (2024), and <em><a href=\"https://www.amazon.com.br/dp/B0DJV1JLXB\" target=\"_blank\" rel=\"noopener noreferrer\">Computational Systems: Foundations and Innovative Applications</a></em> (2024) — works that consolidate his journey across technology, entrepreneurship and national vision.",
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
    carreiras: {
      hero: {
        eyebrow: "CAREERS",
        title: "Join nowgo ai",
        subtitle:
          "We build sovereign operational infrastructure of artificial intelligence to make visible those who have always been invisible to public policies. We seek people hungry to learn, with real humility and genuine connection to this mission.",
      },
      intro: {
        body: [
          "We do not look for perfect résumés. We look for people who wake up thinking about how technology can reduce human suffering — and who have the courage to build something that does not yet exist.",
        ],
      },
      vagas: [
        {
          area: "Internship · Administrative",
          role: "Administrative & Finance Intern",
          meta: "Brasília · On-site / Hybrid · Start: Jun/2026",
          intro:
            "You will be at the heart of nowgo ai's operation — organizing processes, managing tools, supporting the team and making sure nothing falls through the cracks during accelerated growth. It is a position for those who like to keep everything in order and want to learn how an impact-focused technology company works from the inside.",
          responsibilities: {
            title: "What you will do",
            items: [
              "Manage and feed NowGo Brain — our knowledge base and operational memory",
              "Follow up contracts, partners and day-to-day administrative processes",
              "Support basic financial control: cash flow, payments, invoices",
              "Organize the founder's schedule, meetings and materials",
              "Use AI tools at work from day one",
            ],
          },
          requirements: {
            title: "What we look for",
            items: [
              "Studying business administration, accounting, law or related fields",
              "Organization and attention to details that others miss",
              "Genuine willingness to learn — not just execute tasks",
              "Identification with the mission of using technology for those who need it most",
              "Willingness to work in an environment that is still being built",
            ],
          },
          notRequired: {
            title: "What is not required",
            items: [
              "Previous experience — we teach what you do not know",
              "Specific background or social origin — what matters is who you are, not where you come from",
            ],
          },
          apply: {
            text: "To apply, send an email to carreiras@nowgoai.com with the subject \"Internship ADM\" and tell us, in a few lines, why this mission makes sense to you.",
            subject: "Internship ADM",
            cta: "Apply — Internship ADM",
          },
        },
        {
          area: "Technology · AI First",
          role: "AI First Software Developer",
          meta: "Brasília / Remote · Start: Jun/2026",
          intro:
            "You will build the technical layer of the nowgo ai platform — AI agents, integrations with public and hospital systems, automations and interfaces that reach where technology has not yet arrived. You will work directly with the company's technical architect on projects that impact real citizens.",
          responsibilities: {
            title: "What you will do",
            items: [
              "Develop and maintain AI Workers specialized by operational domain",
              "Integrate the nowgo platform with external systems — medical records, governmental BI, public APIs",
              "Evolve the proprietary voice stack in Brazilian Portuguese",
              "Implement technical specs with modular architecture and spec-driven development",
              "Ensure data sovereignty, LGPD compliance and local processing",
            ],
          },
          requirements: {
            title: "What we look for",
            items: [
              "Solid experience with Python and/or TypeScript / Node.js",
              "Real familiarity with LLMs, RAG, AI agents and orchestration",
              "Knowledge of REST APIs, integrations and cloud infrastructure (Google Cloud preferred)",
              "AI First mindset — uses AI in the development process itself",
              "Technical humility: knows what they do not know and asks before assuming",
              "Identification with the purpose — technology as an instrument of human dignity",
            ],
          },
          differentials: {
            title: "Differentials",
            items: [
              "Experience with voice processing, STT/TTS or NLP in Portuguese",
              "Knowledge of NVIDIA NIMs, Triton or local language models",
              "Experience with hospital or governmental systems",
              "Participation in social impact projects through technology",
            ],
          },
          apply: {
            text: "To apply, send an email to carreiras@nowgoai.com with the subject \"Dev AI First\" and include examples of what you have already built — links, repositories or projects that show how you think.",
            subject: "Dev AI First",
            cta: "Apply — Dev AI First",
          },
        },
      ],
      contactCta: {
        title: "Did not find your role?",
        subtitle:
          "If you believe in the mission and have something to contribute, write to us anyway. We are always open to talking with people who add value.",
        primary: "Send spontaneous application",
        secondary: "Reach us on WhatsApp",
      },
    },
  },

  es: {
    sobre: {
      hero: {
        eyebrow: "ACERCA DE NOWGO AI",
        title: "AI Native Company brasileña, soberana y operacional.",
        subtitle:
          "Infraestructura operacional inteligente, modular y auditable para ciudades, empresas y servicios públicos — sobre stack NVIDIA, con gobernanza brasileña y cuidado por los invisibles.",
      },
      bio: {
        title: "nowgo ai en una frase",
        body: [
          "nowgo ai es una AI Native Company brasileña que entrega infraestructura operacional inteligente, soberana, modular y auditable para ciudades, empresas y servicios públicos — sobre stack NVIDIA Enterprise.",
          "<strong>Misión:</strong> conectar datos, ciudadanos, empresas y servicios públicos para un futuro mejor — con cuidado especial por los invisibles y más vulnerables.",
          "<strong>Visión:</strong> ser referencia global en infraestructura operacional soberana de IA para ciudades, empresas y servicios públicos.",
        ],
      },
      founder: {
        title: "Fundador — Hélio Guilherme Dias Silva",
        body: [
          "<a href=\"https://www.linkedin.com/in/helioguilherme/\" target=\"_blank\" rel=\"noopener noreferrer\">Hélio Guilherme</a> nació en el Brasil de muchos Brasis y fue criado en Brasilia. Lleva raíces mineiras, capixabas y nordestinas, y construyó su trayectoria entre lo público y lo privado, entre la ingeniería y una visión de país. A los 14 años ya sabía lo que quería hacer: usar la tecnología para transformar vidas a escala.",
          "A los 19 años se convirtió en instructor oficial de Oracle — uno de los más jóvenes de América Latina en aquel momento. Aún en la universidad, cofundó una de las dos primeras empresas latinoamericanas seleccionadas para el programa Top 10 Global de 500 Startups. La empresa fue vendida y no sobrevivió como organización, pero la visión y la misión continuaron — y se ampliaron. Hoy, con IA generativa e infraestructura GPU, lo que parecía impensable se volvió posible.",
          "Hélio reúne un equipo técnico nacional con bases en telecom y en el sector de Justicia (CNJ), y tuvo paso por el Banco Mundial en proyectos anteriores. Hoy está 100% dedicado a nowgo ai — la empresa que materializa, a escala, aquella visión de ciudad, empresa y servicio público verdaderamente humanos.",
          "Es reconocido entre los <strong>Top 50 Global</strong> líderes en infraestructura digital pública por DPI · JICA · BCG · Bill & Melinda Gates Foundation, y es <strong>NVIDIA Partner Expert 2026</strong>. Actúa como mentor de IA en el programa <strong>InovaSkill de Bluefields</strong>, en alianza con <strong>FATEC Pompeia</strong> (~80 mil alumnos), y ha entrenado a más de mil especialistas en IA en Brasilia.",
          "Es presidente de AACMB — Asociación de exalumnos del Colegio Militar de Brasilia, red de cerca de 80 mil familias que incluye empresarios, artistas, ministros y el actual gobernador de São Paulo. Lidera además alianzas con 14 universidades africanas y coopera con el MEC y el Centro de Estudios Estratégicos Brasileños para el desarrollo de LLMs en portugués.",
          "Como autor, ha publicado <em><a href=\"https://www.amazon.com.br/Vale-Aprendi-Desenvolvendo-Oportunidades-Sil%C3%ADcio/dp/8592864089\" target=\"_blank\" rel=\"noopener noreferrer\">Vale o que aprendi — Desarrollando oportunidades más allá de Silicon Valley</a></em> (Editorial Trampolim), <em><a href=\"https://www.amazon.com.br/dp/B0DLP1CR61\" target=\"_blank\" rel=\"noopener noreferrer\">Next-Gen AI Automation: Frameworks and Tools for Machine Learning Mastery</a></em> (2024) y <em><a href=\"https://www.amazon.com.br/dp/B0DJV1JLXB\" target=\"_blank\" rel=\"noopener noreferrer\">Sistemas Computacionales: Fundamentos y Aplicaciones Innovadoras</a></em> (2024) — obras que consolidan su trayectoria entre tecnología, emprendimiento y visión de país.",
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
    carreiras: {
      hero: {
        eyebrow: "CARRERAS",
        title: "Forma parte de nowgo ai",
        subtitle:
          "Construimos infraestructura operacional soberana de inteligencia artificial para hacer visibles a quienes siempre fueron invisibles para las políticas públicas. Buscamos personas con hambre de aprender, humildad real y conexión genuina con esta misión.",
      },
      intro: {
        body: [
          "No buscamos currículos perfectos. Buscamos personas que se despiertan pensando en cómo la tecnología puede reducir el sufrimiento humano — y que tienen el coraje de construir algo que aún no existe.",
        ],
      },
      vagas: [
        {
          area: "Pasantía · Administrativo",
          role: "Pasante Administrativo y Financiero",
          meta: "Brasília · Presencial / Híbrido · Inicio: Jun/2026",
          intro:
            "Estarás en el corazón de la operación de nowgo ai — organizando procesos, gestionando herramientas, apoyando al equipo y asegurando que nada se pierda en medio del crecimiento acelerado. Es una posición para quien le gusta dejar todo en orden y quiere aprender cómo funciona por dentro una empresa de tecnología de impacto.",
          responsibilities: {
            title: "Lo que harás",
            items: [
              "Gestionar y alimentar NowGo Brain — nuestra base de conocimiento y memoria operacional",
              "Acompañar contratos, socios y procesos administrativos del día a día",
              "Apoyar el control financiero básico: flujo de caja, pagos, facturas",
              "Organizar la agenda, reuniones y materiales del fundador",
              "Usar herramientas de IA en el trabajo desde el primer día",
            ],
          },
          requirements: {
            title: "Lo que buscamos",
            items: [
              "Cursando administración, ciencias contables, derecho o área afin",
              "Organización y atención a detalles que otros no notan",
              "Voluntad genuina de aprender — no solo ejecutar tareas",
              "Identificación con la misión de usar tecnología para quienes más la necesitan",
              "Disposición para trabajar en un entorno que todavía se está construyendo",
            ],
          },
          notRequired: {
            title: "Lo que no es requisito",
            items: [
              "Experiencia previa — enseñamos lo que no sabes",
              "Historial específico u origen social — lo que importa es quién eres, no de dónde vienes",
            ],
          },
          apply: {
            text: "Para postularte, envía un correo a carreiras@nowgoai.com con el asunto \"Pasantía ADM\" y cuéntanos, en pocas líneas, por qué esta misión tiene sentido para ti.",
            subject: "Pasantía ADM",
            cta: "Postular — Pasantía ADM",
          },
        },
        {
          area: "Tecnología · AI First",
          role: "Desarrollador(a) de Software AI First",
          meta: "Brasília / Remoto · Inicio: Jun/2026",
          intro:
            "Construirás la capa técnica de la plataforma nowgo ai — agentes de inteligencia artificial, integraciones con sistemas públicos y hospitalarios, automatizaciones e interfaces que llegan donde la tecnología aún no llega. Trabajarás directamente con el arquitecto técnico de la empresa en proyectos que impactan a ciudadanos reales.",
          responsibilities: {
            title: "Lo que harás",
            items: [
              "Desarrollar y mantener AI Workers especializados por dominio operacional",
              "Integrar la plataforma nowgo con sistemas externos — historias clínicas, BI gubernamental, APIs públicas",
              "Evolucionar el stack propietario de voz en portugués brasileño",
              "Implementar specs técnicas con arquitectura modular y spec-driven development",
              "Garantizar soberanía de datos, conformidad LGPD y procesamiento local",
            ],
          },
          requirements: {
            title: "Lo que buscamos",
            items: [
              "Experiencia sólida con Python y/o TypeScript / Node.js",
              "Familiaridad real con LLMs, RAG, agentes de IA y orquestación",
              "Conocimiento de APIs REST, integraciones e infraestructura cloud (Google Cloud preferentemente)",
              "Mentalidad AI First — usa IA en el propio proceso de desarrollo",
              "Humildad técnica: sabe lo que no sabe y pregunta antes de asumir",
              "Identificación con el propósito — tecnología como instrumento de dignidad humana",
            ],
          },
          differentials: {
            title: "Diferenciales",
            items: [
              "Experiencia con procesamiento de voz, STT/TTS o NLP en portugués",
              "Conocimiento de NVIDIA NIMs, Triton o modelos de lenguaje locales",
              "Experiencia con sistemas hospitalarios o gubernamentales",
              "Participación en proyectos de impacto social con tecnología",
            ],
          },
          apply: {
            text: "Para postularte, envía un correo a carreiras@nowgoai.com con el asunto \"Dev AI First\" e incluye ejemplos de lo que ya has construido — enlaces, repositorios o proyectos que muestren cómo piensas.",
            subject: "Dev AI First",
            cta: "Postular — Dev AI First",
          },
        },
      ],
      contactCta: {
        title: "¿No encontraste tu vacante?",
        subtitle:
          "Si crees en la misión y tienes algo que aportar, escríbenos igualmente. Siempre estamos abiertos a conversar con quienes suman.",
        primary: "Enviar candidatura espontánea",
        secondary: "Hablar por WhatsApp",
      },
    },
  },
};
