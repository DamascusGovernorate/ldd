"use client";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

/* Same palette as the XP challenge page, taken off the poster. */
const C = {
  blue: "#1168af",
  blueDeep: "#0d5590",
  navy: "#09446c",
  yellow: "#f9c218",
  red: "#e03c31",
  green: "#4cAF50",
  ink: "#12263c",
};

/** The four-colour diagonal ribbon used as a rule across the challenge page. */
function StripeBar({ className = "", height = 9 }) {
  return (
    <div
      className={className}
      aria-hidden="true"
      style={{
        height,
        backgroundImage: `repeating-linear-gradient(115deg,
          ${C.blue} 0 15px, #fff 15px 19px,
          ${C.red} 19px 34px, #fff 34px 38px,
          ${C.yellow} 38px 53px, #fff 53px 57px,
          ${C.green} 57px 72px, #fff 72px 76px)`,
      }}
    />
  );
}

const fieldStyle = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: 12,
  border: `2.5px solid ${C.navy}22`,
  background: "#fff",
  color: C.ink,
  font: "inherit",
  fontSize: 15,
  fontWeight: 700,
  outline: "none",
};

const buttonStyle = {
  width: "100%",
  padding: "13px 16px",
  borderRadius: 14,
  border: 0,
  background: C.blue,
  color: C.yellow,
  font: "inherit",
  fontSize: 16,
  fontWeight: 800,
  cursor: "pointer",
  boxShadow: "0 5px 0 rgba(0,0,0,0.18)",
  transition: "transform 150ms",
};

/** Only ever bounce back to a path on this site. */
function safeNext(value) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/dashboard";
  return value;
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = safeNext(searchParams.get("next"));

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
      router.push(next);
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="relative min-h-[80vh] flex items-center justify-center px-6 py-16 overflow-hidden"
      style={{ backgroundColor: C.navy }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          backgroundImage: "url(/pattern.svg)",
          backgroundRepeat: "repeat",
          backgroundSize: "120px 120px",
          opacity: 0.12,
        }}
      />

      <div className="relative w-full max-w-md">
        <div className="text-center mb-7">
          <img src="/logo-white.svg" alt="" aria-hidden="true" className="h-12 w-auto mx-auto mb-5" />
          <h1 className="text-3xl font-extrabold text-white">تسجيل الدخول</h1>
          <p className="mt-2 text-sm font-bold" style={{ color: "#ffffffaa" }}>
            أهلاً بعودتك
          </p>
        </div>

        <div
          style={{
            background: "#fff",
            borderRadius: 20,
            overflow: "hidden",
            boxShadow: "0 6px 0 rgba(0,0,0,0.22), 0 18px 34px rgba(2,12,32,0.35)",
          }}
        >


          <div className="p-7 sm:p-8">
            {step === 1 ? (
              <form onSubmit={handleRequestCode} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold mb-2" style={{ color: `${C.ink}99` }}>
                    البريد الإلكتروني
                  </label>
                  <input
                    type="email"
                    required
                    dir="ltr"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="example@gmail.com"
                    style={{ ...fieldStyle, textAlign: "end" }}
                    onFocus={(e) => (e.target.style.borderColor = C.blue)}
                    onBlur={(e) => (e.target.style.borderColor = `${C.navy}22`)}
                  />
                </div>

                {error && (
                  <p className="text-sm font-bold" style={{ color: C.red }}>
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  style={{ ...buttonStyle, opacity: loading ? 0.6 : 1 }}
                >
                  {loading ? "جارِ الإرسال..." : "إرسال رمز الدخول"}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerify} className="space-y-5">
                <p className="text-sm font-bold" style={{ color: `${C.ink}aa` }}>
                  أرسلنا رمزاً إلى{" "}
                  <span dir="ltr" style={{ color: C.blue }}>
                    {email}
                  </span>
                </p>

                <input
                  type="text"
                  required
                  inputMode="numeric"
                  maxLength={6}
                  dir="ltr"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                  placeholder="000000"
                  style={{
                    ...fieldStyle,
                    textAlign: "center",
                    fontSize: 26,
                    letterSpacing: "0.45em",
                    fontWeight: 800,
                  }}
                  onFocus={(e) => (e.target.style.borderColor = C.blue)}
                  onBlur={(e) => (e.target.style.borderColor = `${C.navy}22`)}
                />

                {error && (
                  <p className="text-sm font-bold" style={{ color: C.red }}>
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading || code.length !== 6}
                  style={{ ...buttonStyle, opacity: loading || code.length !== 6 ? 0.6 : 1 }}
                >
                  {loading ? "جارِ التحقق..." : "دخول"}
                </button>

                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-full text-sm font-bold"
                  style={{ background: "none", border: 0, color: `${C.ink}80`, cursor: "pointer" }}
                >
                  تعديل البريد الإلكتروني
                </button>
              </form>
            )}
          </div>
        </div>

        <p className="text-center text-sm font-bold mt-6" style={{ color: "#ffffffaa" }}>
          ليس لديك حساب؟{" "}
          <Link
            href={`/signup${next !== "/dashboard" ? `?next=${encodeURIComponent(next)}` : ""}`}
            style={{ color: C.yellow }}
            className="hover:underline"
          >
            إنشاء حساب
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}