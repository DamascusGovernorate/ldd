/* ==================================================================
   SHARED — safe to import from client components.

   This module must never import a model, a DB connection, or anything
   else server-only: client components import the constants below, and
   the bundler follows every import in the file. Server-side lookups
   live in lib/xpChallengeServer.js.
================================================================== */

export const XP_PROJECT_SLUG = "xp-tahadi";

/* ==================================================================
   Mission lifecycle
================================================================== */

export const MISSION_STATUSES = [
  { id: "upcoming", label: "تبدأ قريباً", hint: "تظهر على الخريطة والتقديم مفتوح" },
  { id: "active", label: "جارية", hint: "تظهر على الخريطة والتقديم مغلق" },
  { id: "ended", label: "منتهية", hint: "لا تظهر على الخريطة ولا يراها المتطوعون" },
];

/**
 * Whether volunteers may still apply once a mission is under way.
 *
 * false — applications close the moment a mission starts, so the roster is
 *         fixed by the time the manager evaluates it.
 * true  — late joiners are allowed while a mission is active.
 *
 * Flip this one constant to change the rule everywhere.
 */
export const ALLOW_APPLY_WHILE_ACTIVE = false;

/** Legacy documents may still carry "open"/"closed". */
export function normalizeStatus(status) {
  if (status === "open") return "upcoming";
  if (status === "closed") return "ended";
  return status || "upcoming";
}

export function isVisibleToVolunteers(status) {
  return normalizeStatus(status) !== "ended";
}

export function canApplyTo(status) {
  const s = normalizeStatus(status);
  if (s === "upcoming") return true;
  if (s === "active") return ALLOW_APPLY_WHILE_ACTIVE;
  return false;
}

/* ==================================================================
   Evaluation — nine factors, each scored 0-5 when the mission ends
================================================================== */

export const EVALUATION_CRITERIA = [
  { id: "quality", label: "جودة التنفيذ" },
  { id: "impact", label: "الأثر المجتمعي" },
  { id: "volunteering", label: "المشاركة التطوعية" },
  { id: "teamwork", label: "تنظيم الفريق" },
  { id: "schedule", label: "الالتزام بالخطة والمدة" },
  { id: "safety", label: "السلامة والمسؤولية" },
  { id: "resources", label: "كفاءة استخدام الموارد" },
  { id: "sustainability", label: "الاستدامة" },
  { id: "transparency", label: "التوثيق والشفافية" },
];

export const RATING_MAX = 5;

/**
 * Validates one person's ratings. Returns { ok, average } or { ok:false, error }.
 * Every factor must be present — a half-filled form would quietly deflate
 * someone's points.
 */
export function scoreRatings(ratings) {
  if (!ratings || typeof ratings !== "object") return { ok: false, error: "التقييم مطلوب" };

  let total = 0;
  for (const c of EVALUATION_CRITERIA) {
    const v = Number(ratings[c.id]);
    if (!Number.isInteger(v) || v < 0 || v > RATING_MAX) {
      return { ok: false, error: `قيّم «${c.label}» من 0 إلى ${RATING_MAX}` };
    }
    total += v;
  }
  return { ok: true, average: total / EVALUATION_CRITERIA.length };
}

/** XP credited = the mission's value scaled by the average rating. */
export function awardFor(xpReward, average) {
  return Math.max(0, Math.round((Number(xpReward) || 0) * (average / RATING_MAX)));
}
export const MISSION_TYPES = [
  { id: "main", label: "مهمة رئيسية" },
  { id: "side", label: "مهمة فرعية" },
];

/** Mission neighborhood a given context is allowed to touch. */
export function canTouchNeighborhood(ctx, neighborhood) {
  if (!ctx?.canManage) return false;
  if (ctx.unscoped) return true;
  return Boolean(ctx.neighborhood) && ctx.neighborhood === neighborhood;
}
