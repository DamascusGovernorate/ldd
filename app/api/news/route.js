import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import connectDB from "@/lib/db";
import News from "@/models/News";

export async function GET() {
  const session = await getSession();
  if (!session || !["admin", "news_reporter"].includes(session.role)) return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
  await connectDB();
  const news = await News.find().populate("author", "fullName").sort({ createdAt: -1 }).lean();
  return NextResponse.json({ news });
}

export async function POST(req) {
  const session = await getSession();
  if (!session || !["admin", "news_reporter"].includes(session.role)) return NextResponse.json({ error: "غير مصرح" }, { status: 403 });

  const { title, content, images, published } = await req.json();
  if (!title || !content) return NextResponse.json({ error: "العنوان والمحتوى مطلوبان" }, { status: 400 });

  await connectDB();
  const article = await News.create({ title, content, images: images || [], author: session.uid, published: Boolean(published) });
  return NextResponse.json({ ok: true, id: article._id.toString() });
}