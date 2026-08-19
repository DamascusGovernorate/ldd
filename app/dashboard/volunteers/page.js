import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import connectDB from "@/lib/db";
import Project from "@/models/Project";
import Task from "@/models/Task";
import VolunteerRequest from "@/models/VolunteerRequest";
import PendingRequestsClient from "./PendingRequestsClient";

export default async function VolunteersPage() {
  const session = await getSession();
  await connectDB();

  let projects;
  if (session.role === "admin") {
    projects = await Project.find().populate("volunteers", "fullName email profile.mobilePhone").lean();
  } else {
    projects = await Project.find({ owner: session.uid }).populate("volunteers", "fullName email profile.mobilePhone").lean();
    if (projects.length === 0) redirect("/dashboard");
  }

  const projectIds = projects.map((p) => p._id);
  const tasks = await Task.find({ project: { $in: projectIds }, status: "done" }).select("title project participation").lean();

  const pointsByUser = {};
  tasks.forEach((t) => {
    t.participation?.forEach((p) => {
      if (!p.participated) return;
      const uid = p.user.toString();
      if (!pointsByUser[uid]) pointsByUser[uid] = [];
      pointsByUser[uid].push({ task: t.title, project: t.project.toString() });
    });
  });

  const pendingRequests = await VolunteerRequest.find({ project: { $in: projectIds }, status: "pending" }).populate("project", "name").populate("user", "fullName email").lean();
  const plainRequests = pendingRequests.map((r) => ({ id: r._id.toString(), project: r.project.name, user: r.user.fullName, email: r.user.email }));

  return (
    <div>
      <h1 className="font-display text-2xl md:text-3xl text-ink mb-2">المتطوعون</h1>
      <p className="text-ink/60 mb-8">جميع المتطوعين ونقاطهم في المشاريع</p>

      {plainRequests.length > 0 && (
        <div className="mb-10">
          <h2 className="text-sm text-ink/60 mb-3">طلبات تطوع قيد المراجعة ({plainRequests.length})</h2>
          <PendingRequestsClient requests={plainRequests} />
        </div>
      )}

      {projects.map((p) => (
        <div key={p._id} className="mb-10">
          <h2 className="font-display text-xl text-ink mb-4">{p.name}</h2>
          <div className="overflow-x-auto bg-white/50 border border-ink/10">
            <table className="w-full text-sm text-start">
              <thead>
                <tr className="border-b border-ink/10 text-ink/60">
                  <th className="px-4 py-3 font-medium">الاسم</th>
                  <th className="px-4 py-3 font-medium">البريد الإلكتروني</th>
                  <th className="px-4 py-3 font-medium">الهاتف</th>
                  <th className="px-4 py-3 font-medium">نقاط المشاركة</th>
                </tr>
              </thead>
              <tbody>
                {p.volunteers.map((v) => {
                  const points = (pointsByUser[v._id.toString()] || []).filter((x) => x.project === p._id.toString());
                  return (
                    <tr key={v._id} className="border-b border-ink/5">
                      <td className="px-4 py-3 text-ink">{v.fullName}</td>
                      <td className="px-4 py-3 text-ink/70" dir="ltr">{v.email}</td>
                      <td className="px-4 py-3 text-ink/70" dir="ltr">{v.profile?.mobilePhone || "—"}</td>
                      <td className="px-4 py-3">
                        <span className="text-teal font-medium">{points.length}</span>
                        {points.length > 0 && <span className="text-xs text-ink/40 block mt-1">{points.map((x) => x.task).join("، ")}</span>}
                      </td>
                    </tr>
                  );
                })}
                {p.volunteers.length === 0 && <tr><td colSpan={4} className="px-4 py-6 text-center text-ink/40">لا يوجد متطوعون بعد</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}