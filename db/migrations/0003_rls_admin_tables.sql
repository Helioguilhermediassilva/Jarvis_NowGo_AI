-- ============================================================
-- NowGo Brain — Migração 3: Defesa em profundidade nas tabelas administrativas
-- Ativa RLS em tenants, users, tenant_members com policy deny-all
-- (a SECRET key / service_role bypassa RLS por design — então o backend
-- continua funcionando normalmente; clientes anon ficam bloqueados.)
-- ============================================================

ALTER TABLE nowgo_brain.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE nowgo_brain.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE nowgo_brain.tenant_members ENABLE ROW LEVEL SECURITY;

-- Por padrão, RLS sem policy = nega tudo. Mas criamos policies explícitas
-- nomeadas para deixar a intenção clara em auditorias futuras.

DROP POLICY IF EXISTS deny_all_anon ON nowgo_brain.tenants;
CREATE POLICY deny_all_anon ON nowgo_brain.tenants
  FOR ALL TO anon, authenticated
  USING (false)
  WITH CHECK (false);

DROP POLICY IF EXISTS deny_all_anon ON nowgo_brain.users;
CREATE POLICY deny_all_anon ON nowgo_brain.users
  FOR ALL TO anon, authenticated
  USING (false)
  WITH CHECK (false);

DROP POLICY IF EXISTS deny_all_anon ON nowgo_brain.tenant_members;
CREATE POLICY deny_all_anon ON nowgo_brain.tenant_members
  FOR ALL TO anon, authenticated
  USING (false)
  WITH CHECK (false);
