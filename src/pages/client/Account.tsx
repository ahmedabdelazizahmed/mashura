import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Badge, Button, Icon, IconButton, Tabs, Dialog, Input } from '@/lib/ui'
import { useAuth } from '@/lib/auth'
import { useMyBookings, useMyNotifications } from '@/lib/hooks'
import { toDisplayBooking, isActiveStatus, MODE_AR, modeIconName, PAYMENT_METHOD_AR, paymentLabel, type DisplayBooking as Booking } from '@/lib/adapt'
import { supabase } from '@/lib/supabase'
import * as api from '@/lib/api'
import PaymentInstructions from '@/components/PaymentInstructions'
import { printInvoice } from '@/lib/invoice'

const openAssistant = () => window.dispatchEvent(new Event('mashura:open-assistant'))
const openUrl = (u: string) => window.open(u, '_blank', 'noopener,noreferrer')

interface Props { onBook: () => void }

const SECTIONS = [
  { id: 'overview', label: 'نظرة عامة', icon: 'briefcase' },
  { id: 'bookings', label: 'الحجوزات', icon: 'calendar' },
  { id: 'receipts', label: 'المدفوعات والفواتير', icon: 'receipt' },
  { id: 'notifications', label: 'الإشعارات', icon: 'bell' },
  { id: 'profile', label: 'البروفايل', icon: 'user' },
  { id: 'help', label: 'المساعدة', icon: 'message-circle' },
] as const
type Section = (typeof SECTIONS)[number]['id']

export default function Account({ onBook }: Props) {
  const [section, setSection] = useState<Section>('overview')
  const { profile } = useAuth()
  const me = { name: profile?.name ?? '—', email: profile?.email ?? '' }
  const titles: Record<Section, [string, string]> = {
    overview: [`أهلاً ${me.name.split(' ')[0]}`, 'ملخص سريع لحجوزاتك ونشاطك مع مشورة.'],
    bookings: ['حجوزاتي', 'كل حجوزاتك القادمة والفايتة في مكان واحد.'],
    receipts: ['المدفوعات والفواتير', 'حالة الدفع لكل حجز وفواتيرك.'],
    profile: ['البروفايل الشخصي', 'بياناتك اللي بتظهر للمستشار قبل الجلسة.'],
    notifications: ['الإشعارات', 'كل الأحداث المتعلقة بحسابك وحجوزاتك.'],
    help: ['المساعدة', 'أسئلة شائعة أو تواصل مباشر معانا.'],
  }
  const [title, sub] = titles[section]

  return (
    <div style={{ maxWidth: 1160, margin: '0 auto', padding: 'var(--space-10) var(--space-8) var(--space-13)' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 'var(--space-8)', marginBottom: 'var(--space-9)', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: 'var(--size-h1)' }}>{title}</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: 'var(--space-4)' }}>{sub}</p>
        </div>
        <Button icon="plus" onClick={onBook}>احجز مشورة</Button>
      </div>

      <div className="acct-grid">
        <SideNav section={section} onNav={setSection} me={me} />
        <div style={{ minWidth: 0 }}>
          {section === 'overview' && <Overview onNav={setSection} onBook={onBook} />}
          {section === 'bookings' && <Bookings onBook={onBook} />}
          {section === 'receipts' && <Receipts />}
          {section === 'profile' && <Profile />}
          {section === 'notifications' && <Notifications />}
          {section === 'help' && <Help />}
        </div>
      </div>
    </div>
  )
}

