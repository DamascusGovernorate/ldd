import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import connectDB from "@/lib/db";
import Task from "@/models/Task";
import Project from "@/models/Project";
import { notifyUser } from "@/lib/notify";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  await connectDB();

  let query;
  if (session.role === "admin") {
    query = {};
  } else {
    const owned = await Project.find({ $or: [{ owner: session.uid }, { admins: session.uid }] }).select("_id");
    query = { $or: [{ assignedTo: session.uid }, { project: { $in: owned.map((p) => p._id) } }] };
  }

  const tasks = await Task.find(query).populate("project", "name").populate("assignedTo", "fullName email").populate("createdBy", "fullName").sort({ createdAt: -1 }).lean();
  return NextResponse.json({ tasks });
}

export async function POST(req) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

  const { title, summary, image, project, assignedTo } = await req.json();
  if (!title || !assignedTo?.length) return NextResponse.json({ error: "العنوان والمكلّفون مطلوبون" }, { status: 400 });

  await connectDB();

  if (session.role !== "admin") {
    if (!project) return NextResponse.json({ error: "المشروع مطلوب" }, { status: 400 });
    const proj = await Project.findById(project);
    if (!proj) return NextResponse.json({ error: "المشروع غير موجود" }, { status: 404 });
    const canAssign = proj.owner.toString() === session.uid || proj.admins.some((a) => a.toString() === session.uid);
    if (!canAssign) return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
    const allowedIds = new Set(proj.volunteers.map((v) => v.toString()));
    if (assignedTo.some((id) => !allowedIds.has(id))) return NextResponse.json({ error: "يمكن تكليف متطوعي المشروع فقط" }, { status: 403 });
  }

  const task = await Task.create({ title, summary, image, project: project || undefined, assignedTo, createdBy: session.uid });
  await Promise.all(assignedTo.map((uid) => notifyUser(uid, `تم تكليفك بمهمة جديدة: ${title}`, "/dashboard/tasks")));

  return NextResponse.json({ ok: true, id: task._id.toString() });
}