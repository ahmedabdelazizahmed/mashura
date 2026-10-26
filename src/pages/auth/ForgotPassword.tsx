import { useState, FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { authError } from '@/lib/safeRedirect'

export default function ForgotPassword() {
  const [sent, setSent] = useState(false)
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: window.location.origin + '/reset',
    })
    setLoading(false)
    if (error) { setError(authError(error)); return }
    setSent(true)
  }

  const resend = () => setSent(false)

  return (
    <div className="centered-page">
      <header className="centered-header">
        <Link to="/" className="brand"><span className="brand-ar">مشورة</span><span className="brand-lt">MASHURA</span></Link>
      </header>
      <main className="centered-main">
        {!sent ? (
          <div className="centered-card">
            <div className="icon-badge">
              <svg viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="10" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
            </div>
            <div className="step-tabs"><span className="pip on"></span><span className="pip"></span><span className="pip"></span></div>
            <h1>نسيت كلمة السر؟</h1>
            <p className="sub">اكتب البريد اللي مسجّل بيه، وهنبعتلك لينك تحطّ منه كلمة سر جديدة.</p>
            <form onSubmit={onSubmit}>
              <div className="field">
                <label>البريد الإلكتروني</label>
                <input className="input" type="email" placeholder="you@example.com" dir="ltr" style={{ textAlign: 'end' }} value={email} onChange={e => setEmail(e.target.value)} required />
                <span className="hint">هنبعت اللينك على البريد ده.</span>
              </div>
              {error && <div style={{ background: 'var(--status-danger-bg)', color: 'var(--status-danger-fg)', padding: '10px 14px', borderRadius: 'var(--radius-md)', fontSize: 'var(--size-body-sm)', marginTop: 12 }}>{error}</div>}
              <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                {loading ? 'جاري الإرسال...' : 'ابعت لينك الاستعادة'}
              </button>
            </form>
            <p className="foot">فاكر كلمة السر؟ <Link to="/login">← رجوع للدخول</Link></p>
          </div>
        ) : (
          <div className="centered-card sent">
            <div className="icon-badge" style={{ margin: '0 auto 24px' }}>
              <svg viewBox="0 0 24 24"><path d="M4 4h16v16H4z" /><path d="M4 7l8 6 8-6" /></svg>
            </div>
            <div className="step-tabs"><span className="pip on"></span><span className="pip on"></span><span className="pip"></span></div>
            <h1>افحص بريدك</h1>
            <p className="sub">بعتنا لينك استعادة كلمة السر على:</p>
            <span className="email-chip">{email}</span>
            <p className="sub" style={{ marginTop: 24 }}>اللينك بيفضل شغّال لمدة ٦٠ دقيقة. لو ما وصلكش، شوف مجلد سبام أو جرّب تبعت تاني.</p>
            <div className="resend">ما وصلكش الإيميل؟ <a role="button" tabIndex={0} onClick={resend}>جرّب تاني</a></div>
            <p className="foot"><Link to="/login">← رجوع للدخول</Link></p>
          </div>
        )}
      </main>
    </div>
  )
}
