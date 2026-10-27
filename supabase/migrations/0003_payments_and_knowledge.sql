-- ============================================================================
-- Mashura — 0003: working payment flow + knowledge base for the assistant (RAG)
-- Run AFTER 0001 and 0002. Safe to re-run.
--
--  1. site_settings            payment receiving details, editable by admins
--  2. payments.submitted_at    + submit_payment_reference()  client records a transfer
--  3. notify_payment_events    tells the client when a payment is confirmed / refunded
--  4. kb_articles + kb_search  Arabic retrieval over the knowledge base
-- ============================================================================
begin;

-- ---------------------------------------------------------------------------
-- 1. Site settings (payment receiving details)
-- ---------------------------------------------------------------------------
create table if not exists public.site_settings (
  key        text primary key
             check (key in ('pay_wallet_name','pay_wallet_number','pay_instapay','pay_note')),
  value      text not null default '' check (char_length(value) <= 300),
  updated_at timestamptz not null default now()
);
alter table public.site_settings enable row level security;

drop policy if exists "signed-in read settings" on public.site_settings;
drop policy if exists "admins write settings"   on public.site_settings;
create policy "signed-in read settings" on public.site_settings
  for select to authenticated using (true);
create policy "admins write settings" on public.site_settings
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

revoke all on public.site_settings from anon;
revoke truncate, references, trigger on public.site_settings from authenticated;

insert into public.site_settings (key, value) values
  ('pay_wallet_name',   'فودافون كاش'),
  ('pay_wallet_number', ''),
  ('pay_instapay',      ''),
  ('pay_note',          'بعد التحويل اكتب رقم العملية هنا، وهنأكد الدفع في أقرب وقت.')
on conflict (key) do nothing;

-- ---------------------------------------------------------------------------
-- 2. Client records a wallet / InstaPay transfer; staff confirms it
-- ---------------------------------------------------------------------------
alter table public.payments add column if not exists submitted_at timestamptz;

create or replace function public.submit_payment_reference(p_payment_id uuid, p_reference text)
returns public.payments
language plpgsql
security definer
set search_path = public
as $$
declare
  p     public.payments;
  b     public.bookings;
  v_ref text := btrim(coalesce(p_reference, ''));
  v_who text;
begin
  if auth.uid() is null then raise exception 'not_authenticated'; end if;
  if char_length(v_ref) < 3 or char_length(v_ref) > 60 then raise exception 'invalid_reference'; end if;

  select * into p from public.payments where id = p_payment_id for update;
  if not found then raise exception 'payment_not_found'; end if;
  select * into b from public.bookings where id = p.booking_id;
  if b.client_id is distinct from auth.uid() then raise exception 'not_allowed'; end if;
  if p.status <> 'pending' or p.method <> 'wallet' or b.status in ('cancelled','no_show') then
    raise exception 'invalid_transition';
  end if;

  update public.payments
     set provider_ref = v_ref, provider = 'manual-transfer', submitted_at = now()
   where id = p.id
   returning * into p;

  select name into v_who from public.profiles where id = b.client_id;
  insert into public.notifications (recipient_id, type, title, message, data)
  select pr.id, 'payment_submitted', 'تحويل بانتظار التأكيد',
         coalesce(v_who, 'عميل') || ' سجّل تحويل لحجز ' || b.ref || ' (' || p.amount || ' ج.م)',
         jsonb_build_object('booking_id', b.id, 'payment_id', p.id)
  from public.profiles pr
  where pr.role in ('owner','admin','reception');

  return p;
end;
$$;
revoke all on function public.submit_payment_reference(uuid, text) from public, anon;
grant execute on function public.submit_payment_reference(uuid, text) to authenticated;

-- ---------------------------------------------------------------------------
-- 3. Tell the client when staff confirms / refunds / rejects a payment
-- ---------------------------------------------------------------------------
create or replace function public.notify_payment_events()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  b public.bookings;
  v_title text;
  v_msg   text;
begin
  if new.status is not distinct from old.status then return null; end if;
  select * into b from public.bookings where id = new.booking_id;
  v_title := case new.status
    when 'paid'     then 'تم تأكيد الدفع'
    when 'refunded' then 'تم رد المبلغ'
    when 'failed'   then 'لم يتم تأكيد الدفع'
    else null end;
  v_msg := case new.status
    when 'paid'     then 'استلمنا ' || new.amount || ' ج.م لحجز ' || b.ref || '. رقم الفاتورة ' || new.invoice_no || '.'
    when 'refunded' then 'اتردّ مبلغ ' || new.amount || ' ج.م لحجز ' || b.ref || '.'
    when 'failed'   then 'ما قدرناش نتأكد من دفع حجز ' || b.ref || '. تواصل معانا لو حصل تحويل.'
    else null end;
  if v_title is not null then
    insert into public.notifications (recipient_id, type, title, message, data)
    values (b.client_id, 'payment_' || new.status, v_title, v_msg,
            jsonb_build_object('booking_id', b.id, 'payment_id', new.id));
  end if;
  return null;
