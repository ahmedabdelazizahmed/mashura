-- ============================================================================
-- Mashura — sample activity for a realistic dashboard (OPTIONAL).
-- Run in the Supabase SQL editor AFTER 0001, 0002, 0003 and seed.sql.
--
-- Adds: 8 sample clients, ~24 bookings (past + upcoming) with payments in every
-- state, and 8 leads. Nothing here touches your real accounts.
--   * Sample clients use the address @sample.mashura.test and cannot log in.
--   * Sample bookings have refs MSH-S00001…, invoices INV-S00001….
-- Remove everything with supabase/remove-sample-data.sql. Safe to re-run.
-- ============================================================================
begin;
select set_config('app.internal', '1', true);

-- 1. Sample clients (the profiles trigger creates their profile rows) ---------
insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
                        raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
                        confirmation_token, recovery_token, email_change_token_new, email_change,
                        email_change_token_current, phone_change, phone_change_token, reauthentication_token)
select '00000000-0000-0000-0000-000000000000', c.id, 'authenticated', 'authenticated', c.email, '', now(),
       '{"provider":"email","providers":["email"]}'::jsonb,
       jsonb_build_object('name', c.name, 'phone', c.phone, 'sample', true), now(), now(),
       '', '', '', '', '', '', '', ''
from (values
  ('5a000000-0000-4000-8000-000000000001'::uuid, 'منى حسام',     'mona.hossam@sample.mashura.test',   '01012345601'),
  ('5a000000-0000-4000-8000-000000000002'::uuid, 'كريم فاروق',   'karim.farouk@sample.mashura.test',  '01112345602'),
  ('5a000000-0000-4000-8000-000000000003'::uuid, 'سارة عادل',    'sara.adel@sample.mashura.test',     '01212345603'),
  ('5a000000-0000-4000-8000-000000000004'::uuid, 'ياسر منصور',   'yasser.mansour@sample.mashura.test','01012345604'),
  ('5a000000-0000-4000-8000-000000000005'::uuid, 'نادين سمير',   'nadine.samir@sample.mashura.test',  '01512345605'),
  ('5a000000-0000-4000-8000-000000000006'::uuid, 'عمر الشريف',   'omar.elsherif@sample.mashura.test', '01112345606'),
  ('5a000000-0000-4000-8000-000000000007'::uuid, 'هبة مصطفى',    'heba.mostafa@sample.mashura.test',  '01212345607'),
  ('5a000000-0000-4000-8000-000000000008'::uuid, 'طارق عبدالله', 'tarek.abdallah@sample.mashura.test','01012345608')
) as c(id, name, email, phone)
where not exists (select 1 from auth.users u where u.id = c.id);

-- 2. Bookings -----------------------------------------------------------------
--    day_off: days from today (Cairo). Negative = past. hhmm = Cairo time.
create temp table _s (n int, cl int, slug text, mode text, mins int, day_off int, hhmm text,
                      b_status text, topic text, pm text, p_status text, ref text) on commit drop;
insert into _s values
 ( 1,1,'regular','video',30,-52,'11:00','completed','مراجعة خطة تسعير لمنتج جديد','wallet','paid','4471920385'),
 ( 2,2,'regular','audio',30,-49,'13:30','completed','ترتيب أولويات الشهر الجاي للفريق','cash','paid',null),
 ( 3,3,'urgent' ,'video',15,-45,'10:15','completed','قرار عاجل: نقبل عرض الشراكة ولا لأ؟','wallet','paid','2209837461'),
 ( 4,4,'regular','video',60,-42,'15:00','completed','تحليل أسباب انخفاض المبيعات في آخر ربع','wallet','paid','8830275519'),
 ( 5,5,'meeting','in-person',60,-38,'12:00','completed','جلسة تخطيط لافتتاح فرع تاني','cash','paid',null),
 ( 6,6,'regular','audio',15,-35,'17:00','completed','سؤال سريع عن عقد مع مورّد','cash','paid',null),
 ( 7,7,'regular','video',45,-31,'11:30','completed','بناء ميزانية تشغيل لمشروع ناشئ','wallet','paid','5518203947'),
 ( 8,1,'regular','video',30,-28,'14:00','completed','متابعة الخطة السعرية بعد التجربة','wallet','paid','6643019278'),
 ( 9,8,'urgent' ,'audio',30,-24,'10:30','completed','مشكلة في التدفق النقدي ومحتاج حل قبل آخر الشهر','cash','paid',null),
 (10,3,'regular','video',30,-21,'16:00','cancelled','تغيير في المواعيد','wallet','failed',null),
 (11,2,'regular','video',45,-17,'13:00','completed','هيكلة الفريق قبل التوسع','wallet','paid','7752961034'),
 (12,4,'meeting','in-person',90,-14,'11:00','completed','ورشة استراتيجية: السنة الجاية','cash','paid',null),
 (13,5,'regular','audio',30,-11,'12:30','no_show','استشارة في خطة التسويق','cash','failed',null),
 (14,6,'regular','video',30,-9,'15:30','completed','مراجعة عرض تقديمي لمستثمر','wallet','refunded','3390847215'),
 (15,7,'urgent' ,'video',15,-6,'10:00','completed','تأكيد قرار توظيف سريع','wallet','paid','9916402873'),
 (16,8,'regular','video',60,-4,'14:30','completed','تقييم فكرة منتج جديد قبل ما نبدأ','wallet','paid','1184036592'),
 (17,1,'regular','video',30,-2,'11:00','completed','مراجعة ربع سنوية للأهداف','cash','paid',null),
 (18,2,'regular','video',30, 1,'12:00','confirmed','خطة إطلاق خدمة جديدة','wallet','pending','6029184730'),
 (19,3,'urgent' ,'audio',15, 1,'16:15','confirmed','سؤال عاجل عن تسعير عرض','cash','pending',null),
 (20,4,'regular','video',45, 2,'13:00','confirmed','مراجعة هيكل التكاليف','wallet','paid','2847719306'),
 (21,5,'meeting','in-person',60,3,'11:00','confirmed','اجتماع شراكة ومناقشة تفاصيل','cash','pending',null),
 (22,6,'regular','video',30, 4,'15:00','pending','تجهيز خطة عمل لجولة تمويل','wallet','pending','7405581926'),
 (23,7,'regular','audio',30, 5,'10:30','pending','استشارة عن توسع المبيعات للمحافظات','cash','pending',null),
 (24,8,'regular','video',30, 8,'17:00','pending','تحديد عروض الباقات للعملاء','wallet','pending',null);

