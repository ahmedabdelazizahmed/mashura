// Conversation logic of the booking assistant (framework-free, fully testable).
// The assistant NEVER books by itself: it fills in a draft, shows the exact
// price/time, and only an explicit "yes" from the user calls createBooking,
// which runs through the same server-side checks as the normal booking flow.

import { parseMessage, normalize, cairoKey, addDays, cairoToInstant, type Slots, type AMode, type Parsed, type Intent } from './assistantNlu'
import { validStarts, arDate, arTime, cairoDayKey } from './adapt'

export interface CatalogType {
  id: string                 // database id
  slug: string
  title: string
  modes: AMode[]
  durations: { minutes: number; prices: Partial<Record<AMode, number>> }[]
}
export interface OpenSlot { id: string; starts_at: string }
export interface Proposal { startsAt: string; typeSlug: string; typeId: string; typeTitle: string; minutes: number; mode: AMode; price: number }
export interface State { slots: Slots; proposal?: Proposal | null; awaiting: 'confirm' | null }
export interface Chip { label: string; send?: string; href?: string }
export interface Msg { role: 'bot' | 'user'; text: string; chips?: Chip[] }

export interface KbPassage { id: string; category: string; question: string; answer: string; score: number }

export interface Deps {
  types: CatalogType[]
  getSlots(): Promise<OpenSlot[]>
  user: { id: string; name: string } | null
  book(i: { typeId: string; minutes: number; mode: AMode; startsAt: string; topic?: string }): Promise<{ ref: string }>
  myBookings(): Promise<{ ref: string; starts_at: string; typeTitle: string; status: string }[]>
  friendlyError(e: unknown): string
  /** Knowledge-base retrieval (SQL `kb_search`). Optional: without it the assistant only books. */
  kb?(question: string): Promise<KbPassage[]>
  /** Optional: phrase an answer from the retrieved passages with a language model (RAG "generate" step). */
  kbAnswer?(question: string, passages: KbPassage[]): Promise<string | null>
  llm?(text: string, state: State, todayKey: string): Promise<{ intent?: Intent; slots?: Slots } | null>
  now?(): Date
}

export const initialState = (): State => ({ slots: {}, proposal: null, awaiting: null })

const MODE_AR: Record<AMode, string> = { video: 'مكالمة فيديو', audio: 'مكالمة صوتية', 'in-person': 'مقابلة وجهًا لوجه' }
const MIN_AR = (m: number) => (m === 15 ? 'ربع ساعة' : m === 30 ? 'نص ساعة' : m === 60 ? 'ساعة' : m === 90 ? 'ساعة ونص' : `${m} دقيقة`)
const ACCOUNT = { label: 'شوف حجوزاتي', href: '/app?view=account' }

const dm = (key: string) => { const [, m, d] = key.split('-'); return `${Number(d)}/${Number(m)}` }
const dayLabel = (key: string) => arDate(cairoToInstant(key, '12:00').toISOString())
const hhmmOf = (iso: string) => new Date(iso).toLocaleTimeString('en-GB', { timeZone: 'Africa/Cairo', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })

function pickType(slots: Slots, types: CatalogType[]): CatalogType | undefined {
  return types.find((t) => t.slug === (slots.typeSlug ?? 'regular')) ?? types[0]
}
function pickMode(t: CatalogType, want?: AMode): AMode {
  if (want && t.modes.includes(want)) return want
  return t.modes.includes('video') ? 'video' : t.modes[0]
}
function pickMinutes(t: CatalogType, want?: number): { minutes: number; ignored: boolean } {
  if (want && t.durations.some((d) => d.minutes === want)) return { minutes: want, ignored: false }
  const def = t.durations.find((d) => d.minutes === 30) ?? t.durations[Math.min(1, t.durations.length - 1)]
  return { minutes: def.minutes, ignored: !!want }
}

