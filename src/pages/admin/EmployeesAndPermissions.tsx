import { useState } from 'react'
import { Card, Badge, Button, Icon, Input, Select, Switch, Dialog } from '@/lib/ui'
import { employees, roles as ROLES, permissions as PERMS, roleOf } from '@/lib/data'
import type { TeamMember, PermissionId } from '@/types/data'
import { PageHead } from './AdminShell'

function DemoBanner() {
  return (
    <div role="note" style={{ background: 'var(--saffron-100)', color: 'var(--text-title)', border: '1px solid var(--saffron-300, var(--border-subtle))', borderRadius: 'var(--radius-md)', padding: '10px 14px', fontSize: 'var(--size-body-sm)', marginBottom: 'var(--space-7)' }}>
      <strong>شكل توضيحي:</strong> البيانات هنا أمثلة، وتُفعَّل مع العميل الفعلي. لتغيير دور مستخدم فعلي استخدم <code dir="ltr">set_user_role</code> من قاعدة البيانات (موضّح في README).
    </div>
  )
}

const STATUS_TONE: Record<string, 'success' | 'warning' | 'danger'> = {
  'نشط': 'success', 'مدعوّ': 'warning', 'موقوف': 'danger',
}

// ============================================================
// EMPLOYEES  —  visual only (demo), admin-side. Table with inline actions.
// ============================================================
export function Employees() {
  const [q, setQ] = useState('')
  const [invite, setInvite] = useState(false)
  const [edit, setEdit] = useState<TeamMember | null>(null)

  const filtered = employees.filter((e) => !q || e.name.includes(q) || e.email.includes(q))
  const active = employees.filter((e) => e.status === 'نشط').length
  const invited = employees.filter((e) => e.status === 'مدعوّ').length

  return (
    <div className="adm-page">
      <PageHead title="الموظفون" sub="أضف فريقك وحدّد دور كل واحد — الصلاحيات بتتحكم في اللي يقدر يوصله."
        action={<div style={{ display: 'flex', gap: 'var(--space-5)' }}>
          <Input placeholder="ابحث..." icon="search" value={q} onChange={(e) => setQ(e.target.value)} containerStyle={{ minWidth: 240 }} />
      <DemoBanner />
          <Button icon="plus" onClick={() => setInvite(true)}>دعوة موظف</Button>
        </div>} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 'var(--space-6)', marginBottom: 'var(--space-8)' }}>
        <StatCard value={employees.length} label="إجمالي الفريق" color="var(--pine-800)" />
        <StatCard value={active} label="نشطون" color="var(--status-success-fg)" />
        <StatCard value={invited} label="دعوات معلّقة" color="var(--saffron-700)" />
      </div>

      <Card padding="none">
        <div style={{ display: 'grid', gridTemplateColumns: '1.8fr .9fr .7fr .8fr 1.2fr', gap: 'var(--space-6)', padding: 'var(--space-6) var(--space-7)', fontSize: 'var(--size-caption)', color: 'var(--text-subtle)' }}>
          <span>الموظف</span><span>الدور</span><span>الحالة</span><span>آخر نشاط</span><span style={{ textAlign: 'end' }}>إجراءات</span>
        </div>
        {filtered.length === 0 && <p style={{ padding: 'var(--space-9)', textAlign: 'center', color: 'var(--text-subtle)', fontSize: 'var(--size-body-sm)' }}>مفيش موظفين ينطبق عليهم البحث.</p>}
        {filtered.map((m) => {
          const role = roleOf(m.role)
          return (
            <div key={m.id} style={{ display: 'grid', gridTemplateColumns: '1.8fr .9fr .7fr .8fr 1.2fr', gap: 'var(--space-6)', alignItems: 'center', padding: 'var(--space-6) var(--space-7)', borderTop: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-5)' }}>
                <span style={{ width: 40, height: 40, borderRadius: '50%', background: m.status === 'مدعوّ' ? 'var(--sand-400)' : 'var(--pine-700)', color: 'var(--sand-050)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 'var(--weight-semibold)', flex: '0 0 auto' }}>{m.name[0]}</span>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 'var(--size-body-sm)', color: 'var(--text-title)', fontWeight: 'var(--weight-semibold)' }}>{m.name}</div>
                  <div style={{ fontSize: 'var(--size-caption)', color: 'var(--text-muted)', direction: 'ltr', textAlign: 'end' }}>{m.email}</div>
                </div>
              </div>
              <span>
                <span style={{ display: 'inline-block', padding: '4px 12px', borderRadius: 'var(--radius-pill)', background: 'var(--surface-brand-soft)', color: 'var(--pine-800)', fontSize: 'var(--size-caption)', fontWeight: 'var(--weight-semibold)' }}>{role.label}</span>
              </span>
              <Badge tone={STATUS_TONE[m.status]} dot={m.status === 'نشط'}>{m.status}</Badge>
              <span style={{ fontSize: 'var(--size-caption)', color: 'var(--text-muted)' }}>{m.lastActive || '—'}</span>
              <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                <Button variant="secondary" size="sm">الصلاحيات</Button>
                <Button variant="secondary" size="sm" onClick={() => setEdit(m)}>تعديل</Button>
                {m.role !== 'owner' && <Button variant="ghost" size="sm" style={{ color: 'var(--status-danger-fg)' }}>إزالة</Button>}
              </div>
            </div>
          )
        })}
      </Card>

      <p style={{ marginTop: 'var(--space-6)', fontSize: 'var(--size-caption)', color: 'var(--text-subtle)', textAlign: 'center' }}>
        المالك ما ينفعش يتشال. لتعديل ما يقدر عليه كل دور، روح لصفحة <strong style={{ color: 'var(--pine-700)' }}>الصلاحيات</strong>.
      </p>

      <Dialog open={invite} dir="rtl" onClose={() => setInvite(false)} title="دعوة موظف جديد"
        description="هنبعتله دعوة على الإيميل. لما يقبلها هيدخل الفريق فورًا."
        footer={<><Button onClick={() => setInvite(false)}>ابعت الدعوة</Button><Button variant="ghost" onClick={() => setInvite(false)}>إلغاء</Button></>}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', marginTop: 'var(--space-6)' }}>
          <Input label="الاسم" placeholder="اسم الموظف" />
          <Input label="البريد الإلكتروني" placeholder="teammate@mashura.eg" dir="ltr" />
          <Select label="الدور" options={ROLES.filter((r) => r.id !== 'owner').map((r) => r.label)} />
        </div>
      </Dialog>

      <Dialog open={!!edit} dir="rtl" onClose={() => setEdit(null)} title={edit?.name || ''} description={edit?.email}
        footer={<><Button onClick={() => setEdit(null)}>حفظ</Button><Button variant="ghost" onClick={() => setEdit(null)}>إلغاء</Button></>}>
        {edit && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', marginTop: 'var(--space-6)' }}>
            <Input label="الاسم" defaultValue={edit.name} />
            <Input label="الهاتف" defaultValue={edit.phone} dir="ltr" />
            <Select label="الدور" options={ROLES.map((r) => r.label)} value={roleOf(edit.role).label} />
          </div>
        )}
      </Dialog>
    </div>
  )
}

