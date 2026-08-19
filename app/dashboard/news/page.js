import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import connectDB from "@/lib/db";
import News from "@/models/News";
import NewsClient from "./NewsClient";

export default async function NewsPage() {
  const session = await getSession();
  if (!["admin", "news_reporter"].includes(session.role)) redirect("/dashboard");

  await connectDB();
  const news = await News.find().populate("author", "fullName").sort({ createdAt: -1 }).lean();
  const plain = news.map((n) => ({ id: n._id.toString(), title: n.title, content: n.content, images: n.images, published: n.published, author: n.author?.fullName || "—", createdAt: n.createdAt.toISOString() }));

  return (
    <div>
      <h1 className="font-display text-2xl md:text-3xl text-ink mb-2">الأخبار</h1>
      <p className="text-ink/60 mb-8">إدارة المقالات الإخبارية</p>
      <NewsClient initial={plain} />
    </div>
  );
}