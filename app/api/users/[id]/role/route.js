import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import connectDB from "@/lib/db";
import User from "@/models/User";

export async function PATCH(req, { params }) {
  const { id } = await params;
  const session = await getSession();
  if (!session || session.role !== "admin") return NextResponse.json({ error: "غير مصرح" }, { status: 403 });

  const { role } = await req.json();
  if (!["admin", "user", "news_reporter"].includes(role)) {
    return NextResponse.json({ error: "دور غير صالح" }, { status: 400 });
  }

  await connectDB();
  await User.findByIdAndUpdate(id, { role });
  return NextResponse.json({ ok: true });
}