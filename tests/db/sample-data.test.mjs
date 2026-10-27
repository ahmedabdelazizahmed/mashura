import { makeDb, tryAs } from './harness.mjs'
import { fileURLToPath } from 'node:url'
const SQL = fileURLToPath(new URL('../../supabase/', import.meta.url))
import fs from 'node:fs'
const D = SQL
const db = await makeDb([D+'migrations/0001_init.sql', D+'migrations/0002_security_hardening.sql', D+'seed.sql', D+'migrations/0003_payments_and_knowledge.sql', D+'seed_kb.sql'])
let fails=0; const ok=(c,m)=>{ if(!c){fails++;console.log('FAIL',m)} else console.log('ok  ',m)}
const q=async s=>(await db.query(s)).rows
// a real (non-sample) user + booking must survive
await db.query(`insert into auth.users(id,email,raw_user_meta_data) values('aaaaaaaa-0000-0000-0000-000000000001','real@x.com','{"name":"حقيقي"}')`)
const slot=(await q(`select starts_at from availability_slots where starts_at>now()+interval '40 hours' order by starts_at limit 1`))[0].starts_at
const typ=(await q(`select id from consultation_types where slug='regular'`))[0].id
await db.exec(`set role authenticated; select set_config('request.jwt.claim.sub','aaaaaaaa-0000-0000-0000-000000000001',false);`)
await db.query(`select create_booking($1,30,'video',$2,'x','cash')`,[typ,slot])
await db.exec(`reset role; select set_config('request.jwt.claim.sub','',false);`)
const sql=fs.readFileSync(D+'seed-sample-data.sql','utf8')
await db.exec(sql); await db.exec(sql)   // twice = idempotent
const c=async(s)=>Number((await q(s))[0].n)
ok(await c(`select count(*) n from profiles where email like '%@sample.mashura.test'`)===8,'8 sample profiles via trigger')
ok(await c(`select count(*) n from bookings where ref like 'MSH-S%'`)===24,'24 sample bookings (no duplicates after 2nd run)')
ok(await c(`select count(*) n from payments p join bookings b on b.id=p.booking_id where b.ref like 'MSH-S%'`)===24,'24 payments')
ok(await c(`select count(*) n from leads where email like '%@sample.mashura.test'`)===8,'8 leads')
const st=await q(`select status,count(*)::int n from bookings where ref like 'MSH-S%' group by 1 order by 1`); console.log(st.map(r=>r.status+':'+r.n).join(' '))
const ps=await q(`select status,count(*)::int n from payments where invoice_no like 'INV-S%' group by 1 order by 1`); console.log(ps.map(r=>r.status+':'+r.n).join(' '))
ok(await c(`select count(*) n from notifications where data->>'booking_id' in (select id::text from bookings where ref like 'MSH-S%')`)===0,'no leftover notifications')
ok(await c(`select count(*) n from availability_slots a join bookings b on b.id=a.booking_id where b.ref like 'MSH-S%' and a.is_booked`)>0,'upcoming sample bookings hold slots')
ok(await c(`select count(*) n from bookings b join payments p on p.booking_id=b.id where b.ref like 'MSH-S%' and p.amount<>b.price_amount`)===0,'payment amount = booking price')
ok(await c(`select count(*) n from payments where invoice_no like 'INV-S%' and status='pending' and submitted_at is not null`)>=2,'some transfers waiting for confirmation')
const rev=await q(`select sum(amount)::int s from payments where invoice_no like 'INV-S%' and status='paid'`); console.log('paid total',rev[0].s)
ok(await c(`select count(*) n from bookings where ref not like 'MSH-S%'`)===1,'real booking untouched')
// admin dashboard sees them
await db.query(`insert into auth.users(id,email,raw_user_meta_data) values('aaaaaaaa-0000-0000-0000-0000000000ff','adm@x.com','{"name":"A"}')`); await db.query(`update profiles set role='admin' where id='aaaaaaaa-0000-0000-0000-0000000000ff'`)
const r=await tryAs(db,'authenticated','aaaaaaaa-0000-0000-0000-0000000000ff',`select count(*)::int n from payments`); ok(r.rows[0].n===25,'admin reads all payments')
const cr=await tryAs(db,'authenticated','5a000000-0000-4000-8000-000000000001',`select count(*)::int n from bookings`); ok(cr.rows[0].n===3,'sample client sees only own bookings ('+cr.rows[0].n+')')
// remove
const rm=fs.readFileSync(D+'remove-sample-data.sql','utf8')
await db.exec(rm); await db.exec(rm)
ok(await c(`select count(*) n from bookings where ref like 'MSH-S%'`)===0,'bookings removed')
ok(await c(`select count(*) n from payments where invoice_no like 'INV-S%'`)===0,'payments removed')
ok(await c(`select count(*) n from auth.users where email like '%@sample.mashura.test'`)===0,'sample users removed')
ok(await c(`select count(*) n from profiles where email like '%@sample.mashura.test'`)===0,'sample profiles removed')
ok(await c(`select count(*) n from leads where email like '%@sample.mashura.test'`)===0,'leads removed')
ok(await c(`select count(*) n from availability_slots where is_booked`)===2,'slots released (only real booking holds 2)')
ok(await c(`select count(*) n from bookings`)===1,'real booking still there')
console.log(fails?fails+' FAILED':'ALL PASSED')
process.exit(fails ? 1 : 0)
