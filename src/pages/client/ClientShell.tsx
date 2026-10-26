import { useEffect, useState, ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/lib/ui'
import { expert } from '@/lib/data'
import { useAuth } from '@/lib/auth'

interface Props {
  view: string
  signedIn: boolean
  children: ReactNode
  onNav: (id: string) => void
}

function useScrolled() {
  const [s, setS] = useState(false)
  useEffect(() => {
    const on = () => setS(window.scrollY > 40)
    window.addEventListener('scroll', on)
    return () => window.removeEventListener('scroll', on)
  }, [])
  return s
}

export default function ClientShell({ view, signedIn, children, onNav }: Props) {
  const scrolled = useScrolled()
  const nav = useNavigate()
  const { profile, signOut } = useAuth()
  const displayName = profile?.name ?? '—'
  const initial = (displayName[0] ?? 'م').toUpperCase()

  const doLogout = async () => {
    await signOut()
    nav('/', { replace: true })
  }

  const links = [
    { id: 'home', label: 'الرئيسية' },
    { id: 'catalog', label: 'الاستشارات' },
    { id: 'account', label: 'حجوزاتي', authOnly: true },
  ]

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header style={{
        position: 'sticky', top: 0, zIndex: 40,
        background: scrolled ? 'var(--overlay-frost)' : 'transparent',
        backdropFilter: scrolled ? 'blur(10px)' : 'none',
        borderBottom: scrolled ? '1px solid var(--border-subtle)' : '1px solid transparent',
        transition: 'all var(--duration-base) var(--ease-out)',
      }}>
        <div style={{ maxWidth: 1160, margin: '0 auto', padding: '0 var(--space-8)', height: 72, display: 'flex', alignItems: 'center', gap: 'var(--space-9)' }}>
          <button type="button" onClick={() => onNav('home')} style={{ display: 'flex', alignItems: 'baseline', gap: 8, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--weight-black)', fontSize: 22, color: 'var(--pine-800)' }}>مشورة</span>
            <span style={{ fontSize: 10, letterSpacing: '.12em', color: 'var(--text-subtle)' }}>MASHURA</span>
          </button>
          <nav style={{ display: 'flex', gap: 'var(--space-8)', flex: 1 }}>
            {links.filter((l) => !l.authOnly || signedIn).map((l) => (
              <button key={l.id} type="button" onClick={() => onNav(l.id)} style={{
                background: 'none', border: 'none', cursor: 'pointer', padding: '8px 0',
                fontFamily: 'var(--font-sans)', fontSize: 'var(--size-body-sm)',
                fontWeight: view === l.id ? 'var(--weight-semibold)' : 'var(--weight-regular)',
                color: view === l.id ? 'var(--pine-800)' : 'var(--text-muted)',
                borderBottom: view === l.id ? '2px solid var(--saffron-500)' : '2px solid transparent',
              }}>{l.label}</button>
            ))}
          </nav>
          {signedIn ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button type="button" onClick={() => onNav('account')} title={displayName} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer' }}>
                <span style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--pine-700)', color: 'var(--sand-050)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 'var(--weight-semibold)' }}>{initial}</span>
              </button>
              <Button size="sm" variant="ghost" icon="log-out" onClick={doLogout}>خروج</Button>
            </div>
          ) : (
            <Button size="sm" icon="plus" onClick={() => onNav('catalog')}>احجز مشورة</Button>
          )}
        </div>
      </header>
      <main style={{ flex: 1 }}>{children}</main>
      <footer style={{ background: 'var(--surface-inverse)', padding: 'var(--space-10) var(--space-8)', marginTop: 'var(--space-13)' }}>
        <div style={{ maxWidth: 1160, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 'var(--space-7)', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--weight-black)', fontSize: 20, color: 'var(--sand-050)' }}>مشورة</span>
            <span style={{ fontSize: 'var(--size-caption)', color: 'var(--pine-200)' }}>مشورة واضحة من غير لفّ ودوران</span>
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-7)', color: 'var(--pine-200)', fontSize: 'var(--size-body-sm)' }}>
            <span>{expert.name}</span><span>·</span><span>{expert.title}</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
