import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import connectDB from "@/lib/db";
import Report from "@/models/Report";
import { checkRateLimit } from "@/lib/rateLimit";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  await connectDB();
  const query = session.role === "admin" ? {} : { user: session.uid };
  const reports = await Report.find(query).populate("user", "fullName email").sort({ createdAt: -1 }).lean();
  return NextResponse.json({ reports });
}

export async function POST(req) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

  const { subject, message } = await req.json();
  if (!subject || !message) return NextResponse.json({ error: "الموضوع والرسالة مطلوبان" }, { status: 400 });

  const limit = await checkRateLimit(`report:${session.uid}`, { max: 5, windowMs: 60 * 60 * 1000 });
  if (!limit.allowed) return NextResponse.json({ error: "لقد قمت بإرسال عدة بلاغات، حاول لاحقاً" }, { status: 429 });

  await connectDB();
  await Report.create({ user: session.uid, subject, message });
  return NextResponse.json({ ok: true });
}