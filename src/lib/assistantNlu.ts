// Egyptian-Arabic understanding for the booking assistant.
// Pure functions, no network: turns a sentence like "عايز استشارة مستعجل
// بكرة الساعة 5 العصر" into structured slots. Tested in scripts/test-assistant.mjs.

export type AMode = 'video' | 'audio' | 'in-person'

export interface Slots {
  typeSlug?: string
  minutes?: number
  mode?: AMode
  date?: string       // YYYY-MM-DD, Africa/Cairo calendar day
  time?: string       // HH:MM, 24h, Cairo
  topic?: string
}

export type Intent =
  | 'book' | 'prices' | 'availability' | 'mybookings' | 'cancel' | 'greeting'
  | 'yes' | 'no' | 'help' | 'other'

export interface Parsed {
  intent: Intent
  slots: Slots
  dateWords: boolean   // user mentioned a day (even an invalid one)
  timeWords: boolean
}

const CAIRO = 'Africa/Cairo'

// ── helpers: dates in the Cairo calendar ─────────────────────────────────────
export const cairoKey = (d: Date): string => d.toLocaleDateString('en-CA', { timeZone: CAIRO })
export function addDays(key: string, n: number): string {
  const [y, m, d] = key.split('-').map(Number)
  const t = new Date(Date.UTC(y, m - 1, d + n, 12))
  return t.toISOString().slice(0, 10)
}
export const weekdayOf = (key: string): number => {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d, 12)).getUTCDay() // 0 = Sunday
}
/** The UTC instant at which Cairo's wall clock reads `key` `HH:MM`. */
export function cairoToInstant(key: string, hhmm: string): Date {
  const [y, m, d] = key.split('-').map(Number)
  const [h, mi] = hhmm.split(':').map(Number)
  let guess = Date.UTC(y, m - 1, d, h, mi)
  for (let i = 0; i < 2; i++) {
    const parts = new Intl.DateTimeFormat('en-GB', { timeZone: CAIRO, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).formatToParts(new Date(guess))
    const g = (t: string) => Number(parts.find((p) => p.type === t)!.value)
    const shown = Date.UTC(g('year'), g('month') - 1, g('day'), g('hour'), g('minute'))
    guess -= shown - Date.UTC(y, m - 1, d, h, mi)
  }
  return new Date(guess)
}

// ── normalisation ────────────────────────────────────────────────────────────
export function normalize(text: string): string {
  return text
    .replace(/[٠-٩]/g, (c) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(c)))
    .replace(/[۰-۹]/g, (c) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(c)))
    .replace(/[ً-ٰٟـ]/g, '')   // diacritics + tatweel
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ي')
    .replace(/[؟?!،,؛;]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()
}

const WEEKDAYS: [RegExp, number][] = [
  [/(^|\s)(ال)?احد(\s|$)/, 0],
  [/(^|\s)(ال)?(اتنين|اثنين|اثنان)(\s|$)/, 1],
  [/(^|\s)(ال)?(تلات|ثلاث)(اء|ا|ه)?(\s|$)/, 2],
  [/(^|\s)(ال)?(اربع|اربعاء)(ا|اء)?(\s|$)/, 3],
  [/(^|\s)(ال)?خميس(\s|$)/, 4],
  [/(^|\s)(ال)?جمع(ه|ة)(\s|$)/, 5],
  [/(^|\s)(ال)?سبت(\s|$)/, 6],
]
const MONTHS: Record<string, number> = {
  يناير: 1, فبراير: 2, مارس: 3, ابريل: 4, ابريل_: 4, مايو: 5, يونيو: 6, يونيه: 6, يوليو: 7, يوليه: 7,
  اغسطس: 8, سبتمبر: 9, اكتوبر: 10, نوفمبر: 11, ديسمبر: 12,
}
const NUMWORDS: Record<string, number> = {
  واحده: 1, واحد: 1, اتنين: 2, اثنين: 2, تلاته: 3, ثلاثه: 3, اربعه: 4, خمسه: 5, سته: 6, ستا: 6, سبعه: 7,
  تمانيه: 8, ثمانيه: 8, تسعه: 9, عشره: 10, حداشر: 11, احدعشر: 11, اتناشر: 12, اثناعشر: 12,
}

