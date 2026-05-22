/**
 * server/brainSchema.ts
 * NowGo Brain — constantes canônicas: IDs e nomes de propriedade das 8 bases.
 *
 * Fonte autoritativa: introspecção via Notion API em 22/maio/2026.
 * Workspace: "NowGo Holding".
 *
 * Decisão de consolidação (22/mai/2026): adotamos as versões NOVAS (com emoji) como
 * canônicas e ignoramos as bases legadas (Pipeline / Opportunities sem emoji, Active
 * Projects). As legadas permanecem no Notion até que o founder as arquive manualmente.
 */

export const BRAIN_ROOT_PAGE_ID = "3471e87b-1609-810f-a539-ca62b1a63cf1";

/**
 * Bases canônicas do Brain (8 bases finais).
 */
export const BRAIN_DATABASES = {
  pipeline: {
    id: "616cee4a-33f7-4e45-a8bb-80d91dcd14ee",
    title: "💼 Oportunidades / Pipeline",
    role: "CRM comercial principal (oportunidades com score, estágio, follow-up)",
  },
  projetos: {
    id: "45c84de2-edb4-4417-bb24-972c24f9e30e",
    title: "📁 Projetos",
    role: "Projetos vinculados a oportunidades (hub central com 7 relations)",
  },
  ativosCrmIa: {
    id: "1041e87b-1609-806f-af78-e9102e86e231",
    title: "ATIVOS CRM IA",
    role: "CRM operacional/recorrente (funil tradicional)",
  },
  empresas: {
    id: "111de497-3165-4461-9ea9-2378d43fd331",
    title: "🏢 Empresas / Stakeholders",
    role: "Cadastro de empresas, contatos e nível de influência",
  },
  tarefas: {
    id: "3cd14c2f-3014-4bb0-845c-4abf6eefdbb8",
    title: "✅ Tarefas / Entregas",
    role: "Tarefas operacionais com executor (humano ou agente)",
  },
  documentos: {
    id: "93c51a64-2b4b-488c-b771-69d29c38ec9f",
    title: "📚 Documentos / Knowledge Base",
    role: "Atas, briefings, propostas, apresentações, contratos (memória institucional)",
  },
  riscos: {
    id: "dcba8759-9faa-4985-b96d-b31709ed539c",
    title: "⚠️ Riscos",
    role: "Riscos identificados por oportunidade ou projeto",
  },
  financeiro: {
    id: "06457023-b841-46aa-842a-5acea3f177e8",
    title: "💰 Financeiro",
    role: "Movimentação financeira (receitas, despesas, projeções)",
  },
} as const;

export type BrainDatabaseKey = keyof typeof BRAIN_DATABASES;

// ---------------------------------------------------------------------------
// Propriedades canônicas — nomes em português, exatamente como aparecem no Notion.
// ---------------------------------------------------------------------------

/** Estágios do funil comercial (Pipeline). */
export const PIPELINE_STAGES = [
  "Lead",
  "Qualificado",
  "Proposta",
  "Negociação",
  "Fechado-Ganho",
  "Fechado-Perdido",
] as const;
export type PipelineStage = (typeof PIPELINE_STAGES)[number];

/** Estágios ativos (excluindo fechados). */
export const PIPELINE_ACTIVE_STAGES: PipelineStage[] = [
  "Lead",
  "Qualificado",
  "Proposta",
  "Negociação",
];

/** Estágios quentes (avançados, mais próximos do fechamento). */
export const PIPELINE_HOT_STAGES: PipelineStage[] = ["Proposta", "Negociação"];

/** Urgência. */
export const URGENCIA = ["Alta", "Média", "Baixa"] as const;
export type Urgencia = (typeof URGENCIA)[number];

/** Impacto estratégico. */
export const IMPACTO = ["Alto", "Médio", "Baixo"] as const;
export type Impacto = (typeof IMPACTO)[number];

/** Clusters de cliente. */
export const CLUSTERS = [
  "Parcerias Internacionais",
  "Saúde e Hospitalar",
  "Governo e Setor Público",
  "Indústria e Comércio",
  "Jurídico e Cartórios",
  "Aceleradoras e Mentoradas",
  "NVIDIA e Investidores",
  "Vision ISH Pipeline",
  "Outros Exploratórios",
] as const;
export type Cluster = (typeof CLUSTERS)[number];

