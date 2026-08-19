import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import connectDB from "@/lib/db";
import Task from "@/models/Task";
import Project from "@/models/Project";

async function canManageTask(session, task) {
  if (session.role === "admin") return true;
  if (!task.project) return false;
  const project = await Project.findById(task.project);
  if (!project) return false;
  return project.owner.toString() === session.uid || project.admins.some((a) => a.toString() === session.uid);
}

export async function PATCH(req, { params }) {
  const { id } = await params;
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

  await connectDB();
  const task = await Task.findById(id);
  if (!task) return NextResponse.json({ error: "غير موجود" }, { status: 404 });
  if (!(await canManageTask(session, task))) return NextResponse.json({ error: "غير مصرح" }, { status: 403 });

  const { participation } = await req.json();
  if (!Array.isArray(participation)) return NextResponse.json({ error: "بيانات غير صالحة" }, { status: 400 });

  task.participation = participation.map((p) => ({ user: p.user, participated: Boolean(p.participated), note: p.note || "" }));
  task.status = "done";
  await task.save();

  return NextResponse.json({ ok: true });
}