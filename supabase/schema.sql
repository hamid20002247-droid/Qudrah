-- قُدرة schema (run in Supabase SQL editor)
-- Safe to re-run: uses IF NOT EXISTS / DROP POLICY IF EXISTS patterns where needed.

create extension if not exists "pgcrypto";

-- ─── Existing MVP tables ───────────────────────────────────────────

create table if not exists notify_leads (
  id uuid primary key default gen_random_uuid(),
  contact text not null,
  contact_type text,
  device_id text,
  test_date date,
  user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz default now()
);

create table if not exists questions_audit (
  id text primary key,
  sub_pattern text,
  source text,
  review_status text check (review_status in ('draft', 'approved')),
  reviewed_by text,
  reviewed_at timestamptz,
  updated_at timestamptz default now()
);

-- ─── Profiles (1:1 with auth.users) ────────────────────────────────

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  avatar_url text,
  provider text,
  test_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists profiles_email_idx on profiles (email);

-- ─── Cloud progress (mirrors local Zustand shape) ──────────────────

create table if not exists user_progress (
  user_id uuid primary key references auth.users(id) on delete cascade,
  device_id text,
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- ─── Mock / exam attempts ──────────────────────────────────────────

create table if not exists attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null default 'mock'
    check (kind in ('mock', 'skill_final', 'drill')),
  skill_id text,
  score integer not null,
  total integer not null,
  total_time_ms integer,
  avg_time_ms integer,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists attempts_user_created_idx
  on attempts (user_id, created_at desc);

-- ─── Auto-create profile on signup ─────────────────────────────────

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name, avatar_url, provider)
  values (
    new.id,
    new.email,
    coalesce(
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'name',
      split_part(new.email, '@', 1)
    ),
    new.raw_user_meta_data->>'avatar_url',
    coalesce(new.raw_app_meta_data->>'provider', 'email')
  )
  on conflict (id) do update set
    email = excluded.email,
    display_name = coalesce(profiles.display_name, excluded.display_name),
    avatar_url = coalesce(profiles.avatar_url, excluded.avatar_url),
    provider = excluded.provider,
    updated_at = now();
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Keep profile email in sync
create or replace function public.handle_user_email_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.profiles
  set email = new.email, updated_at = now()
  where id = new.id;
  return new;
end;
$$;

drop trigger if exists on_auth_user_updated on auth.users;
create trigger on_auth_user_updated
  after update of email on auth.users
  for each row execute procedure public.handle_user_email_update();

-- ─── RLS ───────────────────────────────────────────────────────────

alter table notify_leads enable row level security;
alter table questions_audit enable row level security;
alter table profiles enable row level security;
alter table user_progress enable row level security;
alter table attempts enable row level security;

-- notify_leads
drop policy if exists "allow insert notify" on notify_leads;
create policy "allow insert notify" on notify_leads
  for insert to anon, authenticated
  with check (true);

drop policy if exists "deny select notify" on notify_leads;
create policy "deny select notify anon" on notify_leads
  for select to anon
  using (false);

drop policy if exists "users read own notify" on notify_leads;
create policy "users read own notify" on notify_leads
  for select to authenticated
  using (auth.uid() = user_id);

-- profiles
drop policy if exists "profiles select own" on profiles;
create policy "profiles select own" on profiles
  for select to authenticated
  using (auth.uid() = id);

drop policy if exists "profiles update own" on profiles;
create policy "profiles update own" on profiles
  for update to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- user_progress
drop policy if exists "progress select own" on user_progress;
create policy "progress select own" on user_progress
  for select to authenticated
  using (auth.uid() = user_id);

drop policy if exists "progress upsert own" on user_progress;
create policy "progress insert own" on user_progress
  for insert to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "progress update own" on user_progress;
create policy "progress update own" on user_progress
  for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- attempts
drop policy if exists "attempts select own" on attempts;
create policy "attempts select own" on attempts
  for select to authenticated
  using (auth.uid() = user_id);

drop policy if exists "attempts insert own" on attempts;
create policy "attempts insert own" on attempts
  for insert to authenticated
  with check (auth.uid() = user_id);
