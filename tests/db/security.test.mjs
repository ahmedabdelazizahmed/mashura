import { makeDb, as, tryAs } from './harness.mjs'
import { fileURLToPath } from 'node:url'
const SQL = fileURLToPath(new URL('../../supabase/', import.meta.url))
const D = SQL
const db = await makeDb([D+'migrations/0001_init.sql', D+'migrations/0002_security_hardening.sql'])
console.log('0001+0002 applied')
await db.exec(readSeed())
function readSeed(){ return `
insert into public.experts (id,name,title) values ('11111111-1111-1111-1111-111111111111','Expert','Consultant');
insert into public.consultation_types (slug,title,category,modes) values ('regular','استشارة عادية','x',array['video','audio']),('meeting','مقابلة','y',array['in-person']);
insert into public.duration_options (type_id,minutes,prices) select id,30,'{"video":400,"audio":300}'::jsonb from public.consultation_types where slug='regular';
insert into public.duration_options (type_id,minutes,prices) select id,30,'{"in-person":900}'::jsonb from public.consultation_types where slug='meeting';
insert into public.availability_rules (expert_id,weekday,start_time,end_time) select '11111111-1111-1111-1111-111111111111', d, '10:00','19:00' from generate_series(0,6) d;
`}
const U={owner:'aaaaaaaa-0000-0000-0000-000000000001',admin:'aaaaaaaa-0000-0000-0000-000000000002',viewer:'aaaaaaaa-0000-0000-0000-000000000003',c1:'aaaaaaaa-0000-0000-0000-000000000004',c2:'aaaaaaaa-0000-0000-0000-000000000005'}
for (const [k,id] of Object.entries(U)) await db.exec(`insert into auth.users(id,email,raw_user_meta_data) values ('${id}','${k}@t.com','{"name":"${k}","role":"owner"}')`)
await db.exec(`update public.profiles set role='owner' where id='${U.owner}'; update public.profiles set role='admin' where id='${U.admin}'; update public.profiles set role='viewer' where id='${U.viewer}'`)
let pass=0, fail=0
const ok=(name,cond,extra='')=>{ cond?pass++:fail++; console.log((cond?'PASS':'FAIL'),name,cond?'':extra) }
const roleOf=async id=>(await db.query(`select role from profiles where id='${id}'`)).rows[0].role
ok('signup ignores role in metadata', await roleOf(U.c1)==='client')

// slots
const g=await as(db,'authenticated',U.admin,`select generate_slots(current_date, current_date+7) n`)
ok('admin generates slots', g.rows[0].n>0, JSON.stringify(g.rows))
ok('viewer cannot generate', !(await tryAs(db,'authenticated',U.viewer,`select generate_slots(current_date,current_date+1)`)).ok)
ok('client cannot generate', !(await tryAs(db,'authenticated',U.c1,`select generate_slots(current_date,current_date+1)`)).ok)
const g2=await as(db,'authenticated',U.admin,`select generate_slots(current_date, current_date+7) n`)
ok('generate idempotent', g2.rows[0].n===0, JSON.stringify(g2.rows))

const typeId=(await db.query(`select id from consultation_types where slug='regular'`)).rows[0].id
const meetId=(await db.query(`select id from consultation_types where slug='meeting'`)).rows[0].id
const start=(await db.query(`select starts_at from availability_slots where starts_at > now()+interval '3 hours' and not is_booked order by starts_at limit 1`)).rows[0].starts_at.toISOString()

// direct writes
ok('client cannot insert booking directly', !(await tryAs(db,'authenticated',U.c1,`insert into bookings(client_id,type_id,mode,starts_at,minutes,price_amount) values ('${U.c1}','${typeId}','video',now()+interval '1 day',30,1)`)).ok)
ok('client cannot insert payment directly', !(await tryAs(db,'authenticated',U.c1,`insert into payments(booking_id,amount,method,status) values (gen_random_uuid(),1,'cash','paid')`)).ok)
ok('anon cannot insert lead directly', !(await tryAs(db,'anon',null,`insert into leads(name,email) values ('a','a@a.com')`)).ok)
ok('client cannot self-promote', !(await tryAs(db,'authenticated',U.c1,`update profiles set role='owner' where id='${U.c1}'`)).ok)
ok('client can update own name', (await tryAs(db,'authenticated',U.c1,`update profiles set name='New' where id='${U.c1}'`)).ok)

