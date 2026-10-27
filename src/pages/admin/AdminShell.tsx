import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon, IconButton } from '@/lib/ui'
import { useAuth } from '@/lib/auth'

export type AdminView =
  | 'overview' | 'bookings' | 'types' | 'schedule'
  | 'clients' | 'leads' | 'payments' | 'notifications'
  | 'employees' | 'permissions' | 'knowledge'

// Sidebar is grouped into sections with subtle headers.
type NavItem = { id: AdminView; label: string; icon: string }
const NAV_GROUPS: { title: string; items: NavItem[] }[] = [
  {
    title: 'الإدارة',
    items: [
      { id: 'overview', label: 'نظرة عامة', icon: 'briefcase' },
      { id: 'bookings', label: 'الحجوزات', icon: 'calendar' },
      { id: 'schedule', label: 'المواعيد المتاحة', icon: 'clock' },
      { id: 'types', label: 'أنواع الاستشارات', icon: 'briefcase' },
      { id: 'leads', label: 'العملاء المحتملين', icon: 'user' },
      { id: 'clients', label: 'العملاء', icon: 'user' },
      { id: 'payments', label: 'المدفوعات', icon: 'credit-card' },
      { id: 'notifications', label: 'الإشعارات', icon: 'bell' },
      { id: 'knowledge', label: 'أسئلة المساعد', icon: 'message-circle' },
    ],
  },
  {
    title: 'الفريق والصلاحيات',
    items: [
      { id: 'employees', label: 'الفريق', icon: 'user' },
      { id: 'permissions', label: 'الصلاحيات', icon: 'shield-check' },
    ],
  },
]

interface Props { view: AdminView; onNav: (v: AdminView) => void; children: ReactNode }

export default function AdminShell({ view, onNav, children }: Props) {
  const nav = useNavigate()
  const { profile, signOut } = useAuth()
  const displayName = profile?.name ?? '—'
  const initial = (displayName[0] ?? 'أ').toUpperCase()
  const doLogout = async () => { await signOut(); nav('/', { replace: true }) }
  return (
    <div className="adm-shell">
      <aside className="adm-side" style={{ background: 'var(--surface-inverse)', padding: 'var(--space-8) var(--space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--space-9)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', paddingInlineStart: 'var(--space-4)' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--weight-black)', fontSize: 24, color: 'var(--sand-050)' }}>مشورة</span>
            <span style={{ fontSize: 10, letterSpacing: '.12em', color: 'var(--pine-200)' }}>MASHURA</span>
          </div>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, alignSelf: 'flex-start', padding: '4px 10px', borderRadius: 'var(--radius-pill)', background: 'var(--saffron-500)', color: 'var(--pine-950)', fontSize: 11, fontWeight: 'var(--weight-bold)', letterSpacing: '.04em' }}>
            <Icon name="shield-check" size={12} />
            لوحة الأدمن
          </span>
        </div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-7)' }}>
          {NAV_GROUPS.map((g) => (
            <div key={g.title} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              <div style={{ fontSize: 10, letterSpacing: '.12em', color: 'var(--pine-200)', opacity: 0.7, padding: '0 var(--space-5)', marginBottom: 4 }}>{g.title.toUpperCase()}</div>
              {g.items.map((n) => {
                const active = view === n.id
                return (
                  <button key={n.id} type="button" onClick={() => onNav(n.id)} style={{
                    display: 'flex', alignItems: 'center', gap: 'var(--space-5)', width: '100%',
                    border: 'none', cursor: 'pointer', textAlign: 'start',
                    padding: '10px var(--space-5)', borderRadius: 'var(--radius-md)',
                    background: active ? 'var(--saffron-500)' : 'transparent',
                    color: active ? 'var(--pine-950)' : 'var(--pine-200)',
                    fontFamily: 'var(--font-sans)', fontSize: 'var(--size-body-sm)',
                    fontWeight: active ? 'var(--weight-semibold)' : 'var(--weight-regular)',
                    transition: 'background var(--duration-fast) var(--ease-out)',
                  }}>
                    <Icon name={n.icon} size={18} />
                    <span style={{ flex: 1 }}>{n.label}</span>
                  </button>
                )
              })}
            </div>
          ))}
        </nav>
        <div style={{ marginTop: 'auto', paddingTop: 'var(--space-7)', borderTop: '1px solid var(--border-inverse)', display: 'flex', alignItems: 'center', gap: 'var(--space-5)' }}>
          <span style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--pine-600)', color: 'var(--sand-050)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'var(--weight-semibold)', fontSize: 14 }}>{initial}</span>
          <span style={{ flex: 1, fontSize: 'var(--size-body-sm)', color: 'var(--sand-050)' }}>{displayName}</span>
          <IconButton icon="log-out" label="خروج" size="sm" style={{ color: 'var(--pine-200)' }} onClick={doLogout} />
        </div>
      </aside>
      <main style={{ background: 'var(--sand-100)', overflow: 'auto', minWidth: 0 }}>{children}</main>
    </div>
  )
}

export function PageHead({ title, sub, action }: { title: string; sub?: string; action?: ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 'var(--space-8)', marginBottom: 'var(--space-9)', flexWrap: 'wrap' }}>
      <div>
        <h1 style={{ fontSize: 'var(--size-h1)' }}>{title}</h1>
        {sub && <p style={{ color: 'var(--text-muted)', marginTop: 'var(--space-4)' }}>{sub}</p>}
      </div>
      {action}
    </div>
  )
}