end;
$$;
drop trigger if exists tr_payment_notify on public.payments;
create trigger tr_payment_notify
  after update of status on public.payments
  for each row execute function public.notify_payment_events();

-- ---------------------------------------------------------------------------
-- 4. Knowledge base + Arabic retrieval (the "R" in the assistant's RAG)
--    No extensions needed: light Arabic normalisation + stemming in SQL.
-- ---------------------------------------------------------------------------

-- Normalise: lower-case, drop diacritics/tatweel, unify alef / ya / ta-marbuta,
-- Arabic-Indic digits -> ASCII, anything else -> a space.
create or replace function public.kb_norm(t text)
returns text
language sql
immutable
as $$
  select btrim(regexp_replace(
           regexp_replace(
             translate(lower(coalesce(t, '')),
                       'أإآٱةىؤئ٠١٢٣٤٥٦٧٨٩',
                       'ااااهيوي0123456789'),
             '[\u064B-\u065F\u0670\u0640]', '', 'g'),
           '[^\u0621-\u064Aa-z0-9]+', ' ', 'g'))
$$;

-- Very light stemmer (prefix "ال", one verb/preposition letter, common suffixes).
-- Crude on purpose: it only has to map the same word to the same stem on both
-- sides (question and article), not to be linguistically correct.
create or replace function public.kb_stem(w text)
returns text
language sql
immutable
as $$
  select case
    when char_length(w) <= 3 then w
    else regexp_replace(
           regexp_replace(
             regexp_replace(w, '^(وال|بال|فال|لل|ال)(?=.{2})', ''),
             '^[ابتيهنسو](?=.{3})', ''),
           '(?<=.{3})(ات|ون|ين|ها|هم|نا|ه|ي|ك)$', '')
  end
$$;

create or replace function public.kb_stems(t text)
returns text
language sql
immutable
as $$
  select coalesce(string_agg(public.kb_stem(w), ' '), '')
  from unnest(string_to_array(public.kb_norm(t), ' ')) as w
  where w <> ''
$$;

create table if not exists public.kb_articles (
  id          uuid primary key default gen_random_uuid(),
  category    text not null default 'عام',
  question    text not null check (char_length(question) between 3 and 200),
  answer      text not null check (char_length(answer) between 3 and 1200),
  keywords    text not null default '',
  is_active   boolean not null default true,
  sort_order  int not null default 100,
  q_stems     text generated always as (public.kb_stems(question || ' ' || keywords)) stored,
  a_stems     text generated always as (public.kb_stems(answer)) stored,
  created_at  timestamptz not null default now()
);
create unique index if not exists kb_articles_question_uq on public.kb_articles (question);
alter table public.kb_articles enable row level security;

drop policy if exists "read active articles" on public.kb_articles;
drop policy if exists "admins manage articles" on public.kb_articles;
create policy "read active articles" on public.kb_articles
  for select using (is_active or public.is_admin());
create policy "admins manage articles" on public.kb_articles
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

revoke insert, update, delete, truncate, references, trigger on public.kb_articles from anon;
revoke truncate, references, trigger on public.kb_articles from authenticated;

-- kb_search(question) -> best matching articles with a 0..1 score:
--   each meaningful word of the question scores 1 if its stem is in the
--   article's question/keywords, 0.35 if only in the answer; the sum is
--   divided by the number of words. Callers treat score >= 0.5 as "found".
create or replace function public.kb_search(p_query text, p_limit int default 3)
returns table (id uuid, category text, question text, answer text, score numeric)
language sql
stable
set search_path = public
as $$
  with q as (
    select array(
      select distinct public.kb_stem(w)
      from unnest(string_to_array(public.kb_norm(left(coalesce(p_query, ''), 200)), ' ')) as w
      where char_length(w) >= 2
        and w <> all (array[
          'ايه','هو','هي','في','من','علي','عن','انا','ان','لو','ده','دي','دا','عايز','عاوز','محتاج',
          'ممكن','اقدر','ازاي','كام','هل','ما','ماذا','لما','يعني','طيب','ليه','فين','امتي','لازم',
          'انتو','انتم','حضرتك','مع','او','كده','بس','تاني','اي','الي','اللي','عشان','يا','لي','لو','ايه','انت','حد','حاجه'])
    ) as toks
  )
  select a.id, a.category, a.question, a.answer,
         round(s.sc / greatest(cardinality(q.toks), 1), 3)::numeric as score
  from public.kb_articles a
  cross join q
  cross join lateral (
    select coalesce(sum(case
             when t = any (string_to_array(a.q_stems, ' ')) then 1.0
             when t = any (string_to_array(a.a_stems, ' ')) then 0.35
             else 0 end), 0) as sc
    from unnest(q.toks) as t
  ) s
  where a.is_active and cardinality(q.toks) > 0 and s.sc > 0
  order by score desc, a.sort_order, a.question
  limit least(greatest(coalesce(p_limit, 3), 1), 5)
$$;
revoke all on function public.kb_search(text, int) from public;
grant execute on function public.kb_search(text, int) to anon, authenticated;

commit;
