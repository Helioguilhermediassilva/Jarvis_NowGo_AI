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
  smallint,
  integer,
  boolean,
  inet,
  customType,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";

// Tipo customizado para bytea (segredo TOTP criptografado)
const bytea = customType<{ data: Uint8Array; driverData: Buffer }>({
  dataType() {
    return "bytea";
  },
});

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
    platformAccess: boolean("platform_access").notNull().default(true),
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
// platform billing — fonte local de entitlements e créditos; Stripe é a fonte
// de verdade para customer, assinatura, pagamento e invoice.
// ---------------------------------------------------------------------------
export const stripeCustomers = nowgoBrain.table("stripe_customers", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id")
    .notNull()
    .references(() => tenants.id, { onDelete: "cascade" })
    .unique(),
  stripeCustomerId: text("stripe_customer_id").notNull().unique(),
  email: text("email"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const billingSubscriptions = nowgoBrain.table(
  "billing_subscriptions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    stripeCustomerId: text("stripe_customer_id").notNull(),
    stripeSubscriptionId: text("stripe_subscription_id").notNull().unique(),
    stripePriceId: text("stripe_price_id").notNull(),
    planCode: text("plan_code").notNull(),
    status: text("status").notNull(),
    currentPeriodStart: timestamp("current_period_start", { withTimezone: true }),
    currentPeriodEnd: timestamp("current_period_end", { withTimezone: true }),
    cancelAtPeriodEnd: boolean("cancel_at_period_end").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    byTenant: index("idx_billing_subscriptions_tenant").on(t.tenantId),
    byCustomer: index("idx_billing_subscriptions_customer").on(t.stripeCustomerId),
  }),
);

export const creditLedger = nowgoBrain.table(
  "credit_ledger",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
    amount: integer("amount").notNull(),
    source: text("source").notNull(),
    planCode: text("plan_code"),
    stripeCheckoutSessionId: text("stripe_checkout_session_id"),
    stripePaymentIntentId: text("stripe_payment_intent_id"),
    idempotencyKey: text("idempotency_key").notNull().unique(),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    metadata: jsonb("metadata").notNull().default({}),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    byTenantCreated: index("idx_credit_ledger_tenant_created").on(t.tenantId, t.createdAt),
    byTenantExpiry: index("idx_credit_ledger_tenant_expiry").on(t.tenantId, t.expiresAt),
  }),
);

export const billingEvents = nowgoBrain.table(
  "billing_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    stripeEventId: text("stripe_event_id").notNull().unique(),
    eventType: text("event_type").notNull(),
    payload: jsonb("payload").notNull(),
    processedAt: timestamp("processed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
);

// ---------------------------------------------------------------------------
// guest_checkout_intents — intenção pública antes da criação da conta
// ---------------------------------------------------------------------------
export const guestCheckoutIntents = nowgoBrain.table(
  "guest_checkout_intents",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    email: text("email").notNull(),
    offerCode: text("offer_code").notNull(),
    status: text("status").notNull().default("pending"),
    claimTokenHash: text("claim_token_hash").notNull().unique(),
    stripeCheckoutSessionId: text("stripe_checkout_session_id").unique(),
    stripeCustomerId: text("stripe_customer_id"),
    tenantId: uuid("tenant_id").references(() => tenants.id, { onDelete: "set null" }),
    userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
    claimedAt: timestamp("claimed_at", { withTimezone: true }),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    metadata: jsonb("metadata").notNull().default({}),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    byEmail: index("idx_guest_checkout_email").on(t.email),
    byStripeSession: index("idx_guest_checkout_stripe_session").on(t.stripeCheckoutSessionId),
    byStatus: index("idx_guest_checkout_status").on(t.status),
  }),
);

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
    // F47 — 6 vetores oficiais do blueprint NowGo Brain
    urgencyScore: smallint("urgency_score"),
    financialImpactScore: smallint("financial_impact_score"),
    strategicImpactScore: smallint("strategic_impact_score"),
    riskScore: smallint("risk_score"),
    dependencyScore: smallint("dependency_score"),
    probabilityScore: smallint("probability_score"),
    computedScore: numeric("computed_score"),
    priorityCategory: text("priority_category"),
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

export type StripeCustomerRow = typeof stripeCustomers.$inferSelect;
export type NewStripeCustomerRow = typeof stripeCustomers.$inferInsert;

export type BillingSubscriptionRow = typeof billingSubscriptions.$inferSelect;
export type NewBillingSubscriptionRow = typeof billingSubscriptions.$inferInsert;

export type CreditLedgerRow = typeof creditLedger.$inferSelect;
export type NewCreditLedgerRow = typeof creditLedger.$inferInsert;

export type BillingEventRow = typeof billingEvents.$inferSelect;
export type NewBillingEventRow = typeof billingEvents.$inferInsert;

export type GuestCheckoutIntentRow = typeof guestCheckoutIntents.$inferSelect;
export type NewGuestCheckoutIntentRow = typeof guestCheckoutIntents.$inferInsert;

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


// =============================================================================
// F47 — Tabelas de auth e CRUD multi-tenant
// =============================================================================

