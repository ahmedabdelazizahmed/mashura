// Adapters: map Supabase rows into the shapes the existing UI components expect.
// This keeps the presentation code stable while the data source moves to the DB.

import type { TypeWithDurations } from './api'
import type { ConsultationType, Booking, Lead, LeadStatus } from '@/types/data'
import type { LeadStatus as DBLeadStatus } from '@/types/supabase'

// ── consultation type ────────────────────────────────────────────────────────
// `id` is set to the slug so existing deep links (`/app?type=regular`) and the
// confirm flow (`getTypeBySlug(draft.type.id)`) keep working unchanged.
export function toConsultationType(row: TypeWithDurations): ConsultationType {
  const durations = (row.durations ?? []).map((d) => ({ minutes: d.minutes, prices: d.prices }))
  const firstMode = row.modes?.[0] ?? 'video'
  // Default duration = the middle-ish option (matches the old mock convention).
  const defaultDur =
    durations[Math.min(1, durations.length - 1)]?.minutes ?? durations[0]?.minutes ?? 30
  const defOpt = durations.find((d) => d.minutes === defaultDur) ?? durations[0]
  const price = defOpt ? (defOpt.prices[firstMode] ?? Object.values(defOpt.prices)[0] ?? 0) : 0
  return {
    id: row.slug,
    title: row.title,
    category: row.category,
    blurb: row.blurb ?? '',
    minutes: defaultDur,
    price,
    modes: row.modes,
    durations,
  }
}

// ── dates / times (Cairo display) ────────────────────────────────────────────
const CAIRO = 'Africa/Cairo'
export const arDate = (iso: string) =>
  new Date(iso).toLocaleDateString('ar-EG', { weekday: 'long', day: 'numeric', month: 'long', timeZone: CAIRO })
export const arTime = (iso: string) =>
  new Date(iso).toLocaleTimeString('ar-EG', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: CAIRO })

// ── bookings ─────────────────────────────────────────────────────────────────
export const BOOKING_STATUS_AR: Record<string, Booking['status']> = {
  pending: 'بانتظار التأكيد', confirmed: 'مؤكّد', completed: 'خلصت', cancelled: 'ملغي', no_show: 'غياب',
}

export interface DisplayBooking extends Booking {
  dbId: string
  typeTitle: string
  startsAt: string
  meetingUrl: string | null
  location: string | null
  statusDb: string
  paymentId: string | null
  paymentMethod: string | null
  paymentStatus: string | null
  invoiceNo: string | null
}

export const PAYMENT_METHOD_AR: Record<string, string> = { cash: 'كاش', wallet: 'محفظة موبايل', card: 'كارت بنكي' }
export const PAYMENT_STATUS_AR: Record<string, string> = { pending: 'لم يُدفع بعد', paid: 'مدفوع', refunded: 'مرتجع', failed: 'لم يتم' }
export const MODE_AR: Record<string, string> = { video: 'مكالمة فيديو', audio: 'مكالمة صوتية', 'in-person': 'مقابلة وجهًا لوجه' }
export const modeIconName = (m: string) => (m === 'video' ? 'video' : m === 'in-person' ? 'user' : 'phone')
/** Still ahead of us: waiting for confirmation or confirmed. */
export const isActiveStatus = (s: Booking['status']) => s === 'بانتظار التأكيد' || s === 'مؤكّد'

// Map a DB booking row (optionally joined with consultation_types + profiles + payments)
// into the shape the UI renders. `id` carries the human reference.
export function toDisplayBooking(row: any): DisplayBooking {
  const pay = Array.isArray(row.payments) ? row.payments[0] : row.payments
  return {
    id: row.ref ?? row.id,
    dbId: row.id,
    clientId: row.client_id,
    typeId: row.consultation_types?.slug ?? row.type_id,
    typeTitle: row.consultation_types?.title ?? '—',
    mode: row.mode,
    day: arDate(row.starts_at),
    date: row.starts_at.slice(0, 10),
    time: arTime(row.starts_at),
    startsAt: row.starts_at,
    minutes: row.minutes,
    price: Number(row.price_amount),
    status: BOOKING_STATUS_AR[row.status] ?? 'بانتظار التأكيد',
    statusDb: row.status,
    topic: row.topic ?? '',
    meetingUrl: row.meeting_url ?? null,
    location: row.location ?? null,
    paymentId: pay?.id ?? null,
    paymentMethod: pay?.method ?? null,
    paymentStatus: pay?.status ?? null,
    invoiceNo: pay?.invoice_no ?? null,
  }
}

