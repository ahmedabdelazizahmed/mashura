import { useState, Fragment } from 'react'
import AdminShell, { PageHead, type AdminView } from './AdminShell'
import { Card, Badge, Button, Icon, IconButton, Tabs, Select, Input, Switch, Dialog } from '@/lib/ui'
import type { LeadStatus, Mode } from '@/types/data'
import {
  arDate, arTime, bookingClientName, bookingTypeTitle, cairoDayKey,
  toDisplayLead, LEAD_AR_TO_DB, PAYMENT_METHOD_AR, PAYMENT_STATUS_AR,
} from '@/lib/adapt'
import { useAuth } from '@/lib/auth'
import { useAllBookings, useClients, useLeads, useTypes, useAllPayments, useRules, useSlotsRange, useMyNotifications } from '@/lib/hooks'
import type { TypeWithDurations } from '@/lib/api'
import * as api from '@/lib/api'
import { Employees, Permissions } from './EmployeesAndPermissions'
import Knowledge from './Knowledge'
import { PaySettingsCard } from './PaySettings'

type Tone = 'brand' | 'neutral' | 'warning' | 'success' | 'danger'

// DB booking status → Arabic label + badge tone + grouping bucket.
const STATUS_AR: Record<string, string> = {
  pending: 'بانتظار التأكيد', confirmed: 'مؤكّد', completed: 'خلصت', cancelled: 'ملغي', no_show: 'لم يحضر',
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
      {view === 'knowledge' && <Knowledge />}
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
        {api.friendlyError(error)}
      </p>
    </Card>
  )
}

