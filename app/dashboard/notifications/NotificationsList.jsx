"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function NotificationsList({ initial }) {
  const [items, setItems] = useState(initial);

  useEffect(() => {
    const es = new EventSource("/api/notifications/stream");
    es.onmessage = (e) => {
      const data = JSON.parse(e.data);
      setItems((prev) => [{ id: `live-${Date.now()}`, message: data.message, link: data.link, read: false, createdAt: new Date().toISOString() }, ...prev]);
    };
    return () => es.close();
  }, []);

  const markRead = async (id) => {
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    await fetch("/api/notifications", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
  };

  const markAllRead = async () => {
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    await fetch("/api/notifications", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({}) });
  };

  return (
    <div>
      {items.some((n) => !n.read) && (
        <button onClick={markAllRead} className="text-sm text-teal hover:text-gold transition-colors mb-4">تعليم الكل كمقروء</button>
      )}
      <div className="space-y-2">
        {items.length === 0 && <p className="text-ink/50 text-sm">لا توجد إشعارات بعد</p>}
        {items.map((n) => {
          const body = (
            <div className={`p-4 border transition-colors cursor-pointer ${n.read ? "bg-white/30 border-ink/10" : "bg-gold/10 border-gold/40"}`} onClick={() => !n.read && markRead(n.id)}>
              <p className="text-sm text-ink">{n.message}</p>
              <p className="text-xs text-ink/40 mt-1">{new Date(n.createdAt).toLocaleString("ar-SY")}</p>
            </div>
          );
          return n.link ? <Link key={n.id} href={n.link} className="block">{body}</Link> : <div key={n.id}>{body}</div>;
        })}
      </div>
    </div>
  );
}