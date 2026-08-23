import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import connectDB from "@/lib/db";
import Mission from "@/models/Mission";
import Project from "@/models/Project";
import { notifyUser } from "@/lib/notify";

export async function POST(req, { params }) {
  const { id } = await params;
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

  await connectDB();
  const mission = await Mission.findById(id);
  if (!mission) return NextResponse.json({ error: "غير موجود" }, { status: 404 });
  if (mission.status !== "open") return NextResponse.json({ error: "هذه المهمة مغلقة" }, { status: 400 });

  const project = await Project.findById(mission.project);
  if (!project) return NextResponse.json({ error: "المشروع غير موجود" }, { status: 404 });
  const isMember = project.volunteers.some((v) => v.toString() === session.uid);
  if (!isMember) return NextResponse.json({ error: "يجب أن تكون عضواً مقبولاً في المشروع أولاً" }, { status: 403 });

  const already = mission.applicants.find((a) => a.user.toString() === session.uid);
  if (already) return NextResponse.json({ error: "لقد تقدمت لهذه المهمة مسبقاً" }, { status: 409 });

  mission.applicants.push({ user: session.uid, status: "pending" });
  await mission.save();

  await notifyUser(project.owner, `طلب انضمام جديد لمهمة: ${mission.title}`, `/dashboard/projects/${project._id}/missions`);

  return NextResponse.json({ ok: true });
}