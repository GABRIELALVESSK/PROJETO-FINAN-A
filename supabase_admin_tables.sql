create table if not exists public.admin_variable_costs (
  id uuid primary key default gen_random_uuid(),
  amount numeric not null,
  month int not null,
  year int not null,
  cost_type text not null default 'Outros',
  observation text,
  created_at timestamptz default now()
);
create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  endpoint text,
  created_at timestamptz default now()
);
create table if not exists public.push_notification_log (
  id uuid primary key default gen_random_uuid(),
  campaign_key text,
  user_id uuid,
  sent_at timestamptz default now()
);
create table if not exists public.push_notification_clicks (
  id uuid primary key default gen_random_uuid(),
  campaign_key text,
  user_id uuid,
  clicked_at timestamptz default now()
);

alter table public.admin_variable_costs enable row level security;
alter table public.push_subscriptions enable row level security;
alter table public.push_notification_log enable row level security;
alter table public.push_notification_clicks enable row level security;

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as
$$ select exists (select 1 from public.user_roles where user_id = auth.uid() and role = 'admin') $$;

do $$ declare t text; begin
  foreach t in array array['admin_variable_costs','push_notification_log','push_notification_clicks'] loop
    execute format('drop policy if exists admin_all on public.%I', t);
    execute format('create policy admin_all on public.%I for all using (public.is_admin()) with check (public.is_admin())', t);
  end loop;
end $$;

drop policy if exists push_own on public.push_subscriptions;
create policy push_own on public.push_subscriptions for all
  using (auth.uid() = user_id or public.is_admin()) with check (auth.uid() = user_id);

-- Admin pode ler tudo para o painel
drop policy if exists admin_read_profiles on public.profiles;
create policy admin_read_profiles on public.profiles for select using (public.is_admin());
drop policy if exists admin_read_tx on public.transactions;
create policy admin_read_tx on public.transactions for select using (public.is_admin());

-- Promove automaticamente o admin quando a conta for criada
create or replace function public.grant_admin_on_signup() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.email = 'alvessystemss@gmail.com' then
    insert into public.user_roles (user_id, role) values (new.id, 'admin') on conflict do nothing;
  end if;
  return new;
end $$;
drop trigger if exists trg_grant_admin on auth.users;
create trigger trg_grant_admin after insert on auth.users
  for each row execute function public.grant_admin_on_signup();
