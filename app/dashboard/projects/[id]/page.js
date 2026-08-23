import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import connectDB from "@/lib/db";
import Project from "@/models/Project";
import User from "@/models/User";
import ProjectForm from "../ProjectForm";

export default async function ProjectDetailPage({ params }) {
  const { id } = await params;
  const session = await getSession();
  await connectDB();

  const project = await Project.findById(id).populate("owner admins volunteers", "fullName email").lean();
  if (!project) notFound();

  const isOwner = project.owner._id.toString() === session.uid;
  if (session.role !== "admin" && !isOwner) redirect("/dashboard");

  const users = await User.find().select("fullName email").sort({ fullName: 1 }).lean();
  const plainUsers = users.map((u) => ({ id: u._id.toString(), fullName: u.fullName, email: u.email }));

  const plainProject = JSON.parse(JSON.stringify(project));

  return (
    <div>
      <h1 className="font-display text-2xl md:text-3xl text-ink mb-4">{project.name}</h1>
      {(session.role === "admin" || isOwner) && (
        <Link href={`/dashboard/projects/${id}/missions`} className="inline-block mb-8 text-sm text-teal hover:text-gold transition-colors">
          إدارة مهمات الخريطة ←
        </Link>
      )}
      {session.role === "admin" ? (
        <ProjectForm users={plainUsers} initial={plainProject} projectId={id} />
      ) : (
        <div className="max-w-3xl space-y-6">
          <p className="text-ink/70 leading-loose">{project.summary}</p>
          <div>
            <h3 className="text-sm text-ink/60 mb-2">المتطوعون ({project.volunteers.length})</h3>
            <ul className="space-y-1">
              {project.volunteers.map((v) => <li key={v._id} className="text-sm text-ink">{v.fullName} — {v.email}</li>)}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}