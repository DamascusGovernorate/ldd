"use client";
import { useState } from "react";
import Link from "next/link";
import { MAP_VIEWBOX_WIDTH, MAP_VIEWBOX_HEIGHT, NEIGHBORHOOD_SHAPES } from "@/lib/neighborhoodDistricts";

const TABS = [
  { id: "map", label: "الخريطة" },
  { id: "list", label: "قائمة المهام" },
  { id: "leaderboard", label: "المتصدرون" },
  { id: "awards", label: "الجوائز" },
];

const PREVIEW_LABELS = {
  contestant: "متسابق مقبول",
  manager: "مسؤول مشروع",
};

const STATUS_COLORS = {
  closed: "var(--color-ink)",
  accepted: "var(--color-teal)",
  pending: "var(--color-gold)",
  open: "var(--color-gold-soft)",
};

// Places multiple mission pins within the same neighborhood on a tight,
// non-overlapping spiral around that neighborhood's centroid, instead of
// random jitter — guarantees pins never stack no matter how many share
// a district, and each stays independently clickable.
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));
const PIN_SPACING = 34;

function layoutPinsInGroup(missionsInNeighborhood) {
  return missionsInNeighborhood.map((mission, i) => {
    const r = i === 0 ? 0 : PIN_SPACING * Math.sqrt(i);
    const theta = i * GOLDEN_ANGLE;
    return { mission, dx: r * Math.cos(theta), dy: r * Math.sin(theta) };
  });
}

function statusOf(mission, userId) {
  if (mission.status === "closed") return "closed";
  const applicant = mission.applicants?.find((a) => a.user === userId || a.user?._id === userId);
  if (!applicant) return "open";
  return applicant.status;
}

// Fixed real-world tap size (w-9 h-9 = 36px) regardless of map zoom level —
// positioned by percentage so it still tracks the underlying SVG shape
// correctly at any container width, without shrinking on small screens.
function MissionPinButton({ mission, userId, leftPct, topPct, onClick }) {
  const status = statusOf(mission, userId);
  return (
    <button
      onClick={onClick}
      style={{ left: `${leftPct}%`, top: `${topPct}%`, borderColor: STATUS_COLORS[status] }}
      title={mission.title}
      className={`absolute -translate-x-1/2 -translate-y-1/2 w-8 h-8 sm:w-9 sm:h-9 rounded-full border-[3px] bg-stone shadow-lg overflow-hidden flex items-center justify-center transition-transform hover:scale-110 ${
        status === "closed" ? "grayscale opacity-60" : ""
      }`}
    >
      {mission.icon ? (
        <img src={mission.icon} alt="" className="w-full h-full object-cover" />
      ) : (
        <span className="text-xs">📍</span>
      )}
    </button>
  );
}

