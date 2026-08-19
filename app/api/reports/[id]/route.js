import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import connectDB from "@/lib/db";
import Report from "@/models/Report";

export async function PATCH(req, { params }) {
  const { id } = await params;
  const session = await getSession();
  if (!session || session.role !== "admin") return NextResponse.json({ error: "غير مصرح" }, { status: 403 });

  const { status } = await req.json();
  if (!["open", "reviewed", "closed"].includes(status)) return NextResponse.json({ error: "قيمة غير صالحة" }, { status: 400 });

  await connectDB();
  await Report.findByIdAndUpdate(id, { status });
  return NextResponse.json({ ok: true });
}