import { useState } from 'react'
import { Card, Badge, Button, Icon, IconButton, Tabs, Dialog, Switch, Select, Input } from '@/lib/ui'
import { payments as PAY, clients, typeOf } from '@/lib/data'
import type { Booking } from '@/types/data'
import { useAuth } from '@/lib/auth'
import { useMyBookings } from '@/lib/hooks'
import { toDisplayBooking } from '@/lib/adapt'
import * as api from '@/lib/api'

const ME = 'c1'
const meData = clients.find((c) => c.id === ME) || { id: ME, name: 'منة حسن', email: 'mona.hassan@example.com', phone: '01012345678', joinedAt: '2026-03-02', bookings: 0, spent: 0, lastBooking: '' }

interface Props { onBook: () => void }

const SECTIONS = [
  { id: 'overview', label: 'نظرة عامة', icon: 'briefcase' },
  { id: 'bookings', label: 'الحجوزات', icon: 'calendar' },
  { id: 'receipts', label: 'الفواتير', icon: 'receipt' },
  { id: 'notifications', label: 'الإشعارات', icon: 'bell', badge: 2 },
  { id: 'profile', label: 'البروفايل', icon: 'user' },
  { id: 'payments', label: 'طرق الدفع', icon: 'credit-card' },
  { id: 'settings', label: 'الإعدادات', icon: 'shield-check' },
  { id: 'help', label: 'المساعدة', icon: 'message-circle' },
] as const
type Section = (typeof SECTIONS)[number]['id']

export default function Account({ onBook }: Props) {
  const [section, setSection] = useState<Section>('overview')
  const { profile } = useAuth()
  const me = { name: profile?.name ?? meData.name, email: profile?.email ?? meData.email }
  const titles: Record<Section, [string, string]> = {
    overview: [`أهلاً ${me.name.split(' ')[0]}`, 'ملخص سريع لحجوزاتك ونشاطك مع مشورة.'],
    bookings: ['حجوزاتي', 'كل حجوزاتك القادمة والفايتة في مكان واحد.'],
    receipts: ['الفواتير', 'كل فاتورة قابلة للتنزيل PDF.'],
    profile: ['البروفايل الشخصي', 'بياناتك اللي بتظهر لأحمد قبل الجلسة.'],
    payments: ['طرق الدفع', 'الكروت والمحافظ المحفوظة للحجوزات الجاية.'],
    notifications: ['الإشعارات', 'كل الأحداث المتعلقة بحسابك وحجوزاتك.'],
    settings: ['الإعدادات', 'التنبيهات، اللغة، والمنطقة الزمنية.'],
    help: ['المساعدة', 'أسئلة شائعة أو تواصل مباشر معانا.'],
  }
  const [title, sub] = titles[section]

  return (
    <div style={{ maxWidth: 1160, margin: '0 auto', padding: 'var(--space-10) var(--space-8) var(--space-13)' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 'var(--space-8)', marginBottom: 'var(--space-9)' }}>
        <div>
          <h1 style={{ fontSize: 'var(--size-h1)' }}>{title}</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: 'var(--space-4)' }}>{sub}</p>
        </div>
        <Button icon="plus" onClick={onBook}>احجز مشورة</Button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 'var(--space-8)', alignItems: 'start' }}>
        <SideNav section={section} onNav={setSection} me={me} />
        <div style={{ minWidth: 0 }}>
          {section === 'overview' && <Overview onNav={setSection} onBook={onBook} />}
          {section === 'bookings' && <Bookings onBook={onBook} />}
          {section === 'receipts' && <Receipts />}
          {section === 'profile' && <Profile />}
          {section === 'payments' && <PaymentMethods />}
          {section === 'notifications' && <Notifications />}
          {section === 'settings' && <Settings />}
          {section === 'help' && <Help />}
        </div>
      </div>
    </div>
  )
}

