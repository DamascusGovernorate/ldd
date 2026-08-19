import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import connectDB from "@/lib/db";
import VolunteerRequest from "@/models/VolunteerRequest";
import Project from "@/models/Project";
import { notifyUser } from "@/lib/notify";

export async function PATCH(req, { params }) {
  const { id } = await params;
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

  const { status } = await req.json();
  if (!["accepted", "rejected"].includes(status)) return NextResponse.json({ error: "قيمة غير صالحة" }, { status: 400 });

  await connectDB();
  const request = await VolunteerRequest.findById(id).populate("project");
  if (!request) return NextResponse.json({ error: "غير موجود" }, { status: 404 });

  const isOwner = request.project.owner.toString() === session.uid;
  if (session.role !== "admin" && !isOwner) return NextResponse.json({ error: "غير مصرح" }, { status: 403 });

  request.status = status;
  await request.save();

  if (status === "accepted") {
    await Project.findByIdAndUpdate(request.project._id, { $addToSet: { volunteers: request.user } });
  }

  await notifyUser(request.user, status === "accepted" ? `تم قبول طلب تطوعك في مشروع: ${request.project.name}` : `تم رفض طلب تطوعك في مشروع: ${request.project.name}`, "/dashboard/volunteer");
  return NextResponse.json({ ok: true });
}