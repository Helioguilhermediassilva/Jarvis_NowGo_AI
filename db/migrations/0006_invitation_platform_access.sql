-- =====================================================================
-- Migração 0006: permissão explícita de acesso à Plataforma
-- =====================================================================
-- A permissão acompanha o convite e o vínculo aceito. O default TRUE
-- preserva o acesso dos convites e membros já existentes.

SET search_path TO nowgo_brain, public;

ALTER TABLE nowgo_brain.invitations
  ADD COLUMN IF NOT EXISTS platform_access boolean NOT NULL DEFAULT true;

ALTER TABLE nowgo_brain.tenant_members
  ADD COLUMN IF NOT EXISTS platform_access boolean NOT NULL DEFAULT true;

COMMENT ON COLUMN nowgo_brain.invitations.platform_access IS
  'Permite ao convidado acessar a Plataforma NowGo/Xavier após aceitar o convite.';

COMMENT ON COLUMN nowgo_brain.tenant_members.platform_access IS
  'Permite ao membro acessar a Plataforma NowGo/Xavier.';
