/**
 * server/db/schema.ts
 *
 * Schema Drizzle ORM espelhando as 12 tabelas do schema PostgreSQL `nowgo_brain`
 * no Supabase Cockpit_NowGo. Source-of-truth do schema é o SQL em
 * db/migrations/000{1..4}_*.sql; este arquivo apenas dá tipos para o ORM.
 *
 * Convenção: nome das tabelas e colunas em snake_case no banco; em camelCase
 * no TypeScript via aliasing nas declarações.
 */
import {
  pgSchema,
  uuid,
  text,
  timestamp,
  jsonb,
  numeric,
  date,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";

export const nowgoBrain = pgSchema("nowgo_brain");

// ---------------------------------------------------------------------------
// tenants
// ---------------------------------------------------------------------------
export const tenants = nowgoBrain.table("tenants", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  plan: text("plan").notNull().default("starter"),
  createdByUserId: uuid("created_by_user_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  settings: jsonb("settings").notNull().default({}),
});

// ---------------------------------------------------------------------------
// users
// ---------------------------------------------------------------------------
export const users = nowgoBrain.table("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  name: text("name"),
  avatarUrl: text("avatar_url"),
  googleId: text("google_id").unique(),
  role: text("role").notNull().default("user"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
});

// ---------------------------------------------------------------------------
// tenant_members
// ---------------------------------------------------------------------------
export const tenantMembers = nowgoBrain.table(
  "tenant_members",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    role: text("role").notNull().default("member"),
    joinedAt: timestamp("joined_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    uniqueTenantUser: uniqueIndex("tenant_members_tenant_user_uq").on(
      t.tenantId,
      t.userId,
    ),
  }),
);

// ---------------------------------------------------------------------------
// audit_log
// ---------------------------------------------------------------------------
export const auditLog = nowgoBrain.table("audit_log", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id").references(() => tenants.id, {
    onDelete: "set null",
  }),
  userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
  action: text("action").notNull(),
  entityType: text("entity_type"),
  entityId: text("entity_id"),
  payload: jsonb("payload"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// ---------------------------------------------------------------------------
// opportunities  (espelha base Notion "pipeline")
// ---------------------------------------------------------------------------
export const opportunities = nowgoBrain.table(
  "opportunities",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    notionPageId: text("notion_page_id").unique(),
    idHumano: text("id_humano"),
    nome: text("nome").notNull(),
    estagio: text("estagio"),
    score: numeric("score"),
    valorEstimado: numeric("valor_estimado"),
    probabilidade: numeric("probabilidade"),
    urgencia: text("urgencia"),
    proximoFollowUp: date("proximo_follow_up"),
    agenteResponsavel: text("agente_responsavel"),
    pontoTensao: text("ponto_tensao"),
    criterioProximaFase: text("criterio_proxima_fase"),
    fortaleceTese: text("fortalece_tese"),
    cluster: text("cluster"),
    impactoEstrategico: text("impacto_estrategico"),
    decisor: text("decisor"),
    contatoDecisor: text("contato_decisor"),
    notas: text("notas"),
    empresaIds: jsonb("empresa_ids").default([]),
    projetoIds: jsonb("projeto_ids").default([]),
    dataCriacao: date("data_criacao"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    byTenant: index("idx_opp_tenant_drz").on(t.tenantId),
    byStage: index("idx_opp_stage_drz").on(t.tenantId, t.estagio),
  }),
);

// ---------------------------------------------------------------------------
// crm_assets  (espelha base Notion "ativosCrmIa")
// ---------------------------------------------------------------------------
export const crmAssets = nowgoBrain.table(
  "crm_assets",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    notionPageId: text("notion_page_id").unique(),
    company: text("company").notNull(),
    priority: text("priority"),
    status: text("status"),
    expectedClose: date("expected_close"),
    type: text("type"),
    estimatedValue: numeric("estimated_value"),
    mrr: numeric("mrr"),
    arr: numeric("arr"),
    email: text("email"),
    phone: text("phone"),
    lastContact: date("last_contact"),
    decisionMaker: text("decision_maker"),
    decisionMakerContact: text("decision_maker_contact"),
    addedAt: date("added_at"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    byTenant: index("idx_crm_tenant_drz").on(t.tenantId),
    byStatus: index("idx_crm_status_drz").on(t.tenantId, t.status),
  }),
);

