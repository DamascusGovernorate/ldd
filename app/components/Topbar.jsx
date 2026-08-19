"use client";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { IoPersonCircleOutline, IoLogOutOutline } from "react-icons/io5";
import NotificationBell from "../../components/NotificationBell";

const ROLE_LABELS = { admin: "مدير", user: "مستخدم", news_reporter: "محرر أخبار" };

export default function Topbar({ name, role, avatar }) {
  const router = useRouter();
  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  return (
    <header className="h-16 bg-white border-b border-ink/10 flex items-center justify-between px-6 md:px-10">
      <div className="ms-10 md:ms-0">
        <p className="text-sm text-ink">{name}</p>
        <span className="text-xs text-gold">{ROLE_LABELS[role] || role}</span>
      </div>
      <div className="flex items-center gap-4">
        <NotificationBell />
        <div className="relative w-9 h-9 rounded-full overflow-hidden border border-gold-soft/50">
          {avatar ? <Image src={avatar} alt={name} fill className="object-cover" /> : <IoPersonCircleOutline size={36} className="text-ink/30" />}
        </div>
        <button onClick={handleLogout} className="text-ink/60 hover:text-red-600 transition-colors" aria-label="تسجيل الخروج">
          <IoLogOutOutline size={20} />
        </button>
      </div>
    </header>
  );
}