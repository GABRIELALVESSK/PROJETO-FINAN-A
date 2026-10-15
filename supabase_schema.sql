-- ==============================================================================
-- BÚSSOLA FINANCEIRA - SUPABASE SCHEMA COMPLETO
-- Execute este script no SQL Editor do seu projeto Supabase:
-- https://supabase.com/dashboard/project/xrwmeldjhtqgquyddkkf/sql
-- ==============================================================================

-- 1. Habilitar extensões
create extension if not exists "uuid-ossp";

-- 2. Tabela de Perfis de Usuário
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  email text,
  phone text,
  avatar_url text,
  plan text default 'pro', -- 'free', 'pro', 'lifetime'
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 3. Tabela de Roles / Papéis (Administradores)
create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  role text not null check (role in ('admin', 'user', 'moderator')),
  created_at timestamptz default now(),
  unique (user_id, role)
);

-- 4. Tabela de Contas e Carteiras (Nubank, Itaú, Dinheiro, etc.)
create table if not exists public.wallet_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  balance numeric(12,2) default 0.00,
  type text default 'checking', -- 'checking', 'savings', 'cash', 'investment'
  color text,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- 5. Tabela de Transações (Receitas e Despesas)
create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  account_id uuid references public.wallet_accounts on delete set null,
  description text not null,
  amount numeric(12,2) not null,
  type text not null check (type in ('income', 'expense', 'transfer')),
  category text not null,
  date date not null default current_date,
  is_recurring boolean default false,
  recurrence_period text,
  payment_method text,
  notes text,
  created_at timestamptz default now()
);

-- 6. Tabela de Orçamentos por Categoria
create table if not exists public.category_budgets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  category text not null,
  budget_amount numeric(12,2) not null,
  month text, -- YYYY-MM
  created_at timestamptz default now()
);

-- 7. Tabela de Cartões de Crédito
create table if not exists public.credit_cards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  limit_amount numeric(12,2) not null,
  closing_day int not null check (closing_day between 1 and 31),
  due_day int not null check (due_day between 1 and 31),
  color text default '#10b981',
  brand text default 'Mastercard',
  is_active boolean default true,
  created_at timestamptz default now()
);

-- 8. Tabela de Despesas no Cartão de Crédito
create table if not exists public.credit_card_expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  card_id uuid references public.credit_cards on delete cascade not null,
  description text not null,
  amount numeric(12,2) not null,
  category text not null,
  installments int default 1,
  current_installment int default 1,
  date date not null default current_date,
  created_at timestamptz default now()
);

-- 9. Tabela de Dívidas e Parcelamentos
create table if not exists public.debts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  description text not null,
  total_amount numeric(12,2) not null,
  remaining_amount numeric(12,2) not null,
  interest_rate numeric(5,2) default 0.00,
  due_date date,
  creditor text,
  status text default 'pending', -- 'pending', 'paid', 'negotiating'
  created_at timestamptz default now()
);

create table if not exists public.debt_installments (
  id uuid primary key default gen_random_uuid(),
  debt_id uuid references public.debts on delete cascade not null,
  installment_number int not null,
  amount numeric(12,2) not null,
  due_date date not null,
  is_paid boolean default false,
  paid_at timestamptz
);

-- 10. Tabela de Investimentos
create table if not exists public.investments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  type text not null, -- 'cdb', 'tesouro', 'acoes', 'fii', 'cripto', 'outro'
  amount_invested numeric(12,2) not null,
  current_value numeric(12,2) not null,
  return_rate numeric(6,2),
  due_date date,
  institution text,
  created_at timestamptz default now()
);

-- 11. Categorias Personalizadas do Usuário
create table if not exists public.user_custom_categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  icon text,
  color text,
  type text not null check (type in ('income', 'expense')),
  created_at timestamptz default now()
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) - Permissões Seguras
-- ==============================================================================
alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.wallet_accounts enable row level security;
alter table public.transactions enable row level security;
alter table public.category_budgets enable row level security;
alter table public.credit_cards enable row level security;
alter table public.credit_card_expenses enable row level security;
alter table public.debts enable row level security;
alter table public.debt_installments enable row level security;
alter table public.investments enable row level security;
alter table public.user_custom_categories enable row level security;

-- Políticas de Acesso: Cada usuário acessa seus próprios dados
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = id);

create policy "Users can view their own roles" on public.user_roles for select using (auth.uid() = user_id);

create policy "Users manage own transactions" on public.transactions for all using (auth.uid() = user_id);
create policy "Users manage own wallets" on public.wallet_accounts for all using (auth.uid() = user_id);
create policy "Users manage own budgets" on public.category_budgets for all using (auth.uid() = user_id);
create policy "Users manage own credit cards" on public.credit_cards for all using (auth.uid() = user_id);
create policy "Users manage own card expenses" on public.credit_card_expenses for all using (auth.uid() = user_id);
create policy "Users manage own debts" on public.debts for all using (auth.uid() = user_id);
create policy "Users manage own investments" on public.investments for all using (auth.uid() = user_id);
create policy "Users manage own custom categories" on public.user_custom_categories for all using (auth.uid() = user_id);

-- ==============================================================================
-- TRIGGER AUTOMÁTICO: Criar Profile ao criar novo usuário no Auth
-- ==============================================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)));
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ==============================================================================
-- TORNAR AUTOMATICAMENTE ceyiwom813@aahzz.com ADMIN:
-- ==============================================================================
-- 1. Se o usuário já existir no auth.users:
insert into public.user_roles (user_id, role)
select id, 'admin'
from auth.users
where email = 'ceyiwom813@aahzz.com'
on conflict (user_id, role) do nothing;

-- 2. Trigger para garantir que assim que ceyiwom813@aahzz.com for criado, vire admin:
create or replace function public.auto_assign_admin_role()
returns trigger as $$
begin
  if new.email = 'ceyiwom813@aahzz.com' then
    insert into public.user_roles (user_id, role)
    values (new.id, 'admin')
    on conflict (user_id, role) do nothing;
  end if;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_admin_user_created on auth.users;
create trigger on_admin_user_created
  after insert on auth.users
  for each row execute procedure public.auto_assign_admin_role();

