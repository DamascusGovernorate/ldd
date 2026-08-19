import Reveal from "../../components/ui/Reveal";
import VolunteerForm from "../../components/forms/VolunteerForm";

export const metadata = {
  title: "المتطوعين",
  description:
    "انضم كمتطوع إلى مديرية التنمية المحلية في محافظة دمشق وكن جزءاً من مشاريعنا ومبادراتنا المجتمعية.",
};

const benefits = [
  { title: "أثر مجتمعي حقيقي", desc: "تشارك مباشرة في مشاريع تغيّر واقع أحياء دمشق." },
  { title: "شهادة تطوع معتمدة", desc: "تحصل على إفادة رسمية بساعات التطوع عند إتمامها." },
  { title: "شبكة علاقات", desc: "تتعرف على متطوعين وشركاء من خلفيات متنوعة." },
  { title: "خبرة عملية", desc: "تكتسب مهارات ميدانية وتنظيمية ضمن فرق العمل." },
];

export default function VolunteersPage() {
  return (
    <div className="bg-stone">
      <section className="relative py-24 md:py-32 bg-teal-deep overflow-hidden">
        <div className="pattern-khatam bg-[length:64px_64px] absolute inset-0 opacity-[0.08]" />
        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <span className="font-display text-gold-soft text-sm tracking-[0.3em]">كن جزءاً من التغيير</span>
          <div className="w-16 h-[2px] bg-gold my-5 mx-auto" />
          <h1 className="font-display text-4xl md:text-5xl text-white">المتطوعون</h1>
          <p className="mt-6 text-white/75 leading-loose">
            فريقنا من المتطوعين هو القلب النابض لكل مشروع ننفذه في دمشق. سجّل الآن وكن جزءاً منه.
          </p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-20 grid md:grid-cols-[1fr_1.2fr] gap-14">
        <Reveal>
          <span className="font-display text-gold text-sm tracking-[0.3em]">لماذا تتطوع معنا</span>
          <div className="w-16 h-[2px] bg-gold my-5" />
          <div className="space-y-6">
            {benefits.map((b) => (
              <div key={b.title} className="border-s-2 border-gold ps-5">
                <h3 className="font-display text-lg text-ink">{b.title}</h3>
                <p className="mt-1 text-sm text-ink/60 leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal delay={150}>
          <div className="p-8 md:p-10 bg-white/40 border border-ink/10">
            <h2 className="font-display text-2xl text-ink mb-6">استمارة التسجيل</h2>
            <VolunteerForm />
          </div>
        </Reveal>
      </section>
    </div>
  );
}