/** Start times (ISO) on a Cairo day where `minutes` fits, any 15-minute start. */
function startsOnDay(rows: OpenSlot[], day: string, minutes: number, now: Date, fine = true): string[] {
  return validStarts(rows, minutes, fine).map((s) => s.startsAt).filter((iso) => cairoDayKey(iso) === day && new Date(iso).getTime() > now.getTime() + 3600_000)
}
/** Spread a long list down to at most `n` entries, keeping order. */
function thin<T>(xs: T[], n: number): T[] {
  if (xs.length <= n) return xs
  const out: T[] = []
  for (let i = 0; i < n; i++) out.push(xs[Math.floor((i * xs.length) / n)])
  return out
}
const halfHours = (xs: string[]) => xs.filter((iso) => Number(hhmmOf(iso).slice(3)) % 30 === 0)

function nextDaysWithSlots(rows: OpenSlot[], minutes: number, now: Date, from: string, count = 3): { day: string; starts: string[] }[] {
  const days = new Map<string, string[]>()
  for (const s of validStarts(rows, minutes, true)) {
    if (new Date(s.startsAt).getTime() <= now.getTime() + 3600_000) continue
    const k = cairoDayKey(s.startsAt)
    if (k < from) continue
    days.set(k, [...(days.get(k) ?? []), s.startsAt])
  }
  return [...days.entries()].sort(([a], [b]) => a.localeCompare(b)).slice(0, count).map(([day, starts]) => ({ day, starts }))
}

const timeChips = (day: string, starts: string[], max = 8): Chip[] =>
  thin(halfHours(starts).length ? halfHours(starts) : starts, max).map((iso) => ({ label: arTime(iso), send: `${dm(day)} ${hhmmOf(iso)}` }))

const dayChips = (list: { day: string; starts: string[] }[]): Chip[] => list.map((d) => ({ label: dayLabel(d.day), send: `${dm(d.day)}` }))

function summary(p: Proposal): string {
  return [
    `النوع: ${p.typeTitle}`,
    `الطريقة: ${MODE_AR[p.mode]}`,
    `المدة: ${MIN_AR(p.minutes)}`,
    `الميعاد: ${arDate(p.startsAt)} — ${arTime(p.startsAt)} (بتوقيت القاهرة)`,
    `السعر: ${p.price} جنيه`,
  ].join('\n')
}

const bot = (text: string, chips?: Chip[]): Msg => ({ role: 'bot', text, chips })

export const WELCOME: Msg = bot(
  'أهلاً! أنا مساعد مشورة. اسألني عن الحجز أو الدفع أو الإلغاء، أو قولّي عايز استشارة إمتى وأنا أشوف المواعيد وأجهّز لك الحجز. مثلاً: «عايز استشارة بكرة الساعة 5 العصر».',
  [
    { label: 'عايز استشارة بكرة', send: 'عايز استشارة بكرة' },
    { label: 'الأسعار', send: 'الأسعار' },
    { label: 'المواعيد المتاحة', send: 'ايه المواعيد المتاحة' },
    { label: 'ازاي ادفع؟', send: 'ازاي ادفع؟' },
  ]
)

