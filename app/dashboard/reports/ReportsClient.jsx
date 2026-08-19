"use client";
import { useState } from "react";

const STATUS_LABELS = { open: "قيد الانتظار", reviewed: "تمت المراجعة", closed: "مغلق" };
const STATUS_STYLES = { open: "bg-gold/10 text-gold", reviewed: "bg-teal/10 text-teal", closed: "bg-ink/10 text-ink/50" };
const inputClasses = "w-full px-4 py-3 bg-stone border border-ink/15 focus:outline-none focus:border-gold transition-colors placeholder:text-ink/40";

export default function ReportsClient({ initial, isAdmin }) {
  const [reports, setReports] = useState(initial);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ subject: "", message: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [updating, setUpdating] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/reports", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setReports((prev) => [{ id: `temp-${Date.now()}`, ...form, status: "open", user: "أنت", createdAt: new Date().toISOString() }, ...prev]);
      setForm({ subject: "", message: "" });
      setShowForm(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const updateStatus = async (id, status) => {
    setUpdating(id);
    try {
      const res = await fetch(`/api/reports/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
      if (!res.ok) throw new Error();
      setReports((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
    } catch {
      alert("فشل التحديث");
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div>
      {!isAdmin && (
        <div className="mb-8">
          <button onClick={() => setShowForm((v) => !v)} className="px-6 py-3 bg-teal text-white font-medium hover:bg-teal-deep transition-colors duration-300">
            {showForm ? "إلغاء" : "+ تقديم بلاغ جديد"}
          </button>
          {showForm && (
            <form onSubmit={handleSubmit} className="mt-4 max-w-2xl space-y-4 p-6 bg-white/50 border border-ink/10">
              <div>
                <label className="block text-sm text-ink/70 mb-2">الموضوع</label>
                <input type="text" required value={form.subject} onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))} className={inputClasses} />
              </div>
              <div>
                <label className="block text-sm text-ink/70 mb-2">تفاصيل البلاغ</label>
                <textarea rows={4} required value={form.message} onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))} className={`${inputClasses} resize-none`} />
              </div>
              {error && <p className="text-red-600 text-sm">{error}</p>}
              <button type="submit" disabled={submitting} className="px-6 py-3 bg-teal text-white font-medium hover:bg-teal-deep transition-colors duration-300 disabled:opacity-60">
                {submitting ? "جارِ الإرسال..." : "إرسال البلاغ"}
              </button>
            </form>
          )}
        </div>
      )}
      <div className="space-y-4">
        {reports.map((r) => (
          <div key={r.id} className="p-6 bg-white/50 border border-ink/10">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-display text-lg text-ink">{r.subject}</h3>
                {isAdmin && <p className="text-xs text-ink/50 mt-1">من: {r.user} ({r.email})</p>}
              </div>
              {isAdmin ? (
                <select value={r.status} disabled={updating === r.id} onChange={(e) => updateStatus(r.id, e.target.value)} className="text-xs px-2 py-1.5 bg-stone border border-ink/15">
                  {Object.entries(STATUS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              ) : (
                <span className={`text-xs px-2 py-1 shrink-0 ${STATUS_STYLES[r.status]}`}>{STATUS_LABELS[r.status]}</span>
              )}
            </div>
            <p className="text-sm text-ink/70 mt-3 leading-relaxed">{r.message}</p>
          </div>
        ))}
        {reports.length === 0 && <p className="text-ink/50 text-sm">لا توجد بلاغات</p>}
      </div>
    </div>
  );
}