import Link from "next/link";
import { getSession } from "@/lib/auth";
import connectDB from "@/lib/db";
import User from "@/models/User";

export default async function DashboardHome() {
  const session = await getSession();
  await connectDB();
  const user = await User.findById(session.uid);

  return (
    <div>
      <h1 className="font-display text-2xl md:text-3xl text-ink">أهلاً بك، {user.fullName}</h1>
      <p className="text-ink/60 mt-2">{user.role === "admin" ? "لوحة تحكم المدير" : "لوحة التحكم الخاصة بك"}</p>

      {!user.profile?.completed && (
        <div className="mt-8 p-6 bg-gold/10 border border-gold/40">
          <p className="text-ink">
            لم تكمل معلومات حسابك بعد.{" "}
            <Link href="/dashboard/account" className="text-teal underline">أكمل ملفك الشخصي الآن</Link>
          </p>
        </div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
        {[
          { label: "المشاريع", value: "—" },
          { label: "المبادرات", value: "—" },
          { label: "المتطوعون", value: "—" },
          { label: "المهام المفتوحة", value: "—" },
        ].map((s) => (
          <div key={s.label} className="p-6 bg-white/50 border border-ink/10">
            <p className="text-3xl font-display text-teal">{s.value}</p>
            <p className="text-sm text-ink/60 mt-1">{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}