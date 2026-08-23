import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import connectDB from "@/lib/db";
import Mission from "@/models/Mission";
import Project from "@/models/Project";

async function canManage(session, project) {
  return session.role === "admin" || project.owner.toString() === session.uid || project.admins.some((a) => a.toString() === session.uid);
}

export async function GET(req) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get("project");
  if (!projectId) return NextResponse.json({ error: "المشروع مطلوب" }, { status: 400 });

  await connectDB();
  const missions = await Mission.find({ project: projectId })
    .populate("applicants.user", "fullName email")
    .sort({ createdAt: -1 })
    .lean();

  return NextResponse.json({ missions });
}

export async function POST(req) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

  const { project: projectId, title, summary, objectives, icon, images, neighborhood, googleMapsUrl, xpReward } = await req.json();
  if (!projectId || !title || !neighborhood) {
    return NextResponse.json({ error: "المشروع والعنوان والحي مطلوبة" }, { status: 400 });
  }

  await connectDB();
  const project = await Project.findById(projectId);
  if (!project) return NextResponse.json({ error: "المشروع غير موجود" }, { status: 404 });
  if (!(await canManage(session, project))) return NextResponse.json({ error: "غير مصرح" }, { status: 403 });

  const mission = await Mission.create({
    project: projectId,
    title,
    summary,
    objectives: objectives || [],
    icon,
    images: images || [],
    neighborhood,
    googleMapsUrl,
    xpReward: xpReward || 5,
    createdBy: session.uid,
  });

  return NextResponse.json({ ok: true, id: mission._id.toString() });
}