const AM_WORDS = /(صباح|الصبح|صبح|فجر|بدري)/
const PM_WORDS = /(مساء|العصر|عصر|بليل|ليل|المغرب|مغرب|عشيه|بعد الظهر|بعد ضهر|بالليل)/
const NOON_WORDS = /(الظهر|ظهرا|ضهر|الضهر)/

/** Convert hour as spoken (1-12 or 13-23) plus optional period to 24h. */
function to24(h: number, period: 'am' | 'pm' | 'noon' | null): number | null {
  if (h < 0 || h > 23) return null
  if (h >= 13) return h
  if (period === 'am') return h === 12 ? 0 : h
  if (period === 'pm') return h === 12 ? 12 : h + 12
  if (period === 'noon') return h >= 1 && h <= 5 ? h + 12 : h === 12 ? 12 : h === 11 || h === 10 ? h : h + 12
  // No period given: clinic hours are 10–19, so 1–7 means afternoon, 8–11 morning.
  if (h >= 1 && h <= 7) return h + 12
  return h
}

function periodNear(rest: string): 'am' | 'pm' | 'noon' | null {
  if (NOON_WORDS.test(rest)) return 'noon'
  if (AM_WORDS.test(rest)) return 'am'
  if (PM_WORDS.test(rest)) return 'pm'
  return null
}

interface TimeHit { time: string; remainder: string }

function parseTime(t: string): TimeHit | null {
  // 1) 5:30 / 17:45 / 5.30 (+ optional period word right after)
  let m = t.match(/(?:^|\s)(\d{1,2})[:.](\d{2})(?:\s*(am|pm|ص|م))?(.*)$/)
  if (m) {
    let h = Number(m[1]); const mi = Number(m[2])
    if (mi < 60 && h < 24) {
      const suffix = m[3]
      const per = suffix === 'am' || suffix === 'ص' ? 'am' : suffix === 'pm' || suffix === 'م' ? 'pm' : periodNear(m[4] ?? '')
      const h24 = to24(h, per)
      if (h24 !== null) return { time: `${String(h24).padStart(2, '0')}:${String(mi).padStart(2, '0')}`, remainder: t.replace(m[0], ' ') }
    }
  }
  // 2) "الساعه 5" / "ساعه خمسه" (+ ونص / وربع / الا ربع) (+ period). Try every "ساعه"
  //    occurrence: the first may be a duration ("ساعه يوم التلات الساعه 4").
  const re2 = /(?:^|\s)(?:ال)?ساع[هة]\s+(\d{1,2}|[ء-ي]+)(?:\s+(ونص|ونصف|وربع|الا ربع|الا تلت|وتلت))?(.*)$/g
  for (let guard = 0; guard < 4; guard++) {
    const idxs = [...t.matchAll(/(?:^|\s)(?:ال)?ساع[هة](?=\s|$)/g)].map((x) => x.index ?? 0)
    if (guard >= idxs.length) break
    const sub = t.slice(idxs[guard])
    re2.lastIndex = 0
    const mm = re2.exec(sub)
    if (!mm) continue
    const raw = mm[1]
    const h = /^\d+$/.test(raw) ? Number(raw) : NUMWORDS[raw]
    if (h === undefined) continue
    let mins = 0
    if (mm[2] === 'ونص' || mm[2] === 'ونصف') mins = 30
    else if (mm[2] === 'وربع') mins = 15
    let hh = h
    if (mm[2] === 'الا ربع') { hh = h - 1; mins = 45 }
    if (mm[2] === 'الا تلت') { hh = h - 1; mins = 40 }
    const per = periodNear(mm[3] ?? '') ?? periodNear(t)
    const h24 = to24(hh <= 0 ? 12 : hh, per)
    if (h24 !== null) return { time: `${String(h24).padStart(2, '0')}:${String(mins).padStart(2, '0')}`, remainder: (t.slice(0, idxs[guard]) + ' ' + sub.replace(mm[0], ' ')).replace(/\s+/g, ' ') }
  }
  // 3) "5 العصر" / "10 الصبح" / "3 pm" / "5 م" — number directly followed by a period word
  m = t.match(/(?:^|\s)(\d{1,2})\s*(am|pm|ص|م|صباحا|صباح|الصبح|صبح|مساء|العصر|عصر|بليل|بالليل|المغرب|الظهر|ظهرا|ضهر)(?=\s|$)/)
  if (m) {
    const h = Number(m[1])
    const per = periodNear(m[2]) ?? (m[2] === 'am' || m[2] === 'ص' ? 'am' : m[2] === 'pm' || m[2] === 'م' ? 'pm' : null)
    const h24 = to24(h, per)
    if (h24 !== null) return { time: `${String(h24).padStart(2, '0')}:00`, remainder: t.replace(m[0], ' ') }
  }
  // 4) number-word + period: "خمسه العصر"
  m = t.match(/(?:^|\s)(واحده|اتنين|اثنين|تلاته|ثلاثه|اربعه|خمسه|سته|سبعه|تمانيه|ثمانيه|تسعه|عشره|حداشر|اتناشر)\s+(الصبح|صباحا|العصر|مساء|بليل|المغرب|الظهر|ظهرا)(?=\s|$)/)
  if (m) {
    const h24 = to24(NUMWORDS[m[1]], periodNear(m[2]))
    if (h24 !== null) return { time: `${String(h24).padStart(2, '0')}:00`, remainder: t.replace(m[0], ' ') }
  }
  return null
}

