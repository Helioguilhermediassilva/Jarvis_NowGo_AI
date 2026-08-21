-- 0009_social_identities.sql
-- Identidades OAuth sociais vinculadas a um usuário V2.
-- Acesso somente server-side via NOWGO_BRAIN_PG_URL; RLS permanece deny-all.

create table if not exists nowgo_brain.social_identities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references nowgo_brain.users(id) on delete cascade,
  provider text not null check (provider in ('google', 'github', 'linkedin')),
  provider_user_id text not null,
  email text not null,
  name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  constraint social_identities_provider_subject_uq unique (provider, provider_user_id)
);

create index if not exists idx_social_identities_user_provider
  on nowgo_brain.social_identities(user_id, provider);

alter table nowgo_brain.social_identities enable row level security;
drop policy if exists social_identities_deny_all on nowgo_brain.social_identities;
create policy social_identities_deny_all
  on nowgo_brain.social_identities
  for all
  using (false)
  with check (false);

grant select, insert, update, delete on nowgo_brain.social_identities to service_role;
revoke all on nowgo_brain.social_identities from anon, authenticated;
