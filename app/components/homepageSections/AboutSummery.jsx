"use client";
import Image from "next/image";
import Reveal from "../ui/Reveal";
import Button from "../ui/Button";

export default function AboutSummery() {
  return (
    <section className="relative bg-stone py-20 md:py-28 overflow-hidden">
      <div className="pattern-khatam bg-[length:64px_64px] absolute inset-0 opacity-[0.05]" />
      <div className="relative max-w-7xl mx-auto px-6 md:px-12 grid md:grid-cols-2 gap-14 items-center">
        <Reveal className="order-2 md:order-1">
          <span className="font-display text-gold text-2xl tracking-[0.3em]">من نحن</span>
          <div className="w-16 h-[2px] bg-gold my-5" />
          <h2 className="font-display text-3xl md:text-4xl text-ink leading-snug">
            مديرية التنمية المحلية
            <br />
            محافظة دمشق
          </h2>
          <p className="mt-6 text-ink/70 leading-loose max-w-lg">
            نعمل على تعزيز التنمية المستدامة في العاصمة دمشق من خلال مشاريع
            ومبادرات مجتمعية تشرك المواطنين والمتطوعين في بناء مستقبل أفضل
            لأحيائهم، بالشراكة مع الجهات المحلية والدولية.
          </p>
          <div className="mt-8">
            <Button href="/about" variant="outline">تعرف علينا أكثر</Button>
          </div>
        </Reveal>

        <Reveal delay={150} className="order-1 md:order-2">
          <div className="relative aspect-[8/5] w-full max-w-md mx-auto">
            <svg
              viewBox="0 0 100 100"
              className="absolute -inset-4 w-[calc(100%+2rem)] h-[calc(100%+2rem)] text-gold-soft/40 -z-10"
            >
              <rect x="10" y="10" width="80" height="80" fill="none" stroke="currentColor" strokeWidth="0.6" />
              <rect
                x="10" y="10" width="80" height="80"
                fill="none" stroke="currentColor" strokeWidth="0.6"
                transform="rotate(45 50 50)"
              />
            </svg>
            <Image
              src="/about-image.jpg"
              alt="مديرية التنمية المحلية - محافظة دمشق"
              fill
              className=""
            />
          </div>
        </Reveal>
      </div>
    </section>
  );
}