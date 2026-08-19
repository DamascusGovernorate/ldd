import { getSession } from "@/lib/auth";
import connectDB from "@/lib/db";
import Report from "@/models/Report";
import ReportsClient from "./ReportsClient";

export default async function ReportsPage() {
  const session = await getSession();
  await connectDB();
  const query = session.role === "admin" ? {} : { user: session.uid };
  const reports = await Report.find(query).populate("user", "fullName email").sort({ createdAt: -1 }).lean();

  const plain = reports.map((r) => ({ id: r._id.toString(), subject: r.subject, message: r.message, status: r.status, user: r.user?.fullName || "—", email: r.user?.email || "", createdAt: r.createdAt.toISOString() }));

  return (
    <div>
      <h1 className="font-display text-2xl md:text-3xl text-ink mb-2">التقارير</h1>
      <p className="text-ink/60 mb-8">{session.role === "admin" ? "جميع البلاغات المرسلة" : "بلاغاتك السابقة"}</p>
      <ReportsClient initial={plain} isAdmin={session.role === "admin"} />
    </div>
  );
}