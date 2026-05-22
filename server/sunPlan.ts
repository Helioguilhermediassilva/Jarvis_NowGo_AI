/**
 * server/sunPlan.ts
 *
 * SUN Execution Controller — Snapshot canônico do Plano Operacional Imediato
 * (versão v1.0, 22/maio/2026).
 *
 * O SUN é o controlador estratégico autoritativo da NowGo Holding. Ele aplica
 * os frameworks operacionais NowGo (regra 3+1, critérios de Missão Ativa,
 * gatilhos de Radar/Pausada/Descartada) sobre o portfólio atual e produz uma
 * lista vigente de execução.
 *
 * Princípios de design:
 *  - Toda oportunidade do Brain deve ter um espelho de classificação SUN.
 *  - As 3 Missões Ativas são a regra "3+1" do controlador: 3 simultâneas no
 *    portfólio, 1 foco do founder por vez.
 *  - As "ações operacionais imediatas" são diretrizes vinculantes — o Jarvis
 *    deve repeti-las verbatim quando questionado sobre uma oportunidade.
 *  - Próximas versões serão geradas automaticamente pelo Jarvis (F6) a partir
 *    do estado vivo do Brain + blueprint operacional NowGo. Este arquivo é a
 *    base v1.0; quando F6 entrar, ele é substituído pela página correspondente
 *    no NowGo Brain (base "🎯 Relatórios SUN").
 */

export type SunClass = "MISSAO_ATIVA" | "RADAR" | "RADAR_CONDICIONADO" | "PAUSADA" | "DESCARTADA" | "DESCARTADA_AGORA";

export interface SunOpportunity {
  nome: string;
  classificacao: SunClass;
  acao: string;
  contexto?: "portfolio" | "smart_city_2036";
}

export interface SunMission {
  id: 1 | 2 | 3;
  nome: string;
  oportunidadesAgrupadas: string[];
  porqueAtivaAgora: string;
  limiteOperacional: string;
  criterios: {
    reduzComplexidade: string;
    reduzFounderOverload: string;
    aumentaConversao: string;
    viraAtivoReutilizavel: string;
    deveExistirAgora: boolean;
  };
}

export interface SunDealRoom {
  id: string;
  nome: string;
  missao: 1 | 2 | 3;
  sponsor: string;
  stakeholders: string;
  status: string;
  risco: string;
  proximoPasso: string;
  owner: string;
  necessidadeDoFounder: string;
}

export interface SunRitual {
  nome: string;
  frequencia: string;
  duracao: string;
  owner: string;
  saidaObrigatoria: string;
}

export interface SunDayAction {
  dia: number;
  acao: string;
  owner: string;
  saida: string;
}

export interface SunRemoveItem {
  remover: string;
  destino: string;
  motivo: string;
}

export interface SunQuickWin {
  titulo: string;
  prazo: string;
  owner: string;
  resultado: string;
  criterio: string;
}

export interface SunSnapshot {
  versao: string;                  // ex: "1.0"
  geradoEm: string;                // ISO datetime
  fonte: "blueprint_v1_pdf" | "auto_jarvis";
  comandoFinal: string;            // a frase que o SUN fixa como ordem operacional
  missoes: SunMission[];
  oportunidades: SunOpportunity[];
  dealRooms: SunDealRoom[];
  rituais: SunRitual[];
  proximos7Dias: SunDayAction[];
  removerDaAgenda: SunRemoveItem[];
  quickWins: SunQuickWin[];
}

// ============================================================================
// 3 Missões Ativas — Regra 3+1
// ============================================================================

