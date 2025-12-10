-- Enable Extensions
create extension if not exists "uuid-ossp";

-- 1. Plans Table (Ensure structure)
create table if not exists store_plans (
  id uuid default uuid_generate_v4() primary key,
  code text unique not null,
  name text not null,
  description text,
  price_monthly numeric default 0,
  price_yearly numeric default 0,
  features jsonb default '{}'::jsonb,
  is_active boolean default true,
  created_at timestamp with time zone default now()
);

-- 2. Tenants Table Updates
do $$ 
begin
    alter table tenants add column if not exists plan_id uuid references store_plans(id);
    alter table tenants add column if not exists plan_code text;
    alter table tenants add column if not exists status text default 'active';
    alter table tenants add column if not exists trial_end timestamp with time zone;
    alter table tenants add column if not exists current_period_start timestamp with time zone default now();
    alter table tenants add column if not exists current_period_end timestamp with time zone default (now() + interval '30 days');
    alter table tenants add column if not exists last_payment_at timestamp with time zone;
    alter table tenants add column if not exists next_payment_due_at timestamp with time zone;
    alter table tenants add column if not exists blocked_reason text;
    alter table tenants add column if not exists responsible_name text;
    alter table tenants add column if not exists responsible_email text;
    alter table tenants add column if not exists active_users numeric default 0;
    alter table tenants add column if not exists risk_score numeric default 0;
exception
    when others then null;
end $$;

-- 3. Invoices Table
create table if not exists invoices (
  id uuid default uuid_generate_v4() primary key,
  tenant_id uuid references tenants(id) not null,
  plan_id uuid references store_plans(id),
  amount numeric not null,
  currency text default 'BRL',
  status text default 'pending', -- pending, paid, failed, canceled
  due_date timestamp with time zone,
  paid_at timestamp with time zone,
  external_id text,
  created_at timestamp with time zone default now()
);

-- 4. Payments Table
create table if not exists payments (
  id uuid default uuid_generate_v4() primary key,
  tenant_id uuid references tenants(id) not null,
  invoice_id uuid references invoices(id),
  amount numeric not null,
  method text, -- pix, cartao_credito
  status text, -- pending, confirmed, failed
  external_id text,
  created_at timestamp with time zone default now(),
  confirmed_at timestamp with time zone
);

-- 5. Support Tickets Table
create table if not exists support_tickets (
  id uuid default uuid_generate_v4() primary key,
  tenant_id uuid references tenants(id),
  origin text, -- billing_block, panel_support
  subject text,
  message text,
  contact_name text,
  contact_email text,
  status text default 'open',
  metadata jsonb,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- RLS Policies (Basic)
alter table invoices enable row level security;
create policy "Enable read/write for all" on invoices for all using (true);

alter table payments enable row level security;
create policy "Enable read/write for all" on payments for all using (true);

alter table support_tickets enable row level security;
create policy "Enable read/write for all" on support_tickets for all using (true);

alter table tenants enable row level security;
create policy "Enable public read for tenants" on tenants for select using (true);
