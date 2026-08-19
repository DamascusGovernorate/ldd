import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import connectDB from "@/lib/db";
import Project from "@/models/Project";
import { notifyUser } from "@/lib/notify";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  await connectDB();

  const query = session.role === "admin" ? {} : { $or: [{ owner: session.uid }, { admins: session.uid }, { volunteers: session.uid }] };
  const projects = await Project.find(query)
    .populate("owner", "fullName email")
    .populate("admins", "fullName email")
    .populate("volunteers", "fullName email")
    .sort({ createdAt: -1 })
    .lean();

  return NextResponse.json({ projects });
}

export async function POST(req) {
  const session = await getSession();
  if (!session || session.role !== "admin") return NextResponse.json({ error: "غير مصرح" }, { status: 403 });

  const { name, banner, summary, owner, admins, volunteers } = await req.json();
  if (!name || !owner) return NextResponse.json({ error: "الاسم ومالك المشروع مطلوبان" }, { status: 400 });

  await connectDB();
  const project = await Project.create({ name, banner, summary, owner, admins: admins || [], volunteers: volunteers || [] });

  await Promise.all(
    [owner, ...(admins || [])].map((id) => notifyUser(id, `تم تعيينك في مشروع جديد: ${name}`, `/dashboard/projects/${project._id}`))
  );

  return NextResponse.json({ ok: true, id: project._id.toString() });
}