"use client";
import { useMemo, useState } from "react";
import { EVALUATION_CRITERIA, RATING_MAX, awardFor } from "@/lib/xpChallenge";

/**
 * Ending a mission is the only moment XP is decided, so the manager works
 * through every accepted participant one at a time:
 *
 *   1. did they take part?  no → 0 points, next person
 *   2. if yes, score the nine factors out of five
 *
 * The award is the mission's XP value scaled by the average score.
 */
export default function EvaluationDialog({ mission, onClose, onDone }) {
  const accepted = mission.applicants.filter((a) => a.status === "accepted");
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState(() =>
    Object.fromEntries(accepted.map((a) => [a.id, { participated: null, ratings: {} }]))
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const person = accepted[index];
  const answer = person ? answers[person.id] : null;

  const setParticipated = (value) =>
    setAnswers((a) => ({ ...a, [person.id]: { ...a[person.id], participated: value } }));

  const setRating = (criterion, value) =>
    setAnswers((a) => ({
      ...a,
      [person.id]: { ...a[person.id], ratings: { ...a[person.id].ratings, [criterion]: value } },
    }));

  const averageOf = (entry) => {
    if (!entry?.participated) return 0;
    const values = EVALUATION_CRITERIA.map((c) => entry.ratings[c.id]);
    if (values.some((v) => v === undefined)) return null;
    return values.reduce((s, v) => s + v, 0) / values.length;
  };

  const currentAverage = averageOf(answer);
  const currentComplete = answer?.participated === false || currentAverage !== null;

  const allComplete = useMemo(
    () => accepted.every((a) => answers[a.id]?.participated === false || averageOf(answers[a.id]) !== null),
    [accepted, answers]
  );

  const submit = async () => {
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/missions/${mission.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "ended",
          evaluations: accepted.map((a) => ({
            user: a.id,
            participated: Boolean(answers[a.id].participated),
            ratings: answers[a.id].ratings,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "تعذّر إنهاء المهمة");
      onDone();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (!person) {
    return (
      <div className="fixed inset-0 z-[200] bg-ink/60 flex items-center justify-center p-4" onClick={onClose}>
        <div className="bg-white max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
          <h3 className="font-display text-lg text-ink mb-3">لا مشاركين مقبولين</h3>
          <p className="text-sm text-ink/60 mb-5">
            لا يوجد من تقيّمه في هذه المهمة. يمكنك إنهاؤها مباشرة دون منح نقاط.
          </p>
          <div className="flex gap-3">
            <button onClick={submit} disabled={saving} className="px-5 py-2.5 bg-gold text-ink text-sm disabled:opacity-60">
              {saving ? "جارٍ الإنهاء…" : "إنهاء المهمة"}
            </button>
            <button onClick={onClose} className="px-5 py-2.5 border border-ink/15 text-sm text-ink/70">
              إلغاء
            </button>
          </div>
          {error && <p className="text-red-600 text-sm mt-3">{error}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[200] bg-ink/60 flex items-center justify-center p-3 sm:p-4" onClick={onClose}>
      <div
        className="bg-white w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b border-ink/10 px-5 py-4 flex items-center justify-between gap-3">
          <div>
            <h3 className="font-display text-lg text-ink">تقييم المشاركين</h3>
            <p className="text-xs text-ink/50 mt-0.5">
              {index + 1} من {accepted.length} · {mission.title}
            </p>
          </div>
          <button onClick={onClose} className="text-ink/40 hover:text-ink text-xl leading-none" aria-label="إغلاق">
            ✕
          </button>
        </div>

        <div className="px-5 py-5">
          <p className="font-display text-base text-ink">{person.name}</p>
          <p className="text-xs text-ink/40 mb-5">{person.email}</p>

          {/* Q1 */}
          <p className="text-sm text-ink mb-2">هل شارك هذا المتطوع فعلياً في المهمة؟</p>
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setParticipated(true)}
              className={`px-5 py-2 text-sm ${
                answer.participated === true ? "bg-teal text-white" : "bg-white border border-ink/15 text-ink/70"
              }`}
            >
              نعم
            </button>
            <button
              onClick={() => setParticipated(false)}
              className={`px-5 py-2 text-sm ${
                answer.participated === false ? "bg-red-600 text-white" : "bg-white border border-ink/15 text-ink/70"
              }`}
            >
              لا
            </button>
          </div>

          {answer.participated === false && (
            <p className="text-sm text-ink/60 bg-stone p-4">لن يحصل هذا المتطوع على أي نقاط من هذه المهمة.</p>
          )}

          {/* Q2 — the nine factors */}
          {answer.participated === true && (
            <div className="space-y-4">
              {EVALUATION_CRITERIA.map((c) => (
                <div key={c.id}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm text-ink/80">{c.label}</span>
                    <span className="text-xs text-ink/40">
                      {answer.ratings[c.id] === undefined ? "—" : `${answer.ratings[c.id]}/${RATING_MAX}`}
                    </span>
                  </div>
                  <div className="flex gap-1.5">
                    {Array.from({ length: RATING_MAX + 1 }).map((_, v) => (
                      <button
                        key={v}
                        onClick={() => setRating(c.id, v)}
                        className={`flex-1 py-2 text-xs transition-colors ${
                          answer.ratings[c.id] === v
                            ? "bg-teal text-white"
                            : "bg-white border border-ink/15 text-ink/50 hover:border-teal"
                        }`}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              <div className="bg-stone p-4 mt-2">
                {currentAverage === null ? (
                  <p className="text-sm text-ink/50">قيّم كل العوامل لحساب النقاط.</p>
                ) : (
                  <p className="text-sm text-ink">
                    المعدل <strong>{currentAverage.toFixed(2)}</strong> من {RATING_MAX} ·{" "}
                    النقاط الممنوحة{" "}
                    <strong className="text-teal">{awardFor(mission.xpReward, currentAverage)}</strong> من{" "}
                    {mission.xpReward} XP
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="sticky bottom-0 bg-white border-t border-ink/10 px-5 py-4">
          {error && <p className="text-red-600 text-sm mb-3">{error}</p>}

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIndex((i) => i - 1)}
              disabled={index === 0}
              className="px-4 py-2.5 border border-ink/15 text-sm text-ink/70 disabled:opacity-40"
            >
              السابق
            </button>

            {index < accepted.length - 1 ? (
              <button
                onClick={() => setIndex((i) => i + 1)}
                disabled={!currentComplete}
                className="flex-1 px-4 py-2.5 bg-teal text-white text-sm disabled:opacity-50"
              >
                التالي
              </button>
            ) : (
              <button
                onClick={submit}
                disabled={!allComplete || saving}
                className="flex-1 px-4 py-2.5 bg-gold text-ink text-sm disabled:opacity-50"
              >
                {saving ? "جارٍ الإنهاء…" : "إنهاء المهمة ومنح النقاط"}
              </button>
            )}
          </div>

          {!allComplete && index === accepted.length - 1 && (
            <p className="text-xs text-ink/40 mt-2">أكمل تقييم كل مشارك قبل الإنهاء.</p>
          )}
        </div>
      </div>
    </div>
  );
}
