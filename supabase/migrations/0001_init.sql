-- ============================================================================
-- Mashura — initial schema (0001)
-- Booking platform for a single-expert (Ahmed) with staff, clients, and leads.
-- Idempotent where practical so re-running against a clean DB works.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 0. Extensions
-- ---------------------------------------------------------------------------
create extension if not exists "pgcrypto";   -- gen_random_uuid()
create extension if not exists "pg_trgm";    -- for future search / ILIKE speed

-- ---------------------------------------------------------------------------
-- 1. Enum-like helper: user roles + booking status + payment status
-- ---------------------------------------------------------------------------
-- We use text + check constraints (not real enums) so admins can add roles
-- later without an ALTER TYPE round-trip.

-- ---------------------------------------------------------------------------
-- 2. Utility functions used by triggers below
-- ---------------------------------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- 3. Tables
-- ---------------------------------------------------------------------------

-- 3.1 profiles — 1:1 with auth.users. Created automatically by trigger below.
create table if not exists public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  role       text not null default 'client'
             check (role in ('client','owner','admin','reception','viewer')),
  name       text not null,
  email      text not null,
  phone      text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists profiles_role_idx on public.profiles(role);

drop trigger if exists tr_profiles_touch on public.profiles;
create trigger tr_profiles_touch
  before update on public.profiles
  for each row execute function public.touch_updated_at();

-- 3.2 experts — for now a single row (Ahmed). Room for multi-expert later.
create table if not exists public.experts (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  title      text not null,
  bio        text,
  years      int,
  sessions   int default 0,
  rating     numeric(2,1) default 0,
  created_at timestamptz not null default now()
);

-- 3.3 consultation_types
create table if not exists public.consultation_types (
  id         uuid primary key default gen_random_uuid(),
  slug       text unique not null,
  title      text not null,
  category   text not null,
  blurb      text,
  modes      text[] not null,        -- e.g. {'video','audio'} or {'in-person'}
  is_active  boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (array_length(modes, 1) > 0),
  check (modes <@ array['video','audio','in-person']::text[])
);

drop trigger if exists tr_types_touch on public.consultation_types;
create trigger tr_types_touch
  before update on public.consultation_types
  for each row execute function public.touch_updated_at();

-- 3.4 duration_options — per-duration + per-mode pricing
create table if not exists public.duration_options (
  id         uuid primary key default gen_random_uuid(),
  type_id    uuid not null references public.consultation_types(id) on delete cascade,
  minutes    int  not null check (minutes >= 15 and minutes % 15 = 0),
  prices     jsonb not null,  -- {"video": 500, "audio": 350} or {"in-person": 1500}
  sort_order int  not null default 0,
  unique (type_id, minutes)
);
create index if not exists duration_options_type_idx on public.duration_options(type_id);

-- 3.5 availability_rules — recurring weekly windows
create table if not exists public.availability_rules (
  id         uuid primary key default gen_random_uuid(),
  expert_id  uuid references public.experts(id) on delete cascade,
  weekday    int  not null check (weekday between 0 and 6),   -- 0 = Sunday
  start_time time not null,
  end_time   time not null,
  is_active  boolean not null default true,
  check (end_time > start_time)
);
create index if not exists availability_rules_expert_idx on public.availability_rules(expert_id);

-- 3.6 availability_slots — concrete bookable time-instants
create table if not exists public.availability_slots (
  id               uuid primary key default gen_random_uuid(),
  expert_id        uuid references public.experts(id) on delete cascade,
  starts_at        timestamptz not null,
  duration_minutes int not null default 15,
  is_blocked       boolean not null default false,
  is_booked        boolean not null default false,
  created_at       timestamptz not null default now(),
  unique (expert_id, starts_at)
);
create index if not exists availability_slots_starts_idx on public.availability_slots(starts_at);

-- 3.7 bookings — the core object
create table if not exists public.bookings (
  id                 uuid primary key default gen_random_uuid(),
  ref                text unique not null default ('MSH-' || lpad(floor(random()*999999)::text, 6, '0')),
  client_id          uuid not null references public.profiles(id) on delete restrict,
  expert_id          uuid references public.experts(id) on delete restrict,
  type_id            uuid not null references public.consultation_types(id) on delete restrict,
  duration_option_id uuid references public.duration_options(id),
  mode               text not null check (mode in ('video','audio','in-person')),
  starts_at          timestamptz not null,
  minutes            int  not null,
  price_amount       numeric(10,2) not null,
  currency           text not null default 'EGP',
  status             text not null default 'pending'
                     check (status in ('pending','confirmed','completed','cancelled','no_show')),
  topic              text,
  meeting_url        text,
  location           text,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);