function StatCard({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <Card padding="lg" style={{ textAlign: 'center' }}>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 44, fontWeight: 'var(--weight-black)', color, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 'var(--size-body-sm)', color: 'var(--text-muted)', marginTop: 'var(--space-4)' }}>{label}</div>
    </Card>
  )
}

// ============================================================
// PERMISSIONS  —  matrix editor: rows = permissions, cols = roles.
// ============================================================
export function Permissions() {
  const [state, setState] = useState<Record<string, Set<PermissionId>>>(
    Object.fromEntries(ROLES.map((r) => [r.id, new Set(r.permissions)]))
  )
  const toggle = (roleId: string, permId: PermissionId) => {
    setState((s) => {
      const next = new Set(s[roleId])
      if (next.has(permId)) next.delete(permId)
      else next.add(permId)
      return { ...s, [roleId]: next }
    })
  }

  const roleTone = (id: string) =>
    id === 'owner' ? 'success' : id === 'admin' ? 'brand' : id === 'reception' ? 'warning' : 'neutral'

  return (
    <div className="adm-page">
      <PageHead title="الصلاحيات والأدوار" sub="حدّد كل دور بيقدر يعمل إيه. التغييرات بتتطبّق على كل موظف بنفس الدور."
        action={<Button icon="plus">إضافة دور</Button>} />
      <DemoBanner />

      {/* Role summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 'var(--space-6)', marginBottom: 'var(--space-9)' }}>
        {ROLES.map((r) => {
          const count = state[r.id].size
          return (
            <Card key={r.id} padding="lg">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Badge tone={roleTone(r.id) as any} dot>{r.label}</Badge>
                {r.builtin && <span style={{ fontSize: 10, color: 'var(--text-subtle)', letterSpacing: '.05em' }}>أساسي</span>}
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--size-body-lg)', color: 'var(--text-title)', fontWeight: 'var(--weight-semibold)', marginTop: 'var(--space-5)' }}>
                {count} من {PERMS.length}{' '}
                <span style={{ fontSize: 'var(--size-caption)', color: 'var(--text-muted)', fontWeight: 'var(--weight-regular)' }}>صلاحية</span>
              </div>
              <p style={{ fontSize: 'var(--size-caption)', color: 'var(--text-muted)', marginTop: 'var(--space-4)', lineHeight: 1.55 }}>{r.description}</p>
            </Card>
          )
        })}
      </div>

      {/* Matrix — rows = permission, cols = roles */}
      <Card padding="none">
        <div style={{ padding: 'var(--space-7) var(--space-8)', borderBottom: '1px solid var(--border-subtle)' }}>
          <h3 style={{ fontSize: 'var(--size-h3)' }}>مصفوفة الصلاحيات</h3>
          <p style={{ fontSize: 'var(--size-body-sm)', color: 'var(--text-muted)', marginTop: 'var(--space-3)' }}>افتح أو اقفل أي صلاحية لأي دور. المالك دايمًا عنده الكل.</p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: `2fr repeat(${ROLES.length}, 1fr)`,
          padding: 'var(--space-6) var(--space-8)',
          background: 'var(--surface-raised)',
          borderBottom: '1px solid var(--border-subtle)',
          fontSize: 'var(--size-caption)', color: 'var(--text-muted)', fontWeight: 'var(--weight-semibold)',
        }}>
          <span>الصلاحية</span>
          {ROLES.map((r) => (
            <span key={r.id} style={{ textAlign: 'center', color: 'var(--pine-800)' }}>{r.label}</span>
          ))}
        </div>

        {PERMS.map((p, i) => (
          <div key={p.id} style={{
            display: 'grid',
            gridTemplateColumns: `2fr repeat(${ROLES.length}, 1fr)`,
            padding: 'var(--space-6) var(--space-8)',
            alignItems: 'center',
            borderTop: i ? '1px solid var(--border-subtle)' : 'none',
          }}>
            <div>
              <div style={{ fontSize: 'var(--size-body-sm)', color: 'var(--text-title)', fontWeight: 'var(--weight-medium)' }}>{p.label}</div>
              <div style={{ fontSize: 'var(--size-caption)', color: 'var(--text-subtle)', marginTop: 2 }}>{p.group}</div>
            </div>
            {ROLES.map((r) => {
              const on = state[r.id].has(p.id)
              const locked = r.id === 'owner'
              return (
                <div key={r.id} style={{ display: 'flex', justifyContent: 'center' }}>
                  <Switch checked={on} onChange={locked ? undefined : () => toggle(r.id, p.id)} />
                </div>
              )
            })}
          </div>
        ))}
      </Card>

      <div style={{ display: 'flex', gap: 'var(--space-5)', marginTop: 'var(--space-8)', justifyContent: 'flex-end' }}>
        <Button variant="ghost">استعادة الافتراضي</Button>
        <Button>احفظ التغييرات</Button>
      </div>
    </div>
  )
}
