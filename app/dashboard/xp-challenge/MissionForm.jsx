"use client";
import { useState } from "react";
import { DAMASCUS_NEIGHBORHOODS } from "@/lib/neighborhoods";

const EMPTY = {
  title: "",
  summary: "",
  type: "main",
  xpReward: 50,
  icon: "",
  image: "",
  googleMapsUrl: "",
  objectives: [""],
};

export default function MissionForm({ projectId, neighborhood, unscoped, mission, onDone, onCancel }) {
  const editing = Boolean(mission);
  const [form, setForm] = useState(
    mission
      ? {
          title: mission.title,
          summary: mission.summary || "",
          type: mission.type || "main",
          xpReward: mission.xpReward || 50,
          icon: mission.icon || "",
          image: mission.images?.[0] || "",
          googleMapsUrl: mission.googleMapsUrl || "",
          objectives: mission.objectives?.length ? mission.objectives : [""],
          neighborhood: mission.neighborhood,
        }
      : { ...EMPTY, neighborhood: neighborhood || "" }
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const setObjective = (i, v) =>
    setForm((f) => ({ ...f, objectives: f.objectives.map((o, idx) => (idx === i ? v : o)) }));
  const addObjective = () => setForm((f) => ({ ...f, objectives: [...f.objectives, ""] }));
  const removeObjective = (i) =>
    setForm((f) => ({ ...f, objectives: f.objectives.filter((_, idx) => idx !== i) }));

  const submit = async () => {
    setError("");
    if (!form.title.trim()) return setError("العنوان مطلوب");
    const points = Number(form.xpReward);
    if (!Number.isFinite(points) || points < 1 || points > 1000) return setError("النقاط بين 1 و 1000");

    setSaving(true);
    try {
      const payload = {
        project: projectId,
        title: form.title.trim(),
        summary: form.summary.trim(),
        type: form.type,
        xpReward: points,
        icon: form.icon.trim() || undefined,
        images: form.image.trim() ? [form.image.trim()] : [],
        googleMapsUrl: form.googleMapsUrl.trim() || undefined,
        objectives: form.objectives.map((o) => o.trim()).filter(Boolean),
      };
      if (unscoped) payload.neighborhood = form.neighborhood;

      const res = await fetch(editing ? `/api/missions/${mission.id}` : "/api/missions", {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "تعذّر الحفظ");
      onDone();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const field = "w-full px-3 py-2.5 bg-white border border-ink/15 text-sm focus:border-teal outline-none";
  const label = "block text-xs text-ink/60 mb-1.5";

  return (
    <div className="bg-stone border border-ink/10 p-5 md:p-6">
      <h3 className="font-display text-lg text-ink mb-5">{editing ? "تعديل المهمة" : "مهمة جديدة"}</h3>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className={label}>عنوان المهمة *</label>
          <input className={field} value={form.title} onChange={(e) => set("title", e.target.value)} />
        </div>

        <div>
          <label className={label}>نوع المهمة</label>
          <div className="flex gap-2">
            {[
              { id: "main", label: "مهمة رئيسية" },
              { id: "side", label: "مهمة فرعية" },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => set("type", t.id)}
                className={`flex-1 px-3 py-2.5 text-sm transition-colors ${
                  form.type === t.id ? "bg-teal text-white" : "bg-white border border-ink/15 text-ink/70"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className={label}>نقاط الخبرة (XP) *</label>
          <input
            type="number"
            min={1}
            max={1000}
            className={field}
            value={form.xpReward}
            onChange={(e) => set("xpReward", e.target.value)}
          />
        </div>

        <div className="md:col-span-2">
          <label className={label}>الحي</label>
          {unscoped ? (
            <select className={field} value={form.neighborhood} onChange={(e) => set("neighborhood", e.target.value)}>
              <option value="">اختر الحي</option>
              {DAMASCUS_NEIGHBORHOODS.map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          ) : (
            <div className="px-3 py-2.5 bg-ink/5 border border-ink/10 text-sm text-ink/70">
              {neighborhood} — تُنشر المهمة في حيّك فقط
            </div>
          )}
        </div>

        <div className="md:col-span-2">
          <label className={label}>وصف المهمة</label>
          <textarea rows={3} className={field} value={form.summary} onChange={(e) => set("summary", e.target.value)} />
        </div>

        <div className="md:col-span-2">
          <label className={label}>الأهداف الرئيسية</label>
          <div className="space-y-2">
            {form.objectives.map((o, i) => (
              <div key={i} className="flex gap-2">
                <input
                  className={field}
                  value={o}
                  placeholder={`الهدف ${i + 1}`}
                  onChange={(e) => setObjective(i, e.target.value)}
                />
                {form.objectives.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeObjective(i)}
                    className="px-3 text-ink/40 hover:text-red-600 text-sm"
                    aria-label="حذف الهدف"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>
          <button type="button" onClick={addObjective} className="mt-2 text-xs text-teal hover:underline">
            + إضافة هدف
          </button>
        </div>

        <div>
          <label className={label}>صورة المهمة (رابط)</label>
          <input className={field} value={form.image} onChange={(e) => set("image", e.target.value)} placeholder="https://…" />
        </div>

        <div>
          <label className={label}>أيقونة الدبوس على الخريطة (رابط)</label>
          <input className={field} value={form.icon} onChange={(e) => set("icon", e.target.value)} placeholder="https://…" />
        </div>

        <div className="md:col-span-2">
          <label className={label}>رابط الموقع على خرائط Google</label>
          <input className={field} value={form.googleMapsUrl} onChange={(e) => set("googleMapsUrl", e.target.value)} />
        </div>
      </div>

      {(form.image || form.icon) && (
        <div className="flex items-center gap-3 mt-4">
          {form.image && <img src={form.image} alt="" className="w-28 h-20 object-cover border border-ink/15" />}
          {form.icon && <img src={form.icon} alt="" className="w-12 h-12 object-cover rounded-full border border-ink/15" />}
        </div>
      )}

      {error && <p className="text-red-600 text-sm mt-4">{error}</p>}

      <div className="flex gap-3 mt-6">
        <button
          type="button"
          onClick={submit}
          disabled={saving}
          className="px-6 py-2.5 bg-teal text-white text-sm hover:bg-teal-deep transition-colors disabled:opacity-60"
        >
          {saving ? "جارٍ الحفظ…" : editing ? "حفظ التعديلات" : "نشر المهمة"}
        </button>
        <button type="button" onClick={onCancel} className="px-6 py-2.5 border border-ink/15 text-sm text-ink/70">
          إلغاء
        </button>
      </div>
    </div>
  );
}
