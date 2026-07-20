-- ============================================================================
-- Alexanda Martinz Inc. — Core Schema
-- Multi-agent autonomous corporate hierarchy + real-time Holas Defender
-- ============================================================================

-- 1. users (Auth Profiles)
create type user_role as enum ('ngo', 'consultant', 'tenant', 'merchant', 'student', 'hobbyist', 'researcher');

create table if not exists public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  email text unique not null,
  full_name text,
  role user_role not null default 'hobbyist',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists users_role_idx on public.users (role);

-- 2. agent_system_state (global autonomous toggles)
create table if not exists public.agent_system_state (
  id integer primary key generated always as identity,
  ceo_auto_mode boolean not null default false,
  weekly_report_status text not null default 'pending'
    check (weekly_report_status in ('pending', 'sent')),
  last_report_date timestamp with time zone
);

insert into public.agent_system_state (ceo_auto_mode, weekly_report_status)
select false, 'pending' where not exists (select 1 from public.agent_system_state);

-- 3. departmental_tasks (autonomous worker queue)
create type task_status as enum ('pending', 'processing', 'completed', 'failed');

create table if not exists public.departmental_tasks (
  id uuid primary key default uuid_generate_v4(),
  department varchar not null
    check (department in ('ceo', 'coo', 'marketing', 'development', 'security')),
  title text not null,
  description text,
  input_data jsonb default '{}'::jsonb,
  output_result text,
  status task_status not null default 'pending',
  assigned_agent varchar,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists dept_tasks_status_idx on public.departmental_tasks (status);
create index if not exists dept_tasks_dept_idx on public.departmental_tasks (department);

-- 4. holas_security_logs (real-time intrusion prevention matrices)
create table if not exists public.holas_security_logs (
  id uuid primary key default uuid_generate_v4(),
  cv_anomaly_rate integer not null default 0,
  nlp_threat_index integer not null default 0,
  ml_deviance_delta integer not null default 0,
  cyber_intrusion_triggers integer not null default 0,
  geo_border_mismatch integer not null default 0,
  action_taken text,
  logged_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists holas_logs_ts_idx on public.holas_security_logs (logged_at desc);

-- 5. inventors_hub (research board submissions)
create table if not exists public.inventors_hub (
  id uuid primary key default uuid_generate_v4(),
  author_name text not null default 'Anonymous',
  idea_title text not null,
  idea_body text not null,
  feasibility_markdown text,
  reviewed_by varchar,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ============================================================================
-- Row Level Security
-- ============================================================================
alter table public.users enable row level security;
alter table public.agent_system_state enable row level security;
alter table public.departmental_tasks enable row level security;
alter table public.holas_security_logs enable row level security;
alter table public.inventors_hub enable row level security;

-- Public state + logs are readable by anyone (operator dashboards).
drop policy if exists "Read agent state" on public.agent_system_state;
create policy "Read agent state" on public.agent_system_state for select using (true);

drop policy if exists "Read tasks" on public.departmental_tasks;
create policy "Read tasks" on public.departmental_tasks for select using (true);

drop policy if exists "Read holas logs" on public.holas_security_logs;
create policy "Read holas logs" on public.holas_security_logs for select using (true);

drop policy if exists "Read inventors" on public.inventors_hub;
create policy "Read inventors" on public.inventors_hub for select using (true);

-- Authenticated writes for the backend service role / operators.
drop policy if exists "Write tasks" on public.departmental_tasks;
create policy "Write tasks" on public.departmental_tasks for insert with check (auth.role() = 'authenticated');

drop policy if exists "Write holas logs" on public.holas_security_logs;
create policy "Write holas logs" on public.holas_security_logs for insert with check (auth.role() = 'authenticated');

drop policy if exists "Write inventors" on public.inventors_hub;
create policy "Write inventors" on public.inventors_hub for insert with check (true);

drop policy if exists "Write agent state" on public.agent_system_state;
create policy "Write agent state" on public.agent_system_state for update using (auth.role() = 'authenticated');

-- ============================================================================
-- Realtime (so admin panels slide in sync)
-- ============================================================================
alter publication supabase_realtime add table public.holas_security_logs;
alter publication supabase_realtime add table public.departmental_tasks;
alter publication supabase_realtime add table public.agent_system_state;
alter publication supabase_realtime add table public.inventors_hub;