export async function respond(prev: State, input: string, deps: Deps): Promise<{ state: State; msgs: Msg[] }> {
  const now = deps.now ? deps.now() : new Date()
  const todayKey = cairoKey(now)
  let parsed: Parsed = parseMessage(input, now)

  if (deps.llm) {
    try {
      const r = await deps.llm(input, prev, todayKey)
      if (r && r.intent) parsed = { ...parsed, intent: r.intent, slots: { ...parsed.slots, ...(r.slots ?? {}) } }
    } catch { /* fall back to the local parser */ }
  }

  let intent = parsed.intent
  const hasNew = Object.keys(parsed.slots).length > 0
  if ((intent === 'no' || intent === 'yes') && hasNew) intent = 'book'
  if (prev.awaiting === 'confirm' && intent === 'book' && !hasNew) intent = 'other'

  const state: State = { slots: { ...prev.slots, ...parsed.slots }, proposal: prev.proposal ?? null, awaiting: prev.awaiting }
  // A new day/time/type invalidates a proposal waiting for confirmation.
  if (hasNew) { state.proposal = null; state.awaiting = null }

  // ── yes / no ───────────────────────────────────────────────────────────────
  if (intent === 'yes') {
    if (prev.awaiting === 'confirm' && prev.proposal) return confirmBooking(prev, deps)
    return { state, msgs: [bot('تمام! قولّي الاستشارة عايزها إمتى؟', [{ label: 'بكرة', send: 'بكرة' }, { label: 'النهارده', send: 'النهارده' }])] }
  }
  if (intent === 'no') {
    return { state: { slots: {}, proposal: null, awaiting: null }, msgs: [bot('ولا يهمك. لو عايز تغيّر اليوم أو الساعة أو النوع قولّي، أو اختار من هنا.', [{ label: 'يوم تاني', send: 'عايز استشارة يوم تاني' }, { label: 'الأسعار', send: 'الأسعار' }])] }
  }

  // ── questions about how things work: answer from the knowledge base ────────
  if (deps.kb && wantsKnowledge(intent, input, hasNew)) {
    const answered = await answerFromKb(input, deps, state)
    if (answered) return { state, msgs: answered }
  }

  // Not understood and nothing in progress: say what we can do instead of guessing.
  if (intent === 'other') {
    if (prev.awaiting === 'confirm' && prev.proposal) {
      return { state, msgs: [bot('لسه مستني ردك على الحجز: أأكّده؟', [{ label: 'أيوه، أكّد الحجز', send: 'أيوه' }, { label: 'غيّر الميعاد', send: 'لا' }])] }
    }
    if (!Object.keys(state.slots).length) {
      return { state, msgs: [bot('ما فهمتش قصدك. اكتب مثلاً: «عايز استشارة بكرة الساعة 5 العصر» أو اسأل عن الأسعار والمواعيد.', WELCOME.chips)] }
    }
  }

  // ── info intents ───────────────────────────────────────────────────────────
  if (intent === 'greeting' || intent === 'help') return { state, msgs: [WELCOME] }

  if (intent === 'prices') {
    const lines = deps.types.map((t) => {
      const all = t.durations.flatMap((d) => Object.values(d.prices) as number[])
      return `• ${t.title}: من ${Math.min(...all)} إلى ${Math.max(...all)} جنيه (${t.modes.includes('in-person') ? 'حضوري' : 'فيديو أو صوت'})`
    })
    return { state, msgs: [bot(`الأسعار حسب نوع الاستشارة ومدتها:\n${lines.join('\n')}\nالسعر الدقيق بيظهرلك قبل التأكيد.`, deps.types.map((t) => ({ label: `احجز ${t.title}`, send: `عايز ${t.title}` })))] }
  }

  if (intent === 'cancel') {
    return { state, msgs: [bot('تقدر تلغي أي حجز قادم من صفحة حجوزاتك، والميعاد بيرجع متاح لغيرك.', [ACCOUNT])] }
  }

  if (intent === 'mybookings') {
    if (!deps.user) return { state, msgs: [bot('سجّل دخولك الأول عشان أعرض لك حجوزاتك.', [{ label: 'تسجيل الدخول', href: '/login?redirect=%2F' }])] }
    try {
      const list = (await deps.myBookings()).filter((b) => b.status === 'pending' || b.status === 'confirmed').filter((b) => new Date(b.starts_at) > now).slice(0, 5)
      if (!list.length) return { state, msgs: [bot('معندكش حجوزات قادمة دلوقتي. تحب نحجز؟', [{ label: 'احجز بكرة', send: 'عايز استشارة بكرة' }])] }
      const lines = list.map((b) => `• ${b.typeTitle} — ${arDate(b.starts_at)} ${arTime(b.starts_at)} (${b.status === 'confirmed' ? 'مؤكد' : 'بانتظار التأكيد'})`)
      return { state, msgs: [bot(`حجوزاتك القادمة:\n${lines.join('\n')}`, [ACCOUNT])] }
    } catch (e) { return { state, msgs: [bot(deps.friendlyError(e))] } }
  }

  // ── availability question (no booking intent) ──────────────────────────────
  const type = pickType(state.slots, deps.types)
  if (!type) return { state, msgs: [bot('مفيش استشارات متاحة دلوقتي. جرّب بعد شوية.')] }
  const { minutes, ignored } = pickMinutes(type, state.slots.minutes)
  const mode = pickMode(type, state.slots.mode)
  const notes: string[] = []
  if (ignored) notes.push(`المدة اللي طلبتها مش متاحة لـ«${type.title}». المدد المتاحة: ${type.durations.map((d) => MIN_AR(d.minutes)).join('، ')}. هكمل بـ${MIN_AR(minutes)}.`)
  if (state.slots.mode && state.slots.mode !== mode) notes.push(`«${type.title}» ${mode === 'in-person' ? 'حضوري فقط' : 'فيديو أو صوت'}، فهكمل بـ${MODE_AR[mode]}.`)

  let rows: OpenSlot[]
  try { rows = await deps.getSlots() } catch (e) { return { state, msgs: [bot(deps.friendlyError(e))] } }

  if (intent === 'availability' && !state.slots.date) {
    const days = nextDaysWithSlots(rows, minutes, now, todayKey, 3)
    if (!days.length) return { state, msgs: [bot('مفيش مواعيد مفتوحة حاليًا. جرّب ترجع بعدين.')] }
    return { state, msgs: [bot(`أقرب أيام فيها مواعيد:\n${days.map((d) => `• ${dayLabel(d.day)} — ${d.starts.length > 0 ? `من ${arTime(d.starts[0])}` : ''}`).join('\n')}\nاختار يوم عشان أعرض لك الساعات.`, dayChips(days))] }
  }

  // ── booking flow ───────────────────────────────────────────────────────────
  const date = state.slots.date
  if (!date) {
    const days = nextDaysWithSlots(rows, minutes, now, todayKey, 4)
    const chips: Chip[] = days.length ? dayChips(days) : [{ label: 'بكرة', send: 'بكرة' }]
    return { state, msgs: [bot([...notes, 'تمام. أنهي يوم يناسبك؟'].join('\n'), chips)] }
  }
  if (date < todayKey) return { state: { ...state, slots: { ...state.slots, date: undefined } }, msgs: [bot('اليوم ده عدّى. اختار يوم من النهارده وطالع.')] }

  const dayStarts = startsOnDay(rows, date, minutes, now)
  if (!state.slots.time) {
    if (!dayStarts.length) return noSlotsThatDay(state, rows, minutes, now, date, notes)
    return { state, msgs: [bot([...notes, `المواعيد المتاحة ${dayLabel(date)}. الساعة كام تناسبك؟`].join('\n'), timeChips(date, dayStarts))] }
  }

  const start = cairoToInstant(date, state.slots.time)
  const startIso = start.toISOString()
  if (start.getTime() < now.getTime() + 3600_000) {
    return { state: { ...state, slots: { ...state.slots, time: undefined } }, msgs: [bot('لازم الحجز يكون قبل الميعاد بساعة على الأقل. اختار ساعة تانية.', dayStarts.length ? timeChips(date, dayStarts) : undefined)] }
  }
  if (dayStarts.includes(startIso)) {
    const price = type.durations.find((d) => d.minutes === minutes)?.prices[mode]
    if (price === undefined) return { state, msgs: [bot('السعر مش محدد للاختيار ده. جرّب مدة أو نوع تاني.')] }
    const proposal: Proposal = { startsAt: startIso, typeSlug: type.slug, typeId: type.id, typeTitle: type.title, minutes, mode, price }
    return {
      state: { ...state, proposal, awaiting: 'confirm' },
      msgs: [bot([...notes, 'الميعاد متاح. ده ملخص حجزك:', summary(proposal), 'أأكّد الحجز؟'].join('\n'), [
        { label: 'أيوه، أكّد الحجز', send: 'أيوه' },
        { label: 'غيّر الميعاد', send: 'لا' },
        { label: 'غيّر النوع', send: 'الأنواع والأسعار' },
      ])],
    }
  }

  // Requested start is taken: suggest the closest alternatives.
  if (!dayStarts.length) return noSlotsThatDay(state, rows, minutes, now, date, notes)
  const near = [...dayStarts].sort((a, b) => Math.abs(new Date(a).getTime() - start.getTime()) - Math.abs(new Date(b).getTime() - start.getTime())).slice(0, 4).sort()
  return {
    state: { ...state, slots: { ...state.slots, time: undefined } },
    msgs: [bot([...notes, `الساعة ${arTime(startIso)} مش متاحة ${dayLabel(date)} لمدة ${MIN_AR(minutes)}. أقرب مواعيد متاحة:`].join('\n'), near.map((iso) => ({ label: arTime(iso), send: `${dm(date)} ${hhmmOf(iso)}` })))],
  }
}