function SideNav({ section, onNav, me }: { section: Section; onNav: (s: Section) => void; me: { name: string; email: string } }) {
  const { signOut } = useAuth()
  const nav = useNavigate()
  return (
    <Card padding="none" className="acct-side">
      <div style={{ padding: 'var(--space-7)', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: 'var(--space-5)' }}>
        <span style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--pine-700)', color: 'var(--sand-050)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, fontWeight: 'var(--weight-semibold)' }}>{(me.name[0] ?? '؟')}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 'var(--size-body-sm)', fontWeight: 'var(--weight-semibold)', color: 'var(--text-title)' }}>{me.name}</div>
          <div style={{ fontSize: 'var(--size-caption)', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{me.email}</div>
        </div>
      </div>
      <nav style={{ padding: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {SECTIONS.map((s) => {
          const active = section === s.id
          return (
            <button key={s.id} type="button" onClick={() => onNav(s.id)} style={{
              display: 'flex', alignItems: 'center', gap: 'var(--space-5)', width: '100%',
              border: 'none', cursor: 'pointer', textAlign: 'start',
              padding: '10px var(--space-5)', borderRadius: 'var(--radius-md)',
              background: active ? 'var(--surface-brand-soft)' : 'transparent',
              color: active ? 'var(--pine-800)' : 'var(--text-body)',
              fontFamily: 'var(--font-sans)', fontSize: 'var(--size-body-sm)',
              fontWeight: active ? 'var(--weight-semibold)' : 'var(--weight-regular)',
              transition: 'background var(--duration-fast) var(--ease-out)',
            }}>
              <Icon name={s.icon} size={17} />
              <span style={{ flex: 1 }}>{s.label}</span>
              
            </button>
          )
        })}
      </nav>
      <div style={{ padding: 'var(--space-5)', borderTop: '1px solid var(--border-subtle)' }}>
        <Button variant="ghost" size="sm" fullWidth icon="log-out" onClick={async () => { await signOut(); nav('/', { replace: true }) }}>خروج</Button>
      </div>
    </Card>
  )
}

function Overview({ onNav, onBook }: { onNav: (s: Section) => void; onBook: () => void }) {
  const { data: rows } = useMyBookings()
  const mine: Booking[] = (rows ?? []).map(toDisplayBooking)
  const upcoming = mine.filter((b) => isActiveStatus(b.status) && new Date(b.startsAt) > new Date()).sort((a, b) => a.startsAt.localeCompare(b.startsAt))
  const next = upcoming[0]
  const past = mine.filter((b) => b.status === 'خلصت')
  const totalSpent = mine.filter((b) => b.paymentStatus === 'paid').reduce((s, b) => s + b.price, 0)
  const t = next ? { title: next.typeTitle } : null

  return (
    <>
      {next && t ? (
        <Card padding="lg" style={{ background: 'linear-gradient(135deg, var(--pine-800), var(--pine-700))', color: 'var(--sand-050)', border: 'none' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--space-6)', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 240 }}>
              <span style={{ fontSize: 'var(--size-overline)', fontWeight: 'var(--weight-bold)', color: 'var(--saffron-400)' }}>أقرب جلسة</span>
              <h2 style={{ fontSize: 'var(--size-h2)', color: 'var(--sand-050)', marginTop: 'var(--space-4)' }}>{t.title}</h2>
              <div style={{ display: 'flex', gap: 'var(--space-7)', marginTop: 'var(--space-5)', fontSize: 'var(--size-body-sm)', color: 'var(--pine-200)', flexWrap: 'wrap' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Icon name="calendar" size={16} />{next.day}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-mono)' }}><Icon name="clock" size={16} />{next.time}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Icon name={modeIconName(next.mode)} size={16} />{MODE_AR[next.mode]}</span>
                <Badge tone={next.status === 'مؤكّد' ? 'success' : 'neutral'}>{next.status}</Badge>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
              {next.meetingUrl && <Button variant="accent" icon={modeIconName(next.mode)} onClick={() => openUrl(next.meetingUrl!)}>ادخل الجلسة</Button>}
              <Button variant="ghost" onClick={() => onNav('bookings')} style={{ color: 'var(--pine-200)' }}>التفاصيل</Button>
            </div>
          </div>
        </Card>
      ) : (
        <Card padding="lg" style={{ textAlign: 'center', padding: 'var(--space-11)', background: 'var(--surface-brand-soft)', border: 'none' }}>
          <h3 style={{ fontSize: 'var(--size-h3)' }}>مفيش جلسات قادمة</h3>
          <p style={{ color: 'var(--text-muted)', marginTop: 'var(--space-4)' }}>احجز مشورة جديدة.</p>
          <Button icon="plus" onClick={onBook} style={{ marginTop: 'var(--space-6)' }}>احجز مشورة</Button>
        </Card>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 'var(--space-6)', marginTop: 'var(--space-8)' }}>
        {[
          { icon: 'calendar', label: 'جلسات قادمة', value: upcoming.length },
          { icon: 'check-circle', label: 'جلسات خلصت', value: past.length },
          { icon: 'credit-card', label: 'إجمالي المدفوع', value: `${totalSpent} ج.م` },
        ].map((s) => (
          <Card key={s.label} padding="lg">
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
              <span style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: 'var(--surface-brand-soft)', color: 'var(--pine-700)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name={s.icon} size={18} /></span>
              <span style={{ fontSize: 'var(--size-body-sm)', color: 'var(--text-muted)' }}>{s.label}</span>
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--size-h2)', fontWeight: 'var(--weight-semibold)', color: 'var(--text-title)', marginTop: 'var(--space-5)' }}>{s.value}</div>
          </Card>
        ))}
      </div>

      <div className="acct-two">
        <Card padding="lg">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 'var(--space-6)' }}>
            <h3 style={{ fontSize: 'var(--size-h3)' }}>آخر النشاط</h3>
            <Button variant="ghost" size="sm" onClick={() => onNav('bookings')}>كل الحجوزات</Button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {mine.slice(0, 4).map((b, i) => (
              <div key={b.id} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-5)', padding: 'var(--space-5) 0', borderTop: i ? '1px solid var(--border-subtle)' : 'none' }}>
                <span style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: 'var(--surface-brand-soft)', color: 'var(--pine-700)', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: '0 0 auto' }}><Icon name={modeIconName(b.mode)} size={17} /></span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 'var(--size-body-sm)', fontWeight: 'var(--weight-medium)', color: 'var(--text-title)' }}>{b.typeTitle}</div>
                  <div style={{ fontSize: 'var(--size-caption)', color: 'var(--text-muted)' }}>{b.day} · {b.time}</div>
                </div>
                <Badge tone={b.status === 'مؤكّد' ? 'success' : (b.status === 'ملغي' || b.status === 'غياب' ? 'danger' : 'neutral')} dot={b.status === 'مؤكّد'}>{b.status}</Badge>
              </div>
            ))}
          </div>
        </Card>
        <Card padding="lg" style={{ background: 'var(--sand-100)', border: 'none' }}>
          <h3 style={{ fontSize: 'var(--size-h3)' }}>إجراءات سريعة</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', marginTop: 'var(--space-6)' }}>
            <Button icon="plus" fullWidth onClick={onBook}>احجز مشورة جديدة</Button>
            <Button variant="secondary" icon="receipt" fullWidth onClick={() => onNav('receipts')}>شوف المدفوعات</Button>
            <Button variant="secondary" icon="user" fullWidth onClick={() => onNav('profile')}>عدّل بياناتك</Button>
            <Button variant="ghost" icon="message-circle" fullWidth onClick={openAssistant}>اسأل المساعد</Button>
          </div>
        </Card>
      </div>
    </>
  )
}

