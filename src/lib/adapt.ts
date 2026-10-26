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
const BOOKING_STATUS_AR: Record<string, Booking['status']> = {
  pending: 'مؤكّد', confirmed: 'مؤكّد', completed: 'خلصت', cancelled: 'ملغي', no_show: 'ملغي',
}

// Map a DB booking row (optionally joined with consultation_types + profiles)
// into the mock `Booking` shape the UI renders. `id` carries the human ref.
export function toDisplayBooking(row: any): Booking {
  return {
    id: row.ref ?? row.id,
    clientId: row.client_id,
    typeId: row.consultation_types?.slug ?? row.type_id,
    mode: row.mode === 'in-person' ? 'video' : row.mode,
    day: arDate(row.starts_at),
    date: row.starts_at.slice(0, 10),
    time: arTime(row.starts_at),
    minutes: row.minutes,
    price: Number(row.price_amount),
    status: BOOKING_STATUS_AR[row.status] ?? 'مؤكّد',
    topic: row.topic ?? '',
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

export function groupSlotsByDay(rows: any[]): SlotDay[] {
  const byDay = new Map<string, SlotDay>()
  for (const r of rows) {
    const key = new Date(r.starts_at).toLocaleDateString('en-CA', { timeZone: CAIRO }) // YYYY-MM-DD
    let day = byDay.get(key)
    if (!day) {
      day = {
        key,
        label: arDate(r.starts_at),
        weekday: arWeekday(r.starts_at),
        dayNum: arDayNum(r.starts_at),
        slots: [],
      }
      byDay.set(key, day)
    }
    day.slots.push({ id: r.id, startsAt: r.starts_at, time: arTime(r.starts_at) })
  }
  return [...byDay.values()]
}
