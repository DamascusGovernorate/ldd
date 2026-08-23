import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import connectDB from "@/lib/db";
import Mission from "@/models/Mission";
import Project from "@/models/Project";
import { notifyUser } from "@/lib/notify";

async function canManageMission(session, mission) {
  if (session.role === "admin") return true;
  const project = await Project.findById(mission.project);
  if (!project) return false;
  return project.owner.toString() === session.uid || project.admins.some((a) => a.toString() === session.uid);
}

export async function PATCH(req, { params }) {
  const { id } = await params;
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

  const { userId, status } = await req.json();
  if (!["accepted", "rejected"].includes(status)) return NextResponse.json({ error: "قيمة غير صالحة" }, { status: 400 });

  await connectDB();
  const mission = await Mission.findById(id);
  if (!mission) return NextResponse.json({ error: "غير موجود" }, { status: 404 });
  if (!(await canManageMission(session, mission))) return NextResponse.json({ error: "غير مصرح" }, { status: 403 });

  const applicant = mission.applicants.find((a) => a.user.toString() === userId);
  if (!applicant) return NextResponse.json({ error: "غير موجود" }, { status: 404 });
  applicant.status = status;
  await mission.save();

  await notifyUser(userId, status === "accepted" ? `تم قبولك في مهمة: ${mission.title}` : `تم رفض طلبك لمهمة: ${mission.title}`, "/projects/xp-tahadi");

  return NextResponse.json({ ok: true });
}