function BookingRow({ b, onCancel, onDetails }: { b: Booking; onCancel: (b: Booking) => void; onDetails: (b: Booking) => void }) {
  const done = !isActiveStatus(b.status)
  const t = { title: b.typeTitle }
  return (
    <Card padding="lg" interactive onClick={() => onDetails(b)} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-7)' }}>
      <span style={{ width: 46, height: 46, flex: '0 0 auto', borderRadius: 'var(--radius-md)', background: 'var(--surface-brand-soft)', color: 'var(--pine-700)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon name={modeIconName(b.mode)} size={21} />
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-5)' }}>
          <strong style={{ fontSize: 'var(--size-body-lg)', color: 'var(--text-title)' }}>{t.title}</strong>
          <Badge tone={b.status === 'مؤكّد' ? 'success' : (b.status === 'ملغي' || b.status === 'غياب' ? 'danger' : 'neutral')} dot={b.status === 'مؤكّد'}>{b.status}</Badge>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-7)', marginTop: 'var(--space-4)', fontSize: 'var(--size-body-sm)', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Icon name="calendar" size={15} />{b.day}</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-mono)' }}><Icon name="clock" size={15} />{b.time} · {b.minutes} دقيقة</span>
          <span style={{ fontFamily: 'var(--font-mono)' }}>{b.price} ج.م</span>
        </div>
      </div>
      {done ? null : (
        <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
          {b.meetingUrl && <Button size="sm" icon={modeIconName(b.mode)} onClick={(e) => { e.stopPropagation(); openUrl(b.meetingUrl!) }}>ادخل الجلسة</Button>}
          <IconButton icon="x" label="ألغِ الحجز" variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); onCancel(b) }} />
        </div>
      )}
    </Card>
  )
}

