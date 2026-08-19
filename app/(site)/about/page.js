import Reveal from "../../components/ui/Reveal";

export const metadata = {
  title: "نبذة عنا",
  description:
    "تعرف على مديرية التنمية المحلية في محافظة دمشق، رسالتنا، رؤيتنا، وأهدافنا في خدمة التنمية المستدامة.",
};

const values = [
  { title: "الشفافية", desc: "نعمل بمعايير واضحة ومحاسبة مستمرة أمام المجتمع." },
  { title: "الشراكة المجتمعية", desc: "نشرك المواطنين والمتطوعين في كل مرحلة من مراحل العمل." },
  { title: "الاستدامة", desc: "نصمم مشاريعنا لتستمر أثرها لما بعد التنفيذ." },
  { title: "الكفاءة", desc: "نوظف الموارد بأعلى درجات الفعالية لتحقيق أثر حقيقي." },
];

export default function AboutPage() {
  return (
    <div className="bg-stone">
      <section className="relative py-24 md:py-32 bg-teal-deep overflow-hidden">
        <div className="pattern-khatam bg-[length:64px_64px] absolute inset-0 opacity-[0.08]" />
        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <span className="font-display text-gold-soft text-sm tracking-[0.3em]">مديرية التنمية المحلية</span>
          <div className="w-16 h-[2px] bg-gold my-5 mx-auto" />
          <h1 className="font-display text-4xl md:text-5xl text-white">نبذة عنا</h1>
          <p className="mt-6 text-white/75 leading-loose">
            جهة تنفيذية تابعة لمحافظة دمشق، تُعنى بتخطيط وتنفيذ مشاريع
            التنمية المحلية بالشراكة مع المجتمعات والمنظمات المحلية والدولية.
          </p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-10">
        <Reveal className="p-8 border border-ink/10 bg-white/40">
          <h3 className="font-display text-2xl text-teal mb-3">رسالتنا</h3>
          <p className="text-ink/70 leading-loose">
            تمكين مجتمعات دمشق من خلال مشاريع تنموية مستدامة، تعزز جودة الحياة
            وتفتح آفاقاً اقتصادية واجتماعية جديدة لسكان العاصمة.
          </p>
        </Reveal>
        <Reveal delay={150} className="p-8 border border-ink/10 bg-white/40">
          <h3 className="font-display text-2xl text-teal mb-3">رؤيتنا</h3>
          <p className="text-ink/70 leading-loose">
            دمشق كنموذج عربي رائد في التنمية المحلية التشاركية، حيث يكون كل
            مواطن شريكاً فاعلاً في بناء مدينته.
          </p>
        </Reveal>
      </section>

      <section className="bg-white/40 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <span className="font-display text-gold text-sm tracking-[0.3em]">ما يوجهنا</span>
            <div className="w-16 h-[2px] bg-gold my-4 mx-auto" />
            <h2 className="font-display text-3xl text-ink">قيمنا</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v, i) => (
              <Reveal key={v.title} delay={i * 100}>
                <div className="p-6 h-full border-t-2 border-gold bg-stone">
                  <h4 className="font-display text-lg text-ink mb-2">{v.title}</h4>
                  <p className="text-sm text-ink/60 leading-relaxed">{v.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}