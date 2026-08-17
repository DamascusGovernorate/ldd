"use client";
import { useState } from "react";

export default function ContactForm() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [status, setStatus] = useState("idle");

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("loading");
    try {
      // TODO: wire this up to your real contact endpoint
      await new Promise((res) => setTimeout(res, 900));
      setStatus("success");
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch {
      setStatus("error");
    }
  };

  const inputClasses =
    "w-full px-4 py-3 bg-stone border border-ink/15 focus:outline-none focus:border-gold transition-colors placeholder:text-ink/40";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <label htmlFor="name" className="block text-sm text-ink/70 mb-2">الاسم الكامل</label>
          <input
            id="name"
            name="name"
            type="text"
            required
            value={form.name}
            onChange={handleChange}
            placeholder="اكتب اسمك"
            className={inputClasses}
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm text-ink/70 mb-2">البريد الإلكتروني</label>
          <input
            id="email"
            name="email"
            type="email"
            required
            dir="ltr"
            value={form.email}
            onChange={handleChange}
            placeholder="example@email.com"
            className={`${inputClasses} text-end`}
          />
        </div>
      </div>

      <div>
        <label htmlFor="subject" className="block text-sm text-ink/70 mb-2">الموضوع</label>
        <input
          id="subject"
          name="subject"
          type="text"
          required
          value={form.subject}
          onChange={handleChange}
          placeholder="موضوع رسالتك"
          className={inputClasses}
        />
      </div>

      <div>
        <label htmlFor="message" className="block text-sm text-ink/70 mb-2">الرسالة</label>
        <textarea
          id="message"
          name="message"
          rows={5}
          required
          value={form.message}
          onChange={handleChange}
          placeholder="اكتب رسالتك هنا..."
          className={`${inputClasses} resize-none`}
        />
      </div>

      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full sm:w-auto px-8 py-3.5 bg-teal text-white font-medium hover:bg-teal-deep transition-colors duration-300 disabled:opacity-60"
      >
        {status === "loading" ? "جارِ الإرسال..." : "إرسال الرسالة"}
      </button>

      {status === "success" && (
        <p className="text-teal text-sm">تم إرسال رسالتك بنجاح، سنرد عليك قريباً!</p>
      )}
      {status === "error" && (
        <p className="text-red-600 text-sm">حدث خطأ أثناء الإرسال، حاول مرة أخرى.</p>
      )}
    </form>
  );
}