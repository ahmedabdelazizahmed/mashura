import { ReactNode } from 'react'
import { Card, Badge, Button, Icon, Input, Select, Checkbox, Stepper } from '@/lib/ui'
import { useOpenSlots } from '@/lib/hooks'
import { groupSlotsByDay } from '@/lib/adapt'
import type { BookingDraft, Mode, ConsultationType } from '@/types/data'

export const STEPS = ['اختيار الموعد', 'الدفع', 'التأكيد']
export const ORDER = ['configure', 'pay'] as const
export type Step = (typeof ORDER)[number]

// ------- pricing -------
export function computePrice(draft: BookingDraft): number {
  const t = draft.type
  if (!t || !draft.mode || !draft.duration) return t?.price ?? 0
  const opt = t.durations.find((d) => d.minutes === draft.duration)
  return opt?.prices[draft.mode] ?? t.price
}

const durationLabel = (m: number | null | undefined) => {
  if (!m) return '—'
  if (m === 15) return 'ربع ساعة'
  if (m === 30) return 'نص ساعة'
  if (m === 45) return '٤٥ دقيقة'
  if (m === 60) return 'ساعة كاملة'
  if (m === 90) return 'ساعة ونص'
  return `${m} دقيقة`
}

const modeLabel = (m: Mode | null | undefined) =>
  m === 'video' ? 'مكالمة فيديو'
  : m === 'audio' ? 'مكالمة صوتية'
  : m === 'in-person' ? 'مقابلة وجهاً لوجه'
  : '—'

const modeIcon = (m: Mode | null | undefined) =>
  m === 'video' ? 'video' : m === 'in-person' ? 'user' : 'phone'

const AR_NUM = (n: number) => String(n).replace(/\d/g, (d) => '٠١٢٣٤٥٦٧٨٩'[+d])

// ------- section header with big Arabic-Indic number -------
function SectionHeader({ n, title }: { n: number; title: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--space-5)', marginBottom: 'var(--space-6)' }}>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 22, fontWeight: 'var(--weight-bold)', color: 'var(--saffron-500)', minWidth: 32 }}>
        ٠{AR_NUM(n)}
      </span>
      <h2 style={{ fontSize: 'var(--size-h2)', color: 'var(--text-title)' }}>{title}</h2>
    </div>
  )
}

// ------- Segmented control (2-option) -------
function SegmentedControl<V>({ value, onChange, options }: { value: V | null; onChange: (v: V) => void; options: { value: V; label: string; icon?: string }[] }) {
  return (
    <div style={{ display: 'flex', border: '1.5px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', overflow: 'hidden', background: 'var(--surface-card)' }}>
      {options.map((o) => {
        const on = value === o.value
        return (
          <button key={String(o.value)} type="button" onClick={() => onChange(o.value)} aria-pressed={on} style={{
            flex: 1, padding: '13px 12px', border: 'none', cursor: 'pointer',
            background: on ? 'var(--pine-800)' : 'transparent',
            color: on ? 'var(--sand-050)' : 'var(--text-body)',
            fontFamily: 'var(--font-sans)',
            fontWeight: on ? 'var(--weight-semibold)' : 'var(--weight-medium)',
            fontSize: 'var(--size-body-sm)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            transition: 'all var(--duration-fast) var(--ease-out)',
          }}>
            {o.icon && <Icon name={o.icon} size={17} />}
            {o.label}
          </button>
        )
      })}
    </div>
  )
}