function Bookings({ onBook }: { onBook: () => void }) {
  const [tab, setTab] = useState('next')
  const [cancel, setCancel] = useState<Booking | null>(null)
  const [details, setDetails] = useState<Booking | null>(null)
  const [cancelError, setCancelError] = useState<string | null>(null)
  const { data: rows, loading, error, refetch } = useMyBookings()

  const mine: Booking[] = (rows ?? []).map(toDisplayBooking)
  const list = mine.filter((b) => (tab === 'next' ? isActiveStatus(b.status) : !isActiveStatus(b.status)))

  const doCancel = async () => {
    if (!cancel) return
    setCancelError(null)
    try { await api.cancelBooking(cancel.dbId); refetch(); setCancel(null) }
    catch (e) { setCancelError(api.friendlyError(e)) }
  }

  return (
    <>
      <Tabs value={tab} onChange={setTab} items={[
        { value: 'next', label: 'قادمة', count: mine.filter((b) => isActiveStatus(b.status)).length },
        { value: 'past', label: 'فايتة', count: mine.filter((b) => !isActiveStatus(b.status)).length },
      ]} style={{ marginBottom: 'var(--space-8)' }} />

      {loading && <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 'var(--space-9)' }}>جاري التحميل...</p>}
      {error && (
        <Card padding="lg" style={{ background: 'var(--status-danger-bg)', borderColor: 'var(--status-danger-fg)' }}>
          <strong style={{ color: 'var(--status-danger-fg)' }}>ما قدرناش نجيب الحجوزات</strong>
          <p style={{ fontSize: 'var(--size-body-sm)', color: 'var(--text-muted)', margin: '6px 0 0' }}>
            {api.friendlyError(error)}
          </p>
        </Card>
      )}

      {!loading && !error && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
          {list.length === 0 && (
            <Card padding="lg" style={{ textAlign: 'center', padding: 'var(--space-11)' }}>
              <span style={{ width: 56, height: 56, borderRadius: 'var(--radius-lg)', background: 'var(--surface-brand-soft)', color: 'var(--pine-700)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 'var(--space-6)' }}><Icon name="calendar" size={28} /></span>
              <h3 style={{ fontSize: 'var(--size-h3)' }}>مفيش حجوزات هنا لسه</h3>
              <p style={{ color: 'var(--text-muted)', marginTop: 'var(--space-4)' }}>ابدأ بأول مشورة.</p>
              <Button icon="plus" onClick={onBook} style={{ marginTop: 'var(--space-7)' }}>احجز مشورة</Button>
            </Card>
          )}
          {list.map((b) => <BookingRow key={b.id} b={b} onCancel={setCancel} onDetails={setDetails} />)}
        </div>
      )}

      {details && <BookingDetailsDialog booking={details} onClose={() => setDetails(null)} onCancel={setCancel} />}

      <Dialog open={!!cancel} dir="rtl" onClose={() => setCancel(null)} title="تلغي الحجز؟"
        description={cancel ? `${cancel.typeTitle} — ${cancel.day} ${cancel.time}. بعد الإلغاء الميعاد بيرجع متاح لغيرك.${cancelError ? ' — ' + cancelError : ''}` : ''}
        footer={<><Button variant="danger" onClick={doCancel}>أكّد الإلغاء</Button><Button variant="ghost" onClick={() => { setCancel(null); setCancelError(null) }}>سيبه</Button></>} />
    </>
  )
}

