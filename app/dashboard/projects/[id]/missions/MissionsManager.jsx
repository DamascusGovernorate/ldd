"use client";
import { useState } from "react";
import { DAMASCUS_NEIGHBORHOODS } from "@/lib/neighborhoods";

const inputClasses = "w-full px-4 py-3 bg-stone border border-ink/15 focus:outline-none focus:border-gold transition-colors placeholder:text-ink/40";

export default function MissionsManager({ projectId, initialMissions }) {
  const [missions, setMissions] = useState(initialMissions);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: "", summary: "", objectives: "", neighborhood: DAMASCUS_NEIGHBORHOODS[0],
    googleMapsUrl: "", xpReward: 5, icon: "", images: [],
  });
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [completing, setCompleting] = useState(null);
  const [participation, setParticipation] = useState({});

  const uploadFile = async (file, folder) => {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("folder", folder);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    return data.url;
  };

  const handleIconUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadFile(file, "missions/icons");
      setForm((f) => ({ ...f, icon: url }));
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleImagesUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    try {
      const urls = [];
      for (const file of files) urls.push(await uploadFile(file, "missions/gallery"));
      setForm((f) => ({ ...f, images: [...f.images, ...urls] }));
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.title || !form.neighborhood) { setError("العنوان والحي مطلوبان"); return; }
    setSubmitting(true);
    try {
      const res = await fetch("/api/missions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project: projectId,
          title: form.title,
          summary: form.summary,
          objectives: form.objectives.split("\n").map((o) => o.trim()).filter(Boolean),
          icon: form.icon,
          images: form.images,
          neighborhood: form.neighborhood,
          googleMapsUrl: form.googleMapsUrl,
          xpReward: Number(form.xpReward) || 5,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMissions((prev) => [{
        _id: data.id, title: form.title, summary: form.summary,
        objectives: form.objectives.split("\n").filter(Boolean), icon: form.icon, images: form.images,
        neighborhood: form.neighborhood, googleMapsUrl: form.googleMapsUrl, xpReward: Number(form.xpReward) || 5,
        status: "open", applicants: [],
      }, ...prev]);
      setForm({ title: "", summary: "", objectives: "", neighborhood: DAMASCUS_NEIGHBORHOODS[0], googleMapsUrl: "", xpReward: 5, icon: "", images: [] });
      setShowForm(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleApplicant = async (missionId, userId, status) => {
    try {
      const res = await fetch(`/api/missions/${missionId}/applicants`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, status }),
      });
      if (!res.ok) throw new Error();
      setMissions((prev) => prev.map((m) => m._id === missionId
        ? { ...m, applicants: m.applicants.map((a) => (a.user._id === userId ? { ...a, status } : a)) }
        : m));
    } catch {
      alert("فشل التحديث");
    }
  };

  const startCompleting = (mission) => {
    setCompleting(mission._id);
    const init = {};
    mission.applicants.filter((a) => a.status === "accepted").forEach((a) => { init[a.user._id] = true; });
    setParticipation(init);
  };

  const submitCompletion = async (missionId) => {
    try {
      const payload = Object.entries(participation).map(([user, completed]) => ({ user, completed }));
      const res = await fetch(`/api/missions/${missionId}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ complete: true, participation: payload }),
      });
      if (!res.ok) throw new Error();
      setMissions((prev) => prev.map((m) => (m._id === missionId ? { ...m, status: "closed" } : m)));
      setCompleting(null);
    } catch {
      alert("فشل إغلاق المهمة");
    }
  };

  return (
    <div>
      <button onClick={() => setShowForm((v) => !v)} className="mb-6 px-6 py-3 bg-teal text-white font-medium hover:bg-teal-deep transition-colors duration-300">
        {showForm ? "إلغاء" : "+ مهمة جديدة على الخريطة"}
      </button>

      {showForm && (
        <form onSubmit={handleCreate} className="mb-10 max-w-2xl space-y-4 p-6 bg-white/50 border border-ink/10">
          <div>
            <label className="block text-sm text-ink/70 mb-2">عنوان المهمة</label>
            <input type="text" required value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} className={inputClasses} />
          </div>
          <div>
            <label className="block text-sm text-ink/70 mb-2">الملخص</label>
            <textarea rows={3} value={form.summary} onChange={(e) => setForm((f) => ({ ...f, summary: e.target.value }))} className={`${inputClasses} resize-none`} />
          </div>
          <div>
            <label className="block text-sm text-ink/70 mb-2">الأهداف (سطر لكل هدف)</label>
            <textarea rows={4} value={form.objectives} onChange={(e) => setForm((f) => ({ ...f, objectives: e.target.value }))} className={`${inputClasses} resize-none`} placeholder={"مثال:\nزيارة الموقع\nتوثيق الحالة بالصور"} />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-ink/70 mb-2">الحي</label>
              <select value={form.neighborhood} onChange={(e) => setForm((f) => ({ ...f, neighborhood: e.target.value }))} className={inputClasses}>
                {DAMASCUS_NEIGHBORHOODS.map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm text-ink/70 mb-2">نقاط الخبرة (XP)</label>
              <input type="number" min={1} value={form.xpReward} onChange={(e) => setForm((f) => ({ ...f, xpReward: e.target.value }))} className={inputClasses} />
            </div>
          </div>
          <div>
            <label className="block text-sm text-ink/70 mb-2">رابط الموقع على خرائط Google (اختياري)</label>
            <input type="url" dir="ltr" value={form.googleMapsUrl} onChange={(e) => setForm((f) => ({ ...f, googleMapsUrl: e.target.value }))} placeholder="https://maps.google.com/..." className={`${inputClasses} text-end`} />
          </div>
          <div>
            <label className="block text-sm text-ink/70 mb-2">أيقونة الدبوس على الخريطة</label>
            <input type="file" accept="image/*" onChange={handleIconUpload} className="text-sm" />
            {form.icon && <img src={form.icon} alt="" className="mt-2 w-14 h-14 object-cover" />}
          </div>
          <div>
            <label className="block text-sm text-ink/70 mb-2">صور المهمة (اختياري)</label>
            <input type="file" accept="image/*" multiple onChange={handleImagesUpload} className="text-sm" />
            {uploading && <p className="text-xs text-ink/50 mt-1">جارِ الرفع...</p>}
            {form.images.length > 0 && <div className="flex gap-2 mt-2 flex-wrap">{form.images.map((img, i) => <img key={i} src={img} alt="" className="w-16 h-16 object-cover" />)}</div>}
          </div>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button type="submit" disabled={submitting} className="px-6 py-3 bg-teal text-white font-medium hover:bg-teal-deep transition-colors duration-300 disabled:opacity-60">
            {submitting ? "جارِ الإنشاء..." : "إضافة المهمة"}
          </button>
        </form>
      )}

      <div className="space-y-6">
        {missions.map((m) => (
          <div key={m._id} className="p-6 bg-white/50 border border-ink/10">
            <div className="flex items-start gap-4">
              {m.icon && <img src={m.icon} alt="" className="w-14 h-14 object-cover shrink-0" />}
              <div className="flex-1">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-display text-lg text-ink">{m.title}</h3>
                  <span className={`text-xs px-2 py-1 shrink-0 ${m.status === "closed" ? "bg-ink/10 text-ink/50" : "bg-teal/10 text-teal"}`}>
                    {m.status === "closed" ? "مغلقة" : "مفتوحة"}
                  </span>
                </div>
                <p className="text-xs text-ink/50 mt-1">{m.neighborhood} · {m.xpReward} نقاط خبرة</p>
                <p className="text-sm text-ink/70 mt-2">{m.summary}</p>

                {m.applicants?.length > 0 && (
                  <div className="mt-4">
                    <p className="text-xs text-ink/50 mb-2">المتقدمون ({m.applicants.length})</p>
                    <div className="space-y-2">
                      {m.applicants.map((a) => (
                        <div key={a.user._id} className="flex items-center justify-between gap-3 text-sm bg-stone px-3 py-2">
                          <span>{a.user.fullName}</span>
                          {a.status === "pending" ? (
                            <div className="flex gap-2">
                              <button onClick={() => handleApplicant(m._id, a.user._id, "accepted")} className="text-teal hover:text-teal-deep">قبول</button>
                              <button onClick={() => handleApplicant(m._id, a.user._id, "rejected")} className="text-red-500 hover:text-red-700">رفض</button>
                            </div>
                          ) : (
                            <span className={a.status === "accepted" ? "text-teal" : "text-red-500"}>
                              {a.status === "accepted" ? "مقبول" : "مرفوض"}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {m.status === "open" && completing !== m._id && (
                  <button onClick={() => startCompleting(m)} className="mt-4 px-4 py-2 text-sm bg-teal text-white hover:bg-teal-deep transition-colors">
                    إغلاق المهمة ومنح النقاط
                  </button>
                )}

                {completing === m._id && (
                  <div className="mt-4 p-4 bg-stone border border-ink/10">
                    <p className="text-sm text-ink/70 mb-3">حدد من أكمل المهمة فعلياً (سيحصل على {m.xpReward} نقاط):</p>
                    <div className="space-y-2">
                      {m.applicants.filter((a) => a.status === "accepted").map((a) => (
                        <label key={a.user._id} className="flex items-center gap-3 text-sm">
                          <input type="checkbox" checked={participation[a.user._id] ?? true} onChange={(e) => setParticipation((p) => ({ ...p, [a.user._id]: e.target.checked }))} />
                          {a.user.fullName}
                        </label>
                      ))}
                      {m.applicants.filter((a) => a.status === "accepted").length === 0 && (
                        <p className="text-xs text-ink/40">لا يوجد متقدمون مقبولون بعد</p>
                      )}
                    </div>
                    <div className="flex gap-3 mt-4">
                      <button onClick={() => submitCompletion(m._id)} className="px-4 py-2 text-sm bg-teal text-white hover:bg-teal-deep transition-colors">حفظ وإغلاق</button>
                      <button onClick={() => setCompleting(null)} className="px-4 py-2 text-sm border border-ink/20 hover:bg-white transition-colors">إلغاء</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        {missions.length === 0 && <p className="text-ink/50 text-sm">لا توجد مهمات بعد</p>}
      </div>
    </div>
  );
}