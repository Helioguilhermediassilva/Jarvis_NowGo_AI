-- =====================================================================
-- F47 — Cockpit para clientes externos
-- Migração 0005: invitations + sessions + password_credentials +
--                mfa_credentials + deal_rooms + deal_room_audit
--                + extensão de opportunities com 6 vetores de scoring
-- =====================================================================
-- Autor: Manus AI em colaboração com Hélio Guilherme Dias Silva
-- Data: 2026-05-26
-- Referência: docs/F47-arquitetura.md (seções 3 e 5)
-- =====================================================================

SET search_path TO nowgo_brain, public;

-- ---------------------------------------------------------------------
-- 1. INVITATIONS
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS nowgo_brain.invitations (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    token_hash      text NOT NULL UNIQUE,
    email           text NOT NULL,
    tenant_id       uuid NOT NULL REFERENCES nowgo_brain.tenants(id) ON DELETE CASCADE,
    role            text NOT NULL CHECK (role IN ('owner','admin','member')),
    invited_by      uuid NOT NULL REFERENCES nowgo_brain.users(id) ON DELETE RESTRICT,
    expires_at      timestamptz NOT NULL,
    used_at         timestamptz NULL,
    used_by         uuid NULL REFERENCES nowgo_brain.users(id) ON DELETE SET NULL,
    revoked_at      timestamptz NULL,
    created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_invitations_email           ON nowgo_brain.invitations(email);
CREATE INDEX IF NOT EXISTS idx_invitations_tenant          ON nowgo_brain.invitations(tenant_id);
CREATE INDEX IF NOT EXISTS idx_invitations_active          ON nowgo_brain.invitations(expires_at)
    WHERE used_at IS NULL AND revoked_at IS NULL;

ALTER TABLE nowgo_brain.invitations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS invitations_deny_all ON nowgo_brain.invitations;
CREATE POLICY invitations_deny_all ON nowgo_brain.invitations
    FOR ALL TO authenticated, anon USING (false) WITH CHECK (false);

-- ---------------------------------------------------------------------
-- 2. SESSIONS
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS nowgo_brain.sessions (
    id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             uuid NOT NULL REFERENCES nowgo_brain.users(id) ON DELETE CASCADE,
    tenant_id           uuid NOT NULL REFERENCES nowgo_brain.tenants(id) ON DELETE CASCADE,
    session_token_hash  text NOT NULL UNIQUE,
    ip                  inet NULL,
    user_agent          text NULL,
    created_at          timestamptz NOT NULL DEFAULT now(),
    expires_at          timestamptz NOT NULL,
    last_seen_at        timestamptz NOT NULL DEFAULT now(),
    revoked_at          timestamptz NULL
);

CREATE INDEX IF NOT EXISTS idx_sessions_user      ON nowgo_brain.sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_tenant    ON nowgo_brain.sessions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_sessions_active    ON nowgo_brain.sessions(expires_at)
    WHERE revoked_at IS NULL;

ALTER TABLE nowgo_brain.sessions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS sessions_deny_all ON nowgo_brain.sessions;
CREATE POLICY sessions_deny_all ON nowgo_brain.sessions
    FOR ALL TO authenticated, anon USING (false) WITH CHECK (false);

-- ---------------------------------------------------------------------
-- 3. PASSWORD_CREDENTIALS
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS nowgo_brain.password_credentials (
    user_id                     uuid PRIMARY KEY REFERENCES nowgo_brain.users(id) ON DELETE CASCADE,
    argon2_hash                 text NOT NULL,
    verified_at                 timestamptz NULL,
    verification_token_hash     text NULL,
    verification_sent_at        timestamptz NULL,
    password_changed_at         timestamptz NOT NULL DEFAULT now(),
    failed_attempts             int NOT NULL DEFAULT 0,
    locked_until                timestamptz NULL,
    reset_token_hash            text NULL,
    reset_token_expires_at      timestamptz NULL
);

ALTER TABLE nowgo_brain.password_credentials ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS password_credentials_deny_all ON nowgo_brain.password_credentials;
CREATE POLICY password_credentials_deny_all ON nowgo_brain.password_credentials
    FOR ALL TO authenticated, anon USING (false) WITH CHECK (false);

-- ---------------------------------------------------------------------
-- 4. MFA_CREDENTIALS
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS nowgo_brain.mfa_credentials (
    user_id                 uuid PRIMARY KEY REFERENCES nowgo_brain.users(id) ON DELETE CASCADE,
    totp_secret_encrypted   bytea NOT NULL,
    backup_codes_hashed     text[] NOT NULL,
    enabled_at              timestamptz NOT NULL DEFAULT now(),
    last_used_at            timestamptz NULL,
    reset_count             int NOT NULL DEFAULT 0
);

ALTER TABLE nowgo_brain.mfa_credentials ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS mfa_credentials_deny_all ON nowgo_brain.mfa_credentials;
CREATE POLICY mfa_credentials_deny_all ON nowgo_brain.mfa_credentials
    FOR ALL TO authenticated, anon USING (false) WITH CHECK (false);

-- ---------------------------------------------------------------------
-- 5. DEAL_ROOMS
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS nowgo_brain.deal_rooms (
    id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id            uuid NOT NULL REFERENCES nowgo_brain.tenants(id) ON DELETE CASCADE,
    opportunity_id       uuid NOT NULL REFERENCES nowgo_brain.opportunities(id) ON DELETE RESTRICT,
    owner_user_id        uuid NOT NULL REFERENCES nowgo_brain.users(id) ON DELETE RESTRICT,
    status               text NOT NULL CHECK (status IN ('active','resolved','lost','paused')),
    promoted_at          timestamptz NOT NULL DEFAULT now(),
    score_at_promotion   numeric(5,2) NOT NULL,
    resolved_at          timestamptz NULL,
    resolution_notes     text NULL,
    created_at           timestamptz NOT NULL DEFAULT now(),
    updated_at           timestamptz NOT NULL DEFAULT now()
);

-- Garantia em nível de banco: uma única oportunidade não pode ter dois deal rooms ativos
CREATE UNIQUE INDEX IF NOT EXISTS uq_deal_rooms_active_opportunity
    ON nowgo_brain.deal_rooms (tenant_id, opportunity_id)
    WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_deal_rooms_tenant_status
    ON nowgo_brain.deal_rooms (tenant_id, status);

ALTER TABLE nowgo_brain.deal_rooms ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS deal_rooms_tenant_isolation ON nowgo_brain.deal_rooms;
CREATE POLICY deal_rooms_tenant_isolation ON nowgo_brain.deal_rooms
    FOR ALL TO authenticated
    USING (tenant_id::text = current_setting('app.current_tenant_id', true))
    WITH CHECK (tenant_id::text = current_setting('app.current_tenant_id', true));

CREATE OR REPLACE TRIGGER deal_rooms_set_updated_at
    BEFORE UPDATE ON nowgo_brain.deal_rooms
    FOR EACH ROW EXECUTE FUNCTION nowgo_brain.set_updated_at();

-- ---------------------------------------------------------------------
-- 6. DEAL_ROOM_AUDIT (imutável)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS nowgo_brain.deal_room_audit (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       uuid NOT NULL REFERENCES nowgo_brain.tenants(id) ON DELETE CASCADE,
    deal_room_id    uuid NOT NULL REFERENCES nowgo_brain.deal_rooms(id) ON DELETE CASCADE,
    from_status     text NULL,
    to_status       text NOT NULL,
    score_snapshot  numeric(5,2) NOT NULL,
    triggered_by    uuid NOT NULL REFERENCES nowgo_brain.users(id) ON DELETE RESTRICT,
    reason          text NULL CHECK (reason IN ('manual','auto-promote','auto-demote')),
    created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_deal_room_audit_tenant
    ON nowgo_brain.deal_room_audit(tenant_id, deal_room_id);

ALTER TABLE nowgo_brain.deal_room_audit ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS deal_room_audit_tenant_isolation ON nowgo_brain.deal_room_audit;
CREATE POLICY deal_room_audit_tenant_isolation ON nowgo_brain.deal_room_audit
    FOR SELECT TO authenticated
    USING (tenant_id::text = current_setting('app.current_tenant_id', true));
-- Audit é append-only via service_role; sem policy de INSERT/UPDATE/DELETE para authenticated

-- ---------------------------------------------------------------------
-- 7. EXTENSÃO de opportunities — 6 vetores + score computado
-- ---------------------------------------------------------------------
ALTER TABLE nowgo_brain.opportunities
    ADD COLUMN IF NOT EXISTS urgency_score          smallint NULL CHECK (urgency_score          BETWEEN 0 AND 100),
    ADD COLUMN IF NOT EXISTS financial_impact_score smallint NULL CHECK (financial_impact_score BETWEEN 0 AND 100),
    ADD COLUMN IF NOT EXISTS strategic_impact_score smallint NULL CHECK (strategic_impact_score BETWEEN 0 AND 100),
    ADD COLUMN IF NOT EXISTS risk_score             smallint NULL CHECK (risk_score             BETWEEN 0 AND 100),
    ADD COLUMN IF NOT EXISTS dependency_score       smallint NULL CHECK (dependency_score       BETWEEN 0 AND 100),
    ADD COLUMN IF NOT EXISTS probability_score      smallint NULL CHECK (probability_score      BETWEEN 0 AND 100),
    ADD COLUMN IF NOT EXISTS computed_score         numeric(5,2) NULL,
    ADD COLUMN IF NOT EXISTS priority_category      text NULL CHECK (priority_category IN ('foco_imediato','radar_estrategico','backlog'));

-- ---------------------------------------------------------------------
-- 8. Trigger automático: recalcular score quando vetores mudam
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION nowgo_brain.recompute_opportunity_score()
RETURNS trigger
LANGUAGE plpgsql AS $$
DECLARE
    s numeric(6,2);
BEGIN
    IF NEW.urgency_score IS NOT NULL
       AND NEW.financial_impact_score IS NOT NULL
       AND NEW.strategic_impact_score IS NOT NULL
       AND NEW.risk_score IS NOT NULL
       AND NEW.dependency_score IS NOT NULL
       AND NEW.probability_score IS NOT NULL THEN
        s := (NEW.urgency_score          * 0.20)
           + (NEW.financial_impact_score * 0.25)
           + (NEW.strategic_impact_score * 0.25)
           + (NEW.risk_score             * 0.10)
           + (NEW.dependency_score       * 0.10)
           + (NEW.probability_score      * 0.10);
        NEW.computed_score    := round(s, 2);
        NEW.priority_category := CASE
            WHEN s > 85 THEN 'foco_imediato'
            WHEN s >= 60 THEN 'radar_estrategico'
            ELSE 'backlog'
        END;
    ELSE
        NEW.computed_score    := NULL;
        NEW.priority_category := NULL;
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS opportunities_compute_score ON nowgo_brain.opportunities;
CREATE TRIGGER opportunities_compute_score
    BEFORE INSERT OR UPDATE OF urgency_score, financial_impact_score, strategic_impact_score,
                                 risk_score, dependency_score, probability_score
    ON nowgo_brain.opportunities
    FOR EACH ROW EXECUTE FUNCTION nowgo_brain.recompute_opportunity_score();

-- ---------------------------------------------------------------------
-- 9. Validações finais
-- ---------------------------------------------------------------------
-- Conta total de tabelas no schema (deve ser 18 = 12 da F46 + 6 novas)
DO $$
DECLARE
    c int;
BEGIN
    SELECT count(*) INTO c
    FROM information_schema.tables
    WHERE table_schema = 'nowgo_brain' AND table_type = 'BASE TABLE';
    IF c <> 18 THEN
        RAISE WARNING 'F47 0005: esperado 18 tabelas, encontrado %', c;
    ELSE
        RAISE NOTICE 'F47 0005: 18 tabelas confirmadas no schema nowgo_brain';
    END IF;
END $$;

-- =====================================================================
-- FIM DA MIGRAÇÃO 0005
-- =====================================================================