create index if not exists bookings_client_idx on public.bookings(client_id);
create index if not exists bookings_starts_idx on public.bookings(starts_at);
create index if not exists bookings_status_idx on public.bookings(status);

drop trigger if exists tr_bookings_touch on public.bookings;
create trigger tr_bookings_touch
  before update on public.bookings
  for each row execute function public.touch_updated_at();

-- 3.8 payments
create table if not exists public.payments (
  id           uuid primary key default gen_random_uuid(),
  invoice_no   text unique not null default ('INV-' || lpad(floor(random()*999999)::text, 6, '0')),
  booking_id   uuid not null references public.bookings(id) on delete cascade,
  amount       numeric(10,2) not null,
  currency     text not null default 'EGP',
  method       text not null check (method in ('card','wallet','cash')),
  status       text not null default 'pending'
               check (status in ('pending','paid','refunded','failed')),
  provider     text,
  provider_ref text,
  paid_at      timestamptz,
  created_at   timestamptz not null default now()
);
create index if not exists payments_booking_idx on public.payments(booking_id);

-- 3.9 notifications
create table if not exists public.notifications (
  id           uuid primary key default gen_random_uuid(),
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  type         text not null,
  title        text not null,
  message      text not null,
  data         jsonb,
  read_at      timestamptz,
  created_at   timestamptz not null default now()
);
create index if not exists notifications_recipient_idx on public.notifications(recipient_id);
create index if not exists notifications_unread_idx on public.notifications(recipient_id) where read_at is null;

-- 3.10 leads — anonymous / pre-signup interest
create table if not exists public.leads (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  email      text not null,
  phone      text,
  source     text,
  interest   text,
  status     text not null default 'new'
             check (status in ('new','contacted','qualified','converted','closed')),
  note       text,
  created_at timestamptz not null default now()
);
create index if not exists leads_status_idx on public.leads(status);

-- ---------------------------------------------------------------------------
-- 4. Auto-create profile row when a new user signs up via Supabase Auth
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, name, email, phone, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email,
    new.raw_user_meta_data->>'phone',
    'client'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- 5. Role-check helper functions (used across RLS)
-- ---------------------------------------------------------------------------
create or replace function public.is_staff()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
      and role in ('owner','admin','reception','viewer')
  );
$$;

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
      and role in ('owner','admin')
  );
$$;

-- ---------------------------------------------------------------------------
-- 6. Row Level Security
-- ---------------------------------------------------------------------------
alter table public.profiles           enable row level security;
alter table public.experts            enable row level security;
alter table public.consultation_types enable row level security;
alter table public.duration_options   enable row level security;
alter table public.availability_rules enable row level security;
alter table public.availability_slots enable row level security;
alter table public.bookings           enable row level security;
alter table public.payments           enable row level security;
alter table public.notifications      enable row level security;
alter table public.leads              enable row level security;

-- 6.1 profiles
drop policy if exists "own profile read"       on public.profiles;
drop policy if exists "own profile update"     on public.profiles;
drop policy if exists "admin manage profiles"  on public.profiles;

create policy "own profile read"
  on public.profiles for select
  using (id = auth.uid() or public.is_staff());

create policy "own profile update"
  on public.profiles for update
  using (id = auth.uid())
  with check (id = auth.uid() and role = (select role from public.profiles where id = auth.uid()));
-- ↑ client can update own profile but CANNOT escalate their role.

create policy "admin manage profiles"
  on public.profiles for update
  using (public.is_admin())
  with check (public.is_admin());

-- 6.2 experts — public read, admin write
drop policy if exists "public read experts"   on public.experts;
drop policy if exists "admin manage experts"  on public.experts;

create policy "public read experts"
  on public.experts for select using (true);

create policy "admin manage experts"
  on public.experts for all
  using (public.is_admin()) with check (public.is_admin());

-- 6.3 consultation_types
drop policy if exists "public read active types" on public.consultation_types;
drop policy if exists "admin manage types"       on public.consultation_types;

create policy "public read active types"
  on public.consultation_types for select
  using (is_active = true or public.is_staff());

