-- ============================================================================
-- Mashura — remove everything added by seed-sample-data.sql. Safe to re-run.
-- Only rows marked as sample are touched (refs MSH-S…, emails @sample.mashura.test).
-- ============================================================================
begin;
select set_config('app.internal', '1', true);

delete from public.notifications
 where recipient_id in (select id from public.profiles where email like '%@sample.mashura.test')
    or data ->> 'booking_id' in (select id::text from public.bookings where ref like 'MSH-S%');

update public.availability_slots set is_booked = false, booking_id = null
 where booking_id in (select id from public.bookings where ref like 'MSH-S%');

delete from public.bookings where ref like 'MSH-S%';          -- payments go with them
delete from public.leads    where email like '%@sample.mashura.test';
delete from auth.users      where email like '%@sample.mashura.test';   -- profiles go with them

commit;
