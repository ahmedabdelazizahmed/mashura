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
  'أحمد فتحي',
  'مستشار بيزنس ومشاريع',
  'قضيت ١٢ سنة بين تأسيس شركات وتسعير منتجات وبناء فرق مبيعات. مشورة هي مكان أساعدك فيه بنفسي، مكالمة واحدة في المرة.',
  12, 940, 4.9
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
-- 3. Duration options — per-type pricing (mirrors src/lib/data.ts)
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
-- 5. Sample leads (only if table is empty — so we don't duplicate on re-run)
-- ---------------------------------------------------------------------------
insert into public.leads (name, email, phone, source, interest, status, note)
select * from (values
  ('هبة السيد',       'heba.elsayed@example.com',  '01055512340', 'اللاندينج',  'تسعير وربحية',   'new',       'دخلت من إعلان تسعير وسابت رقمها في نموذج التواصل.'),
  ('طارق منير',       'tarek.mounir@example.com',  '01277788899', 'إحالة',      'تأسيس مشروع',    'contacted', 'رشّحه كريم الشريف، حاب يعمل جلسة أول أسبوع في سبتمبر.'),
  ('ريم عبدالله',      'reem.a@example.com',        '01099988770', 'إنستجرام',   'نمو ومبيعات',    'qualified', 'استوديو أزياء ناشئ، محتاجة قنوات بيع أونلاين.'),
  ('خالد إبراهيم',    'khaled.i@example.com',      '01033322210', 'بحث جوجل',   'تمويل واستثمار', 'new',       'حاب يجهّز بيتش لمستثمر خليجي.'),
  ('سلمى فؤاد',       'salma.f@example.com',       '01144455566', 'لينكدإن',    'مراجعة سريعة',   'converted', 'حجزت جلسة مراجعة سريعة يوم ٢٤ أغسطس.')
) as t(name, email, phone, source, interest, status, note)
where not exists (select 1 from public.leads limit 1);
