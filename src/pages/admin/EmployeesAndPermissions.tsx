import { useState } from 'react'
import { Card, Badge, Button, Icon, Input, Select } from '@/lib/ui'
import { PageHead } from './AdminShell'
import { useAuth } from '@/lib/auth'
import { useTeam } from '@/lib/hooks'
import * as api from '@/lib/api'

const ROLE_AR: Record<string, string> = { owner: 'المالك', admin: 'مدير', reception: 'استقبال', viewer: 'مشاهد', client: 'عميل' }
const ROLE_OPTIONS = [
  { value: 'admin', label: 'مدير' },
  { value: 'reception', label: 'استقبال' },
  { value: 'viewer', label: 'مشاهد' },
  { value: 'client', label: 'عميل (إزالة من الفريق)' },
]

// ============================================================
// TEAM — real list from the database. Roles are changed through the
// server-side set_user_role() function, which enforces who may do what.
// ============================================================
export function Employees() {
  const { profile } = useAuth()
  const { data, loading, error, refetch } = useTeam()
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('reception')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)

  const team = data ?? []
  const apply = async (mail: string, newRole: string) => {
    setBusy(true); setMsg(null)
    try {
      await api.setUserRole(mail, newRole)
      setMsg({ ok: true, text: 'اتحدّثت الصلاحية.' })
      setEmail(''); refetch()
    } catch (e) { setMsg({ ok: false, text: api.friendlyError(e) }) } finally { setBusy(false) }
  }

  return (
    <div className="adm-page">
      <PageHead title="الفريق" sub="مين من فريقك له دخول للوحة الإدارة، وبأنهي صلاحية." />

      <Card padding="lg" style={{ marginBottom: 'var(--space-8)' }}>
        <h3 style={{ fontSize: 'var(--size-h3)', marginBottom: 'var(--space-3)' }}>إضافة عضو للفريق</h3>
        <p style={{ fontSize: 'var(--size-body-sm)', color: 'var(--text-muted)', marginBottom: 'var(--space-6)' }}>
          الشخص لازم يكون عامل حساب في الموقع الأول. اكتب إيميله واختار دوره.
        </p>
        <div style={{ display: 'flex', gap: 'var(--space-5)', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <Input label="البريد الإلكتروني" dir="ltr" value={email} onChange={(e) => setEmail(e.target.value)} containerStyle={{ minWidth: 260 }} />
          <Select label="الدور" value={ROLE_OPTIONS.find((o) => o.value === role)?.label} options={ROLE_OPTIONS.map((o) => o.label)}
            onChange={(e: any) => setRole(ROLE_OPTIONS.find((o) => o.label === (e?.target?.value ?? e))?.value ?? 'reception')} />
          <Button loading={busy} disabled={!email.includes('@')} onClick={() => apply(email, role)}>أضف</Button>
        </div>
        {msg && <div role="status" style={{ marginTop: 'var(--space-5)', fontSize: 'var(--size-body-sm)', color: msg.ok ? 'var(--status-success-fg)' : 'var(--status-danger-fg)' }}>{msg.text}</div>}
      </Card>

      {loading && <p style={{ color: 'var(--text-muted)' }}>جاري التحميل…</p>}
      {error && <p style={{ color: 'var(--status-danger-fg)' }}>{api.friendlyError(error)}</p>}
      <Card padding="none" style={{ overflowX: 'auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1.4fr .8fr 1fr', gap: 'var(--space-6)', padding: 'var(--space-6) var(--space-7)', fontSize: 'var(--size-caption)', color: 'var(--text-subtle)', minWidth: 640 }}>
          <span>الاسم</span><span>الإيميل</span><span>الدور</span><span style={{ textAlign: 'end' }}>إجراء</span>
        </div>
        {team.map((m) => {
          const me = m.id === profile?.id
          return (
            <div key={m.id} style={{ display: 'grid', gridTemplateColumns: '1.6fr 1.4fr .8fr 1fr', gap: 'var(--space-6)', alignItems: 'center', padding: 'var(--space-6) var(--space-7)', borderTop: '1px solid var(--border-subtle)', minWidth: 640 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-5)' }}>
                <span style={{ width: 38, height: 38, borderRadius: '50%', background: 'var(--pine-700)', color: 'var(--sand-050)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'var(--weight-semibold)' }}>{m.name?.[0] ?? '؟'}</span>
                <span style={{ fontSize: 'var(--size-body-sm)', color: 'var(--text-title)', fontWeight: 'var(--weight-semibold)' }}>{m.name}{me ? ' (أنت)' : ''}</span>
              </div>
              <span dir="ltr" style={{ fontSize: 'var(--size-caption)', color: 'var(--text-muted)', textAlign: 'end' }}>{m.email}</span>
              <Badge tone={m.role === 'owner' ? 'success' : m.role === 'admin' ? 'brand' : 'neutral'} dot>{ROLE_AR[m.role] ?? m.role}</Badge>
              <div style={{ textAlign: 'end' }}>
                {!me && m.role !== 'owner' && (
                  <Button variant="ghost" size="sm" style={{ color: 'var(--status-danger-fg)' }} disabled={busy} onClick={() => apply(m.email, 'client')}>إزالة من الفريق</Button>
                )}
              </div>
            </div>
          )
        })}
        {!loading && team.length === 0 && <p style={{ padding: 'var(--space-9)', textAlign: 'center', color: 'var(--text-subtle)' }}>مفيش أعضاء.</p>}
      </Card>
    </div>
  )
}

// ============================================================
// PERMISSIONS — a read-only map of what each role can really do. These rules
// live in the database (Row Level Security + secure functions), so the page
// shows them; it does not pretend to edit them.
// ============================================================
const MATRIX: { label: string; group: string; roles: ('owner' | 'admin' | 'reception' | 'viewer')[] }[] = [
  { label: 'عرض الحجوزات والعملاء والمدفوعات', group: 'الاطلاع', roles: ['owner', 'admin', 'reception', 'viewer'] },
  { label: 'تأكيد الحجز وتغيير حالته وإضافة رابط الجلسة', group: 'الحجوزات', roles: ['owner', 'admin', 'reception'] },
  { label: 'تأكيد استلام الدفع أو رده', group: 'الحجوزات', roles: ['owner', 'admin', 'reception'] },
  { label: 'فتح وحظر مواعيد بعينها', group: 'المواعيد', roles: ['owner', 'admin', 'reception'] },
  { label: 'ضبط ساعات العمل وتوليد المواعيد', group: 'المواعيد', roles: ['owner', 'admin'] },
  { label: 'تعديل الخدمات والأسعار', group: 'الإعدادات', roles: ['owner', 'admin'] },
  { label: 'بيانات استلام الدفع وأسئلة المساعد', group: 'الإعدادات', roles: ['owner', 'admin'] },
  { label: 'متابعة العملاء المحتملين وتحديث حالتهم', group: 'العملاء', roles: ['owner', 'admin', 'reception'] },
  { label: 'إضافة أو إزالة استقبال ومشاهدين', group: 'الفريق', roles: ['owner', 'admin'] },
  { label: 'إضافة أو إزالة مديرين', group: 'الفريق', roles: ['owner'] },
]
const ROLES = ['owner', 'admin', 'reception', 'viewer'] as const

export function Permissions() {
  return (
    <div className="adm-page">
      <PageHead title="الصلاحيات" sub="إيه اللي يقدر يعمله كل دور. القواعد دي مطبّقة في قاعدة البيانات نفسها، فمفيش طريقة لتخطيها من الواجهة." />
      <Card padding="none" style={{ overflowX: 'auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: `2.4fr repeat(${ROLES.length}, 1fr)`, padding: 'var(--space-6) var(--space-8)', background: 'var(--surface-raised)', borderBottom: '1px solid var(--border-subtle)', fontSize: 'var(--size-caption)', fontWeight: 'var(--weight-semibold)', color: 'var(--pine-800)', minWidth: 640 }}>
          <span>الصلاحية</span>
          {ROLES.map((r) => <span key={r} style={{ textAlign: 'center' }}>{ROLE_AR[r]}</span>)}
        </div>
        {MATRIX.map((p, i) => (
          <div key={p.label} style={{ display: 'grid', gridTemplateColumns: `2.4fr repeat(${ROLES.length}, 1fr)`, padding: 'var(--space-6) var(--space-8)', alignItems: 'center', borderTop: i ? '1px solid var(--border-subtle)' : 'none', minWidth: 640 }}>
            <div>
              <div style={{ fontSize: 'var(--size-body-sm)', color: 'var(--text-title)', fontWeight: 'var(--weight-medium)' }}>{p.label}</div>
              <div style={{ fontSize: 'var(--size-caption)', color: 'var(--text-subtle)', marginTop: 2 }}>{p.group}</div>
            </div>
            {ROLES.map((r) => (
              <div key={r} style={{ display: 'flex', justifyContent: 'center', color: p.roles.includes(r) ? 'var(--status-success-fg)' : 'var(--text-subtle)' }}>
                {p.roles.includes(r) ? <Icon name="check-circle" size={20} /> : <span aria-label="غير متاح">—</span>}
              </div>
            ))}
          </div>
        ))}
      </Card>
    </div>
  )
}