function SideNav({ section, onNav, me }: { section: Section; onNav: (s: Section) => void; me: { name: string; email: string } }) {
  return (
    <Card padding="none" style={{ position: 'sticky', top: 'var(--space-9)' }}>
      <div style={{ padding: 'var(--space-7)', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: 'var(--space-5)' }}>
        <span style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--pine-700)', color: 'var(--sand-050)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, fontWeight: 'var(--weight-semibold)' }}>{me.name[0]}</span>
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
              {'badge' in s && s.badge && <span style={{ background: 'var(--saffron-500)', color: 'var(--pine-950)', fontSize: 11, fontWeight: 'var(--weight-bold)', minWidth: 20, height: 20, borderRadius: 'var(--radius-pill)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '0 6px' }}>{s.badge}</span>}
            </button>
          )
        })}
      </nav>
      <div style={{ padding: 'var(--space-5)', borderTop: '1px solid var(--border-subtle)' }}>
        <Button variant="ghost" size="sm" fullWidth icon="log-out">خروج</Button>
      </div>
    </Card>
  )
}

function Overview({ onNav, onBook }: { onNav: (s: Section) => void; onBook: () => void }) {
  const { data: rows } = useMyBookings()
  const mine: Booking[] = (rows ?? []).map(toDisplayBooking)
  const upcoming = mine.filter((b) => b.status === 'مؤكّد').sort((a, b) => a.date.localeCompare(b.date))
  const next = upcoming[0]
  const past = mine.filter((b) => b.status === 'خلصت')
  const totalSpent = mine.filter((b) => b.status !== 'ملغي').reduce((s, b) => s + b.price, 0)
  const t = next ? typeOf(next.typeId) : null

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
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Icon name={next.mode === 'video' ? 'video' : 'phone'} size={16} />{next.mode === 'video' ? 'مكالمة فيديو' : 'مكالمة صوتية'}</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
              <Button variant="accent" icon={next.mode === 'video' ? 'video' : 'phone'}>ادخل الجلسة</Button>
              <Button variant="ghost" onClick={() => onNav('bookings')} style={{ color: 'var(--pine-200)' }}>التفاصيل</Button>
            </div>
          </div>
        </Card>
      ) : (
        <Card padding="lg" style={{ textAlign: 'center', padding: 'var(--space-11)', background: 'var(--surface-brand-soft)', border: 'none' }}>
          <h3 style={{ fontSize: 'var(--size-h3)' }}>مفيش جلسات قادمة</h3>
          <p style={{ color: 'var(--text-muted)', marginTop: 'var(--space-4)' }}>احجز مشورة جديدة مع أحمد.</p>
          <Button icon="plus" onClick={onBook} style={{ marginTop: 'var(--space-6)' }}>احجز مشورة</Button>
        </Card>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 'var(--space-6)', marginTop: 'var(--space-8)' }}>
        {[
          { icon: 'calendar', label: 'جلسات قادمة', value: upcoming.length },
          { icon: 'check-circle-2', label: 'جلسات خلصت', value: past.length },
          { icon: 'credit-card', label: 'إجمالي الصرف', value: `${totalSpent} ج.م` },
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

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 'var(--space-7)', marginTop: 'var(--space-8)', alignItems: 'start' }}>
        <Card padding="lg">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 'var(--space-6)' }}>
            <h3 style={{ fontSize: 'var(--size-h3)' }}>آخر النشاط</h3>
            <Button variant="ghost" size="sm" onClick={() => onNav('bookings')}>كل الحجوزات</Button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {mine.slice(0, 4).map((b, i) => (
              <div key={b.id} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-5)', padding: 'var(--space-5) 0', borderTop: i ? '1px solid var(--border-subtle)' : 'none' }}>
                <span style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: b.mode === 'video' ? 'var(--mode-video-bg)' : 'var(--mode-audio-bg)', color: b.mode === 'video' ? 'var(--mode-video-fg)' : 'var(--mode-audio-fg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: '0 0 auto' }}><Icon name={b.mode === 'video' ? 'video' : 'phone'} size={17} /></span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 'var(--size-body-sm)', fontWeight: 'var(--weight-medium)', color: 'var(--text-title)' }}>{typeOf(b.typeId).title}</div>
                  <div style={{ fontSize: 'var(--size-caption)', color: 'var(--text-muted)' }}>{b.day} · {b.time}</div>
                </div>
                <Badge tone={b.status === 'مؤكّد' ? 'success' : (b.status === 'ملغي' ? 'danger' : 'neutral')} dot={b.status === 'مؤكّد'}>{b.status}</Badge>
              </div>
            ))}
          </div>
        </Card>
        <Card padding="lg" style={{ background: 'var(--sand-100)', border: 'none' }}>
          <h3 style={{ fontSize: 'var(--size-h3)' }}>إجراءات سريعة</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', marginTop: 'var(--space-6)' }}>
            <Button icon="plus" fullWidth onClick={onBook}>احجز مشورة جديدة</Button>
            <Button variant="secondary" icon="receipt" fullWidth onClick={() => onNav('receipts')}>حمّل آخر فاتورة</Button>
            <Button variant="secondary" icon="user" fullWidth onClick={() => onNav('profile')}>عدّل بياناتك</Button>
            <Button variant="ghost" icon="message-circle" fullWidth onClick={() => onNav('help')}>محتاج مساعدة؟</Button>
          </div>
        </Card>
      </div>
    </>
  )
}

