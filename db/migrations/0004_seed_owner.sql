-- ============================================================
-- NowGo Brain — Migração 4: Seed inicial
-- Cria o tenant "nowgo-ai" e o usuário superadmin Hélio Guilherme,
-- vinculando-o como owner do tenant.
-- Idempotente: pode ser executada múltiplas vezes sem efeitos colaterais.
-- ============================================================

-- 1) Tenant da NowGo AI (espaço de trabalho do próprio time)
INSERT INTO nowgo_brain.tenants (slug, name, plan, settings)
VALUES (
  'nowgo-ai',
  'NowGo AI',
  'enterprise',
  jsonb_build_object(
    'is_internal', true,
    'description', 'Tenant interno do time NowGo AI'
  )
)
ON CONFLICT (slug) DO NOTHING;

-- 2) Usuário superadmin
INSERT INTO nowgo_brain.users (email, name, role)
VALUES (
  'helio@nowgo.com.br',
  'Hélio Guilherme',
  'superadmin'
)
ON CONFLICT (email) DO UPDATE SET role = EXCLUDED.role, name = EXCLUDED.name;

-- 3) Vincula o user ao tenant como owner
INSERT INTO nowgo_brain.tenant_members (tenant_id, user_id, role)
SELECT
  (SELECT id FROM nowgo_brain.tenants WHERE slug = 'nowgo-ai'),
  (SELECT id FROM nowgo_brain.users WHERE email = 'helio@nowgo.com.br'),
  'owner'
ON CONFLICT (tenant_id, user_id) DO UPDATE SET role = 'owner';

-- 4) Marca o created_by_user_id do tenant
UPDATE nowgo_brain.tenants
SET created_by_user_id = (SELECT id FROM nowgo_brain.users WHERE email = 'helio@nowgo.com.br')
WHERE slug = 'nowgo-ai' AND created_by_user_id IS NULL;

-- 5) Audit log da criação
INSERT INTO nowgo_brain.audit_log (tenant_id, user_id, action, entity_type, entity_id, payload)
SELECT
  t.id,
  u.id,
  'tenant.bootstrap',
  'tenant',
  t.id::text,
  jsonb_build_object('source', 'migration_0004_seed_owner')
FROM nowgo_brain.tenants t
JOIN nowgo_brain.users u ON u.email = 'helio@nowgo.com.br'
WHERE t.slug = 'nowgo-ai'
  AND NOT EXISTS (
    SELECT 1 FROM nowgo_brain.audit_log
    WHERE entity_type = 'tenant' AND entity_id = t.id::text AND action = 'tenant.bootstrap'
  );
