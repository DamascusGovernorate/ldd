import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import connectDB from "@/lib/db";
import Project from "@/models/Project";

export default async function ProjectsPage() {
  const session = await getSession();
  if (session.role !== "admin") redirect("/dashboard");

  await connectDB();
  const projects = await Project.find().populate("owner", "fullName").sort({ createdAt: -1 }).lean();

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl md:text-3xl text-ink mb-2">المشاريع</h1>
          <p className="text-ink/60">{projects.length} مشروع</p>
        </div>
        <Link href="/dashboard/projects/new" className="px-6 py-3 bg-teal text-white font-medium hover:bg-teal-deep transition-colors duration-300">+ مشروع جديد</Link>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((p) => (
          <Link key={p._id} href={`/dashboard/projects/${p._id}`} className="block bg-white/50 border border-ink/10 hover:border-gold/50 transition-colors duration-300">
            {p.banner && <div className="aspect-video bg-cover bg-center" style={{ backgroundImage: `url(${p.banner})` }} />}
            <div className="p-5">
              <h3 className="font-display text-lg text-ink">{p.name}</h3>
              <p className="text-xs text-ink/50 mt-1">المالك: {p.owner?.fullName}</p>
              <span className={`inline-block mt-3 text-xs px-2 py-1 ${p.status === "active" ? "bg-teal/10 text-teal" : p.status === "completed" ? "bg-gold/10 text-gold" : "bg-ink/10 text-ink/50"}`}>
                {p.status === "active" ? "قيد التنفيذ" : p.status === "completed" ? "مكتمل" : "مؤرشف"}
              </span>
            </div>
          </Link>
        ))}
        {projects.length === 0 && <p className="text-ink/50 text-sm">لا توجد مشاريع بعد</p>}
      </div>
    </div>
  );
}