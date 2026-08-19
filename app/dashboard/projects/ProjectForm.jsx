"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const inputClasses = "w-full px-4 py-3 bg-stone border border-ink/15 focus:outline-none focus:border-gold transition-colors placeholder:text-ink/40";

export default function ProjectForm({ users, initial, projectId }) {
  const router = useRouter();
  const [form, setForm] = useState({
    name: initial?.name || "",
    summary: initial?.summary || "",
    banner: initial?.banner || "",
    owner: initial?.owner?._id || initial?.owner || "",
    admins: initial?.admins?.map((a) => a._id || a) || [],
    volunteers: initial?.volunteers?.map((v) => v._id || v) || [],
    status: initial?.status || "active",
  });
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  const toggleMulti = (field, id) => {
    setForm((f) => {
      const set = new Set(f[field]);
      set.has(id) ? set.delete(id) : set.add(id);
      return { ...f, [field]: [...set] };
    });
  };

  const handleBannerUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", "projects");
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setForm((f) => ({ ...f, banner: data.url }));
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.name || !form.owner) { setError("الاسم ومالك المشروع مطلوبان"); return; }
    setStatus("loading");
    try {
      const res = await fetch(projectId ? `/api/projects/${projectId}` : "/api/projects", {
        method: projectId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      router.push(`/dashboard/projects/${projectId || data.id}`);
      router.refresh();
    } catch (err) {
      setError(err.message);
      setStatus("error");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
      <div>
        <label className="block text-sm text-ink/70 mb-2">اسم المشروع</label>
        <input type="text" required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className={inputClasses} />
      </div>
      <div>
        <label className="block text-sm text-ink/70 mb-2">ملخص المشروع</label>
        <textarea rows={4} value={form.summary} onChange={(e) => setForm((f) => ({ ...f, summary: e.target.value }))} className={`${inputClasses} resize-none`} />
      </div>
      <div>
        <label className="block text-sm text-ink/70 mb-2">صورة الغلاف</label>
        <input type="file" accept="image/*" onChange={handleBannerUpload} className="text-sm" />
        {uploading && <p className="text-xs text-ink/50 mt-1">جارِ الرفع...</p>}
        {form.banner && <img src={form.banner} alt="" className="mt-3 w-full max-w-sm aspect-video object-cover border border-ink/10" />}
      </div>
      <div>
        <label className="block text-sm text-ink/70 mb-2">مالك المشروع</label>
        <select required value={form.owner} onChange={(e) => setForm((f) => ({ ...f, owner: e.target.value }))} className={inputClasses}>
          <option value="">اختر المالك</option>
          {users.map((u) => <option key={u.id} value={u.id}>{u.fullName} — {u.email}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-sm text-ink/70 mb-2">مسؤولو المشروع</label>
        <div className="max-h-40 overflow-y-auto border border-ink/15 divide-y divide-ink/5">
          {users.map((u) => (
            <label key={u.id} className="flex items-center gap-3 px-4 py-2 text-sm cursor-pointer hover:bg-stone">
              <input type="checkbox" checked={form.admins.includes(u.id)} onChange={() => toggleMulti("admins", u.id)} />
              {u.fullName}
            </label>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-sm text-ink/70 mb-2">المتطوعون</label>
        <div className="max-h-40 overflow-y-auto border border-ink/15 divide-y divide-ink/5">
          {users.map((u) => (
            <label key={u.id} className="flex items-center gap-3 px-4 py-2 text-sm cursor-pointer hover:bg-stone">
              <input type="checkbox" checked={form.volunteers.includes(u.id)} onChange={() => toggleMulti("volunteers", u.id)} />
              {u.fullName}
            </label>
          ))}
        </div>
      </div>
      {projectId && (
        <div>
          <label className="block text-sm text-ink/70 mb-2">حالة المشروع</label>
          <select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))} className={inputClasses}>
            <option value="active">قيد التنفيذ</option>
            <option value="completed">مكتمل</option>
            <option value="archived">مؤرشف</option>
          </select>
        </div>
      )}
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <button type="submit" disabled={status === "loading"} className="px-8 py-3.5 bg-teal text-white font-medium hover:bg-teal-deep transition-colors duration-300 disabled:opacity-60">
        {status === "loading" ? "جارِ الحفظ..." : projectId ? "حفظ التعديلات" : "إنشاء المشروع"}
      </button>
    </form>
  );
}