// ---------------------------------------------------------------------------
// projects  (espelha base Notion "projetos")
// ---------------------------------------------------------------------------
export const projects = nowgoBrain.table("projects", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id")
    .notNull()
    .references(() => tenants.id, { onDelete: "cascade" }),
  notionPageId: text("notion_page_id").unique(),
  nome: text("nome").notNull(),
  scorePrioridade: numeric("score_prioridade"),
  status: text("status"),
  riscos: text("riscos"),
  proximoMarco: text("proximo_marco"),
  dataProximoMarco: date("data_proximo_marco"),
  categoriaPrioridade: text("categoria_prioridade"),
  valorContrato: numeric("valor_contrato"),
  prazo: date("prazo"),
  vertical: text("vertical"),
  notas: text("notas"),
  responsavel: text("responsavel"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// ---------------------------------------------------------------------------
// companies  (espelha base Notion "empresas")
// ---------------------------------------------------------------------------
export const companies = nowgoBrain.table("companies", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id")
    .notNull()
    .references(() => tenants.id, { onDelete: "cascade" }),
  notionPageId: text("notion_page_id").unique(),
  nome: text("nome").notNull(),
  setor: text("setor"),
  nivelInfluencia: text("nivel_influencia"),
  telefone: text("telefone"),
  statusRelacionamento: text("status_relacionamento"),
  cargoContato: text("cargo_contato"),
  email: text("email"),
  contatoPrincipal: text("contato_principal"),
  tipo: text("tipo"),
  notas: text("notas"),
  ultimoContato: date("ultimo_contato"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// ---------------------------------------------------------------------------
// tasks  (espelha base Notion "tarefas")
// ---------------------------------------------------------------------------
export const tasks = nowgoBrain.table("tasks", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id")
    .notNull()
    .references(() => tenants.id, { onDelete: "cascade" }),
  notionPageId: text("notion_page_id").unique(),
  nome: text("nome").notNull(),
  responsavel: text("responsavel"),
  executor: text("executor"),
  prioridade: text("prioridade"),
  status: text("status"),
  prazo: date("prazo"),
  tipo: text("tipo"),
  notas: text("notas"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// ---------------------------------------------------------------------------
// documents  (espelha base Notion "documentos")
// ---------------------------------------------------------------------------
export const documents = nowgoBrain.table("documents", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id")
    .notNull()
    .references(() => tenants.id, { onDelete: "cascade" }),
  notionPageId: text("notion_page_id").unique(),
  nome: text("nome").notNull(),
  status: text("status"),
  tipo: text("tipo"),
  resumo: text("resumo"),
  tags: jsonb("tags").default([]),
  data: date("data"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// ---------------------------------------------------------------------------
// risks  (espelha base Notion "riscos")
// ---------------------------------------------------------------------------
export const risks = nowgoBrain.table("risks", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id")
    .notNull()
    .references(() => tenants.id, { onDelete: "cascade" }),
  notionPageId: text("notion_page_id").unique(),
  descricao: text("descricao").notNull(),
  impacto: text("impacto"),
  probabilidade: text("probabilidade"),
  categoria: text("categoria"),
  status: text("status"),
  mitigacao: text("mitigacao"),
  responsavel: text("responsavel"),
  proximaRevisao: date("proxima_revisao"),
  dataIdentificacao: date("data_identificacao"),
  notas: text("notas"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// ---------------------------------------------------------------------------
// financial_entries  (espelha base Notion "financeiro")
// ---------------------------------------------------------------------------
export const financialEntries = nowgoBrain.table("financial_entries", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id")
    .notNull()
    .references(() => tenants.id, { onDelete: "cascade" }),
  notionPageId: text("notion_page_id").unique(),
  descricao: text("descricao").notNull(),
  categoria: text("categoria"),
  tipo: text("tipo"),
  status: text("status"),
  valor: numeric("valor"),
  data: date("data"),
  formaPagamento: text("forma_pagamento"),
  notas: text("notas"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// ---------------------------------------------------------------------------
// Tipos exportados para uso pelas implementações de Repository
// ---------------------------------------------------------------------------
export type Tenant = typeof tenants.$inferSelect;
export type NewTenant = typeof tenants.$inferInsert;

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type TenantMember = typeof tenantMembers.$inferSelect;
export type NewTenantMember = typeof tenantMembers.$inferInsert;

export type AuditLogEntry = typeof auditLog.$inferSelect;
export type NewAuditLogEntry = typeof auditLog.$inferInsert;

export type OpportunityRow = typeof opportunities.$inferSelect;
export type NewOpportunityRow = typeof opportunities.$inferInsert;

export type CrmAssetRow = typeof crmAssets.$inferSelect;
export type NewCrmAssetRow = typeof crmAssets.$inferInsert;

export type ProjectRow = typeof projects.$inferSelect;
export type NewProjectRow = typeof projects.$inferInsert;

export type CompanyRow = typeof companies.$inferSelect;
export type NewCompanyRow = typeof companies.$inferInsert;

export type TaskRow = typeof tasks.$inferSelect;
export type NewTaskRow = typeof tasks.$inferInsert;

export type DocumentRow = typeof documents.$inferSelect;
export type NewDocumentRow = typeof documents.$inferInsert;

export type RiskRow = typeof risks.$inferSelect;
export type NewRiskRow = typeof risks.$inferInsert;

export type FinancialEntryRow = typeof financialEntries.$inferSelect;
export type NewFinancialEntryRow = typeof financialEntries.$inferInsert;
