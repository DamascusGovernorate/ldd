import Image from "next/image";
import { projects } from "../../../lib/projects";
import Reveal from "../../components/ui/Reveal";

export const metadata = {
  title: "المشاريع",
  description: "استعرض جميع المشاريع التي تنفذها مديرية التنمية المحلية في محافظة دمشق.",
};

export default function ProjectsPage() {
  return (
    <div className="bg-stone">
      <section className="relative py-24 md:py-32 bg-teal-deep overflow-hidden">
        <div className="pattern-khatam bg-[length:64px_64px] absolute inset-0 opacity-[0.08]" />
        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <span className="font-display text-gold-soft text-sm tracking-[0.3em]">ما ننجزه</span>
          <div className="w-16 h-[2px] bg-gold my-5 mx-auto" />
          <h1 className="font-display text-4xl md:text-5xl text-white">المشاريع</h1>
          <p className="mt-6 text-white/75 leading-loose">
            مشاريع تنموية نديرها بالشراكة مع مجتمعات دمشق لإحداث أثر مستدام وملموس.
          </p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="grid gap-10">
          {projects.map((p, i) => (
            <Reveal key={p.slug} delay={i * 100}>
              <div className="grid md:grid-cols-2 border border-ink/10 bg-white/40">
                <div className="relative aspect-[16/10] md:aspect-auto">
                  <Image src={p.image} alt={p.name} fill className="object-cover" />
                  <span className="absolute top-4 start-4 px-3 py-1 text-xs font-medium bg-gold text-ink">
                    {p.status}
                  </span>
                </div>
                <div className="p-8 md:p-10 flex flex-col justify-center">
                  <span className="text-teal text-sm tracking-widest">{p.category}</span>
                  <h2 className="font-display text-2xl md:text-3xl text-ink mt-3">{p.name}</h2>
                  <p className="mt-4 text-ink/70 leading-loose">{p.description}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>
    </div>
  );
}