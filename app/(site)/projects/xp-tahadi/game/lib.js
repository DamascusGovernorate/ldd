"use client";

import {
  IconRecycle,
  IconPlayground,
  IconAccess,
  IconBasketball,
  IconLeaf,
  IconStar,
  IconShield,
  IconSprout,
  IconTrophy,
  IconQuestion,
  IconLock,
  IconPinSmall,
  IconUsers,
  IconCheck,
} from "./icons";

/* ==================================================================
   Everything here derives from your Mission / Project / User models.
   No invented records. The only tunable tables are LEVELS and
   BADGE_RULES at the bottom — both are thresholds over real numbers.
================================================================== */

/* ---------- mission category → colour + fallback icon ----------
   Your Mission model has no `category` field, so the category is
   inferred from the Arabic title/summary. Missions that carry an
   uploaded `icon` image show that image instead of the glyph.
   Add a `category` enum to the schema and inference is skipped. */

export const CATEGORIES = {
  recycle: { icon: IconRecycle, color: "var(--xpg-green)", edge: "var(--xpg-green-deep)" },
  parks: { icon: IconPlayground, color: "var(--xpg-orange)", edge: "var(--xpg-orange-deep)" },
  access: { icon: IconAccess, color: "var(--xpg-red)", edge: "var(--xpg-red-deep)" },
  sports: { icon: IconBasketball, color: "var(--xpg-sky)", edge: "var(--xpg-sky-deep)" },
  green: { icon: IconLeaf, color: "var(--xpg-green)", edge: "var(--xpg-green-deep)" },
  general: { icon: IconQuestion, color: "var(--xpg-sky)", edge: "var(--xpg-sky-deep)" },
  locked: { icon: IconLock, color: "var(--xpg-gray)", edge: "var(--xpg-gray-deep)" },
};

const KEYWORDS = [
  [["تدوير", "فرز", "نفاي", "قمام", "نظاف"], "recycle"],
  [["حديق", "ألعاب", "أطفال", "لعب", "متنزه"], "parks"],
  [["طريق", "للجميع", "رصيف", "وصول", "إعاق", "كرسي"], "access"],
  [["ملعب", "ملاعب", "رياض", "كرة", "سلة"], "sports"],
  [["زرع", "شجر", "أخضر", "خضراء", "نبات", "تشجير"], "green"],
];

export function categoryOf(mission) {
  if (mission?.category && CATEGORIES[mission.category]) return mission.category;
  const text = `${mission?.title || ""} ${mission?.summary || ""}`;
  for (const [words, key] of KEYWORDS) if (words.some((w) => text.includes(w))) return key;
  return "general";
}

export function categoryStyle(mission) {
  if (mission?.status === "closed") return CATEGORIES.locked;
  return CATEGORIES[categoryOf(mission)] || CATEGORIES.general;
}

/* ---------- mission state, straight from the model ---------- */

export const STATUS_LABELS = {
  closed: "مهمة مغلقة",
  completed: "أنجزتها",
  accepted: "أنت مشارك",
  pending: "طلبك قيد المراجعة",
  rejected: "تم رفض طلبك",
  open: "متاحة للانضمام",
};

/** The single label a mission shows for the signed-in user. */
export function myState(mission) {
  if (mission.myCompleted) return "completed";
  if (mission.status === "closed") return "closed";
  return mission.myStatus || "open";
}

/** Progress = accepted applicants against everyone who applied.
    Your Mission schema has no capacity field, so this reflects real
    take-up rather than a made-up target. */
export function missionProgress(mission) {
  const joined = mission.acceptedCount || 0;
  const applied = mission.applicantCount || 0;
  const done = mission.completedCount || 0;

  if (mission.status === "closed") {
    return { joined, applied, done, percent: joined ? Math.round((done / joined) * 100) : 0, mode: "done" };
  }
  return { joined, applied, done, percent: applied ? Math.round((joined / applied) * 100) : 0, mode: "joined" };
}

export function formatXP(n) {
  return Number(n || 0).toLocaleString("en-US");
}

/* ---------- player stats, computed from the real mission list ---------- */

export function playerStats(missions, users, me) {
  const completed = missions.filter((m) => m.myCompleted);
  const active = missions.filter((m) => m.myStatus === "accepted" && m.status === "open");
  const pending = missions.filter((m) => m.myStatus === "pending");
  const districts = new Set(completed.map((m) => m.neighborhood).filter(Boolean));

  const globalRank = Math.max(1, users.findIndex((u) => u.id === me.id) + 1);
  const localPeers = users.filter((u) => u.neighborhood && u.neighborhood === me.neighborhood);
  const localRank = Math.max(1, localPeers.findIndex((u) => u.id === me.id) + 1);

  return {
    completed: completed.length,
    active: active.length,
    pending: pending.length,
    districts: districts.size,
    earnedXP: completed.reduce((sum, m) => sum + (m.xpReward || 0), 0),
    globalRank,
    localRank,
    localPeers: localPeers.length,
    completedMissions: completed,
  };
}