/** Agentes responsáveis. */
export const AGENTES_RESPONSAVEIS = [
  "Executivo",
  "Comercial",
  "Governo-FAP",
  "Saúde",
  "Financeiro",
  "Operacional",
  "Knowledge",
] as const;
export type AgenteResponsavel = (typeof AGENTES_RESPONSAVEIS)[number];

/** Mapa por base das propriedades canônicas (nome exato no Notion). */
export const BRAIN_PROPS = {
  pipeline: {
    title: "Nome",
    empresa: "Empresa",
    impactoEstrategico: "Impacto Estratégico",
    cluster: "Cluster",
    score: "Score",
    pontoTensao: "Ponto de Tensão",
    criterioProximaFase: "Critério Próxima Fase",
    estagio: "Estágio",
    notas: "Notas",
    urgencia: "Urgência",
    fortaleceTese: "Fortalece Tese?",
    valorPonderado: "Valor Ponderado",
    proximoFollowUp: "Próximo Follow-up",
    valorEstimado: "Valor Estimado",
    probabilidade: "Probabilidade (%)",
    idOportunidade: "ID Oportunidade",
    agenteResponsavel: "Agente Responsável",
    responsavel: "Responsável",
    projeto: "Projeto",
  },
  projetos: {
    title: "Nome",
    scorePrioridade: "Score Prioridade",
    status: "Status",
    riscos: "Riscos",
    proximoMarco: "Próximo Marco",
    tarefas: "Tarefas",
    risco: "Risco",
    oportunidades: "Oportunidades",
    lancamentosFinanceiros: "Lançamentos Financeiros",
    dataProximoMarco: "Data Próximo Marco",
    categoriaPrioridade: "Categoria Prioridade",
    valorContrato: "Valor do Contrato",
    notas: "Notas",
    prazo: "Prazo",
    idProjeto: "ID Projeto",
    responsavel: "Responsável",
    documentos: "Documentos",
    vertical: "Vertical",
    contratos: "Contratos",
    stakeholders: "Stakeholders",
  },
  empresas: {
    title: "Nome",
    setor: "Setor",
    projetos: "Projetos",
    nivelInfluencia: "Nível de Influência",
    idEmpresa: "ID Empresa",
    telefone: "Telefone",
    statusRelacionamento: "Status Relacionamento",
    cargoContato: "Cargo Contato",
    contratos: "Contratos",
    email: "Email",
    contatoPrincipal: "Contato Principal",
    tipo: "Tipo",
    notas: "Notas",
    ultimoContato: "Último Contato",
    oportunidades: "Oportunidades",
  },
  tarefas: {
    title: "Nome",
    notas: "Notas",
    responsavel: "Responsável",
    idTarefa: "ID Tarefa",
    executor: "Executor",
    dependencias: "Dependências",
    prioridade: "Prioridade",
    status: "Status",
    projeto: "Projeto",
    prazo: "Prazo",
    tipo: "Tipo",
  },
  documentos: {
    title: "Nome",
    status: "Status",
    tipo: "Tipo",
    arquivos: "Arquivos",
    resumo: "Resumo",
    idDocumento: "ID Documento",
    projeto: "Projeto",
    tags: "Tags",
    data: "Data",
  },
  riscos: {
    title: "Descrição",
    notas: "Notas",
    impacto: "Impacto",
    proximaRevisao: "Próxima Revisão",
    categoria: "Categoria",
    probabilidade: "Probabilidade",
    responsavel: "Responsável",
    status: "Status",
    mitigacao: "Mitigação",
    idRisco: "ID Risco",
    dataIdentificacao: "Data Identificação",
    projeto: "Projeto",
  },
  financeiro: {
    title: "Descrição",
    categoria: "Categoria",
    notas: "Notas",
    projeto: "Projeto",
    formaPagamento: "Forma de Pagamento",
    tipo: "Tipo",
    status: "Status",
    idLancamento: "ID Lançamento",
    valor: "Valor",
    data: "Data",
  },
  ativosCrmIa: {
    title: "Company",
    priority: "Priority",
    status: "Status",
    expectedClose: "Expected Close",
    type: "Type",
    added: "Added",
    phone: "Phone",
    estimatedValue: "Estimated Value",
    email: "Email",
    lastContact: "Last Contact",
  },
} as const;