const MISSIONS: SunMission[] = [
  {
    id: 1,
    nome: "Smart City Plataforma Pública Integrada",
    oportunidadesAgrupadas: [
      "Smart City Cidades Inteligentes",
      "NowGo Brain Smart City 2036",
      "DPI soberana",
      "Saúde Digna/Zero Corredor",
      "DF-Goiás compensação regional",
      "Quatro Novas Cidades Inteligentes",
    ],
    porqueAtivaAgora:
      "Concentra a tese pública de maior alavancagem e evita que o programa Smart City vire carteira fragmentada de projetos.",
    limiteOperacional:
      "Um programa integrado, uma narrativa, um owner e uma proposta de piloto de 90 dias.",
    criterios: {
      reduzComplexidade: "Sim — agrupa dezenas de frentes públicas em um pacote único.",
      reduzFounderOverload: "Sim, se houver Government Lead e proposta única.",
      aumentaConversao: "Sim — foca sponsor, procurement e piloto de 90 dias.",
      viraAtivoReutilizavel: "Sim — gera playbook de governo, DPI, saúde e smart cities.",
      deveExistirAgora: true,
    },
  },
  {
    id: 2,
    nome: "Infraestrutura Soberana e Credibilidade Técnica",
    oportunidadesAgrupadas: [
      "NVIDIA HPC + NVAITC LATAM",
      "Masterclass NVIDIA",
      "Energia — 200 unidades LLM air-gapped",
    ],
    porqueAtivaAgora:
      "Consolida credibilidade técnica, soberania operacional, edge/HPC e capacidade de co-sell sem criar produto novo agora.",
    limiteOperacional:
      "Só avançar se houver reunião com decisão, PoC ou papel explícito em Smart City, energia ou saúde.",
    criterios: {
      reduzComplexidade: "Sim, se limitar NVIDIA/Energia a uma tese de infraestrutura.",
      reduzFounderOverload: "Sim, se reuniões tiverem briefing e decisão esperada.",
      aumentaConversao: "Sim — aumenta confiança técnica e destrava enterprise/governo.",
      viraAtivoReutilizavel: "Sim — pode virar playbook de soberania, edge e HPC.",
      deveExistirAgora: true,
    },
  },
  {
    id: 3,
    nome: "Health/Voice Replicável",
    oportunidadesAgrupadas: [
      "Hospital 100% IA (Joás)",
      "WLM — NowGo Voice + Produto",
    ],
    porqueAtivaAgora:
      "Cria arquétipo replicável de AI-native health/voice, mas precisa ser limitado para não virar múltiplas customizações clínicas.",
    limiteOperacional:
      "Um piloto health/voice por vez; sem abrir novos hospitais ou clínicas como missão ativa.",
    criterios: {
      reduzComplexidade: "Sim, se impedir múltiplos pilotos clínicos paralelos.",
      reduzFounderOverload: "Sim, se founder não operar implantação.",
      aumentaConversao: "Sim — voice/health tem caminho comercial mais curto.",
      viraAtivoReutilizavel: "Sim — pode virar módulo NowGo Health/Voice.",
      deveExistirAgora: true,
    },
  },
];

// ============================================================================
// Oportunidades classificadas — Portfólio geral
// ============================================================================

