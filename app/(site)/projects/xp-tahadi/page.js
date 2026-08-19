import Image from "next/image";
import Link from "next/link";
import Reveal from "@/app/components/ui/Reveal";
import Button from "@/app/components/ui/Button";

export const metadata = {
  title: "تحدي XP",
  description:
    "تحدي XP يكتشف ويدعم المواهب الريادية الشابة في محافظة دمشق من خلال مسار تدريبي مكثف يجمع بين التعليم العملي والإرشاد الفردي.",
};

const timeline = [
  { step: "01", title: "التسجيل والفرز", desc: "تقديم الطلبات ومراجعة الأفكار الريادية الأولية من المتقدمين." },
  { step: "02", title: "المسار التدريبي", desc: "ورشات عملية في بناء نماذج الأعمال والتسويق والتمويل، مع إرشاد فردي مباشر." },
  { step: "03", title: "عرض المشاريع", desc: "تقديم الأفكار المطوَّرة أمام لجنة من الخبراء والمستثمرين." },
  { step: "04", title: "التمويل والانطلاق", desc: "تمويل أفضل الأفكار وتحويلها إلى مشاريع فعلية على أرض الواقع." },
];

const highlights = [
  { label: "مسار تدريبي", value: "8 أسابيع" },
  { label: "مجال التركيز", value: "ريادة الأعمال" },
  { label: "الفئة المستهدفة", value: "شباب دمشق" },
  { label: "التمويل", value: "لأفضل الأفكار" },
];

export default function XpTahadiPage() {
  return (
    <div className="bg-stone">
      {/* Hero */}
      <section className="relative min-h-[70vh] flex items-end overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/projects/xp-tahadi.jpg"
            alt="تحدي XP"
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/50 to-ink/20" />
        </div>
        <div className="pattern-khatam bg-[length:64px_64px] absolute inset-0 opacity-[0.1] mix-blend-overlay" />

        <div className="relative z-10 max-w-5xl mx-auto px-6 md:px-12 pb-16 md:pb-24">
          <span className="font-display text-gold-soft text-sm tracking-[0.3em]">تمكين اقتصادي وريادة أعمال</span>
          <div className="w-16 h-[2px] bg-gold my-5" />
          <h1 className="font-display text-5xl md:text-7xl text-white leading-tight">تحدي XP</h1>
          <p className="mt-6 text-white/80 text-lg max-w-xl leading-loose">
            اكتشاف ودعم المواهب الريادية الشابة في محافظة دمشق
          </p>
        </div>
      </section>

      {/* Stats strip */}
      <section className="bg-teal-deep py-8">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4">
          {highlights.map((h, i) => (
            <div key={h.label} className={`text-center px-4 py-2 ${i !== highlights.length - 1 ? "md:border-e md:border-white/10" : ""}`}>
              <p className="font-display text-gold-soft text-lg">{h.value}</p>
              <p className="text-white/50 text-xs mt-1">{h.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* About */}
      <section className="max-w-4xl mx-auto px-6 py-16 md:py-24">
        <Reveal>
          <span className="font-display text-gold text-sm tracking-[0.3em]">عن التحدي</span>
          <div className="w-16 h-[2px] bg-gold my-5" />
          <h2 className="font-display text-3xl text-ink mb-6">من فكرة إلى مشروع حقيقي</h2>
          <p className="text-ink/70 leading-loose text-lg">
            يهدف تحدي XP إلى اكتشاف ودعم المواهب الريادية الشابة في محافظة دمشق، من خلال مسار
            تدريبي مكثف يجمع بين التعليم العملي والإرشاد الفردي وورشات بناء نماذج الأعمال، تتوّج
            بعرض المشاريع أمام لجنة من الخبراء وتمويل أفضل الأفكار لتحويلها إلى مشاريع حقيقية على
            أرض الواقع.
          </p>
        </Reveal>
      </section>

      {/* Timeline */}
      <section className="bg-white/40 py-16 md:py-24">
        <div className="max-w-5xl mx-auto px-6">
          <Reveal className="text-center mb-14">
            <span className="font-display text-gold text-sm tracking-[0.3em]">رحلة المتحدي</span>
            <div className="w-16 h-[2px] bg-gold my-4 mx-auto" />
            <h2 className="font-display text-3xl text-ink">مراحل التحدي</h2>
          </Reveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {timeline.map((t, i) => (
              <Reveal key={t.step} delay={i * 100}>
                <div className="p-6 h-full bg-stone border-t-2 border-gold">
                  <span className="font-display text-4xl text-gold-soft">{t.step}</span>
                  <h3 className="font-display text-lg text-ink mt-4 mb-2">{t.title}</h3>
                  <p className="text-sm text-ink/60 leading-relaxed">{t.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-6 py-16 md:py-24">
        <Reveal className="p-8 md:p-12 bg-teal-deep relative overflow-hidden text-center">
          <div className="pattern-khatam bg-[length:64px_64px] absolute inset-0 opacity-[0.08]" />
          <div className="relative">
            <span className="font-display text-gold-soft text-sm tracking-[0.3em]">انضم إلى التحدي</span>
            <div className="w-16 h-[2px] bg-gold my-5 mx-auto" />
            <h3 className="font-display text-3xl text-white mb-4">هل لديك فكرة ريادية؟</h3>
            <p className="text-white/70 mb-8 max-w-md mx-auto leading-loose">
              سجّل الآن، أكمل ملفك الشخصي، وقدّم طلب انضمامك إلى تحدي XP مباشرة من لوحة التحكم.
            </p>
            <Button href="/signup?next=/dashboard/volunteer" variant="outlineLight">سجّل الآن</Button>
            <p className="text-white/50 text-sm mt-5">
              لديك حساب بالفعل؟ <Link href="/login" className="text-gold-soft hover:text-gold transition-colors">سجّل الدخول</Link>
            </p>
          </div>
        </Reveal>
      </section>
    </div>
  );
}