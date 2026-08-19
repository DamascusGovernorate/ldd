"use client";
import Image from "next/image";
import Reveal from "../ui/Reveal";
import Button from "../ui/Button";
import { initiatives } from "../../../lib/initiatives";

export default function LatestInitiatives() {
  return (
    <section className="relative bg-stone py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-14 gap-6">
          <div>
            <span className="font-display text-gold text-2xl tracking-[0.3em]">أحدث المبادرات</span>
            <div className="w-16 h-[2px] bg-gold my-4" />
            <h2 className="font-display text-3xl md:text-4xl text-ink">مبادرات مجتمعية</h2>
          </div>
          <Button href="/initiatives" variant="outline">جميع المبادرات</Button>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {initiatives.map((it, i) => (
            <Reveal key={it.slug} delay={i * 120}>
              <div className="group overflow-hidden bg-white/40 border border-ink/10 hover:border-gold/50 transition-colors duration-500">
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image
                    src={it.image}
                    alt={it.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/70 to-transparent" />
                </div>
                <div className="p-6">
                  <h3 className="font-display text-xl text-ink">{it.title}</h3>
                  <p className="mt-2 text-sm text-ink/60 leading-relaxed">{it.description}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}