const OPS_PORTFOLIO: SunOpportunity[] = [
  // ---- Missão Ativa ----
  { nome: "Smart City Cidades Inteligentes", classificacao: "MISSAO_ATIVA", acao: "Conduzir como peça do programa Smart City integrado." },
  { nome: "Hospital 100% IA (Joás)", classificacao: "MISSAO_ATIVA", acao: "Deal Room 3; aprovar fase 1 e impedir escopo hospitalar amplo demais." },
  { nome: "WLM — NowGo Voice + Produto", classificacao: "MISSAO_ATIVA", acao: "Deal Room 4; fechar exclusividade por vertical e primeira unidade." },

  // ---- Radar ----
  { nome: "Google.org Impact Challenge", classificacao: "RADAR", acao: "Submeter apenas se houver material reaproveitável; não virar missão paralela." },
  { nome: "Richmond Global Delta", classificacao: "RADAR", acao: "Manter contato com próxima decisão clara; sem founder follow-up manual contínuo." },
  { nome: "Parceiro internacional de plataformas — Brasília Fase 1", classificacao: "RADAR", acao: "Aguardar janela; usar material Smart City pronto, sem novo projeto." },
  { nome: "Vila Rica + Biocardios ARR", classificacao: "RADAR", acao: "Manter como próximo candidato health após Joás/WLM; não ativar em paralelo." },
  { nome: "Grupo Joás — 6 empresas", classificacao: "RADAR", acao: "Só ativar após cronograma por ondas; evitar onboarding simultâneo." },
  { nome: "Joint Partnership", classificacao: "RADAR", acao: "Exigir estrutura jurídica simples e cooperativa-piloto antes de avançar." },
  { nome: "Joint Partnership 2 cooperativas", classificacao: "RADAR", acao: "Unificar com Joint Partnership; não tratar como frente separada." },
  { nome: "Cemel — 30+ clínicas", classificacao: "RADAR", acao: "Preparar proposta modular; ativar apenas após piloto health validado." },
  { nome: "Ideas Lab 2026 — 22 empresas", classificacao: "RADAR", acao: "Selecionar Top 5; nunca onboarding massivo." },
  { nome: "Min. Saúde/DataSUS", classificacao: "RADAR", acao: "Manter em cadência leve; ciclo político longo." },
  { nome: "Grupo Maya — CRM R$708K", classificacao: "RADAR", acao: "Só avançar se virar módulo de inteligência operacional, não CRM sob medida." },
  { nome: "Smart City/CODHAB Habitação", classificacao: "RADAR", acao: "Incorporar ao programa Smart City apenas após sponsor e modalidade." },
  { nome: "AlmaViva/Tivit Itália-BR", classificacao: "RADAR", acao: "Conectar a missão ativa se houver caso de uso conjunto." },
  { nome: "Claranet PT & BR", classificacao: "RADAR", acao: "Não abrir frente Portugal sem playbook." },
  { nome: "Ericsson", classificacao: "RADAR", acao: "Avançar apenas com NDA + piloto técnico conectado à Missão 2." },
  { nome: "Hospital Coimbra PT", classificacao: "RADAR", acao: "Manter em Portugal/saúde futuro; não competir com Joás/WLM." },
  { nome: "Antifraude & Biometria Voz", classificacao: "RADAR", acao: "Só ativar com arquitetura validada e caso de uso claro." },
  { nome: "WLM Hidrogênio Verde", classificacao: "RADAR", acao: "Pode conectar à Missão 2, mas sem abrir frente técnica agora." },
  { nome: "Smart City/FAP Fase 3", classificacao: "RADAR", acao: "Incorporar somente ao Deal Room Smart City." },
  { nome: "TSH Company", classificacao: "RADAR", acao: "Exigir N1/N2 e proposta técnica simples." },
  { nome: "ISH Institucional SP Marcus", classificacao: "RADAR", acao: "Discovery leve; sem founder direto." },
  { nome: "Instituição SP Marcus", classificacao: "RADAR", acao: "Agrupar com ISH Institucional; evitar duplicidade." },
  { nome: "Bluefields — Canal", classificacao: "RADAR", acao: "Exigir 3 leads qualificados e SLA de canal." },
  { nome: "Gov SP Tarcísio", classificacao: "RADAR", acao: "Manter como oportunidade pública futura; não competir com Smart City." },
  { nome: "AI Factory RN", classificacao: "RADAR", acao: "Conectar à Missão 2 apenas se houver contrato/infra real." },
  { nome: "Lenovo Europa", classificacao: "RADAR", acao: "Manter como distribuição futura; ativar só com papel em Missão 2." },
  { nome: "MFG Law FIDC", classificacao: "RADAR", acao: "Alto compliance; avançar só com proposta formal e owner jurídico." },
  { nome: "Lusíadas Enterprise PT", classificacao: "RADAR", acao: "Portugal/saúde futuro; não ativar em paralelo." },
  { nome: "Automação Gabinete Serena", classificacao: "RADAR", acao: "Pode virar módulo gov, mas não competir com Smart City Top 5." },
  { nome: "Sabin Diagnóstico", classificacao: "RADAR", acao: "Reunião inovação leve; sem escopo clínico novo agora." },
  { nome: "ISH/Vision Cyber", classificacao: "RADAR", acao: "Conectar a cibersegurança da Missão 2/Smart City se houver use case." },
  { nome: "Gestão Contratos", classificacao: "RADAR", acao: "Pode virar módulo operacional; exigir primeira vertical." },
  { nome: "Bluefields Co-marketing", classificacao: "RADAR", acao: "Só se entregar leads concretos." },

  // ---- Pausadas ----
  { nome: "Aliança Metalúrgica", classificacao: "PAUSADA", acao: "Revisitar em 60–90 dias com case real." },
  { nome: "1040 Hub Film 50/50", classificacao: "PAUSADA", acao: "Alto risco de governança e desvio de foco." },
  { nome: "Brasnica", classificacao: "PAUSADA", acao: "Exigir produto proprietário antes de retomar." },
  { nome: "3ª Cooperativa Médica", classificacao: "PAUSADA", acao: "Aguardar piloto health/voice primário." },
  { nome: "Centro Medicamentos", classificacao: "PAUSADA", acao: "Pausar até validação clínica e regulatória." },
  { nome: "ISH Multi-produto Marcelo", classificacao: "PAUSADA", acao: "Escolher um produto; sem multi-produto." },
  { nome: "Dr. Roberto Discovery", classificacao: "PAUSADA", acao: "Customização provável; exigir vertical específica." },
  { nome: "Hospital NowGoMed Piloto", classificacao: "PAUSADA", acao: "Não abrir segundo piloto health antes de Joás/WLM." },
  { nome: "Hipertextil Voz Comercial", classificacao: "PAUSADA", acao: "Aguardar playbook voice validado." },
  { nome: "Todo Santo Dia Cartórios", classificacao: "PAUSADA", acao: "Risco de customização regulatória; aguardar playbook." },
  { nome: "Patrícia Infra IA Saúde", classificacao: "PAUSADA", acao: "Projeto experimental sem escala clara." },
  { nome: "Cartório Aristides", classificacao: "PAUSADA", acao: "Aguardar validação jurídica e case replicável." },
  { nome: "Hospital de Base Voz", classificacao: "PAUSADA", acao: "Só retomar após WLM/Joás validado." },
  { nome: "Blockchain Certificadora", classificacao: "PAUSADA", acao: "MVP apenas se houver demanda contratada." },
  { nome: "Movie Industry Jonatan — frente A", classificacao: "PAUSADA", acao: "Ciclo longo e imprevisível; customização alta." },
  { nome: "Movie Industry Jonatan — frente B", classificacao: "PAUSADA", acao: "Duplicidade; pausar." },
  { nome: "ISH Treinamento Fleury", classificacao: "PAUSADA", acao: "Serviço pontual; só retomar como produto de enablement." },
  { nome: "Jacto/Amenco Agrícola", classificacao: "PAUSADA", acao: "Aguardar produto replicável agrícola; sem founder." },
  { nome: "Indústria Acrílico", classificacao: "PAUSADA", acao: "Customização provável." },
  { nome: "Triad — Apps IA", classificacao: "PAUSADA", acao: "Gerir sem founder; apps sem produto proprietário claro." },
  { nome: "CDA Distribuidora RN", classificacao: "PAUSADA", acao: "Budget limitado; validar sem founder." },
  { nome: "S5 Construções", classificacao: "PAUSADA", acao: "Ciclo lento e customização." },
  { nome: "Dentista Brasília", classificacao: "PAUSADA", acao: "Ticket pequeno para estrutura NowGo." },
  { nome: "SaaS Gestão Clínica", classificacao: "PAUSADA", acao: "Risco de commoditização." },
  { nome: "ESG Vision/ISH", classificacao: "PAUSADA", acao: "Produto genérico sem diferenciação." },

  // ---- Descartadas ----
  { nome: "Mercado & Opinião — frente institucional A", classificacao: "DESCARTADA", acao: "Patrocínio transacional sem tese de plataforma." },
  { nome: "Mercado & Opinião — frente institucional B", classificacao: "DESCARTADA", acao: "Patrocínio transacional sem tese de plataforma." },
  { nome: "Clube da Permuta", classificacao: "DESCARTADA", acao: "Baixo fit estratégico e risco de distração." },
  { nome: "Onion Rent Manutenção", classificacao: "DESCARTADA", acao: "Já em hold; customização sem escala." },
  { nome: "Gazeta Mercantil", classificacao: "DESCARTADA", acao: "Não fortalece tese." },
  { nome: "PIB Metodologia MAP", classificacao: "DESCARTADA", acao: "Palestra/metodologia sem receita escalável." },
  { nome: "Advogada Rebeca", classificacao: "DESCARTADA", acao: "Baixo fit; redirecionar se necessário." },
  { nome: "Academia 6 Estrelas", classificacao: "DESCARTADA", acao: "Ticket pequeno e baixa escala." },
  { nome: "Animo", classificacao: "DESCARTADA", acao: "Sem fit estratégico claro." },
  { nome: "Paperclip/Nexus", classificacao: "DESCARTADA", acao: "Sem fit AI-native." },
  { nome: "The Lead PDV", classificacao: "DESCARTADA", acao: "Fora do ICP." },
  { nome: "Agencyou", classificacao: "DESCARTADA", acao: "Já descartado no pipeline." },
];