function BookingRow({ b, onCancel, onDetails }: { b: Booking; onCancel: (b: Booking) => void; onDetails: (b: Booking) => void }) {
  const done = b.status !== 'مؤكّد'
  const t = typeOf(b.typeId)
  return (
    <Card padding="lg" interactive onClick={() => onDetails(b)} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-7)' }}>
      <span style={{ width: 46, height: 46, flex: '0 0 auto', borderRadius: 'var(--radius-md)', background: b.mode === 'video' ? 'var(--mode-video-bg)' : 'var(--mode-audio-bg)', color: b.mode === 'video' ? 'var(--mode-video-fg)' : 'var(--mode-audio-fg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon name={b.mode === 'video' ? 'video' : 'phone'} size={21} />
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-5)' }}>
          <strong style={{ fontSize: 'var(--size-body-lg)', color: 'var(--text-title)' }}>{t.title}</strong>
          <Badge tone={b.status === 'مؤكّد' ? 'success' : (b.status === 'ملغي' ? 'danger' : 'neutral')} dot={b.status === 'مؤكّد'}>{b.status}</Badge>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-7)', marginTop: 'var(--space-4)', fontSize: 'var(--size-body-sm)', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Icon name="calendar" size={15} />{b.day}</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-mono)' }}><Icon name="clock" size={15} />{b.time} · {b.minutes} دقيقة</span>
          <span style={{ fontFamily: 'var(--font-mono)' }}>{b.price} ج.م</span>
        </div>
      </div>
      {done ? (
        <Button variant="secondary" size="sm" icon="receipt">الفاتورة</Button>
      ) : (
        <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
          <Button size="sm" icon={b.mode === 'video' ? 'video' : 'phone'}>ادخل الجلسة</Button>
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
  const { data: rows, loading, error, refetch } = useMyBookings()

  const mine: Booking[] = (rows ?? []).map(toDisplayBooking)
  const list = mine.filter((b) => (tab === 'next' ? b.status === 'مؤكّد' : b.status !== 'مؤكّد'))

  const doCancel = async () => {
    if (!cancel) return
    const row = (rows ?? []).find((r: any) => (r.ref ?? r.id) === cancel.id)
    if (row) {
      try { await api.cancelBooking((row as any).id); refetch() } catch {}
    }
    setCancel(null)
  }

  return (
    <>
      <Tabs value={tab} onChange={setTab} items={[
        { value: 'next', label: 'قادمة', count: mine.filter((b) => b.status === 'مؤكّد').length },
        { value: 'past', label: 'فايتة', count: mine.filter((b) => b.status !== 'مؤكّد').length },
      ]} style={{ marginBottom: 'var(--space-8)' }} />

      {loading && <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 'var(--space-9)' }}>جاري التحميل...</p>}
      {error && (
        <Card padding="lg" style={{ background: 'var(--status-danger-bg)', borderColor: 'var(--status-danger-fg)' }}>
          <strong style={{ color: 'var(--status-danger-fg)' }}>ما قدرناش نجيب الحجوزات</strong>
          <p style={{ fontSize: 'var(--size-body-sm)', color: 'var(--text-muted)', margin: '6px 0 0' }}>
            {error.message}. تأكد إن الجداول اتنشأت في Supabase.
          </p>
        </Card>
      )}

      {!loading && !error && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
          {list.length === 0 && (
            <Card padding="lg" style={{ textAlign: 'center', padding: 'var(--space-11)' }}>
              <span style={{ width: 56, height: 56, borderRadius: 'var(--radius-lg)', background: 'var(--surface-brand-soft)', color: 'var(--pine-700)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 'var(--space-6)' }}><Icon name="calendar" size={28} /></span>
              <h3 style={{ fontSize: 'var(--size-h3)' }}>مفيش حجوزات هنا لسه</h3>
              <p style={{ color: 'var(--text-muted)', marginTop: 'var(--space-4)' }}>ابدأ بأول مشورة مع أحمد.</p>
              <Button icon="plus" onClick={onBook} style={{ marginTop: 'var(--space-7)' }}>احجز مشورة</Button>
            </Card>
          )}
          {list.map((b) => <BookingRow key={b.id} b={b} onCancel={setCancel} onDetails={setDetails} />)}
        </div>
      )}

      {details && <BookingDetailsDialog booking={details} onClose={() => setDetails(null)} onCancel={setCancel} />}

      <Dialog open={!!cancel} dir="rtl" onClose={() => setCancel(null)} title="تلغي الحجز؟"
        description={cancel ? `${typeOf(cancel.typeId).title} — ${cancel.day} ${cancel.time}. الإلغاء قبل ٢٤ ساعة بيرجّع المبلغ كامل.` : ''}
        footer={<><Button variant="danger" onClick={doCancel}>أكّد الإلغاء</Button><Button variant="ghost" onClick={() => setCancel(null)}>سيبه</Button></>} />
    </>
  )
}

