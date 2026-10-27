import { useState, FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { authError, googleAuthEnabled, setPendingEmail } from '@/lib/safeRedirect'

export default function Signup() {
  const nav = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [pw, setPw] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const r1 = pw.length >= 8
  const r2 = /[a-z]/.test(pw) && /[A-Z]/.test(pw)
  const r3 = /\d/.test(pw)
  const score = [r1, r2, r3].filter(Boolean).length
  const strong = r1 && r2 && r3
  const barCls = (i: number) =>
    `strength-bar${i < score ? (score === 1 ? ' weak' : score === 2 ? ' med' : ' strong') : ''}`

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (loading || !strong) return
    setError(null)
    setLoading(true)
    const cleanEmail = email.trim()
    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password: pw,
      options: { data: { name: name.trim().slice(0, 100), phone: phone.trim().slice(0, 30) || null }, emailRedirectTo: window.location.origin + '/app' },
    })
    setLoading(false)
    if (error) { setError(authError(error)); return }
    setPendingEmail(cleanEmail)
    // With email confirm OFF (dev), we have an immediate session → go to app.
    // With it ON, session is null and user must verify first.
    if (data.session) nav('/app', { replace: true })
    else nav('/verify', { replace: true })
  }

  const onGoogle = async () => {
    setError(null)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin + '/app' },
    })
    if (error) setError(authError(error))
  }

  return (
    <div className="page">
      <aside className="aside">
        <Link to="/" className="brand"><span className="brand-ar">مشورة</span><span className="brand-lt">MASHURA</span></Link>
        <div className="tagline">
          <span className="overline">ابدأ في دقيقتين</span>
          <h1>اعمل حساب واحجز أول مشورة بيزنس</h1>
          <p>الحساب مجاني، وتتابع منه كل حجوزاتك وتلغي حجزك قبل ما يتأكّد.</p>
        </div>
        <div className="testimonial">
          <blockquote>الميعاد اللي بتشوفه هو المتاح فعلاً. احجز في دقيقتين، وادفع كاش أو بتحويل، وهتلاقي فاتورتك وحجوزاتك في حسابك.</blockquote>
        </div>
      </aside>

      <main className="main">
        <div className="top-nav">
          <span></span>
          <span>عندك حساب؟ <Link to="/login"><strong>سجّل دخول</strong></Link></span>
        </div>
        <div className="form-wrap">
          <h2>اعمل حساب جديد</h2>
          <p className="sub">كل اللي محتاجه اسمك وإيميل شغّال. الباقي تكمّله وقت أول حجز.</p>
          <form onSubmit={onSubmit}>
            <div className="field">
              <label>الاسم بالكامل</label>
              <input className="input" type="text" placeholder="الاسم" autoComplete="name" maxLength={100} value={name} onChange={e => setName(e.target.value)} required />
            </div>
            <div className="field">
              <label>البريد الإلكتروني</label>
              <input className="input" type="email" autoComplete="email" placeholder="you@example.com" dir="ltr" style={{ textAlign: 'end' }} value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div className="field">
              <label>رقم الموبايل</label>
              <input className="input" type="tel" autoComplete="tel" maxLength={30} placeholder="01xxxxxxxxx" dir="ltr" style={{ textAlign: 'end' }} value={phone} onChange={e => setPhone(e.target.value)} />
              <span className="hint">اختياري — بيساعد المستشار يتواصل معاك بخصوص الحجز.</span>
            </div>
            <div className="field">
              <label>كلمة السر</label>
              <input className="input" type="password" autoComplete="new-password" placeholder="حروف وأرقام، على الأقل ٨ خانات" value={pw} onChange={(e) => setPw(e.target.value)} required minLength={8} />
              <div className="strength">
                <div className={barCls(0)}></div>
                <div className={barCls(1)}></div>
                <div className={barCls(2)}></div>
              </div>
              <ul className="reqs">
                <li className={r1 ? 'ok' : ''}>٨ حروف على الأقل</li>
                <li className={r2 ? 'ok' : ''}>حرف كبير وحرف صغير</li>
                <li className={r3 ? 'ok' : ''}>رقم واحد على الأقل</li>
              </ul>
            </div>
            {error && <div role="alert" style={{ background: 'var(--status-danger-bg)', color: 'var(--status-danger-fg)', padding: '10px 14px', borderRadius: 'var(--radius-md)', fontSize: 'var(--size-body-sm)' }}>{error}</div>}
            <label className="check" style={{ marginTop: 4 }}><input type="checkbox" required /> موافق على <Link to="/terms" target="_blank">شروط الاستخدام</Link> و<Link to="/privacy" target="_blank">سياسة الخصوصية</Link></label>
            <button type="submit" className="btn btn-primary btn-full" disabled={loading || !strong}>
              {loading ? 'جاري الإنشاء...' : 'اعمل حساب'}
            </button>
            {googleAuthEnabled() && (<>
              <div className="divider">أو</div>
              <div className="social">
                <button type="button" className="btn btn-secondary btn-full" onClick={onGoogle}>
                  <span className="g-icon"></span> كمّل بحساب جوجل
                </button>
              </div>
            </>)}
          </form>
          <p className="signup">لو تأكيد الإيميل مفعّل هتوصلك رسالة تأكيد بعد الإنشاء.</p>
        </div>
        <div className="foot-legal">© مشورة · <Link to="/privacy">سياسة الخصوصية</Link></div>
      </main>
    </div>
  )
}
