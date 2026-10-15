-- Colunas do perfil usadas no onboarding
alter table public.profiles add column if not exists user_type text;
alter table public.profiles add column if not exists account_type text;
alter table public.profiles add column if not exists country text;
alter table public.profiles add column if not exists language text;
alter table public.profiles add column if not exists currency text;

-- Colunas extras de transações usadas pelo app
alter table public.transactions add column if not exists recurrence_type text;
alter table public.transactions add column if not exists recurrence_end date;
alter table public.transactions add column if not exists is_paid boolean default false;
alter table public.transactions add column if not exists member_id uuid;
alter table public.transactions add column if not exists wallet_account_id uuid;
alter table public.transactions add column if not exists paid_at timestamptz;
alter table public.transactions add column if not exists installment_number int;
alter table public.transactions add column if not exists installment_total int;
alter table public.transactions add column if not exists updated_at timestamptz default now();

-- Integrantes de conta conjunta
create table if not exists public.account_members (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  email text,
  phone text,
  income_amount numeric,
  income_day int,
  work_type text,
  created_at timestamptz default now()
);
alter table public.account_members enable row level security;
drop policy if exists account_members_own on public.account_members;
create policy account_members_own on public.account_members
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

notify pgrst, 'reload schema';
