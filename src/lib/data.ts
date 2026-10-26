// Mock data source — mirrors the tables Supabase will hold.
// When wiring Supabase, replace each export with an async fetcher and adapt callers.

import type {
  Expert,
  ConsultationType,
  AvailabilityDay,
  Client,
  Booking,
  Payment,
  Notification,
  Lead,
  TeamMember,
  Permission,
  Role,
} from '@/types/data'

export const expert: Expert = {
  name: 'مستشار تجريبي',
  title: 'مستشار أعمال',
  years: 0,
  sessions: 0,
  rating: 0,
  bio: 'هذا مشروع تجريبي لعرض فكرة نظام حجز الاستشارات. بيانات المستشار وأسعاره قابلة للتعديل بالكامل من لوحة الإدارة.',
}

// Three fixed consultation types. Admin has full CRUD over types, methods (video/audio),
// durations (from 15 min), prices, and available times. "مقابلة" is the premium tier.
export const types: ConsultationType[] = [
  {
    id: 'regular', title: 'استشارة عادية', category: 'استشارة', minutes: 30, price: 400,
    blurb: 'جلسة تناقش فيها موضوعك بهدوء وتطلع بخطوات واضحة.',
    modes: ['video', 'audio'],
    durations: [
      { minutes: 15, prices: { video: 250, audio: 180 } },
      { minutes: 30, prices: { video: 400, audio: 300 } },
      { minutes: 45, prices: { video: 600, audio: 450 } },
      { minutes: 60, prices: { video: 800, audio: 600 } },
    ],
  },
  {
    id: 'urgent', title: 'استشارة مستعجل', category: 'استشارة', minutes: 30, price: 650,
    blurb: 'محتاج رأي دلوقتي؟ ميعاد أقرب وأولوية في الرد.',
    modes: ['video', 'audio'],
    durations: [
      { minutes: 15, prices: { video: 400, audio: 300 } },
      { minutes: 30, prices: { video: 650, audio: 500 } },
      { minutes: 45, prices: { video: 900, audio: 700 } },
      { minutes: 60, prices: { video: 1150, audio: 900 } },
    ],
  },
  {
    id: 'meeting', title: 'مقابلة', category: 'مقابلة', minutes: 60, price: 1500,
    blurb: 'جلسة موسّعة وجهاً لوجه لمناقشة متعمّقة أو شراكة. المكان يتم تحديده بعد الحجز.',
    modes: ['in-person'],
    durations: [
      { minutes: 30, prices: { 'in-person': 900 } },
      { minutes: 45, prices: { 'in-person': 1200 } },
      { minutes: 60, prices: { 'in-person': 1500 } },
      { minutes: 90, prices: { 'in-person': 2100 } },
    ],
  },
]

export const days: AvailabilityDay[] = [
  { d: 'الأحد', date: '2026-09-07', n: '٧', slots: [{ t: '١١:٠٠ ص', open: true }, { t: '٢:٠٠ م', open: true }] },
  { d: 'الاثنين', date: '2026-09-08', n: '٨', slots: [] },
  { d: 'الثلاثاء', date: '2026-09-09', n: '٩', slots: [{ t: '١٠:٣٠ ص', open: true }, { t: '١٢:٠٠ م', open: true }, { t: '٦:٣٠ م', open: true }] },
  { d: 'الأربع', date: '2026-09-10', n: '١٠', slots: [{ t: '٩:٠٠ ص', open: true }, { t: '٦:٣٠ م', open: false }] },
  { d: 'الخميس', date: '2026-09-11', n: '١١', slots: [{ t: '١١:٠٠ ص', open: true }, { t: '١:٣٠ م', open: true }, { t: '٤:٠٠ م', open: true }, { t: '٧:٠٠ م', open: true }] },
]

export const clients: Client[] = [
  { id: 'c1', name: 'منة حسن', email: 'mona.hassan@example.com', phone: '01012345678', joinedAt: '2026-03-02', bookings: 5, spent: 3100, lastBooking: '2026-08-12' },
  { id: 'c2', name: 'كريم الشريف', email: 'karim.sh@example.com', phone: '01123456789', joinedAt: '2026-05-14', bookings: 2, spent: 1250, lastBooking: '2026-08-20' },
  { id: 'c3', name: 'ياسمين عادل', email: 'yasmin.adel@example.com', phone: '01234567890', joinedAt: '2026-01-20', bookings: 8, spent: 5600, lastBooking: '2026-08-24' },
  { id: 'c4', name: 'محمود سامي', email: 'mahmoud.sami@example.com', phone: '01098765432', joinedAt: '2026-07-01', bookings: 1, spent: 400, lastBooking: '2026-07-30' },
  { id: 'c5', name: 'نور الدين رشاد', email: 'nour.rashad@example.com', phone: '01187654321', joinedAt: '2026-06-11', bookings: 3, spent: 2000, lastBooking: '2026-08-05' },
]

