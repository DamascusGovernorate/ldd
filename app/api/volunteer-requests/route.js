import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import connectDB from "@/lib/db";
import VolunteerRequest from "@/models/VolunteerRequest";
import Project from "@/models/Project";
import { notifyUser } from "@/lib/notify";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  await connectDB();

  let requests;
  if (session.role === "admin") {
    requests = await VolunteerRequest.find().populate("project", "name owner").populate("user", "fullName email").sort({ createdAt: -1 }).lean();
  } else {
    const owned = await Project.find({ owner: session.uid }).select("_id");
    requests = await VolunteerRequest.find({ project: { $in: owned.map((p) => p._id) } }).populate("project", "name").populate("user", "fullName email").sort({ createdAt: -1 }).lean();
  }
  return NextResponse.json({ requests });
}

export async function POST(req) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

  const { projectId } = await req.json();
  if (!projectId) return NextResponse.json({ error: "المشروع مطلوب" }, { status: 400 });

  await connectDB();
  const project = await Project.findById(projectId);
  if (!project) return NextResponse.json({ error: "المشروع غير موجود" }, { status: 404 });

  const existing = await VolunteerRequest.findOne({ project: projectId, user: session.uid });
  if (existing) return NextResponse.json({ error: "لقد قمت بالتقديم لهذا المشروع مسبقاً" }, { status: 409 });

  await VolunteerRequest.create({ project: projectId, user: session.uid });
  await notifyUser(project.owner, `طلب تطوع جديد لمشروع: ${project.name}`, "/dashboard/volunteers");

  return NextResponse.json({ ok: true });
}