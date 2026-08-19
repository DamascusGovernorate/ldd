import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import connectDB from "@/lib/db";
import Project from "@/models/Project";
import Reveal from "@/app/components/ui/Reveal";
import Button from "@/app/components/ui/Button";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  await connectDB();
  const project = await Project.findOne({ slug }).select("name summary").lean();
  if (!project) return {};
  return {
    title: project.name,
    description: project.summary,
  };
}

const STATUS_LABELS = { active: "قيد التنفيذ", completed: "مكتمل", archived: "مؤرشف" };

export default async function ProjectPage({ params }) {
  const { slug } = await params;
  await connectDB();
  const project = await Project.findOne({ slug }).populate("owner", "fullName").lean();
  if (!project) notFound();

  return (
    <div className="bg-stone">
      <section className="relative min-h-[60vh] flex items-end overflow-hidden">
        {project.banner ? (
          <div className="absolute inset-0 z-0">
            <Image src={project.banner} alt={project.name} fill className="object-cover" priority sizes="100vw" />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/40 to-ink/20" />
          </div>
        ) : (
          <div className="absolute inset-0 bg-teal-deep" />
        )}
        <div className="pattern-khatam bg-[length:64px_64px] absolute inset-0 opacity-[0.1] mix-blend-overlay" />

        <div className="relative z-10 max-w-5xl mx-auto px-6 md:px-12 pb-16 md:pb-20">
          <span className="font-display text-gold-soft text-sm tracking-[0.3em]">مشروع تنموي</span>
          <div className="w-16 h-[2px] bg-gold my-5" />
          <h1 className="font-display text-4xl md:text-6xl text-white leading-tight">{project.name}</h1>
          <span className="inline-block mt-5 text-xs px-3 py-1.5 bg-gold text-ink font-medium">
            {STATUS_LABELS[project.status]}
          </span>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 py-16 md:py-24">
        <Reveal>
          <h2 className="font-display text-2xl text-ink mb-5">عن المشروع</h2>
          <p className="text-ink/70 leading-loose whitespace-pre-line">{project.summary}</p>
        </Reveal>

        <Reveal delay={150} className="mt-14 p-8 md:p-10 bg-teal-deep relative overflow-hidden text-center">
          <div className="pattern-khatam bg-[length:64px_64px] absolute inset-0 opacity-[0.08]" />
          <div className="relative">
            <h3 className="font-display text-2xl text-white mb-3">هل تريد الانضمام إلى هذا المشروع؟</h3>
            <p className="text-white/70 mb-8 max-w-md mx-auto">
              سجّل الآن، أكمل ملفك الشخصي، وستتمكن من التقدم بطلب تطوع لهذا المشروع مباشرة من لوحة التحكم.
            </p>
            <Button href={`/signup?next=/dashboard/volunteer`} variant="outlineLight">سجّل الآن</Button>
            <p className="text-white/50 text-sm mt-4">
              لديك حساب بالفعل؟ <Link href="/login" className="text-gold-soft hover:text-gold transition-colors">سجّل الدخول</Link>
            </p>
          </div>
        </Reveal>
      </section>
    </div>
  );
}