function BookingDetailsDialog({ booking, onClose, onCancel }: { booking: Booking; onClose: () => void; onCancel: (b: Booking) => void }) {
  const t = { title: booking.typeTitle }
  const isUpcoming = isActiveStatus(booking.status)
  const rows: [string, string][] = [
    ['رقم الحجز', booking.id.toUpperCase()],
    ['نوع الاستشارة', t.title],
    ['الطريقة', MODE_AR[booking.mode]],
    ['الميعاد', `${booking.day} — ${booking.time}`],
    ['المدة', `${booking.minutes} دقيقة`],
    ['السعر', `${booking.price} ج.م`],
    ['الحالة', booking.status],
    ...(booking.topic ? [['موضوع المشورة', booking.topic] as [string, string]] : []),
    ...(booking.location ? [['المكان', booking.location] as [string, string]] : []),
    ...(booking.paymentMethod ? [['طريقة الدفع', PAYMENT_METHOD_AR[booking.paymentMethod] ?? booking.paymentMethod] as [string, string], ['حالة الدفع', paymentLabel(booking)] as [string, string]] : []),
    ...(booking.invoiceNo && booking.paymentStatus === 'paid' ? [['رقم الفاتورة', booking.invoiceNo] as [string, string]] : []),
  ]
  return (
    <Dialog open dir="rtl" onClose={onClose} title={t.title} description={`${booking.day} — ${booking.time}`}
      footer={
        <>
          {isUpcoming && booking.meetingUrl && <Button icon={modeIconName(booking.mode)} onClick={() => openUrl(booking.meetingUrl!)}>ادخل الجلسة</Button>}
          {isUpcoming && <Button variant="danger" onClick={() => { onCancel(booking); onClose() }}>ألغِ الحجز</Button>}
          <Button variant="ghost" onClick={onClose}>سيبه</Button>
        </>
      }>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', marginTop: 'var(--space-6)' }}>
        {rows.map(([k, v], i) => (
          <div key={k} style={{ display: 'flex', justifyContent: 'space-between', gap: 'var(--space-6)', padding: 'var(--space-5) 0', borderTop: i ? '1px solid var(--border-subtle)' : 'none' }}>
            <span style={{ fontSize: 'var(--size-body-sm)', color: 'var(--text-muted)' }}>{k}</span>
            <span style={{ fontSize: 'var(--size-body-sm)', fontWeight: 'var(--weight-semibold)', color: 'var(--text-title)', textAlign: 'end' }}>{v}</span>
          </div>
        ))}
        {isUpcoming && booking.paymentMethod === 'wallet' && booking.paymentStatus === 'pending' && booking.paymentId && (
          <PaymentInstructions amount={booking.price} paymentId={booking.paymentId} reference={booking.paymentRef} submittedAt={booking.paymentSubmittedAt} />
        )}
        {isUpcoming && (
          <div style={{ padding: 'var(--space-6)', borderRadius: 'var(--radius-md)', background: 'var(--surface-brand-soft)', fontSize: 'var(--size-body-sm)', color: 'var(--text-body)', display: 'flex', gap: 'var(--space-5)' }}>
            <Icon name="info" size={18} />
            <div>{booking.status === 'بانتظار التأكيد' ? 'طلبك وصل وبانتظار تأكيد المستشار. هتلاقي رابط الجلسة هنا بعد التأكيد.' : booking.meetingUrl ? 'رابط الجلسة جاهز فوق.' : 'رابط الجلسة هيظهر هنا قبل الميعاد.'}</div>
          </div>
        )}
      </div>
    </Dialog>
  )
}

