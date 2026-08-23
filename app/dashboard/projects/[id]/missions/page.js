import { redirect, notFound } from "next/navigation";
import { getSession } from "@/lib/auth";
import connectDB from "@/lib/db";
import Project from "@/models/Project";
import Mission from "@/models/Mission";
import MissionsManager from "./MissionsManager";

export default async function ProjectMissionsPage({ params }) {
  const { id } = await params;
  const session = await getSession();
  await connectDB();

  const project = await Project.findById(id).lean();
  if (!project) notFound();

  const isOwner = project.owner.toString() === session.uid;
  const isAdmin = project.admins.some((a) => a.toString() === session.uid);
  if (session.role !== "admin" && !isOwner && !isAdmin) redirect("/dashboard");

  const missions = await Mission.find({ project: id })
    .populate("applicants.user", "fullName email")
    .sort({ createdAt: -1 })
    .lean();

  const plainMissions = JSON.parse(JSON.stringify(missions));

  return (
    <div>
      <h1 className="font-display text-2xl md:text-3xl text-ink mb-2">مهمات: {project.name}</h1>
      <p className="text-ink/60 mb-8">إدارة نقاط المهام على الخريطة، مراجعة الطلبات، وإغلاق المهام</p>
      <MissionsManager projectId={id} initialMissions={plainMissions} />
    </div>
  );
}