// Printable invoice: opens a clean page in a new window and calls print()
// (the browser's "Save as PDF" gives the client a file). Every value is escaped.

export interface InvoiceData {
  invoiceNo: string
  bookingRef: string
  clientName: string
  clientEmail: string
  service: string
  when: string
  minutes: number
  method: string
  amount: number
  paidAt: string | null
}

const esc = (v: unknown) =>
  String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!))

export function invoiceHtml(d: InvoiceData): string {
  const paid = d.paidAt ? new Date(d.paidAt).toLocaleDateString('ar-EG', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Africa/Cairo' }) : '—'
  const row = (k: string, v: string) => `<tr><th>${esc(k)}</th><td>${esc(v)}</td></tr>`
  return `<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><title>فاتورة ${esc(d.invoiceNo)}</title>
<style>
  body{font-family:Tahoma,Arial,sans-serif;color:#1d2b25;margin:0;padding:40px;max-width:720px;margin-inline:auto}
  header{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:3px solid #0A7A4F;padding-bottom:16px}
  h1{margin:0;font-size:28px;color:#0A7A4F} .no{font-family:monospace;direction:ltr;font-size:15px}
  table{width:100%;border-collapse:collapse;margin-top:24px} th,td{padding:12px 8px;border-bottom:1px solid #e3e8e5;text-align:start;font-size:15px}
  th{color:#5b6b63;font-weight:normal;width:34%} .total td,.total th{font-size:18px;font-weight:bold;color:#0A7A4F}
  .stamp{display:inline-block;margin-top:28px;border:2px solid #0A7A4F;color:#0A7A4F;padding:6px 18px;border-radius:6px;font-weight:bold}
  footer{margin-top:40px;color:#5b6b63;font-size:13px}
  @media print{body{padding:0}}
</style></head><body>
<header><div><h1>مشورة</h1><div>فاتورة دفع</div></div><div class="no">${esc(d.invoiceNo)}</div></header>
<table>
${row('اسم العميل', d.clientName)}${row('البريد الإلكتروني', d.clientEmail)}${row('رقم الحجز', d.bookingRef)}
${row('الخدمة', d.service)}${row('الميعاد', d.when)}${row('المدة', d.minutes + ' دقيقة')}
${row('طريقة الدفع', d.method)}${row('تاريخ الدفع', paid)}
<tr class="total"><th>الإجمالي المدفوع</th><td>${esc(d.amount)} ج.م</td></tr>
</table>
<div class="stamp">مدفوعة</div>
<footer>شكرًا لثقتك. للاستفسار عن الفاتورة اذكر رقمها عند التواصل معنا.</footer>
</body></html>`
}

export function printInvoice(d: InvoiceData) {
  const w = window.open('', '_blank', 'width=820,height=900')
  if (!w) return
  w.document.open()
  w.document.write(invoiceHtml(d))
  w.document.close()
  w.focus()
  setTimeout(() => w.print(), 300)
}
