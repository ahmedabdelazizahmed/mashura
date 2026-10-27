import { useMemo, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { types as fallbackTypes } from '@/lib/data'
import AssistantIcon from '@/components/AssistantIcon'
import { useTypes, useOpenSlots } from '@/lib/hooks'
import { toConsultationType, validStarts, cairoDayKey } from '@/lib/adapt'
import { useAuth } from '@/lib/auth'
import type { ConsultationType } from '@/types/data'
import '@/styles/landing.css'

const CONTACT_EMAIL = (import.meta.env.VITE_CONTACT_EMAIL as string | undefined)?.trim()

// ── small inline icons ───────────────────────────────────────────────────────
type P = { children: ReactNode; size?: number; fill?: boolean; sw?: number }
const Svg = ({ children, size = 24, fill, sw = 2 }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill ? 'currentColor' : 'none'} stroke={fill ? 'none' : 'currentColor'} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{children}</svg>
)
const ArrowLeft = ({ size = 20 }: { size?: number }) => <Svg size={size} sw={2.4}><path d="M19 12H5M11 6l-6 6 6 6" /></Svg>
const Logo = ({ size = 40 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden="true">
    <path d="M8 30c0-9 6-16 16-18 1 9-4 17-16 18z" fill="#0A7A4F" /><path d="M16 33c1-7 6-12 14-13-.5 7-5 12-14 13z" fill="#79C33F" /><path d="M26 6c2 2 3 5 2 8-2-1-3-4-2-8z" fill="#FFD23F" />
  </svg>
)

const TYPE_ICON: Record<string, ReactNode> = {
  regular: <Svg size={28}><path d="M4 5h16v11H9l-5 4z" /></Svg>,
  urgent: <Svg size={28} fill><path d="M13 2 4 14h7l-1 8 9-12h-7z" /></Svg>,
  meeting: <Svg size={28}><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6M16 5a3.5 3.5 0 0 1 0 7M18 14c2 .6 3.5 2.4 3.5 5" /></Svg>,
}
const modeText = (t: ConsultationType) => (t.modes.includes('in-person') ? 'حضوري' : 'فيديو أو صوت')
const minPrice = (t: ConsultationType) => {
  const all = t.durations.flatMap((d) => Object.values(d.prices) as number[])
  return all.length ? Math.min(...all) : t.price
}

const WEEK = ['السبت', 'الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة']
const CAIRO = 'Africa/Cairo'
const fmtTime = (iso: string) => new Date(iso).toLocaleTimeString('ar-EG', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: CAIRO })

