import Image from "next/image";
import { initiatives } from "../lib/initiatives";
import Reveal from "../components/ui/Reveal";

export const metadata = {
  title: "المبادرات",
  description: "مبادرات مجتمعية تنفذها مديرية التنمية المحلية بالشراكة مع أهالي دمشق.",
};

export default function InitiativesPage() {
  return (
    <div className="bg-stone">
      <section className="relative py-24 md:py-32 bg-teal-deep overflow-hidden">
        <div className="pattern-khatam bg-[length:64px_64px] absolute inset-0 opacity-[0.08]" />
        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <span className="font-display text-gold-soft text-sm tracking-[0.3em]">بمشاركة المجتمع</span>
          <div className="w-16 h-[2px] bg-gold my-5 mx-auto" />
          <h1 className="font-display text-4xl md:text-5xl text-white">المبادرات</h1>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-20 grid md:grid-cols-3 gap-8">
        {initiatives.map((it, i) => (
          <Reveal key={it.slug} delay={i * 100}>
            <div className="bg-white/40 border border-ink/10">
              <div className="relative aspect-[4/3]">
                <Image src={it.image} alt={it.title} fill className="object-cover" />
              </div>
              <div className="p-6">
                <h3 className="font-display text-xl text-ink">{it.title}</h3>
                <p className="mt-2 text-sm text-ink/60 leading-relaxed">{it.description}</p>
              </div>
            </div>
          </Reveal>
        ))}
      </section>
    </div>
  );
}