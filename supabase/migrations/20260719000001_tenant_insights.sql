-- ============================================================================
-- Alexanda Martinz Inc. — Tenants and Insights Schema
-- Multi-tenant B2B SaaS for Uganda Industrial Park
-- ============================================================================

-- 1. Tenants table
create table if not exists public.tenants (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  plan text not null check (plan in ('free', 'pro', 'enterprise')),
  status text not null default 'active',
  api_key_hash text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Insights table
create table if not exists public.insights (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  month date not null,
  gdp_growth numeric,
  inflation numeric,
  trade_balance numeric,
  crop_health numeric,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table public.tenants enable row level security;
alter table public.insights enable row level security;

-- ============================================================================
-- Tenant Policies
-- ============================================================================

-- Tenants can view their own tenant record
drop policy if exists "Tenants can view own tenant record" on public.tenants;
create policy "Tenants can view own tenant record"
  on public.tenants for select
  using (auth.role() = 'authenticated' and id = current_setting('app.current_tenant_id')::uuid);

-- Tenants can update their own tenant record
drop policy if exists "Tenants can update own tenant record" on public.tenants;
create policy "Tenants can update own tenant record"
  on public.tenants for update
  using (auth.role() = 'authenticated' and id = current_setting('app.current_tenant_id')::uuid);

-- Tenants can insert insights for their own tenant
drop policy if exists "Tenants can insert own insights" on public.insights;
create policy "Tenants can insert own insights"
  on public.insights for insert
  with check (auth.role() = 'authenticated' and tenant_id = current_setting('app.current_tenant_id')::uuid);

-- Tenants can select insights for their own tenant
drop policy if exists "Tenants can select own insights" on public.insights;
create policy "Tenants can select own insights"
  on public.insights for select
  using (auth.role() = 'authenticated' and tenant_id = current_setting('app.current_tenant_id')::uuid);

-- Tenants can update insights for their own tenant
drop policy if exists "Tenants can update own insights" on public.insights;
create policy "Tenants can update own insights"
  on public.insights for update
  using (auth.role() = 'authenticated' and tenant_id = current_setting('app.current_tenant_id')::uuid);

-- Tenants can delete insights for their own tenant
drop policy if exists "Tenants can delete own insights" on public.insights;
create policy "Tenants can delete own insights"
  on public.insights for delete
  using (auth.role() = 'authenticated' and tenant_id = current_setting('app.current_tenant_id')::uuid);

-- ============================================================================
-- Realtime Publication
-- ============================================================================

alter publication supabase_realtime add table public.tenants;
alter publication supabase_realtime add table public.insights;

-- ============================================================================
-- Indexes for Performance
-- ============================================================================

create index if not exists idx_insights_tenant_month on public.insights (tenant_id, month desc);
create index if not exists idx_tenants_plan on public.tenants (plan);
create index if not exists idx_tenants_status on public.tenants (status);