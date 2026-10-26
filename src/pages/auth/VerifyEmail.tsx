import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { authError, getPendingEmail } from '@/lib/safeRedirect'

export default function VerifyEmail() {
  const email = getPendingEmail()
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [err, setErr] = useState<string | null>(null)

  const resend = async () => {
    if (!email || state === 'sending') return
    setState('sending'); setErr(null)
    const { error } = await supabase.auth.resend({ type: 'signup', email })
    if (error) { setErr(authError(error)); setState('error') } else setState('sent')
  }

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
          <h1>افحص بريدك</h1>
          <p className="sub">{email ? 'بعتنا لينك تأكيد على:' : 'بعتنا لينك تأكيد على الإيميل اللي سجّلت بيه.'}</p>
          {email && <span className="email-chip">{email}</span>}
          <p className="sub" style={{ marginTop: 24 }}>دوس على اللينك في الإيميل عشان تفعّل حسابك وتبدأ تحجز.</p>
          <div style={{ marginTop: 32, padding: 16, borderRadius: 'var(--radius-md)', background: 'var(--surface-raised)', border: '1px solid var(--border-subtle)', fontSize: 'var(--size-body-sm)', color: 'var(--text-muted)' }}>
            {state === 'sent' ? 'اتبعت تاني. شوف البريد ومجلد السبام.' : (
              <>ما وصلكش الإيميل؟ شوف مجلد سبام{email && <> أو <a role="button" tabIndex={0} onClick={resend} style={{ color: 'var(--pine-700)', fontWeight: 'var(--weight-semibold)', cursor: 'pointer' }}>{state === 'sending' ? 'جاري الإرسال…' : 'ابعت تاني'}</a></>}</>
            )}
            {err && <div role="alert" style={{ color: 'var(--status-danger-fg)', marginTop: 8 }}>{err}</div>}
          </div>
          <p className="foot-legal">دخلت إيميل غلط؟ <Link to="/signup">ارجع وعدّل</Link> · <Link to="/login">تسجيل الدخول</Link></p>
        </div>
      </main>
    </div>
  )
}