// ------- Service selector — vertical radio list, matches ref design -------
function ServiceList({ types, selected, onPick }: { types: ConsultationType[]; selected: ConsultationType | null; onPick: (t: ConsultationType) => void }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      {types.map((t) => {
        const on = selected?.id === t.id
        const minPrice = Math.min(...t.durations.flatMap((d) => Object.values(d.prices) as number[]))
        return (
          <button key={t.id} type="button" onClick={() => onPick(t)} aria-pressed={on} style={{
            display: 'flex', alignItems: 'center', gap: 'var(--space-5)', width: '100%',
            padding: 'var(--space-6) var(--space-7)', textAlign: 'start',
            borderRadius: 'var(--radius-lg)',
            border: `1.5px solid ${on ? 'var(--pine-800)' : 'var(--border-subtle)'}`,
            background: on ? 'var(--surface-brand-soft)' : 'var(--surface-card)',
            cursor: 'pointer',
            transition: 'all var(--duration-fast) var(--ease-out)',
          }}>
            {/* radio dot */}
            <span style={{
              width: 20, height: 20, borderRadius: '50%',
              border: `2px solid ${on ? 'var(--pine-800)' : 'var(--border-default)'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', flex: '0 0 auto',
              background: 'var(--surface-card)',
            }}>
              {on && <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--pine-800)' }} />}
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 'var(--space-5)' }}>
                <strong style={{ fontSize: 'var(--size-body-lg)', color: 'var(--text-title)', fontWeight: 'var(--weight-semibold)' }}>{t.title}</strong>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--size-body-sm)', color: 'var(--saffron-700)', fontWeight: 'var(--weight-semibold)' }}>
                  من {minPrice} ج.م
                </span>
              </div>
              <p style={{ fontSize: 'var(--size-body-sm)', color: 'var(--text-muted)', margin: '4px 0 0', lineHeight: 1.55 }}>{t.blurb}</p>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--size-caption)', color: 'var(--text-subtle)', marginTop: 6 }}>
                من {t.durations[0].minutes} حتى {t.durations[t.durations.length - 1].minutes} دقيقة
              </div>
            </div>
          </button>
        )
      })}
    </div>
  )
}

// ------- Method + Duration (compact, inline) -------
// If the type has only one mode (e.g. 'in-person' for مقابلة), the method
// selector is replaced with a locked info banner — no choice to make.
function MethodDurationSelector({ draft, set }: { draft: BookingDraft; set: (p: Partial<BookingDraft>) => void }) {
  const t = draft.type
  if (!t) return null
  const multiMode = t.modes.length > 1
  const activeMode = draft.mode ?? t.modes[0]

  const methodOptions: { value: Mode; label: string; icon?: string }[] = t.modes.map((m) => ({
    value: m,
    label: modeLabel(m),
    icon: modeIcon(m),
  }))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      {multiMode ? (
        <div>
          <label style={{ display: 'block', fontSize: 'var(--size-body-sm)', fontWeight: 'var(--weight-semibold)', color: 'var(--text-title)', marginBottom: 'var(--space-4)' }}>طريقة الاستشارة</label>
          <SegmentedControl<Mode> value={draft.mode} onChange={(v) => set({ mode: v })} options={methodOptions} />
        </div>
      ) : (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 'var(--space-5)',
          padding: 'var(--space-5) var(--space-6)',
          background: 'var(--surface-brand-soft)',
          border: '1px solid var(--pine-100)',
          borderRadius: 'var(--radius-md)',
        }}>
          <Icon name={modeIcon(t.modes[0])} size={18} />
          <span style={{ fontSize: 'var(--size-body-sm)', color: 'var(--pine-800)', fontWeight: 'var(--weight-semibold)' }}>{modeLabel(t.modes[0])}</span>
          <span style={{ fontSize: 'var(--size-caption)', color: 'var(--text-muted)', marginInlineStart: 'auto' }}>ده نوع الاستشارة الوحيد المتاح للخدمة دي.</span>
        </div>
      )}

      <div>
        <label style={{ display: 'block', fontSize: 'var(--size-body-sm)', fontWeight: 'var(--weight-semibold)', color: 'var(--text-title)', marginBottom: 'var(--space-4)' }}>المدة</label>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${t.durations.length}, 1fr)`, gap: 'var(--space-4)' }}>
          {t.durations.map((d) => {
            const on = draft.duration === d.minutes
            const p = d.prices[activeMode] ?? Object.values(d.prices)[0]
            return (
              <button key={d.minutes} type="button" onClick={() => set({ duration: d.minutes })} aria-pressed={on} style={{
                padding: 'var(--space-6) var(--space-4)', borderRadius: 'var(--radius-md)', cursor: 'pointer',
                border: `1.5px solid ${on ? 'var(--pine-800)' : 'var(--border-subtle)'}`,
                background: on ? 'var(--surface-brand-soft)' : 'var(--surface-card)',
                color: on ? 'var(--pine-800)' : 'var(--text-body)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                transition: 'all var(--duration-fast) var(--ease-out)',
              }}>
                <span style={{ fontSize: 'var(--size-body-sm)', fontWeight: on ? 'var(--weight-semibold)' : 'var(--weight-medium)' }}>{durationLabel(d.minutes)}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--size-caption)', color: on ? 'var(--saffron-700)' : 'var(--text-muted)' }}>{p} ج.م</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ------- Compact slot picker + legend — driven by real availability_slots -------
function SlotPicker({ draft, set }: { draft: BookingDraft; set: (p: Partial<BookingDraft>) => void }) {
  const { data: rows, loading, error } = useOpenSlots(21)
  const week = groupSlotsByDay(rows ?? [])
  const monthLabel = week[0]
    ? new Date(week[0].slots[0].startsAt).toLocaleDateString('ar-EG', { month: 'long', year: 'numeric', timeZone: 'Africa/Cairo' })
    : ''

  if (loading) return (
    <div style={{ textAlign: 'center', padding: 'var(--space-9)', border: '1px dashed var(--border-subtle)', borderRadius: 'var(--radius-md)', color: 'var(--text-muted)', fontSize: 'var(--size-body-sm)' }}>
      جاري تحميل المواعيد المتاحة...
    </div>
  )
  if (error) return (
    <div style={{ textAlign: 'center', padding: 'var(--space-9)', border: '1px dashed var(--status-danger-fg)', borderRadius: 'var(--radius-md)', color: 'var(--status-danger-fg)', fontSize: 'var(--size-body-sm)' }}>
      ما قدرناش نجيب المواعيد. تأكد إن جداول Supabase اتنشأت.
    </div>
  )
  if (week.length === 0) return (
    <div style={{ textAlign: 'center', padding: 'var(--space-9)', border: '1px dashed var(--border-subtle)', borderRadius: 'var(--radius-md)', color: 'var(--text-muted)', fontSize: 'var(--size-body-sm)' }}>
      مفيش مواعيد مفتوحة حاليًا — فعّل التنبيهات من حسابك وأول ما ميعاد يفتح نبعتلك.
    </div>
  )

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)', flexWrap: 'wrap', gap: 'var(--space-5)' }}>
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--weight-semibold)', fontSize: 'var(--size-body-lg)', color: 'var(--pine-800)' }}>{monthLabel}</span>
        <Select options={['القاهرة (GMT+2)', 'الرياض (GMT+3)', 'دبي (GMT+4)']} containerStyle={{ maxWidth: 200 }} />
      </div>

      {/* Day chips */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(72px, 1fr))', gap: 'var(--space-3)', marginBottom: 'var(--space-6)' }}>
        {week.map((d) => {
          const on = draft.day === d.label
          return (
            <button key={d.key} type="button" onClick={() => set({ day: d.label, slot: null, slotId: null, startsAt: null })} style={{
              padding: 'var(--space-5) var(--space-4)', borderRadius: 'var(--radius-md)', cursor: 'pointer',
              border: `1.5px solid ${on ? 'var(--pine-800)' : 'var(--border-subtle)'}`,
              background: on ? 'var(--pine-800)' : 'var(--surface-card)',
              color: on ? 'var(--sand-050)' : 'var(--text-body)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
              transition: 'all var(--duration-fast) var(--ease-out)',
            }}>
              <span style={{ fontSize: 'var(--size-caption)', fontWeight: 'var(--weight-semibold)' }}>{d.weekday}</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 20, fontWeight: 'var(--weight-bold)' }}>{d.dayNum}</span>
            </button>
          )
        })}
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 'var(--space-7)', marginBottom: 'var(--space-5)', fontSize: 'var(--size-caption)', color: 'var(--text-muted)', justifyContent: 'flex-end' }}>
        <LegendChip color="var(--green-600)" label="اختيارك" />
        <LegendChip color="var(--surface-card)" bordered label="متاح" />
      </div>

      {/* Time slots */}
      {(() => {
        const day = week.find((d) => d.label === draft.day)
        if (!day) return (
          <div style={{ textAlign: 'center', padding: 'var(--space-9) var(--space-6)', border: '1px dashed var(--border-subtle)', borderRadius: 'var(--radius-md)', color: 'var(--text-muted)', fontSize: 'var(--size-body-sm)' }}>
            اختار يوم من فوق تشوف المواعيد المتاحة
          </div>
        )
        return (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 'var(--space-3)' }}>
            {day.slots.map((s) => {
              const on = draft.slotId === s.id
              return (
                <button key={s.id} type="button" onClick={() => set({ slot: s.time, slotId: s.id, startsAt: s.startsAt })} style={{
                  padding: '12px', borderRadius: 'var(--radius-md)', cursor: 'pointer',
                  fontFamily: 'var(--font-mono)', fontSize: 'var(--size-body)',
                  background: on ? 'var(--green-600)' : 'var(--surface-card)',
                  color: on ? '#fff' : 'var(--text-body)',
                  border: `1.5px solid ${on ? 'var(--green-600)' : 'var(--border-subtle)'}`,
                  fontWeight: on ? 'var(--weight-semibold)' : 'var(--weight-medium)',
                  transition: 'all var(--duration-fast) var(--ease-out)',
                }}>{s.time}</button>
              )
            })}
          </div>
        )
      })()}
    </div>
  )
}

