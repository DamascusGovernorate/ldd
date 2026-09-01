"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const inputClasses = "w-full px-4 py-3 bg-white border border-ink/15 focus:outline-none focus:border-gold transition-colors placeholder:text-ink/40";

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRequestCode = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/request-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, purpose: "login" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setStep(2);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code, purpose: "login" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-stone px-6 py-16">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <span className="font-display text-gold text-sm tracking-[0.3em]">أهلاً بعودتك</span>
          <div className="w-16 h-[2px] bg-gold my-4 mx-auto" />
          <h1 className="font-display text-3xl text-ink">تسجيل الدخول</h1>
        </div>

        <div className="bg-white/60 border border-ink/10 p-8">
          {step === 1 ? (
            <form onSubmit={handleRequestCode} className="space-y-5">
              <div>
                <label className="block text-sm text-ink/70 mb-2">البريد الإلكتروني</label>
                <input type="email" required dir="ltr" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="example@gmail.com" className={`${inputClasses} text-end`} />
              </div>
              {error && <p className="text-red-600 text-sm">{error}</p>}
              <button type="submit" disabled={loading} className="w-full py-3.5 bg-teal text-white font-medium hover:bg-teal-deep transition-colors duration-300 disabled:opacity-60">
                {loading ? "جارِ الإرسال..." : "إرسال رمز الدخول"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerify} className="space-y-5">
              <p className="text-sm text-ink/70">
                أرسلنا رمزاً إلى <span dir="ltr" className="text-teal">{email}</span>
              </p>
              <input type="text" required inputMode="numeric" maxLength={6} dir="ltr" value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))} placeholder="000000" className={`${inputClasses} text-center text-2xl tracking-[0.5em]`} />
              {error && <p className="text-red-600 text-sm">{error}</p>}
              <button type="submit" disabled={loading || code.length !== 6} className="w-full py-3.5 bg-teal text-white font-medium hover:bg-teal-deep transition-colors duration-300 disabled:opacity-60">
                {loading ? "جارِ التحقق..." : "دخول"}
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-sm text-ink/60 mt-6">
          ليس لديك حساب؟ <Link href="/signup" className="text-teal hover:text-gold transition-colors">إنشاء حساب</Link>
        </p>
      </div>
    </div>
  );
}