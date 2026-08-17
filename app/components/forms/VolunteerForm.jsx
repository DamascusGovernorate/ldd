"use client";
import { useState } from "react";

const interestAreas = [
  "التنمية الاقتصادية وريادة الأعمال",
  "البيئة والتشجير",
  "الفعاليات المجتمعية",
  "التعليم والتدريب",
  "الإعلام والتوثيق",
];

export default function VolunteerForm() {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    area: interestAreas[0],
    message: "",
  });
  const [status, setStatus] = useState("idle");

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("loading");
    try {
      // TODO: wire this up to your real volunteer-registration endpoint
      await new Promise((res) => setTimeout(res, 900));
      setStatus("success");
      setForm({ name: "", phone: "", email: "", area: interestAreas[0], message: "" });
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
          <label htmlFor="phone" className="block text-sm text-ink/70 mb-2">رقم الهاتف</label>
          <input
            id="phone"
            name="phone"
            type="tel"
            required
            dir="ltr"
            value={form.phone}
            onChange={handleChange}
            placeholder="09XXXXXXXX"
            className={`${inputClasses} text-end`}
          />
        </div>
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

      <div>
        <label htmlFor="area" className="block text-sm text-ink/70 mb-2">مجال الاهتمام</label>
        <select
          id="area"
          name="area"
          value={form.area}
          onChange={handleChange}
          className={inputClasses}
        >
          {interestAreas.map((a) => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="message" className="block text-sm text-ink/70 mb-2">لماذا تريد التطوع معنا؟</label>
        <textarea
          id="message"
          name="message"
          rows={4}
          value={form.message}
          onChange={handleChange}
          placeholder="أخبرنا قليلاً عن نفسك ودوافعك..."
          className={`${inputClasses} resize-none`}
        />
      </div>

      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full sm:w-auto px-8 py-3.5 bg-teal text-white font-medium hover:bg-teal-deep transition-colors duration-300 disabled:opacity-60"
      >
        {status === "loading" ? "جارِ الإرسال..." : "سجّل كمتطوع"}
      </button>

      {status === "success" && (
        <p className="text-teal text-sm">تم استلام طلبك بنجاح، سنتواصل معك قريباً!</p>
      )}
      {status === "error" && (
        <p className="text-red-600 text-sm">حدث خطأ أثناء الإرسال، حاول مرة أخرى.</p>
      )}
    </form>
  );
}