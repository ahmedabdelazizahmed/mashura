import { Link, useSearchParams } from 'react-router-dom'

const MSGS: Record<string, [string, string]> = {
  pw: ['كلمة السر اتغيّرت', 'تقدر ترجع لحجوزاتك دلوقتي.'],
  verify: ['حسابك اتفعّل', 'أهلاً بيك في مشورة. جاهز تحجز أول جلسة؟'],
  booking: ['وصلنا طلب الحجز', 'تقدر تتابع حالة الحجز من حسابك.'],
}

export default function Success() {
  const [params] = useSearchParams()
  const key = params.get('msg') || 'verify'
  const [title, sub] = MSGS[key] || MSGS.verify

  return (
    <div className="centered-page">
      <header className="centered-header">
        <Link to="/" className="brand"><span className="brand-ar">مشورة</span><span className="brand-lt">MASHURA</span></Link>
      </header>
      <main className="centered-main">
        <div className="centered-card sm" style={{ textAlign: 'center' }}>
          <div style={{ width: 88, height: 88, borderRadius: '50%', background: 'var(--status-success-bg)', color: 'var(--status-success-fg)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="4,12 10,18 20,6" /></svg>
          </div>
          <h1>{title}</h1>
          <p className="sub">{sub}</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 32 }}>
            <Link to="/app" className="btn btn-primary btn-full">ابدأ أول حجز</Link>
            <Link to="/" className="btn btn-ghost btn-full">ارجع للرئيسية</Link>
          </div>
        </div>
      </main>
    </div>
  )
}
