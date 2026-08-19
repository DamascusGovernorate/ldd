import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import connectDB from "@/lib/db";
import News from "@/models/News";

export async function PATCH(req, { params }) {
  const { id } = await params;
  const session = await getSession();
  if (!session || !["admin", "news_reporter"].includes(session.role)) return NextResponse.json({ error: "غير مصرح" }, { status: 403 });

  await connectDB();
  const article = await News.findById(id);
  if (!article) return NextResponse.json({ error: "غير موجود" }, { status: 404 });
  if (session.role !== "admin" && article.author.toString() !== session.uid) return NextResponse.json({ error: "غير مصرح" }, { status: 403 });

  const { title, content, images, published } = await req.json();
  if (title !== undefined) article.title = title;
  if (content !== undefined) article.content = content;
  if (images !== undefined) article.images = images;
  if (published !== undefined) article.published = published;
  await article.save();

  return NextResponse.json({ ok: true });
}

export async function DELETE(req, { params }) {
  const { id } = await params;
  const session = await getSession();
  if (!session || !["admin", "news_reporter"].includes(session.role)) return NextResponse.json({ error: "غير مصرح" }, { status: 403 });

  await connectDB();
  const article = await News.findById(id);
  if (!article) return NextResponse.json({ error: "غير موجود" }, { status: 404 });
  if (session.role !== "admin" && article.author.toString() !== session.uid) return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
  await article.deleteOne();
  return NextResponse.json({ ok: true });
}