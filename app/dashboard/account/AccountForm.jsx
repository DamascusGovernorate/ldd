"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { DAMASCUS_NEIGHBORHOODS } from "@/lib/neighborhoods";

const DEGREE_LEVELS = [
  { value: "primary", label: "الشهادة الابتدائية" },
  { value: "intermediate", label: "الشهادة الإعدادية" },
  { value: "high_school", label: "الشهادة الثانوية" },
  { value: "bachelor", label: "شهادة البكالوريوس" },
  { value: "master", label: "شهادة الماجستير" },
  { value: "phd", label: "شهادة الدكتوراه" },
];

const inputClasses = "w-full px-4 py-3 bg-stone border border-ink/15 focus:outline-none focus:border-gold transition-colors placeholder:text-ink/40";

export default function AccountForm({ initialData }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next");

  const [form, setForm] = useState({
    ...initialData,
    degrees: initialData.degrees.length ? initialData.degrees : [{ level: "", specialization: "" }],
  });
  const [uploading, setUploading] = useState({ certificates: false, ids: false });
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  const updateDegree = (index, field, value) => {
    setForm((f) => {
      const degrees = [...f.degrees];
      degrees[index] = { ...degrees[index], [field]: value };
      return { ...f, degrees };
    });
  };

  const addDegree = () => form.degrees.length < 3 && setForm((f) => ({ ...f, degrees: [...f.degrees, { level: "", specialization: "" }] }));
  const removeDegree = (index) => setForm((f) => ({ ...f, degrees: f.degrees.filter((_, i) => i !== index) }));

  const handleUpload = async (e, field, folder) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading((u) => ({ ...u, [folder]: true }));
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", folder);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setForm((f) => ({ ...f, [field]: data.url }));
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading((u) => ({ ...u, [folder]: false }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setStatus("loading");
    try {
      const res = await fetch("/api/account/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, degrees: form.degrees.filter((d) => d.level) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setStatus("success");
      if (data.completed && next) {
        setTimeout(() => router.push(next), 900);
      }
    } catch (err) {
      setError(err.message);
      setStatus("error");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-8">
      <div className="grid sm:grid-cols-3 gap-5">
        <div>
          <label className="block text-sm text-ink/70 mb-2">رقم الهاتف</label>
          <input type="tel" dir="ltr" value={form.mobilePhone} onChange={(e) => setForm((f) => ({ ...f, mobilePhone: e.target.value }))} placeholder="09XXXXXXXX" className={`${inputClasses} text-end`} />
        </div>
        <div>
          <label className="block text-sm text-ink/70 mb-2">العمر</label>
          <input type="number" min="14" max="100" value={form.age} onChange={(e) => setForm((f) => ({ ...f, age: e.target.value }))} className={inputClasses} />
        </div>
        <div>
          <label className="block text-sm text-ink/70 mb-2">الجنس</label>
          <select value={form.gender} onChange={(e) => setForm((f) => ({ ...f, gender: e.target.value }))} className={inputClasses}>
            <option value="">اختر</option>
            <option value="male">ذكر</option>
            <option value="female">أنثى</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm text-ink/70 mb-2">الحي السكني</label>
        <select value={form.neighborhood || ""} onChange={(e) => setForm((f) => ({ ...f, neighborhood: e.target.value }))} className={inputClasses}>
          <option value="">اختر الحي</option>
          {DAMASCUS_NEIGHBORHOODS.map((n) => <option key={n} value={n}>{n}</option>)}
        </select>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <label className="text-sm text-ink/70">المؤهلات العلمية (حتى 3)</label>
          {form.degrees.length < 3 && (
            <button type="button" onClick={addDegree} className="text-sm text-teal hover:text-gold transition-colors">+ إضافة شهادة</button>
          )}
        </div>
        <div className="space-y-4">
          {form.degrees.map((d, i) => (
            <div key={i} className="grid sm:grid-cols-[1.2fr_1fr_auto] gap-3 items-start p-4 bg-stone border border-ink/10">
              <select value={d.level} onChange={(e) => updateDegree(i, "level", e.target.value)} className={inputClasses}>
                <option value="">اختر المؤهل</option>
                {DEGREE_LEVELS.map((lvl) => <option key={lvl.value} value={lvl.value}>{lvl.label}</option>)}
              </select>
              <input type="text" value={d.specialization} onChange={(e) => updateDegree(i, "specialization", e.target.value)} placeholder="التخصص (اختياري)" className={inputClasses} />
              {form.degrees.length > 1 && (
                <button type="button" onClick={() => removeDegree(i)} className="px-3 py-3 text-red-500 hover:bg-red-50 transition-colors">حذف</button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm text-ink/70 mb-2">صورة الشهادة (اختياري)</label>
          <input type="file" accept="image/*" onChange={(e) => handleUpload(e, "certificateImage", "certificates")} className="text-sm" />
          {uploading.certificates && <p className="text-xs text-ink/50 mt-1">جارِ الرفع...</p>}
          {form.certificateImage && <p className="text-xs text-teal mt-1">تم رفع الصورة ✓</p>}
        </div>
        <div>
          <label className="block text-sm text-ink/70 mb-2">صورة الهوية (اختياري)</label>
          <input type="file" accept="image/*" onChange={(e) => handleUpload(e, "idImage", "ids")} className="text-sm" />
          {uploading.ids && <p className="text-xs text-ink/50 mt-1">جارِ الرفع...</p>}
          {form.idImage && <p className="text-xs text-teal mt-1">تم رفع الصورة ✓</p>}
        </div>
      </div>

      {error && <p className="text-red-600 text-sm">{error}</p>}
      {status === "success" && (
        <p className="text-teal text-sm">تم حفظ معلوماتك بنجاح{next ? " — جارِ تحويلك..." : ""}</p>
      )}

      <button type="submit" disabled={status === "loading"} className="px-8 py-3.5 bg-teal text-white font-medium hover:bg-teal-deep transition-colors duration-300 disabled:opacity-60">
        {status === "loading" ? "جارِ الحفظ..." : "حفظ المعلومات"}
      </button>
    </form>
  );
}