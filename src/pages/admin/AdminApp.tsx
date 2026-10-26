import { useState, Fragment } from 'react'
import AdminShell, { PageHead, type AdminView } from './AdminShell'
import { Card, Badge, Button, Icon, IconButton, Tabs, Select, Input, Switch, Dialog } from '@/lib/ui'
import {
  expert, days, payments, notifications, bookingOf,
} from '@/lib/data'
import type { LeadStatus, Mode } from '@/types/data'
import {
  arDate, arTime, bookingClientName, bookingTypeTitle,
  toDisplayLead, LEAD_AR_TO_DB,
} from '@/lib/adapt'
import { useAllBookings, useClients, useLeads, useTypes } from '@/lib/hooks'
import type { TypeWithDurations } from '@/lib/api'
import * as api from '@/lib/api'
import { Employees, Permissions } from './EmployeesAndPermissions'

type Tone = 'brand' | 'neutral' | 'warning' | 'success' | 'danger'

// DB booking status → Arabic label + badge tone + grouping bucket.
const STATUS_AR: Record<string, string> = {
  pending: 'قيد الانتظار', confirmed: 'مؤكّد', completed: 'خلصت', cancelled: 'ملغي', no_show: 'لم يحضر',
}
const STATUS_TONE: Record<string, Tone> = {
  pending: 'warning', confirmed: 'success', completed: 'neutral', cancelled: 'danger', no_show: 'danger',
}
const modeAr = (m: string) => (m === 'video' ? 'فيديو' : m === 'audio' ? 'صوت' : 'مقابلة')
const modeIcon = (m: string) => (m === 'video' ? 'video' : m === 'in-person' ? 'user' : 'phone')

export default function AdminApp() {
  const [view, setView] = useState<AdminView>('overview')
  return (
    <AdminShell view={view} onNav={setView}>
      {view === 'overview' && <Overview onNav={setView} />}
      {view === 'bookings' && <Bookings />}
      {view === 'types' && <Types />}
      {view === 'schedule' && <Schedule />}
      {view === 'clients' && <Clients />}
      {view === 'leads' && <Leads />}
      {view === 'payments' && <Payments />}
      {view === 'notifications' && <Notifications />}
      {view === 'employees' && <Employees />}
      {view === 'permissions' && <Permissions />}
    </AdminShell>
  )
}

// Small shared bits ──────────────────────────────────────────────────────────
function StatCard({ icon, label, value, sub }: { icon: string; label: string; value: string | number; sub?: string }) {
  return (
    <Card padding="lg">
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-5)' }}>
        <span style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: 'var(--surface-brand-soft)', color: 'var(--pine-700)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name={icon} size={20} /></span>
        <span style={{ fontSize: 'var(--size-body-sm)', color: 'var(--text-muted)' }}>{label}</span>
      </div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--size-h2)', fontWeight: 'var(--weight-semibold)', color: 'var(--text-title)', marginTop: 'var(--space-6)' }}>{value}</div>
      {sub && <div style={{ fontSize: 'var(--size-caption)', color: 'var(--text-subtle)', marginTop: 4 }}>{sub}</div>}
    </Card>
  )
}

function LoadingLine() {
  return <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 'var(--space-9)' }}>جاري التحميل...</p>
}
function ErrorNote({ error }: { error: Error }) {
  return (
    <Card padding="lg" style={{ background: 'var(--status-danger-bg)', borderColor: 'var(--status-danger-fg)' }}>
      <strong style={{ color: 'var(--status-danger-fg)' }}>ما قدرناش نجيب البيانات</strong>
      <p style={{ fontSize: 'var(--size-body-sm)', color: 'var(--text-muted)', margin: '6px 0 0' }}>
        {error.message}. تأكد إن جداول Supabase اتنشأت.
      </p>
    </Card>
  )
}

