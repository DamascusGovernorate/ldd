// app/components/homepageSections/Hero.jsx
"use client";

import Image from "next/image";
import logo from "@/public/logo.png";

export default function Hero() {
  return (
    <>                      <div className="h-[calc(7rem)]" />
    <section className="relative w-full min-h-[92vh] overflow-hidden flex items-end">
      
      {/* Background photograph */}
      <div className="absolute inset-0 z-0">

        <Image
          src="/mainHero.jpg"
          alt="خلفية دمشق"
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        {/* Bottom-anchored gradient so the text block reads clearly */}
        <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/30 to-transparent" />
        {/* Khatam texture, faint, blended into the photo */}
        <div className="pattern-khatam bg-[length:64px_64px] absolute inset-0 opacity-[0.12] mix-blend-overlay" />
      </div>

      {/* Seal — the logo as a small medallion, not the focal point */}
      <div className="absolute top-8 inset-x-0 z-10 flex justify-center md:justify-start md:ps-16">
        <div className="relative w-20 h-20 md:w-24 md:h-24">
          <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full text-gold-soft/80">
            <rect x="18" y="18" width="64" height="64" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <rect
              x="18" y="18" width="64" height="64"
              fill="none" stroke="currentColor" strokeWidth="1.5"
              transform="rotate(45 50 50)"
            />
          </svg>
          <div className="absolute inset-[14px] rounded-full bg-stone/95 overflow-hidden">
            <Image
              src={logo}
              alt="شعار مديرية التنمية المحلية – محافظة دمشق"
              fill
              className="object-contain "
              priority
            />
          </div>
        </div>
      </div>

      {/* Content — bottom-anchored, editorial, no floating glass card */}
      <div className="relative z-10 w-full px-6 md:ps-16 md:pe-10 pb-16 md:pb-24">
        <div className="max-w-3xl mx-auto md:mx-0 md:me-auto text-center md:text-start">
          <span className="font-display text-gold-soft text-base md:text-4xl tracking-[0.3em]">
           مديرية التنمية المحلية 
          </span>

          <div className="w-16 h-[2px] bg-gold my-5 mx-auto md:mx-0" />

          <h1 className="font-display text-white text-4xl md:text-6xl leading-[1.15]">
            نبني مستقبل دمشق معاً
          </h1>

          <p className="mt-5 text-white/80 text-base md:text-lg font-light max-w-xl mx-auto md:mx-0">
         محافظة دمشق
          </p>

          <button
            className="mt-9 group relative inline-flex items-center overflow-hidden px-8 py-3.5 text-white font-medium border border-gold-soft/70 hover:border-gold transition-colors duration-300"
            style={{
              clipPath:
                "polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 14px 100%, 0 calc(100% - 14px))",
            }}
          >
            <span className="absolute inset-0 bg-gold/0 group-hover:bg-gold/15 transition-colors duration-300" />
            <span className="relative">اكتشف المزيد</span>
          </button>
        </div>
      </div>

      {/* Scroll cue */}
      <div className="hidden md:flex flex-col items-center gap-3 absolute bottom-10 start-16 z-10">
        <span className="text-white/60 text-xs tracking-[0.25em] [writing-mode:vertical-rl]">
          مرر للأسفل
        </span>
        <span className="w-px h-10 bg-gradient-to-b from-gold-soft to-transparent" />
      </div>
    </section>
    </>

  );
}