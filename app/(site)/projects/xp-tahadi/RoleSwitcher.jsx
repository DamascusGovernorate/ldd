"use client";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

const ROLES = [
  { id: null, label: "العرض الحقيقي" },
  { id: "guest", label: "زائر (غير مسجل)" },
  { id: "applicant", label: "مستخدم عادي (غير مقبول)" },
  { id: "contestant", label: "متسابق مقبول" },
  { id: "manager", label: "مسؤول مشروع" },
];

/**
 * Admin-only preview switcher.
 *
 * Rendered in normal document flow at the very end of the page instead of
 * floating over it, so it can never hide part of the game. The spacer below
 * clears the game's fixed bottom navigation on phones and tablets; from
 * 1024px the nav becomes a side rail and no clearance is needed.
 */
export default function RoleSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = searchParams.get("viewAs");

  const setRole = (id) => {
    router.push(id ? `${pathname}?viewAs=${id}` : pathname, { scroll: false });
  };

  return (
    <aside
      aria-label="معاينة الأدوار — للمدير فقط"
      className="relative z-[300] bg-ink text-white/90 border-t-2 border-gold-soft/30"
    >
      <div className="max-w-5xl mx-auto px-5 py-5">
        <div className="flex items-baseline justify-between gap-3 mb-3">
          <p className="text-xs text-gold-soft tracking-widest">معاينة كـ (المدير فقط)</p>
          <p className="text-[11px] text-white/40">لا تظهر هذه اللوحة لغير المدراء</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {ROLES.map((r) => {
            const active = current === r.id || (!current && r.id === null);
            return (
              <button
                key={r.label}
                type="button"
                onClick={() => setRole(r.id)}
                aria-pressed={active}
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

      {/* clears the fixed bottom nav on phones/tablets only */}
      <div
        aria-hidden="true"
        className="lg:hidden"
        style={{ height: "calc(76px + env(safe-area-inset-bottom))" }}
      />
    </aside>
  );
}