// ── booking preview: real open slots, grouped by day ─────────────────────────
function BookingPreview() {
  const { data: rows } = useOpenSlots(60)
  const [monthOffset, setMonthOffset] = useState(0)
  const [pickedDay, setPickedDay] = useState<string | null>(null)
  const [pickedTime, setPickedTime] = useState<string | null>(null)

  const byDay = useMemo(() => {
    const m = new Map<string, string[]>()
    for (const s of validStarts(rows ?? [], 30)) {
      const k = cairoDayKey(s.startsAt)
      m.set(k, [...(m.get(k) ?? []), s.startsAt])
    }
    return m
  }, [rows])

  const base = new Date()
  const view = new Date(base.getFullYear(), base.getMonth() + monthOffset, 1)
  const y = view.getFullYear(), mo = view.getMonth()
  const daysIn = new Date(y, mo + 1, 0).getDate()
  const lead = (view.getDay() + 1) % 7 // Saturday-first week
  const monthLabel = view.toLocaleDateString('ar-EG-u-nu-latn', { month: 'long', year: 'numeric' })
  const key = (d: number) => `${y}-${String(mo + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`

  const firstAvail = useMemo(() => [...byDay.keys()].sort()[0] ?? null, [byDay])
  const activeDay = pickedDay && byDay.has(pickedDay) ? pickedDay : firstAvail
  const times = activeDay ? (byDay.get(activeDay) ?? []) : []
  // Offer a readable handful of times: on the hour first, then half hours.
  const shown = [...times].filter((_, i) => i % 2 === 0).slice(0, 6)
  const activeTime = pickedTime && shown.includes(pickedTime) ? pickedTime : shown[0] ?? null

  return (
    <div className="pv-card">
      <div className="pv-title">اختار موعد الجلسة</div>
      <div className="pv-month">
        <button type="button" aria-label="الشهر السابق" disabled={monthOffset === 0} onClick={() => setMonthOffset(0)}><Svg size={20}><path d="m9 6 6 6-6 6" /></Svg></button>
        <span>{monthLabel}</span>
        <button type="button" aria-label="الشهر التالي" disabled={monthOffset === 1} onClick={() => setMonthOffset(1)}><Svg size={20}><path d="m15 6-6 6 6 6" /></Svg></button>
      </div>
      <div className="pv-week">{WEEK.map((d) => <span key={d}>{d}</span>)}</div>
      <div className="pv-days">
        {Array.from({ length: lead }, (_, i) => <span key={'e' + i} />)}
        {Array.from({ length: daysIn }, (_, i) => {
          const d = i + 1
          const has = byDay.has(key(d))
          const sel = has && key(d) === activeDay
          return has
            ? <button key={d} type="button" className={'pv-day has' + (sel ? ' sel' : '')} onClick={() => { setPickedDay(key(d)); setPickedTime(null) }}>{d}</button>
            : <span key={d} className="pv-day">{d}</span>
        })}
      </div>
      <div className="pv-sub">المواعيد المتاحة</div>
      <div className="pv-times">
        {shown.length === 0 && <span className="pv-empty">لا توجد مواعيد متاحة حاليًا.</span>}
        {shown.map((t) => (
          <button key={t} type="button" className={'pv-time' + (t === activeTime ? ' sel' : '')} onClick={() => setPickedTime(t)}>{fmtTime(t)}</button>
        ))}
      </div>
      <Link to="/app" className="pill pill-solid pv-go">أكّد الحجز</Link>
    </div>
  )
}

const FAQ = [
  ['إزاي أحجز استشارة؟', 'اعمل حساب، اختار النوع والمدة، وبعدين اختار ميعاد من المواعيد المتاحة. أو اكتب للمساعد الذكي الميعاد اللي يناسبك وهو يجهّزه.'],
  ['أقدر ألغي الحجز؟', 'أيوه، من حسابك تقدر تشوف حجوزاتك وتلغيها، والميعاد بيرجع متاح.'],
  ['الجلسة بتتم إزاي؟', 'فيديو أو صوت للاستشارات، ووجهًا لوجه في المقابلة.'],
  ['إزاي أدفع؟', 'كاش وقت الجلسة، أو تحويل على محفظة إلكترونية أو إنستا باي. بعد التحويل بتكتب رقم العملية في حجزك ونأكّد الدفع ونبعتلك فاتورة.'],
  ['إزاي أعرف السعر؟', 'السعر بيظهر قبل التأكيد حسب نوع الاستشارة ومدتها.'],
]

