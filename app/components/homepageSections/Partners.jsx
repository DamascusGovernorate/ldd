import Image from "next/image";
import { partners } from "../../../lib/partners";

export default function Partners() {
  const track = [...partners, ...partners];
  return (
    <section className="bg-stone py-16 md:py-20 border-y border-ink/10">
      <div className="max-w-7xl mx-auto px-6 md:px-12 text-center mb-10">
        <span className="font-display text-gold text-2xl tracking-[0.3em]">شركاؤنا</span>
      </div>

      <div className="relative overflow-hidden">
        <div className="flex w-max animate-[marquee_30s_linear_infinite] gap-16 items-center">
          {track.map((p, i) => (
            <div
              key={`${p.name}-${i}`}
              className="relative w-32 h-16 shrink-0 opacity-60 hover:opacity-100 transition-opacity duration-300 grayscale hover:grayscale-0"
            >
              <Image src={p.logo} alt={p.name} fill className="object-contain" />
            </div>
          ))}
        </div>
        <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-stone to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-stone to-transparent" />
      </div>
    </section>
  );
}