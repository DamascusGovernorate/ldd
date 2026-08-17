"use client";
import Image from "next/image";
import Reveal from "../ui/Reveal";
import Button from "../ui/Button";

export default function JoinUs() {
  return (
    <section className="relative bg-teal-deep overflow-hidden">
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 items-stretch">
        <Reveal className="order-2 md:order-1 flex flex-col justify-center px-6 md:px-16 py-20 md:py-28">
          <span className="font-display text-gold-soft text-2xl tracking-[0.3em]">كن جزءاً من التغيير</span>
          <div className="w-16 h-[2px] bg-gold my-5" />
          <h2 className="font-display text-3xl md:text-4xl text-white leading-snug">
            انضم إلينا
            <br />
            كمتطوع في دمشق
          </h2>
          <p className="mt-6 text-white/75 leading-loose max-w-md">
            فريقنا من المتطوعين هو القلب النابض لكل مشروع ننفذه. شارك وقتك
            ومهاراتك وكن جزءاً من قصص النجاح التي تبنيها دمشق يوماً بعد يوم.
          </p>
          <div className="mt-8">
            <Button href="/volunteers" variant="outlineLight">سجّل كمتطوع الآن</Button>
          </div>
        </Reveal>

        <Reveal delay={150} className="order-1 md:order-2 relative min-h-[320px] md:min-h-0">
          <Image
            src="/join-us.jpg"
            alt="متطوعون في مديرية التنمية المحلية"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-l from-teal-deep/70 via-teal-deep/10 to-transparent" />
        </Reveal>
      </div>
    </section>
  );
}