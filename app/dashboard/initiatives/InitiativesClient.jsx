"use client";
import { useState } from "react";
import Link from "next/link";

const STATUS_LABELS = { pending: "قيد المراجعة", accepted: "مقبولة", rejected: "مرفوضة" };
const STATUS_STYLES = { pending: "bg-gold/10 text-gold", accepted: "bg-teal/10 text-teal", rejected: "bg-red-100 text-red-600" };
const inputClasses = "w-full px-4 py-3 bg-stone border border-ink/15 focus:outline-none focus:border-gold transition-colors placeholder:text-ink/40";

export default function InitiativesClient({ initial, isAdmin, canSubmit }) {
  const [initiatives, setInitiatives] = useState(initial);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", description: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [reviewing, setReviewing] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/initiatives", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setInitiatives((prev) => [{ id: `temp-${Date.now()}`, title: form.title, description: form.description, status: "pending", createdBy: "أنت", createdAt: new Date().toISOString() }, ...prev]);
      setForm({ title: "", description: "" });
      setShowForm(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReview = async (id, status) => {
    setReviewing(id);
    try {
      const res = await fetch(`/api/initiatives/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
      if (!res.ok) throw new Error();
      setInitiatives((prev) => prev.map((i) => (i.id === id ? { ...i, status } : i)));
    } catch {
      alert("فشل تحديث المبادرة");
    } finally {
      setReviewing(null);
    }
  };

  return (
    <div>
      {!isAdmin && (
        <div className="mb-8">
          {canSubmit ? (
            <button onClick={() => setShowForm((v) => !v)} className="px-6 py-3 bg-teal text-white font-medium hover:bg-teal-deep transition-colors duration-300">
              {showForm ? "إلغاء" : "+ اقتراح مبادرة جديدة"}
            </button>
          ) : (
            <p className="text-sm text-gold bg-gold/10 p-4 border border-gold/30">
              <Link href="/dashboard/account" className="underline">أكمل ملفك الشخصي</Link> لتتمكن من اقتراح مبادرة
            </p>
          )}
          {showForm && (
            <form onSubmit={handleSubmit} className="mt-4 max-w-2xl space-y-4 p-6 bg-white/50 border border-ink/10">
              <div>
                <label className="block text-sm text-ink/70 mb-2">عنوان المبادرة</label>
                <input type="text" required value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} className={inputClasses} />
              </div>
              <div>
                <label className="block text-sm text-ink/70 mb-2">وصف المبادرة</label>
                <textarea rows={4} required value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} className={`${inputClasses} resize-none`} />
              </div>
              {error && <p className="text-red-600 text-sm">{error}</p>}
              <button type="submit" disabled={submitting} className="px-6 py-3 bg-teal text-white font-medium hover:bg-teal-deep transition-colors duration-300 disabled:opacity-60">
                {submitting ? "جارِ الإرسال..." : "إرسال للمراجعة"}
              </button>
            </form>
          )}
        </div>
      )}
      <div className="space-y-4">
        {initiatives.map((i) => (
          <div key={i.id} className="p-6 bg-white/50 border border-ink/10">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-display text-lg text-ink">{i.title}</h3>
                {isAdmin && <p className="text-xs text-ink/50 mt-1">بواسطة: {i.createdBy}</p>}
              </div>
              <span className={`text-xs px-2 py-1 shrink-0 ${STATUS_STYLES[i.status]}`}>{STATUS_LABELS[i.status]}</span>
            </div>
            <p className="text-sm text-ink/70 mt-3 leading-relaxed">{i.description}</p>
            {isAdmin && i.status === "pending" && (
              <div className="flex gap-3 mt-4">
                <button onClick={() => handleReview(i.id, "accepted")} disabled={reviewing === i.id} className="px-4 py-2 text-sm bg-teal text-white hover:bg-teal-deep transition-colors">قبول</button>
                <button onClick={() => handleReview(i.id, "rejected")} disabled={reviewing === i.id} className="px-4 py-2 text-sm border border-red-300 text-red-600 hover:bg-red-50 transition-colors">رفض</button>
              </div>
            )}
          </div>
        ))}
        {initiatives.length === 0 && <p className="text-ink/50 text-sm">لا توجد مبادرات بعد</p>}
      </div>
    </div>
  );
}