// booking
const bk=await tryAs(db,'authenticated',U.c1,`select * from create_booking('${typeId}',30,'video','${start}','topic','cash')`)
ok('client books via RPC', bk.ok, bk.err)
const b=bk.rows?.[0]
ok('price from DB (400)', b && Number(b.price_amount)===400, JSON.stringify(b))
ok('2 slots locked', (await db.query(`select count(*)::int n from availability_slots where booking_id='${b.id}' and is_booked`)).rows[0].n===2)
ok('payment pending 400', (await db.query(`select count(*)::int n from payments where booking_id='${b.id}' and status='pending' and amount=400`)).rows[0].n===1)
ok('double booking blocked', !(await tryAs(db,'authenticated',U.c2,`select * from create_booking('${typeId}',30,'video','${start}',null,'cash')`)).ok)
ok('overlap (shifted 15m) blocked', !(await tryAs(db,'authenticated',U.c2,`select * from create_booking('${typeId}',30,'video','${start}'::timestamptz+interval '15 minutes',null,'cash')`)).ok)
ok('wrong mode blocked', !(await tryAs(db,'authenticated',U.c2,`select * from create_booking('${typeId}',30,'in-person','${start}',null,'cash')`)).ok)
ok('wrong duration blocked', !(await tryAs(db,'authenticated',U.c2,`select * from create_booking('${typeId}',20,'video','${start}',null,'cash')`)).ok)
ok('anon cannot book', !(await tryAs(db,'anon',null,`select * from create_booking('${typeId}',30,'video','${start}',null,'cash')`)).ok)
ok('past/too-soon blocked', !(await tryAs(db,'authenticated',U.c2,`select * from create_booking('${typeId}',30,'video',now()+interval '10 minutes',null,'cash')`)).ok)
ok('client cannot update booking', !(await tryAs(db,'authenticated',U.c1,`update bookings set status='confirmed', price_amount=0 where id='${b.id}'`)).ok)
ok('client cannot confirm via RPC', !(await tryAs(db,'authenticated',U.c1,`select set_booking_status('${b.id}','confirmed')`)).ok)
ok('c2 cannot see c1 booking', (await as(db,'authenticated',U.c2,`select count(*)::int n from bookings`)).rows[0].n===0)
ok('c2 cannot cancel c1 booking', !(await tryAs(db,'authenticated',U.c2,`select cancel_booking('${b.id}')`)).ok)
ok('viewer sees booking', (await as(db,'authenticated',U.viewer,`select count(*)::int n from bookings`)).rows[0].n===1)
ok('viewer cannot confirm', !(await tryAs(db,'authenticated',U.viewer,`select set_booking_status('${b.id}','confirmed')`)).ok)
ok('admin cannot skip to completed', !(await tryAs(db,'authenticated',U.admin,`select set_booking_status('${b.id}','completed')`)).ok)
ok('admin confirms', (await tryAs(db,'authenticated',U.admin,`select set_booking_status('${b.id}','confirmed','https://meet.example.com/x')`)).ok)
ok('http url rejected', !(await tryAs(db,'authenticated',U.admin,`select set_booking_status('${b.id}',null,'javascript:alert(1)')`)).ok)
ok('client notified', (await db.query(`select count(*)::int n from notifications where recipient_id='${U.c1}' and type='booking_confirmed'`)).rows[0].n===1)
ok('staff notified of new booking', (await db.query(`select count(*)::int n from notifications where recipient_id='${U.admin}' and type='booking_new'`)).rows[0].n===1)
ok('client cannot insert notification', !(await tryAs(db,'authenticated',U.c1,`insert into notifications(recipient_id,type,title,message) values ('${U.c1}','x','x','x')`)).ok)

