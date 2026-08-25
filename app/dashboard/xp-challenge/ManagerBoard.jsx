"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import MissionForm from "./MissionForm";
import EvaluationDialog from "./EvaluationDialog";
import { MISSION_STATUSES, normalizeStatus, canApplyTo } from "@/lib/xpChallenge";

const TYPE_LABEL = { main: "مهمة رئيسية", side: "مهمة فرعية" };
const STATUS_STYLE = {
  upcoming: "bg-gold/10 text-gold",
  active: "bg-teal/10 text-teal",
  ended: "bg-ink/10 text-ink/50",
};
const STATUS_LABEL = Object.fromEntries(MISSION_STATUSES.map((s) => [s.id, s.label]));
const APPLICANT_LABEL = { pending: "قيد المراجعة", accepted: "مقبول", rejected: "مرفوض" };

function ApplicantRow({ missionId, applicant, disabled, onChanged }) {
  const [busy, setBusy] = useState(false);

  const decide = async (status) => {
    setBusy(true);
    try {
      const res = await fetch(`/api/missions/${missionId}/applicants`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: applicant.id, status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      onChanged();
    } catch (err) {
      alert(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-ink/5 last:border-0">
      <div className="flex-1 min-w-0">
        <p className="text-sm text-ink truncate">{applicant.name}</p>
        <p className="text-xs text-ink/40 truncate">{applicant.email}</p>
      </div>

      {applicant.status === "pending" && !disabled ? (
        <div className="flex gap-2 shrink-0">
          <button
            onClick={() => decide("accepted")}
            disabled={busy}
            className="px-3 py-1.5 bg-teal text-white text-xs disabled:opacity-60"
          >
            قبول
          </button>
          <button
            onClick={() => decide("rejected")}
            disabled={busy}
            className="px-3 py-1.5 border border-ink/15 text-ink/60 text-xs disabled:opacity-60"
          >
            رفض
          </button>
        </div>
      ) : (
        <span
          className={`text-xs px-2 py-1 shrink-0 ${
            applicant.status === "accepted"
              ? "bg-teal/10 text-teal"
              : applicant.status === "rejected"
              ? "bg-red-50 text-red-600"
              : "bg-gold/10 text-gold"
          }`}
        >
          {APPLICANT_LABEL[applicant.status]}
        </span>
      )}
    </div>
  );
}

function MissionCard({ mission, onEdit, onEnd, onChanged }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const status = normalizeStatus(mission.status);
  const accepted = mission.applicants.filter((a) => a.status === "accepted");
  const pending = mission.applicants.filter((a) => a.status === "pending");
  const ended = status === "ended";

  const setStatus = async (next) => {
    if (next === "ended") return onEnd(mission); // ending runs through evaluation
    setBusy(true);
    try {
      const res = await fetch(`/api/missions/${mission.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      onChanged();
    } catch (err) {
      alert(err.message);
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!confirm(`حذف مهمة «${mission.title}» نهائياً؟ لا يمكن التراجع.`)) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/missions/${mission.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error((await res.json()).error);
      onChanged();
    } catch (err) {
      alert(err.message);
    } finally {
      setBusy(false);
    }
  };

  const awardOf = (userId) => mission.participation.find((p) => p.userId === userId);

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
            <span className={`text-xs px-2 py-0.5 ${STATUS_STYLE[status]}`}>{STATUS_LABEL[status]}</span>
          </div>

          <p className="text-xs text-ink/50 mt-1">
            {mission.neighborhood} · {mission.xpReward} XP · {accepted.length} مقبول
            {pending.length > 0 && !ended && ` · ${pending.length} بانتظار المراجعة`}
          </p>

          {mission.summary && <p className="text-sm text-ink/60 mt-2 line-clamp-2">{mission.summary}</p>}

          {/* lifecycle */}
          {!ended && (
            <div className="flex flex-wrap gap-2 mt-3">
              {MISSION_STATUSES.map((s) => {
                const isCurrent = s.id === status;
                return (
                  <button
                    key={s.id}
                    onClick={() => !isCurrent && setStatus(s.id)}
                    disabled={busy || isCurrent}
                    title={s.hint}
                    className={`px-3 py-1.5 text-xs transition-colors ${
                      isCurrent
                        ? "bg-teal text-white"
                        : s.id === "ended"
                        ? "border border-gold text-gold hover:bg-gold hover:text-ink"
                        : "border border-ink/15 text-ink/60 hover:border-teal"
                    } disabled:opacity-60`}
                  >
                    {s.id === "ended" ? "إنهاء وتقييم" : s.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2 shrink-0">
          <button onClick={() => setOpen((o) => !o)} className="px-3 py-1.5 border border-ink/15 text-xs text-ink/70">
            {open ? "إخفاء" : `الطلبات (${mission.applicants.length})`}
          </button>
          {!ended && (
            <button onClick={() => onEdit(mission)} className="px-3 py-1.5 border border-ink/15 text-xs text-ink/70">
              تعديل
            </button>
          )}
          <button
            onClick={remove}
            disabled={busy}
            className="px-3 py-1.5 border border-red-200 text-xs text-red-600 hover:bg-red-50 disabled:opacity-60"
          >
            حذف
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-ink/10 p-4 bg-stone/50">
          {mission.applicants.length === 0 ? (
            <p className="text-sm text-ink/40">لا توجد طلبات بعد.</p>
          ) : (
            mission.applicants.map((a) => {
              const award = ended ? awardOf(a.id) : null;
              return (
                <div key={a.id}>
                  <ApplicantRow missionId={mission.id} applicant={a} disabled={ended} onChanged={onChanged} />
                  {award && (
                    <p className="text-xs text-ink/50 pb-2 -mt-1">
                      {award.completed
                        ? `معدل ${Number(award.average || 0).toFixed(2)}/5 · مُنح ${award.awardedXP} XP`
                        : "لم يشارك · 0 XP"}
                    </p>
                  )}
                </div>
              );
            })
          )}

          {!ended && status === "active" && accepted.length > 0 && (
            <p className="text-xs text-ink/50 mt-4 pt-4 border-t border-ink/10">
              عند إنهاء المهمة ستقيّم كل مشارك على تسعة عوامل، وتُحتسب النقاط من معدل التقييم.
            </p>
          )}

          {!ended && !canApplyTo(status) && (
            <p className="text-xs text-ink/40 mt-3">التقديم مغلق — المهمة قيد التنفيذ.</p>
          )}
        </div>
      )}
    </div>
  );
}

export default function ManagerBoard({ projectId, missions, neighborhood, unscoped }) {
  const router = useRouter();
  const [composing, setComposing] = useState(false);
  const [editing, setEditing] = useState(null);
  const [ending, setEnding] = useState(null);
  const [filter, setFilter] = useState("all");

  const refresh = () => {
    setComposing(false);
    setEditing(null);
    setEnding(null);
    router.refresh();
  };

  const shown = missions.filter((m) => {
    const status = normalizeStatus(m.status);
    if (filter === "all") return true;
    if (["upcoming", "active", "ended"].includes(filter)) return status === filter;
    return m.type === filter && status !== "ended";
  });

  const pendingTotal = missions.reduce(
    (n, m) => n + m.applicants.filter((a) => a.status === "pending").length,
    0
  );

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-2xl text-ink">تحدي XP</h1>
          <p className="text-sm text-ink/50 mt-1">
            {unscoped ? "جميع الأحياء" : `مسؤول حي ${neighborhood}`}
            {pendingTotal > 0 && ` · ${pendingTotal} طلب بانتظار المراجعة`}
          </p>
        </div>

        {!composing && !editing && (
          <button onClick={() => setComposing(true)} className="px-5 py-2.5 bg-teal text-white text-sm">
            + مهمة جديدة
          </button>
        )}
      </div>

      {(composing || editing) && (
        <div className="mb-6">
          <MissionForm
            projectId={projectId}
            neighborhood={neighborhood}
            unscoped={unscoped}
            mission={editing}
            onDone={refresh}
            onCancel={() => {
              setComposing(false);
              setEditing(null);
            }}
          />
        </div>
      )}

      <div className="flex flex-wrap gap-2 mb-5">
        {[
          { id: "all", label: "الكل" },
          { id: "upcoming", label: "تبدأ قريباً" },
          { id: "active", label: "جارية" },
          { id: "ended", label: "منتهية" },
          { id: "main", label: "رئيسية" },
          { id: "side", label: "فرعية" },
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
          <MissionCard key={m.id} mission={m} onEdit={setEditing} onEnd={setEnding} onChanged={refresh} />
        ))}

        {shown.length === 0 && (
          <div className="bg-white border border-ink/10 p-8 text-center">
            <p className="text-ink/60 text-sm">
              {missions.length === 0
                ? "لم تنشر أي مهمة بعد — ابدأ بمهمة رئيسية لحيّك."
                : "لا مهام في هذا التصنيف."}
            </p>
          </div>
        )}
      </div>

      {ending && (
        <EvaluationDialog mission={ending} onClose={() => setEnding(null)} onDone={refresh} />
      )}
    </div>
  );
}