function BookingDetailsDialog({ booking, onClose, onCancel }: { booking: Booking; onClose: () => void; onCancel: (b: Booking) => void }) {
  const t = typeOf(booking.typeId)
  const payment = PAY.find((p) => p.bookingId === booking.id)
  const isUpcoming = booking.status === 'مؤكّد'
  const rows: [string, string][] = [
    ['رقم الحجز', booking.id.toUpperCase()],
    ['نوع الاستشارة', t.title],
    ['الطريقة', booking.mode === 'video' ? 'مكالمة فيديو' : 'مكالمة صوتية'],
    ['الميعاد', `${booking.day} — ${booking.time}`],
    ['المدة', `${booking.minutes} دقيقة`],
    ['السعر', `${booking.price} ج.م`],
    ['الحالة', booking.status],
    ...(booking.topic ? [['موضوع المشورة', booking.topic] as [string, string]] : []),
    ...(payment ? [['طريقة الدفع', payment.method] as [string, string], ['رقم الفاتورة', payment.id] as [string, string]] : []),
  ]
  return (
    <Dialog open dir="rtl" onClose={onClose} title={t.title} description={`${booking.day} — ${booking.time}`}
      footer={
        <>
          {isUpcoming && <Button icon={booking.mode === 'video' ? 'video' : 'phone'}>ادخل الجلسة</Button>}
          {isUpcoming && <Button variant="danger" onClick={() => { onCancel(booking); onClose() }}>ألغِ الحجز</Button>}
          {!isUpcoming && <Button icon="receipt">نزّل الفاتورة</Button>}
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
        {isUpcoming && (
          <div style={{ padding: 'var(--space-6)', borderRadius: 'var(--radius-md)', background: 'var(--surface-brand-soft)', fontSize: 'var(--size-body-sm)', color: 'var(--text-body)', display: 'flex', gap: 'var(--space-5)' }}>
            <Icon name="info" size={18} />
            <div>لينك الجلسة يظهر لك هنا قبل الميعاد بـ ١٥ دقيقة. الإلغاء قبل ٢٤ ساعة يرجّع المبلغ كامل.</div>
          </div>
        )}
      </div>
    </Dialog>
  )
}

function Receipts() {
  const { data: rows } = useMyBookings()
  const mine: Booking[] = (rows ?? []).map(toDisplayBooking)
  const paidCount = mine.filter((b) => b.status !== 'ملغي').length
  const total = mine.filter((b) => b.status !== 'ملغي').reduce((s, b) => s + b.price, 0)
  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 'var(--space-6)', marginBottom: 'var(--space-8)' }}>
        <Card padding="lg"><div style={{ fontSize: 'var(--size-body-sm)', color: 'var(--text-muted)' }}>عدد الفواتير</div><div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--size-h2)', fontWeight: 'var(--weight-semibold)', marginTop: 'var(--space-4)' }}>{paidCount}</div></Card>
        <Card padding="lg"><div style={{ fontSize: 'var(--size-body-sm)', color: 'var(--text-muted)' }}>إجمالي الصرف</div><div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--size-h2)', fontWeight: 'var(--weight-semibold)', marginTop: 'var(--space-4)' }}>{total} ج.م</div></Card>
        <Card padding="lg"><div style={{ fontSize: 'var(--size-body-sm)', color: 'var(--text-muted)' }}>آخر فاتورة</div><div style={{ fontSize: 'var(--size-body-lg)', fontWeight: 'var(--weight-semibold)', marginTop: 'var(--space-4)', color: 'var(--text-title)' }}>{mine[0]?.day || '—'}</div></Card>
      </div>
      <Card padding="none">
        <div style={{ display: 'grid', gridTemplateColumns: '110px 1fr 120px 100px 80px', gap: 'var(--space-6)', padding: 'var(--space-6) var(--space-7)', fontSize: 'var(--size-caption)', color: 'var(--text-subtle)' }}>
          <span>الرقم</span><span>نوع الاستشارة</span><span>التاريخ</span><span>المبلغ</span><span></span>
        </div>
        {mine.map((b) => (
          <div key={b.id} style={{ display: 'grid', gridTemplateColumns: '110px 1fr 120px 100px 80px', gap: 'var(--space-6)', alignItems: 'center', padding: 'var(--space-6) var(--space-7)', borderTop: '1px solid var(--border-subtle)' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--size-caption)', color: 'var(--text-subtle)' }}>{b.id.toUpperCase()}</span>
            <span style={{ fontSize: 'var(--size-body-sm)', color: 'var(--text-title)', fontWeight: 'var(--weight-medium)' }}>{typeOf(b.typeId).title}</span>
            <span style={{ fontSize: 'var(--size-body-sm)', color: 'var(--text-muted)' }}>{b.day}</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--size-body-sm)', fontWeight: 'var(--weight-semibold)', color: 'var(--text-title)' }}>{b.price} ج.م</span>
            <Button variant="ghost" size="sm" icon="receipt">نزّل</Button>
          </div>
        ))}
      </Card>
    </>
  )
}

