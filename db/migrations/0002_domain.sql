-- ============================================================
-- NowGo Brain — Migração 2: Tabelas de domínio
-- 8 tabelas espelhando as 8 bases Notion + RLS por tenant_id
-- ============================================================

-- ------------------------------------------------------------
-- opportunities (espelha base "pipeline")
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS nowgo_brain.opportunities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES nowgo_brain.tenants(id) ON DELETE CASCADE,
  notion_page_id text UNIQUE,
  id_humano text,
  nome text NOT NULL,
  estagio text,
  score numeric,
  valor_estimado numeric,
  probabilidade numeric,
  urgencia text,
  proximo_follow_up date,
  agente_responsavel text,
  ponto_tensao text,
  criterio_proxima_fase text,
  fortalece_tese text,
  cluster text,
  impacto_estrategico text,
  decisor text,
  contato_decisor text,
  notas text,
  empresa_ids jsonb DEFAULT '[]'::jsonb,
  projeto_ids jsonb DEFAULT '[]'::jsonb,
  data_criacao date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_opp_tenant ON nowgo_brain.opportunities(tenant_id);
CREATE INDEX IF NOT EXISTS idx_opp_estagio ON nowgo_brain.opportunities(tenant_id, estagio);
CREATE INDEX IF NOT EXISTS idx_opp_score ON nowgo_brain.opportunities(tenant_id, score DESC);

-- ------------------------------------------------------------
-- crm_assets (espelha base "ativosCrmIa")
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS nowgo_brain.crm_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES nowgo_brain.tenants(id) ON DELETE CASCADE,
  notion_page_id text UNIQUE,
  company text NOT NULL,
  priority text,
  status text,
  expected_close date,
  type text,
  estimated_value numeric,
  mrr numeric,
  arr numeric,
  email text,
  phone text,
  last_contact date,
  decision_maker text,
  decision_maker_contact text,
  added_at date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_crm_tenant ON nowgo_brain.crm_assets(tenant_id);
CREATE INDEX IF NOT EXISTS idx_crm_status ON nowgo_brain.crm_assets(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_crm_priority ON nowgo_brain.crm_assets(tenant_id, priority);

-- ------------------------------------------------------------
-- projects (espelha base "projetos")
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS nowgo_brain.projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES nowgo_brain.tenants(id) ON DELETE CASCADE,
  notion_page_id text UNIQUE,
  nome text NOT NULL,
  score_prioridade numeric,
  status text,
  riscos text,
  proximo_marco text,
  data_proximo_marco date,
  categoria_prioridade text,
  valor_contrato numeric,
  prazo date,
  vertical text,
  notas text,
  responsavel text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_proj_tenant ON nowgo_brain.projects(tenant_id);
CREATE INDEX IF NOT EXISTS idx_proj_status ON nowgo_brain.projects(tenant_id, status);

-- ------------------------------------------------------------
-- companies (espelha base "empresas")
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS nowgo_brain.companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES nowgo_brain.tenants(id) ON DELETE CASCADE,
  notion_page_id text UNIQUE,
  nome text NOT NULL,
  setor text,
  nivel_influencia text,
  telefone text,
  status_relacionamento text,
  cargo_contato text,
  email text,
  contato_principal text,
  tipo text,
  notas text,
  ultimo_contato date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_comp_tenant ON nowgo_brain.companies(tenant_id);
CREATE INDEX IF NOT EXISTS idx_comp_tipo ON nowgo_brain.companies(tenant_id, tipo);

-- ------------------------------------------------------------
-- tasks (espelha base "tarefas")
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS nowgo_brain.tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES nowgo_brain.tenants(id) ON DELETE CASCADE,
  notion_page_id text UNIQUE,
  nome text NOT NULL,
  responsavel text,
  executor text,
  prioridade text,
  status text,
  prazo date,
  tipo text,
  notas text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_task_tenant ON nowgo_brain.tasks(tenant_id);
CREATE INDEX IF NOT EXISTS idx_task_status ON nowgo_brain.tasks(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_task_prazo ON nowgo_brain.tasks(tenant_id, prazo);

-- ------------------------------------------------------------
-- documents (espelha base "documentos")
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS nowgo_brain.documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES nowgo_brain.tenants(id) ON DELETE CASCADE,
  notion_page_id text UNIQUE,
  nome text NOT NULL,
  status text,
  tipo text,
  resumo text,
  tags jsonb DEFAULT '[]'::jsonb,
  data date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_doc_tenant ON nowgo_brain.documents(tenant_id);
CREATE INDEX IF NOT EXISTS idx_doc_tipo ON nowgo_brain.documents(tenant_id, tipo);

-- ------------------------------------------------------------
-- risks (espelha base "riscos")
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS nowgo_brain.risks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES nowgo_brain.tenants(id) ON DELETE CASCADE,
  notion_page_id text UNIQUE,
  descricao text NOT NULL,
  impacto text,
  probabilidade text,
  categoria text,
  status text,
  mitigacao text,
  responsavel text,
  proxima_revisao date,
  data_identificacao date,
  notas text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_risk_tenant ON nowgo_brain.risks(tenant_id);
CREATE INDEX IF NOT EXISTS idx_risk_status ON nowgo_brain.risks(tenant_id, status);

-- ------------------------------------------------------------
-- financial_entries (espelha base "financeiro")
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS nowgo_brain.financial_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES nowgo_brain.tenants(id) ON DELETE CASCADE,
  notion_page_id text UNIQUE,
  descricao text NOT NULL,
  categoria text,
  tipo text,
  status text,
  valor numeric,
  data date,
  forma_pagamento text,
  notas text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_fin_tenant ON nowgo_brain.financial_entries(tenant_id);
CREATE INDEX IF NOT EXISTS idx_fin_data ON nowgo_brain.financial_entries(tenant_id, data DESC);

-- ============================================================
-- Trigger: updated_at automático em todas as 8 tabelas de domínio
-- ============================================================
CREATE OR REPLACE FUNCTION nowgo_brain.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE t text;
BEGIN
  FOR t IN
    SELECT unnest(ARRAY[
      'opportunities','crm_assets','projects','companies',
      'tasks','documents','risks','financial_entries'
    ])
  LOOP
    EXECUTE format(
      'DROP TRIGGER IF EXISTS trg_%I_updated_at ON nowgo_brain.%I;', t, t
    );
    EXECUTE format(
      'CREATE TRIGGER trg_%I_updated_at BEFORE UPDATE ON nowgo_brain.%I FOR EACH ROW EXECUTE FUNCTION nowgo_brain.set_updated_at();',
      t, t
    );
  END LOOP;
END $$;

-- ============================================================
-- RLS — isolamento por tenant via current_setting('app.current_tenant_id')
-- ============================================================
DO $$
DECLARE t text;
BEGIN
  FOR t IN
    SELECT unnest(ARRAY[
      'opportunities','crm_assets','projects','companies',
      'tasks','documents','risks','financial_entries'
    ])
  LOOP
    EXECUTE format('ALTER TABLE nowgo_brain.%I ENABLE ROW LEVEL SECURITY;', t);
    EXECUTE format('DROP POLICY IF EXISTS tenant_isolation ON nowgo_brain.%I;', t);
    EXECUTE format(
      'CREATE POLICY tenant_isolation ON nowgo_brain.%I USING (tenant_id = NULLIF(current_setting(''app.current_tenant_id'', true), '''')::uuid) WITH CHECK (tenant_id = NULLIF(current_setting(''app.current_tenant_id'', true), '''')::uuid);',
      t
    );
  END LOOP;
END $$;
