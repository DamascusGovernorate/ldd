import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import connectDB from "@/lib/db";
import Initiative from "@/models/Initiative";
import User from "@/models/User";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  await connectDB();
  const query = session.role === "admin" ? {} : { createdBy: session.uid };
  const initiatives = await Initiative.find(query).populate("createdBy", "fullName email").sort({ createdAt: -1 }).lean();
  return NextResponse.json({ initiatives });
}

export async function POST(req) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

  await connectDB();
  const user = await User.findById(session.uid);
  if (!user.profile?.completed) return NextResponse.json({ error: "الرجاء إكمال ملفك الشخصي أولاً" }, { status: 403 });

  const { title, description } = await req.json();
  if (!title || !description) return NextResponse.json({ error: "العنوان والوصف مطلوبان" }, { status: 400 });

  await Initiative.create({ title, description, createdBy: session.uid });
  return NextResponse.json({ ok: true });
}