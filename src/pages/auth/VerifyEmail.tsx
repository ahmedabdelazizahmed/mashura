import { Link } from 'react-router-dom'

export default function VerifyEmail() {
  return (
    <div className="centered-page">
      <header className="centered-header">
        <Link to="/" className="brand"><span className="brand-ar">مشورة</span><span className="brand-lt">MASHURA</span></Link>
      </header>
      <main className="centered-main">
        <div className="centered-card" style={{ textAlign: 'center' }}>
          <div className="icon-badge" style={{ margin: '0 auto 24px' }}>
            <svg viewBox="0 0 24 24"><path d="M4 4h16v16H4z" /><path d="M4 7l8 6 8-6" /></svg>
          </div>
          <div className="step-tabs"><span className="pip on"></span><span className="pip on"></span><span className="pip"></span></div>
          <h1>افحص بريدك</h1>
          <p className="sub">بعتنا لينك تأكيد على:</p>
          <span className="email-chip">you@example.com</span>
          <p className="sub" style={{ marginTop: 24 }}>دوس على اللينك في الإيميل عشان تفعّل حسابك وتبدأ تحجز. اللينك بيفضل شغّال ٣٠ دقيقة.</p>
          <div style={{ marginTop: 32, padding: 16, borderRadius: 'var(--radius-md)', background: 'var(--surface-raised)', border: '1px solid var(--border-subtle)', fontSize: 'var(--size-body-sm)', color: 'var(--text-muted)' }}>
            ما وصلكش الإيميل؟ شوف مجلد سبام أو <a href="#" style={{ color: 'var(--pine-700)', fontWeight: 'var(--weight-semibold)' }}>ابعت تاني</a>
          </div>
          <p className="foot"><Link to="/otp">استخدم كود التحقق بدال اللينك ←</Link></p>
          <p className="foot-legal">دخلت إيميل غلط؟ <Link to="/signup">ارجع وعدّل</Link></p>
        </div>
      </main>
    </div>
  )
}
