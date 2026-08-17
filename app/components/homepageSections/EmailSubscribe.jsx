"use client";
import { useState } from "react";

export default function EmailSubscribe() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");
    try {
      // TODO: wire this up to your real subscribe endpoint
      await new Promise((res) => setTimeout(res, 900));
      setStatus("success");
      setEmail("");
    } catch {
      setStatus("error");
    }
  };

  return (
    <section className="relative bg-ink py-16 md:py-20 overflow-hidden">
      <div className="pattern-khatam bg-[length:64px_64px] absolute inset-0 opacity-[0.05]" />
      <div className="relative max-w-3xl mx-auto px-6 text-center">
        <span className="font-display text-gold-soft text-2xl tracking-[0.3em]">ابقَ على اطلاع</span>
        <div className="w-16 h-[2px] bg-gold my-4 mx-auto" />
        <h2 className="font-display text-2xl md:text-3xl text-white">
          اشترك ليصلك جديد المشاريع والمبادرات
        </h2>

        <form onSubmit={handleSubmit} className="mt-8 flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="بريدك الإلكتروني"
            className="flex-1 px-5 py-3 bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:outline-none focus:border-gold transition-colors"
          />
          <button
            type="submit"
            disabled={status === "loading"}
            className="px-7 py-3 bg-gold text-ink font-medium hover:bg-gold-soft transition-colors duration-300 disabled:opacity-60"
          >
            {status === "loading" ? "جارِ الإرسال..." : "اشترك"}
          </button>
        </form>

        {status === "success" && <p className="mt-4 text-gold-soft text-sm">تم اشتراكك بنجاح، شكراً لك!</p>}
        {status === "error" && <p className="mt-4 text-red-300 text-sm">حدث خطأ، حاول مرة أخرى.</p>}
      </div>
    </section>
  );
}