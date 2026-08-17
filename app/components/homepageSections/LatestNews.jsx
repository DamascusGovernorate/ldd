"use client";
import Image from "next/image";
import Reveal from "../ui/Reveal";
import Button from "../ui/Button";
import { news } from "../../lib/news";

const formatDate = (d) =>
  new Date(d).toLocaleDateString("ar-SY", { year: "numeric", month: "long", day: "numeric" });

export default function LatestNews() {
  return (
    <section className="relative bg-white/40 py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-14 gap-6">
          <div>
            <span className="font-display text-gold text-2xl tracking-[0.3em]">تابعنا</span>
            <div className="w-16 h-[2px] bg-gold my-4" />
            <h2 className="font-display text-3xl md:text-4xl text-ink">آخر الأخبار</h2>
          </div>
          <Button href="/news" variant="outline">جميع الأخبار</Button>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {news.slice(0, 3).map((n, i) => (
            <Reveal key={n.slug} delay={i * 120}>
              <article className="group bg-stone border border-ink/10 hover:border-gold/50 hover:-translate-y-1 transition-all duration-500">
                <div className="relative aspect-[16/10] overflow-hidden">
                  <Image
                    src={n.image}
                    alt={n.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <div className="p-6">
                  <time className="text-xs text-teal tracking-wide">{formatDate(n.date)}</time>
                  <h3 className="font-display text-lg text-ink mt-2 leading-snug">{n.title}</h3>
                  <p className="mt-3 text-sm text-ink/60 leading-relaxed">{n.excerpt}</p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}