// Overview ────────────────────────────────────────────────────────────────────
function Overview({ onNav }: { onNav: (v: AdminView) => void }) {
  const { profile } = useAuth()
  const { data: rows, loading, error } = useAllBookings()
  const { data: clientRows } = useClients()
  const bookings = rows ?? []
  const upcoming = bookings.filter((b: any) => b.status === 'pending' || b.status === 'confirmed')
  const needsConfirm = bookings.filter((b: any) => b.status === 'pending').length
  const revenue = bookings
    .flatMap((b: any) => b.payments ?? [])
    .filter((p: any) => p.status === 'paid')
    .reduce((s: number, p: any) => s + Number(p.amount), 0)
  const byType: Record<string, number> = {}
  bookings.forEach((b: any) => { const t = bookingTypeTitle(b); byType[t] = (byType[t] || 0) + 1 })
  const topType = Object.entries(byType).sort((a, b) => b[1] - a[1])[0]

  return (
    <div className="adm-page">
      <PageHead title="نظرة عامة" sub={`أهلاً ${(profile?.name ?? '').split(' ')[0]}، ده ملخص شغلك.`} />
      {loading && <LoadingLine />}
      {error && <ErrorNote error={error} />}
      {!loading && !error && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 'var(--space-6)' }}>
            <StatCard icon="calendar" label="حجوزات قادمة" value={upcoming.length} sub="قيد الانتظار أو مؤكّدة" />
            <StatCard icon="bell" label="تحتاج تأكيد" value={needsConfirm} sub="حجوزات بانتظارك" />
            <StatCard icon="credit-card" label="مدفوعات مسجّلة" value={`${revenue} ج.م`} sub="المدفوع فعلًا" />
            <StatCard icon="user" label="عملاء" value={(clientRows ?? []).length} sub="عميل مسجّل" />
            <StatCard icon="briefcase" label="أكثر نوع مطلوب" value={topType ? topType[0] : '—'} sub={topType ? `${topType[1]} حجز` : ''} />
          </div>

          <div className="adm-two">
            <Card padding="lg">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 'var(--space-6)' }}>
                <h3 style={{ fontSize: 'var(--size-h3)' }}>الحجوزات القادمة</h3>
                <Button variant="ghost" size="sm" onClick={() => onNav('bookings')}>كل الحجوزات</Button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
                {upcoming.length === 0 && <p style={{ color: 'var(--text-subtle)', fontSize: 'var(--size-body-sm)' }}>مفيش حجوزات قادمة.</p>}
                {upcoming.slice(0, 8).map((b: any) => {
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
const BCOLS = '1.4fr 1.2fr .9fr 1.1fr .7fr .9fr'
function AdminBookingRow({ b, onOpen }: { b: any; onOpen: (b: any) => void }) {
  const name = bookingClientName(b)
  return (
    <div role="button" tabIndex={0} onClick={() => onOpen(b)} onKeyDown={(e) => { if (e.key === 'Enter') onOpen(b) }}
      style={{ display: 'grid', gridTemplateColumns: BCOLS, gap: 'var(--space-6)', alignItems: 'center', padding: 'var(--space-6) var(--space-7)', borderTop: '1px solid var(--border-subtle)', cursor: 'pointer', minWidth: 760 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-5)' }}>
        <span style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--pine-700)', color: 'var(--sand-050)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 'var(--weight-semibold)', flex: '0 0 auto' }}>{name[0]}</span>
        <span style={{ fontSize: 'var(--size-body-sm)', color: 'var(--text-title)', fontWeight: 'var(--weight-medium)' }}>{name}</span>
      </div>
      <span style={{ fontSize: 'var(--size-body-sm)', color: 'var(--text-body)' }}>{bookingTypeTitle(b)}</span>
      <span style={{ fontSize: 'var(--size-body-sm)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}><Icon name={modeIcon(b.mode)} size={15} />{modeAr(b.mode)}</span>
      <span style={{ fontSize: 'var(--size-body-sm)', color: 'var(--text-muted)' }}>{arDate(b.starts_at)} · {arTime(b.starts_at)}</span>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--size-body-sm)', color: 'var(--text-title)' }}>{Number(b.price_amount)} ج.م</span>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Badge tone={STATUS_TONE[b.status]} dot={b.status === 'confirmed'}>{STATUS_AR[b.status]}</Badge>
        <Icon name="chevron-left" size={16} />
      </div>
    </div>
  )
}

function BookingDialog({ b, canWrite, onClose, onChanged }: { b: any; canWrite: boolean; onClose: () => void; onChanged: () => void }) {
  const [url, setUrl] = useState<string>(b.meeting_url ?? '')
  const [loc, setLoc] = useState<string>(b.location ?? '')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const pay = Array.isArray(b.payments) ? b.payments[0] : null
  const inPerson = b.mode === 'in-person'

  const run = async (fn: () => Promise<void>) => {
    setBusy(true); setErr(null)
    try { await fn(); onChanged() } catch (e) { setErr(api.friendlyError(e)) } finally { setBusy(false) }
  }
  const setStatus = (st: 'confirmed' | 'cancelled' | 'completed' | 'no_show') => run(async () => {
    await api.setBookingStatus(b.id, st, inPerson ? null : url.trim() || null, inPerson ? loc.trim() || null : null)
  })
  const saveInfo = () => run(async () => { await api.setBookingStatus(b.id, null, inPerson ? null : url.trim(), inPerson ? loc.trim() : null) })
  const setPay = (st: 'paid' | 'failed' | 'refunded') => run(async () => { await api.setPaymentStatus(pay.id, st) })

  const rows: [string, string][] = [
    ['رقم الحجز', b.ref],
    ['العميل', `${bookingClientName(b)}${b.profiles?.phone ? ' · ' + b.profiles.phone : ''}`],
    ['البريد', b.profiles?.email ?? '—'],
    ['النوع', `${bookingTypeTitle(b)} · ${modeAr(b.mode)} · ${b.minutes} دقيقة`],
    ['الميعاد', `${arDate(b.starts_at)} — ${arTime(b.starts_at)}`],
    ['السعر', `${Number(b.price_amount)} ج.م`],
    ...(pay ? [['الدفع', `${PAYMENT_METHOD_AR[pay.method] ?? pay.method} — ${PAYMENT_STATUS_AR[pay.status] ?? pay.status}`] as [string, string]] : []),
    ...(b.topic ? [['الموضوع', b.topic] as [string, string]] : []),
  ]
  return (
    <Dialog open dir="rtl" onClose={onClose} title={`حجز ${b.ref}`} description={STATUS_AR[b.status]}
      footer={canWrite ? <>
        {b.status === 'pending' && <Button loading={busy} onClick={() => setStatus('confirmed')}>أكّد الحجز</Button>}
        {b.status === 'confirmed' && <Button loading={busy} onClick={() => setStatus('completed')}>تمت الجلسة</Button>}
        {b.status === 'confirmed' && <Button variant="secondary" loading={busy} onClick={() => setStatus('no_show')}>لم يحضر</Button>}
        {(b.status === 'pending' || b.status === 'confirmed') && <Button variant="danger" loading={busy} onClick={() => setStatus('cancelled')}>ألغِ الحجز</Button>}
        <Button variant="ghost" onClick={onClose}>إغلاق</Button>
      </> : <Button variant="ghost" onClick={onClose}>إغلاق</Button>}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)', marginTop: 'var(--space-5)' }}>
        {rows.map(([k, v], i) => (
          <div key={k} style={{ display: 'flex', justifyContent: 'space-between', gap: 'var(--space-6)', padding: 'var(--space-4) 0', borderTop: i ? '1px solid var(--border-subtle)' : 'none' }}>
            <span style={{ fontSize: 'var(--size-body-sm)', color: 'var(--text-muted)' }}>{k}</span>
            <span style={{ fontSize: 'var(--size-body-sm)', fontWeight: 'var(--weight-semibold)', color: 'var(--text-title)', textAlign: 'end', overflowWrap: 'anywhere' }}>{v}</span>
          </div>
        ))}
        {canWrite && (b.status === 'pending' || b.status === 'confirmed') && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            {inPerson
              ? <Input label="مكان المقابلة" value={loc} onChange={(e) => setLoc(e.target.value)} maxLength={300} />
              : <Input label="رابط الجلسة" value={url} onChange={(e) => setUrl(e.target.value)} maxLength={500} dir="ltr" hint="لازم يبدأ بـ https، وبيظهر للعميل بعد التأكيد." />}
            <div><Button variant="secondary" size="sm" loading={busy} onClick={saveInfo}>احفظ {inPerson ? 'المكان' : 'الرابط'}</Button></div>
          </div>
        )}
        {canWrite && pay && pay.status === 'pending' && b.status !== 'cancelled' && (
          <div style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
            <Button size="sm" variant="accent" loading={busy} onClick={() => setPay('paid')}>سجّل الدفع (تم الاستلام)</Button>
          </div>
        )}
        {canWrite && pay && pay.status === 'paid' && (
          <div><Button size="sm" variant="secondary" loading={busy} onClick={() => setPay('refunded')}>سجّل استرداد</Button></div>
        )}
        {err && <div role="alert" style={{ color: 'var(--status-danger-fg)', fontSize: 'var(--size-body-sm)' }}>{err}</div>}
      </div>
    </Dialog>
  )
}