create policy "admin manage types"
  on public.consultation_types for all
  using (public.is_admin()) with check (public.is_admin());

-- 6.4 duration_options
drop policy if exists "public read durations"    on public.duration_options;
drop policy if exists "admin manage durations"   on public.duration_options;

create policy "public read durations"
  on public.duration_options for select using (true);

create policy "admin manage durations"
  on public.duration_options for all
  using (public.is_admin()) with check (public.is_admin());

-- 6.5 availability_rules — staff only
drop policy if exists "staff read rules"    on public.availability_rules;
drop policy if exists "admin manage rules"  on public.availability_rules;

create policy "staff read rules"
  on public.availability_rules for select
  using (public.is_staff());

create policy "admin manage rules"
  on public.availability_rules for all
  using (public.is_admin()) with check (public.is_admin());

-- 6.6 availability_slots — public read (open + unblocked), staff manage
drop policy if exists "public read open slots"   on public.availability_slots;
drop policy if exists "staff manage slots"       on public.availability_slots;

create policy "public read open slots"
  on public.availability_slots for select
  using (is_blocked = false or public.is_staff());

create policy "staff manage slots"
  on public.availability_slots for all
  using (public.is_staff()) with check (public.is_staff());

-- 6.7 bookings
drop policy if exists "read own or staff"        on public.bookings;
drop policy if exists "client create own"        on public.bookings;
drop policy if exists "client cancel own"        on public.bookings;
drop policy if exists "staff manage bookings"    on public.bookings;

create policy "read own or staff"
  on public.bookings for select
  using (client_id = auth.uid() or public.is_staff());

create policy "client create own"
  on public.bookings for insert
  with check (client_id = auth.uid());

create policy "client cancel own"
  on public.bookings for update
  using (client_id = auth.uid())
  with check (
    client_id = auth.uid()
    and status in ('pending','confirmed','cancelled')
  );

create policy "staff manage bookings"
  on public.bookings for all
  using (public.is_staff()) with check (public.is_staff());

-- 6.8 payments — read via booking, admin manage
drop policy if exists "read own payments"        on public.payments;
drop policy if exists "insert payment for own"   on public.payments;
drop policy if exists "admin manage payments"    on public.payments;

create policy "read own payments"
  on public.payments for select using (
    exists (
      select 1 from public.bookings b
      where b.id = booking_id
        and (b.client_id = auth.uid() or public.is_staff())
    )
  );

create policy "insert payment for own"
  on public.payments for insert with check (
    exists (
      select 1 from public.bookings b
      where b.id = booking_id and b.client_id = auth.uid()
    )
  );

create policy "admin manage payments"
  on public.payments for all
  using (public.is_admin()) with check (public.is_admin());

-- 6.9 notifications — recipient only
drop policy if exists "read own notifications"    on public.notifications;
drop policy if exists "update own notifications"  on public.notifications;
drop policy if exists "staff insert notifications" on public.notifications;

create policy "read own notifications"
  on public.notifications for select
  using (recipient_id = auth.uid() or public.is_staff());

create policy "update own notifications"
  on public.notifications for update
  using (recipient_id = auth.uid())
  with check (recipient_id = auth.uid());

create policy "staff insert notifications"
  on public.notifications for insert
  with check (public.is_staff());

-- 6.10 leads — staff only
drop policy if exists "staff manage leads" on public.leads;

create policy "staff manage leads"
  on public.leads for all
  using (public.is_staff()) with check (public.is_staff());

-- Anon lead capture from public forms (marketing landing) — insert only
drop policy if exists "anon insert leads" on public.leads;
create policy "anon insert leads"
  on public.leads for insert with check (true);

-- ---------------------------------------------------------------------------
-- 7. Storage bucket for invoice PDFs
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('invoices', 'invoices', false)
on conflict (id) do nothing;

-- Path layout: invoices/<client_uuid>/<invoice_no>.pdf
drop policy if exists "read own invoice"      on storage.objects;
drop policy if exists "staff upload invoices" on storage.objects;

create policy "read own invoice"
  on storage.objects for select using (
    bucket_id = 'invoices'
    and (
      auth.uid()::text = (storage.foldername(name))[1]
      or public.is_staff()
    )
  );

create policy "staff upload invoices"
  on storage.objects for insert with check (
    bucket_id = 'invoices' and public.is_staff()
  );