/* ==================================================================
   TUNABLE #1 — the level ladder.
   XP comes from User.xpPoints (awarded by your PATCH /api/missions/:id
   completion flow). Only the thresholds and titles below are a design
   choice; edit them here and every screen follows.
================================================================== */

export const LEVELS = [
  { level: 1, title: "متطوع جديد", min: 0 },
  { level: 2, title: "مبادر الحي", min: 500 },
  { level: 3, title: "صانع أثر", min: 1000 },
  { level: 4, title: "قائد حي", min: 2000 },
  { level: 5, title: "بطل المدينة", min: 3500 },
];

export function levelOf(xp = 0) {
  let current = LEVELS[0];
  for (const l of LEVELS) if (xp >= l.min) current = l;
  const next = LEVELS.find((l) => l.min > current.min);
  const ceiling = next ? next.min : current.min;
  return {
    ...current,
    next: ceiling,
    isMax: !next,
    progress: next ? Math.min(100, Math.round(((xp - current.min) / (ceiling - current.min)) * 100)) : 100,
  };
}

/* ==================================================================
   TUNABLE #2 — badge thresholds.
   Each rule reads a real counter; nothing is stored or faked. Unlock
   state and progress are recomputed on every render from the DB data.
================================================================== */

export const BADGE_RULES = [
  { id: "first", label: "أول مهمة", requirement: "أنجز مهمتك الأولى", icon: IconSprout, color: "var(--xpg-green)", target: 1, read: (s) => s.completed },
  { id: "five", label: "خمس مهام", requirement: "أنجز 5 مهام", icon: IconStar, color: "var(--xpg-gold)", target: 5, read: (s) => s.completed },
  { id: "districts", label: "جوّال الأحياء", requirement: "اعمل في 3 أحياء مختلفة", icon: IconPinSmall, color: "var(--xpg-red)", target: 3, read: (s) => s.districts },
  { id: "xp", label: "ألف نقطة", requirement: "اجمع 1,000 نقطة", icon: IconShield, color: "var(--xpg-sky)", target: 1000, read: (s) => s.xp },
  { id: "podium", label: "على المنصة", requirement: "ادخل أفضل 3 في الترتيب العام", icon: IconTrophy, color: "var(--xpg-purple)", target: 1, read: (s) => (s.globalRank <= 3 ? 1 : 0) },
];

export function badges(stats, xpPoints) {
  const source = { ...stats, xp: xpPoints };
  return BADGE_RULES.map((rule) => {
    const value = rule.read(source);
    return {
      ...rule,
      value,
      unlocked: value >= rule.target,
      percent: Math.min(100, Math.round((value / rule.target) * 100)),
    };
  });
}

/* ---------- achievement feed, built from real mission activity ---------- */

export function achievementFeed(missions) {
  const feed = [];

  missions.forEach((m) => {
    if (m.myCompleted) {
      feed.push({
        id: `done-${m.id}`,
        title: m.title,
        desc: `أنجزتها في ${m.neighborhood}`,
        xp: m.xpReward,
        icon: IconCheck,
        color: "var(--xpg-green)",
        missionId: m.id,
      });
    } else if (m.myStatus === "accepted") {
      feed.push({
        id: `in-${m.id}`,
        title: m.title,
        desc: `تم قبولك — ${m.neighborhood}`,
        xp: m.xpReward,
        pendingReward: true,
        icon: IconUsers,
        color: "var(--xpg-sky)",
        missionId: m.id,
      });
    } else if (m.myStatus === "pending") {
      feed.push({
        id: `wait-${m.id}`,
        title: m.title,
        desc: `طلبك قيد المراجعة — ${m.neighborhood}`,
        xp: m.xpReward,
        pendingReward: true,
        icon: IconStar,
        color: "var(--xpg-gold)",
        missionId: m.id,
      });
    }
  });

  return feed;
}

/* ---------- sub-tasks = the objectives you already store on missions ---------- */

export function objectiveTasks(missions) {
  const tasks = [];
  missions.forEach((m) => {
    (m.objectives || []).forEach((text, i) => {
      tasks.push({
        id: `${m.id}-${i}`,
        text,
        mission: m,
        state: myState(m),
        xp: m.xpReward,
      });
    });
  });
  return tasks;
}
