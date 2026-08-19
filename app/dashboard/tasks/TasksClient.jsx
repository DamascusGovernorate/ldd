"use client";
import { useState } from "react";
import Link from "next/link";

const inputClasses = "w-full px-4 py-3 bg-stone border border-ink/15 focus:outline-none focus:border-gold transition-colors placeholder:text-ink/40";

export default function TasksClient({ initialTasks, projects, isAdmin, allUsers }) {
  const [tasks, setTasks] = useState(initialTasks);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", summary: "", image: "", project: "", assignedTo: [] });
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [completing, setCompleting] = useState(null);
  const [participation, setParticipation] = useState({});

  const canCreate = isAdmin || projects.length > 0;
  const assignableUsers = form.project ? (projects.find((p) => p.id === form.project)?.volunteers || []) : (isAdmin ? allUsers : []);

  const toggleAssignee = (id) => {
    setForm((f) => {
      const set = new Set(f.assignedTo);
      set.has(id) ? set.delete(id) : set.add(id);
      return { ...f, assignedTo: [...set] };
    });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", "tasks");
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setForm((f) => ({ ...f, image: data.url }));
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.title || form.assignedTo.length === 0) { setError("العنوان وقائمة المكلفين مطلوبة"); return; }
    setSubmitting(true);
    try {
      const res = await fetch("/api/tasks", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, project: form.project || undefined }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      const projectObj = projects.find((p) => p.id === form.project);
      const assignedUsers = assignableUsers.filter((u) => form.assignedTo.includes(u.id));
      setTasks((prev) => [{ id: data.id, title: form.title, summary: form.summary, image: form.image, status: "open", project: projectObj ? { id: projectObj.id, name: projectObj.name } : null, assignedTo: assignedUsers, createdBy: "أنت", canManage: true }, ...prev]);
      setForm({ title: "", summary: "", image: "", project: "", assignedTo: [] });
      setShowForm(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const startCompleting = (task) => {
    setCompleting(task.id);
    const init = {};
    task.assignedTo.forEach((u) => { init[u.id] = true; });
    setParticipation(init);
  };

  const submitCompletion = async (taskId) => {
    try {
      const payload = Object.entries(participation).map(([user, participated]) => ({ user, participated }));
      const res = await fetch(`/api/tasks/${taskId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ participation: payload }) });
      if (!res.ok) throw new Error();
      setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status: "done" } : t)));
      setCompleting(null);
    } catch {
      alert("فشل تحديث المهمة");
    }
  };

  return (
    <div>
      {canCreate ? (
        <button onClick={() => setShowForm((v) => !v)} className="mb-6 px-6 py-3 bg-teal text-white font-medium hover:bg-teal-deep transition-colors duration-300">
          {showForm ? "إلغاء" : "+ مهمة جديدة"}
        </button>
      ) : (
        <p className="mb-6 text-sm text-ink/50 bg-white/40 border border-ink/10 p-4">
          إسناد المهام متاح فقط لمالكي المشاريع ومسؤوليها والمدير العام.
        </p>
      )}

      {canCreate && showForm && (
        <form onSubmit={handleCreate} className="mb-10 max-w-2xl space-y-4 p-6 bg-white/50 border border-ink/10">
          <div>
            <label className="block text-sm text-ink/70 mb-2">عنوان المهمة</label>
            <input type="text" required value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} className={inputClasses} />
          </div>
          <div>
            <label className="block text-sm text-ink/70 mb-2">ملخص المهمة</label>
            <textarea rows={3} value={form.summary} onChange={(e) => setForm((f) => ({ ...f, summary: e.target.value }))} className={`${inputClasses} resize-none`} />
          </div>
          <div>
            <label className="block text-sm text-ink/70 mb-2">صورة (اختياري)</label>
            <input type="file" accept="image/*" onChange={handleImageUpload} className="text-sm" />
            {uploading && <p className="text-xs text-ink/50 mt-1">جارِ الرفع...</p>}
          </div>
          <div>
            <label className="block text-sm text-ink/70 mb-2">المشروع {isAdmin && "(اختياري)"}</label>
            <select required={!isAdmin} value={form.project} onChange={(e) => setForm((f) => ({ ...f, project: e.target.value, assignedTo: [] }))} className={inputClasses}>
              <option value="">{isAdmin ? "بدون مشروع محدد" : "اختر المشروع"}</option>
              {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm text-ink/70 mb-2">المكلّفون بالمهمة</label>
            <div className="max-h-40 overflow-y-auto border border-ink/15 divide-y divide-ink/5">
              {assignableUsers.map((u) => (
                <label key={u.id} className="flex items-center gap-3 px-4 py-2 text-sm cursor-pointer hover:bg-stone">
                  <input type="checkbox" checked={form.assignedTo.includes(u.id)} onChange={() => toggleAssignee(u.id)} />
                  {u.fullName}
                </label>
              ))}
              {assignableUsers.length === 0 && <p className="px-4 py-3 text-sm text-ink/40">اختر مشروعاً أولاً</p>}
            </div>
          </div>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button type="submit" disabled={submitting} className="px-6 py-3 bg-teal text-white font-medium hover:bg-teal-deep transition-colors duration-300 disabled:opacity-60">
            {submitting ? "جارِ الإنشاء..." : "إنشاء المهمة"}
          </button>
        </form>
      )}

      <div className="space-y-4">
        {tasks.map((t) => (
          <div key={t.id} className="p-6 bg-white/50 border border-ink/10">
            <div className="flex items-start gap-4">
              {t.image && <img src={t.image} alt="" className="w-20 h-20 object-cover shrink-0" />}
              <div className="flex-1">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-display text-lg text-ink">{t.title}</h3>
                  <span className={`text-xs px-2 py-1 shrink-0 ${t.status === "done" ? "bg-teal/10 text-teal" : "bg-gold/10 text-gold"}`}>{t.status === "done" ? "منتهية" : "مفتوحة"}</span>
                </div>
                {t.project && <p className="text-xs text-ink/50 mt-1">المشروع: {t.project.name}</p>}
                <p className="text-sm text-ink/70 mt-2">{t.summary}</p>
                <p className="text-xs text-ink/40 mt-2">المكلّفون: {t.assignedTo.map((u) => u.fullName).join("، ")}</p>

                {t.canManage && t.status === "open" && completing !== t.id && (
                  <button onClick={() => startCompleting(t)} className="mt-4 px-4 py-2 text-sm bg-teal text-white hover:bg-teal-deep transition-colors">إنهاء المهمة</button>
                )}

                {completing === t.id && (
                  <div className="mt-4 p-4 bg-stone border border-ink/10">
                    <p className="text-sm text-ink/70 mb-3">حدد من شارك فعلياً في تنفيذ المهمة:</p>
                    <div className="space-y-2">
                      {t.assignedTo.map((u) => (
                        <label key={u.id} className="flex items-center gap-3 text-sm">
                          <input type="checkbox" checked={participation[u.id] ?? true} onChange={(e) => setParticipation((p) => ({ ...p, [u.id]: e.target.checked }))} />
                          {u.fullName}
                        </label>
                      ))}
                    </div>
                    <div className="flex gap-3 mt-4">
                      <button onClick={() => submitCompletion(t.id)} className="px-4 py-2 text-sm bg-teal text-white hover:bg-teal-deep transition-colors">حفظ وإنهاء</button>
                      <button onClick={() => setCompleting(null)} className="px-4 py-2 text-sm border border-ink/20 hover:bg-white transition-colors">إلغاء</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        {tasks.length === 0 && <p className="text-ink/50 text-sm">لا توجد مهام بعد</p>}
      </div>
    </div>
  );
}