"use client";
import { useEffect, useRef, useState } from "react";

const stats = [
  { label: "مبادرات مجتمعية", value: 42, suffix: "+" },
  { label: "مستفيدون", value: 15000, suffix: "+" },
  { label: "متطوعون", value: 800, suffix: "+" },
  { label: "مشاريع مكتملة", value: 27, suffix: "+" },
];

function Counter({ value, suffix, duration = 1800 }) {
  const ref = useRef(null);
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) {
          setStarted(true);
          const start = performance.now();
          const tick = (now) => {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * value));
            if (progress < 1) requestAnimationFrame(tick);
            else setCount(value);
          };
          requestAnimationFrame(tick);
          observer.unobserve(el);
        }
      },
      { threshold: 0.4 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [value, duration, started]);

  return (
    <span ref={ref} className="font-display text-5xl md:text-6xl text-gold">
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

export default function InfluenceStatistics() {
  return (
    <section className="relative bg-ink py-20 md:py-28 overflow-hidden">
      <div className="pattern-khatam bg-[length:64px_64px] absolute inset-0 opacity-[0.06]" />
      <div className="relative max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="font-display text-gold-soft text-2xl tracking-[0.3em]">أثرنا بالأرقام</span>
          <div className="w-16 h-[2px] bg-gold my-4 mx-auto" />
          <h2 className="font-display text-3xl md:text-4xl text-white">التنمية المحلية في دمشق</h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4">
          {stats.map((s, i) => (
            <div
              key={s.label}
              className={`flex flex-col items-center text-center px-4 py-6 ${
                i !== stats.length - 1 ? "md:border-e md:border-white/10" : ""
              }`}
            >
              <Counter value={s.value} suffix={s.suffix} />
              <span className="mt-3 text-white/60 text-sm tracking-wide">{s.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}