function Bookings() {
  const [tab, setTab] = useState('next')
  const [open, setOpen] = useState<any | null>(null)
  const { profile } = useAuth()
  const canWrite = !!profile && profile.role !== 'viewer'
  const { data: rows, loading, error, refetch } = useAllBookings()
  const all = rows ?? []
  const groups = {
    next: all.filter((b: any) => b.status === 'pending' || b.status === 'confirmed'),
    past: all.filter((b: any) => b.status === 'completed'),
    cancelled: all.filter((b: any) => b.status === 'cancelled' || b.status === 'no_show'),
  }
  const list = groups[tab as keyof typeof groups]
  const current = open ? all.find((x: any) => x.id === open.id) ?? open : null
  return (
    <div className="adm-page">
      <PageHead title="الحجوزات" sub="اضغط على أي حجز لتأكيده أو إلغائه أو إضافة رابط الجلسة وتسجيل الدفع." />
      <Tabs value={tab} onChange={setTab} items={[
        { value: 'next', label: 'قادمة', count: groups.next.length },
        { value: 'past', label: 'سابقة', count: groups.past.length },
        { value: 'cancelled', label: 'ملغاة', count: groups.cancelled.length },
      ]} style={{ marginBottom: 'var(--space-8)' }} />
      {loading && <LoadingLine />}
      {error && <ErrorNote error={error} />}
      {!loading && !error && (
        <Card padding="none" style={{ overflowX: 'auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: BCOLS, gap: 'var(--space-6)', padding: 'var(--space-6) var(--space-7)', fontSize: 'var(--size-caption)', color: 'var(--text-subtle)', minWidth: 760 }}>
            <span>العميل</span><span>النوع</span><span>الطريقة</span><span>الميعاد</span><span>السعر</span><span>الحالة</span>
          </div>
          {list.length === 0 && <p style={{ padding: 'var(--space-7)', color: 'var(--text-subtle)', fontSize: 'var(--size-body-sm)' }}>مفيش حجوزات في هذا القسم.</p>}
          {list.map((b: any) => <AdminBookingRow key={b.id} b={b} onOpen={setOpen} />)}
        </Card>
      )}
      {current && <BookingDialog b={current} canWrite={canWrite} onClose={() => setOpen(null)} onChanged={refetch} />}
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
    <div className="adm-page">
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
                  <IconButton icon="x" label="حذف" size="sm" variant="ghost" onClick={() => setConfirmDel(t)} />
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
                        ? <IconButton icon="x" label="حذف المدة" size="sm" variant="ghost" onClick={() => removeDur(i)} />
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

// Schedule — real: generate slots from weekly rules, block/unblock free slots ───
const WD_AR = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت']
function Schedule() {
  const { profile, isAdmin } = useAuth()
  const canWrite = !!profile && profile.role !== 'viewer'
  const { data: rules } = useRules()
  const { data: slots, loading, error, refetch } = useSlotsRange(21)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const [openDay, setOpenDay] = useState<string | null>(null)

  const byDay = new Map<string, any[]>()
  for (const s of slots ?? []) {
    const k = cairoDayKey(s.starts_at)
    byDay.set(k, [...(byDay.get(k) ?? []), s])
  }
  const dayKeys = [...byDay.keys()].sort()
  const dayName = (k: string) => new Date(k + 'T12:00:00Z').toLocaleDateString('ar-EG', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' })

  const generate = async () => {
    setBusy(true); setMsg(null)
    try {
      const from = new Date()
      const to = new Date(); to.setDate(to.getDate() + 27)
      const iso = (d: Date) => d.toLocaleDateString('en-CA', { timeZone: 'Africa/Cairo' })
      const n = await api.generateSlots(iso(from), iso(to))
      setMsg({ ok: true, text: n > 0 ? `اتضاف ${n} ميعاد جديد.` : 'المواعيد موجودة بالفعل للفترة دي.' })
      refetch()
    } catch (e) { setMsg({ ok: false, text: api.friendlyError(e) }) } finally { setBusy(false) }
  }
  const toggle = async (ids: string[], blocked: boolean) => {
    setMsg(null)
    try { await api.setSlotsBlocked(ids, blocked); refetch() } catch (e) { setMsg({ ok: false, text: api.friendlyError(e) }) }
  }

  return (
    <div className="adm-page">
      <PageHead title="المواعيد المتاحة" sub="المواعيد بتتولّد من القواعد الأسبوعية. اقفل أي ميعاد فاضي أو يوم كامل، والمحجوز ما يتغيّرش."
        action={isAdmin ? <Button icon="plus" loading={busy} onClick={generate}>ولّد مواعيد الـ٢٨ يوم الجاية</Button> : undefined} />
      {msg && <div role="status" style={{ marginBottom: 'var(--space-6)', color: msg.ok ? 'var(--status-success-fg)' : 'var(--status-danger-fg)', fontSize: 'var(--size-body-sm)' }}>{msg.text}</div>}
      <Card padding="lg" style={{ marginBottom: 'var(--space-8)' }}>
        <h3 style={{ fontSize: 'var(--size-body-lg)', marginBottom: 'var(--space-4)' }}>القواعد الأسبوعية</h3>
        {(rules ?? []).length === 0
          ? <p style={{ color: 'var(--text-muted)', fontSize: 'var(--size-body-sm)' }}>مفيش قواعد مسجّلة. أضفها في جدول availability_rules.</p>
          : <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
              {(rules ?? []).map((r: any) => <Badge key={r.id} tone="neutral">{WD_AR[r.weekday]}: {String(r.start_time).slice(0, 5)} – {String(r.end_time).slice(0, 5)}</Badge>)}
            </div>}
      </Card>
      {loading && <LoadingLine />}
      {error && <ErrorNote error={error} />}
      {!loading && !error && dayKeys.length === 0 && <p style={{ color: 'var(--text-muted)' }}>مفيش مواعيد في الـ٣ أسابيع الجاية. اضغط «ولّد مواعيد».</p>}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 'var(--space-6)' }}>
        {dayKeys.map((k) => {
          const list = byDay.get(k)!
          const free = list.filter((s) => !s.is_booked && !s.is_blocked).length
          const booked = list.filter((s) => s.is_booked).length
          const blocked = list.filter((s) => s.is_blocked && !s.is_booked).length
          const isOpen = openDay === k
          return (
            <Card key={k} padding="lg" style={{ gridColumn: isOpen ? '1 / -1' : undefined }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                <strong style={{ fontSize: 'var(--size-body)' }}>{dayName(k)}</strong>
                <Button variant="ghost" size="sm" onClick={() => setOpenDay(isOpen ? null : k)}>{isOpen ? 'إخفاء' : 'تفاصيل'}</Button>
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 'var(--space-4)' }}>
                <Badge tone="success">{free} فاضي</Badge>
                {booked > 0 && <Badge tone="warning">{booked} محجوز</Badge>}
                {blocked > 0 && <Badge tone="neutral">{blocked} مقفول</Badge>}
              </div>
              {isOpen && (
                <>
                  {canWrite && (
                    <div style={{ display: 'flex', gap: 8, marginTop: 'var(--space-6)', flexWrap: 'wrap' }}>
                      <Button size="sm" variant="secondary" onClick={() => toggle(list.filter((s) => !s.is_booked && !s.is_blocked).map((s) => s.id), true)}>اقفل الفاضي كله</Button>
                      <Button size="sm" variant="secondary" onClick={() => toggle(list.filter((s) => !s.is_booked && s.is_blocked).map((s) => s.id), false)}>افتح المقفول كله</Button>
                    </div>
                  )}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 'var(--space-6)' }}>
                    {list.map((s) => {
                      const bg = s.is_booked ? 'var(--saffron-100)' : s.is_blocked ? 'var(--sand-200)' : 'var(--green-100)'
                      return (
                        <button key={s.id} type="button" disabled={s.is_booked || !canWrite} onClick={() => toggle([s.id], !s.is_blocked)}
                          title={s.is_booked ? 'محجوز' : s.is_blocked ? 'مقفول — اضغط للفتح' : 'فاضي — اضغط للقفل'}
                          style={{ padding: '6px 10px', borderRadius: 999, border: '1px solid var(--border-subtle)', background: bg, fontFamily: 'var(--font-mono)', fontSize: 13, cursor: s.is_booked || !canWrite ? 'default' : 'pointer', textDecoration: s.is_blocked ? 'line-through' : 'none', color: 'var(--text-body)' }}>
                          {arTime(s.starts_at)}
                        </button>
                      )
                    })}
                  </div>
                </>
              )}
            </Card>
          )
        })}
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
    <div className="adm-page">
      <PageHead title="العملاء" sub="كل عميل مسجّل في مشورة."
        action={<Input placeholder="بحث بالاسم أو الإيميل" icon="search" value={q} onChange={(e) => setQ(e.target.value)} containerStyle={{ minWidth: 260 }} />} />
      {loading && <LoadingLine />}
      {error && <ErrorNote error={error} />}
      {!loading && !error && (
        <Card padding="none" style={{ overflowX: 'auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1.6fr 1.1fr 1fr', gap: 'var(--space-6)', padding: 'var(--space-6) var(--space-7)', fontSize: 'var(--size-caption)', color: 'var(--text-subtle)', minWidth: 720 }}>
            <span>العميل</span><span>البريد الإلكتروني</span><span>الهاتف</span><span>تاريخ الانضمام</span>
          </div>
          {filtered.length === 0 && <p style={{ padding: 'var(--space-7)', color: 'var(--text-subtle)', fontSize: 'var(--size-body-sm)' }}>مفيش عملاء.</p>}
          {filtered.map((c: any) => (
            <div key={c.id} style={{ display: 'grid', gridTemplateColumns: '1.4fr 1.6fr 1.1fr 1fr', gap: 'var(--space-6)', alignItems: 'center', padding: 'var(--space-6) var(--space-7)', borderTop: '1px solid var(--border-subtle)', minWidth: 720 }}>
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
    <div className="adm-page">
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

          <Card padding="none" style={{ overflowX: 'auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '90px 1.3fr 1.1fr .9fr 1fr 1fr .9fr', gap: 'var(--space-6)', padding: 'var(--space-6) var(--space-7)', fontSize: 'var(--size-caption)', color: 'var(--text-subtle)', minWidth: 880 }}>
              <span>الكود</span><span>الاسم</span><span>الاهتمام</span><span>المصدر</span><span>الهاتف</span><span>التاريخ</span><span>الحالة</span>
            </div>
            {filtered.length === 0 && <p style={{ padding: 'var(--space-9)', textAlign: 'center', color: 'var(--text-subtle)', fontSize: 'var(--size-body-sm)' }}>مفيش عملاء محتملين في هذا القسم.</p>}
            {filtered.map((l) => (
              <div key={l.dbId} style={{ display: 'grid', gridTemplateColumns: '90px 1.3fr 1.1fr .9fr 1fr 1fr .9fr', gap: 'var(--space-6)', alignItems: 'center', padding: 'var(--space-6) var(--space-7)', borderTop: '1px solid var(--border-subtle)', cursor: 'pointer', minWidth: 880 }} onClick={() => setOpen(l)}>
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

// Payments — wallet transfers wait here for confirmation; cash is confirmed on receipt ──
function Payments() {
  const { data: rows, loading, error, refetch } = useAllPayments()
  const { profile } = useAuth()
  const canConfirm = ['owner', 'admin', 'reception'].includes(profile?.role ?? '')
  const isAdmin = ['owner', 'admin'].includes(profile?.role ?? '')
  const [busyId, setBusyId] = useState<string | null>(null)
  const [err, setErr] = useState<string | null>(null)
  const list = rows ?? []
  const total = list.filter((p: any) => p.status === 'paid').reduce((s: number, p: any) => s + Number(p.amount), 0)
  const refunded = list.filter((p: any) => p.status === 'refunded').reduce((s: number, p: any) => s + Number(p.amount), 0)
  const waiting = list.filter((p: any) => p.status === 'pending' && p.submitted_at)
  const pending = list.filter((p: any) => p.status === 'pending').length
  const tone = (st: string): Tone => (st === 'paid' ? 'success' : st === 'pending' ? 'warning' : 'danger')
  const act = async (id: string, status: 'paid' | 'failed' | 'refunded') => {
    setBusyId(id); setErr(null)
    try { await api.setPaymentStatus(id, status); refetch() } catch (e) { setErr(api.friendlyError(e)) } finally { setBusyId(null) }
  }
  return (
    <div className="adm-page">
      <PageHead title="المدفوعات" sub="التحويلات اللي العملاء سجّلوها بتستنى تأكيدك هنا. الكاش بتأكده لما تستلمه." />
      {isAdmin && <PaySettingsCard />}
      {loading && <LoadingLine />}
      {error && <ErrorNote error={error} />}
      {err && <p role="alert" style={{ color: 'var(--status-danger-fg)', marginBottom: 'var(--space-6)' }}>{err}</p>}
      {!loading && !error && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 'var(--space-6)', marginBottom: 'var(--space-9)' }}>
            <StatCard icon="credit-card" label="إجمالي المحصّل" value={`${total} ج.م`} />
            <StatCard icon="bell" label="تحويلات بانتظار تأكيدك" value={waiting.length} sub={`${pending} دفعة لسه ما اتأكدتش`} />
            <StatCard icon="receipt" label="مرتجع" value={`${refunded} ج.م`} />
          </div>
          <Card padding="none" style={{ overflowX: 'auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.1fr .9fr 1fr .7fr .9fr 1.3fr', gap: 'var(--space-6)', padding: 'var(--space-6) var(--space-7)', fontSize: 'var(--size-caption)', color: 'var(--text-subtle)', minWidth: 960 }}>
              <span>رقم الفاتورة</span><span>العميل</span><span>الطريقة</span><span>رقم العملية</span><span>المبلغ</span><span>الحالة</span><span style={{ textAlign: 'end' }}>إجراء</span>
            </div>
            {list.length === 0 && <p style={{ padding: 'var(--space-7)', color: 'var(--text-subtle)', fontSize: 'var(--size-body-sm)' }}>مفيش مدفوعات لسه.</p>}
            {list.map((p: any) => (
              <div key={p.id} style={{ display: 'grid', gridTemplateColumns: '1fr 1.1fr .9fr 1fr .7fr .9fr 1.3fr', gap: 'var(--space-6)', alignItems: 'center', padding: 'var(--space-6) var(--space-7)', borderTop: '1px solid var(--border-subtle)', minWidth: 960, background: p.status === 'pending' && p.submitted_at ? 'var(--surface-brand-soft)' : undefined }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--size-caption)', color: 'var(--text-subtle)' }}>{p.invoice_no}</span>
                <span style={{ fontSize: 'var(--size-body-sm)', color: 'var(--text-title)' }}>{p.bookings?.profiles?.name ?? '—'}</span>
                <span style={{ fontSize: 'var(--size-body-sm)', color: 'var(--text-muted)' }}>{PAYMENT_METHOD_AR[p.method] ?? p.method}</span>
                <span dir="ltr" style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--size-caption)', color: 'var(--text-title)', textAlign: 'end' }}>{p.provider_ref ?? '—'}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--size-body-sm)', fontWeight: 'var(--weight-semibold)', color: 'var(--text-title)' }}>{Number(p.amount)} ج.م</span>
                <Badge tone={tone(p.status)}>{p.status === 'pending' && p.submitted_at ? 'بانتظار التأكيد' : PAYMENT_STATUS_AR[p.status] ?? p.status}</Badge>
                <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                  {canConfirm && p.status === 'pending' && (
                    <>
                      <Button size="sm" loading={busyId === p.id} onClick={() => act(p.id, 'paid')}>{p.method === 'cash' ? 'استلمت كاش' : 'أكّد الدفع'}</Button>
                      {p.submitted_at && <Button size="sm" variant="ghost" disabled={busyId === p.id} onClick={() => act(p.id, 'failed')}>رفض</Button>}
                    </>
                  )}
                  {canConfirm && p.status === 'paid' && (
                    <Button size="sm" variant="ghost" disabled={busyId === p.id} onClick={() => act(p.id, 'refunded')}>رد المبلغ</Button>
                  )}
                </div>
              </div>
            ))}
          </Card>
        </>
      )}
    </div>
  )
}

// Notifications — real (booking events for staff) ───────────────────────────────
function Notifications() {
  const { data, loading, error, refetch } = useMyNotifications()
  const items = data ?? []
  const markAll = async () => { try { await api.markAllNotificationsRead(); refetch() } catch { /* ignore */ } }
  return (
    <div className="adm-page" style={{ maxWidth: 900 }}>
      <PageHead title="الإشعارات" sub="حجوزات جديدة وإلغاءات بمجرد ما تحصل."
        action={items.some((n) => !n.read_at) ? <Button variant="ghost" size="sm" onClick={markAll}>علّم الكل كمقروء</Button> : undefined} />
      {loading && <LoadingLine />}
      {error && <ErrorNote error={error} />}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
        {!loading && items.length === 0 && <p style={{ color: 'var(--text-subtle)' }}>مفيش إشعارات لسه.</p>}
        {items.map((n) => (
          <Card key={n.id} padding="lg" style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-6)', opacity: n.read_at ? .7 : 1 }}>
            <span style={{ width: 38, height: 38, borderRadius: 'var(--radius-md)', background: 'var(--surface-brand-soft)', color: 'var(--pine-700)', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: '0 0 auto' }}>
              <Icon name={n.type.includes('cancel') ? 'x' : 'calendar'} size={18} />
            </span>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', gap: 'var(--space-5)', alignItems: 'center' }}>
                <strong style={{ fontSize: 'var(--size-body-sm)', color: 'var(--text-title)' }}>{n.title}</strong>
                {!n.read_at && <Badge tone="brand" dot>جديد</Badge>}
              </div>
              <p style={{ fontSize: 'var(--size-body-sm)', color: 'var(--text-muted)', marginTop: 4 }}>{n.message}</p>
            </div>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--size-caption)', color: 'var(--text-subtle)', whiteSpace: 'nowrap' }}>{n.created_at.slice(0, 10)}</span>
          </Card>
        ))}
      </div>
    </div>
  )
}