function Profile() {
  const [name, setName] = useState(meData.name)
  const [email, setEmail] = useState(meData.email)
  const [phone, setPhone] = useState(meData.phone)
  const [company, setCompany] = useState('استوديو تصميم صغير')
  const [about, setAbout] = useState('')
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 'var(--space-8)', alignItems: 'start' }}>
      <Card padding="lg">
        <h3 style={{ fontSize: 'var(--size-h3)', marginBottom: 'var(--space-7)' }}>البيانات الشخصية</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          <Input label="الاسم بالكامل" value={name} onChange={(e) => setName(e.target.value)} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-5)' }}>
            <Input label="البريد الإلكتروني" value={email} onChange={(e) => setEmail(e.target.value)} icon="message-circle" />
            <Input label="رقم الموبايل" value={phone} onChange={(e) => setPhone(e.target.value)} icon="phone" />
          </div>
          <Input label="اسم الشركة أو المشروع" value={company} onChange={(e) => setCompany(e.target.value)} hint="اختياري، بس بيساعد أحمد يفهم سياقك." />
          <Input label="نبذة عنك" multiline rows={3} placeholder="سطرين عن شغلك أو خلفيتك — اختياري" value={about} onChange={(e) => setAbout(e.target.value)} />
          <div style={{ display: 'flex', gap: 'var(--space-5)', marginTop: 'var(--space-4)' }}>
            <Button>احفظ التعديلات</Button>
            <Button variant="ghost">إلغاء</Button>
          </div>
        </div>
      </Card>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
        <Card padding="lg" style={{ textAlign: 'center' }}>
          <span style={{ width: 84, height: 84, borderRadius: '50%', background: 'var(--pine-700)', color: 'var(--sand-050)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 30, fontWeight: 'var(--weight-semibold)' }}>{name[0]}</span>
          <h3 style={{ fontSize: 'var(--size-h3)', marginTop: 'var(--space-6)' }}>{name}</h3>
          <p style={{ fontSize: 'var(--size-body-sm)', color: 'var(--text-muted)', marginTop: 4 }}>عميل من {meData.joinedAt}</p>
          <Button variant="secondary" size="sm" icon="user" fullWidth style={{ marginTop: 'var(--space-7)' }}>غيّر الصورة</Button>
        </Card>
        <Card padding="lg">
          <h3 style={{ fontSize: 'var(--size-body-lg)', color: 'var(--text-title)', fontWeight: 'var(--weight-semibold)' }}>الأمان</h3>
          <div style={{ marginTop: 'var(--space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
            <Button variant="secondary" size="sm" fullWidth icon="shield-check">غيّر كلمة السر</Button>
            <Button variant="ghost" size="sm" fullWidth>تفعيل التحقق بخطوتين</Button>
          </div>
        </Card>
      </div>
    </div>
  )
}

function PaymentMethods() {
  const [defaultId, setDefaultId] = useState('c1-visa')
  const cards = [
    { id: 'c1-visa', brand: 'Visa', last4: '4242', exp: '12/28', type: 'card' as const },
    { id: 'c1-mc', brand: 'Mastercard', last4: '8817', exp: '06/27', type: 'card' as const },
    { id: 'c1-vf', brand: 'فودافون كاش', last4: '5678', exp: '', type: 'wallet' as const },
  ]
  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-7)' }}>
        <div>
          <h3 style={{ fontSize: 'var(--size-h3)' }}>الكروت والمحافظ المحفوظة</h3>
          <p style={{ fontSize: 'var(--size-body-sm)', color: 'var(--text-muted)', marginTop: 'var(--space-3)' }}>الطريقة الأساسية هتُستخدم تلقائيًا وقت الحجز.</p>
        </div>
        <Button icon="plus">أضف طريقة دفع</Button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 'var(--space-6)' }}>
        {cards.map((c) => {
          const isCard = c.type === 'card'
          return (
            <Card key={c.id} padding="lg" selected={defaultId === c.id} style={{ cursor: 'pointer' }} onClick={() => setDefaultId(c.id)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', background: isCard ? 'var(--mode-video-bg)' : 'var(--mode-audio-bg)', color: isCard ? 'var(--mode-video-fg)' : 'var(--mode-audio-fg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name={isCard ? 'credit-card' : 'phone'} size={22} />
                </span>
                {defaultId === c.id && <Badge tone="brand" dot>الأساسية</Badge>}
              </div>
              <div style={{ marginTop: 'var(--space-6)' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--size-body-lg)', color: 'var(--text-title)', fontWeight: 'var(--weight-semibold)' }}>
                  {isCard ? `•••• •••• •••• ${c.last4}` : `${c.brand} — ${c.last4}`}
                </div>
                <div style={{ fontSize: 'var(--size-body-sm)', color: 'var(--text-muted)', marginTop: 'var(--space-3)' }}>
                  {c.brand}{c.exp ? ` · تنتهي ${c.exp}` : ''}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 'var(--space-4)', marginTop: 'var(--space-7)', paddingTop: 'var(--space-6)', borderTop: '1px solid var(--border-subtle)' }}>
                <Button variant="ghost" size="sm">تعديل</Button>
                <Button variant="ghost" size="sm" style={{ color: 'var(--status-danger-fg)' }}>إزالة</Button>
              </div>
            </Card>
          )
        })}
      </div>
      <Card padding="lg" style={{ marginTop: 'var(--space-8)', background: 'var(--surface-brand-soft)', border: 'none' }}>
        <div style={{ display: 'flex', gap: 'var(--space-5)', alignItems: 'flex-start' }}>
          <Icon name="shield-check" size={22} />
          <div>
            <strong style={{ display: 'block', color: 'var(--pine-800)', marginBottom: 4 }}>الدفع مأمّن</strong>
            <p style={{ fontSize: 'var(--size-body-sm)', color: 'var(--text-body)', margin: 0 }}>البيانات بتيجي مشفّرة عن طريق بوابة الدفع. مشورة ما بتشوفش رقم كارتك أو الـ CVV.</p>
          </div>
        </div>
      </Card>
    </>
  )
}