function LegendChip({ color, label, bordered }: { color: string; label: string; bordered?: boolean }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      <span style={{ width: 12, height: 12, borderRadius: 3, background: color, border: bordered ? '1px solid var(--border-subtle)' : 'none' }} />
      {label}
    </span>
  )
}

// ------- Summary panel (LEFT side — matches reference) -------
function BookingSummary({ draft, cta, canSubmit, onSubmit, submitting }: {
  draft: BookingDraft; cta: string; canSubmit: boolean; onSubmit: () => void; submitting: boolean
}) {
  const t = draft.type
  const price = computePrice(draft)
  const rows: [string, string][] = [
    ['الخدمة', t ? t.title : '—'],
    ['الطريقة', modeLabel(draft.mode)],
    ['المدة', durationLabel(draft.duration)],
    ['اليوم', draft.day ?? '—'],
    ['الوقت', draft.slot ?? '—'],
  ]
  return (
    <Card padding="lg" style={{ position: 'sticky', top: 'var(--space-9)', background: 'linear-gradient(180deg, var(--surface-card), var(--sand-050))', borderColor: 'var(--pine-100)' }}>
      <div style={{ fontSize: 'var(--size-overline)', fontWeight: 'var(--weight-bold)', color: 'var(--saffron-700)', letterSpacing: '.08em' }}>ملخّص الحجز</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)', marginTop: 'var(--space-7)' }}>
        {rows.map(([k, v]) => (
          <div key={k} style={{ display: 'flex', justifyContent: 'space-between', gap: 'var(--space-6)', fontSize: 'var(--size-body-sm)' }}>
            <span style={{ color: 'var(--text-muted)' }}>{k}</span>
            <span style={{ color: v === '—' ? 'var(--text-subtle)' : 'var(--text-title)', fontWeight: 'var(--weight-medium)', textAlign: 'end' }}>{v}</span>
          </div>
        ))}
      </div>
      <div style={{ height: 1, background: 'var(--border-subtle)', margin: 'var(--space-7) 0' }} />
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 'var(--size-body-sm)', color: 'var(--text-muted)' }}>الإجمالي</span>
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--weight-black)', fontSize: 32, color: 'var(--saffron-700)' }}>
          {price} <span style={{ fontSize: 14 }}>ج.م</span>
        </span>
      </div>
      <Button variant="accent" size="lg" fullWidth disabled={!canSubmit} loading={submitting}
        style={{ marginTop: 'var(--space-8)' }} onClick={onSubmit}>{cta}</Button>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 'var(--space-6)', fontSize: 'var(--size-caption)', color: 'var(--text-subtle)', justifyContent: 'center' }}>
        <Icon name="shield-check" size={14} />
        <span>الميعاد بيتحجز مؤقتًا أثناء الدفع</span>
      </div>
    </Card>
  )
}