function parseDate(t: string, todayKey: string): { date?: string; found: boolean; remainder: string } {
  let rest = t
  const take = (re: RegExp) => { const m = rest.match(re); if (m) rest = rest.replace(re, ' '); return m }
  // relative words
  if (take(/(^|\s)بعد (بكره|بكرا|بكرة|غد|غدا)(?=\s|$)/)) return { date: addDays(todayKey, 2), found: true, remainder: rest }
  if (take(/(^|\s)(بكره|بكرا|غدا|غد)(?=\s|$)/)) return { date: addDays(todayKey, 1), found: true, remainder: rest }
  if (take(/(^|\s)(النهارده|انهارده|النهارد|اليوم|الليله|النهاردا)(?=\s|$)/)) return { date: todayKey, found: true, remainder: rest }
  // 12/11 or 12-11  (day/month)
  let m = take(/(?:^|\s)(\d{1,2})[\/-](\d{1,2})(?=\s|$)/)
  if (m) {
    const d = Number(m[1]), mo = Number(m[2])
    return { ...resolveDM(d, mo, todayKey), remainder: rest }
  }
  // 12 نوفمبر
  m = take(new RegExp(`(?:^|\\s)(?:يوم\\s+)?(\\d{1,2})\\s+(${Object.keys(MONTHS).join('|')})(?=\\s|$)`))
  if (m) return { ...resolveDM(Number(m[1]), MONTHS[m[2]], todayKey), remainder: rest }
  // weekday name
  for (const [re, wd] of WEEKDAYS) {
    if (re.test(rest)) {
      rest = rest.replace(re, ' ').replace(/(^|\s)يوم(?=\s|$)/, ' ')
      const today = weekdayOf(todayKey)
      let delta = (wd - today + 7) % 7
      if (delta === 0) delta = 7
      return { date: addDays(todayKey, delta), found: true, remainder: rest }
    }
  }
  // "يوم 12"
  m = take(/(?:^|\s)يوم\s+(\d{1,2})(?=\s|$)/)
  if (m) {
    const d = Number(m[1])
    const [y, mo] = todayKey.split('-').map(Number)
    for (let k = 0; k < 2; k++) {
      const mm = ((mo - 1 + k) % 12) + 1
      const yy = y + Math.floor((mo - 1 + k) / 12)
      const key = `${yy}-${String(mm).padStart(2, '0')}-${String(d).padStart(2, '0')}`
      if (d >= 1 && d <= 31 && validKey(key) && key >= todayKey) return { date: key, found: true, remainder: rest }
    }
    return { found: true, remainder: rest }
  }
  return { found: false, remainder: rest }
}