// ============================================================================
// Oportunidades Smart City 2036 — 34 frentes
// ============================================================================

const OPS_SMART_CITY_2036: SunOpportunity[] = [
  { nome: "NowGo Brain Smart City 2036 — sala de situação executiva", classificacao: "MISSAO_ATIVA", acao: "Núcleo do Deal Room Smart City; preparar demo conceitual simples." },
  { nome: "DPI soberana e interoperabilidade entre secretarias", classificacao: "MISSAO_ATIVA", acao: "Nota técnica e checklist LGPD/auditoria; sem implementação pesada." },
  { nome: "Saúde Digna / Zero Corredor / leitos em tempo real", classificacao: "MISSAO_ATIVA", acao: "Escolher hospital/rede piloto e dados mínimos." },
  { nome: "DF-Goiás e compensação regional baseada em dados", classificacao: "MISSAO_ATIVA", acao: "Matriz de fluxo, origem, custo e volume." },
  { nome: "Quatro novas cidades inteligentes", classificacao: "MISSAO_ATIVA", acao: "One-page de masterplan digital mínimo." },
  { nome: "AI Workers para trabalho repetitivo no setor público", classificacao: "RADAR", acao: "Mapear 5 processos, mas não construir workers agora." },
  { nome: "Inteligência fiscal, gastos públicos e arrecadação", classificacao: "RADAR", acao: "Manter como módulo futuro de controle." },
  { nome: "Captação internacional e gestão de projetos financiados", classificacao: "RADAR", acao: "Usar como suporte ao Smart City, não missão separada." },
  { nome: "Cerrado Vivo — inteligência climática", classificacao: "RADAR", acao: "Possível dashboard futuro; não competir com Top 5." },
  { nome: "Mobilidade limpa e otimização de rotas", classificacao: "RADAR", acao: "Entrar depois da camada NowGo Brain/DPI." },
  { nome: "Solar distribuída, eficiência energética e água inteligente", classificacao: "PAUSADA", acao: "Aguardar dados e parceiro setorial." },
  { nome: "Cibersegurança e proteção de dados", classificacao: "RADAR", acao: "Gate obrigatório, não frente independente." },
  { nome: "Governança de OSCs e auditoria contínua", classificacao: "RADAR", acao: "Módulo de accountability futuro." },
  { nome: "Mapeamento de invisíveis e vulneráveis", classificacao: "PAUSADA", acao: "Sensível; exige protocolo e rede humana." },
  { nome: "Justiça Restaurativa", classificacao: "PAUSADA", acao: "Alto risco jurídico; avançar só com supervisão formal." },
  { nome: "Segurança pública e Judiciário do DF", classificacao: "RADAR_CONDICIONADO", acao: "Apenas painéis gerenciais não decisórios." },
  { nome: "FIB-DF, saúde mental e bem-estar", classificacao: "RADAR_CONDICIONADO", acao: "Só com human-in-the-loop e rede clínica." },
  { nome: "Associações recreativas, esportivas e culturais", classificacao: "PAUSADA", acao: "Não executar como obras/eventos; apenas módulo territorial futuro." },
  { nome: "Capital Olímpica", classificacao: "PAUSADA", acao: "Plataforma futura de talentos; não agora." },
  { nome: "Urbanismo intergeracional", classificacao: "PAUSADA", acao: "Relevante, mas posterior ao core Smart City." },
  { nome: "Acolhimento familiar hospitalar e abandono de idosos", classificacao: "PAUSADA", acao: "Sensível; aguardar governança de saúde." },
  { nome: "Centro de Acolhimento para Mulheres Vulneráveis", classificacao: "PAUSADA", acao: "Alto impacto, mas exige rede e salvaguardas." },
  { nome: "Fundo Soberano MPE e inclusão produtiva", classificacao: "RADAR", acao: "Futuro módulo de capital/impacto." },
  { nome: "Educação integral e currículo do cidadão completo", classificacao: "RADAR", acao: "Futuro módulo de talentos; não abrir agora." },
  { nome: "Fellows Smart City 2036", classificacao: "RADAR", acao: "Pode apoiar adoção após sponsor Smart City." },
  { nome: "Resíduos inteligentes e lixo em energia", classificacao: "PAUSADA", acao: "Precisa de pré-viabilidade e parceiro." },
  { nome: "Cadeia soberana de hardware de IA", classificacao: "PAUSADA", acao: "Decenal e intensiva em capital; risco de foco." },
  { nome: "P&D biomédico com IA", classificacao: "PAUSADA", acao: "Exige governança clínica e dados." },
  { nome: "Fazendas verticais e IA agrícola", classificacao: "DESCARTADA_AGORA", acao: "Manter fora da execução imediata; só com parceiro setorial." },
  { nome: "Hub Global de Arte, Cultura e Eventos", classificacao: "DESCARTADA_AGORA", acao: "Alto risco de operação de eventos sem plataforma." },
  { nome: "Articulação institucional federal e captação regulatória", classificacao: "RADAR", acao: "Suporte às missões, não frente própria." },
  { nome: "Cooperação DF-SP-ES em soberania nacional de dados", classificacao: "RADAR", acao: "Potencial alto, mas após prova Smart City." },
  { nome: "Capital das Águas e saúde inteligente", classificacao: "RADAR", acao: "Futuro módulo territorial/água/saúde." },
  { nome: "Roadmap integrado 2026–2036 e PMO de execução", classificacao: "RADAR", acao: "Pode virar PMO depois; agora, não criar estrutura pesada." },
];