export default function Landing() {
  const { data: typeRows } = useTypes()
  const { isAuthenticated } = useAuth()
  const types = (typeRows && typeRows.length ? typeRows.map(toConsultationType) : fallbackTypes)

  const openAssistant = () => window.dispatchEvent(new Event('mashura:open-assistant'))
  const year = new Date().getFullYear()

  return (
    <div className="ld">

      <header className="nav">
        <div className="wrap nav-in">
          <Link to="/" className="logo"><Logo /><b>مشورة</b></Link>
          <nav className="links" aria-label="التنقل الرئيسي">
            <a href="#types">الاستشارات</a><a href="#how">إزاي بيشتغل</a><a href="#faq">أسئلة شائعة</a>
          </nav>
          <div className="nav-actions">
            {isAuthenticated ? (
              <Link to="/app" className="pill pill-solid">حسابي</Link>
            ) : (
              <>
                <Link to="/login" className="pill pill-line">دخول</Link>
                <Link to="/signup" className="pill pill-solid">اعمل حساب</Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main>
        <section className="hero">
          <div className="wrap hero-in">
            <div className="hero-text">
              <svg className="spark" width="64" height="56" viewBox="0 0 64 56" fill="none" stroke="#FFC400" strokeWidth="5" strokeLinecap="round" aria-hidden="true"><path d="M8 28 22 20M26 12 30 4M42 18 50 8" /></svg>
              <h1>مشورة واضحة<br /><span>من غير لفّ ودوران</span></h1>
              <p className="lede">احجز جلسة استشارية مع خبير في مجالات الأعمال والشركات الناشئة، وخُد قرارك بثقة.</p>
              <div className="hero-cta">
                <Link to="/app" className="cta-big">احجز مشورة<span className="dot"><ArrowLeft /></span></Link>
              </div>
            </div>
            <div className="pv"><BookingPreview /></div>
          </div>
        </section>

        <div className="wrap">
          <div className="strip">
            <div><span className="ic y"><Svg size={26} fill><path d="M13 2 4 14h7l-1 8 9-12h-7z" /></Svg></span><span><b>مواعيد واضحة</b><small>المواعيد المتاحة بتظهر لحظيًا</small></span></div>
            <div><span className="ic"><Svg size={26}><rect x="3" y="6" width="13" height="12" rx="2" /><path d="m16 10 5-3v10l-5-3" /></Svg></span><span><b>جلسات أونلاين أو حضوري</b><small>فيديو أو صوت أو مقابلة وجهًا لوجه</small></span></div>
            <div><span className="ic"><Svg size={26}><path d="M12 3 5 6v5c0 4.5 3 8 7 10 4-2 7-5.5 7-10V6z" /><path d="m9 12 2 2 4-4" /></Svg></span><span><b>أسعار واضحة</b><small>السعر بيظهر قبل تأكيد الحجز</small></span></div>
          </div>
        </div>

        <section id="types" className="wrap sec">
          <h2>أنواع الاستشارات</h2>
          <p className="sub">اختار نوع الاستشارة اللي يناسب احتياجك</p>
          <div className="types">
            {types.map((t) => (
              <div key={t.id} className={'tcard' + (t.id === 'urgent' ? ' y' : '')}>
                <span className="ic">{TYPE_ICON[t.id] ?? TYPE_ICON.regular}</span>
                <h3>{t.title}</h3>
                <p>{t.blurb}</p>
                <div className="mode">{modeText(t)}</div>
                <div className="foot">
                  <Link to={`/app?type=${encodeURIComponent(t.id)}`} className="pill pill-line" style={{ borderColor: '#0A7A4F' }}>احجز<ArrowLeft size={18} /></Link>
                  <span className="price">تبدأ من {minPrice(t)} جنيه</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section id="how" className="wrap how-in" style={{ scrollMarginTop: 80 }}>
          <div className="center"><h2 style={{ fontSize: 40, fontWeight: 800, marginBottom: 8 }}>إزاي بيشتغل</h2><p style={{ margin: 0, color: '#3F5C52', fontSize: 18 }}>تلات خطوات بسيطة لحد ما تحجز جلستك</p></div>
          <div className="steps">
            <div className="step"><div className="disc"><span className="big"><Svg size={38}><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 10h18" /></Svg></span><span className="num">1</span></div><h3>اختار الاستشارة</h3><p>حدد النوع والمدة وطريقة الجلسة.</p></div>
            <div className="arrow" aria-hidden="true"><ArrowLeft size={28} /></div>
            <div className="step"><div className="disc"><span className="big"><Svg size={38}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></Svg></span><span className="num">2</span></div><h3>اختار الميعاد</h3><p>شوف المواعيد المتاحة وأكّد حجزك.</p></div>
            <div className="arrow" aria-hidden="true"><ArrowLeft size={28} /></div>
            <div className="step"><div className="disc"><span className="big"><Svg size={38}><rect x="3" y="6" width="13" height="12" rx="2" /><path d="m16 10 5-3v10l-5-3" /></Svg></span><span className="num">3</span></div><h3>ادخل الجلسة</h3><p>حجزك بيظهر في حسابك وتقدر تلغيه منه.</p></div>
          </div>
        </section>

        <section id="faq" className="faq">
          <div className="wrap faq-in">
            <div className="center"><h2 style={{ fontSize: 40, fontWeight: 800, marginBottom: 8 }}>أسئلة شائعة</h2><p style={{ margin: 0, color: '#3F5C52', fontSize: 18 }}>إجابات سريعة قبل ما تحجز</p></div>
            <div className="faq-grid">
              {FAQ.map(([q, a]) => <div className="faq-item" key={q}><h3>{q}</h3><p>{a}</p></div>)}
            </div>
          </div>
        </section>

        {/* The illustration lives in the last band, right above the footer. */}
        <div className="wrap band-wrap">
          <div className="band">
            <svg className="img" viewBox="0 0 420 250" fill="none" aria-hidden="true">
              <circle cx="200" cy="105" r="118" fill="#fff" fillOpacity=".09" />
              <path d="M52 168c-22-8-34-28-30-52 20 6 34 26 30 52z" fill="#2E9E5B" /><path d="M54 168c-6-26 2-50 22-66 8 24 0 50-22 66z" fill="#79C33F" /><path d="M54 170c14-12 36-16 54-6-8 14-30 20-54 6z" fill="#1F8A50" />
              <path d="M54 170v-26" stroke="#1B6B42" strokeWidth="3" strokeLinecap="round" /><path d="M30 168h48l-6 38H36z" fill="#F4EBC8" />
              <path d="M112 206c0-52 22-80 62-84l32 0c32 6 40 36 40 84z" fill="#F4F1E3" /><path d="M158 120q16 28 34 0z" fill="#D9A27A" /><rect x="164" y="98" width="20" height="30" rx="8" fill="#D9A27A" />
              <ellipse cx="174" cy="78" rx="30" ry="33" fill="#D9A27A" /><ellipse cx="143" cy="82" rx="5" ry="8" fill="#C98E66" />
              <path d="M142 74c-6-30 14-46 38-42 22 3 32 20 26 40-4-14-14-22-28-22-14 0-24 8-36 24z" fill="#1F2A24" />
              <circle cx="188" cy="82" r="3" fill="#1F2A24" /><circle cx="204" cy="80" r="3" fill="#1F2A24" /><path d="M186 98c6 5 14 4 19-2" stroke="#1F2A24" strokeWidth="3" strokeLinecap="round" />
              <path d="M128 150c-12 34-4 44 40 46l50-2" stroke="#F4F1E3" strokeWidth="26" strokeLinecap="round" strokeLinejoin="round" />
              <rect x="112" y="178" width="26" height="28" rx="4" fill="#fff" /><rect x="112" y="178" width="26" height="8" rx="3" fill="#5A3A26" /><path d="M138 186c9 0 9 14 0 14" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" />
              <rect x="212" y="116" width="136" height="90" rx="8" fill="#DADFDD" stroke="#B8C0BD" strokeWidth="2" /><circle cx="280" cy="161" r="7" fill="#C2CAC7" /><path d="M200 206h160l-6 8H206z" fill="#BFC7C4" />
              <rect x="10" y="206" width="400" height="12" rx="6" fill="#054A31" />
              <path d="M366 52l8-14M384 70l16-8M388 98l16 2" stroke="#FFD23F" strokeWidth="5" strokeLinecap="round" /><path d="M360 118l14 10M376 142l16 4" stroke="#7CE0A0" strokeWidth="5" strokeLinecap="round" />
            </svg>
            <div className="txt"><h2>ابدأ خطوتك القادمة مع مشورة</h2><p>احجز أول جلسة استشارية وحقق أهدافك</p></div>
            <Link to="/app" className="pill pill-yellow">احجز الآن<ArrowLeft /></Link>
          </div>
        </div>
      </main>

      <footer className="wrap foot">
        <div className="flogo"><Logo size={30} />مشورة</div>
        <nav aria-label="روابط التذييل">
          <a href="#types">الاستشارات</a><a href="#how">إزاي بيشتغل</a><a href="#faq">أسئلة شائعة</a>
          <Link to="/privacy">الخصوصية</Link><Link to="/terms">الشروط</Link>
          {CONTACT_EMAIL && <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>}
        </nav>
        <span>© {year} مشورة. جميع الحقوق محفوظة.</span>
      </footer>

      {/* Mobile: booking is always one thumb away */}
      <div className="sticky-cta">
        <Link to="/app" className="pill pill-solid">احجز مشورة</Link>
        <button type="button" className="pill pill-line" onClick={openAssistant}><AssistantIcon size={22} bubble="#0A6B45" spark="#fff" />اسأل المساعد</button>
      </div>
    </div>
  )
}
