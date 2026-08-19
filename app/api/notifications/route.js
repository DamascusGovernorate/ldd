import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import connectDB from "@/lib/db";
import Notification from "@/models/Notification";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  await connectDB();
  const notifications = await Notification.find({ user: session.uid }).sort({ createdAt: -1 }).limit(50).lean();
  return NextResponse.json({ notifications });
}

export async function PATCH(req) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  const { id } = await req.json().catch(() => ({}));
  await connectDB();
  if (id) await Notification.updateOne({ _id: id, user: session.uid }, { read: true });
  else await Notification.updateMany({ user: session.uid, read: false }, { read: true });
  return NextResponse.json({ ok: true });
}