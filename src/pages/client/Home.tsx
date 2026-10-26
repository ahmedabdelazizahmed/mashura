import { Card, Button, Icon, Badge } from '@/lib/ui'
import { expert as expertFallback } from '@/lib/data'
import { useTypes, useExpert } from '@/lib/hooks'
import { toConsultationType } from '@/lib/adapt'
import type { ConsultationType } from '@/types/data'

interface Props {
  onBook: () => void
  onPickType: (t: ConsultationType) => void
}

function StatBlock({ value, label }: { value: number | string; label: string }) {
  return (
    <div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--size-h3)', fontWeight: 'var(--weight-semibold)', color: 'var(--pine-800)' }}>{value}</div>
      <div style={{ fontSize: 'var(--size-caption)', color: 'var(--text-muted)', marginTop: 4 }}>{label}</div>
    </div>
  )
}

export default function Home({ onBook, onPickType }: Props) {
  const { data: typeRows, loading } = useTypes()
  const { data: expertRow } = useExpert()
  const expert = expertRow
    ? { ...expertFallback, ...expertRow, name: expertRow.name, title: expertRow.title, bio: expertRow.bio ?? expertFallback.bio }
    : expertFallback
  const types = (typeRows ?? []).map(toConsultationType)
  const minPrice = (t: ConsultationType) => Math.min(...t.durations.flatMap((d) => Object.values(d.prices) as number[]))

  return (
    <>
      <section style={{ maxWidth: 1160, margin: '0 auto', padding: 'var(--space-13) var(--space-8) var(--space-11)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 360px', gap: 'var(--space-11)', alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: 'var(--size-overline)', fontWeight: 'var(--weight-bold)', color: 'var(--saffron-700)' }}>حجز مشورة بيزنس ومشاريع</span>
            <h1 style={{ fontSize: 44, lineHeight: 'var(--leading-display)', marginTop: 'var(--space-6)', color: 'var(--text-title)' }}>مشورة واضحة من غير لفّ ودوران</h1>
            <p style={{ fontSize: 'var(--size-body-lg)', color: 'var(--text-muted)', marginTop: 'var(--space-6)', maxWidth: '46ch' }}>احجز استشارة مع {expert.name} في دقيقة. اختار فيديو أو مكالمة صوتية، حدّد الميعاد المناسب، وادفع أونلاين.</p>
            <div style={{ display: 'flex', gap: 'var(--space-6)', marginTop: 'var(--space-9)' }}>
              <Button size="lg" icon="calendar" onClick={onBook}>احجز مشورة</Button>
              <Button size="lg" variant="secondary" icon="briefcase">شوف الاستشارات</Button>
            </div>
            <div style={{ display: 'flex', gap: 'var(--space-10)', marginTop: 'var(--space-11)' }}>
              <StatBlock value={expert.years ?? 0} label="سنة خبرة" />
              <StatBlock value={expert.sessions} label="جلسة" />
              <StatBlock value={expert.rating} label="تقييم العملاء" />
            </div>
          </div>
          <Card padding="lg" style={{ textAlign: 'center' }}>
            <span style={{ width: 84, height: 84, borderRadius: '50%', background: 'var(--pine-700)', color: 'var(--sand-050)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 30, fontWeight: 'var(--weight-semibold)' }}>{expert.name[0]}</span>
            <h3 style={{ fontSize: 'var(--size-h3)', marginTop: 'var(--space-6)' }}>{expert.name}</h3>
            <p style={{ fontSize: 'var(--size-body-sm)', color: 'var(--text-muted)', marginTop: 4 }}>{expert.title}</p>
            <p style={{ fontSize: 'var(--size-body-sm)', color: 'var(--text-body)', marginTop: 'var(--space-6)' }}>{expert.bio}</p>
          </Card>
        </div>
      </section>

      <section style={{ maxWidth: 1160, margin: '0 auto', padding: 'var(--space-11) var(--space-8)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 'var(--space-8)' }}>
          <h2 style={{ fontSize: 'var(--size-h2)' }}>أنواع الاستشارات</h2>
          <span style={{ fontSize: 'var(--size-body-sm)', color: 'var(--text-muted)' }}>{types.length} أنواع متاحة</span>
        </div>
        {loading && types.length === 0 && (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 'var(--space-9)' }}>جاري تحميل الاستشارات...</p>
        )}
        {!loading && types.length === 0 && (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 'var(--space-9)' }}>مفيش استشارات متاحة حاليًا.</p>
        )}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 'var(--space-6)' }}>
          {types.map((t) => (
            <Card key={t.id} interactive padding="lg" onClick={() => onPickType(t)}>
              <Badge tone="neutral">{t.category}</Badge>
              <h3 style={{ fontSize: 'var(--size-h3)', marginTop: 'var(--space-5)' }}>{t.title}</h3>
              <p style={{ fontSize: 'var(--size-body-sm)', color: 'var(--text-muted)', marginTop: 'var(--space-4)' }}>{t.blurb}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'var(--space-6)', fontFamily: 'var(--font-mono)', fontSize: 'var(--size-body-sm)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-body)' }}><Icon name="video" size={15} />فيديو / صوت</span>
                <span style={{ fontWeight: 'var(--weight-semibold)', color: 'var(--saffron-700)' }}>من {minPrice(t)} ج.م</span>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section style={{ background: 'var(--sand-100)', padding: 'var(--space-11) var(--space-8)' }}>
        <div style={{ maxWidth: 1160, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 'var(--space-8)' }}>
          {[
            { icon: 'briefcase', title: 'اختار نوع الاستشارة', text: 'كل نوع له مدة وسعر واضحين من الأول.' },
            { icon: 'video', title: 'فيديو أو صوت', text: 'تختار الطريقة اللي تناسبك.' },
            { icon: 'credit-card', title: 'ادفع وأكّد', text: 'الدفع أونلاين، والتفاصيل توصلك فورًا.' },
          ].map((s, i) => (
            <div key={s.title}>
              <span style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', background: 'var(--surface-brand-soft)', color: 'var(--pine-700)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name={s.icon} size={22} />
              </span>
              <h3 style={{ fontSize: 'var(--size-h3)', marginTop: 'var(--space-6)' }}>{i + 1}. {s.title}</h3>
              <p style={{ fontSize: 'var(--size-body-sm)', color: 'var(--text-muted)', marginTop: 'var(--space-3)' }}>{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section style={{ background: 'var(--surface-inverse)', padding: 'var(--space-12) var(--space-8)', textAlign: 'center' }}>
        <h2 style={{ fontSize: 'var(--size-h1)', color: 'var(--sand-050)' }}>جاهز تبدأ؟</h2>
        <p style={{ color: 'var(--pine-200)', marginTop: 'var(--space-5)' }}>احجز أول مشورة في أقل من دقيقتين.</p>
        <Button variant="accent" size="lg" icon="calendar" style={{ marginTop: 'var(--space-8)' }} onClick={onBook}>احجز مشورة</Button>
      </section>
    </>
  )
}
