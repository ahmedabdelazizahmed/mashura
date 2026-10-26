import { useState, useEffect, useRef, ChangeEvent, KeyboardEvent, FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { authError, getPendingEmail } from '@/lib/safeRedirect'

const arNum = (n: number) =>
  String(n).padStart(2, '0').replace(/\d/g, (d) => '٠١٢٣٤٥٦٧٨٩'[+d])

export default function OTP() {
  const nav = useNavigate()
  const [params] = useSearchParams()
  const email = params.get('email') || getPendingEmail()
  const [digits, setDigits] = useState<string[]>(Array(6).fill(''))
  const [seconds, setSeconds] = useState(59)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const refs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    if (seconds <= 0) return
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000)
    return () => clearTimeout(t)
  }, [seconds])

  const onChange = (i: number) => (e: ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value.replace(/\D/g, '').slice(-1)
    setDigits((d) => { const n = [...d]; n[i] = v; return n })
    if (v && i < 5) refs.current[i + 1]?.focus()
  }
  const onKey = (i: number) => (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[i] && i > 0) refs.current[i - 1]?.focus()
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const token = digits.join('')
    if (token.length !== 6) { setError('الكود ٦ أرقام.'); return }
    if (!email) { setError('الإيميل مفقود من اللينك.'); return }
    setError(null)
    setLoading(true)
    const { error } = await supabase.auth.verifyOtp({ email, token, type: 'email' })
    setLoading(false)
    if (error) { setError(authError(error)); return }
    nav('/success?msg=verify', { replace: true })
  }

  const resend = async () => {
    if (!email) return
    setError(null)
    await supabase.auth.resend({ type: 'signup', email })
    setSeconds(59)
  }

  return (
    <div className="centered-page">
      <header className="centered-header">
        <Link to="/" className="brand"><span className="brand-ar">مشورة</span><span className="brand-lt">MASHURA</span></Link>
      </header>
      <main className="centered-main">
        <div className="centered-card">
          <div className="icon-badge">
            <svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M7 10h.01M11 10h.01M15 10h.01M7 14h.01M11 14h.01M15 14h.01" /></svg>
          </div>
          <div className="step-tabs"><span className="pip on"></span><span className="pip on"></span><span className="pip"></span></div>
          <h1>اكتب كود التحقق</h1>
          <p className="sub">
            بعتنا كود ٦ أرقام على <strong style={{ color: 'var(--pine-800)' }}>{email || 'إيميلك'}</strong>. الكود بيفضل شغّال ١٠ دقايق.
          </p>
          <form onSubmit={onSubmit}>
            <div className="otp-grid" dir="ltr">
              {digits.map((d, i) => (
                <input
                  key={i}
                  ref={(el) => { refs.current[i] = el }}
                  className={`otp-input${d ? ' filled' : ''}`}
                  maxLength={1}
                  inputMode="numeric"
                  pattern="[0-9]"
                  value={d}
                  onChange={onChange(i)}
                  onKeyDown={onKey(i)}
                />
              ))}
            </div>
            {error && <div style={{ background: 'var(--status-danger-bg)', color: 'var(--status-danger-fg)', padding: '10px 14px', borderRadius: 'var(--radius-md)', fontSize: 'var(--size-body-sm)', marginBottom: 12 }}>{error}</div>}
            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
              {loading ? 'جاري التحقق...' : 'أكّد الكود'}
            </button>
          </form>
          <div style={{ marginTop: 24, textAlign: 'center', fontSize: 'var(--size-body-sm)', color: 'var(--text-muted)' }}>
            ما وصلكش؟{' '}
            {seconds > 0 ? (
              <span style={{ color: 'var(--text-subtle)' }}>ابعت تاني بعد ٠٠:{arNum(seconds)}</span>
            ) : (
              <a onClick={resend} style={{ color: 'var(--pine-700)', fontWeight: 'var(--weight-semibold)', cursor: 'pointer' }}>ابعت كود جديد</a>
            )}
          </div>
          <p className="foot"><Link to="/verify">← رجوع لتأكيد الحساب</Link></p>
        </div>
      </main>
    </div>
  )
}
