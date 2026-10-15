-- Colunas usadas pelo app no perfil
alter table public.profiles add column if not exists trial_ends_at timestamptz;
alter table public.profiles add column if not exists subscription_plan text;
alter table public.profiles add column if not exists subscription_tier text;
alter table public.profiles add column if not exists subscription_ends_at timestamptz;
alter table public.profiles add column if not exists reward_pro_until timestamptz;
alter table public.profiles add column if not exists is_onboarded boolean default false;
alter table public.profiles add column if not exists account_name text;
alter table public.profiles add column if not exists referral_code text;
alter table public.profiles add column if not exists referral_count int default 0;
alter table public.profiles add column if not exists paid_referral_count int default 0;
alter table public.profiles add column if not exists referral_rewards_claimed jsonb default '[]'::jsonb;
alter table public.profiles add column if not exists last_access timestamptz;

-- Inicia o teste grátis de 7 dias
create or replace function public.start_free_trial()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  p public.profiles%rowtype;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  select * into p from public.profiles where id = auth.uid();

  if not found then
    insert into public.profiles (id, trial_ends_at, subscription_tier)
    values (auth.uid(), now() + interval '7 days', 'pro');
    return;
  end if;

  if p.subscription_plan in ('monthly','annual','lifetime') then
    raise exception 'Active subscription';
  end if;

  if p.trial_ends_at is not null then
    raise exception 'Trial already used';
  end if;

  update public.profiles
     set trial_ends_at = now() + interval '7 days',
         subscription_tier = 'pro'
   where id = auth.uid();
end;
$$;

grant execute on function public.start_free_trial() to authenticated;

create or replace function public.get_referrer_name(_code text)
returns text
language sql
security definer
set search_path = public
as $$
  select split_part(coalesce(full_name, ''), ' ', 1)
  from public.profiles
  where upper(referral_code) = upper(_code)
  limit 1;
$$;
grant execute on function public.get_referrer_name(text) to anon, authenticated;

notify pgrst, 'reload schema';