// ------- Main flow -------
interface FlowProps {
  step: Step
  draft: BookingDraft
  set: (patch: Partial<BookingDraft>) => void
  next: () => void
  back: () => void
  submitting: boolean
  onConfirm: () => void
  types: ConsultationType[]
}

export function BookingFlow({ step, draft, set, next, back, submitting, onConfirm, types }: FlowProps) {
  const idx = ORDER.indexOf(step)
  const configureDone = !!(draft.type && draft.mode && draft.duration && draft.slot)
  const canSubmit = step === 'configure' ? configureDone : !!draft.terms
  const cta = step === 'configure' ? 'متابعة للدفع' : 'ادفع وأكّد الحجز'
  const submit = step === 'configure' ? next : onConfirm

  return (
    <div style={{ maxWidth: 1160, margin: '0 auto', padding: 'var(--space-10) var(--space-8) var(--space-13)' }}>
      <Stepper current={idx} steps={STEPS} style={{ marginBottom: 'var(--space-10)' }} />

      {/* summary LEFT, content RIGHT (RTL: 340px column on the start side) */}
      <div style={{ display: 'grid', gridTemplateColumns: '340px minmax(0, 1fr)', gap: 'var(--space-9)', alignItems: 'start' }}>
        <BookingSummary draft={draft} cta={cta} canSubmit={canSubmit} onSubmit={submit} submitting={submitting} />

        <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-10)' }}>
          {step === 'configure' && <ConfigurePanel draft={draft} set={set} types={types} />}
          {step === 'pay' && <PayPanel draft={draft} set={set} />}

          {idx > 0 && (
            <div>
              <Button variant="ghost" iconEnd="chevron-right" onClick={back}>رجوع لاختيار الموعد</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ------- Step 1 content: Configure -------
function ConfigurePanel({ draft, set, types }: { draft: BookingDraft; set: (p: Partial<BookingDraft>) => void; types: ConsultationType[] }) {
  const pickType = (nt: ConsultationType) => {
    const defaultDur = nt.durations.find((d) => d.minutes === nt.minutes)?.minutes ?? nt.durations[0]?.minutes ?? 30
    // Pick a mode the new type actually supports: keep the current one if it
    // still applies, otherwise fall back to the type's first mode.
    const nextMode = draft.mode && nt.modes.includes(draft.mode) ? draft.mode : nt.modes[0]
    set({ type: nt, duration: defaultDur, mode: nextMode })
  }
  return (
    <>
      {/* 01 — Service */}
      <section>
        <SectionHeader n={1} title="اختر الخدمة" />
        <p style={{ color: 'var(--text-muted)', marginTop: 'calc(-1 * var(--space-4))', marginBottom: 'var(--space-6)', fontSize: 'var(--size-body-sm)' }}>
          كل خدمة ليها مدد وأسعار — والمواعيد بتتحسب حسب المدة.
        </p>
        <ServiceList types={types} selected={draft.type} onPick={pickType} />
      </section>

      {/* 02 — Method + Duration (only after type) */}
      {draft.type && (
        <section>
          <SectionHeader n={2} title="الطريقة والمدة" />
          <MethodDurationSelector draft={draft} set={set} />
        </section>
      )}

      {/* 03 — Day + Time */}
      {draft.type && draft.mode && draft.duration && (
        <section>
          <SectionHeader n={3} title="اختر اليوم والميعاد" />
          <p style={{ color: 'var(--text-muted)', marginTop: 'calc(-1 * var(--space-4))', marginBottom: 'var(--space-6)', fontSize: 'var(--size-body-sm)' }}>
            المتاح بيتحدّث لحظيًا. المحجوز مش هيظهرلك متاح.
          </p>
          <SlotPicker draft={draft} set={set} />
        </section>
      )}

      {/* 04 — Topic (optional) */}
      {draft.slot && (
        <section>
          <SectionHeader n={4} title="موضوع المشورة (اختياري)" />
          <div style={{ maxWidth: 640 }}>
            <Input multiline rows={3} placeholder="سطرين يوفّروا وقت المكالمة"
              value={draft.topic} onChange={(e) => set({ topic: e.target.value })}
              hint="بيساعد أحمد يحضّر قبل الجلسة." />
          </div>
        </section>
      )}
    </>
  )
}

// ------- Step 2 content: Pay -------
function PayPanel({ draft, set }: { draft: BookingDraft; set: (p: Partial<BookingDraft>) => void }) {
  return (
    <>
      <section>
        <SectionHeader n={1} title="طريقة الدفع" />
        <div style={{ maxWidth: 480 }}>
          <SegmentedControl<'card' | 'wallet'>
            value={draft.pm}
            onChange={(v) => set({ pm: v })}
            options={[
              { value: 'card', label: 'كارت بنكي', icon: 'credit-card' },
              { value: 'wallet', label: 'محفظة موبايل', icon: 'phone' },
            ]}
          />
        </div>
      </section>

      <section>
        <SectionHeader n={2} title="بيانات الدفع" />
        <div style={{ maxWidth: 'var(--width-form)', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          <Input label="رقم الكارت" placeholder="٤٥٤٥ ٠٠٠٠ ٠٠٠٠ ٠٠٠٠" icon="credit-card" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 'var(--space-5)' }}>
            <Input label="تاريخ الانتهاء" placeholder="١٢/٢٨" />
            <Input label="CVV" placeholder="١٢٣" />
          </div>
          <Input label="الإيميل" defaultValue="you@example.com" hint="التأكيد واللينك بيوصلوا هنا." />
          <Checkbox label="موافق على شروط الحجز وسياسة الإلغاء"
            checked={!!draft.terms} onChange={(e) => set({ terms: e.target.checked })} />
        </div>
      </section>
    </>
  )
}

// ------- Confirmation view (step 3 in stepper) -------
export function ConfirmationView({ draft, onDone }: { draft: BookingDraft; onDone: () => void }) {
  const rows: [string, ReactNode][] = [
    ['الخدمة', draft.type ? draft.type.title : '—'],
    ['الطريقة', modeLabel(draft.mode)],
    ['المدة', durationLabel(draft.duration)],
    ['الميعاد', `${draft.day || ''} ${draft.slot || ''}`],
    ['الإجمالي', `${computePrice(draft)} ج.م`],
  ]
  return (
    <div style={{ maxWidth: 1160, margin: '0 auto', padding: 'var(--space-10) var(--space-8) var(--space-13)' }}>
      <Stepper current={2} steps={STEPS} style={{ marginBottom: 'var(--space-10)' }} />
      <div style={{ maxWidth: 560, margin: '0 auto', textAlign: 'center' }}>
        <span style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--status-success-bg)', color: 'var(--status-success-fg)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="check-circle" size={36} />
        </span>
        <h1 style={{ fontSize: 'var(--size-h1)', marginTop: 'var(--space-8)' }}>الحجز اتأكّد</h1>
        <p style={{ color: 'var(--text-muted)', marginTop: 'var(--space-5)' }}>بعتنا لك التفاصيل واللينك على الإيميل والواتساب.</p>
        <Card padding="lg" style={{ marginTop: 'var(--space-9)', textAlign: 'start' }}>
          {rows.map(([k, v], i) => (
            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', gap: 'var(--space-6)', padding: 'var(--space-5) 0', borderTop: i ? '1px solid var(--border-subtle)' : 'none' }}>
              <span style={{ fontSize: 'var(--size-body-sm)', color: 'var(--text-muted)' }}>{k}</span>
              <span style={{ fontSize: 'var(--size-body-sm)', fontWeight: 'var(--weight-semibold)', color: 'var(--text-title)' }}>{v}</span>
            </div>
          ))}
        </Card>
        <div style={{ display: 'flex', gap: 'var(--space-5)', justifyContent: 'center', marginTop: 'var(--space-8)' }}>
          <Button icon="calendar" onClick={onDone}>شوف حجوزاتي</Button>
        </div>
      </div>
    </div>
  )
}