function Notifications() {
  const [items, setItems] = useState([
    { id: 'un1', type: 'تذكير', title: 'جلستك بعد ٣٠ دقيقة', message: 'تسعير وربحية — الأربع ١٠ سبتمبر ٦:٣٠ م. جهّز الأرقام واللينك جاي.', date: '2026-09-10', read: false },
    { id: 'un2', type: 'حجز جديد', title: 'تأكيد حجز', message: 'اتأكّد حجزك: مراجعة سريعة — الخميس ١٨ سبتمبر ١١:٠٠ ص.', date: '2026-09-04', read: false },
    { id: 'un3', type: 'دفع', title: 'تمّ الدفع', message: 'اتسحب ٥٠٠ ج.م من كارت Visa •••• 4242 لحجز MSH-2201.', date: '2026-09-03', read: true },
    { id: 'un4', type: 'ميعاد', title: 'مواعيد جديدة اتفتحت', message: 'أحمد فتح مواعيد جديدة الأسبوع الجاي — شوفها.', date: '2026-08-28', read: true },
  ])
  const [filter, setFilter] = useState('all')
  const unread = items.filter((n) => !n.read).length
  const filtered = filter === 'unread' ? items.filter((n) => !n.read) : items
  const markAll = () => setItems(items.map((n) => ({ ...n, read: true })))
  const iconOf = (t: string) => t === 'دفع' ? 'credit-card' : t === 'إلغاء' ? 'x' : t === 'تذكير' ? 'bell' : t === 'ميعاد' ? 'calendar' : 'message-circle'
  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-7)' }}>
        <Tabs value={filter} onChange={setFilter} items={[
          { value: 'all', label: 'كل الإشعارات', count: items.length },
          { value: 'unread', label: 'غير مقروءة', count: unread },
        ]} />
        {unread > 0 && <Button variant="ghost" size="sm" onClick={markAll}>علّم الكل كمقروء</Button>}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        {filtered.length === 0 && <p style={{ color: 'var(--text-subtle)', textAlign: 'center', padding: 'var(--space-11) 0' }}>مفيش إشعارات هنا.</p>}
        {filtered.map((n) => (
          <Card key={n.id} padding="lg" style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-6)', opacity: n.read ? .75 : 1, borderInlineStart: n.read ? '3px solid transparent' : '3px solid var(--saffron-500)' }}>
            <span style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: 'var(--surface-brand-soft)', color: 'var(--pine-700)', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: '0 0 auto' }}>
              <Icon name={iconOf(n.type)} size={20} />
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', gap: 'var(--space-5)', alignItems: 'center', flexWrap: 'wrap' }}>
                <strong style={{ fontSize: 'var(--size-body)', color: 'var(--text-title)' }}>{n.title}</strong>
                <Badge tone="neutral">{n.type}</Badge>
                {!n.read && <Badge tone="brand" dot>جديد</Badge>}
              </div>
              <p style={{ fontSize: 'var(--size-body-sm)', color: 'var(--text-muted)', margin: '6px 0 0' }}>{n.message}</p>
            </div>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--size-caption)', color: 'var(--text-subtle)', whiteSpace: 'nowrap' }}>{n.date}</span>
          </Card>
        ))}
      </div>
    </>
  )
}

