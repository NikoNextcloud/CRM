create extension if not exists pgcrypto;

create table if not exists customers (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  last_name text not null,
  company text,
  phone text,
  email text,
  address text,
  city text,
  viber text,
  whatsapp text,
  vat_number text,
  notes text,
  created_at timestamptz not null default now(),
  last_contact_at timestamptz
);

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text,
  base_price numeric(12, 2) default 0,
  base_cost numeric(12, 2) default 0,
  created_at timestamptz not null default now()
);

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  order_number text unique not null,
  customer_id uuid references customers(id) on delete cascade,
  product text,
  status text not null default 'New',
  description text,
  quantity integer not null default 1,
  price numeric(12, 2) not null default 0,
  cost numeric(12, 2) not null default 0,
  profit numeric(12, 2) generated always as (price - cost) stored,
  created_at timestamptz not null default now(),
  deadline_at timestamptz,
  notes text
);

create table if not exists order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders(id) on delete cascade,
  product_id uuid references products(id) on delete set null,
  name text not null,
  quantity integer not null default 1,
  price numeric(12, 2) not null default 0,
  cost numeric(12, 2) not null default 0
);

create table if not exists files (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references customers(id) on delete cascade,
  order_id uuid references orders(id) on delete cascade,
  file_name text not null,
  file_type text not null,
  storage_path text not null,
  size_bytes bigint default 0,
  created_at timestamptz not null default now()
);

create table if not exists photos (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references customers(id) on delete cascade,
  order_id uuid references orders(id) on delete cascade,
  title text,
  storage_path text not null,
  created_at timestamptz not null default now()
);

create table if not exists notes (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references customers(id) on delete cascade,
  order_id uuid references orders(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

create table if not exists calls (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references customers(id) on delete cascade,
  title text not null,
  notes text,
  called_at timestamptz not null default now()
);

create table if not exists timeline (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references customers(id) on delete cascade,
  order_id uuid references orders(id) on delete set null,
  event_type text not null,
  title text not null,
  description text,
  event_at timestamptz not null default now()
);

create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references customers(id) on delete cascade,
  order_id uuid references orders(id) on delete cascade,
  title text not null,
  description text,
  due_at timestamptz,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists calendar_notes (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references customers(id) on delete set null,
  order_id uuid references orders(id) on delete set null,
  title text not null,
  body text,
  start_date date not null,
  end_date date not null,
  created_at timestamptz not null default now()
);

create table if not exists tasks (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references customers(id) on delete cascade,
  order_id uuid references orders(id) on delete cascade,
  title text not null,
  status text not null default 'Open',
  due_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references customers(id) on delete cascade,
  order_id uuid references orders(id) on delete cascade,
  amount numeric(12, 2) not null,
  method text,
  paid_at timestamptz not null default now()
);

create table if not exists ai_recommendations (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references customers(id) on delete cascade,
  order_id uuid references orders(id) on delete cascade,
  recommendation text not null,
  score numeric(5, 2),
  created_at timestamptz not null default now()
);

create table if not exists activity_logs (
  id uuid primary key default gen_random_uuid(),
  action text not null,
  entity_type text,
  entity_id uuid,
  created_at timestamptz not null default now()
);

create table if not exists settings (
  id uuid primary key default gen_random_uuid(),
  company_name text,
  logo_path text,
  phone text,
  email text,
  website text,
  address text,
  currency text not null default 'BGN',
  vat_percent numeric(5, 2) not null default 20,
  backup_settings jsonb default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create index if not exists idx_customers_company on customers(company);
create index if not exists idx_orders_customer_id on orders(customer_id);
create index if not exists idx_orders_status on orders(status);
create index if not exists idx_timeline_customer_id on timeline(customer_id);
create index if not exists idx_files_order_id on files(order_id);

alter table orders add column if not exists product text;
alter table orders add column if not exists tracking_number text;
alter table customers add column if not exists viber text;
alter table customers add column if not exists whatsapp text;
create index if not exists idx_calendar_notes_start_date on calendar_notes(start_date);
create index if not exists idx_calendar_notes_customer_id on calendar_notes(customer_id);

insert into storage.buckets (id, name, public)
values ('order-files', 'order-files', false)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('product-photos', 'product-photos', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('company-assets', 'company-assets', true)
on conflict (id) do nothing;

insert into settings (company_name, currency, vat_percent)
values ('PrintPilot Studio', 'BGN', 20)
on conflict do nothing;
