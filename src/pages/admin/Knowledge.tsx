import { useState } from 'react'
import { Card, Badge, Button, Input, Dialog } from '@/lib/ui'
import { PageHead } from './AdminShell'
import { useKbArticles } from '@/lib/hooks'
import * as api from '@/lib/api'

type Draft = { id?: string; category: string; question: string; answer: string; keywords: string; is_active: boolean }
const blank: Draft = { category: 'عام', question: '', answer: '', keywords: '', is_active: true }

/** The assistant answers questions from these articles (retrieval), not from guesses. */
export default function Knowledge() {
  const { data, loading, error, refetch } = useKbArticles()
  const [edit, setEdit] = useState<Draft | null>(null)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [test, setTest] = useState('')
  const [hits, setHits] = useState<api.KbHit[] | null>(null)
  const items = data ?? []

  const save = async () => {
    if (!edit) return
    setBusy(true); setErr(null)
    try { await api.upsertKbArticle(edit); setEdit(null); refetch() }
    catch (e) { setErr(api.friendlyError(e)) } finally { setBusy(false) }
  }
  const remove = async (id: string) => { try { await api.deleteKbArticle(id); refetch() } catch (e) { setErr(api.friendlyError(e)) } }
  const runTest = async () => { try { setHits(await api.kbSearch(test, 3)) } catch (e) { setErr(api.friendlyError(e)) } }

  return (
    <div className="adm-page">
      <PageHead title="أسئلة المساعد" sub="المساعد بيجاوب العملاء من الأسئلة دي. عدّل الإجابة هنا وهتتغير عنده فورًا."
        action={<Button icon="plus" onClick={() => setEdit({ ...blank })}>سؤال جديد</Button>} />

      <Card padding="lg" style={{ marginBottom: 'var(--space-8)' }}>
        <h3 style={{ fontSize: 'var(--size-body-lg)', marginBottom: 'var(--space-4)' }}>جرّب سؤال زي ما العميل هيكتبه</h3>
        <div style={{ display: 'flex', gap: 'var(--space-5)', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <Input placeholder="مثال: ازاي ادفع؟" value={test} onChange={(e) => setTest(e.target.value)} containerStyle={{ minWidth: 280, flex: 1 }} />
          <Button variant="secondary" disabled={test.trim().length < 2} onClick={runTest}>جرّب</Button>
        </div>
        {hits && (
          <div style={{ marginTop: 'var(--space-6)', fontSize: 'var(--size-body-sm)' }}>
            {hits.length === 0 && <span style={{ color: 'var(--text-muted)' }}>مفيش إجابة مناسبة. فكّر تضيف سؤال جديد.</span>}
            {hits.map((h) => (
              <div key={h.id} style={{ padding: 'var(--space-4) 0', borderTop: '1px solid var(--border-subtle)' }}>
                <strong>{h.question}</strong> <Badge tone={h.score >= 0.5 ? 'success' : 'warning'}>{Math.round(h.score * 100)}٪</Badge>
              </div>
            ))}
          </div>
        )}
      </Card>

      {loading && <p style={{ color: 'var(--text-muted)' }}>جاري التحميل…</p>}
      {(error || err) && <p role="alert" style={{ color: 'var(--status-danger-fg)' }}>{err ?? api.friendlyError(error)}</p>}
      <Card padding="none">
        {items.map((a, i) => (
          <div key={a.id} style={{ display: 'flex', gap: 'var(--space-6)', alignItems: 'flex-start', padding: 'var(--space-6) var(--space-7)', borderTop: i ? '1px solid var(--border-subtle)' : 'none', opacity: a.is_active ? 1 : .55 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'center', flexWrap: 'wrap' }}>
                <strong style={{ color: 'var(--text-title)' }}>{a.question}</strong>
                <Badge tone="neutral">{a.category}</Badge>
                {!a.is_active && <Badge tone="warning">مخفي</Badge>}
              </div>
              <p style={{ fontSize: 'var(--size-body-sm)', color: 'var(--text-muted)', margin: '6px 0 0' }}>{a.answer}</p>
            </div>
            <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
              <Button size="sm" variant="secondary" onClick={() => setEdit({ id: a.id, category: a.category, question: a.question, answer: a.answer, keywords: a.keywords, is_active: a.is_active })}>تعديل</Button>
              <Button size="sm" variant="ghost" style={{ color: 'var(--status-danger-fg)' }} onClick={() => remove(a.id)}>حذف</Button>
            </div>
          </div>
        ))}
        {!loading && items.length === 0 && <p style={{ padding: 'var(--space-9)', textAlign: 'center', color: 'var(--text-subtle)' }}>مفيش أسئلة لسه. شغّل ملف seed_kb.sql أو أضف سؤال.</p>}
      </Card>

      <Dialog open={!!edit} dir="rtl" onClose={() => setEdit(null)} title={edit?.id ? 'تعديل السؤال' : 'سؤال جديد'}
        footer={<><Button loading={busy} disabled={!edit || edit.question.trim().length < 3 || edit.answer.trim().length < 3} onClick={save}>احفظ</Button><Button variant="ghost" onClick={() => setEdit(null)}>إلغاء</Button></>}>
        {edit && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', marginTop: 'var(--space-6)' }}>
            <Input label="السؤال" value={edit.question} maxLength={200} onChange={(e) => setEdit({ ...edit, question: e.target.value })} />
            <Input label="الإجابة" multiline rows={4} value={edit.answer} maxLength={1200} onChange={(e) => setEdit({ ...edit, answer: e.target.value })} />
            <Input label="كلمات تساعد المساعد يلاقي السؤال" hint="كلمات تانية العميل ممكن يقولها بدل كلمات السؤال، بينها مسافات." value={edit.keywords} onChange={(e) => setEdit({ ...edit, keywords: e.target.value })} />
            <Input label="التصنيف" value={edit.category} maxLength={30} onChange={(e) => setEdit({ ...edit, category: e.target.value })} />
          </div>
        )}
      </Dialog>
    </div>
  )
}
