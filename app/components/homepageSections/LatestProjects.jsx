import Image from "next/image";
import connectDB from "@/lib/db";
import Project from "@/models/Project";
import Reveal from "../ui/Reveal";
import Button from "../ui/Button";

const STATUS_LABELS = { active: "قيد التنفيذ", completed: "مكتمل", archived: "مؤرشف" };

// Projects that should link out to an external site instead of /projects/[slug]
const EXTERNAL_LINKS = {
  "6a857a732587a609c39e02ae": "https://xp-tahadi.leo2b-destination.workers.dev/",
};

export default async function LatestProjects() {
  await connectDB();
  const projects = await Project.find({ status: { $ne: "archived" } })
    .sort({ createdAt: -1 })
    .limit(2)
    .lean();

  if (projects.length === 0) return null;

  return (
    <section className="relative bg-teal-deep py-20 md:py-28 overflow-hidden">
      <div className="pattern-khatam bg-[length:64px_64px] absolute inset-0 opacity-[0.06]" />
      <div className="relative max-w-7xl mx-auto px-6 md:px-12">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-14 gap-6">
          <div>
            <span className="font-display text-gold-soft text-sm tracking-[0.3em]">أحدث المشاريع</span>
            <div className="w-16 h-[2px] bg-gold my-4" />
            <h2 className="font-display text-3xl md:text-4xl text-white">مشاريعنا الحالية</h2>
          </div>
          <Button href="/projects" variant="outlineLight">جميع المشاريع</Button>
        </div>

        <div className="space-y-6">
          {projects.map((p, i) => {
            const id = p._id.toString();
            const href = EXTERNAL_LINKS[id] || `/projects/${p.slug}`;

            return (
              <Reveal key={id} delay={i * 100}>
                <a href={href} className="group grid md:grid-cols-2 border border-white/10 hover:border-gold-soft/50 transition-colors duration-500 bg-ink/20">
                  <div className="relative aspect-[16/10] overflow-hidden">
                    {p.banner && (
                      <Image
                        src={p.banner}
                        alt={p.name}
                        fill
                        className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      />
                    )}
                    <span className="absolute top-4 start-4 px-3 py-1 text-xs font-medium bg-gold text-ink">
                      {STATUS_LABELS[p.status]}
                    </span>
                  </div>
                  <div className="p-8 md:p-10 flex flex-col justify-center">
                    <h3 className="font-display text-2xl md:text-3xl text-white group-hover:text-gold-soft transition-colors">{p.name}</h3>
                    <p className="mt-4 text-white/70 leading-loose line-clamp-4">{p.summary}</p>
                    <span className="mt-6 text-sm text-gold-soft">
                      {p.slug === "xp-tahadi" ? "العب الآن ←" : "عرض التفاصيل ←"}
                    </span>
                  </div>
                </a>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}