function Settings() {
  const [waBefore, setWaBefore] = useState(true)
  const [emailConfirm, setEmailConfirm] = useState(true)
  const [newSlots, setNewSlots] = useState(false)
  const [marketing, setMarketing] = useState(false)
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-7)', alignItems: 'start' }}>
      <Card padding="lg">
        <h3 style={{ fontSize: 'var(--size-h3)', marginBottom: 'var(--space-6)' }}>الإشعارات</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          <Switch label="تنبيه واتساب قبل الميعاد" description="رسالة قبل الجلسة بساعة" checked={waBefore} onChange={(e) => setWaBefore(e.target.checked)} />
          <div style={{ height: 1, background: 'var(--border-subtle)' }} />
          <Switch label="تأكيد على الإيميل" description="التأكيد والفاتورة واللينك" checked={emailConfirm} onChange={(e) => setEmailConfirm(e.target.checked)} />
          <div style={{ height: 1, background: 'var(--border-subtle)' }} />
          <Switch label="مواعيد أحمد الجديدة" description="نقول لك أول ما مواعيد جديدة تفتح" checked={newSlots} onChange={(e) => setNewSlots(e.target.checked)} />
          <div style={{ height: 1, background: 'var(--border-subtle)' }} />
          <Switch label="نصائح ومحتوى شهري" description="مقال أو اتنين في الشهر — ما فيش سبام" checked={marketing} onChange={(e) => setMarketing(e.target.checked)} />
        </div>
      </Card>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-7)' }}>
        <Card padding="lg">
          <h3 style={{ fontSize: 'var(--size-h3)', marginBottom: 'var(--space-6)' }}>اللغة والمنطقة الزمنية</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
            <Select label="اللغة" options={['العربية', 'English']} />
            <Select label="المنطقة الزمنية" options={['القاهرة (GMT+2)', 'الرياض (GMT+3)', 'دبي (GMT+4)']} />
          </div>
        </Card>
        <Card padding="lg" style={{ borderColor: 'var(--status-danger-fg)' }}>
          <h3 style={{ fontSize: 'var(--size-h3)', color: 'var(--status-danger-fg)' }}>منطقة الخطر</h3>
          <p style={{ fontSize: 'var(--size-body-sm)', color: 'var(--text-muted)', margin: 'var(--space-4) 0 var(--space-6)' }}>حذف الحساب بيمسح كل بياناتك ومش هينفع رجوع.</p>
          <Button variant="danger" size="sm" icon="x">اطلب حذف الحساب</Button>
        </Card>
      </div>
    </div>
  )
}

