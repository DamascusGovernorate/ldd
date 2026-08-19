"use client";
import { useState } from "react";

export default function PendingRequestsClient({ requests }) {
  const [items, setItems] = useState(requests);
  const [busy, setBusy] = useState(null);

  const handle = async (id, status) => {
    setBusy(id);
    try {
      const res = await fetch(`/api/volunteer-requests/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
      if (!res.ok) throw new Error();
      setItems((prev) => prev.filter((r) => r.id !== id));
    } catch {
      alert("فشل تحديث الطلب");
    } finally {
      setBusy(null);
    }
  };

  if (items.length === 0) return null;

  return (
    <div className="space-y-3">
      {items.map((r) => (
        <div key={r.id} className="flex items-center justify-between gap-4 p-4 bg-gold/10 border border-gold/30">
          <div>
            <p className="text-sm text-ink">{r.user} <span className="text-ink/50">({r.email})</span></p>
            <p className="text-xs text-ink/60 mt-1">مشروع: {r.project}</p>
          </div>
          <div className="flex gap-2 shrink-0">
            <button onClick={() => handle(r.id, "accepted")} disabled={busy === r.id} className="px-4 py-2 text-sm bg-teal text-white hover:bg-teal-deep transition-colors">قبول</button>
            <button onClick={() => handle(r.id, "rejected")} disabled={busy === r.id} className="px-4 py-2 text-sm border border-red-300 text-red-600 hover:bg-red-50 transition-colors">رفض</button>
          </div>
        </div>
      ))}
    </div>
  );
}