// ============================================================================
// Top 5 Deal Rooms prioritários
// ============================================================================

const DEAL_ROOMS: SunDealRoom[] = [
  {
    id: "DR1",
    nome: "Smart City — Plataforma Pública Integrada",
    missao: 1,
    sponsor: "Governo do DF — gabinete + secretarias-chave",
    stakeholders: "GDF, FAP, jurídico/procurement, parceiros técnicos (cliente: Governo do DF)",
    status: "Decision pending",
    risco: "Alto risco de dispersão em 34 frentes",
    proximoPasso: "Preparar proposta única de piloto 90 dias",
    owner: "Government Lead",
    necessidadeDoFounder: "Alta apenas em narrativa e abertura institucional",
  },
  {
    id: "DR2",
    nome: "NVIDIA — Infraestrutura Soberana",
    missao: 2,
    sponsor: "NVIDIA LATAM",
    stakeholders: "NVAITC, parceiros de energia, Smart City Infra",
    status: "Discovery técnica",
    risco: "Reunião sem decisão clara",
    proximoPasso: "Briefing único com pauta de decisão objetiva",
    owner: "Partner Lead",
    necessidadeDoFounder: "Alta apenas em validação técnica e narrativa",
  },
  {
    id: "DR3",
    nome: "Joás — Hospital 100% IA",
    missao: 3,
    sponsor: "Grupo Joás",
    stakeholders: "Diretoria clínica, TI, jurídico",
    status: "Proposta fase 1 em elaboração",
    risco: "Escopo clínico crescer demais",
    proximoPasso: "Fechar proposta fase 1 com escopo mínimo viável",
    owner: "Health Lead",
    necessidadeDoFounder: "Média — aprovar tese e limites de escopo",
  },
  {
    id: "DR4",
    nome: "WLM — NowGo Voice + Produto",
    missao: 3,
    sponsor: "WLM",
    stakeholders: "Diretoria comercial, produto, jurídico",
    status: "Term sheet em negociação",
    risco: "Diluição em multi-produto",
    proximoPasso: "Fechar exclusividade por vertical e primeira unidade",
    owner: "Revenue Lead",
    necessidadeDoFounder: "Média — fechar termos de exclusividade",
  },
  {
    id: "DR5",
    nome: "Energia — Piloto 10 unidades LLM air-gapped",
    missao: 2,
    sponsor: "Operador de energia parceiro",
    stakeholders: "Engenharia, regulatório, NVIDIA",
    status: "One-page em elaboração",
    risco: "Saltar para 200 unidades sem piloto validado",
    proximoPasso: "Finalizar one-page de piloto 10 unidades",
    owner: "Infra Lead",
    necessidadeDoFounder: "Média — validar tese e parcerias",
  },
];

