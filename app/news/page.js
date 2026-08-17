import Image from "next/image";
import { news } from "../lib/news";
import Reveal from "../components/ui/Reveal";

const formatDate = (d) =>
  new Date(d).toLocaleDateString("ar-SY", { year: "numeric", month: "long", day: "numeric" });

export const metadata = {
  title: "الأخبار",
  description: "آخر أخبار مديرية التنمية المحلية في محافظة دمشق.",
};

export default function NewsPage() {
  return (
    <div className="bg-stone">
      <section className="relative py-24 md:py-32 bg-teal-deep overflow-hidden">
        <div className="pattern-khatam bg-[length:64px_64px] absolute inset-0 opacity-[0.08]" />
        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <span className="font-display text-gold-soft text-sm tracking-[0.3em]">مستجدات المديرية</span>
          <div className="w-16 h-[2px] bg-gold my-5 mx-auto" />
          <h1 className="font-display text-4xl md:text-5xl text-white">الأخبار</h1>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-20 grid md:grid-cols-3 gap-8">
        {news.map((n, i) => (
          <Reveal key={n.slug} delay={i * 100}>
            <article className="bg-white/40 border border-ink/10">
              <div className="relative aspect-[16/10]">
                <Image src={n.image} alt={n.title} fill className="object-cover" />
              </div>
              <div className="p-6">
                <time className="text-xs text-teal tracking-wide">{formatDate(n.date)}</time>
                <h2 className="font-display text-lg text-ink mt-2 leading-snug">{n.title}</h2>
                <p className="mt-3 text-sm text-ink/60 leading-relaxed">{n.excerpt}</p>
              </div>
            </article>
          </Reveal>
        ))}
      </section>
    </div>
  );
}