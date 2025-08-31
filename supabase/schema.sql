-- UUID extension
create extension if not exists "uuid-ossp";

-- Users profile (maps to auth.users via trigger)
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  active_org_id uuid
);

-- Orgs
create table if not exists orgs (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  subscription_status text default 'trialing',
  created_at timestamptz default now()
);

-- Org membership
create table if not exists org_members (
  org_id uuid references orgs(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  role text default 'member',
  primary key (org_id, user_id)
);

-- Subscriptions (link to Stripe)
create table if not exists subscriptions (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid references orgs(id) on delete cascade,
  stripe_customer_id text,
  stripe_subscription_id text,
  tier text default 'basic',
  status text default 'trialing',
  created_at timestamptz default now()
);

-- Addresses
create table if not exists addresses (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid references orgs(id) on delete cascade,
  line1 text,
  city text,
  state text,
  postcode text,
  lat double precision,
  lng double precision
);

-- Jobs
create table if not exists jobs (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid references orgs(id) on delete cascade,
  title text not null,
  status text default 'scheduled', -- scheduled|in_progress|done|cancelled
  scheduled_for timestamptz,
  address_id uuid references addresses(id) on delete set null,
  created_at timestamptz default now()
);

-- Create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email) values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Simple helper: create org + join current user
create or replace function public.create_org_and_join(p_name text)
returns uuid
language plpgsql security definer
as $$
declare
  v_org uuid;
  v_uid uuid = auth.uid();
begin
  insert into orgs (name) values (p_name) returning id into v_org;
  insert into org_members (org_id, user_id, role) values (v_org, v_uid, 'owner');
  update profiles set active_org_id = v_org where id = v_uid;
  return v_org;
end;
$$;

-- RLS
alter table profiles enable row level security;
alter table orgs enable row level security;
alter table org_members enable row level security;
alter table subscriptions enable row level security;
alter table addresses enable row level security;
alter table jobs enable row level security;

-- Policies
create policy "profiles are self" on profiles
  for select using (id = auth.uid())
  with check (id = auth.uid());

create policy "orgs by membership" on orgs
  for select using (exists (select 1 from org_members m where m.org_id = id and m.user_id = auth.uid()));

create policy "org_members by self" on org_members
  for select using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "addresses by org membership" on addresses
  for select using (exists (select 1 from org_members m where m.org_id = org_id and m.user_id = auth.uid()))
  with check (exists (select 1 from org_members m where m.org_id = org_id and m.user_id = auth.uid()));

create policy "jobs by org membership" on jobs
  for select using (exists (select 1 from org_members m where m.org_id = org_id and m.user_id = auth.uid()))
  with check (exists (select 1 from org_members m where m.org_id = org_id and m.user_id = auth.uid()));