// ---------------------------------------------------------------------------
// invitations
// ---------------------------------------------------------------------------
export const invitations = nowgoBrain.table(
  "invitations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tokenHash: text("token_hash").notNull().unique(),
    email: text("email").notNull(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    role: text("role").notNull(),
    platformAccess: boolean("platform_access").notNull().default(true),
    invitedBy: uuid("invited_by")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    usedAt: timestamp("used_at", { withTimezone: true }),
    usedBy: uuid("used_by").references(() => users.id, { onDelete: "set null" }),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    byEmail: index("idx_invitations_email_drz").on(t.email),
    byTenant: index("idx_invitations_tenant_drz").on(t.tenantId),
  }),
);

// ---------------------------------------------------------------------------
// sessions
// ---------------------------------------------------------------------------
export const sessions = nowgoBrain.table(
  "sessions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    sessionTokenHash: text("session_token_hash").notNull().unique(),
    ip: inet("ip"),
    userAgent: text("user_agent"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    lastSeenAt: timestamp("last_seen_at", { withTimezone: true }).notNull().defaultNow(),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
  },
  (t) => ({
    byUser: index("idx_sessions_user_drz").on(t.userId),
    byTenant: index("idx_sessions_tenant_drz").on(t.tenantId),
  }),
);

// ---------------------------------------------------------------------------
// password_credentials
// ---------------------------------------------------------------------------
export const passwordCredentials = nowgoBrain.table("password_credentials", {
  userId: uuid("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  argon2Hash: text("argon2_hash").notNull(),
  verifiedAt: timestamp("verified_at", { withTimezone: true }),
  verificationTokenHash: text("verification_token_hash"),
  verificationSentAt: timestamp("verification_sent_at", { withTimezone: true }),
  passwordChangedAt: timestamp("password_changed_at", { withTimezone: true }).notNull().defaultNow(),
  failedAttempts: integer("failed_attempts").notNull().default(0),
  lockedUntil: timestamp("locked_until", { withTimezone: true }),
  resetTokenHash: text("reset_token_hash"),
  resetTokenExpiresAt: timestamp("reset_token_expires_at", { withTimezone: true }),
});

// ---------------------------------------------------------------------------
// mfa_credentials
// ---------------------------------------------------------------------------
export const mfaCredentials = nowgoBrain.table("mfa_credentials", {
  userId: uuid("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  totpSecretEncrypted: bytea("totp_secret_encrypted").notNull(),
  // Array de strings nativo do Postgres é declarado como jsonb no Drizzle quando
  // não temos pg_array helper específico para text[]; usamos jsonb como wrapper.
  backupCodesHashed: jsonb("backup_codes_hashed").notNull(),
  enabledAt: timestamp("enabled_at", { withTimezone: true }).notNull().defaultNow(),
  lastUsedAt: timestamp("last_used_at", { withTimezone: true }),
  resetCount: integer("reset_count").notNull().default(0),
});

// ---------------------------------------------------------------------------
// deal_rooms
// ---------------------------------------------------------------------------
export const dealRooms = nowgoBrain.table(
  "deal_rooms",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    opportunityId: uuid("opportunity_id")
      .notNull()
      .references(() => opportunities.id, { onDelete: "restrict" }),
    ownerUserId: uuid("owner_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    status: text("status").notNull(),
    promotedAt: timestamp("promoted_at", { withTimezone: true }).notNull().defaultNow(),
    scoreAtPromotion: numeric("score_at_promotion").notNull(),
    resolvedAt: timestamp("resolved_at", { withTimezone: true }),
    resolutionNotes: text("resolution_notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    byTenantStatus: index("idx_deal_rooms_tenant_status_drz").on(t.tenantId, t.status),
  }),
);

// ---------------------------------------------------------------------------
// deal_room_audit
// ---------------------------------------------------------------------------
export const dealRoomAudit = nowgoBrain.table(
  "deal_room_audit",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    dealRoomId: uuid("deal_room_id")
      .notNull()
      .references(() => dealRooms.id, { onDelete: "cascade" }),
    fromStatus: text("from_status"),
    toStatus: text("to_status").notNull(),
    scoreSnapshot: numeric("score_snapshot").notNull(),
    triggeredBy: uuid("triggered_by")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    reason: text("reason"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    byTenantDealRoom: index("idx_deal_room_audit_tenant_drz").on(t.tenantId, t.dealRoomId),
  }),
);

// ---------------------------------------------------------------------------
// Tipos exportados — F47
// ---------------------------------------------------------------------------
export type InvitationRow = typeof invitations.$inferSelect;
export type NewInvitationRow = typeof invitations.$inferInsert;

export type SessionRow = typeof sessions.$inferSelect;
export type NewSessionRow = typeof sessions.$inferInsert;

export type PasswordCredentialRow = typeof passwordCredentials.$inferSelect;
export type NewPasswordCredentialRow = typeof passwordCredentials.$inferInsert;

export type MfaCredentialRow = typeof mfaCredentials.$inferSelect;
export type NewMfaCredentialRow = typeof mfaCredentials.$inferInsert;

export type DealRoomRow = typeof dealRooms.$inferSelect;
export type NewDealRoomRow = typeof dealRooms.$inferInsert;

export type DealRoomAuditRow = typeof dealRoomAudit.$inferSelect;
export type NewDealRoomAuditRow = typeof dealRoomAudit.$inferInsert;

export type TenantRow = typeof tenants.$inferSelect;
export type NewTenantRow = typeof tenants.$inferInsert;
