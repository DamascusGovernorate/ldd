"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { IoNotificationsOutline } from "react-icons/io5";

function playChime() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.4);
  } catch {}
}

export default function NotificationBell() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    fetch("/api/notifications")
      .then((res) => res.json())
      .then((data) => setCount((data.notifications || []).filter((n) => !n.read).length))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const es = new EventSource("/api/notifications/stream");
    es.onmessage = () => {
      setCount((c) => c + 1);
      playChime();
    };
    return () => es.close();
  }, []);

  return (
    <Link href="/dashboard/notifications" aria-label="الإشعارات" className="relative text-ink/70 hover:text-teal transition-colors">
      <IoNotificationsOutline size={22} />
      {count > 0 && (
        <span className="absolute -top-1.5 -end-1.5 min-w-[16px] h-4 px-1 rounded-full bg-gold text-[10px] leading-4 text-ink text-center font-bold">
          {count > 9 ? "9+" : count}
        </span>
      )}
    </Link>
  );
}