insert into public.bookings (ref, client_id, expert_id, type_id, duration_option_id, mode, starts_at, minutes,
                             price_amount, status, topic, created_at)
select 'MSH-S' || lpad(s.n::text, 5, '0'),
       ('5a000000-0000-4000-8000-00000000000' || s.cl)::uuid,
       (select id from public.experts order by created_at limit 1),
       t.id, d.id, s.mode,
       ((date_trunc('day', now() at time zone 'Africa/Cairo') + make_interval(days => s.day_off) + s.hhmm::time) at time zone 'Africa/Cairo'),
       s.mins, (d.prices ->> s.mode)::numeric, s.b_status, s.topic,
       ((date_trunc('day', now() at time zone 'Africa/Cairo') + make_interval(days => least(s.day_off, 0) - 3) + time '10:00') at time zone 'Africa/Cairo')
from _s s
join public.consultation_types t on t.slug = s.slug
join public.duration_options d on d.type_id = t.id and d.minutes = s.mins
where (d.prices ->> s.mode) is not null
  and not exists (select 1 from public.bookings b where b.ref = 'MSH-S' || lpad(s.n::text, 5, '0'));

-- 3. Payments (final state straight away; the trigger on status changes is not involved) --
insert into public.payments (invoice_no, booking_id, amount, method, status, provider, provider_ref, submitted_at, paid_at, created_at)
select 'INV-S' || lpad(s.n::text, 5, '0'), b.id, b.price_amount, s.pm, s.p_status,
       case when s.ref is not null then 'manual-transfer' end, s.ref,
       case when s.ref is not null then b.created_at + interval '2 hours' end,
       case when s.p_status in ('paid','refunded') then b.starts_at - interval '1 hour' end,
       b.created_at
from _s s join public.bookings b on b.ref = 'MSH-S' || lpad(s.n::text, 5, '0')
where not exists (select 1 from public.payments p where p.booking_id = b.id);

-- 4. Hold the calendar slots of upcoming sample bookings -----------------------
update public.availability_slots a
   set is_booked = true, booking_id = b.id
  from public.bookings b
 where b.ref like 'MSH-S%' and b.status in ('pending','confirmed') and b.starts_at > now()
   and a.starts_at >= b.starts_at and a.starts_at < b.starts_at + make_interval(mins => b.minutes)
   and not a.is_booked and a.duration_minutes = 15;

-- The booking trigger notified staff while inserting; sample rows should not leave notifications behind.
delete from public.notifications
 where data ->> 'booking_id' in (select id::text from public.bookings where ref like 'MSH-S%');

-- 5. Leads --------------------------------------------------------------------
insert into public.leads (name, email, phone, source, interest, status, note, created_at)
select l.* from (values
  ('ريم عبدالله',  'reem.a@sample.mashura.test',   '01099988770', 'إنستجرام',  'نمو ومبيعات',     'qualified', 'استوديو أزياء ناشئ، محتاجة قنوات بيع أونلاين.', now() - interval '3 days'),
  ('خالد إبراهيم', 'khaled.i@sample.mashura.test', '01033322210', 'بحث جوجل',  'تمويل واستثمار',  'new',       'عايز يجهّز عرض لمستثمر.',                         now() - interval '2 days'),
  ('سلمى فؤاد',    'salma.f@sample.mashura.test',  '01144455566', 'لينكدإن',   'مراجعة سريعة',    'converted', 'حجزت جلسة مراجعة سريعة.',                         now() - interval '12 days'),
  ('أحمد مصطفى',   'ahmed.m@sample.mashura.test',  '01011122233', 'الموقع',    'تسعير وربحية',    'closed',    'الميزانية مش مناسبة دلوقتي.',                    now() - interval '20 days'),
  ('دينا الشناوي', 'dina.sh@sample.mashura.test',  '01288877766', 'إحالة',     'نمو ومبيعات',     'contacted', 'بتنتظر ميعاد الأسبوع الجاي.',                    now() - interval '6 days'),
  ('مصطفى حلمي',   'mostafa.h@sample.mashura.test','01155544433', 'فيسبوك',    'هيكلة فريق',      'new',       null,                                             now() - interval '1 day'),
  ('جنى طارق',     'jana.t@sample.mashura.test',   '01277766655', 'الموقع',    'خطة عمل',         'contacted', 'طلبت تفاصيل الأسعار.',                           now() - interval '5 days'),
  ('وليد صبري',    'walid.s@sample.mashura.test',  null,          'إحالة',     'مقابلة',          'qualified', 'عايز مقابلة حضورية.',                            now() - interval '8 days')
) as l(name, email, phone, source, interest, status, note, created_at)
where not exists (select 1 from public.leads x where x.email = l.email);

commit;