// ── knowledge base (retrieval-augmented answers) ─────────────────────────────
const KB_FOUND = 0.5      // confident match: answer directly
const KB_MAYBE = 0.3      // weak match: answer, but say it may not be what they meant
const QUESTION_WORDS = /(^|\s)(ازاي|كيف|هل|ليه|لماذا|فين|ينفع|ممكن|الفرق|ايه|اقدر|هو|هي|امتي)(\s|$)/
const REFUND_WORDS = /(فلوس|مبلغ|استرداد|ترجع|يرجع|رجوع|ارجاع|رد)/

/** Should this message go to the knowledge base instead of the booking flow? */
function wantsKnowledge(intent: Intent, input: string, hasNew: boolean): boolean {
  if (hasNew) return false
  const n = normalize(input)
  if (intent === 'other' || intent === 'help') return true
  if (intent === 'cancel') return REFUND_WORDS.test(n)
  if (intent === 'book') return QUESTION_WORDS.test(n) || /[?؟]/.test(input)
  return false
}

async function answerFromKb(question: string, deps: Deps, state: State): Promise<Msg[] | null> {
  let hits: KbPassage[]
  try { hits = await deps.kb!(question) } catch { return null }
  const top = hits[0]
  if (!top || top.score < KB_MAYBE) return null
  const usable = hits.filter((h) => h.score >= KB_MAYBE)
  let text = top.answer
  if (deps.kbAnswer && top.score >= KB_FOUND) {
    try { text = (await deps.kbAnswer(question, usable)) ?? text } catch { /* keep the article text */ }
  }
  if (top.score < KB_FOUND) text = `ممكن يكون ده اللي تقصده:\n${text}`

  const chips: Chip[] = []
  if (state.awaiting === 'confirm' && state.proposal) chips.push({ label: 'أيوه، أكّد الحجز', send: 'أيوه' })
  if (top.category === 'الحجز') chips.push({ label: 'احجز دلوقتي', send: 'عايز استشارة بكرة' })
  if (top.category === 'الإلغاء' || top.category === 'الدفع') chips.push(ACCOUNT)
  for (const h of usable.slice(1, 3)) chips.push({ label: h.question.replace(/[؟?]\s*$/, ''), send: h.question })
  return [bot(text, chips.length ? chips : undefined)]
}

