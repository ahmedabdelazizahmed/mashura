import { useState, FormEvent, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'

export default function ResetPassword() {
  const nav = useNavigate()
  const [pw, setPw] = useState('')
  const [pw2, setPw2] = useState('')
  const [show, setShow] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [sessionReady, setSessionReady] = useState(false)

  // The reset email link puts the user in a temporary session; detectSessionInUrl
  // (set in supabase.ts) turns the URL fragment into a session automatically.
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSessionReady(!!data.session))
  }, [])

  const r = [
    pw.length >= 8,
    /[a-z]/.test(pw) && /[A-Z]/.test(pw),
    /\d/.test(pw),
    /[!@#$%^&*(),.?":{}|<>]/.test(pw),
  ]
  const score = r.filter(Boolean).length
  const label = ['اختار كلمة سر قوية', 'ضعيفة', 'متوسطة', 'قوية', 'قوية جدًا'][score]
  const barCls = (i: number) =>
    `strength-bar${i < score ? (score <= 1 ? ' weak' : score <= 2 ? ' med' : ' strong') : ''}`

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (pw !== pw2) { setErr('كلمة السر مش متطابقة.'); return }
    setErr(null)
    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password: pw })
    setLoading(false)
    if (error) { setErr(error.message); return }
    nav('/success?msg=pw', { replace: true })
  }

  return (
    <div className="centered-page">
      <header className="centered-header">
        <Link to="/" className="brand"><span className="brand-ar">مشورة</span><span className="brand-lt">MASHURA</span></Link>
      </header>
      <main className="centered-main">
        <div className="centered-card">
          <div className="icon-badge">
            <svg viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="10" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /><circle cx="12" cy="16" r="1.5" /></svg>
          </div>
          <div className="step-tabs"><span className="pip on"></span><span className="pip on"></span><span className="pip on"></span></div>
          <h1>حط كلمة سر جديدة</h1>
          <p className="sub">اختار كلمة سر قوية ما استخدمتهاش قبل كده. بعد الحفظ هنسجّل دخولك فورًا.</p>
          {!sessionReady && (
            <div style={{ background: 'var(--status-warning-bg)', color: 'var(--status-warning-fg)', padding: '10px 14px', borderRadius: 'var(--radius-md)', fontSize: 'var(--size-body-sm)', marginBottom: 16 }}>
              الصفحة دي بتشتغل بس لو دخلت من لينك الاستعادة اللي اتبعت على إيميلك.
            </div>
          )}
          <form onSubmit={onSubmit}>
            <div className="field">
              <label>كلمة السر الجديدة</label>
              <div style={{ position: 'relative' }}>
                <input className="input" type={show ? 'text' : 'password'} placeholder="على الأقل ٨ خانات" value={pw} onChange={(e) => setPw(e.target.value)} required minLength={8} />
                <button type="button" onClick={() => setShow((s) => !s)} style={{ position: 'absolute', insetInlineEnd: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-subtle)', padding: 8 }} aria-label="اعرض كلمة السر">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                </button>
              </div>
              <div className="strength">
                {[0, 1, 2, 3].map((i) => <div key={i} className={barCls(i)}></div>)}
              </div>
              <div className="strength-label">{label}</div>
              <ul className="reqs">
                <li className={r[0] ? 'ok' : ''}>٨ حروف على الأقل</li>
                <li className={r[1] ? 'ok' : ''}>حرف كبير وحرف صغير</li>
                <li className={r[2] ? 'ok' : ''}>رقم واحد على الأقل</li>
                <li className={r[3] ? 'ok' : ''}>علامة مميزة (! @ # …) — يفضّل</li>
              </ul>
            </div>
            <div className="field">
              <label>أكّد كلمة السر</label>
              <input className="input" type="password" placeholder="اكتبها تاني" value={pw2} onChange={(e) => { setPw2(e.target.value); setErr(null) }} required />
              {err && <span className="hint" style={{ color: 'var(--status-danger-fg)' }}>{err}</span>}
            </div>
            <button type="submit" className="btn btn-primary btn-full" disabled={loading || !sessionReady}>
              {loading ? 'جاري الحفظ...' : 'احفظ وادخل'}
            </button>
          </form>
          <p className="foot"><Link to="/login">← رجوع للدخول</Link></p>
        </div>
      </main>
    </div>
  )
}
