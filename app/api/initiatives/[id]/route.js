import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import connectDB from "@/lib/db";
import Initiative from "@/models/Initiative";
import { notifyUser } from "@/lib/notify";

export async function PATCH(req, { params }) {
  const { id } = await params;
  const session = await getSession();
  if (!session || session.role !== "admin") return NextResponse.json({ error: "غير مصرح" }, { status: 403 });

  const { status } = await req.json();
  if (!["accepted", "rejected"].includes(status)) return NextResponse.json({ error: "قيمة غير صالحة" }, { status: 400 });

  await connectDB();
  const initiative = await Initiative.findByIdAndUpdate(id, { status, reviewedBy: session.uid }, { new: true });
  if (!initiative) return NextResponse.json({ error: "غير موجود" }, { status: 404 });

  await notifyUser(initiative.createdBy, status === "accepted" ? `تم قبول مبادرتك: ${initiative.title}` : `تم رفض مبادرتك: ${initiative.title}`, "/dashboard/initiatives");
  return NextResponse.json({ ok: true });
}