function noSlotsThatDay(state: State, rows: OpenSlot[], minutes: number, now: Date, date: string, notes: string[]): { state: State; msgs: Msg[] } {
  const days = nextDaysWithSlots(rows, minutes, now, addDays(date, 1), 3)
  const why = 'مفيش مواعيد متاحة'
  return {
    state: { ...state, slots: { ...state.slots, date: undefined, time: undefined } },
    msgs: [bot([...notes, `${why} ${dayLabel(date)}.${days.length ? ' أقرب أيام فيها مواعيد:' : ' جرّب يوم تاني.'}`].join('\n'), days.length ? dayChips(days) : undefined)],
  }
}

async function confirmBooking(prev: State, deps: Deps): Promise<{ state: State; msgs: Msg[] }> {
  const p = prev.proposal!
  if (!deps.user) {
    return { state: prev, msgs: [bot('عشان أكمّل الحجز لازم تسجّل دخولك. بعد التسجيل هرجعلك على نفس الحجز وتأكّده بضغطة.', [{ label: 'تسجيل الدخول', href: '/login?redirect=%2F' }, { label: 'إنشاء حساب', href: '/signup' }])] }
  }
  try {
    const b = await deps.book({ typeId: p.typeId, minutes: p.minutes, mode: p.mode, startsAt: p.startsAt })
    return {
      state: initialState(),
      msgs: [bot(`تم! طلب الحجز وصل برقم ${b.ref}.\n${arDate(p.startsAt)} — ${arTime(p.startsAt)}\nالحجز بانتظار تأكيد المستشار، وهتلاقيه في حسابك.`, [ACCOUNT, { label: 'حجز تاني', send: 'عايز استشارة' }])],
    }
  } catch (e) {
    const text = deps.friendlyError(e)
    return { state: { slots: { ...prev.slots, time: undefined }, proposal: null, awaiting: null }, msgs: [bot(`${text}\nقولّي ساعة تانية وأشوف لك المتاح.`)] }
  }
}
