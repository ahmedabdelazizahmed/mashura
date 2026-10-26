// Domain types — shared between mock data and future Supabase schema.

// A type's supported communication mode. `in-person` is for face-to-face
// meetings (مقابلة) where video/audio don't apply.
export type Mode = 'video' | 'audio' | 'in-person'
// Duration is any minute count the admin configures per consultation type.
// Minimum is 15 (ربع ساعة). Common values: 15, 30, 45, 60, 90, 120.
export type Duration = number
export type BookingStatus = 'مؤكّد' | 'خلصت' | 'ملغي'
export type PaymentStatus = 'مدفوع' | 'مرتجع' | 'فاشل'
export type PaymentMethod = 'كارت بنكي' | 'محفظة موبايل'
export type LeadStatus = 'جديد' | 'تم التواصل' | 'مؤهّل' | 'اتحوّل لعميل' | 'مغلق'
export type NotificationType = 'حجز جديد' | 'إلغاء' | 'دفع' | 'تذكير' | 'ميعاد'

export interface Expert {
  id?: string
  name: string
  title: string
  years: number
  sessions: number
  rating: number
  bio: string
}

// Old shape kept for reference — new code uses `durations` below.
export interface PricingMatrix {
  video: Record<number, number>
  audio: Record<number, number>
}

// Each consultation type has its own list of allowed durations, admin-configurable.
// Each duration option only stores prices for the modes the parent type supports.
export interface DurationOption {
  minutes: number
  prices: Partial<Record<Mode, number>>
}

export interface ConsultationType {
  id: string
  title: string
  category: string
  blurb: string
  minutes: number                 // default duration (usually the middle option)
  price: number                   // default price (first mode @ default duration)
  modes: Mode[]                   // supported modes — e.g. ['video','audio'] or ['in-person']
  durations: DurationOption[]     // admin-configurable list, min 15
  prices?: PricingMatrix          // legacy — derived from `durations`
}

export interface AvailabilitySlot {
  t: string
  open: boolean
}

export interface AvailabilityDay {
  d: string
  date: string
  n: string
  slots: AvailabilitySlot[]
}

export interface Client {
  id: string
  name: string
  email: string
  phone: string
  joinedAt: string
  bookings: number
  spent: number
  lastBooking: string
}

export interface Booking {
  id: string
  clientId: string
  typeId: string
  mode: Mode
  day: string
  date: string
  time: string
  minutes: number
  price: number
  status: BookingStatus
  topic: string
}

export interface Payment {
  id: string
  bookingId: string
  amount: number
  method: PaymentMethod
  status: PaymentStatus
  date: string
}

export interface Notification {
  id: string
  type: NotificationType
  message: string
  date: string
  read: boolean
}

export interface Lead {
  id: string
  name: string
  email: string
  phone: string
  source: string
  interest: string
  createdAt: string
  status: LeadStatus
  note: string
}

// Team members added to a company/client account. Each member has a role that
// grants a set of permissions. Bookings created by members are attributed to
// them and roll up to the parent client account for billing.
export type MemberStatus = 'نشط' | 'مدعوّ' | 'موقوف'
export interface TeamMember {
  id: string
  name: string
  email: string
  phone: string
  role: string          // slug matching a Role.id
  status: MemberStatus
  joinedAt: string
  lastActive: string
  bookings: number
  avatarInitial?: string
}

// Permission slug — one atomic capability. Roles compose these.
// These describe what a member of Ahmed's TEAM (admin dashboard staff) can do —
// not what a booking-side client can do. Client is single-user, no permissions.
export type PermissionId =
  | 'bookings.view'
  | 'bookings.manage'          // reschedule / cancel bookings
  | 'availability.manage'      // open/close time slots
  | 'leads.access'
  | 'services.manage'          // consultation types + pricing
  | 'reports.view'             // analytics dashboards
  | 'payments.manage'          // refunds & payment settings
  | 'employees.manage'         // invite/remove staff
  | 'roles.manage'             // create/edit roles

export interface Permission {
  id: PermissionId
  label: string          // Arabic display label
  group: 'حجوزات' | 'عملاء' | 'خدمات ومالية' | 'الفريق'
}

export interface Role {
  id: string              // 'admin' | 'manager' | 'member' | 'viewer' or custom
  label: string
  description: string
  builtin: boolean        // built-in roles can't be deleted
  members: number
  permissions: PermissionId[]
}

// Booking draft — what the client fills in during the booking flow.
export interface BookingDraft {
  type: ConsultationType | null
  mode: Mode | null
  duration: Duration | null
  slot: string | null          // display time label ("١١:٠٠ ص")
  day: string | null           // display day label ("الأحد ٧ سبتمبر")
  slotId: string | null        // availability_slots.id of the picked slot
  startsAt: string | null      // ISO start time of the picked slot
  topic: string
  terms: boolean
  pm: 'card' | 'wallet'
}

export const emptyDraft: BookingDraft = {
  type: null,
  mode: null,
  duration: null,
  slot: null,
  day: null,
  slotId: null,
  startsAt: null,
  topic: '',
  terms: false,
  pm: 'card',
}