// ============================================================================
// Cadência operacional mínima — 5 rituais
// ============================================================================

const RITUALS: SunRitual[] = [
  {
    nome: "Founder Cockpit",
    frequencia: "3 vezes por semana",
    duracao: "15 minutos",
    owner: "Ops Lead",
    saidaObrigatoria:
      "Máximo de 5 decisões: bloqueios, aprovações, exceções e movimentos críticos.",
  },
  {
    nome: "Revenue War Room",
    frequencia: "Semanal",
    duracao: "45 minutos",
    owner: "Revenue Lead",
    saidaObrigatoria:
      "Status dos 5 Deal Rooms, próximos passos, riscos, pausas e conversão.",
  },
  {
    nome: "Government Review",
    frequencia: "Quinzenal",
    duracao: "30 minutos",
    owner: "Government Lead",
    saidaObrigatoria:
      "Smart City (cliente GDF): sponsor, instrumento, barreira jurídica, dados mínimos e próximo ato formal.",
  },
  {
    nome: "Follow-up SLA",
    frequencia: "Diário operacional; revisão semanal",
    duracao: "15 minutos de revisão",
    owner: "Cada Deal Room Owner",
    saidaObrigatoria:
      "Follow-up enviado em até 24h após reunião prioritária; sem pendência invisível.",
  },
  {
    nome: "Pipeline Review",
    frequencia: "Quinzenal",
    duracao: "45 minutos",
    owner: "Ops/Revenue Lead",
    saidaObrigatoria:
      "Reclassificar oportunidades em Ativa, Radar, Pausada e Descartada; proteger teto de 3 missões.",
  },
];

