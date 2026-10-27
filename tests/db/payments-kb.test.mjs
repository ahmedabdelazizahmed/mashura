import { makeDb, tryAs, as } from './harness.mjs'
import { fileURLToPath } from 'node:url'
const SQL = fileURLToPath(new URL('../../supabase/', import.meta.url))
import fs from 'node:fs'
const D = SQL
const db = await makeDb([D+'migrations/0001_init.sql', D+'migrations/0002_security_hardening.sql', D+'seed.sql', D+'migrations/0003_payments_and_knowledge.sql'])
await db.exec(fs.readFileSync(D+'migrations/0003_payments_and_knowledge.sql','utf8')) // re-run safe
await db.exec(fs.readFileSync(D+'seed_kb.sql','utf8'))
await db.exec(fs.readFileSync(D+'seed_kb.sql','utf8'))
let fails=0; const ok=(c,m)=>{ if(!c){fails++;console.log('FAIL',m)} else console.log('ok  ',m)}
const q1=(await db.query(`select kb_norm('  أَحْجِـز الاستشارة؟ ١٢٣ ') n, kb_stems('الحجوزات بتاعتي') s, count(*)::int c from kb_articles`)).rows[0]
console.log(q1)
const tests = [
 ['ازاي احجز','ازاي احجز استشارة؟'],
 ['عايز احجز ميعاد','ازاي احجز استشارة؟'],
 ['ازاي ادفع','ازاي ادفع؟'],
 ['اقدر ادفع بالكارت','هو الدفع بالكارت متاح؟'],
 ['الغي الحجز','ازاي الغي حجز؟'],
 ['عايز الغي الحجز بتاعي','ازاي الغي حجز؟'],
 ['نسيت الباسورد','نسيت كلمة المرور'],
 ['الاسعار كام','الاسعار كام؟'],
 ['عملت التحويل','عملت التحويل، اعمل ايه دلوقتي؟'],
 ['فين الفاتورة','ازاي اجيب الفاتورة؟'],
 ['انتو بتشتغلوا الخميس؟','ازاي اعرف المواعيد المتاحة؟'],
 ['فلوسي هترجع لو الغيت','لو دفعت وألغيت الحجز، فلوسي بترجع؟'],
]
for (const [q,exp] of tests){
  const r=(await db.query(`select question, score from kb_search($1,3)`,[q])).rows
  console.log(JSON.stringify(q), '→', r.map(x=>x.question.slice(0,22)+':'+x.score).join(' | '))
  ok(r[0] && (r[0].question===exp || (exp.includes('بالكارت') && r[0].question.includes('طرق'))) && Number(r[0].score)>=0.5, 'search: '+q)
}
const nr=(await db.query(`select * from kb_search('الطقس النهارده حر قوي',3)`)).rows
console.log('irrelevant →', nr.map(x=>x.question+':'+x.score)); ok(nr.every(x=>Number(x.score)<0.5),'irrelevant query stays under threshold')
ok((await db.query(`select * from kb_search('',3)`)).rows.length===0,'empty query -> nothing')
// RLS / grants
const U1='aaaaaaaa-0000-0000-0000-000000000001', U2='aaaaaaaa-0000-0000-0000-000000000002', ADM='aaaaaaaa-0000-0000-0000-0000000000ff'
for (const [id,em] of [[U1,'c1@x.com'],[U2,'c2@x.com'],[ADM,'adm@x.com']]) await db.query(`insert into auth.users(id,email,raw_user_meta_data) values($1,$2,'{"name":"عميل"}')`,[id,em])
await db.query(`update profiles set role='admin' where id=$1`,[ADM])
ok((await tryAs(db,'anon',null,`select count(*) from kb_search('احجز',3)`)).ok,'anon can kb_search')
ok((await tryAs(db,'anon',null,`select count(*) from kb_articles`)).rows?.[0]?.count>0,'anon reads active articles')
ok(!(await tryAs(db,'anon',null,`insert into kb_articles(question,answer) values('سؤال تجريبي طويل','جواب')`)).ok,'anon cannot insert article')
ok(!(await tryAs(db,'authenticated',U1,`insert into kb_articles(question,answer) values('سؤال تجريبي طويل','جواب')`)).ok,'client cannot insert article')
ok((await tryAs(db,'authenticated',ADM,`insert into kb_articles(question,answer) values('سؤال إداري جديد','جواب')`)).ok,'admin can insert article')
ok(!(await tryAs(db,'anon',null,`select * from site_settings`)).ok || (await tryAs(db,'anon',null,`select * from site_settings`)).rows.length===0,'anon cannot read settings')
ok((await tryAs(db,'authenticated',U1,`select * from site_settings`)).rows.length===4,'client reads settings')
ok(!(await tryAs(db,'authenticated',U1,`update site_settings set value='x' where key='pay_note'`)).n,'client cannot write settings')
ok((await tryAs(db,'authenticated',ADM,`update site_settings set value='01000000000' where key='pay_wallet_number'`)).n===1,'admin writes settings')
ok(!(await tryAs(db,'authenticated',ADM,`insert into site_settings(key,value) values('hack','x')`)).ok,'settings key whitelist')
// payment flow
const slot=(await db.query(`select starts_at from availability_slots where starts_at>now()+interval '3 hours' order by starts_at limit 1`)).rows[0].starts_at
const typ=(await db.query(`select id from consultation_types where slug='regular'`)).rows[0].id
const bk=await tryAs(db,'authenticated',U1,`select * from create_booking($1,30,'video',$2,'موضوع','wallet')`,[typ,slot])
console.log(bk.ok?'booking ok':bk.err)
const b=bk.rows[0]; const pay=(await db.query(`select * from payments where booking_id=$1`,[b.id])).rows[0]
ok(pay.status==='pending'&&pay.method==='wallet','wallet payment pending')
ok((await tryAs(db,'authenticated',U2,`select submit_payment_reference($1,'ABC123')`,[pay.id])).err?.includes('not_allowed'),'other client rejected')
ok((await tryAs(db,'anon',null,`select submit_payment_reference($1,'ABC123')`,[pay.id])).ok===false,'anon rejected')
ok((await tryAs(db,'authenticated',U1,`select submit_payment_reference($1,'ab')`,[pay.id])).err?.includes('invalid_reference'),'short ref rejected')
const sub=await tryAs(db,'authenticated',U1,`select * from submit_payment_reference($1,'  TX-998877 ')`,[pay.id])
ok(sub.ok&&sub.rows[0].provider_ref==='TX-998877'&&sub.rows[0].submitted_at,'ref stored trimmed')
ok(sub.rows[0].status==='pending','still pending until staff confirms')
const nn=(await db.query(`select recipient_id,type from notifications where type='payment_submitted'`)).rows
ok(nn.length===1&&nn[0].recipient_id===ADM,'admin notified')
ok(!(await tryAs(db,'authenticated',U1,`update payments set status='paid' where id=$1`,[pay.id])).n,'client cannot self-confirm')
const conf=await tryAs(db,'authenticated',ADM,`select * from set_payment_status($1,'paid')`,[pay.id])
ok(conf.ok&&conf.rows[0].status==='paid','admin confirms')
const cn=(await db.query(`select title,message from notifications where recipient_id=$1 and type='payment_paid'`,[U1])).rows
console.log(cn); ok(cn.length===1,'client notified on paid')
ok((await tryAs(db,'authenticated',U1,`select submit_payment_reference($1,'ZZZ999')`,[pay.id])).err?.includes('invalid_transition'),'cannot resubmit after paid')
console.log(fails?`${fails} FAILED`:'ALL PASSED')
process.exit(fails ? 1 : 0)
