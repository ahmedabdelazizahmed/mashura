// Typed Supabase fetchers. Every function throws on error so callers can rely
// on the return value being defined; wrap in try/catch or React Query at the
// call site to render error state.

import { supabase } from './supabase'
import type { Database, Mode, BookingStatus, LeadStatus } from '@/types/supabase'

type T = Database['public']['Tables']

// ────────────────────────────────────────────────────────────────────────────
// Consultation types + durations (public read)
// ────────────────────────────────────────────────────────────────────────────
export type TypeWithDurations = T['consultation_types']['Row'] & {
  durations: T['duration_options']['Row'][]
}

export async function getTypes(): Promise<TypeWithDurations[]> {
  const { data, error } = await supabase
    .from('consultation_types')
    .select('*, duration_options(*)')
    .eq('is_active', true)
    .order('sort_order')
  if (error) throw error
  // supabase-js returns duration_options as a nested array. Rename to `durations` and sort.
  return (data ?? []).map((row: any) => ({
    ...row,
    durations: (row.duration_options ?? []).sort((a: any, b: any) => a.sort_order - b.sort_order),
  }))
}

export async function getTypeBySlug(slug: string): Promise<TypeWithDurations | null> {
  const { data, error } = await supabase
    .from('consultation_types')
    .select('*, duration_options(*)')
    .eq('slug', slug)
    .maybeSingle()
  if (error) throw error
  if (!data) return null
  return {
    ...(data as any),
    durations: ((data as any).duration_options ?? []).sort(
      (a: any, b: any) => a.sort_order - b.sort_order
    ),
  }
}

// ────────────────────────────────────────────────────────────────────────────
// Availability slots (open only for the client)
// ────────────────────────────────────────────────────────────────────────────
export async function getOpenSlots(from: Date, to: Date) {
  const { data, error } = await supabase
    .from('availability_slots')
    .select('*')
    .gte('starts_at', from.toISOString())
    .lt('starts_at', to.toISOString())
    .eq('is_blocked', false)
    .eq('is_booked', false)
    .order('starts_at')
  if (error) throw error
  return data ?? []
}

// ────────────────────────────────────────────────────────────────────────────
// Bookings — client-side
// ────────────────────────────────────────────────────────────────────────────
export interface NewBookingInput {
  clientId: string
  typeId: string
  durationOptionId: string
  mode: Mode
  startsAt: string          // ISO
  minutes: number
  priceAmount: number
  topic?: string
}

export async function createBooking(input: NewBookingInput) {
  const { data, error } = await supabase
    .from('bookings')
    .insert({
      client_id: input.clientId,
      type_id: input.typeId,
      duration_option_id: input.durationOptionId,
      mode: input.mode,
      starts_at: input.startsAt,
      minutes: input.minutes,
      price_amount: input.priceAmount,
      status: 'pending',
      topic: input.topic ?? null,
    })
    .select('*')
    .single()
  if (error) throw error
  return data
}