// ============================================================================
// Plano de execução dos próximos 7 dias
// ============================================================================

const NEXT_7_DAYS: SunDayAction[] = [
  { dia: 1, acao: "Validar as 3 missões ativas e congelar novas ativações", owner: "Founder + Ops Lead", saida: "Lista oficial de missões e restrições." },
  { dia: 1, acao: "Nomear owners dos 5 Deal Rooms", owner: "Founder + Ops Lead", saida: "Dono por Deal Room." },
  { dia: 2, acao: "Preencher os 5 Deal Rooms mínimos", owner: "Owners", saida: "Contexto centralizado." },
  { dia: 2, acao: "Criar matriz Ativa/Radar/Pausada/Descartada", owner: "Ops Lead", saida: "Pipeline limpo." },
  { dia: 3, acao: "Finalizar one-page Smart City integrado", owner: "Government Lead", saida: "Material para sponsor/procurement." },
  { dia: 3, acao: "Finalizar briefing NVIDIA/Infra", owner: "Partner Lead", saida: "Agenda com decisão esperada." },
  { dia: 4, acao: "Finalizar proposta fase 1 Joás", owner: "Health Lead", saida: "Escopo mínimo health." },
  { dia: 4, acao: "Finalizar term sheet WLM", owner: "Revenue Lead", saida: "Base de negociação." },
  { dia: 5, acao: "Finalizar one-page Energia piloto 10 unidades", owner: "Infra Lead", saida: "Piloto mínimo validável." },
  { dia: 6, acao: "Enviar follow-ups pendentes dos Deal Rooms", owner: "Owners", saida: "Próximos atos formais." },
  { dia: 7, acao: "Revenue War Room de fechamento da semana", owner: "Revenue Lead", saida: "Avanços, bloqueios, pausas e decisões." },
];

// ============================================================================
// Lista de remoção imediata da agenda do founder
// ============================================================================

