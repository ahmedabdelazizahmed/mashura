import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/lib/auth'
import { useTypes } from '@/lib/hooks'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import * as api from '@/lib/api'
import { respond, initialState, WELCOME, type Msg, type State, type Deps, type CatalogType, type OpenSlot } from '@/lib/assistantEngine'
import { arDate, arTime } from '@/lib/adapt'
import '@/styles/assistant.css'

const STORE = 'mashura-assistant-v1'
const SHOW_ON = ['/', '/app', '/privacy', '/terms']
const AI_ON = import.meta.env.VITE_ASSISTANT_AI === 'true'

interface Saved { msgs: Msg[]; state: State }
const load = (): Saved | null => {
  try { const r = sessionStorage.getItem(STORE); return r ? (JSON.parse(r) as Saved) : null } catch { return null }
}
const save = (s: Saved) => { try { sessionStorage.setItem(STORE, JSON.stringify({ msgs: s.msgs.slice(-40), state: s.state })) } catch { /* private mode */ } }

export default function Assistant() {
  const { pathname } = useLocation()
  const nav = useNavigate()
  const { profile, session } = useAuth()
  const { data: typeRows } = useTypes()

  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [text, setText] = useState('')
  const [msgs, setMsgs] = useState<Msg[]>(() => load()?.msgs ?? [WELCOME])
  const [state, setState] = useState<State>(() => load()?.state ?? initialState())
  const bodyRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const slotCache = useRef<{ at: number; rows: OpenSlot[] } | null>(null)
  const resumed = useRef(false)

  const visible = SHOW_ON.includes(pathname)

  // Open from anywhere (landing buttons, account page).
  useEffect(() => {
    const h = () => setOpen(true)
    window.addEventListener('mashura:open-assistant', h)
    return () => window.removeEventListener('mashura:open-assistant', h)
  }, [])

  // Persist the conversation for this tab.
  useEffect(() => { save({ msgs, state }) }, [msgs, state])

  // Different person => fresh conversation (never carry a draft across accounts).
  const lastUser = useRef<string | null>(null)
  useEffect(() => {
    const id = profile?.id ?? null
    if (lastUser.current && !id) { setMsgs([WELCOME]); setState(initialState()) }
    lastUser.current = id
  }, [profile?.id])

  // Back from sign-in with a pending booking: offer to finish it.
  useEffect(() => {
    if (resumed.current || !session || !state.proposal || state.awaiting !== 'confirm') return
    resumed.current = true
    const p = state.proposal
    setOpen(true)
    setMsgs((m) => [...m, { role: 'bot', text: `أهلاً بعودتك! لسه عايز تأكّد حجز ${p.typeTitle} يوم ${arDate(p.startsAt)} الساعة ${arTime(p.startsAt)} بسعر ${p.price} جنيه؟`, chips: [{ label: 'أيوه، أكّد الحجز', send: 'أيوه' }, { label: 'لا، غيّر', send: 'لا' }] }])
  }, [session, state.proposal, state.awaiting])

  useEffect(() => { bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight }) }, [msgs, busy, open])
  useEffect(() => { if (open) setTimeout(() => inputRef.current?.focus(), 50) }, [open])
  useEffect(() => {
    if (!open) return
    const k = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [open])

  const types: CatalogType[] = useMemo(
    () => (typeRows ?? []).map((r) => ({
      id: r.id, slug: r.slug, title: r.title, modes: r.modes as CatalogType['modes'],
      durations: r.durations.map((d) => ({ minutes: d.minutes, prices: d.prices as CatalogType['durations'][number]['prices'] })),
    })),
    [typeRows]
  )

  const deps = useCallback((): Deps => ({
    types,
    user: profile ? { id: profile.id, name: profile.name } : null,
    friendlyError: api.friendlyError,
    getSlots: async () => {
      const c = slotCache.current
      if (c && Date.now() - c.at < 20_000) return c.rows
      const from = new Date(); const to = new Date(); to.setDate(to.getDate() + 28)
      const rows = (await api.getOpenSlots(from, to)) as OpenSlot[]
      slotCache.current = { at: Date.now(), rows }
      return rows
    },
    book: async (i) => {
      slotCache.current = null
      const b = await api.createBooking({ typeId: i.typeId, minutes: i.minutes, mode: i.mode, startsAt: i.startsAt, topic: i.topic })
      return { ref: b.ref }
    },
    myBookings: async () => (await api.getMyBookings()).map((b: any) => ({ ref: b.ref, starts_at: b.starts_at, typeTitle: b.consultation_types?.title ?? '—', status: b.status })),
    // Optional language model (Supabase Edge Function). It only returns {intent, slots};
    // booking itself always goes through the same validated server function.
    llm: AI_ON ? async (t, st, today) => {
      const { data, error } = await supabase.functions.invoke('assistant', { body: { text: t.slice(0, 300), state: st.slots, today } })
      return error ? null : (data as any)
    } : undefined,
  }), [types, profile])

  const send = useCallback(async (raw: string) => {
    const t = raw.trim().slice(0, 300)
    if (!t || busy) return
    setText('')
    setMsgs((m) => [...m.map((x) => ({ ...x, chips: undefined })), { role: 'user', text: t }])
    setBusy(true)
    try {
      if (!isSupabaseConfigured() || types.length === 0) {
        setMsgs((m) => [...m, { role: 'bot', text: 'خدمة الحجز غير متصلة حاليًا. جرّب بعد شوية.' }])
        return
      }
      const r = await respond(state, t, deps())
      setState(r.state)
      setMsgs((m) => [...m, ...r.msgs])
    } catch (e) {
      setMsgs((m) => [...m, { role: 'bot', text: api.friendlyError(e) }])
    } finally {
      setBusy(false)
    }
  }, [busy, state, deps, types.length])

  const onChip = (c: { send?: string; href?: string }) => {
    if (c.href) {
      if (c.href.startsWith('/')) {
        if (c.href.startsWith('/login') || c.href.startsWith('/signup')) {
          const sep = c.href.includes('?') ? '&' : '?'
          nav(c.href.includes('redirect=') ? c.href : `${c.href}${sep}redirect=%2F`)
        } else nav(c.href)
        setOpen(false)
      }
      return
    }
    if (c.send) void send(c.send)
  }

  if (!visible) return null
  const lastIdx = msgs.length - 1

  return (
    <>
      {!open && (
        <button type="button" className={'asst-fab' + (pathname === '/' ? ' lift' : '')} onClick={() => setOpen(true)} aria-label="افتح مساعد الحجز">
          <span className="dot" aria-hidden="true" />اسأل المساعد
        </button>
      )}
      {open && (
        <section className="asst-panel" role="dialog" aria-label="مساعد الحجز" dir="rtl">
          <div className="asst-head">
            <b>مساعد الحجز<small>يجهّز لك الحجز من كلامك</small></b>
            <button type="button" onClick={() => { setMsgs([WELCOME]); setState(initialState()) }} aria-label="محادثة جديدة" title="محادثة جديدة">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 12a9 9 0 1 0 3-6.7L3 8" /><path d="M3 3v5h5" /></svg>
            </button>
            <button type="button" onClick={() => setOpen(false)} aria-label="إغلاق">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12" /></svg>
            </button>
          </div>
          <div className="asst-body" ref={bodyRef} aria-live="polite">
            {msgs.map((m, i) => (
              <div key={i} style={{ display: 'contents' }}>
                <div className={'asst-msg ' + m.role}>{m.text}</div>
                {m.role === 'bot' && m.chips && i === lastIdx && !busy && (
                  <div className="asst-chips">
                    {m.chips.map((c) => <button key={c.label} type="button" className="asst-chip" onClick={() => onChip(c)}>{c.label}</button>)}
                  </div>
                )}
              </div>
            ))}
            {busy && <div className="asst-typing" aria-label="جاري الكتابة"><i /><i /><i /></div>}
          </div>
          <form className="asst-form" onSubmit={(e) => { e.preventDefault(); void send(text) }}>
            <input ref={inputRef} value={text} onChange={(e) => setText(e.target.value)} placeholder="اكتب: عايز استشارة بكرة الساعة 5" maxLength={300} aria-label="رسالتك" autoComplete="off" />
            <button type="submit" disabled={busy || !text.trim()}>إرسال</button>
          </form>
          <div className="asst-foot">لا تكتب بيانات حساسة هنا. التأكيد النهائي بيتم بموافقتك.</div>
        </section>
      )}
    </>
  )
}
