import { useEffect, useState } from 'react'
import { Card, Button, Input } from '@/lib/ui'
import { usePaySettings } from '@/lib/hooks'
import * as api from '@/lib/api'
import type { PaySettings } from '@/lib/api'

/** Where clients send transfers. Shown to them on the booking and payment screens. */
export function PaySettingsCard() {
  const { data, refetch } = usePaySettings()
  const [v, setV] = useState<PaySettings | null>(null)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)
  useEffect(() => { if (data) setV(data) }, [data])
  if (!v) return null
  const set = (k: keyof PaySettings) => (e: any) => setV({ ...v, [k]: e.target.value })
  const save = async () => {
    setBusy(true); setMsg(null)
    try { await api.savePaySettings(v); setMsg({ ok: true, text: 'اتحفظت بيانات الدفع.' }); refetch() }
    catch (e) { setMsg({ ok: false, text: api.friendlyError(e) }) } finally { setBusy(false) }
  }
  return (
    <Card padding="lg" style={{ marginBottom: 'var(--space-8)' }}>
      <h3 style={{ fontSize: 'var(--size-h3)', marginBottom: 'var(--space-3)' }}>بيانات استلام التحويلات</h3>
      <p style={{ fontSize: 'var(--size-body-sm)', color: 'var(--text-muted)', marginBottom: 'var(--space-6)' }}>
        دي اللي بتظهر للعميل لما يختار التحويل. سيب الخانة فاضية لو مش بتستلم بالطريقة دي.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 'var(--space-6)' }}>
        <Input label="اسم المحفظة" value={v.pay_wallet_name} onChange={set('pay_wallet_name')} maxLength={60} />
        <Input label="رقم المحفظة" dir="ltr" value={v.pay_wallet_number} onChange={set('pay_wallet_number')} maxLength={30} />
        <Input label="عنوان إنستا باي" dir="ltr" value={v.pay_instapay} onChange={set('pay_instapay')} maxLength={60} />
      </div>
      <div style={{ marginTop: 'var(--space-6)' }}>
        <Input label="ملاحظة للعميل" multiline rows={2} value={v.pay_note} onChange={set('pay_note')} maxLength={300} />
      </div>
      {msg && <div role="status" style={{ marginTop: 'var(--space-5)', fontSize: 'var(--size-body-sm)', color: msg.ok ? 'var(--status-success-fg)' : 'var(--status-danger-fg)' }}>{msg.text}</div>}
      <div style={{ marginTop: 'var(--space-6)' }}><Button loading={busy} onClick={save}>احفظ</Button></div>
    </Card>
  )
}
