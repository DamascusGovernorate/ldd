import { getSession } from "@/lib/auth";
import connectDB from "@/lib/db";
import Initiative from "@/models/Initiative";
import User from "@/models/User";
import InitiativesClient from "./InitiativesClient";

export default async function InitiativesPage() {
  const session = await getSession();
  await connectDB();

  const query = session.role === "admin" ? {} : { createdBy: session.uid };
  const initiatives = await Initiative.find(query).populate("createdBy", "fullName email").sort({ createdAt: -1 }).lean();
  const user = await User.findById(session.uid).select("profile.completed").lean();

  const plain = initiatives.map((i) => ({
    id: i._id.toString(), title: i.title, description: i.description, status: i.status,
    createdBy: i.createdBy?.fullName || "—", createdAt: i.createdAt.toISOString(),
  }));

  return (
    <div>
      <h1 className="font-display text-2xl md:text-3xl text-ink mb-2">المبادرات</h1>
      <p className="text-ink/60 mb-8">{session.role === "admin" ? "مراجعة مبادرات المستخدمين" : "مبادراتك المقترحة"}</p>
      <InitiativesClient initial={plain} isAdmin={session.role === "admin"} canSubmit={Boolean(user?.profile?.completed)} />
    </div>
  );
}