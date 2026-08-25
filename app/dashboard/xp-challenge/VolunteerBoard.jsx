"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { canApplyTo, normalizeStatus, MISSION_STATUSES } from "@/lib/xpChallenge";

const TYPE_LABEL = { main: "مهمة رئيسية", side: "مهمة فرعية" };
const STATUS_LABEL = Object.fromEntries(MISSION_STATUSES.map((s) => [s.id, s.label]));
const STATUS_STYLE = { upcoming: "bg-gold/10 text-gold", active: "bg-teal/10 text-teal" };

const MY_STATE = {
  open: { label: "متاحة للتقديم", cls: "bg-gold/10 text-gold" },
  pending: { label: "طلبك قيد المراجعة", cls: "bg-gold/10 text-gold" },
  accepted: { label: "أنت مشارك", cls: "bg-teal/10 text-teal" },
  rejected: { label: "تم رفض طلبك", cls: "bg-red-50 text-red-600" },
};

function MissionCard({ mission, onChanged }) {
  const [applying, setApplying] = useState(false);
  const [error, setError] = useState("");
  const status = normalizeStatus(mission.status);
  const state = mission.myCompleted ? "accepted" : mission.myStatus;
  const canApply = canApplyTo(status) && mission.myStatus === "open";

  const apply = async () => {
    setApplying(true);
    setError("");
    try {
      const res = await fetch(`/api/missions/${mission.id}/apply`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "تعذّر إرسال الطلب");
      onChanged();
    } catch (err) {
      setError(err.message);
    } finally {
      setApplying(false);
    }
  };

  return (
    <div className="bg-white border border-ink/10">
      <div className="flex items-start gap-4 p-4">
        {mission.images?.[0] ? (
          <img src={mission.images[0]} alt="" className="w-20 h-16 object-cover shrink-0" />
        ) : (
          <div className="w-20 h-16 bg-stone shrink-0" />
        )}

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-display text-base text-ink">{mission.title}</h3>
            <span className={`text-xs px-2 py-0.5 ${mission.type === "main" ? "bg-teal/10 text-teal" : "bg-gold/10 text-gold"}`}>
              {TYPE_LABEL[mission.type]}
            </span>
            <span className={`text-xs px-2 py-0.5 ${STATUS_STYLE[status] || "bg-ink/10 text-ink/50"}`}>
              {STATUS_LABEL[status]}
            </span>
          </div>

          <p className="text-xs text-ink/50 mt-1">
            {mission.neighborhood} · {mission.xpReward} XP · {mission.acceptedCount} مشارك
          </p>

          {mission.summary && <p className="text-sm text-ink/60 mt-2">{mission.summary}</p>}

          {mission.objectives?.length > 0 && (
            <ul className="mt-3 space-y-1">
              {mission.objectives.map((o, i) => (
                <li key={i} className="text-sm text-ink/60 flex gap-2">
                  <span className="text-gold">◆</span>
                  {o}
                </li>
              ))}
            </ul>
          )}

          {mission.googleMapsUrl && (
            <a
              href={mission.googleMapsUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-block mt-3 text-xs text-teal hover:underline"
            >
              عرض الموقع على خرائط Google ←
            </a>
          )}

          <div className="flex items-center gap-3 mt-4">
            {canApply ? (
              <button
                onClick={apply}
                disabled={applying}
                className="px-5 py-2 bg-teal text-white text-sm disabled:opacity-60"
              >
                {applying ? "جارٍ الإرسال…" : "التقديم لهذه المهمة"}
              </button>
            ) : (
              <span className={`text-xs px-2.5 py-1.5 ${MY_STATE[state]?.cls || "bg-ink/10 text-ink/50"}`}>
                {mission.myCompleted
                  ? "أنجزتها"
                  : mission.myStatus === "open"
                  ? "بدأت المهمة — التقديم مغلق"
                  : MY_STATE[state]?.label}
              </span>
            )}
          </div>

          {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
        </div>
      </div>
    </div>
  );
}

export default function VolunteerBoard({ missions, neighborhood, xpPoints }) {
  const router = useRouter();
  const [filter, setFilter] = useState("all");

  const shown = missions.filter((m) => {
    if (filter === "all") return true;
    if (filter === "mine") return m.myStatus !== "open";
    if (filter === "upcoming" || filter === "active") return normalizeStatus(m.status) === filter;
    return m.type === filter;
  });

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-2xl text-ink">تحدي XP</h1>
          <p className="text-sm text-ink/50 mt-1">
            مهام حي {neighborhood} · رصيدك {xpPoints.toLocaleString("en-US")} XP
          </p>
        </div>
        <Link href="/projects/xp-tahadi" className="px-5 py-2.5 bg-gold text-ink text-sm">
          افتح الخريطة
        </Link>
      </div>

      <div className="flex flex-wrap gap-2 mb-5">
        {[
          { id: "all", label: "الكل" },
          { id: "main", label: "المهام الرئيسية" },
          { id: "side", label: "المهام الفرعية" },
          { id: "upcoming", label: "تبدأ قريباً" },
          { id: "active", label: "جارية" },
          { id: "mine", label: "مهامي" },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`px-4 py-2 text-sm transition-colors ${
              filter === f.id ? "bg-teal text-white" : "bg-white border border-ink/15 text-ink/60"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {shown.map((m) => (
          <MissionCard key={m.id} mission={m} onChanged={() => router.refresh()} />
        ))}

        {shown.length === 0 && (
          <div className="bg-white border border-ink/10 p-8 text-center">
            <p className="text-ink/60 text-sm">
              {missions.length === 0
                ? `لا توجد مهام منشورة في حي ${neighborhood} بعد.`
                : "لا مهام في هذا التصنيف."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