function Receipts() {
  const { data: rows } = useMyBookings()
  const { profile } = useAuth()
  const mine: Booking[] = (rows ?? []).map(toDisplayBooking).filter((b) => b.paymentMethod)
  const paid = mine.filter((b) => b.paymentStatus === 'paid')
  const total = paid.reduce((s, b) => s + b.price, 0)
  const cell = { fontSize: 'var(--size-body-sm)' } as const
  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 'var(--space-6)', marginBottom: 'var(--space-8)' }}>
        <Card padding="lg"><div style={{ fontSize: 'var(--size-body-sm)', color: 'var(--text-muted)' }}>عدد المدفوعات</div><div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--size-h2)', fontWeight: 'var(--weight-semibold)', marginTop: 'var(--space-4)' }}>{paid.length}</div></Card>
        <Card padding="lg"><div style={{ fontSize: 'var(--size-body-sm)', color: 'var(--text-muted)' }}>إجمالي المدفوع</div><div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--size-h2)', fontWeight: 'var(--weight-semibold)', marginTop: 'var(--space-4)' }}>{total} ج.م</div></Card>
      </div>
      <Card padding="none" style={{ overflowX: 'auto' }}>
        {mine.length === 0 && <p style={{ ...cell, color: 'var(--text-subtle)', textAlign: 'center', padding: 'var(--space-9)' }}>مفيش مدفوعات لسه.</p>}
        {mine.map((b, i) => (
          <div key={b.id} style={{ display: 'grid', gridTemplateColumns: 'minmax(110px,130px) minmax(120px,1fr) minmax(110px,140px) 90px minmax(130px,150px) 90px', gap: 'var(--space-6)', alignItems: 'center', padding: 'var(--space-6) var(--space-7)', borderTop: i ? '1px solid var(--border-subtle)' : 'none', minWidth: 760 }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--size-caption)', color: 'var(--text-subtle)' }}>{b.id.toUpperCase()}</span>
            <span style={{ ...cell, color: 'var(--text-title)', fontWeight: 'var(--weight-medium)' }}>{b.typeTitle}</span>
            <span style={{ ...cell, color: 'var(--text-muted)' }}>{b.day}</span>
            <span style={{ ...cell, fontFamily: 'var(--font-mono)', fontWeight: 'var(--weight-semibold)', color: 'var(--text-title)' }}>{b.price} ج.م</span>
            <Badge tone={b.paymentStatus === 'paid' ? 'success' : b.paymentStatus === 'failed' || b.paymentStatus === 'refunded' ? 'danger' : b.paymentSubmittedAt ? 'brand' : 'neutral'}>{paymentLabel(b)}</Badge>
            {b.paymentStatus === 'paid' && b.invoiceNo
              ? <Button size="sm" variant="secondary" onClick={() => printInvoice({ invoiceNo: b.invoiceNo!, bookingRef: b.id.toUpperCase(), clientName: profile?.name ?? '', clientEmail: profile?.email ?? '', service: b.typeTitle, when: `${b.day} — ${b.time}`, minutes: b.minutes, method: PAYMENT_METHOD_AR[b.paymentMethod ?? ''] ?? '', amount: b.price, paidAt: b.paidAt })}>الفاتورة</Button>
              : <span />}
          </div>
        ))}
      </Card>
    </>
  )
}