const REMOVE_FROM_FOUNDER_AGENDA: SunRemoveItem[] = [
  { remover: "Follow-up operacional de oportunidades em radar", destino: "Deal Room Owner / Revenue Lead", motivo: "Não exige capital relacional do founder." },
  { remover: "Edição final de one-pagers e propostas", destino: "Owner da missão", motivo: "Founder aprova tese, não formatação." },
  { remover: "Reuniões exploratórias de baixa prioridade", destino: "Pausar ou delegar", motivo: "Aumentam ansiedade e não aumentam conversão." },
  { remover: "Parceiros sem função em missão ativa", destino: "Radar", motivo: "Criam movimento sem avanço." },
  { remover: "Projetos com ticket pequeno e baixa escala", destino: "Descartar ou delegar", motivo: "Consomem contexto sem ativo reutilizável." },
  { remover: "Gestão de tarefas dos Deal Rooms", destino: "Owner", motivo: "Founder não deve atuar como PM." },
  { remover: "Discussões técnicas sobre stack futura", destino: "Pausar", motivo: "Sem piloto ou contrato, é arquitetura prematura." },
  { remover: "Internacionalização exploratória sem playbook", destino: "Radar", motivo: "Alta carga cognitiva e baixa conversão imediata." },
];

// ============================================================================
// Quick wins de 7 dias
// ============================================================================

const QUICK_WINS: SunQuickWin[] = [
  {
    titulo: "Matriz única com Missão Ativa, Radar, Pausada, Descartada",
    prazo: "24h",
    owner: "Ops Lead",
    resultado: "Redução imediata de ansiedade e clareza de execução",
    criterio: "Todas as oportunidades classificadas e aceitas pelo founder",
  },
];

// ============================================================================
// Snapshot exportado
// ============================================================================

export const SUN_SNAPSHOT_V1: SunSnapshot = {
  versao: "1.0",
  geradoEm: "2026-05-22T00:00:00.000Z",
  fonte: "blueprint_v1_pdf",
  comandoFinal:
    "Nada novo entra na agenda ativa até que um dos cinco Deal Rooms avance, seja pausado ou seja descartado. O founder deve ser protegido como ativo estratégico, não usado como sistema operacional humano da empresa.",
  missoes: MISSIONS,
  oportunidades: [
    ...OPS_PORTFOLIO.map((o) => ({ ...o, contexto: "portfolio" as const })),
    ...OPS_SMART_CITY_2036.map((o) => ({ ...o, contexto: "smart_city_2036" as const })),
  ],
  dealRooms: DEAL_ROOMS,
  rituais: RITUALS,
  proximos7Dias: NEXT_7_DAYS,
  removerDaAgenda: REMOVE_FROM_FOUNDER_AGENDA,
  quickWins: QUICK_WINS,
};

/**
 * Recupera o snapshot vigente do SUN.
 * No futuro (F6), buscará a versão mais recente do Brain. Por enquanto, devolve
 * o snapshot v1.0 estático.
 */
export function getCurrentSunSnapshot(): SunSnapshot {
  return SUN_SNAPSHOT_V1;
}

/**
 * Localiza a classificação SUN de uma oportunidade pelo nome.
 * Usa matching parcial case-insensitive.
 */
export function lookupOpportunity(nameQuery: string): SunOpportunity | null {
  const q = nameQuery.trim().toLowerCase();
  if (!q) return null;
  const snap = getCurrentSunSnapshot();
  const found = snap.oportunidades.find((o) =>
    o.nome.toLowerCase().includes(q) || q.includes(o.nome.toLowerCase()),
  );
  return found ?? null;
}

/**
 * Retorna estatísticas agregadas do snapshot.
 */
export function getSunStats(snapshot: SunSnapshot = getCurrentSunSnapshot()) {
  const byClass: Record<SunClass, number> = {
    MISSAO_ATIVA: 0,
    RADAR: 0,
    RADAR_CONDICIONADO: 0,
    PAUSADA: 0,
    DESCARTADA: 0,
    DESCARTADA_AGORA: 0,
  };
  for (const op of snapshot.oportunidades) {
    byClass[op.classificacao]++;
  }
  return {
    totalOportunidades: snapshot.oportunidades.length,
    porClassificacao: byClass,
    totalMissoesAtivas: snapshot.missoes.length,
    totalDealRooms: snapshot.dealRooms.length,
    totalRituais: snapshot.rituais.length,
  };
}
