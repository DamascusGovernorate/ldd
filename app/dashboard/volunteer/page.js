import { getSession } from "@/lib/auth";
import connectDB from "@/lib/db";
import Project from "@/models/Project";
import VolunteerRequest from "@/models/VolunteerRequest";
import VolunteerBrowser from "./VolunteerBrowser";

export default async function VolunteerPage() {
  const session = await getSession();
  await connectDB();

  const projects = await Project.find({ status: "active" }).select("name summary banner volunteers").lean();
  const myRequests = await VolunteerRequest.find({ user: session.uid }).select("project status").lean();
  const requestMap = {};
  myRequests.forEach((r) => { requestMap[r.project.toString()] = r.status; });

  const plainProjects = projects.map((p) => ({
    id: p._id.toString(), name: p.name, summary: p.summary, banner: p.banner,
    volunteerCount: p.volunteers.length, requestStatus: requestMap[p._id.toString()] || null,
  }));

  return (
    <div>
      <h1 className="font-display text-2xl md:text-3xl text-ink mb-2">التطوع</h1>
      <p className="text-ink/60 mb-8">استعرض المشاريع النشطة وقدّم طلب تطوع</p>
      <VolunteerBrowser projects={plainProjects} />
    </div>
  );
}