function Profile() {
  const { profile, refreshProfile } = useAuth()
  const [name, setName] = useState(profile?.name ?? '')
  const [phone, setPhone] = useState(profile?.phone ?? '')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const [pwBusy, setPwBusy] = useState(false)

  const save = async () => {
    const n = name.trim()
    const ph = phone.trim()
    if (n.length < 2 || n.length > 100) return setMsg({ ok: false, text: 'اكتب اسمك صح (حرفين على الأقل).' })
    if (ph && !/^[0-9+()\s-]{6,30}$/.test(ph)) return setMsg({ ok: false, text: 'رقم الموبايل مش صحيح.' })
    setBusy(true); setMsg(null)
    const { error } = await supabase.from('profiles').update({ name: n, phone: ph || null }).eq('id', profile!.id)
    setBusy(false)
    if (error) return setMsg({ ok: false, text: 'ما قدرناش نحفظ. جرّب تاني.' })
    await refreshProfile()
    setMsg({ ok: true, text: 'اتحفظت بياناتك.' })
  }
  const resetPassword = async () => {
    if (!profile?.email) return
    setPwBusy(true); setMsg(null)
    const { error } = await supabase.auth.resetPasswordForEmail(profile.email, { redirectTo: window.location.origin + '/reset' })
    setPwBusy(false)
    setMsg(error ? { ok: false, text: 'ما قدرناش نبعت الرابط. جرّب بعد شوية.' } : { ok: true, text: 'بعتنالك رابط تغيير كلمة السر على إيميلك.' })
  }
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 'var(--space-8)', alignItems: 'start' }}>
      <Card padding="lg">
        <h3 style={{ fontSize: 'var(--size-h3)', marginBottom: 'var(--space-7)' }}>البيانات الشخصية</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          <Input label="الاسم بالكامل" value={name} onChange={(e) => setName(e.target.value)} maxLength={100} />
          <Input label="البريد الإلكتروني" value={profile?.email ?? ''} disabled icon="message-circle" hint="الإيميل مرتبط بحسابك ومينفعش يتغير من هنا." />
          <Input label="رقم الموبايل" value={phone} onChange={(e) => setPhone(e.target.value)} icon="phone" maxLength={30} />
          {msg && <div role="status" style={{ fontSize: 'var(--size-body-sm)', color: msg.ok ? 'var(--status-success-fg)' : 'var(--status-danger-fg)' }}>{msg.text}</div>}
          <div><Button loading={busy} onClick={save}>احفظ التعديلات</Button></div>
        </div>
      </Card>
      <Card padding="lg">
        <h3 style={{ fontSize: 'var(--size-body-lg)', color: 'var(--text-title)', fontWeight: 'var(--weight-semibold)' }}>الأمان</h3>
        <p style={{ fontSize: 'var(--size-body-sm)', color: 'var(--text-muted)', margin: 'var(--space-4) 0 var(--space-6)' }}>هنبعتلك رابط على إيميلك لتغيير كلمة السر.</p>
        <Button variant="secondary" size="sm" fullWidth icon="shield-check" loading={pwBusy} onClick={resetPassword}>غيّر كلمة السر</Button>
      </Card>
    </div>
  )
}

function Notifications() {
  const { data, loading, error, refetch } = useMyNotifications()
  const [filter, setFilter] = useState('all')
  const items = data ?? []
  const unread = items.filter((n) => !n.read_at).length
  const filtered = filter === 'unread' ? items.filter((n) => !n.read_at) : items
  const markAll = async () => { try { await api.markAllNotificationsRead(); refetch() } catch {} }
  const markOne = async (id: string) => { try { await api.markNotificationRead(id); refetch() } catch {} }
  const iconOf = (t: string) => (t.includes('cancel') ? 'x' : t.includes('confirm') ? 'check-circle' : 'bell')
  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-7)', flexWrap: 'wrap', gap: 12 }}>
        <Tabs value={filter} onChange={setFilter} items={[
          { value: 'all', label: 'كل الإشعارات', count: items.length },
          { value: 'unread', label: 'غير مقروءة', count: unread },
        ]} />
        {unread > 0 && <Button variant="ghost" size="sm" onClick={markAll}>علّم الكل كمقروء</Button>}
      </div>
      {loading && <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 'var(--space-9)' }}>جاري التحميل...</p>}
      {error && <p style={{ color: 'var(--status-danger-fg)' }}>{api.friendlyError(error)}</p>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        {!loading && filtered.length === 0 && <p style={{ color: 'var(--text-subtle)', textAlign: 'center', padding: 'var(--space-11) 0' }}>مفيش إشعارات هنا.</p>}
        {filtered.map((n) => (
          <Card key={n.id} padding="lg" interactive onClick={() => !n.read_at && markOne(n.id)} style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-6)', opacity: n.read_at ? .75 : 1, borderInlineStart: n.read_at ? '3px solid transparent' : '3px solid var(--saffron-500)' }}>
            <span style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: 'var(--surface-brand-soft)', color: 'var(--pine-700)', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: '0 0 auto' }}>
              <Icon name={iconOf(n.type)} size={20} />
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', gap: 'var(--space-5)', alignItems: 'center', flexWrap: 'wrap' }}>
                <strong style={{ fontSize: 'var(--size-body)', color: 'var(--text-title)' }}>{n.title}</strong>
                {!n.read_at && <Badge tone="brand" dot>جديد</Badge>}
              </div>
              <p style={{ fontSize: 'var(--size-body-sm)', color: 'var(--text-muted)', margin: '6px 0 0' }}>{n.message}</p>
            </div>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--size-caption)', color: 'var(--text-subtle)', whiteSpace: 'nowrap' }}>{n.created_at.slice(0, 10)}</span>
          </Card>
        ))}
      </div>
    </>
  )
}

