import { useState } from 'react'
import { Button, Icon, Input } from '@/lib/ui'
import { usePaySettings } from '@/lib/hooks'
import * as api from '@/lib/api'

interface Props {
  amount: number
  /** When given (and the payment is still pending) the client can record the transfer reference. */
  paymentId?: string | null
  reference?: string | null
  submittedAt?: string | null
  onSubmitted?: () => void
}

const box = { padding: 'var(--space-6)', borderRadius: 'var(--radius-md)', background: 'var(--surface-brand-soft)', border: '1px solid var(--border-subtle)' } as const

function CopyRow({ label, value }: { label: string; value: string }) {
  const [done, setDone] = useState(false)
  const copy = async () => {
    try { await navigator.clipboard.writeText(value); setDone(true); setTimeout(() => setDone(false), 1800) } catch { /* clipboard blocked */ }
  }
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-5)', padding: 'var(--space-4) 0' }}>
      <div>
        <div style={{ fontSize: 'var(--size-caption)', color: 'var(--text-muted)' }}>{label}</div>
        <div dir="ltr" style={{ fontFamily: 'var(--font-mono)', fontWeight: 'var(--weight-semibold)', color: 'var(--text-title)', textAlign: 'start' }}>{value}</div>
      </div>
      <Button size="sm" variant="secondary" onClick={copy}>{done ? 'اتنسخ ✓' : 'انسخ'}</Button>
    </div>
  )
}

/** Where to send the money (set by the admin) + a form to record the transfer reference. */
export default function PaymentInstructions({ amount, paymentId, reference, submittedAt, onSubmitted }: Props) {
  const { data: s, loading } = usePaySettings()
  const [ref, setRef] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [sent, setSent] = useState(false)

  const hasWallet = !!s?.pay_wallet_number
  const hasInsta = !!s?.pay_instapay
  const done = sent || !!submittedAt

  const submit = async () => {
    if (!paymentId) return
    setBusy(true); setErr(null)
    try {
      await api.submitPaymentReference(paymentId, ref)
      setSent(true); onSubmitted?.()
    } catch (e) { setErr(api.friendlyError(e)) } finally { setBusy(false) }
  }

  if (loading) return <div style={box} aria-busy="true">بنجهّز بيانات التحويل…</div>

  return (
    <div style={box}>
      <div style={{ fontWeight: 'var(--weight-semibold)', color: 'var(--text-title)', marginBottom: 'var(--space-3)' }}>
        حوّل <span style={{ fontFamily: 'var(--font-mono)' }}>{amount}</span> ج.م على:
      </div>
      {!hasWallet && !hasInsta && (
        <p style={{ fontSize: 'var(--size-body-sm)', color: 'var(--text-muted)' }}>
          بيانات التحويل هتوصلك من المستشار بعد تأكيد الحجز. تقدر كمان تدفع كاش وقت الجلسة.
        </p>
      )}
      {hasWallet && <CopyRow label={s?.pay_wallet_name || 'المحفظة'} value={s!.pay_wallet_number} />}
      {hasInsta && <CopyRow label="إنستا باي" value={s!.pay_instapay} />}
      {s?.pay_note && <p style={{ fontSize: 'var(--size-body-sm)', color: 'var(--text-muted)', margin: 'var(--space-4) 0 0' }}>{s.pay_note}</p>}

      {paymentId && (
        <div style={{ marginTop: 'var(--space-6)', paddingTop: 'var(--space-6)', borderTop: '1px solid var(--border-subtle)' }}>
          {done ? (
            <div role="status" style={{ display: 'flex', gap: 8, alignItems: 'center', color: 'var(--status-success-fg)', fontWeight: 'var(--weight-medium)' }}>
              <Icon name="check-circle" size={18} />
              سجّلنا رقم العملية{reference ? ` (${reference})` : ''}. هنراجع التحويل ونأكّد الدفع، وهيجيلك إشعار.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
              <Input label="رقم العملية بعد التحويل" placeholder="مثال: 123456789" value={ref}
                onChange={(e) => setRef(e.target.value)} maxLength={60} dir="ltr" />
              {err && <div role="alert" style={{ fontSize: 'var(--size-body-sm)', color: 'var(--status-danger-fg)' }}>{err}</div>}
              <div><Button loading={busy} disabled={ref.trim().length < 3} onClick={submit}>أكّد إني حوّلت</Button></div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