function validKey(key: string): boolean {
  const [y, m, d] = key.split('-').map(Number)
  const t = new Date(Date.UTC(y, m - 1, d, 12))
  return t.getUTCFullYear() === y && t.getUTCMonth() === m - 1 && t.getUTCDate() === d
}
function resolveDM(d: number, mo: number, todayKey: string): { date?: string; found: boolean } {
  if (mo < 1 || mo > 12 || d < 1 || d > 31) return { found: true }
  const y = Number(todayKey.slice(0, 4))
  for (const yy of [y, y + 1]) {
    const key = `${yy}-${String(mo).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    if (validKey(key) && key >= todayKey) return { date: key, found: true }
  }
  return { found: true }
}

function parseDuration(t: string): number | undefined {
  if (/ساعه ونص|ساعه و نص|ساعه ونصف|ساعه ونص/.test(t)) return 90
  if (/(ساعتين|ساعتان)/.test(t)) return 120
  if (/(ربع ساعه|ربع ساعة|١٥ دقيقه)/.test(t)) return 15
  if (/(نص ساعه|نصف ساعه)/.test(t)) return 30
  const m = t.match(/(\d{2,3})\s*(دقيقه|دقايق|د)(?=\s|$)/)
  if (m) return Number(m[1])
  if (/(^|\s)ساعه(\s|$)/.test(t)) return 60
  return undefined
}

const has = (t: string, re: RegExp) => re.test(t)

export function parseMessage(raw: string, now: Date = new Date()): Parsed {
  const t0 = normalize(raw)
  const todayKey = cairoKey(now)
  const slots: Slots = {}

  // time first (so "الساعه 5" isn't read as a duration), then date, then the rest
  const tm = parseTime(t0)
  let rest = tm ? tm.remainder : t0
  if (tm) slots.time = tm.time
  const dt = parseDate(rest, todayKey)
  rest = dt.remainder
  if (dt.date) slots.date = dt.date

  const minutes = parseDuration(rest)
  if (minutes) slots.minutes = minutes

  if (has(rest, /(مستعجل|عاجل|ضروري|بسرعه|مستعجله|urgent|دلوقتي حالا)/)) slots.typeSlug = 'urgent'
  else if (has(rest, /(مقابله|اقابل|وجها لوجه|حضوري|شخصي|وجه لوجه|meeting|اجتماع)/)) { slots.typeSlug = 'meeting'; slots.mode = 'in-person' }
  else if (has(rest, /(عاديه|عادي|regular)/)) slots.typeSlug = 'regular'

  if (slots.typeSlug !== 'meeting') {
    if (has(rest, /(فيديو|video|زووم|zoom|ميت|كاميرا)/)) slots.mode = 'video'
    else if (has(rest, /(صوت|صوتي|صوتيه|audio|تليفون|فون|مكالمه صوت)/)) slots.mode = 'audio'
  }

  let intent: Intent = 'other'
  if (has(t0, /^(لا|لأ|لا شكرا|لاء|no|بلاش|مش عايز|مش دلوقتي)(\s|$)/) && !has(t0, /(احجز|عايز|عاوز)/)) intent = 'no'
  else if (has(t0, /^(اه|ايوه|ايوا|أيوه|نعم|تمام|ماشي|موافق|اكد|أكد|اكده|yes|ok|اوكي|اوك|يلا|طبعا|اكيد|احجز|احجزه|احجزها|خلاص احجز|اكد الحجز|تاكيد)(\s|$)/) && !slots.date && !slots.time) intent = 'yes'
  else if (has(t0, /(الغي|الغاء|الغ[يا]|الغى)/) && has(t0, /(حجز|ميعاد|جلسه|استشاره)/)) intent = 'cancel'
  else if (has(t0, /(حجوزاتي|حجزي|مواعيدي|حجوزات)/)) intent = 'mybookings'
  else if (has(t0, /(سعر|اسعار|بكام|كام|تكلف|تكاليف|الفلوس|رسوم|اجر)/) && !slots.date && !slots.time) intent = 'prices'
  else if (has(t0, /(عايز|عاوز|محتاج|احجز|حجز|ابغي|اريد|اقدر احجز|نفسي|حابب|ممكن احجز|احجزلي|عاوزه|عايزه)/)) intent = 'book'
  else if (slots.date || slots.time || slots.typeSlug || dt.found || tm) intent = 'book'
  else if (has(t0, /(متاح|مواعيد|فاضي|فاضيه|فاضل|امتي|ايمتي|ميعاد)/)) intent = 'availability'
  else if (has(t0, /(السلام|اهلا|مرحبا|هاي|hello|hi|صباح الخير|مساء الخير|ازيك|هلا)/)) intent = 'greeting'
  else if (has(t0, /(مساعده|ساعدني|تعمل ايه|بتعمل ايه|اعمل ايه|ازاي)/)) intent = 'help'

  // "ايه المواعيد المتاحة بكرة" = availability question, even with a date
  if (intent === 'book' && has(t0, /(متاح|مواعيد|فاضي|فاضيه)/) && !has(t0, /(عايز|عاوز|احجز|محتاج)/)) intent = 'availability'

  return { intent, slots, dateWords: dt.found, timeWords: !!tm }
}
