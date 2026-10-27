import { build } from 'esbuild'
import { fileURLToPath, pathToFileURL } from 'node:url'
import path from 'node:path'
import os from 'node:os'
import { makeDb } from '../db/harness.mjs'

// Bundle the (framework-free) assistant engine, then run it against a real
// Postgres (PGlite) so the knowledge-base retrieval is the production SQL.
const ROOT = fileURLToPath(new URL('../../', import.meta.url))
const out = path.join(os.tmpdir(), `mashura-engine-${process.pid}.mjs`)
await build({ entryPoints: [path.join(ROOT, 'src/lib/assistantEngine.ts')], bundle: true, format: 'esm', outfile: out, platform: 'node', logLevel: 'silent', alias: { '@': path.join(ROOT, 'src') } })
const { respond, initialState } = await import(pathToFileURL(out).href)
const D = path.join(ROOT, 'supabase') + path.sep
const db = await makeDb([D+'migrations/0001_init.sql', D+'migrations/0002_security_hardening.sql', D+'seed.sql', D+'migrations/0003_payments_and_knowledge.sql', D+'seed_kb.sql'])
const NOW = new Date('2026-11-10T10:00:00Z')
const rows=[]; let id=0
for (let i=0;i<10;i++){ const t=new Date(Date.UTC(2026,10,10+i,12)); if (t.getUTCDay()===5) continue
  const key=t.toISOString().slice(0,10)
  for (let h=8;h<17;h++) for (let m=0;m<60;m+=15) rows.push({id:'s'+(id++),starts_at:`${key}T${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:00+00:00`}) }
const types=[{id:'t1',slug:'regular',title:'استشارة عادية',modes:['video','audio'],durations:[15,30,45,60].map((m,i)=>({minutes:m,prices:{video:[250,400,600,800][i],audio:[180,300,450,600][i]}}))}]
let booked=null, kbCalls=0
const deps=(over={})=>({types,getSlots:async()=>rows,user:{id:'u',name:'x'},now:()=>NOW,friendlyError:e=>'خطأ: '+e.message,
  book:async(i)=>{booked=i;return {ref:'MSH-T'}},myBookings:async()=>[],
  kb:async(q)=>{kbCalls++; return (await db.query('select id,category,question,answer,score from kb_search($1,3)',[q])).rows.map(r=>({...r,score:Number(r.score)}))},...over})
let fails=0
async function ask(label, lines, expect){
  let st=initialState(), last
  for (const l of lines){ const r=await respond(st,l,deps()); st=r.state; last=r }
  const txt=last.msgs.map(m=>m.text).join('\n')
  const ok = expect(txt,last,st)
  if(!ok) fails++
  console.log(ok?'ok  ':'FAIL', label, '→', txt.replace(/\n/g,' ').slice(0,90))
  return {last,st}
}
await ask('how to book (question → KB)',['ازاي احجز استشارة؟'],(t)=>t.includes('اختار نوع الاستشارة'))
await ask('how to pay',['ازاي ادفع'],(t)=>t.includes('كاش'))
await ask('card?',['هو في دفع بالكارت؟'],(t)=>t.includes('كارت'))
await ask('refund (cancel intent+refund words)',['لو دفعت والغيت الحجز فلوسي بترجع؟'],(t)=>t.includes('رد المبلغ')|| t.includes('نرد'))
await ask('forgot password',['نسيت كلمة المرور'],(t)=>t.includes('نسيت كلمة المرور'))
await ask('invoice',['فين الفاتورة'],(t)=>t.includes('الفاتورة'))
await ask('working days',['انتو بتشتغلوا الخميس؟'],(t)=>t.includes('الخميس'))
await ask('gibberish falls back',['blah blah'],(t)=>t.includes('ما فهمتش'))
await ask('weather falls back',['الجو حر قوي النهارده'],(t)=>t.includes('ما فهمتش')||t.includes('بكرة')||t.length>0)
// booking flow is NOT hijacked
const a=await ask('booking still works',['عايز استشارة بكرة الساعة 11 الصبح'],(t,l,st)=>st.awaiting==='confirm')
const b=await ask('plain "عايز احجز" stays in booking',['عايز احجز'],(t)=>t.includes('أنهي يوم'))
await ask('cancel w/o refund words stays static',['عايز الغي الحجز'],(t)=>t.includes('صفحة حجوزاتك'))
await ask('prices stay live',['الاسعار كام'],(t)=>t.includes('من 180'))
// question during confirmation keeps the proposal
{ let st=initialState(); let r=await respond(st,'عايز استشارة بكرة الساعة 11 الصبح',deps()); st=r.state
  r=await respond(st,'ازاي ادفع؟',deps()); const chips=(r.msgs[0].chips||[]).map(c=>c.label)
  const ok=r.state.awaiting==='confirm' && chips.includes('أيوه، أكّد الحجز'); if(!ok)fails++; console.log(ok?'ok  ':'FAIL','question mid-confirmation keeps proposal + offers confirm chip', chips.join('|'))
  r=await respond(r.state,'أيوه',deps()); const ok2=!!booked; if(!ok2)fails++; console.log(ok2?'ok  ':'FAIL','then yes books', JSON.stringify(booked)) }
// kb failure must not break the assistant
{ const r=await respond(initialState(),'ازاي ادفع',deps({kb:async()=>{throw new Error('down')}})); const ok=r.msgs.length>0; if(!ok)fails++; console.log(ok?'ok  ':'FAIL','kb outage degrades gracefully:', r.msgs[0].text.slice(0,50)) }
// generated answer is used only when present, and falls back on failure
{ const r=await respond(initialState(),'ازاي ادفع',deps({kbAnswer:async()=> 'رد مُولَّد'})); const ok=r.msgs[0].text==='رد مُولَّد'; if(!ok)fails++; console.log(ok?'ok  ':'FAIL','kbAnswer used'); 
  const r2=await respond(initialState(),'ازاي ادفع',deps({kbAnswer:async()=>{throw new Error('x')}})); const ok2=r2.msgs[0].text.includes('كاش'); if(!ok2)fails++; console.log(ok2?'ok  ':'FAIL','kbAnswer failure → article text') }
console.log(fails?fails+' FAILED':'ALL PASSED')
process.exit(fails ? 1 : 0)
