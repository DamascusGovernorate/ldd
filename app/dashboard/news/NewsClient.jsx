"use client";
import { useState } from "react";
import RichTextEditor from "./RichTextEditor";

export default function NewsClient({ initial }) {
  const [articles, setArticles] = useState(initial);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", content: "", images: [] });
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    try {
      const urls = [];
      for (const file of files) {
        const fd = new FormData();
        fd.append("file", file);
        fd.append("folder", "news");
        const res = await fetch("/api/upload", { method: "POST", body: fd });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        urls.push(data.url);
      }
      setForm((f) => ({ ...f, images: [...f.images, ...urls] }));
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const publish = async (published) => {
    setError("");
    if (!form.title || !form.content) { setError("العنوان والمحتوى مطلوبان"); return; }
    setSubmitting(true);
    try {
      const res = await fetch("/api/news", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, published }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setArticles((prev) => [{ id: data.id, ...form, published, author: "أنت", createdAt: new Date().toISOString() }, ...prev]);
      setForm({ title: "", content: "", images: [] });
      setShowForm(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const togglePublish = async (article) => {
    try {
      const res = await fetch(`/api/news/${article.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ published: !article.published }) });
      if (!res.ok) throw new Error();
      setArticles((prev) => prev.map((a) => (a.id === article.id ? { ...a, published: !a.published } : a)));
    } catch {
      alert("فشل التحديث");
    }
  };

  const removeArticle = async (id) => {
    if (!confirm("هل أنت متأكد من حذف هذا المقال؟")) return;
    try {
      const res = await fetch(`/api/news/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setArticles((prev) => prev.filter((a) => a.id !== id));
    } catch {
      alert("فشل الحذف");
    }
  };

  return (
    <div>
      <button onClick={() => setShowForm((v) => !v)} className="mb-6 px-6 py-3 bg-teal text-white font-medium hover:bg-teal-deep transition-colors duration-300">
        {showForm ? "إلغاء" : "+ مقال جديد"}
      </button>

      {showForm && (
        <div className="mb-10 max-w-3xl space-y-4 p-6 bg-white/50 border border-ink/10">
          <input type="text" placeholder="عنوان المقال" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} className="w-full px-4 py-3 bg-stone border border-ink/15 focus:outline-none focus:border-gold text-lg font-display" />
          <RichTextEditor value={form.content} onChange={(html) => setForm((f) => ({ ...f, content: html }))} />
          <div>
            <label className="block text-sm text-ink/70 mb-2">الصور</label>
            <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="text-sm" />
            {uploading && <p className="text-xs text-ink/50 mt-1">جارِ الرفع...</p>}
            {form.images.length > 0 && <div className="flex gap-2 mt-3 flex-wrap">{form.images.map((img, i) => <img key={i} src={img} alt="" className="w-20 h-20 object-cover" />)}</div>}
          </div>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <div className="flex gap-3">
            <button onClick={() => publish(true)} disabled={submitting} className="px-6 py-3 bg-teal text-white font-medium hover:bg-teal-deep transition-colors duration-300 disabled:opacity-60">نشر المقال</button>
            <button onClick={() => publish(false)} disabled={submitting} className="px-6 py-3 border border-ink/20 text-ink hover:bg-stone transition-colors duration-300 disabled:opacity-60">حفظ كمسودة</button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {articles.map((a) => (
          <div key={a.id} className="p-6 bg-white/50 border border-ink/10">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-display text-lg text-ink">{a.title}</h3>
                <p className="text-xs text-ink/50 mt-1">بواسطة {a.author} · {new Date(a.createdAt).toLocaleDateString("ar-SY")}</p>
              </div>
              <span className={`text-xs px-2 py-1 shrink-0 ${a.published ? "bg-teal/10 text-teal" : "bg-ink/10 text-ink/50"}`}>{a.published ? "منشور" : "مسودة"}</span>
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={() => togglePublish(a)} className="text-sm text-teal hover:text-gold transition-colors">{a.published ? "إلغاء النشر" : "نشر"}</button>
              <button onClick={() => removeArticle(a.id)} className="text-sm text-red-500 hover:text-red-700 transition-colors">حذف</button>
            </div>
          </div>
        ))}
        {articles.length === 0 && <p className="text-ink/50 text-sm">لا توجد مقالات بعد</p>}
      </div>
    </div>
  );
}