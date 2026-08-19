"use client";
import { useState } from "react";

const STATUS_LABELS = { pending: "قيد المراجعة", accepted: "مقبول", rejected: "مرفوض" };
const STATUS_STYLES = { pending: "bg-gold/10 text-gold", accepted: "bg-teal/10 text-teal", rejected: "bg-red-100 text-red-600" };

export default function VolunteerBrowser({ projects }) {
  const [items, setItems] = useState(projects);
  const [applying, setApplying] = useState(null);

  const handleApply = async (id) => {
    setApplying(id);
    try {
      const res = await fetch("/api/volunteer-requests", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ projectId: id }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setItems((prev) => prev.map((p) => (p.id === id ? { ...p, requestStatus: "pending" } : p)));
    } catch (err) {
      alert(err.message);
    } finally {
      setApplying(null);
    }
  };

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map((p) => (
        <div key={p.id} className="bg-white/50 border border-ink/10">
          {p.banner && <div className="aspect-video bg-cover bg-center" style={{ backgroundImage: `url(${p.banner})` }} />}
          <div className="p-5">
            <h3 className="font-display text-lg text-ink">{p.name}</h3>
            <p className="text-sm text-ink/60 mt-2 line-clamp-3">{p.summary}</p>
            <p className="text-xs text-ink/40 mt-2">{p.volunteerCount} متطوع</p>
            {p.requestStatus ? (
              <span className={`inline-block mt-4 text-xs px-3 py-1.5 ${STATUS_STYLES[p.requestStatus]}`}>{STATUS_LABELS[p.requestStatus]}</span>
            ) : (
              <button onClick={() => handleApply(p.id)} disabled={applying === p.id} className="mt-4 w-full py-2.5 bg-teal text-white text-sm font-medium hover:bg-teal-deep transition-colors duration-300 disabled:opacity-60">
                {applying === p.id ? "جارِ الإرسال..." : "تقديم طلب تطوع"}
              </button>
            )}
          </div>
        </div>
      ))}
      {items.length === 0 && <p className="text-ink/50 text-sm">لا توجد مشاريع نشطة حالياً</p>}
    </div>
  );
}