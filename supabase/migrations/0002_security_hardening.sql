-- ============================================================================
-- Mashura — 0002 security hardening
--
-- Run AFTER 0001_init.sql. Safe to re-run.
--
-- Why this exists: 0001 let a signed-in client write directly to `bookings`
-- and `payments`, which meant a client could set their own price, mark their
-- own payment as paid, self-confirm a booking, move it to any time, double-book
-- a slot, and a "viewer" staff role could write. This migration closes those
-- holes by moving every sensitive write into validated server-side functions
-- (RPCs) and removing the direct table permissions.
--
-- After this migration the browser can:
--   * READ what its RLS policies allow,
--   * call the RPCs below (create_booking, cancel_booking, ...),
--   * update only a few harmless columns (own name/phone/avatar, own
--     notification read flag, availability slots for staff writers).
-- ============================================================================

begin;

-- ---------------------------------------------------------------------------
-- 0. Role helpers
--    reader  = owner | admin | reception | viewer   (is_staff)
--    writer  = owner | admin | reception              (is_staff_writer)
--    admin   = owner | admin                          (is_admin)
-- ---------------------------------------------------------------------------
create or replace function public.is_staff_writer()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
      and role in ('owner','admin','reception')
  );
$$;

-- ---------------------------------------------------------------------------
-- 1. Data integrity
-- ---------------------------------------------------------------------------
-- Unguessable-enough references without depending on pgcrypto.
alter table public.bookings alter column ref set default
  ('MSH-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8)));
alter table public.payments alter column invoice_no set default
  ('INV-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8)));

alter table public.bookings drop constraint if exists bookings_minutes_chk;
alter table public.bookings add constraint bookings_minutes_chk
  check (minutes >= 15 and minutes % 15 = 0);
alter table public.bookings drop constraint if exists bookings_price_chk;
alter table public.bookings add constraint bookings_price_chk
  check (price_amount >= 0);
alter table public.bookings drop constraint if exists bookings_topic_len_chk;
alter table public.bookings add constraint bookings_topic_len_chk
  check (topic is null or char_length(topic) <= 500);

-- Replacing an admin-edited duration must not be blocked by (or delete)
-- existing bookings: keep the booking, just forget which option it used.
alter table public.bookings drop constraint if exists bookings_duration_option_id_fkey;
alter table public.bookings add constraint bookings_duration_option_id_fkey
  foreign key (duration_option_id) references public.duration_options(id) on delete set null;

-- Slots remember which booking holds them.
alter table public.availability_slots
  add column if not exists booking_id uuid references public.bookings(id) on delete set null;
create index if not exists availability_slots_booking_idx on public.availability_slots(booking_id);

-- One slot per start time (expert_id may be NULL, which plain UNIQUE ignores).
delete from public.availability_slots a
using public.availability_slots b
where a.ctid > b.ctid
  and a.starts_at = b.starts_at
  and coalesce(a.expert_id, '00000000-0000-0000-0000-000000000000')
    = coalesce(b.expert_id, '00000000-0000-0000-0000-000000000000');
create unique index if not exists availability_slots_one_per_start
  on public.availability_slots (coalesce(expert_id, '00000000-0000-0000-0000-000000000000'::uuid), starts_at);

-- Cleaner input at sign-up (still always role = 'client').
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
    left(btrim(coalesce(nullif(new.raw_user_meta_data->>'name', ''), split_part(new.email, '@', 1))), 100),
    new.email,
    left(nullif(btrim(coalesce(new.raw_user_meta_data->>'phone', '')), ''), 30),
    'client'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- 2. Row Level Security — replace the over-permissive policies
-- ---------------------------------------------------------------------------

-- 2.1 profiles: users edit only their own name/phone/avatar (column grants
--     below). Roles change ONLY through set_user_role().
drop policy if exists "own profile update"    on public.profiles;
drop policy if exists "admin manage profiles" on public.profiles;
create policy "own profile update"
  on public.profiles for update
  using (id = auth.uid())
  with check (id = auth.uid());

-- 2.2 bookings: read only. All writes go through the RPCs.
drop policy if exists "client create own"     on public.bookings;
drop policy if exists "client cancel own"     on public.bookings;
drop policy if exists "staff manage bookings" on public.bookings;

-- 2.3 payments: read only. All writes go through the RPCs.
drop policy if exists "insert payment for own" on public.payments;
drop policy if exists "admin manage payments"  on public.payments;

-- 2.4 availability slots: only writer roles (not viewers) may change them.
drop policy if exists "staff manage slots" on public.availability_slots;
create policy "writers manage slots"
  on public.availability_slots for all
  using (public.is_staff_writer()) with check (public.is_staff_writer());

-- 2.5 leads: staff read, writers update, admins delete. Anonymous visitors
--     can no longer insert rows directly (that allowed spam and forged
--     status/notes); they call capture_lead() instead.
drop policy if exists "staff manage leads" on public.leads;
drop policy if exists "anon insert leads"  on public.leads;
create policy "staff read leads"
  on public.leads for select using (public.is_staff());
create policy "writers update leads"
  on public.leads for update
  using (public.is_staff_writer()) with check (public.is_staff_writer());
create policy "admins delete leads"
  on public.leads for delete using (public.is_admin());

-- 2.6 notifications: only the recipient reads them; they are created by
--     triggers, never by clients.
drop policy if exists "read own notifications"     on public.notifications;
drop policy if exists "staff insert notifications" on public.notifications;
create policy "read own notifications"
  on public.notifications for select using (recipient_id = auth.uid());

-- 2.7 storage (invoices): only writer roles upload.
drop policy if exists "staff upload invoices" on storage.objects;
create policy "staff upload invoices"
  on storage.objects for insert with check (
    bucket_id = 'invoices' and public.is_staff_writer()
  );

-- ---------------------------------------------------------------------------
-- 3. Table privileges (defense in depth: even if a policy is added by
--    mistake later, these direct writes stay impossible)
-- ---------------------------------------------------------------------------
revoke truncate, references, trigger on all tables in schema public from anon, authenticated;

revoke insert, update, delete on public.bookings, public.payments from anon, authenticated;
revoke all on public.leads, public.availability_rules, public.notifications from anon;
revoke insert, delete on public.leads from authenticated;
revoke insert, delete on public.notifications from authenticated;
revoke insert, delete on public.profiles from anon, authenticated;

revoke update on public.profiles from anon, authenticated;
grant  update (name, phone, avatar_url) on public.profiles to authenticated;

revoke update on public.notifications from authenticated;
grant  update (read_at) on public.notifications to authenticated;

-- Anonymous visitors may read only the public catalog.
revoke all on public.profiles, public.bookings, public.payments from anon;

-- ---------------------------------------------------------------------------
-- 4. Guards + notifications (triggers)
-- ---------------------------------------------------------------------------

-- Slots that belong to a booking cannot be deleted, blocked or re-timed by
-- hand. The RPCs set app.internal for the transaction to do it themselves.
create or replace function public.guard_slots()
returns trigger
language plpgsql
as $$
begin
  if auth.uid() is null or coalesce(current_setting('app.internal', true), '') = '1' then
    return coalesce(new, old);
  end if;
  if tg_op = 'DELETE' then
    if old.is_booked then raise exception 'slot_booked'; end if;
    return old;
  end if;
  if new.is_booked   is distinct from old.is_booked
  or new.booking_id  is distinct from old.booking_id
  or new.starts_at   is distinct from old.starts_at
  or new.expert_id   is distinct from old.expert_id then
    raise exception 'slot_fields_locked';
  end if;
  if old.is_booked and new.is_blocked is distinct from old.is_blocked then
    raise exception 'slot_booked';
  end if;
  return new;
end;
$$;
drop trigger if exists tr_guard_slots on public.availability_slots;
create trigger tr_guard_slots
  before update or delete on public.availability_slots
  for each row execute function public.guard_slots();

-- In-app notifications for booking events.
create or replace function public.notify_booking_events()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_name text;
  v_when text := to_char(new.starts_at at time zone 'Africa/Cairo', 'DD/MM/YYYY HH24:MI');
  v_title text;
  v_msg text;
begin
  select name into v_name from public.profiles where id = new.client_id;

  if tg_op = 'INSERT' then
    insert into public.notifications (recipient_id, type, title, message, data)
    select p.id, 'booking_new', 'حجز جديد',
           coalesce(v_name, 'عميل') || ' طلب حجز ' || v_when,
           jsonb_build_object('booking_id', new.id)
    from public.profiles p
    where p.role in ('owner','admin','reception');

    insert into public.notifications (recipient_id, type, title, message, data)
    values (new.client_id, 'booking_received', 'استلمنا طلب الحجز',
            'طلبك لميعاد ' || v_when || ' وصل، وهيتأكد بعد مراجعته.',
            jsonb_build_object('booking_id', new.id));

  elsif new.status is distinct from old.status then
    v_title := case new.status
      when 'confirmed' then 'تم تأكيد حجزك'
      when 'cancelled' then 'تم إلغاء الحجز'
      when 'completed' then 'تمت الجلسة'
      when 'no_show'   then 'تم تسجيل غياب'
      else null end;
    v_msg := case new.status
      when 'confirmed' then 'ميعادك ' || v_when || ' اتأكد.'
      when 'cancelled' then 'حجز ' || v_when || ' اتلغى.'
      when 'completed' then 'الجلسة بتاريخ ' || v_when || ' خلصت.'
      when 'no_show'   then 'اتسجّل إنك ما حضرتش جلسة ' || v_when || '.'
      else null end;

    if v_title is not null then
      insert into public.notifications (recipient_id, type, title, message, data)
      values (new.client_id, 'booking_' || new.status, v_title, v_msg,
              jsonb_build_object('booking_id', new.id));
    end if;

    -- Tell staff when the client cancels by themselves.
    if new.status = 'cancelled' and auth.uid() = new.client_id then
      insert into public.notifications (recipient_id, type, title, message, data)
      select p.id, 'booking_cancelled', 'عميل لغى حجزه',
             coalesce(v_name, 'عميل') || ' لغى حجز ' || v_when,
             jsonb_build_object('booking_id', new.id)
      from public.profiles p
      where p.role in ('owner','admin','reception');
    end if;
  end if;
  return null;
end;
$$;
drop trigger if exists tr_booking_notify on public.bookings;
create trigger tr_booking_notify
  after insert or update of status on public.bookings
  for each row execute function public.notify_booking_events();

-- ---------------------------------------------------------------------------
-- 5. RPCs — every sensitive write, validated on the server
-- ---------------------------------------------------------------------------

-- 5.1 create_booking: price comes from the database, never from the browser;
--     the slots are locked and marked booked in the same transaction.
create or replace function public.create_booking(
  p_type_id        uuid,
  p_minutes        int,
  p_mode           text,
  p_starts_at      timestamptz,
  p_topic          text default null,
  p_payment_method text default 'cash'
)
returns public.bookings
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid     uuid := auth.uid();
  v_type    public.consultation_types;
  v_opt     public.duration_options;
  v_price   numeric;
  v_expert  uuid;
  v_n       int;
  v_ids     uuid[];
  v_pending int;
  v_booking public.bookings;
begin
  if v_uid is null then raise exception 'not_authenticated'; end if;
  if p_payment_method not in ('cash','wallet') then raise exception 'invalid_payment_method'; end if;
  p_topic := nullif(btrim(left(coalesce(p_topic, ''), 500)), '');

  select * into v_type from public.consultation_types where id = p_type_id and is_active;
  if not found then raise exception 'type_not_found'; end if;
  if not (p_mode = any (v_type.modes)) then raise exception 'mode_not_allowed'; end if;

  select * into v_opt from public.duration_options where type_id = p_type_id and minutes = p_minutes;
  if not found then raise exception 'duration_not_allowed'; end if;
  v_price := (v_opt.prices ->> p_mode)::numeric;
  if v_price is null or v_price < 0 then raise exception 'price_not_set'; end if;

  if p_starts_at < now() + interval '1 hour' then raise exception 'slot_too_soon'; end if;

  select count(*) into v_pending from public.bookings
   where client_id = v_uid and status = 'pending' and starts_at > now();
  if v_pending >= 5 then raise exception 'too_many_pending'; end if;

  select id into v_expert from public.experts order by created_at limit 1;
  v_n := p_minutes / 15;

  perform set_config('app.internal', '1', true);

  -- Lock every 15-minute slot the session needs.
  select array_agg(s.id order by s.starts_at) into v_ids
  from (
    select id, starts_at
    from public.availability_slots
    where starts_at >= p_starts_at
      and starts_at <  p_starts_at + make_interval(mins => p_minutes)
      and not is_blocked and not is_booked
      and duration_minutes = 15
      and (expert_id = v_expert or expert_id is null)
      and (extract(epoch from (starts_at - p_starts_at))::bigint % 900) = 0
    order by starts_at
    for update
  ) s;

  if v_ids is null or array_length(v_ids, 1) <> v_n then
    raise exception 'slot_unavailable';
  end if;

  insert into public.bookings
    (client_id, expert_id, type_id, duration_option_id, mode, starts_at, minutes, price_amount, topic)
  values
    (v_uid, v_expert, p_type_id, v_opt.id, p_mode, p_starts_at, p_minutes, v_price, p_topic)
  returning * into v_booking;

  update public.availability_slots
     set is_booked = true, booking_id = v_booking.id
   where id = any (v_ids);

  insert into public.payments (booking_id, amount, method)
  values (v_booking.id, v_price, p_payment_method);

  return v_booking;
end;
$$;

-- Shared by cancel_booking and set_booking_status('cancelled').
create or replace function public._release_booking(p_booking_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  perform set_config('app.internal', '1', true);
  update public.availability_slots
     set is_booked = false, booking_id = null
   where booking_id = p_booking_id;
  update public.payments
     set status = 'failed'
   where booking_id = p_booking_id and status = 'pending';
end;
$$;
revoke all on function public._release_booking(uuid) from public, anon, authenticated;

-- 5.2 cancel_booking: the client may cancel their own upcoming booking;
--     writer staff may cancel any.
create or replace function public.cancel_booking(p_booking_id uuid)
returns public.bookings
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  b public.bookings;
begin
  if v_uid is null then raise exception 'not_authenticated'; end if;
  select * into b from public.bookings where id = p_booking_id for update;
  if not found then raise exception 'booking_not_found'; end if;
  if not (b.client_id = v_uid or public.is_staff_writer()) then
    raise exception 'not_allowed';
  end if;
  if b.status not in ('pending','confirmed') then raise exception 'invalid_status'; end if;
  if b.client_id = v_uid and not public.is_staff_writer() and b.starts_at <= now() then
    raise exception 'already_started';
  end if;

  update public.bookings set status = 'cancelled' where id = b.id returning * into b;
  perform public._release_booking(b.id);
  return b;
end;
$$;

-- 5.3 set_booking_status: staff writers move a booking through its life
--     cycle and attach the meeting link / location.
create or replace function public.set_booking_status(
  p_booking_id  uuid,
  p_status      text default null,
  p_meeting_url text default null,
  p_location    text default null
)
returns public.bookings
language plpgsql
security definer
set search_path = public
as $$
declare
  b public.bookings;
begin
  if not public.is_staff_writer() then raise exception 'not_allowed'; end if;
  select * into b from public.bookings where id = p_booking_id for update;
  if not found then raise exception 'booking_not_found'; end if;

  if p_meeting_url is not null then
    p_meeting_url := btrim(p_meeting_url);
    if p_meeting_url <> '' and (char_length(p_meeting_url) > 500 or p_meeting_url !~* '^https://[^[:space:]]+$') then
      raise exception 'invalid_url';
    end if;
  end if;
  if p_location is not null and char_length(p_location) > 300 then raise exception 'invalid_location'; end if;

  if p_status is not null and p_status <> b.status then
    if not (
         (b.status = 'pending'   and p_status in ('confirmed','cancelled'))
      or (b.status = 'confirmed' and p_status in ('completed','no_show','cancelled'))
    ) then
      raise exception 'invalid_transition';
    end if;
  end if;

  update public.bookings
     set status      = coalesce(p_status, status),
         meeting_url = case when p_meeting_url is null then meeting_url else nullif(p_meeting_url, '') end,
         location    = case when p_location    is null then location    else nullif(btrim(p_location), '') end
   where id = b.id
   returning * into b;

  if b.status = 'cancelled' then perform public._release_booking(b.id); end if;
  return b;
end;
$$;

-- 5.4 set_payment_status: recorded by staff (cash / wallet transfers are
--     manual until a payment gateway is connected).
create or replace function public.set_payment_status(
  p_payment_id   uuid,
  p_status       text,
  p_provider_ref text default null
)
returns public.payments
language plpgsql
security definer
set search_path = public
as $$
declare
  p public.payments;
begin
  if not public.is_staff_writer() then raise exception 'not_allowed'; end if;
  if p_provider_ref is not null and char_length(p_provider_ref) > 120 then
    raise exception 'invalid_reference';
  end if;
  select * into p from public.payments where id = p_payment_id for update;
  if not found then raise exception 'payment_not_found'; end if;
  if not (
       (p.status = 'pending' and p_status in ('paid','failed'))
    or (p.status = 'paid'    and p_status = 'refunded')
  ) then
    raise exception 'invalid_transition';
  end if;
  update public.payments
     set status       = p_status,
         paid_at      = case when p_status = 'paid' then now() else paid_at end,
         provider_ref = coalesce(nullif(btrim(p_provider_ref), ''), provider_ref)
   where id = p.id
   returning * into p;
  return p;
end;
$$;

-- 5.5 capture_lead: public contact form. Validated, de-duplicated, capped.
create or replace function public.capture_lead(
  p_name     text,
  p_email    text,
  p_phone    text default null,
  p_interest text default null,
  p_source   text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  p_name  := btrim(coalesce(p_name, ''));
  p_email := lower(btrim(coalesce(p_email, '')));
  p_phone := nullif(btrim(coalesce(p_phone, '')), '');
  if char_length(p_name) < 2 or char_length(p_name) > 100 then raise exception 'invalid_name'; end if;
  if char_length(p_email) > 254 or p_email !~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$' then
    raise exception 'invalid_email';
  end if;
  if p_phone is not null and p_phone !~ '^[0-9+()[:space:]-]{6,30}$' then raise exception 'invalid_phone'; end if;

  -- Same email within 24h: silently accept (no account-probing, no duplicates).
  if exists (select 1 from public.leads where lower(email) = p_email and created_at > now() - interval '24 hours') then
    return;
  end if;
  -- Crude global flood cap. Add CAPTCHA before running ads.
  if (select count(*) from public.leads where created_at > now() - interval '1 hour') >= 100 then
    raise exception 'rate_limited';
  end if;

  insert into public.leads (name, email, phone, interest, source, status)
  values (p_name, p_email, p_phone,
          nullif(left(btrim(coalesce(p_interest, '')), 100), ''),
          nullif(left(btrim(coalesce(p_source, '')), 100), ''),
          'new');
end;
$$;

-- 5.6 generate_slots: turn the weekly availability rules into concrete
--     15-minute slots for a date range (Africa/Cairo local time).
create or replace function public.generate_slots(p_from date, p_to date)
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  v_expert uuid;
  v_count  int;
begin
  if not public.is_admin() then raise exception 'not_allowed'; end if;
  if p_to < p_from or p_to - p_from > 62 then raise exception 'invalid_range'; end if;
  select id into v_expert from public.experts order by created_at limit 1;

  with ins as (
    insert into public.availability_slots (expert_id, starts_at, duration_minutes)
    select v_expert,
           (g.ts at time zone 'Africa/Cairo'),
           15
    from generate_series(0, p_to - p_from) as i(n)
    join public.availability_rules r
      on r.is_active
     and r.weekday = extract(dow from (p_from + i.n))::int
     and (r.expert_id = v_expert or r.expert_id is null)
    cross join lateral generate_series(
      (p_from + i.n)::timestamp + r.start_time,
      (p_from + i.n)::timestamp + r.end_time - interval '15 minutes',
      interval '15 minutes'
    ) as g(ts)
    where (g.ts at time zone 'Africa/Cairo') > now()
    on conflict do nothing
    returning 1
  )
  select count(*) into v_count from ins;
  return v_count;
end;
$$;

-- 5.7 set_user_role: promote / demote staff. Only an owner can grant or
--     remove owner/admin; nobody can change their own role; the last owner
--     can't be demoted.
create or replace function public.set_user_role(p_email text, p_role text)
returns public.profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  v_caller text;
  v_target public.profiles;
begin
  select role into v_caller from public.profiles where id = auth.uid();
  if v_caller is null or v_caller not in ('owner','admin') then raise exception 'not_allowed'; end if;
  if p_role not in ('client','owner','admin','reception','viewer') then raise exception 'invalid_role'; end if;

  select * into v_target from public.profiles where lower(email) = lower(btrim(p_email));
  if not found then raise exception 'user_not_found'; end if;
  if v_target.id = auth.uid() then raise exception 'cannot_change_self'; end if;
  if (p_role in ('owner','admin') or v_target.role in ('owner','admin')) and v_caller <> 'owner' then
    raise exception 'owner_only';
  end if;
  if v_target.role = 'owner' and p_role <> 'owner'
     and (select count(*) from public.profiles where role = 'owner') <= 1 then
    raise exception 'last_owner';
  end if;

  update public.profiles set role = p_role where id = v_target.id returning * into v_target;
  return v_target;
end;
$$;

-- ---------------------------------------------------------------------------
-- 6. Who may call what
-- ---------------------------------------------------------------------------
revoke all on function public.create_booking(uuid, int, text, timestamptz, text, text) from public, anon;
revoke all on function public.cancel_booking(uuid)                                   from public, anon;
revoke all on function public.set_booking_status(uuid, text, text, text)             from public, anon;
revoke all on function public.set_payment_status(uuid, text, text)                   from public, anon;
revoke all on function public.generate_slots(date, date)                             from public, anon;
revoke all on function public.set_user_role(text, text)                              from public, anon;
revoke all on function public.capture_lead(text, text, text, text, text)             from public;

grant execute on function public.create_booking(uuid, int, text, timestamptz, text, text) to authenticated;
grant execute on function public.cancel_booking(uuid)                                   to authenticated;
grant execute on function public.set_booking_status(uuid, text, text, text)             to authenticated;
grant execute on function public.set_payment_status(uuid, text, text)                   to authenticated;
grant execute on function public.generate_slots(date, date)                             to authenticated;
grant execute on function public.set_user_role(text, text)                              to authenticated;
grant execute on function public.capture_lead(text, text, text, text, text)             to anon, authenticated;

commit;