function MissionModal({ mission, userId, preview, onClose, onApplied }) {
  const [applying, setApplying] = useState(false);
  const [error, setError] = useState("");
  const status = statusOf(mission, userId);

  const handleApply = async () => {
    if (preview) {
      onApplied(mission._id);
      return;
    }
    setApplying(true);
    setError("");
    try {
      const res = await fetch(`/api/missions/${mission._id}/apply`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      onApplied(mission._id);
    } catch (err) {
      setError(err.message);
    } finally {
      setApplying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] bg-ink/60 flex items-center justify-center p-3 sm:p-4" onClick={onClose}>
      <div className="bg-stone max-w-lg w-full max-h-[90vh] sm:max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        {mission.images?.[0] && (
          <div className="relative aspect-video">
            <img src={mission.images[0]} alt={mission.title} className="w-full h-full object-cover" />
          </div>
        )}
        <div className="p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-display text-lg sm:text-xl text-ink">{mission.title}</h3>
            <span className="text-xs px-2 py-1 bg-gold/10 text-gold shrink-0">{mission.xpReward} XP</span>
          </div>
          <p className="text-xs text-ink/50 mt-1">{mission.neighborhood}</p>
          <p className="text-sm text-ink/70 mt-4 leading-relaxed">{mission.summary}</p>

          {mission.objectives?.length > 0 && (
            <div className="mt-4">
              <p className="text-xs text-ink/50 mb-2">الأهداف</p>
              <ul className="space-y-1">
                {mission.objectives.map((o, i) => (
                  <li key={i} className="text-sm text-ink/70 flex items-start gap-2">
                    <span className="text-gold mt-1">◆</span>{o}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {mission.images?.length > 1 && (
            <div className="flex gap-2 mt-4 flex-wrap">
              {mission.images.slice(1).map((img, i) => <img key={i} src={img} alt="" className="w-16 h-16 object-cover" />)}
            </div>
          )}

          {mission.googleMapsUrl && (
            <a href={mission.googleMapsUrl} target="_blank" rel="noreferrer" className="inline-block mt-4 text-sm text-teal hover:text-gold transition-colors">
              عرض الموقع على خرائط Google ←
            </a>
          )}

          <div className="mt-6">
            {status === "closed" && <p className="text-sm text-ink/50">هذه المهمة مغلقة الآن.</p>}
            {status === "accepted" && <p className="text-sm text-teal">أنت مقبول في هذه المهمة.</p>}
            {status === "pending" && <p className="text-sm text-gold">طلبك قيد المراجعة.</p>}
            {status === "rejected" && <p className="text-sm text-red-500">تم رفض طلبك لهذه المهمة.</p>}
            {status === "open" && (
              <button onClick={handleApply} disabled={applying} className="w-full sm:w-auto px-6 py-3 bg-teal text-white text-sm font-medium hover:bg-teal-deep transition-colors duration-300 disabled:opacity-60">
                {applying ? "جارِ الإرسال..." : preview ? "التقديم (معاينة)" : "التقديم لهذه المهمة"}
              </button>
            )}
            {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

function MapView({ missions, userId, onSelect }) {
  const [hovered, setHovered] = useState(null);

  const groupedByNeighborhood = missions.reduce((groups, m) => {
    const key = m.neighborhood;
    (groups[key] ||= []).push(m);
    return groups;
  }, {});

  return (
    <div
      className="relative w-full bg-ink border border-white/10"
      style={{ aspectRatio: `${MAP_VIEWBOX_WIDTH} / ${MAP_VIEWBOX_HEIGHT}` }}
    >
      {/* District shapes + labels — pure SVG, scales fluidly to any width */}
      <svg
        viewBox={`0 0 ${MAP_VIEWBOX_WIDTH} ${MAP_VIEWBOX_HEIGHT}`}
        preserveAspectRatio="xMidYMid meet"
        className="absolute inset-0 w-full h-full"
      >
        {Object.entries(NEIGHBORHOOD_SHAPES).map(([name, shape]) => (
          <polygon
            key={name}
            points={shape.points.map(([x, y]) => `${x},${y}`).join(" ")}
            fill={hovered === name ? "var(--color-teal)" : "var(--color-teal-deep)"}
            stroke="var(--color-stone)"
            strokeWidth="2"
            className="transition-colors duration-200 cursor-default"
            onMouseEnter={() => setHovered(name)}
            onMouseLeave={() => setHovered((h) => (h === name ? null : h))}
          />
        ))}

        {Object.entries(NEIGHBORHOOD_SHAPES).map(([name, shape]) => (
          <text
            key={name}
            x={shape.centroid[0]}
            y={shape.centroid[1]}
            textAnchor="middle"
            dominantBaseline="central"
            className="pointer-events-none select-none"
            style={{ fontFamily: "'Almarai', sans-serif", fontWeight: hovered === name ? 800 : 700 }}
            fontSize={hovered === name ? "20" : "17"}
            fill={hovered === name ? "var(--color-gold-soft)" : "white"}
            opacity={hovered === name ? 1 : 0.9}
          >
            {name}
          </text>
        ))}
      </svg>

      {/* Mission pins — real HTML buttons, fixed tap size at every viewport width */}
      {Object.entries(groupedByNeighborhood).map(([neighborhood, group]) =>
        layoutPinsInGroup(group).map(({ mission: m, dx, dy }) => {
          const shape = NEIGHBORHOOD_SHAPES[neighborhood];
          const base = shape ? { x: shape.centroid[0], y: shape.centroid[1] } : { x: MAP_VIEWBOX_WIDTH / 2, y: MAP_VIEWBOX_HEIGHT / 2 };
          const leftPct = ((base.x + dx) / MAP_VIEWBOX_WIDTH) * 100;
          const topPct = ((base.y - 20 + dy) / MAP_VIEWBOX_HEIGHT) * 100;
          return (
            <MissionPinButton
              key={m._id}
              mission={m}
              userId={userId}
              leftPct={leftPct}
              topPct={topPct}
              onClick={() => onSelect(m)}
            />
          );
        })
      )}
    </div>
  );
}

function ListView({ missions, userId, onSelect }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {missions.map((m) => {
        const status = statusOf(m, userId);
        return (
          <button key={m._id} onClick={() => onSelect(m)} className="text-start bg-white/50 border border-ink/10 hover:border-gold/50 transition-colors duration-300">
            {m.icon && <div className="aspect-video bg-cover bg-center" style={{ backgroundImage: `url(${m.icon})` }} />}
            <div className="p-4 sm:p-5">
              <h3 className="font-display text-lg text-ink">{m.title}</h3>
              <p className="text-xs text-ink/50 mt-1">{m.neighborhood} · {m.xpReward} XP</p>
              <p className="text-sm text-ink/60 mt-2 line-clamp-2">{m.summary}</p>
              <span className={`inline-block mt-3 text-xs px-2 py-1 ${
                status === "closed" ? "bg-ink/10 text-ink/50" :
                status === "accepted" ? "bg-teal/10 text-teal" :
                status === "pending" ? "bg-gold/10 text-gold" :
                status === "rejected" ? "bg-red-100 text-red-600" : "bg-gold-soft/20 text-gold"
              }`}>
                {status === "closed" ? "مغلقة" : status === "accepted" ? "مقبول" : status === "pending" ? "قيد المراجعة" : status === "rejected" ? "مرفوض" : "متاحة للتقديم"}
              </span>
            </div>
          </button>
        );
      })}
      {missions.length === 0 && <p className="text-ink/50 text-sm">لا توجد مهمات بعد</p>}
    </div>
  );
}

function Leaderboard({ users, neighborhoods, currentUserId }) {
  const [tab, setTab] = useState("users");
  return (
    <div>
      <div className="flex gap-2 mb-6">
        <button onClick={() => setTab("users")} className={`flex-1 sm:flex-none px-4 py-2 text-sm ${tab === "users" ? "bg-teal text-white" : "bg-white/50 text-ink/60"}`}>الأعضاء</button>
        <button onClick={() => setTab("neighborhoods")} className={`flex-1 sm:flex-none px-4 py-2 text-sm ${tab === "neighborhoods" ? "bg-teal text-white" : "bg-white/50 text-ink/60"}`}>الأحياء</button>
      </div>

      {tab === "users" ? (
        <div className="bg-white/50 border border-ink/10 divide-y divide-ink/5">
          {users.map((u, i) => (
            <div key={u.id} className={`flex items-center gap-3 sm:gap-4 px-4 sm:px-5 py-3 ${u.id === currentUserId ? "bg-gold/10" : ""}`}>
              <span className="font-display text-lg text-gold w-7 sm:w-8 shrink-0">{i + 1}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-ink truncate">{u.name}</p>
                {u.neighborhood && <p className="text-xs text-ink/40">{u.neighborhood}</p>}
              </div>
              <span className="font-display text-teal shrink-0">{u.xpPoints} XP</span>
            </div>
          ))}
          {users.length === 0 && <p className="px-5 py-6 text-sm text-ink/50">لا يوجد أعضاء بعد</p>}
        </div>
      ) : (
        <div className="bg-white/50 border border-ink/10 divide-y divide-ink/5">
          {neighborhoods.map((n, i) => (
            <div key={n.neighborhood} className="flex items-center gap-3 sm:gap-4 px-4 sm:px-5 py-3">
              <span className="font-display text-lg text-gold w-7 sm:w-8 shrink-0">{i + 1}</span>
              <span className="flex-1 text-sm text-ink">{n.neighborhood}</span>
              <span className="font-display text-teal shrink-0">{n.xpPoints} XP</span>
            </div>
          ))}
          {neighborhoods.length === 0 && <p className="px-5 py-6 text-sm text-ink/50">لا توجد بيانات أحياء بعد</p>}
        </div>
      )}
    </div>
  );
}

function Awards() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="aspect-square bg-white/50 border border-ink/10 border-dashed flex flex-col items-center justify-center gap-2 sm:gap-3">
          <span className="text-2xl sm:text-3xl">🔒</span>
          <span className="text-xs sm:text-sm text-ink/40">جائزة غامضة</span>
        </div>
      ))}
    </div>
  );
}

export default function GameApp({ currentUserId, missions: initialMissions, users, neighborhoods, preview = false, previewRole, projectId }) {
  const [missions, setMissions] = useState(initialMissions);
  const [tab, setTab] = useState("map");
  const [selected, setSelected] = useState(null);

  const handleApplied = (missionId) => {
    setMissions((prev) => prev.map((m) => m._id === missionId
      ? { ...m, applicants: [...(m.applicants || []), { user: currentUserId, status: "pending" }] }
      : m));
    setSelected((prev) => prev && prev._id === missionId
      ? { ...prev, applicants: [...(prev.applicants || []), { user: currentUserId, status: "pending" }] }
      : prev);
  };

  return (
    <div className="bg-stone min-h-screen">
      {preview && (
        <div className="bg-gold text-ink text-xs sm:text-sm text-center py-2 px-3 sm:px-4 font-medium flex flex-wrap items-center justify-center gap-2">
          <span>وضع المعاينة — تعرض الصفحة كـ «{PREVIEW_LABELS[previewRole] || previewRole}»</span>
          {previewRole === "manager" && projectId && (
            <Link href={`/dashboard/projects/${projectId}/missions`} className="underline hover:no-underline">
              إدارة المهمات الفعلية من لوحة التحكم ←
            </Link>
          )}
        </div>
      )}

      <section className="bg-teal-deep py-10 md:py-14 relative overflow-hidden">
        <div className="pattern-khatam bg-[length:64px_64px] absolute inset-0 opacity-[0.08]" />
        <div className="relative max-w-6xl mx-auto px-6 text-center">
          <span className="font-display text-gold-soft text-sm tracking-[0.3em]">أهلاً بك في اللعبة</span>
          <h1 className="font-display text-2xl sm:text-3xl md:text-4xl text-white mt-3">تحدي XP</h1>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 md:py-10">
        <div className="flex flex-wrap gap-2 mb-6 md:mb-10">
          {TABS.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)} className={`px-4 sm:px-5 py-2 sm:py-2.5 text-sm font-medium transition-colors duration-300 ${tab === t.id ? "bg-teal text-white" : "bg-white/50 text-ink/60 hover:bg-white"}`}>
              {t.label}
            </button>
          ))}
        </div>

        {tab === "map" && <MapView missions={missions} userId={currentUserId} onSelect={setSelected} />}
        {tab === "list" && <ListView missions={missions} userId={currentUserId} onSelect={setSelected} />}
        {tab === "leaderboard" && <Leaderboard users={users} neighborhoods={neighborhoods} currentUserId={currentUserId} />}
        {tab === "awards" && <Awards />}
      </div>

      {selected && <MissionModal mission={selected} userId={currentUserId} preview={preview} onClose={() => setSelected(null)} onApplied={handleApplied} />}
    </div>
  );
}