// slot tampering
ok('admin cannot free booked slot by hand', !(await tryAs(db,'authenticated',U.admin,`update availability_slots set is_booked=false where booking_id='${b.id}'`)).ok)
ok('admin cannot delete booked slot', !(await tryAs(db,'authenticated',U.admin,`delete from availability_slots where booking_id='${b.id}'`)).ok)
ok('viewer cannot block slot', (await tryAs(db,'authenticated',U.viewer,`update availability_slots set is_blocked=true where is_booked=false`)).n===0 || !(await tryAs(db,'authenticated',U.viewer,`update availability_slots set is_blocked=true where is_booked=false`)).ok)
ok('admin can block free slot', (await tryAs(db,'authenticated',U.admin,`update availability_slots set is_blocked=true where id=(select id from availability_slots where not is_booked order by starts_at desc limit 1)`)).ok)

// payments
const pay=(await db.query(`select id from payments where booking_id='${b.id}'`)).rows[0].id
ok('client cannot mark paid', !(await tryAs(db,'authenticated',U.c1,`select set_payment_status('${pay}','paid')`)).ok)
ok('admin marks paid', (await tryAs(db,'authenticated',U.admin,`select set_payment_status('${pay}','paid','ref1')`)).ok)
ok('paid->pending impossible', !(await tryAs(db,'authenticated',U.admin,`select set_payment_status('${pay}','pending')`)).ok)

// cancel frees slots
const bk2=await tryAs(db,'authenticated',U.c2,`select * from create_booking('${meetId}',30,'in-person','${start}'::timestamptz + interval '2 hours',null,'cash')`)
ok('second booking ok (different time)', bk2.ok, bk2.err)
const c=await tryAs(db,'authenticated',U.c2,`select * from cancel_booking('${bk2.rows[0].id}')`)
ok('client cancels own', c.ok && c.rows[0].status==='cancelled', c.err)
ok('cancel frees slots', (await db.query(`select count(*)::int n from availability_slots where booking_id='${bk2.rows[0].id}'`)).rows[0].n===0)
const bk3=await tryAs(db,'authenticated',U.c1,`select * from create_booking('${meetId}',30,'in-person','${start}'::timestamptz + interval '2 hours',null,'cash')`)
ok('slot re-bookable after cancel', bk3.ok, bk3.err)
ok('cancelled payment failed', (await db.query(`select count(*)::int n from payments where booking_id='${bk2.rows[0].id}' and status='failed'`)).rows[0].n===1)

// leads
ok('anon lead via RPC', (await tryAs(db,'anon',null,`select capture_lead('Sara','sara@x.com','01012345678','x','landing')`)).ok)
ok('lead dedupe', ((await tryAs(db,'anon',null,`select capture_lead('Sara','SARA@x.com')`)).ok) && (await db.query(`select count(*)::int n from leads`)).rows[0].n===1)
ok('bad email rejected', !(await tryAs(db,'anon',null,`select capture_lead('Sara','nope')`)).ok)
ok('anon cannot read leads', (await tryAs(db,'anon',null,`select * from leads`)).ok===false)
ok('client reads 0 leads', (await as(db,'authenticated',U.c1,`select count(*)::int n from leads`)).rows[0].n===0)
ok('viewer reads leads', (await as(db,'authenticated',U.viewer,`select count(*)::int n from leads`)).rows[0].n===1)

// roles
ok('admin cannot make owner', !(await tryAs(db,'authenticated',U.admin,`select set_user_role('c1@t.com','owner')`)).ok)
ok('admin can set reception', (await tryAs(db,'authenticated',U.admin,`select set_user_role('c2@t.com','reception')`)).ok)
ok('owner cannot demote self', !(await tryAs(db,'authenticated',U.owner,`select set_user_role('owner@t.com','client')`)).ok)
ok('client cannot set role', !(await tryAs(db,'authenticated',U.c1,`select set_user_role('c1@t.com','owner')`)).ok)
ok('reception can confirm', (await tryAs(db,'authenticated',U.c2,`select set_booking_status('${bk3.rows[0].id}','confirmed')`)).ok)
ok('anon reads catalog', (await tryAs(db,'anon',null,`select count(*) from consultation_types`)).ok)
ok('anon reads free slots', (await tryAs(db,'anon',null,`select count(*) from availability_slots`)).ok)
ok('anon cannot read profiles', !(await tryAs(db,'anon',null,`select * from profiles`)).ok)
console.log(`\n${pass} passed, ${fail} failed`)
process.exit(fail ? 1 : 0)
