import { Link } from 'react-router-dom'
import { expert as expertFallback } from '@/lib/data'
import { useTypes, useExpert } from '@/lib/hooks'
import { toConsultationType } from '@/lib/adapt'
import type { ConsultationType } from '@/types/data'
import '@/styles/landing.css'

export default function Landing() {
  const { data: typeRows } = useTypes()
  const { data: expertRow } = useExpert()
  const expert = expertRow
    ? { ...expertFallback, ...expertRow, bio: expertRow.bio ?? expertFallback.bio }
    : expertFallback
  const types = (typeRows ?? []).map(toConsultationType)
  const minPrice = (t: ConsultationType) =>
    Math.min(...t.durations.flatMap((d) => Object.values(d.prices) as number[]))

  return (
    <div className="landing">
      <header className="header wrap">
        <Link to="/" className="brand">
          <span className="brand-ar">مشورة</span>
          <span className="brand-lt">MASHURA</span>
        </Link>
        <nav className="nav">
          <a href="#" className="active">الرئيسية</a>
          <a href="#types">الاستشارات</a>
          <a href="#how">إزاي بيشتغل</a>
          <a href="#faq">أسئلة شائعة</a>
        </nav>
        <Link to="/login" className="btn btn-secondary btn-sm">دخول</Link>
        <Link to="/signup" className="btn btn-primary btn-sm">اعمل حساب</Link>
      </header>

      <section className="hero wrap">
        <div className="hero-grid">
          <div>
            <span className="overline">حجز مشورة بيزنس ومشاريع</span>
            <h1>مشورة واضحة من غير لفّ ودوران</h1>
            <p className="lede">احجز استشارة مع {expert.name} في دقيقة. اختار فيديو أو مكالمة صوتية، حدّد الميعاد المناسب، وادفع أونلاين. ما فيش اشتراكات ولا مقدمات — سؤال ورد واضح.</p>
            <div className="cta">
              <Link to="/app" className="btn btn-primary btn-lg">احجز مشورة</Link>
              <a href="#types" className="btn btn-secondary btn-lg">شوف الاستشارات</a>
            </div>
            <div className="stats">
              <div><div className="stat-v">{expert.years}</div><div className="stat-l">سنة خبرة</div></div>
              <div><div className="stat-v">{expert.sessions}</div><div className="stat-l">جلسة</div></div>
              <div><div className="stat-v">{expert.rating}</div><div className="stat-l">تقييم العملاء</div></div>
            </div>
          </div>
          <div className="card card-lg expert">
            <span className="avatar">{expert.name[0]}</span>
            <h3>{expert.name}</h3>
            <p className="role">{expert.title}</p>
            <p className="bio">{expert.bio}</p>
          </div>
        </div>
      </section>

      <section id="types" className="wrap">
        <div className="section-head">
          <h2>أنواع الاستشارات</h2>
          <span className="meta">{types.length} أنواع متاحة</span>
        </div>
        <div className="types-grid">
          {types.map((t) => (
            <Link key={t.id} to={`/app?type=${t.id}`} className="card type" style={{ textDecoration: 'none' }}>
              <span className="badge">{t.category}</span>
              <h3>{t.title}</h3>
              <p className="blurb">{t.blurb}</p>
              <div className="meta-row">
                <span className="dur">فيديو / صوت</span>
                <span className="price">من {minPrice(t)} ج.م</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section id="how" className="how">
        <div className="wrap">
          <div className="section-head"><h2>إزاي بيشتغل</h2><span className="meta">3 خطوات، دقيقتين</span></div>
          <div className="how-grid">
            <div className="step"><div className="step-num">1</div><h3>اختار نوع الاستشارة</h3><p>كل نوع له مدة وسعر واضحين من الأول، من غير مفاجآت.</p></div>
            <div className="step"><div className="step-num">2</div><h3>حدّد فيديو أو صوت + الميعاد</h3><p>شوف المواعيد المفتوحة واختار اللي يناسبك.</p></div>
            <div className="step"><div className="step-num">3</div><h3>ادفع وأكّد</h3><p>الدفع أونلاين بكارت أو محفظة موبايل. التفاصيل توصلك فورًا.</p></div>
          </div>
        </div>
      </section>

      <section className="wrap">
        <div className="testimonial">
          <blockquote>"حجزت مشورة تسعير قبل ما أطلق باقتي الجديدة. في نص ساعة أحمد ساعدني أوقف عن التقليل من نفسي وأحدد سعر يعكس القيمة الحقيقية."</blockquote>
          <cite>— منة حسن، مؤسسة استوديو تصميم</cite>
        </div>
      </section>

      <section id="faq" className="wrap">
        <div className="faq">
          <h2 style={{ fontSize: 'var(--size-h2)', marginBottom: 16 }}>أسئلة شائعة</h2>
          <details open><summary>لو ما لقيتش ميعاد يناسبني؟</summary><p>تقدر تفعّل التنبيهات من حسابك وأول ما ميعاد جديد يفتح هنبعتلك رسالة على الواتساب.</p></details>
          <details><summary>أقدر ألغي الحجز؟</summary><p>أيوه — الإلغاء قبل الميعاد بـ٢٤ ساعة بيرجّع المبلغ كامل تلقائيًا.</p></details>
          <details><summary>الفرق بين فيديو وصوت؟</summary><p>فيديو أوضح لو محتاج تعرض شاشة أو ملفات. الصوت أخف على النت وأسرع في التجهيز.</p></details>
          <details><summary>هل بتشتغل مع كل أنواع البيزنس؟</summary><p>الأنواع الحالية بتغطي التأسيس والتسعير والنمو والتمويل. لو موضوعك مختلف، اختار "مراجعة سريعة" وقول موضوعك واحنا نرشّحلك.</p></details>
        </div>
      </section>

      <section className="cta-band">
        <div className="wrap">
          <h2>جاهز تبدأ؟</h2>
          <p>احجز أول مشورة في أقل من دقيقتين.</p>
          <Link to="/app" className="btn btn-accent btn-lg">احجز مشورة</Link>
        </div>
      </section>

      <footer className="footer">
        <div className="wrap">
          <div className="brand"><span className="brand-ar">مشورة</span><span style={{ fontSize: 'var(--size-caption)', color: 'var(--pine-200)' }}>مشورة واضحة من غير لفّ ودوران</span></div>
          <div className="meta"><span>{expert.name}</span><span>·</span><span>{expert.title}</span></div>
        </div>
      </footer>
    </div>
  )
}
