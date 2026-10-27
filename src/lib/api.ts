// Typed Supabase fetchers. Every function throws on error so callers can rely
// on the return value being defined; wrap in try/catch or React Query at the
// call site to render error state.

import { supabase } from './supabase'
import type { Database, Mode, BookingStatus, LeadStatus, SettingKey } from '@/types/supabase'

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
    .select('id, starts_at, duration_minutes')
    .gte('starts_at', from.toISOString())
    .lt('starts_at', to.toISOString())
    .eq('is_blocked', false)
    .eq('is_booked', false)
    .order('starts_at')
  if (error) throw error
  return data ?? []
}

// ────────────────────────────────────────────────────────────────────────────
// Bookings — every write goes through a server-side function (RPC) that checks
// the price, the slots and the caller's permissions. Never write to `bookings`
// or `payments` directly: the database refuses it.
// ────────────────────────────────────────────────────────────────────────────
export interface NewBookingInput {
  typeId: string
  minutes: number
  mode: Mode
  startsAt: string          // ISO
  topic?: string
  paymentMethod?: 'cash' | 'wallet'
}

/** Error codes raised by the database functions, in Egyptian Arabic. */
const RPC_ERRORS: Record<string, string> = {
  not_authenticated: 'سجّل دخولك الأول.',
  slot_unavailable: 'الميعاد ده اتحجز أو مش متاح. اختار ميعاد تاني.',
  slot_too_soon: 'لازم الحجز يكون قبل الميعاد بساعة على الأقل.',
  too_many_pending: 'عندك حجوزات كتير لسه مستنية التأكيد. استنى لحد ما تتأكد.',
  type_not_found: 'نوع الاستشارة مش متاح.',
  mode_not_allowed: 'الطريقة دي مش متاحة للنوع ده.',
  duration_not_allowed: 'المدة دي مش متاحة للنوع ده.',
  price_not_set: 'السعر مش محدد لاختيارك.',
  invalid_payment_method: 'طريقة الدفع مش صحيحة.',
  booking_not_found: 'الحجز مش موجود.',
  not_allowed: 'مش مسموحلك بالإجراء ده.',
  invalid_status: 'مينفعش تعمل ده في حالة الحجز الحالية.',
  invalid_transition: 'مينفعش تنقل الحجز للحالة دي.',
  already_started: 'الجلسة بدأت خلاص ومينفعش تتلغي.',
  invalid_url: 'الرابط لازم يبدأ بـ https://',
  rate_limited: 'محاولات كتير. جرّب بعد شوية.',
  invalid_name: 'اكتب اسمك صح.',
  invalid_email: 'الإيميل مش صحيح.',
  invalid_phone: 'رقم التليفون مش صحيح.',
  cannot_change_self: 'مينفعش تغيّر صلاحيتك بنفسك.',
  owner_only: 'الصلاحية دي للمالك بس.',
  last_owner: 'لازم يفضل مالك واحد على الأقل.',
  user_not_found: 'مفيش حساب بالإيميل ده. لازم الشخص يعمل حساب في الموقع الأول.',
  invalid_role: 'الدور مش صحيح.',
  slot_booked: 'الميعاد ده محجوز.',
  invalid_range: 'الفترة المطلوبة مش صحيحة.',
  invalid_reference: 'اكتب رقم العملية صح (من ٣ لـ٦٠ حرف أو رقم).',
  payment_not_found: 'الدفعة دي مش موجودة.',
}

/** Turn a Supabase/Postgres error into a short Arabic message. */
export function friendlyError(e: unknown): string {
  const msg = String((e as any)?.message ?? e ?? '')
  for (const code of Object.keys(RPC_ERRORS)) if (msg.includes(code)) return RPC_ERRORS[code]
  if (/Failed to fetch|NetworkError|fetch/i.test(msg)) return 'مفيش اتصال بالسيرفر. اتأكد من النت وجرّب تاني.'
  return 'حصل خطأ غير متوقع. جرّب تاني.'
}

export async function createBooking(input: NewBookingInput) {
  const { data, error } = await supabase.rpc('create_booking', {
    p_type_id: input.typeId,
    p_minutes: input.minutes,
    p_mode: input.mode,
    p_starts_at: input.startsAt,
    p_topic: input.topic ?? null,
    p_payment_method: input.paymentMethod ?? 'cash',
  })
  if (error) throw error
  return data as T['bookings']['Row']
}

