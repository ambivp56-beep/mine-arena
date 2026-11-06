
-- Mine Arena 1.0 - Medical registrations

create extension if not exists "pgcrypto";

-- Participant registrations
create table if not exists public.medical_registrations (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  team_name text not null,
  contact_number text not null,
  emergency_contact_name text not null,
  emergency_contact_number text not null,
  emergency_contact_relationship text not null,
  has_medical_condition boolean not null,
  medical_condition_details text,
  taking_medication boolean not null,
  medication_support_details text,
  consent boolean not null check (consent = true),
  created_at timestamptz not null default now()
);

-- Prevent duplicate participant phone numbers
create unique index if not exists medical_registrations_contact_uidx
on public.medical_registrations (contact_number);

create index if not exists medical_registrations_created_idx
on public.medical_registrations (created_at desc);

-- Authorized administrators
create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

-- Secure admin-check function
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.admin_users
    where user_id = (select auth.uid())
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

-- Enable Row Level Security
alter table public.medical_registrations enable row level security;
alter table public.admin_users enable row level security;

-- Remove previous policies if present
drop policy if exists "admins read" on public.medical_registrations;
drop policy if exists "admins update" on public.medical_registrations;
drop policy if exists "admins delete" on public.medical_registrations;
drop policy if exists "read own admin row" on public.admin_users;

-- Only administrators can read registrations
create policy "admins read"
on public.medical_registrations
for select
to authenticated
using (public.is_admin());

-- Only administrators can update registrations
create policy "admins update"
on public.medical_registrations
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- Only administrators can delete registrations
create policy "admins delete"
on public.medical_registrations
for delete
to authenticated
using (public.is_admin());

-- Administrators can read their own membership row
create policy "read own admin row"
on public.admin_users
for select
to authenticated
using (user_id = (select auth.uid()));

-- Grant only the operations needed by the application
revoke all on public.medical_registrations from anon;
revoke all on public.admin_users from anon;

grant select, update, delete
on public.medical_registrations to authenticated;

grant select
on public.admin_users to authenticated;