function Help() {
  const faqs = [
    { q: 'إزاي ألغي حجز؟', a: 'من قسم الحجوزات، اضغط على أيقونة الإلغاء بجانب الحجز. الميعاد بيرجع متاح لغيرك.' },
    { q: 'مفيش رابط للجلسة؟', a: 'الرابط بيظهر في تفاصيل الحجز بعد ما المستشار يأكّد الحجز.' },
    { q: 'الدفع بيتم إزاي؟', a: 'تختار وقت الحجز: كاش وقت الجلسة، أو تحويل على المحفظة / إنستا باي. لو حوّلت، افتح الحجز واكتب رقم العملية وإحنا نأكّد الدفع ونبعتلك إشعار وفاتورة.' },
    { q: 'أقدر أحجز من غير ما أدخل الموقع؟', a: 'اكتب للمساعد الذكي (الزرار الأخضر تحت) الميعاد اللي يناسبك وهيجهّز لك الحجز.' },
  ]
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 'var(--space-8)', alignItems: 'start' }}>
      <Card padding="lg">
        <h3 style={{ fontSize: 'var(--size-h3)', marginBottom: 'var(--space-6)' }}>أسئلة شائعة</h3>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {faqs.map((f, i) => (
            <details key={i} style={{ borderTop: i ? '1px solid var(--border-subtle)' : 'none', padding: 'var(--space-6) 0' }}>
              <summary style={{ cursor: 'pointer', listStyle: 'none', display: 'flex', justifyContent: 'space-between', gap: 'var(--space-5)', fontSize: 'var(--size-body-lg)', color: 'var(--text-title)', fontWeight: 'var(--weight-medium)' }}>
                <span>{f.q}</span>
                <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>+</span>
              </summary>
              <p style={{ fontSize: 'var(--size-body-sm)', color: 'var(--text-muted)', marginTop: 'var(--space-5)' }}>{f.a}</p>
            </details>
          ))}
        </div>
      </Card>
      <Card padding="lg">
        <span style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', background: 'var(--surface-brand-soft)', color: 'var(--pine-700)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 'var(--space-6)' }}><Icon name="message-circle" size={22} /></span>
        <h3 style={{ fontSize: 'var(--size-body-lg)', color: 'var(--text-title)', fontWeight: 'var(--weight-semibold)' }}>محتاج مساعدة؟</h3>
        <p style={{ fontSize: 'var(--size-body-sm)', color: 'var(--text-muted)', margin: 'var(--space-4) 0 var(--space-6)' }}>اسأل المساعد الذكي عن الأسعار والمواعيد أو خلّيه يحجز لك.</p>
        <Button size="sm" fullWidth icon="message-circle" onClick={openAssistant}>افتح المساعد</Button>
      </Card>
    </div>
  )
}
