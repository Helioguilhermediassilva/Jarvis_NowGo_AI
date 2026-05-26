-- ============================================================
-- NowGo Brain — Migração 1: Fundação multi-tenant
-- Schema: nowgo_brain
-- Tabelas: tenants, users, tenant_members, audit_log
-- ============================================================

CREATE SCHEMA IF NOT EXISTS nowgo_brain;

-- ------------------------------------------------------------
-- tenants — espaço de trabalho de um cliente (1 tenant = 1 cockpit)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS nowgo_brain.tenants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  plan text NOT NULL DEFAULT 'starter' CHECK (plan IN ('starter','pro','enterprise')),
  created_by_user_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  settings jsonb NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_tenants_slug ON nowgo_brain.tenants(slug);

-- ------------------------------------------------------------
-- users — pessoas que fazem login (não confundir com tenant_members)
-- Um user pode pertencer a múltiplos tenants.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS nowgo_brain.users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  name text,
  avatar_url text,
  google_id text UNIQUE,
  role text NOT NULL DEFAULT 'user' CHECK (role IN ('superadmin','admin','user')),
  created_at timestamptz NOT NULL DEFAULT now(),
  last_login_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_users_email ON nowgo_brain.users(email);

-- ------------------------------------------------------------
-- tenant_members — relação user <-> tenant com role contextual
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS nowgo_brain.tenant_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES nowgo_brain.tenants(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES nowgo_brain.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'member' CHECK (role IN ('owner','admin','member','viewer')),
  joined_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_tenant_members_user ON nowgo_brain.tenant_members(user_id);
CREATE INDEX IF NOT EXISTS idx_tenant_members_tenant ON nowgo_brain.tenant_members(tenant_id);

-- ------------------------------------------------------------
-- audit_log — registro imutável de ações relevantes
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS nowgo_brain.audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES nowgo_brain.tenants(id) ON DELETE SET NULL,
  user_id uuid REFERENCES nowgo_brain.users(id) ON DELETE SET NULL,
  action text NOT NULL,
  entity_type text,
  entity_id text,
  payload jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_tenant_created ON nowgo_brain.audit_log(tenant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_entity ON nowgo_brain.audit_log(entity_type, entity_id);

-- ------------------------------------------------------------
-- RLS na fundação
-- audit_log também por tenant para isolar leitura
-- ------------------------------------------------------------
ALTER TABLE nowgo_brain.audit_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS audit_tenant_isolation ON nowgo_brain.audit_log;
CREATE POLICY audit_tenant_isolation ON nowgo_brain.audit_log
  USING (
    tenant_id IS NULL
    OR tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid
  );

-- tenants/users/tenant_members ficam com RLS desabilitada por padrão e são
-- acessadas apenas pela camada de servidor com a SECRET key (service role).
-- A regra de negócio (qual user vê quais tenants) é aplicada na aplicação.
