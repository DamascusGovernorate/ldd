import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import connectDB from "@/lib/db";
import Project from "@/models/Project";

async function canManage(session, project) {
  return session.role === "admin" || project.owner.toString() === session.uid;
}

export async function GET(req, { params }) {
  const { id } = await params;
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  await connectDB();
  const project = await Project.findById(id).populate("owner admins volunteers", "fullName email").lean();
  if (!project) return NextResponse.json({ error: "غير موجود" }, { status: 404 });
  return NextResponse.json({ project });
}

export async function PATCH(req, { params }) {
  const { id } = await params;
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  await connectDB();

  const project = await Project.findById(id);
  if (!project) return NextResponse.json({ error: "غير موجود" }, { status: 404 });
  if (!(await canManage(session, project))) return NextResponse.json({ error: "غير مصرح" }, { status: 403 });

  const body = await req.json();

  if (body.slug && body.slug !== project.slug) {
    if (!/^[a-z0-9-]+$/.test(body.slug)) {
      return NextResponse.json({ error: "الرابط المختصر يجب أن يحتوي أحرفاً إنجليزية وأرقاماً وشرطات فقط" }, { status: 400 });
    }
    const clash = await Project.findOne({ slug: body.slug, _id: { $ne: project._id } });
    if (clash) return NextResponse.json({ error: "هذا الرابط المختصر مستخدم بالفعل" }, { status: 409 });
  }

  const allowed = ["name", "slug", "banner", "summary", "status"];
  if (session.role === "admin") allowed.push("owner", "admins", "volunteers");
  for (const f of allowed) if (body[f] !== undefined) project[f] = body[f];
  await project.save();

  return NextResponse.json({ ok: true });
}

export async function DELETE(req, { params }) {
  const { id } = await params;
  const session = await getSession();
  if (!session || session.role !== "admin") return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
  await connectDB();
  await Project.findByIdAndDelete(id);
  return NextResponse.json({ ok: true });
}