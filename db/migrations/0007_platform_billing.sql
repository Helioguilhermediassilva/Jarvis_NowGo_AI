-- =====================================================================
-- Migração 0007: billing da Plataforma de Inteligência Soberana
-- =====================================================================
-- Tabelas administrativas e append-only. O backend usa a service role do
-- Postgres; RLS permanece deny-all para acesso direto por clientes.

SET search_path TO nowgo_brain, public;

CREATE TABLE IF NOT EXISTS nowgo_brain.stripe_customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL UNIQUE REFERENCES nowgo_brain.tenants(id) ON DELETE CASCADE,
  stripe_customer_id text NOT NULL UNIQUE,
  email text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS nowgo_brain.billing_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES nowgo_brain.tenants(id) ON DELETE CASCADE,
  stripe_customer_id text NOT NULL,
  stripe_subscription_id text NOT NULL UNIQUE,
  stripe_price_id text NOT NULL,
  plan_code text NOT NULL,
  status text NOT NULL,
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_billing_subscriptions_tenant
  ON nowgo_brain.billing_subscriptions (tenant_id);

CREATE INDEX IF NOT EXISTS idx_billing_subscriptions_customer
  ON nowgo_brain.billing_subscriptions (stripe_customer_id);

CREATE TABLE IF NOT EXISTS nowgo_brain.credit_ledger (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES nowgo_brain.tenants(id) ON DELETE CASCADE,
  user_id uuid REFERENCES nowgo_brain.users(id) ON DELETE SET NULL,
  amount integer NOT NULL,
  source text NOT NULL,
  plan_code text,
  stripe_checkout_session_id text,
  stripe_payment_intent_id text,
  idempotency_key text NOT NULL UNIQUE,
  expires_at timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_credit_ledger_tenant_created
  ON nowgo_brain.credit_ledger (tenant_id, created_at);

CREATE INDEX IF NOT EXISTS idx_credit_ledger_tenant_expiry
  ON nowgo_brain.credit_ledger (tenant_id, expires_at);

CREATE TABLE IF NOT EXISTS nowgo_brain.billing_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_event_id text NOT NULL UNIQUE,
  event_type text NOT NULL,
  payload jsonb NOT NULL,
  processed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE nowgo_brain.stripe_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE nowgo_brain.billing_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE nowgo_brain.credit_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE nowgo_brain.billing_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS stripe_customers_deny_all ON nowgo_brain.stripe_customers;
CREATE POLICY stripe_customers_deny_all ON nowgo_brain.stripe_customers
  AS RESTRICTIVE FOR ALL USING (false) WITH CHECK (false);

DROP POLICY IF EXISTS billing_subscriptions_deny_all ON nowgo_brain.billing_subscriptions;
CREATE POLICY billing_subscriptions_deny_all ON nowgo_brain.billing_subscriptions
  AS RESTRICTIVE FOR ALL USING (false) WITH CHECK (false);

DROP POLICY IF EXISTS credit_ledger_deny_all ON nowgo_brain.credit_ledger;
CREATE POLICY credit_ledger_deny_all ON nowgo_brain.credit_ledger
  AS RESTRICTIVE FOR ALL USING (false) WITH CHECK (false);

DROP POLICY IF EXISTS billing_events_deny_all ON nowgo_brain.billing_events;
CREATE POLICY billing_events_deny_all ON nowgo_brain.billing_events
  AS RESTRICTIVE FOR ALL USING (false) WITH CHECK (false);

COMMENT ON TABLE nowgo_brain.credit_ledger IS
  'Ledger append-only de concessão, consumo, compra, expiração e reversão de créditos da Plataforma de Inteligência Soberana.';
COMMENT ON COLUMN nowgo_brain.credit_ledger.amount IS
  'Valor positivo concede créditos; valor negativo consome ou revoga créditos.';
COMMENT ON TABLE nowgo_brain.billing_events IS
  'Eventos Stripe persistidos por stripe_event_id para processamento idempotente e reconciliação.';
