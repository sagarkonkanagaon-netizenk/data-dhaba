-- Data Dhaba Pro: payments, the Pro flag and the private Pro files.
-- Run once in Supabase: SQL Editor > New query > paste this file > Run. Safe to run again.
-- Needs supabase/schema.sql to have been run first (it creates public.profiles).
--
-- Who has Pro is decided only here, on the server:
--   * an owner email in public.pro_owners (Sagar and reviewers), or
--   * a profile with pro_until today or later, which only grant_pro() can set,
--     and only the payment server (service role) can call grant_pro().
-- Learners can read their own payments and their own Pro status, nothing else.

-- 1. Owners: emails that always have Pro. Rows are added from the SQL editor only.
create table if not exists public.pro_owners (
  email text primary key check (email = lower(email))
);
alter table public.pro_owners enable row level security;
-- No policies: nobody can read or change this list from the site.

-- 2. Pro check used by every policy below.
create or replace function public.has_pro()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select auth.uid() is not null and (
    exists (select 1 from pro_owners where email = lower(coalesce(auth.jwt() ->> 'email', '')))
    or exists (select 1 from profiles where user_id = auth.uid() and pro_until >= current_date)
  );
$$;
revoke all on function public.has_pro() from public, anon;
grant execute on function public.has_pro() to authenticated;

-- What the site shows a signed-in learner about their own plan.
create or replace function public.my_pro()
returns json
language sql
stable
security definer
set search_path = public
as $$
  select json_build_object(
    'pro', public.has_pro(),
    'owner', exists (select 1 from pro_owners where email = lower(coalesce(auth.jwt() ->> 'email', ''))),
    'until', (select pro_until from profiles where user_id = auth.uid())
  );
$$;
revoke all on function public.my_pro() from public, anon;
grant execute on function public.my_pro() to authenticated;

-- 3. Payments. One row per Razorpay order. Prices are fixed in the payment server, never sent by the browser.
-- India pays in INR; visitors abroad in USD once the USD prices are set in the payment server.
create table if not exists public.payments (
  order_id    text primary key check (order_id ~ '^order_[A-Za-z0-9]{6,40}$'),
  user_id     uuid not null references auth.users (id) on delete cascade,
  email       text,
  plan_key    text not null check (plan_key in ('6m', '1y')),
  amount      int  not null check (amount > 0),                  -- smallest unit: paise (₹2,499 = 249900) or cents
  currency    text not null default 'INR' check (currency in ('INR', 'USD')),
  status      text not null default 'created' check (status in ('created', 'paid', 'refunded')),
  payment_id  text unique,
  pro_until   date,                                               -- Pro end date this payment gave
  mode        text not null default 'test' check (mode in ('test', 'live')),
  created_at  timestamptz not null default now(),
  paid_at     timestamptz
);
create index if not exists payments_user on public.payments (user_id, created_at desc);
alter table public.payments enable row level security;
drop policy if exists "read own payments" on public.payments;
create policy "read own payments" on public.payments
  for select to authenticated using (auth.uid() = user_id);
-- No insert, update or delete policies: only the payment server writes here.

-- 4. Grant Pro for a paid order. Idempotent: the browser callback and the webhook can both call it.
-- Pro time stacks: buying again while Pro adds the months to the current end date.
create or replace function public.grant_pro(p_order_id text, p_payment_id text)
returns date
language plpgsql
security definer
set search_path = public
as $$
declare
  p payments%rowtype;
  months int;
  base date;
  new_until date;
begin
  select * into p from payments where order_id = p_order_id for update;
  if not found then raise exception 'unknown order %', p_order_id; end if;
  if p.status = 'paid' then return p.pro_until; end if;
  if p.status <> 'created' then raise exception 'order % is %', p_order_id, p.status; end if;
  months := case p.plan_key when '6m' then 6 when '1y' then 12 end;

  insert into profiles (user_id) values (p.user_id) on conflict (user_id) do nothing;
  select greatest(coalesce(pro_until, current_date), current_date) into base
    from profiles where user_id = p.user_id for update;
  new_until := (base + make_interval(months => months))::date;
  update profiles set plan = 'pro', pro_until = new_until where user_id = p.user_id;
  update payments set status = 'paid', payment_id = p_payment_id, paid_at = now(), pro_until = new_until
    where order_id = p_order_id;
  return new_until;
end;
$$;
revoke all on function public.grant_pro(text, text) from public, anon, authenticated;
grant execute on function public.grant_pro(text, text) to service_role;

-- 5. Private Pro files (the career-ladder projects). Upload them in Storage > pro.
-- Only Pro members and owners can download; the bucket is never public.
insert into storage.buckets (id, name, public)
values ('pro', 'pro', false)
on conflict (id) do update set public = false;

drop policy if exists "pro members read pro files" on storage.objects;
create policy "pro members read pro files" on storage.objects
  for select to authenticated using (bucket_id = 'pro' and public.has_pro());
-- No insert, update or delete policies for learners: you upload from the dashboard.
