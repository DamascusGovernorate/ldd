import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import connectDB from "@/lib/db";
import Project from "@/models/Project";
import Task from "@/models/Task";
import Initiative from "@/models/Initiative";
import User from "@/models/User";
import VolunteerRequest from "@/models/VolunteerRequest";

export default async function AnalyticsPage() {
  const session = await getSession();
  await connectDB();

  let projects;
  if (session.role === "admin") {
    projects = await Project.find().lean();
  } else {
    projects = await Project.find({ $or: [{ owner: session.uid }, { admins: session.uid }] }).lean();
    if (projects.length === 0) redirect("/dashboard");
  }

  const projectIds = projects.map((p) => p._id);
  const totalVolunteers = new Set(projects.flatMap((p) => p.volunteers.map((v) => v.toString()))).size;
  const tasks = await Task.find({ project: { $in: projectIds } }).lean();
  const doneTasks = tasks.filter((t) => t.status === "done").length;

  const stats = [
    { label: "المشاريع", value: projects.length },
    { label: "المتطوعون", value: totalVolunteers },
    { label: "المهام المفتوحة", value: tasks.length - doneTasks },
    { label: "المهام المنتهية", value: doneTasks },
  ];

  if (session.role === "admin") {
    stats.push(
      { label: "إجمالي المستخدمين", value: await User.countDocuments() },
      { label: "المبادرات", value: await Initiative.countDocuments() },
      { label: "طلبات تطوع قيد المراجعة", value: await VolunteerRequest.countDocuments({ status: "pending" }) }
    );
  }

  return (
    <div>
      <h1 className="font-display text-2xl md:text-3xl text-ink mb-2">التحليلات</h1>
      <p className="text-ink/60 mb-8">{session.role === "admin" ? "نظرة شاملة على المنصة" : "إحصاءات مشاريعك"}</p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((s) => (
          <div key={s.label} className="p-6 bg-white/50 border border-ink/10">
            <p className="text-3xl font-display text-teal">{s.value}</p>
            <p className="text-sm text-ink/60 mt-1">{s.label}</p>
          </div>
        ))}
      </div>
      <div className="mt-10">
        <h2 className="font-display text-xl text-ink mb-4">المشاريع</h2>
        <div className="overflow-x-auto bg-white/50 border border-ink/10">
          <table className="w-full text-sm text-start">
            <thead>
              <tr className="border-b border-ink/10 text-ink/60">
                <th className="px-4 py-3 font-medium">المشروع</th>
                <th className="px-4 py-3 font-medium">المتطوعون</th>
                <th className="px-4 py-3 font-medium">الحالة</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((p) => (
                <tr key={p._id} className="border-b border-ink/5">
                  <td className="px-4 py-3 text-ink">{p.name}</td>
                  <td className="px-4 py-3 text-ink/70">{p.volunteers.length}</td>
                  <td className="px-4 py-3 text-ink/70">{p.status === "active" ? "قيد التنفيذ" : p.status === "completed" ? "مكتمل" : "مؤرشف"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}