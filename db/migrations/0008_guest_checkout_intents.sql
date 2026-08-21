-- 0008_guest_checkout_intents.sql
-- Intenções públicas de Checkout antes da criação da conta.
-- Acesso somente por server-side service role; RLS permanece deny-all.

create table if not exists nowgo_brain.guest_checkout_intents (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  offer_code text not null,
  status text not null default 'pending',
  claim_token_hash text not null unique,
  stripe_checkout_session_id text unique,
  stripe_customer_id text,
  tenant_id uuid references nowgo_brain.tenants(id) on delete set null,
  user_id uuid references nowgo_brain.users(id) on delete set null,
  claimed_at timestamptz,
  expires_at timestamptz not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_guest_checkout_email
  on nowgo_brain.guest_checkout_intents(email);
create index if not exists idx_guest_checkout_stripe_session
  on nowgo_brain.guest_checkout_intents(stripe_checkout_session_id);
create index if not exists idx_guest_checkout_status
  on nowgo_brain.guest_checkout_intents(status);

alter table nowgo_brain.guest_checkout_intents enable row level security;
drop policy if exists guest_checkout_intents_deny_all on nowgo_brain.guest_checkout_intents;
create policy guest_checkout_intents_deny_all
  on nowgo_brain.guest_checkout_intents
  for all
  using (false)
  with check (false);

grant select, insert, update, delete on nowgo_brain.guest_checkout_intents to service_role;
revoke all on nowgo_brain.guest_checkout_intents from anon, authenticated;