// Overview ────────────────────────────────────────────────────────────────────
function Overview({ onNav }: { onNav: (v: AdminView) => void }) {
  const { data: rows, loading, error } = useAllBookings()
  const { data: clientRows } = useClients()
  const bookings = rows ?? []
  const upcoming = bookings.filter((b: any) => b.status === 'pending' || b.status === 'confirmed')
  const revenue = bookings
    .filter((b: any) => b.status !== 'cancelled' && b.status !== 'no_show')
    .reduce((s: number, b: any) => s + Number(b.price_amount), 0)
  const byType: Record<string, number> = {}
  bookings.forEach((b: any) => { const t = bookingTypeTitle(b); byType[t] = (byType[t] || 0) + 1 })
  const topType = Object.entries(byType).sort((a, b) => b[1] - a[1])[0]

  return (
    <div style={{ maxWidth: 1160, margin: '0 auto', padding: 'var(--space-11)' }}>
      <PageHead title="نظرة عامة" sub={`أهلاً ${expert.name.split(' ')[0]}، ده ملخص شغلك.`} />
      {loading && <LoadingLine />}
      {error && <ErrorNote error={error} />}
      {!loading && !error && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 'var(--space-6)' }}>
            <StatCard icon="calendar" label="حجوزات قادمة" value={upcoming.length} sub="قيد الانتظار أو مؤكّدة" />
            <StatCard icon="credit-card" label="إيرادات الحجوزات" value={`${revenue} ج.م`} sub="غير الملغاة" />
            <StatCard icon="user" label="عملاء" value={(clientRows ?? []).length} sub="عميل مسجّل" />
            <StatCard icon="briefcase" label="أكثر نوع مطلوب" value={topType ? topType[0] : '—'} sub={topType ? `${topType[1]} حجز` : ''} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 'var(--space-7)', marginTop: 'var(--space-10)', alignItems: 'start' }}>
            <Card padding="lg">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 'var(--space-6)' }}>
                <h3 style={{ fontSize: 'var(--size-h3)' }}>الحجوزات القادمة</h3>
                <Button variant="ghost" size="sm" onClick={() => onNav('bookings')}>كل الحجوزات</Button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
                {upcoming.length === 0 && <p style={{ color: 'var(--text-subtle)', fontSize: 'var(--size-body-sm)' }}>مفيش حجوزات قادمة.</p>}
                {upcoming.map((b: any) => {
                  const name = bookingClientName(b)
                  return (
                    <div key={b.id} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-6)', padding: 'var(--space-5) 0', borderTop: '1px solid var(--border-subtle)' }}>
                      <span style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--pine-700)', color: 'var(--sand-050)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 'var(--weight-semibold)' }}>{name[0]}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 'var(--size-body-sm)', fontWeight: 'var(--weight-medium)', color: 'var(--text-title)' }}>{name} · {bookingTypeTitle(b)}</div>
                        <div style={{ fontSize: 'var(--size-caption)', color: 'var(--text-muted)' }}>{arDate(b.starts_at)} — {arTime(b.starts_at)}</div>
                      </div>
                      <Badge tone="neutral">{modeAr(b.mode)}</Badge>
                    </div>
                  )
                })}
              </div>
            </Card>
            <Card padding="lg">
              <h3 style={{ fontSize: 'var(--size-h3)', marginBottom: 'var(--space-6)' }}>أنواع الاستشارات</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
                {Object.entries(byType).map(([title, count]) => (
                  <div key={title}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--size-body-sm)', marginBottom: 6 }}>
                      <span style={{ color: 'var(--text-body)' }}>{title}</span>
                      <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>{count}</span>
                    </div>
                    <div style={{ height: 6, borderRadius: 'var(--radius-pill)', background: 'var(--sand-200)' }}>
                      <div style={{ height: 6, borderRadius: 'var(--radius-pill)', background: 'var(--pine-700)', width: `${bookings.length ? (count / bookings.length) * 100 : 0}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}

// Bookings ────────────────────────────────────────────────────────────────────
function AdminBookingRow({ b }: { b: any }) {
  const name = bookingClientName(b)
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1.2fr .9fr .9fr .7fr .8fr', gap: 'var(--space-6)', alignItems: 'center', padding: 'var(--space-6) var(--space-7)', borderTop: '1px solid var(--border-subtle)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-5)' }}>
        <span style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--pine-700)', color: 'var(--sand-050)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 'var(--weight-semibold)', flex: '0 0 auto' }}>{name[0]}</span>
        <span style={{ fontSize: 'var(--size-body-sm)', color: 'var(--text-title)', fontWeight: 'var(--weight-medium)' }}>{name}</span>
      </div>
      <span style={{ fontSize: 'var(--size-body-sm)', color: 'var(--text-body)' }}>{bookingTypeTitle(b)}</span>
      <span style={{ fontSize: 'var(--size-body-sm)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}><Icon name={modeIcon(b.mode)} size={15} />{modeAr(b.mode)}</span>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--size-body-sm)', color: 'var(--text-muted)' }}>{arDate(b.starts_at)} · {arTime(b.starts_at)}</span>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--size-body-sm)', color: 'var(--text-title)' }}>{Number(b.price_amount)} ج.م</span>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Badge tone={STATUS_TONE[b.status]} dot={b.status === 'confirmed'}>{STATUS_AR[b.status]}</Badge>
        <IconButton icon="chevron-left" label="تفاصيل" size="sm" variant="ghost" />
      </div>
    </div>
  )
}

function Bookings() {
  const [tab, setTab] = useState('next')
  const { data: rows, loading, error } = useAllBookings()
  const all = rows ?? []
  const groups = {
    next: all.filter((b: any) => b.status === 'pending' || b.status === 'confirmed'),
    past: all.filter((b: any) => b.status === 'completed'),
    cancelled: all.filter((b: any) => b.status === 'cancelled' || b.status === 'no_show'),
  }
  const list = groups[tab as keyof typeof groups]
  return (
    <div style={{ maxWidth: 1160, margin: '0 auto', padding: 'var(--space-11)' }}>
      <PageHead title="الحجوزات" sub="كل حجز في الأول ما العميل يأكّده وحتى الفاتورة." />
      <Tabs value={tab} onChange={setTab} items={[
        { value: 'next', label: 'قادمة', count: groups.next.length },
        { value: 'past', label: 'سابقة', count: groups.past.length },
        { value: 'cancelled', label: 'ملغاة', count: groups.cancelled.length },
      ]} style={{ marginBottom: 'var(--space-8)' }} />
      {loading && <LoadingLine />}
      {error && <ErrorNote error={error} />}
      {!loading && !error && (
        <Card padding="none">
          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1.2fr .9fr .9fr .7fr .8fr', gap: 'var(--space-6)', padding: 'var(--space-6) var(--space-7)', fontSize: 'var(--size-caption)', color: 'var(--text-subtle)' }}>
            <span>العميل</span><span>النوع</span><span>الطريقة</span><span>الميعاد</span><span>السعر</span><span>الحالة</span>
          </div>
          {list.length === 0 && <p style={{ padding: 'var(--space-7)', color: 'var(--text-subtle)', fontSize: 'var(--size-body-sm)' }}>مفيش حجوزات في هذا القسم.</p>}
          {list.map((b: any) => <AdminBookingRow key={b.id} b={b} />)}
        </Card>
      )}
    </div>
  )
}

// أنواع الاستشارات: تحكم كامل للإدارة (إضافة/تعديل/حذف + الطرق والمدد والأسعار) ────
type DurDraft = { minutes: number; video: number; audio: number; inPerson: number }
type TypeDraft = {
  dbId?: string             // consultation_types.id (uuid) — undefined for new
  slug: string
  title: string
  category: string
  blurb: string
  video: boolean
  audio: boolean
  inPerson: boolean
  durations: DurDraft[]
}

function typeToDraft(t: TypeWithDurations): TypeDraft {
  const modes = t.modes ?? ['video', 'audio']
  return {
    dbId: t.id, slug: t.slug, title: t.title, category: t.category, blurb: t.blurb ?? '',
    video: modes.includes('video'),
    audio: modes.includes('audio'),
    inPerson: modes.includes('in-person'),
    durations: [...(t.durations ?? [])]
      .sort((a, b) => a.minutes - b.minutes)
      .map((d) => ({
        minutes: d.minutes,
        video: d.prices.video ?? 0,
        audio: d.prices.audio ?? 0,
        inPerson: d.prices['in-person'] ?? 0,
      })),
  }
}

const MIN_MINUTES = 15

function Types() {
  const { data: rows, loading, error, refetch } = useTypes()
  const list = (rows ?? []).map(typeToDraft)
  const [edit, setEdit] = useState<TypeDraft | null>(null)
  const [isNew, setIsNew] = useState(false)
  const [confirmDel, setConfirmDel] = useState<TypeDraft | null>(null)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  function openNew() {
    setIsNew(true)
    setSaveError(null)
    setEdit({ slug: `type-${Date.now()}`, title: '', category: 'استشارة', blurb: '',
      video: true, audio: true, inPerson: false,
      durations: [{ minutes: 15, video: 0, audio: 0, inPerson: 0 }] })
  }
  function openEdit(t: TypeDraft) {
    setIsNew(false)
    setSaveError(null)
    setEdit({ ...t, durations: t.durations.map((d) => ({ ...d })) })
  }
  function patch(p: Partial<TypeDraft>) { setEdit((e) => (e ? { ...e, ...p } : e)) }
  function patchDur(i: number, p: Partial<DurDraft>) {
    setEdit((e) => (e ? { ...e, durations: e.durations.map((d, j) => (j === i ? { ...d, ...p } : d)) } : e))
  }
  function addDur() {
    setEdit((e) => {
      if (!e) return e
      const last = e.durations[e.durations.length - 1]
      const next = last ? last.minutes + 15 : MIN_MINUTES
      return { ...e, durations: [...e.durations, { minutes: next, video: 0, audio: 0, inPerson: 0 }] }
    })
  }
  function removeDur(i: number) {
    setEdit((e) => (e ? { ...e, durations: e.durations.filter((_, j) => j !== i) } : e))
  }

  async function save() {
    if (!edit) return
    const modes: Mode[] = []
    if (edit.video) modes.push('video')
    if (edit.audio) modes.push('audio')
    if (edit.inPerson) modes.push('in-person')
    if (modes.length === 0) return  // guard: at least one mode required

    const cleanDurs = [...edit.durations]
      .map((d) => ({ ...d, minutes: Math.max(MIN_MINUTES, Math.round(d.minutes / 15) * 15 || MIN_MINUTES) }))
      .sort((a, b) => a.minutes - b.minutes)

    setSaving(true)
    setSaveError(null)
    try {
      const saved = await api.upsertType({
        slug: edit.slug,
        title: edit.title || 'نوع بدون اسم',
        category: edit.category,
        blurb: edit.blurb,
        modes,
        is_active: true,
      })
      const options = cleanDurs.map((d, i) => {
        const prices: Partial<Record<Mode, number>> = {}
        if (edit.video) prices.video = d.video
        if (edit.audio) prices.audio = d.audio
        if (edit.inPerson) prices['in-person'] = d.inPerson
        return { minutes: d.minutes, prices, sort_order: i }
      })
      await api.replaceDurations(saved.id, options)
      setEdit(null)
      refetch()
    } catch (e: any) {
      setSaveError(e?.message ?? 'ما قدرناش نحفظ. جرّب تاني.')
    } finally {
      setSaving(false)
    }
  }

  async function doDelete(t: TypeDraft) {
    if (t.dbId) {
      try { await api.deleteType(t.dbId); refetch() } catch { /* keep dialog messaging simple */ }
    }
    setConfirmDel(null)
  }

  const priceOf = (t: TypeDraft) => {
    const nums = t.durations.flatMap((d) => [
      t.video ? d.video : Infinity,
      t.audio ? d.audio : Infinity,
      t.inPerson ? d.inPerson : Infinity,
    ]).filter((n) => Number.isFinite(n) && n > 0)
    return nums.length ? Math.min(...nums) : 0
  }

  const editModeCount = edit ? (Number(edit.video) + Number(edit.audio) + Number(edit.inPerson)) : 0

  return (
    <div style={{ maxWidth: 1160, margin: '0 auto', padding: 'var(--space-11)' }}>
      <PageHead title="أنواع الاستشارات" sub="تحكّم كامل: أضف نوع، فعّل الفيديو أو الصوت أو المقابلة، وحدّد كل مدة وسعرها (من ربع ساعة)."
        action={<Button icon="plus" onClick={openNew}>نوع جديد</Button>} />
      {loading && <LoadingLine />}
      {error && <ErrorNote error={error} />}
      {!loading && !error && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 'var(--space-6)' }}>
          {list.length === 0 && <p style={{ color: 'var(--text-subtle)', fontSize: 'var(--size-body-sm)' }}>مفيش أنواع لسه — أضف أول نوع.</p>}
          {list.map((t) => (
            <Card key={t.slug} padding="lg">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Badge tone="neutral">{t.category}</Badge>
                <div style={{ display: 'flex', gap: 4 }}>
                  <IconButton icon="edit" label="تعديل" size="sm" variant="ghost" onClick={() => openEdit(t)} />
                  <IconButton icon="trash-2" label="حذف" size="sm" variant="ghost" onClick={() => setConfirmDel(t)} />
                </div>
              </div>
              <h3 style={{ fontSize: 'var(--size-h3)', marginTop: 'var(--space-5)' }}>{t.title || '—'}</h3>
              <p style={{ fontSize: 'var(--size-body-sm)', color: 'var(--text-muted)', marginTop: 'var(--space-4)' }}>{t.blurb}</p>
              <div style={{ display: 'flex', gap: 6, marginTop: 'var(--space-6)', flexWrap: 'wrap' }}>
                {t.video && <Badge tone="brand"><span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><Icon name="video" size={13} />فيديو</span></Badge>}
                {t.audio && <Badge tone="neutral"><span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><Icon name="phone" size={13} />صوت</span></Badge>}
                {t.inPerson && <Badge tone="warning"><span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><Icon name="user" size={13} />مقابلة</span></Badge>}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 'var(--space-6)' }}>
                {t.durations.map((d) => (
                  <span key={d.minutes} style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--size-caption)', color: 'var(--text-muted)', background: 'var(--sand-100)', padding: '3px 8px', borderRadius: 'var(--radius-pill)' }}>{d.minutes} د</span>
                ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 'var(--space-6)', fontFamily: 'var(--font-mono)', fontSize: 'var(--size-body-sm)' }}>
                <span style={{ color: 'var(--text-subtle)', fontSize: 'var(--size-caption)' }}>يبدأ من</span>
                <span style={{ fontWeight: 'var(--weight-semibold)', color: 'var(--text-title)' }}>{priceOf(t)} ج.م</span>
              </div>
              <Button variant="secondary" size="sm" fullWidth style={{ marginTop: 'var(--space-7)' }} onClick={() => openEdit(t)}>تعديل الطرق والمدد والأسعار</Button>
            </Card>
          ))}
        </div>
      )}

      {/* محرّر النوع */}
      <Dialog open={!!edit} dir="rtl" onClose={() => setEdit(null)}
        title={isNew ? 'نوع استشارة جديد' : `تعديل — ${edit?.title || ''}`}
        description="حدّد طرق الاستشارة والمدد وأسعارها. التعديل يسري على الحجوزات الجديدة."
        footer={<>
          <Button onClick={save} loading={saving} disabled={!edit || (!edit.video && !edit.audio && !edit.inPerson)}>حفظ</Button>
          <Button variant="ghost" onClick={() => setEdit(null)}>إلغاء</Button>
        </>}>
        {edit && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', marginTop: 'var(--space-6)' }}>
            {saveError && (
              <div style={{ background: 'var(--status-danger-bg)', color: 'var(--status-danger-fg)', padding: 'var(--space-5)', borderRadius: 'var(--radius-md)', fontSize: 'var(--size-body-sm)' }}>{saveError}</div>
            )}
            <Input label="اسم النوع" value={edit.title} onChange={(e) => patch({ title: e.target.value })} placeholder="مثال: استشارة عادية" />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-5)' }}>
              <Input label="التصنيف" value={edit.category} onChange={(e) => patch({ category: e.target.value })} />
              <Input label="وصف مختصر" value={edit.blurb} onChange={(e) => patch({ blurb: e.target.value })} />
            </div>

            <div>
              <div style={{ fontSize: 'var(--size-body-sm)', fontWeight: 'var(--weight-semibold)', color: 'var(--text-title)', marginBottom: 'var(--space-5)' }}>طرق الاستشارة</div>
              <div style={{ display: 'flex', gap: 'var(--space-7)', flexWrap: 'wrap' }}>
                <Switch label="فيديو" checked={edit.video} onChange={(e) => patch({ video: e.target.checked })} />
                <Switch label="صوت" checked={edit.audio} onChange={(e) => patch({ audio: e.target.checked })} />
                <Switch label="مقابلة (وجهاً لوجه)" checked={edit.inPerson} onChange={(e) => patch({ inPerson: e.target.checked })} />
              </div>
              {editModeCount === 0 && (
                <p style={{ fontSize: 'var(--size-caption)', color: 'var(--status-danger-fg)', marginTop: 'var(--space-4)' }}>
                  لازم تفعّل طريقة واحدة على الأقل.
                </p>
              )}
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-5)' }}>
                <span style={{ fontSize: 'var(--size-body-sm)', fontWeight: 'var(--weight-semibold)', color: 'var(--text-title)' }}>المدد والأسعار</span>
                <Button variant="ghost" size="sm" icon="plus" onClick={addDur}>مدة</Button>
              </div>
              {editModeCount > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: `1fr ${'1fr '.repeat(editModeCount)}auto`, gap: 'var(--space-4)', alignItems: 'end' }}>
                  <span style={{ fontSize: 'var(--size-caption)', color: 'var(--text-subtle)' }}>المدة (دقيقة)</span>
                  {edit.video && <span style={{ fontSize: 'var(--size-caption)', color: 'var(--text-subtle)' }}>سعر الفيديو</span>}
                  {edit.audio && <span style={{ fontSize: 'var(--size-caption)', color: 'var(--text-subtle)' }}>سعر الصوت</span>}
                  {edit.inPerson && <span style={{ fontSize: 'var(--size-caption)', color: 'var(--text-subtle)' }}>سعر المقابلة</span>}
                  <span />
                  {edit.durations.map((d, i) => (
                    <Fragment key={i}>
                      <Input type="number" value={d.minutes} onChange={(e) => patchDur(i, { minutes: Number(e.target.value) })} />
                      {edit.video && <Input type="number" value={d.video} onChange={(e) => patchDur(i, { video: Number(e.target.value) })} />}
                      {edit.audio && <Input type="number" value={d.audio} onChange={(e) => patchDur(i, { audio: Number(e.target.value) })} />}
                      {edit.inPerson && <Input type="number" value={d.inPerson} onChange={(e) => patchDur(i, { inPerson: Number(e.target.value) })} />}
                      {edit.durations.length > 1
                        ? <IconButton icon="trash-2" label="حذف المدة" size="sm" variant="ghost" onClick={() => removeDur(i)} />
                        : <span />}
                    </Fragment>
                  ))}
                </div>
              )}
              <p style={{ fontSize: 'var(--size-caption)', color: 'var(--text-subtle)', marginTop: 'var(--space-5)' }}>أقل مدة ربع ساعة (١٥ دقيقة). المدد بمضاعفات ١٥ دقيقة.</p>
            </div>
          </div>
        )}
      </Dialog>

      {/* تأكيد الحذف */}
      <Dialog open={!!confirmDel} dir="rtl" onClose={() => setConfirmDel(null)}
        title="حذف النوع"
        description={confirmDel ? `متأكد إنك عايز تحذف "${confirmDel.title}"؟ مش هيظهر للعملاء بعد كده.` : ''}
        footer={<>
          <Button variant="danger" onClick={() => confirmDel && doDelete(confirmDel)}>حذف نهائي</Button>
          <Button variant="ghost" onClick={() => setConfirmDel(null)}>تراجع</Button>
        </>} />
    </div>
  )
}

// Schedule (out of scope — still mock) ────────────────────────────────────────
function Schedule() {
  return (
    <div style={{ maxWidth: 1160, margin: '0 auto', padding: 'var(--space-11)' }}>
      <PageHead title="الجدول والمواعيد المتاحة" sub="افتح أو اقفل أي وقت. العميل يشوف بس المواعيد المفتوحة."
        action={<Switch label="متاح للحجز الآن" checked description="" />} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 'var(--space-6)' }}>
        {days.map((d) => (
          <Card key={d.d} padding="lg">
            <div style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
              <div style={{ fontSize: 'var(--size-caption)', color: 'var(--text-muted)' }}>{d.d}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--size-h3)', fontWeight: 'var(--weight-semibold)', color: 'var(--text-title)' }}>{d.n}</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              {d.slots.length === 0 && <div style={{ fontSize: 'var(--size-caption)', color: 'var(--text-subtle)', textAlign: 'center', padding: 'var(--space-5) 0' }}>مفيش مواعيد</div>}
              {d.slots.map((s) => (
                <div key={s.t} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-4)', padding: '6px 8px', borderRadius: 'var(--radius-md)', background: s.open ? 'var(--surface-brand-soft)' : 'var(--sand-200)' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--size-caption)', color: s.open ? 'var(--pine-800)' : 'var(--text-subtle)' }}>{s.t}</span>
                  <Switch checked={s.open} />
                </div>
              ))}
              <Button variant="ghost" size="sm" icon="plus" fullWidth>ميعاد</Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

// Clients ──────────────────────────────────────────────────────────────────────
function Clients() {
  const [q, setQ] = useState('')
  const { data: rows, loading, error } = useClients()
  const filtered = (rows ?? []).filter((c: any) => c.name.includes(q) || (c.email ?? '').includes(q))
  return (
    <div style={{ maxWidth: 1160, margin: '0 auto', padding: 'var(--space-11)' }}>
      <PageHead title="العملاء" sub="كل عميل مسجّل في مشورة."
        action={<Input placeholder="بحث بالاسم أو الإيميل" icon="search" value={q} onChange={(e) => setQ(e.target.value)} containerStyle={{ minWidth: 260 }} />} />
      {loading && <LoadingLine />}
      {error && <ErrorNote error={error} />}
      {!loading && !error && (
        <Card padding="none">
          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1.6fr 1.1fr 1fr', gap: 'var(--space-6)', padding: 'var(--space-6) var(--space-7)', fontSize: 'var(--size-caption)', color: 'var(--text-subtle)' }}>
            <span>العميل</span><span>البريد الإلكتروني</span><span>الهاتف</span><span>تاريخ الانضمام</span>
          </div>
          {filtered.length === 0 && <p style={{ padding: 'var(--space-7)', color: 'var(--text-subtle)', fontSize: 'var(--size-body-sm)' }}>مفيش عملاء.</p>}
          {filtered.map((c: any) => (
            <div key={c.id} style={{ display: 'grid', gridTemplateColumns: '1.4fr 1.6fr 1.1fr 1fr', gap: 'var(--space-6)', alignItems: 'center', padding: 'var(--space-6) var(--space-7)', borderTop: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-5)' }}>
                <span style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--pine-700)', color: 'var(--sand-050)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 'var(--weight-semibold)' }}>{c.name[0]}</span>
                <span style={{ fontSize: 'var(--size-body-sm)', color: 'var(--text-title)', fontWeight: 'var(--weight-medium)' }}>{c.name}</span>
              </div>
              <span style={{ fontSize: 'var(--size-body-sm)', color: 'var(--text-muted)', direction: 'ltr', textAlign: 'end' }}>{c.email}</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--size-body-sm)', color: 'var(--text-muted)', direction: 'ltr', textAlign: 'end' }}>{c.phone ?? '—'}</span>
              <span style={{ fontSize: 'var(--size-body-sm)', color: 'var(--text-muted)' }}>{(c.created_at ?? '').slice(0, 10)}</span>
            </div>
          ))}
        </Card>
      )}
    </div>
  )
}

// Leads ────────────────────────────────────────────────────────────────────────
const LEAD_STATUSES: LeadStatus[] = ['جديد', 'تم التواصل', 'مؤهّل', 'اتحوّل لعميل', 'مغلق']
const TONE: Record<LeadStatus, Tone> = {
  'جديد': 'brand',
  'تم التواصل': 'neutral',
  'مؤهّل': 'warning',
  'اتحوّل لعميل': 'success',
  'مغلق': 'danger',
}

function Leads() {
  const [q, setQ] = useState('')
  const [tab, setTab] = useState<LeadStatus | 'all'>('all')
  const { data: rows, loading, error, refetch } = useLeads()
  const leads = (rows ?? []).map(toDisplayLead)
  const [open, setOpen] = useState<(typeof leads)[number] | null>(null)

  const byStatus = Object.fromEntries(LEAD_STATUSES.map((s) => [s, leads.filter((l) => l.status === s).length])) as Record<LeadStatus, number>
  const filtered = leads.filter((l) => {
    if (tab !== 'all' && l.status !== tab) return false
    if (q && !(l.name.includes(q) || l.email.includes(q) || l.phone.includes(q))) return false
    return true
  })
  const convRate = leads.length ? Math.round((byStatus['اتحوّل لعميل'] / leads.length) * 100) : 0

  async function changeStatus(l: (typeof leads)[number], next: LeadStatus) {
    try {
      await api.updateLeadStatus(l.dbId, LEAD_AR_TO_DB[next])
      setOpen((o) => (o ? { ...o, status: next } : o))
      refetch()
    } catch { /* surfaced on next load */ }
  }

  return (
    <div style={{ maxWidth: 1160, margin: '0 auto', padding: 'var(--space-11)' }}>
      <PageHead title="عملاء محتملين" sub="ناس اهتموا بمشورة ولسه ما حجزوش — تابعهم من هنا."
        action={<div style={{ display: 'flex', gap: 'var(--space-5)' }}>
          <Input placeholder="بحث بالاسم أو الإيميل" icon="search" value={q} onChange={(e) => setQ(e.target.value)} containerStyle={{ minWidth: 280 }} />
        </div>} />

      {loading && <LoadingLine />}
      {error && <ErrorNote error={error} />}
      {!loading && !error && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(190px,1fr))', gap: 'var(--space-6)', marginBottom: 'var(--space-8)' }}>
            <Card padding="lg"><div style={{ fontSize: 'var(--size-body-sm)', color: 'var(--text-muted)' }}>عملاء محتملين</div><div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--size-h2)', fontWeight: 'var(--weight-semibold)', marginTop: 'var(--space-4)' }}>{leads.length}</div></Card>
            <Card padding="lg"><div style={{ fontSize: 'var(--size-body-sm)', color: 'var(--text-muted)' }}>محتاجين متابعة</div><div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--size-h2)', fontWeight: 'var(--weight-semibold)', color: 'var(--saffron-700)', marginTop: 'var(--space-4)' }}>{byStatus['جديد'] + byStatus['تم التواصل']}</div></Card>
            <Card padding="lg"><div style={{ fontSize: 'var(--size-body-sm)', color: 'var(--text-muted)' }}>معدل التحويل</div><div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--size-h2)', fontWeight: 'var(--weight-semibold)', color: 'var(--status-success-fg)', marginTop: 'var(--space-4)' }}>{convRate}%</div></Card>
            <Card padding="lg"><div style={{ fontSize: 'var(--size-body-sm)', color: 'var(--text-muted)' }}>مؤهّلين</div><div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--size-h2)', fontWeight: 'var(--weight-semibold)', marginTop: 'var(--space-4)' }}>{byStatus['مؤهّل']}</div></Card>
          </div>

          <Tabs value={tab} onChange={(v) => setTab(v as LeadStatus | 'all')} items={[
            { value: 'all', label: 'الكل', count: leads.length },
            ...LEAD_STATUSES.map((s) => ({ value: s, label: s, count: byStatus[s] })),
          ]} style={{ marginBottom: 'var(--space-7)' }} />

          <Card padding="none">
            <div style={{ display: 'grid', gridTemplateColumns: '90px 1.3fr 1.1fr .9fr 1fr 1fr .9fr', gap: 'var(--space-6)', padding: 'var(--space-6) var(--space-7)', fontSize: 'var(--size-caption)', color: 'var(--text-subtle)' }}>
              <span>الكود</span><span>الاسم</span><span>الاهتمام</span><span>المصدر</span><span>الهاتف</span><span>التاريخ</span><span>الحالة</span>
            </div>
            {filtered.length === 0 && <p style={{ padding: 'var(--space-9)', textAlign: 'center', color: 'var(--text-subtle)', fontSize: 'var(--size-body-sm)' }}>مفيش عملاء محتملين في هذا القسم.</p>}
            {filtered.map((l) => (
              <div key={l.dbId} style={{ display: 'grid', gridTemplateColumns: '90px 1.3fr 1.1fr .9fr 1fr 1fr .9fr', gap: 'var(--space-6)', alignItems: 'center', padding: 'var(--space-6) var(--space-7)', borderTop: '1px solid var(--border-subtle)', cursor: 'pointer' }} onClick={() => setOpen(l)}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--size-caption)', color: 'var(--text-subtle)' }}>{l.id}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-5)' }}>
                  <span style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--saffron-500)', color: 'var(--pine-950)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 'var(--weight-semibold)', flex: '0 0 auto' }}>{l.name[0]}</span>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 'var(--size-body-sm)', color: 'var(--text-title)', fontWeight: 'var(--weight-medium)' }}>{l.name}</div>
                    <div style={{ fontSize: 'var(--size-caption)', color: 'var(--text-muted)', direction: 'ltr', textAlign: 'end' }}>{l.email}</div>
                  </div>
                </div>
                <span style={{ fontSize: 'var(--size-body-sm)', color: 'var(--text-body)' }}>{l.interest}</span>
                <span style={{ fontSize: 'var(--size-body-sm)', color: 'var(--text-muted)' }}>{l.source}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--size-body-sm)', color: 'var(--text-muted)', direction: 'ltr', textAlign: 'end' }}>{l.phone}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--size-body-sm)', color: 'var(--text-muted)' }}>{l.createdAt}</span>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Badge tone={TONE[l.status]} dot={l.status === 'جديد'}>{l.status}</Badge>
                  <IconButton icon="chevron-left" label="افتح" size="sm" variant="ghost" />
                </div>
              </div>
            ))}
          </Card>
        </>
      )}

      <Dialog open={!!open} dir="rtl" onClose={() => setOpen(null)}
        title={open ? open.name : ''}
        description={open ? `${open.interest} — ${open.source}` : ''}
        footer={<>
          <Button variant="secondary" icon="message-circle">راسله واتساب</Button>
          <Button variant="ghost" onClick={() => setOpen(null)}>إغلاق</Button>
        </>}>
        {open && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', marginTop: 'var(--space-6)' }}>
            {[
              ['الكود', open.id],
              ['البريد', open.email],
              ['الهاتف', open.phone],
              ['المصدر', open.source],
              ['نوع الاهتمام', open.interest],
              ['تاريخ التسجيل', open.createdAt],
            ].map(([k, v], i) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', gap: 'var(--space-6)', padding: 'var(--space-4) 0', borderTop: i ? '1px solid var(--border-subtle)' : 'none' }}>
                <span style={{ fontSize: 'var(--size-body-sm)', color: 'var(--text-muted)' }}>{k}</span>
                <span style={{ fontSize: 'var(--size-body-sm)', fontWeight: 'var(--weight-medium)', color: 'var(--text-title)', direction: k === 'البريد' || k === 'الهاتف' ? 'ltr' : 'rtl', textAlign: 'end' }}>{v}</span>
              </div>
            ))}
            {open.note && (
              <div style={{ background: 'var(--surface-brand-soft)', padding: 'var(--space-6)', borderRadius: 'var(--radius-md)', fontSize: 'var(--size-body-sm)', color: 'var(--text-body)' }}>
                <strong style={{ display: 'block', marginBottom: 6, color: 'var(--pine-800)' }}>ملاحظة</strong>
                {open.note}
              </div>
            )}
            <Select label="غيّر الحالة" options={LEAD_STATUSES} value={open.status}
              onChange={(e) => changeStatus(open, e.target.value as LeadStatus)} />
          </div>
        )}
      </Dialog>
    </div>
  )
}

// Payments (out of scope — still mock) ────────────────────────────────────────
function Payments() {
  const total = payments.filter((p) => p.status === 'مدفوع').reduce((s, p) => s + p.amount, 0)
  const refunded = payments.filter((p) => p.status === 'مرتجع').reduce((s, p) => s + p.amount, 0)
  return (
    <div style={{ maxWidth: 1160, margin: '0 auto', padding: 'var(--space-11)' }}>
      <PageHead title="المدفوعات والإيرادات" sub="كل عملية دفع مربوطة بحجز، وكل فاتورة قابلة للتنزيل."
        action={<Select options={['آخر ٣٠ يوم', 'آخر ٩٠ يوم', 'كل الوقت']} containerStyle={{ minWidth: 160 }} />} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 'var(--space-6)', marginBottom: 'var(--space-9)' }}>
        <Card padding="lg"><div style={{ fontSize: 'var(--size-body-sm)', color: 'var(--text-muted)' }}>إجمالي محصّل</div><div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--size-h2)', fontWeight: 'var(--weight-semibold)', marginTop: 'var(--space-5)' }}>{total} ج.م</div></Card>
        <Card padding="lg"><div style={{ fontSize: 'var(--size-body-sm)', color: 'var(--text-muted)' }}>مرتجع</div><div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--size-h2)', fontWeight: 'var(--weight-semibold)', color: 'var(--status-danger-fg)', marginTop: 'var(--space-5)' }}>{refunded} ج.م</div></Card>
        <Card padding="lg"><div style={{ fontSize: 'var(--size-body-sm)', color: 'var(--text-muted)' }}>عدد العمليات</div><div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--size-h2)', fontWeight: 'var(--weight-semibold)', marginTop: 'var(--space-5)' }}>{payments.length}</div></Card>
      </div>
      <Card padding="none">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr .9fr .9fr .8fr .6fr', gap: 'var(--space-6)', padding: 'var(--space-6) var(--space-7)', fontSize: 'var(--size-caption)', color: 'var(--text-subtle)' }}>
          <span>رقم الفاتورة</span><span>الحجز</span><span>الطريقة</span><span>التاريخ</span><span>المبلغ</span><span>الحالة</span>
        </div>
        {payments.map((p) => {
          const b = bookingOf(p.bookingId)
          return (
            <div key={p.id} style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr .9fr .9fr .8fr .6fr', gap: 'var(--space-6)', alignItems: 'center', padding: 'var(--space-6) var(--space-7)', borderTop: '1px solid var(--border-subtle)' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--size-caption)', color: 'var(--text-subtle)' }}>{p.id}</span>
              <span style={{ fontSize: 'var(--size-body-sm)', color: 'var(--text-title)' }}>{b ? b.day : '—'}</span>
              <span style={{ fontSize: 'var(--size-body-sm)', color: 'var(--text-muted)' }}>{p.method}</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--size-body-sm)', color: 'var(--text-muted)' }}>{p.date}</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--size-body-sm)', fontWeight: 'var(--weight-semibold)', color: 'var(--text-title)' }}>{p.amount} ج.م</span>
              <Badge tone={p.status === 'مدفوع' ? 'success' : 'danger'}>{p.status}</Badge>
            </div>
          )
        })}
      </Card>
    </div>
  )
}

// Notifications (out of scope — still mock) ────────────────────────────────────
function Notifications() {
  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: 'var(--space-11)' }}>
      <PageHead title="الإشعارات" sub="حجوزات جديدة، إلغاءات، ومدفوعات — بمجرد ما تحصل." />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
        {notifications.map((n) => (
          <Card key={n.id} padding="lg" style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-6)', opacity: n.read ? .7 : 1 }}>
            <span style={{ width: 38, height: 38, borderRadius: 'var(--radius-md)', background: 'var(--surface-brand-soft)', color: 'var(--pine-700)', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: '0 0 auto' }}>
              <Icon name={n.type === 'دفع' ? 'credit-card' : n.type === 'إلغاء' ? 'x' : n.type === 'تذكير' ? 'bell' : 'calendar'} size={18} />
            </span>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', gap: 'var(--space-5)', alignItems: 'center' }}>
                <strong style={{ fontSize: 'var(--size-body-sm)', color: 'var(--text-title)' }}>{n.type}</strong>
                {!n.read && <Badge tone="brand" dot>جديد</Badge>}
              </div>
              <p style={{ fontSize: 'var(--size-body-sm)', color: 'var(--text-muted)', marginTop: 4 }}>{n.message}</p>
            </div>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--size-caption)', color: 'var(--text-subtle)', whiteSpace: 'nowrap' }}>{n.date}</span>
          </Card>
        ))}
      </div>
    </div>
  )
}