export const bookings: Booking[] = [
  { id: 'b1001', clientId: 'c1', typeId: 'regular', mode: 'video', day: 'الأربع ١٠ سبتمبر', date: '2026-09-10', time: '٦:٣٠ م', minutes: 30, price: 400, status: 'مؤكّد', topic: 'تسعير باقة اشتراك شهري' },
  { id: 'b1002', clientId: 'c1', typeId: 'urgent', mode: 'audio', day: 'الخميس ١٨ سبتمبر', date: '2026-09-18', time: '١١:٠٠ ص', minutes: 30, price: 500, status: 'مؤكّد', topic: '' },
  { id: 'b0998', clientId: 'c3', typeId: 'meeting', mode: 'video', day: 'الثلاثاء ١٢ أغسطس', date: '2026-08-12', time: '١:٣٠ م', minutes: 60, price: 1500, status: 'خلصت', topic: 'مشروع توصيل أكل' },
  { id: 'b0991', clientId: 'c2', typeId: 'regular', mode: 'video', day: 'الأحد ٢٧ يوليو', date: '2026-07-27', time: '٧:٠٠ م', minutes: 45, price: 600, status: 'خلصت', topic: '' },
  { id: 'b0985', clientId: 'c4', typeId: 'regular', mode: 'audio', day: 'الخميس ١٠ يوليو', date: '2026-07-10', time: '١٠:٣٠ ص', minutes: 15, price: 180, status: 'ملغي', topic: '' },
  { id: 'b0980', clientId: 'c5', typeId: 'urgent', mode: 'video', day: 'الاثنين ٥ أغسطس', date: '2026-08-05', time: '٢:٠٠ م', minutes: 30, price: 650, status: 'خلصت', topic: '' },
  { id: 'b0975', clientId: 'c3', typeId: 'meeting', mode: 'video', day: 'السبت ٢٤ أغسطس', date: '2026-08-24', time: '١٢:٠٠ م', minutes: 90, price: 2100, status: 'خلصت', topic: 'تجهيز عرض لمستثمر' },
]

export const payments: Payment[] = [
  { id: 'MSH-2201', bookingId: 'b1001', amount: 400, method: 'كارت بنكي', status: 'مدفوع', date: '2026-09-03' },
  { id: 'MSH-2198', bookingId: 'b0998', amount: 1500, method: 'كارت بنكي', status: 'مدفوع', date: '2026-08-11' },
  { id: 'MSH-2190', bookingId: 'b0991', amount: 600, method: 'محفظة موبايل', status: 'مدفوع', date: '2026-07-26' },
  { id: 'MSH-2183', bookingId: 'b0985', amount: 180, method: 'كارت بنكي', status: 'مرتجع', date: '2026-07-09' },
  { id: 'MSH-2179', bookingId: 'b0980', amount: 650, method: 'كارت بنكي', status: 'مدفوع', date: '2026-08-04' },
  { id: 'MSH-2175', bookingId: 'b0975', amount: 2100, method: 'محفظة موبايل', status: 'مدفوع', date: '2026-08-23' },
]

export const notifications: Notification[] = [
  { id: 'n1', type: 'حجز جديد', message: 'منة حسن حجزت استشارة عادية — الأربع ١٠ سبتمبر', date: '2026-09-03', read: false },
  { id: 'n2', type: 'إلغاء', message: 'محمود سامي لغى حجز استشارة عادية', date: '2026-07-09', read: true },
  { id: 'n3', type: 'دفع', message: 'استلمت ٢١٠٠ ج.م من ياسمين عادل', date: '2026-08-23', read: true },
  { id: 'n4', type: 'تذكير', message: 'عندك جلسة فيديو بعد ٣٠ دقيقة مع منة حسن', date: '2026-09-10', read: false },
]

export const leads: Lead[] = [
  { id: 'L-201', name: 'هبة السيد', email: 'heba.elsayed@example.com', phone: '01055512340', source: 'اللاندينج', interest: 'تسعير وربحية', createdAt: '2026-08-26', status: 'جديد', note: 'دخلت من إعلان تسعير وسابت رقمها في نموذج التواصل.' },
  { id: 'L-200', name: 'طارق منير', email: 'tarek.mounir@example.com', phone: '01277788899', source: 'إحالة', interest: 'تأسيس مشروع', createdAt: '2026-08-25', status: 'تم التواصل', note: 'رشّحه كريم الشريف، حاب يعمل جلسة أول أسبوع في سبتمبر.' },
  { id: 'L-199', name: 'ريم عبدالله', email: 'reem.a@example.com', phone: '01099988770', source: 'إنستجرام', interest: 'نمو ومبيعات', createdAt: '2026-08-24', status: 'مؤهّل', note: 'استوديو أزياء ناشئ، محتاجة قنوات بيع أونلاين.' },
  { id: 'L-198', name: 'خالد إبراهيم', email: 'khaled.i@example.com', phone: '01033322210', source: 'بحث جوجل', interest: 'تمويل واستثمار', createdAt: '2026-08-22', status: 'جديد', note: 'حاب يجهّز بيتش لمستثمر خليجي.' },
  { id: 'L-197', name: 'سلمى فؤاد', email: 'salma.f@example.com', phone: '01144455566', source: 'لينكدإن', interest: 'مراجعة سريعة', createdAt: '2026-08-20', status: 'اتحوّل لعميل', note: 'حجزت جلسة مراجعة سريعة يوم ٢٤ أغسطس.' },
  { id: 'L-196', name: 'أحمد مصطفى', email: 'ahmed.m@example.com', phone: '01011122233', source: 'اللاندينج', interest: 'تسعير وربحية', createdAt: '2026-08-18', status: 'مغلق', note: 'قال الميزانية مش مناسبة دلوقتي.' },
  { id: 'L-195', name: 'دينا الشناوي', email: 'dina.sh@example.com', phone: '01288877766', source: 'إحالة', interest: 'نمو ومبيعات', createdAt: '2026-08-17', status: 'تم التواصل', note: 'رشّحتها ياسمين عادل، بتنتظر ميعاد الأسبوع الجاي.' },
]

