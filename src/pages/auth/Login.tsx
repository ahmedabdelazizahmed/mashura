import { useSearchParams, Link, useNavigate } from 'react-router-dom'
import { FormEvent, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth'

export default function Login() {
  const [params] = useSearchParams()
  const nav = useNavigate()
  const { refreshProfile } = useAuth()
  const isAdmin = params.get('role') === 'admin'
  const redirect = params.get('redirect')

  const [email, setEmail] = useState('')
  const [pw, setPw] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password: pw })
    setLoading(false)
    if (error) {
      setError(error.message === 'Invalid login credentials'
        ? 'الإيميل أو كلمة السر غلط.'
        : error.message)
      return
    }
    await refreshProfile()
    // Prefer explicit ?redirect=, otherwise role-based default.
    if (redirect) nav(decodeURIComponent(redirect), { replace: true })
    else nav(isAdmin ? '/admin' : '/app', { replace: true })
  }

  const onGoogle = async () => {
    setError(null)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin + (isAdmin ? '/admin' : '/app') },
    })
    if (error) setError(error.message)
  }

  return (
    <div className="page">
      <aside className="aside">
        <Link to="/" className="brand">
          <span className="brand-ar">مشورة</span>
          <span className="brand-lt">MASHURA</span>
        </Link>
        <div className="tagline">
          <span className="overline">{isAdmin ? 'لوحة الأدمن' : 'مشورة بيزنس ومشاريع'}</span>
          <h1>{isAdmin ? 'كل شغل مشورة في مكان واحد' : 'ارجع لحجوزاتك ومواعيدك في مكان واحد'}</h1>
          <p>{isAdmin ? 'حجوزات، مواعيد، عملاء، مدفوعات — كلها في لوحة إدارة نظيفة، مصمّمة لأحمد.' : 'سجّل دخول عشان تشوف مشوراتك القادمة، تنزّل فواتيرك، أو تحجز مشورة جديدة مع أحمد.'}</p>
        </div>
        <div className="testimonial">
          <blockquote>"أول جلسة مع أحمد وفّرت عليّ شهرين من التخبّط. الحجز والدفع أخدوا دقيقتين."</blockquote>
          <cite>— كريم الشريف، مؤسس شركة ناشئة</cite>
        </div>
      </aside>

      <main className="main">
        <div className="top-nav">
          <span></span>
          <span>لسه ما عندكش حساب؟ <Link to="/signup"><strong>سجّل جديد</strong></Link></span>
        </div>
        <div className="form-wrap">
          <div className="role-links">
            <Link to="?role=client" className={`role-pill ${!isAdmin ? 'active' : ''}`}>
              <svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1"/></svg>
              دخول كعميل
            </Link>
            <Link to="?role=admin" className={`role-pill ${isAdmin ? 'active' : ''}`}>
              <svg viewBox="0 0 24 24"><path d="M12 2l8 4v6c0 5-3.5 9-8 10-4.5-1-8-5-8-10V6l8-4z"/></svg>
              ادخل للوحة الأدمن
            </Link>
          </div>
          <h2>{isAdmin ? 'دخول أحمد — لوحة الإدارة' : 'أهلاً بيك من تاني'}</h2>
          <p className="sub">{isAdmin ? 'دخول مخصّص للمستشار — يفتح لوحة إدارة الحجوزات والعملاء والمواعيد.' : 'ادخل بياناتك عشان توصل لحسابك.'}</p>
          <form onSubmit={onSubmit}>
            <div className="field">
              <label htmlFor="email">البريد الإلكتروني</label>
              <input className="input" type="email" id="email" placeholder="you@example.com" dir="ltr" style={{ textAlign: 'end' }} value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div className="field">
              <label htmlFor="pw">كلمة السر</label>
              <input className="input" type="password" id="pw" placeholder="••••••••" value={pw} onChange={e => setPw(e.target.value)} required />
            </div>
            {error && <div style={{ background: 'var(--status-danger-bg)', color: 'var(--status-danger-fg)', padding: '10px 14px', borderRadius: 'var(--radius-md)', fontSize: 'var(--size-body-sm)' }}>{error}</div>}
            <div className="field-row">
              <label className="check"><input type="checkbox" defaultChecked /> فكّرني</label>
              <Link to="/forgot" style={{ color: 'var(--pine-700)', fontWeight: 'var(--weight-medium)' }}>نسيت كلمة السر؟</Link>
            </div>
            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
              {loading ? 'جاري الدخول...' : (isAdmin ? 'دخول اللوحة' : 'دخول')}
            </button>
            {!isAdmin && (<>
              <div className="divider">أو</div>
              <div className="social">
                <button type="button" className="btn btn-secondary btn-full" onClick={onGoogle}>
                  <span className="g-icon"></span> كمّل بحساب جوجل
                </button>
              </div>
            </>)}
          </form>
          {!isAdmin && <p className="signup">لسه ما عندكش حساب؟ <Link to="/signup">اعمل واحد في نص دقيقة</Link></p>}
        </div>
        <div className="foot-legal">© مشورة · <a href="#">سياسة الخصوصية</a> · <a href="#">الشروط</a></div>
      </main>
    </div>
  )
}
