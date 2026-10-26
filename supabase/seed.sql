-- ============================================================================
-- Mashura — dev seed data
-- Run AFTER 0001_init.sql. Populates realistic starter data for local/staging.
-- Safe to re-run (upserts by slug/id where possible).
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. The expert (Ahmed) — a single row
-- ---------------------------------------------------------------------------
insert into public.experts (id, name, title, bio, years, sessions, rating)
values (
  '11111111-1111-1111-1111-111111111111',
  'مستشار تجريبي',
  'مستشار أعمال',
  'هذا مشروع تجريبي لعرض فكرة نظام حجز الاستشارات. اسم المستشار وبياناته وأسعاره قابلة للتعديل بالكامل من لوحة الإدارة.',
  null, 0, 0
)
on conflict (id) do update
  set name = excluded.name,
      title = excluded.title,
      bio = excluded.bio,
      years = excluded.years,
      sessions = excluded.sessions,
      rating = excluded.rating;

-- ---------------------------------------------------------------------------
-- 2. Consultation types (3 slugs: regular / urgent / meeting)
-- ---------------------------------------------------------------------------
insert into public.consultation_types (slug, title, category, blurb, modes, sort_order)
values
  ('regular', 'استشارة عادية',   'استشارة', 'جلسة تناقش فيها موضوعك بهدوء وتطلع بخطوات واضحة.',
   array['video','audio']::text[], 1),
  ('urgent',  'استشارة مستعجل',  'استشارة', 'محتاج رأي دلوقتي؟ ميعاد أقرب وأولوية في الرد.',
   array['video','audio']::text[], 2),
  ('meeting', 'مقابلة',          'مقابلة',  'جلسة موسّعة وجهاً لوجه لمناقشة متعمّقة أو شراكة. المكان يتم تحديده بعد الحجز.',
   array['in-person']::text[],    3)
on conflict (slug) do update
  set title    = excluded.title,
      category = excluded.category,
      blurb    = excluded.blurb,
      modes    = excluded.modes;

-- ---------------------------------------------------------------------------
-- 3. Duration options — per-type pricing 
-- ---------------------------------------------------------------------------
-- Wiped and re-inserted every run so pricing edits in this file take effect.
delete from public.duration_options
where type_id in (select id from public.consultation_types where slug in ('regular','urgent','meeting'));

-- regular: video/audio, 15–60 min
insert into public.duration_options (type_id, minutes, prices, sort_order)
select id, 15, '{"video": 250, "audio": 180}'::jsonb, 1 from public.consultation_types where slug = 'regular'
union all
select id, 30, '{"video": 400, "audio": 300}'::jsonb, 2 from public.consultation_types where slug = 'regular'
union all
select id, 45, '{"video": 600, "audio": 450}'::jsonb, 3 from public.consultation_types where slug = 'regular'
union all
select id, 60, '{"video": 800, "audio": 600}'::jsonb, 4 from public.consultation_types where slug = 'regular';

-- urgent: video/audio, 15–60 min, higher prices
insert into public.duration_options (type_id, minutes, prices, sort_order)
select id, 15, '{"video": 400, "audio": 300}'::jsonb,   1 from public.consultation_types where slug = 'urgent'
union all
select id, 30, '{"video": 650, "audio": 500}'::jsonb,   2 from public.consultation_types where slug = 'urgent'
union all
select id, 45, '{"video": 900, "audio": 700}'::jsonb,   3 from public.consultation_types where slug = 'urgent'
union all
select id, 60, '{"video": 1150, "audio": 900}'::jsonb,  4 from public.consultation_types where slug = 'urgent';

-- meeting: in-person only, 30–90 min
insert into public.duration_options (type_id, minutes, prices, sort_order)
select id, 30, '{"in-person": 900}'::jsonb,  1 from public.consultation_types where slug = 'meeting'
union all
select id, 45, '{"in-person": 1200}'::jsonb, 2 from public.consultation_types where slug = 'meeting'
union all
select id, 60, '{"in-person": 1500}'::jsonb, 3 from public.consultation_types where slug = 'meeting'
union all
select id, 90, '{"in-person": 2100}'::jsonb, 4 from public.consultation_types where slug = 'meeting';

-- ---------------------------------------------------------------------------
-- 4. Availability rules — Sunday–Thursday 10:00–19:00 (Cairo business hours)
-- ---------------------------------------------------------------------------
delete from public.availability_rules
where expert_id = '11111111-1111-1111-1111-111111111111';

insert into public.availability_rules (expert_id, weekday, start_time, end_time)
values
  ('11111111-1111-1111-1111-111111111111', 0, '10:00', '19:00'),  -- Sunday
  ('11111111-1111-1111-1111-111111111111', 1, '10:00', '19:00'),  -- Monday
  ('11111111-1111-1111-1111-111111111111', 2, '10:00', '19:00'),  -- Tuesday
  ('11111111-1111-1111-1111-111111111111', 3, '10:00', '19:00'),  -- Wednesday
  ('11111111-1111-1111-1111-111111111111', 4, '10:00', '15:00');  -- Thursday half-day

-- ---------------------------------------------------------------------------
-- 5. Create bookable slots for the next 4 weeks (re-run any time to extend)
--    Needs 0002_security_hardening.sql. generate_slots() checks the caller is an
--    admin, so from the SQL editor (no logged-in user) use the direct form below.
-- ---------------------------------------------------------------------------
insert into public.availability_slots (expert_id, starts_at, duration_minutes)
select '11111111-1111-1111-1111-111111111111',
       (g.ts at time zone 'Africa/Cairo'), 15
from generate_series(0, 27) as i(n)
join public.availability_rules r
  on r.is_active
 and r.weekday = extract(dow from (current_date + i.n))::int
 and r.expert_id = '11111111-1111-1111-1111-111111111111'
cross join lateral generate_series(
  (current_date + i.n)::timestamp + r.start_time,
  (current_date + i.n)::timestamp + r.end_time - interval '15 minutes',
  interval '15 minutes'
) as g(ts)
where (g.ts at time zone 'Africa/Cairo') > now()
on conflict do nothing;
