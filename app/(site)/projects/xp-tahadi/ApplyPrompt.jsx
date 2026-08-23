"use client";
import { useState } from "react";

export default function ApplyPrompt({ projectId, preview = false }) {
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  const handleApply = async () => {
    if (preview) {
      setStatus("sent");
      return;
    }
    setStatus("loading");
    setError("");
    try {
      const res = await fetch("/api/volunteer-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setStatus("sent");
    } catch (err) {
      setError(err.message);
      setStatus("error");
    }
  };

  return (
    <div className="min-h-[60vh] bg-stone flex items-center justify-center px-4 sm:px-6 py-12 sm:py-20">
      <div className="w-full max-w-lg text-center p-6 sm:p-10 bg-teal-deep relative overflow-hidden">
        {preview && (
          <div className="absolute top-0 inset-x-0 bg-gold text-ink text-xs text-center py-1.5 font-medium z-10">
            وضع المعاينة — لن يتم إرسال طلب فعلي
          </div>
        )}
        <div className="pattern-khatam bg-[length:64px_64px] absolute inset-0 opacity-[0.08]" />
        <div className={`relative ${preview ? "pt-6" : ""}`}>
          <span className="font-display text-gold-soft text-sm tracking-[0.3em]">تحدي XP</span>
          <div className="w-16 h-[2px] bg-gold my-5 mx-auto" />
          {status === "sent" ? (
            <>
              <h2 className="font-display text-xl sm:text-2xl text-white mb-3">تم إرسال طلبك!</h2>
              <p className="text-white/70 leading-loose">
                سيقوم فريق المشروع بمراجعة طلبك، وستصلك إشعار فور قبولك للانضمام إلى اللعبة.
              </p>
            </>
          ) : (
            <>
              <h2 className="font-display text-xl sm:text-2xl text-white mb-3">قدّم الآن لتنضم إلى اللعبة</h2>
              <p className="text-white/70 mb-8 leading-loose">
                يجب قبولك أولاً في تحدي XP قبل أن تتمكن من رؤية الخريطة والمهام. قدّم طلبك الآن.
              </p>
              <button onClick={handleApply} disabled={status === "loading"} className="w-full sm:w-auto px-8 py-3.5 bg-gold text-ink font-medium hover:bg-gold-soft transition-colors duration-300 disabled:opacity-60">
                {status === "loading" ? "جارِ الإرسال..." : "قدّم الآن"}
              </button>
              {error && <p className="text-red-200 text-sm mt-4">{error}</p>}
            </>
          )}
        </div>
      </div>
    </div>
  );
}