function Help() {
  const faqs = [
    { q: 'إزاي ألغي حجز؟', a: 'من قسم الحجوزات، اضغط على أيقونة الإلغاء بجانب الحجز. الإلغاء قبل ٢٤ ساعة يرجّع المبلغ كامل تلقائيًا.' },
    { q: 'ما وصلنيش لينك الجلسة؟', a: 'اللينك بيظهر في تفاصيل الحجز قبل الميعاد بـ ١٥ دقيقة.' },
    { q: 'أقدر أغيّر الميعاد بعد الحجز؟', a: 'أيوه، قبل الجلسة بـ ٦ ساعات على الأقل.' },
    { q: 'إزاي أنزّل الفواتير؟', a: 'من قسم الفواتير، كل حجز مدفوع له زر تنزيل.' },
    { q: 'الدفع مأمّن؟', a: 'الدفع بيتم عن طريق بوابة معتمدة ومشفّرة.' },
  ]
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 'var(--space-8)', alignItems: 'start' }}>
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
        <p style={{ fontSize: 'var(--size-body-sm)', color: 'var(--text-muted)', margin: 'var(--space-4) 0 var(--space-6)' }}>راسلنا على الواتساب أو الإيميل ونرد خلال ساعتين.</p>
        <Button size="sm" fullWidth icon="phone">تواصل واتساب</Button>
        <Button variant="secondary" size="sm" fullWidth icon="message-circle" style={{ marginTop: 'var(--space-4)' }}>ابعت إيميل</Button>
      </Card>
    </div>
  )
}
