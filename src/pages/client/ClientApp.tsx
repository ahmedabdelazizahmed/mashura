import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import ClientShell from './ClientShell'
import { BookingFlow, ConfirmationView, ORDER, type Step } from './Booking'
import Account from './Account'
import { Toast } from '@/lib/ui'
import { emptyDraft, type BookingDraft, type ConsultationType } from '@/types/data'
import { useAuth } from '@/lib/auth'
import { useTypes } from '@/lib/hooks'
import { toConsultationType } from '@/lib/adapt'
import * as api from '@/lib/api'

type View = Step | 'done' | 'account'

// Fresh draft with the type preselected — used by deep links from landing/home.
function draftFor(t: ConsultationType | null): BookingDraft {
  if (!t) return emptyDraft
  const defaultDur = t.durations.find((d) => d.minutes === t.minutes)?.minutes ?? t.durations[0]?.minutes ?? 30
  return { ...emptyDraft, type: t, duration: defaultDur, mode: t.modes[0] ?? 'video' }
}

export default function ClientApp() {
  const [params, setParams] = useSearchParams()
  const nav = useNavigate()
  const { profile } = useAuth()
  const { data: typeRows } = useTypes()
  const types = (typeRows ?? []).map(toConsultationType)

  // Signed-in users land on their own dashboard; "home" (logo / الرئيسية) is the public landing page.
  const [view, setView] = useState<View>('account')
  const [draft, setDraft] = useState<BookingDraft>(emptyDraft)
  const [submitting, setSubmitting] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [bookingRef, setBookingRef] = useState<string | null>(null)
  const [paymentId, setPaymentId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Once types load, honor a `?type=<slug>` deep link (landing/home) by
  // preselecting that type and jumping into the configure step.
  useEffect(() => {
    const slug = params.get('type')
    if (!slug || draft.type || types.length === 0) return
    const t = types.find((x) => x.id === slug)
    if (t) {
      setDraft(draftFor(t))
      setView('configure')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typeRows])

  const set = (patch: Partial<BookingDraft>) => setDraft((d) => ({ ...d, ...patch }))
  const next = () => setView((v) => {
    const i = ORDER.indexOf(v as Step)
    return i >= 0 ? ORDER[Math.min(i + 1, ORDER.length - 1)] : v
  })
  const back = () => setView((v) => {
    const i = ORDER.indexOf(v as Step)
    return i >= 0 && i > 0 ? ORDER[i - 1] : 'account'
  })
  const startBooking = (t: ConsultationType | null) => {
    setDraft(draftFor(t))
    setView('configure')
    if (t) setParams({ type: t.id }, { replace: true })
    else setParams({}, { replace: true })
  }

  const confirm = async () => {
    if (!profile || !draft.type || !draft.mode || !draft.duration) return
    if (!draft.startsAt) { setError('اختار ميعاد من المتاح الأول.'); return }
    setSubmitting(true)
    setError(null)
    try {
      // The server looks up the price and locks the slots; we only send choices.
      const dbType = await api.getTypeBySlug(draft.type.id)
      if (!dbType) throw new Error('type_not_found')
      const booking = await api.createBooking({
        typeId: dbType.id,
        minutes: draft.duration,
        mode: draft.mode,
        startsAt: draft.startsAt,
        topic: draft.topic.trim() || undefined,
        paymentMethod: draft.pm,
      })
      setBookingRef(booking.ref)
      try { setPaymentId((await api.getPaymentForBooking(booking.id))?.id ?? null) } catch { setPaymentId(null) }
      setView('done')
      setToast('وصلنا طلب الحجز')
      setParams({}, { replace: true })
    } catch (e) {
      setError(api.friendlyError(e))
    } finally {
      setSubmitting(false)
    }
  }

  const navHandler = (id: string) => {
    if (id === 'home') nav('/')
    else if (id === 'catalog') startBooking(null)
    else {
      setView(id as View)
      setParams({}, { replace: true })
    }
  }

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 2800)
    return () => clearTimeout(t)
  }, [toast])

  useEffect(() => {
    if (!error) return
    const t = setTimeout(() => setError(null), 4500)
    return () => clearTimeout(t)
  }, [error])

  // Nav gets called with 'logout' from the shell.
  const onNav = (id: string) => {
    if (id === 'logout') return
    navHandler(id)
  }

  return (
    <>
      <ClientShell view={view} onNav={onNav} signedIn={true}>
        {(ORDER as readonly string[]).includes(view) && (
          <BookingFlow step={view as Step} draft={draft} set={set} next={next} back={back} submitting={submitting} onConfirm={confirm} types={types} />
        )}
        {view === 'done' && <ConfirmationView draft={draft} bookingRef={bookingRef} paymentId={paymentId} onDone={() => setView('account')} />}
        {view === 'account' && <Account onBook={() => startBooking(null)} />}
      </ClientShell>

      {toast && (
        <div style={{ position: 'fixed', bottom: 24, insetInlineStart: 24, zIndex: 80 }}>
          <Toast tone="success" title={toast} description="هتلاقي الحجز في حسابك." onClose={() => setToast(null)} />
        </div>
      )}

      {error && (
        <div style={{ position: 'fixed', bottom: 24, insetInlineStart: 24, zIndex: 80 }}>
          <Toast tone="danger" title="ما قدرناش نأكّد الحجز" description={error} onClose={() => setError(null)} />
        </div>
      )}
    </>
  )
}
