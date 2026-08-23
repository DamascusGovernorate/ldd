"use client";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

const ROLES = [
  { id: null, label: "العرض الحقيقي" },
  { id: "guest", label: "زائر (غير مسجل)" },
  { id: "applicant", label: "مستخدم عادي (غير مقبول)" },
  { id: "contestant", label: "متسابق مقبول" },
  { id: "manager", label: "مسؤول مشروع" },
];

export default function RoleSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = searchParams.get("viewAs");

  const setRole = (id) => {
    router.push(id ? `${pathname}?viewAs=${id}` : pathname);
  };

  return (
    <div className="fixed bottom-4 inset-x-4 md:inset-x-auto md:end-4 z-[300] bg-ink text-white/90 shadow-2xl border border-gold-soft/30 p-4 max-w-sm md:w-72">
      <p className="text-xs text-gold-soft tracking-widest mb-3">معاينة كـ (المدير فقط)</p>
      <div className="flex flex-wrap gap-2">
        {ROLES.map((r) => {
          const active = current === r.id || (!current && r.id === null);
          return (
            <button
              key={r.label}
              onClick={() => setRole(r.id)}
              className={`px-3 py-1.5 text-xs transition-colors ${
                active ? "bg-teal text-white" : "bg-white/10 hover:bg-white/20 text-white/80"
              }`}
            >
              {r.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}