export async function getMyBookings() {
  // Staff can read every booking under RLS, so this must filter by the signed-in user:
  // "my bookings" means mine even for an admin account.
  const { data: auth } = await supabase.auth.getSession()
  const uid = auth.session?.user.id
  if (!uid) return []
  const { data, error } = await supabase
    .from('bookings')
    .select('*, consultation_types(title, slug, category), payments(id, status, method, amount, invoice_no, paid_at, provider_ref, submitted_at)')
    .eq('client_id', uid)
    .order('starts_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function cancelBooking(id: string) {
  const { error } = await supabase.rpc('cancel_booking', { p_booking_id: id })
  if (error) throw error
}

export async function setBookingStatus(id: string, status: BookingStatus | null, meetingUrl?: string | null, location?: string | null) {
  const { error } = await supabase.rpc('set_booking_status', {
    p_booking_id: id,
    p_status: status,
    p_meeting_url: meetingUrl ?? null,
    p_location: location ?? null,
  })
  if (error) throw error
}

// ────────────────────────────────────────────────────────────────────────────
// Payments — recorded by staff (cash / wallet are manual until a gateway exists)
// ────────────────────────────────────────────────────────────────────────────
export async function setPaymentStatus(paymentId: string, status: 'paid' | 'failed' | 'refunded', providerRef?: string) {
  const { error } = await supabase.rpc('set_payment_status', {
    p_payment_id: paymentId,
    p_status: status,
    p_provider_ref: providerRef ?? null,
  })
  if (error) throw error
}

export async function getAllPayments() {
  const { data, error } = await supabase
    .from('payments')
    .select('*, bookings(ref, starts_at, profiles!bookings_client_id_fkey(name))')
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
    .select('*, consultation_types(title, slug), profiles!bookings_client_id_fkey(name, email, phone), payments(id, status, method, amount)')
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

// Public contact form — goes through a validated function (rate-limited, de-duplicated).
export async function captureLead(input: { name: string; email: string; phone?: string; interest?: string; source?: string }) {
  const { error } = await supabase.rpc('capture_lead', {
    p_name: input.name, p_email: input.email, p_phone: input.phone ?? null,
    p_interest: input.interest ?? null, p_source: input.source ?? null,
  })
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

export async function setSlotsBlocked(ids: string[], isBlocked: boolean) {
  if (ids.length === 0) return
  const { error } = await supabase.from('availability_slots').update({ is_blocked: isBlocked }).in('id', ids)
  if (error) throw error
}

export async function getRules() {
  const { data, error } = await supabase.from('availability_rules').select('*').eq('is_active', true).order('weekday')
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

/** Build 15-minute slots from the weekly availability rules (Cairo time). Admin only. */
export async function generateSlots(from: string, to: string) {
  const { data, error } = await supabase.rpc('generate_slots', { p_from: from, p_to: to })
  if (error) throw error
  return data as number
}

// ────────────────────────────────────────────────────────────────────────────
// Payments — receiving details + client-recorded transfers
// ────────────────────────────────────────────────────────────────────────────
export type PaySettings = Record<SettingKey, string>
const EMPTY_SETTINGS: PaySettings = { pay_wallet_name: '', pay_wallet_number: '', pay_instapay: '', pay_note: '' }

export async function getPaySettings(): Promise<PaySettings> {
  const { data, error } = await supabase.from('site_settings').select('key, value')
  if (error) throw error
  const out = { ...EMPTY_SETTINGS }
  for (const r of data ?? []) out[r.key as SettingKey] = r.value
  return out
}

export async function savePaySettings(values: Partial<PaySettings>) {
  const rows = (Object.keys(values) as SettingKey[]).map((key) => ({ key, value: (values[key] ?? '').trim() }))
  if (rows.length === 0) return
  const { error } = await supabase.from('site_settings').upsert(rows, { onConflict: 'key' })
  if (error) throw error
}

/** Client records the reference number of a wallet / InstaPay transfer. Staff then confirms. */
export async function submitPaymentReference(paymentId: string, reference: string) {
  const { data, error } = await supabase.rpc('submit_payment_reference', { p_payment_id: paymentId, p_reference: reference })
  if (error) throw error
  return data as T['payments']['Row']
}

// ────────────────────────────────────────────────────────────────────────────
// Knowledge base (assistant retrieval)
// ────────────────────────────────────────────────────────────────────────────
export interface KbHit { id: string; category: string; question: string; answer: string; score: number }

export async function kbSearch(query: string, limit = 3): Promise<KbHit[]> {
  const { data, error } = await supabase.rpc('kb_search', { p_query: query, p_limit: limit })
  if (error) throw error
  return (data ?? []).map((r: any) => ({ ...r, score: Number(r.score) }))
}

export async function getKbArticles() {
  const { data, error } = await supabase.from('kb_articles').select('*').order('sort_order').order('question')
  if (error) throw error
  return data ?? []
}

export async function upsertKbArticle(input: T['kb_articles']['Insert']) {
  const { error } = await supabase.from('kb_articles').upsert(input, { onConflict: input.id ? 'id' : 'question' })
  if (error) throw error
}

export async function deleteKbArticle(id: string) {
  const { error } = await supabase.from('kb_articles').delete().eq('id', id)
  if (error) throw error
}

export async function getTeam() {
  const { data, error } = await supabase
    .from('profiles').select('id, name, email, role, created_at')
    .in('role', ['owner', 'admin', 'reception', 'viewer'])
    .order('created_at')
  if (error) throw error
  return data ?? []
}

export async function setUserRole(email: string, role: string) {
  const { data, error } = await supabase.rpc('set_user_role', { p_email: email, p_role: role })
  if (error) throw error
  return data
}

export async function updateExpert(id: string, patch: { name: string; title: string; bio: string | null }) {
  const { error } = await supabase.from('experts').update(patch).eq('id', id)
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

/** The payment row of one of the caller's bookings (RLS: clients see only their own). */
export async function getPaymentForBooking(bookingId: string) {
  const { data, error } = await supabase
    .from('payments').select('id, status, method, amount, invoice_no, provider_ref, submitted_at')
    .eq('booking_id', bookingId).maybeSingle()
  if (error) throw error
  return data
}