// Admin dashboard staff (Ahmed's team) — NOT client sub-users.
// Client is single-user by design; this list drives /admin/employees only.
export const employees: TeamMember[] = [
  { id: 'e1', name: 'مالك النظام (مثال)', email: 'owner@example.com', phone: '', role: 'owner', status: 'نشط', joinedAt: '2026-01-01', lastActive: 'الآن', bookings: 0 },
  { id: 'e2', name: 'مدير (مثال)', email: 'admin@example.com', phone: '', role: 'admin', status: 'نشط', joinedAt: '2026-01-01', lastActive: 'قبل ساعة', bookings: 0 },
  { id: 'e3', name: 'استقبال (مثال)', email: 'reception@example.com', phone: '', role: 'reception', status: 'نشط', joinedAt: '2026-01-01', lastActive: 'أمس', bookings: 0 },
  { id: 'e4', name: 'مشاهد (مثال)', email: 'viewer@example.com', phone: '', role: 'viewer', status: 'مدعوّ', joinedAt: '2026-01-01', lastActive: '', bookings: 0 },
]
// Legacy alias — external callers still import `members`.
export const members = employees

export const permissions: Permission[] = [
  { id: 'bookings.view',        label: 'عرض الحجوزات',                    group: 'حجوزات' },
  { id: 'bookings.manage',      label: 'إدارة الحجوزات (إلغاء/جدولة)',    group: 'حجوزات' },
  { id: 'availability.manage',  label: 'إدارة المواعيد المتاحة',         group: 'حجوزات' },
  { id: 'leads.access',         label: 'الوصول للعملاء المحتملين',       group: 'عملاء' },
  { id: 'services.manage',      label: 'إدارة الخدمات والأسعار',         group: 'خدمات ومالية' },
  { id: 'reports.view',         label: 'التقارير والتحليلات',            group: 'خدمات ومالية' },
  { id: 'payments.manage',      label: 'إدارة المدفوعات والاسترجاع',     group: 'خدمات ومالية' },
  { id: 'employees.manage',     label: 'إدارة الموظفين',                  group: 'الفريق' },
  { id: 'roles.manage',         label: 'إدارة الأدوار والصلاحيات',       group: 'الفريق' },
]

export const roles: Role[] = [
  {
    id: 'owner', label: 'المالك', builtin: true, members: 1,
    description: 'صلاحيات كاملة — المالك (أحمد) وحده يقدر يحذف حساب أو ينقل الملكية.',
    permissions: ['bookings.view','bookings.manage','availability.manage','leads.access','services.manage','reports.view','payments.manage','employees.manage','roles.manage'],
  },
  {
    id: 'admin', label: 'أدمن', builtin: true, members: 1,
    description: 'يقدر يدير كل شغل مشورة اليومي، من غير التحكم في الفريق أو المدفوعات.',
    permissions: ['bookings.view','bookings.manage','availability.manage','leads.access','services.manage','reports.view'],
  },
  {
    id: 'reception', label: 'موظف استقبال', builtin: true, members: 2,
    description: 'يستقبل الحجوزات، يجدولها، ويدير المواعيد المتاحة.',
    permissions: ['bookings.view','bookings.manage','availability.manage'],
  },
  {
    id: 'viewer', label: 'مشاهد', builtin: true, members: 1,
    description: 'يقدر يشوف الحجوزات والتقارير بس — من غير أي تعديل.',
    permissions: ['bookings.view','reports.view'],
  },
]

// Helpers used across screens.
export const roleOf = (id: string): Role => roles.find((r) => r.id === id) ?? roles[roles.length - 1]
export const typeOf = (id: string): ConsultationType =>
  types.find((t) => t.id === id) ?? ({ id, title: id } as ConsultationType)

export const clientOf = (id: string): Client =>
  clients.find((c) => c.id === id) ?? ({ id, name: '—' } as Client)

export const bookingOf = (id: string): Booking | undefined =>
  bookings.find((b) => b.id === id)