// Convenience for admin lists that need the joined client name + title.
export function bookingClientName(row: any): string {
  return row.profiles?.name ?? '—'
}
export function bookingTypeTitle(row: any): string {
  return row.consultation_types?.title ?? '—'
}

// ── leads ────────────────────────────────────────────────────────────────────
export const LEAD_AR_TO_DB: Record<LeadStatus, DBLeadStatus> = {
  'جديد': 'new', 'تم التواصل': 'contacted', 'مؤهّل': 'qualified', 'اتحوّل لعميل': 'converted', 'مغلق': 'closed',
}
export const LEAD_DB_TO_AR: Record<DBLeadStatus, LeadStatus> = {
  new: 'جديد', contacted: 'تم التواصل', qualified: 'مؤهّل', converted: 'اتحوّل لعميل', closed: 'مغلق',
}

export function toDisplayLead(row: any): Lead & { dbId: string } {
  return {
    dbId: row.id,
    id: row.id.slice(0, 8).toUpperCase(),
    name: row.name,
    email: row.email,
    phone: row.phone ?? '',
    source: row.source ?? '—',
    interest: row.interest ?? '—',
    createdAt: (row.created_at ?? '').slice(0, 10),
    status: LEAD_DB_TO_AR[row.status as DBLeadStatus] ?? 'جديد',
    note: row.note ?? '',
  }
}

// ── availability slots grouped by calendar day (for the client slot picker) ──
export interface SlotDay {
  key: string                 // YYYY-MM-DD (stable id for the day)
  label: string               // "الأحد ٧ سبتمبر" — shown in the summary
  weekday: string             // "الأحد"
  dayNum: string              // Arabic-indic day number, e.g. "٧"
  slots: { id: string; startsAt: string; time: string }[]
}

const arWeekday = (iso: string) =>
  new Date(iso).toLocaleDateString('ar-EG', { weekday: 'long', timeZone: CAIRO })
const arDayNum = (iso: string) =>
  new Date(iso).toLocaleDateString('ar-EG', { day: 'numeric', timeZone: CAIRO })
export const cairoDayKey = (iso: string) =>
  new Date(iso).toLocaleDateString('en-CA', { timeZone: CAIRO }) // YYYY-MM-DD

/**
 * Start times at which a session of `minutes` fits: every 15-minute slot the
 * session covers must be open and back-to-back. Offered every 30 min (or every
 * 15 for a 15-minute session) to keep the picker readable.
 */
export function validStarts(rows: { id: string; starts_at: string }[], minutes: number, fine = false): { id: string; startsAt: string }[] {
  const need = Math.max(1, Math.round(minutes / 15))
  const open = new Set(rows.map((r) => new Date(r.starts_at).getTime()))
  const out: { id: string; startsAt: string }[] = []
  const now = Date.now() + 60 * 60 * 1000 // server requires >= 1 hour notice
  for (const r of rows) {
    const t = new Date(r.starts_at).getTime()
    if (t < now) continue
    let ok = true
    for (let i = 1; i < need && ok; i++) ok = open.has(t + i * 15 * 60 * 1000)
    if (!ok) continue
    const cairoMin = Number(new Date(r.starts_at).toLocaleString('en-GB', { minute: '2-digit', timeZone: CAIRO }))
    if (!fine && minutes > 15 && cairoMin % 30 !== 0) continue
    out.push({ id: r.id, startsAt: new Date(r.starts_at).toISOString() }) // normalise: Postgres returns "+00:00", Date#toISOString gives "Z"
  }
  return out
}

export function groupSlotsByDay(rows: any[], minutes = 15): SlotDay[] {
  const byDay = new Map<string, SlotDay>()
  for (const r of validStarts(rows, minutes)) {
    const key = cairoDayKey(r.startsAt)
    let day = byDay.get(key)
    if (!day) {
      day = { key, label: arDate(r.startsAt), weekday: arWeekday(r.startsAt), dayNum: arDayNum(r.startsAt), slots: [] }
      byDay.set(key, day)
    }
    day.slots.push({ id: r.id, startsAt: r.startsAt, time: arTime(r.startsAt) })
  }
  return [...byDay.values()]
}