export async function getMyBookings() {
  const { data, error } = await supabase
    .from('bookings')
    .select('*, consultation_types(title, slug, category)')
    .order('starts_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function cancelBooking(id: string) {
  const { error } = await supabase
    .from('bookings')
    .update({ status: 'cancelled' })
    .eq('id', id)
  if (error) throw error
}

export async function updateBookingStatus(id: string, status: BookingStatus) {
  const { error } = await supabase
    .from('bookings')
    .update({ status })
    .eq('id', id)
  if (error) throw error
}

// ────────────────────────────────────────────────────────────────────────────
// Payments (client + admin)
// ────────────────────────────────────────────────────────────────────────────
export async function createPayment(bookingId: string, amount: number, method: 'card' | 'wallet' | 'cash') {
  const { data, error } = await supabase
    .from('payments')
    .insert({ booking_id: bookingId, amount, method, status: 'pending' })
    .select('*')
    .single()
  if (error) throw error
  return data
}

export async function markPaymentPaid(paymentId: string, providerRef?: string) {
  const { error } = await supabase
    .from('payments')
    .update({ status: 'paid', paid_at: new Date().toISOString(), provider_ref: providerRef ?? null })
    .eq('id', paymentId)
  if (error) throw error
}

export async function getPaymentsForBooking(bookingId: string) {
  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .eq('booking_id', bookingId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

// ────────────────────────────────────────────────────────────────────────────
// Notifications
// ────────────────────────────────────────────────────────────────────────────
export async function getMyNotifications(limit = 30) {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) throw error
  return data ?? []
}

export async function markNotificationRead(id: string) {
  const { error } = await supabase
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw error
}

export async function markAllNotificationsRead() {
  const { error } = await supabase
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .is('read_at', null)
  if (error) throw error
}

// ────────────────────────────────────────────────────────────────────────────
// Admin — bookings across all clients
// ────────────────────────────────────────────────────────────────────────────
export async function getAllBookings(status?: BookingStatus) {
  let q = supabase
    .from('bookings')
    .select('*, consultation_types(title, slug), profiles!bookings_client_id_fkey(name, email)')
    .order('starts_at', { ascending: false })
  if (status) q = q.eq('status', status)
  const { data, error } = await q
  if (error) throw error
  return data ?? []
}

// ────────────────────────────────────────────────────────────────────────────
// Admin — clients (users with role='client')
// ────────────────────────────────────────────────────────────────────────────
export async function getClients() {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'client')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

// ────────────────────────────────────────────────────────────────────────────
// Admin — leads (CRM)
// ────────────────────────────────────────────────────────────────────────────
export async function getLeads(status?: LeadStatus) {
  let q = supabase.from('leads').select('*').order('created_at', { ascending: false })
  if (status) q = q.eq('status', status)
  const { data, error } = await q
  if (error) throw error
  return data ?? []
}

export async function updateLeadStatus(id: string, status: LeadStatus) {
  const { error } = await supabase.from('leads').update({ status }).eq('id', id)
  if (error) throw error
}

// Anonymous lead capture (from a public form — RLS allows insert with check(true)).
export async function captureLead(input: T['leads']['Insert']) {
  const { error } = await supabase.from('leads').insert(input)
  if (error) throw error
}

// ────────────────────────────────────────────────────────────────────────────
// Admin — consultation types CRUD
// ────────────────────────────────────────────────────────────────────────────
export async function upsertType(input: T['consultation_types']['Insert']) {
  const { data, error } = await supabase
    .from('consultation_types')
    .upsert(input, { onConflict: 'slug' })
    .select('*')
    .single()
  if (error) throw error
  return data
}

export async function deleteType(id: string) {
  // Soft-delete to preserve existing bookings' foreign key.
  const { error } = await supabase
    .from('consultation_types')
    .update({ is_active: false })
    .eq('id', id)
  if (error) throw error
}

export async function replaceDurations(typeId: string, options: Array<{ minutes: number; prices: Partial<Record<Mode, number>>; sort_order: number }>) {
  // Simple strategy: wipe + reinsert. Fine for admin-side editing of ~3-6 rows.
  const { error: delError } = await supabase.from('duration_options').delete().eq('type_id', typeId)
  if (delError) throw delError
  if (options.length === 0) return
  const { error } = await supabase.from('duration_options').insert(
    options.map((o) => ({ type_id: typeId, ...o }))
  )
  if (error) throw error
}

// ────────────────────────────────────────────────────────────────────────────
// Admin — availability
// ────────────────────────────────────────────────────────────────────────────
export async function getAllSlots(from: Date, to: Date) {
  const { data, error } = await supabase
    .from('availability_slots')
    .select('*')
    .gte('starts_at', from.toISOString())
    .lt('starts_at', to.toISOString())
    .order('starts_at')
  if (error) throw error
  return data ?? []
}

export async function toggleSlotBlocked(id: string, isBlocked: boolean) {
  const { error } = await supabase
    .from('availability_slots')
    .update({ is_blocked: isBlocked })
    .eq('id', id)
  if (error) throw error
}

export async function createSlot(startsAt: Date, durationMinutes = 15) {
  const { error } = await supabase
    .from('availability_slots')
    .insert({ starts_at: startsAt.toISOString(), duration_minutes: durationMinutes })
  if (error) throw error
}

// ────────────────────────────────────────────────────────────────────────────
// Expert profile (marketing site + client home)
// ────────────────────────────────────────────────────────────────────────────
export async function getExpert() {
  const { data, error } = await supabase.from('experts').select('*').limit(1).maybeSingle()
  if (error) throw error
  return data
}
