import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import connectDB from "@/lib/db";
import Project from "@/models/Project";
import Mission from "@/models/Mission";
import User from "@/models/User";
import Reveal from "@/app/components/ui/Reveal";
import Button from "@/app/components/ui/Button";
import ApplyPrompt from "./ApplyPrompt";
import GameApp from "./GameApp";
import RoleSwitcher from "./RoleSwitcher";

export const metadata = {
  title: "تحدي XP",
  description:
    "تحدي XP يكتشف ويدعم المواهب الريادية الشابة في محافظة دمشق من خلال مسار تدريبي مكثف يجمع بين التعليم العملي والإرشاد الفردي.",
};

const timeline = [
  { step: "01", title: "التسجيل والفرز", desc: "تقديم الطلبات ومراجعة الأفكار الريادية الأولية من المتقدمين." },
  { step: "02", title: "المسار التدريبي", desc: "ورشات عملية في بناء نماذج الأعمال والتسويق والتمويل، مع إرشاد فردي مباشر." },
  { step: "03", title: "عرض المشاريع", desc: "تقديم الأفكار المطوَّرة أمام لجنة من الخبراء والمستثمرين." },
  { step: "04", title: "التمويل والانطلاق", desc: "تمويل أفضل الأفكار وتحويلها إلى مشاريع فعلية على أرض الواقع." },
];

const highlights = [
  { label: "مسار تدريبي", value: "8 أسابيع" },
  { label: "مجال التركيز", value: "ريادة الأعمال" },
  { label: "الفئة المستهدفة", value: "شباب دمشق" },
  { label: "التمويل", value: "لأفضل الأفكار" },
];

function MarketingContent() {
  return (
    <div className="bg-stone">
      <section className="relative min-h-[70vh] flex items-end overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image src="/projects/xp-tahadi.jpg" alt="تحدي XP" fill className="object-cover" priority sizes="100vw" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/50 to-ink/20" />
        </div>
        <div className="pattern-khatam bg-[length:64px_64px] absolute inset-0 opacity-[0.1] mix-blend-overlay" />
        <div className="relative z-10 max-w-5xl mx-auto px-6 md:px-12 pb-16 md:pb-24">
          <span className="font-display text-gold-soft text-sm tracking-[0.3em]">تمكين اقتصادي وريادة أعمال</span>
          <div className="w-16 h-[2px] bg-gold my-5" />
          <h1 className="font-display text-5xl md:text-7xl text-white leading-tight">تحدي XP</h1>
          <p className="mt-6 text-white/80 text-lg max-w-xl leading-loose">اكتشاف ودعم المواهب الريادية الشابة في محافظة دمشق</p>
        </div>
      </section>

      <section className="bg-teal-deep py-8">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4">
          {highlights.map((h, i) => (
            <div key={h.label} className={`text-center px-4 py-2 ${i !== highlights.length - 1 ? "md:border-e md:border-white/10" : ""}`}>
              <p className="font-display text-gold-soft text-lg">{h.value}</p>
              <p className="text-white/50 text-xs mt-1">{h.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 py-16 md:py-24">
        <Reveal>
          <span className="font-display text-gold text-sm tracking-[0.3em]">عن التحدي</span>
          <div className="w-16 h-[2px] bg-gold my-5" />
          <h2 className="font-display text-3xl text-ink mb-6">من فكرة إلى مشروع حقيقي</h2>
          <p className="text-ink/70 leading-loose text-lg">
            يهدف تحدي XP إلى اكتشاف ودعم المواهب الريادية الشابة في محافظة دمشق، من خلال مسار
            تدريبي مكثف يجمع بين التعليم العملي والإرشاد الفردي وورشات بناء نماذج الأعمال، تتوّج
            بعرض المشاريع أمام لجنة من الخبراء وتمويل أفضل الأفكار لتحويلها إلى مشاريع حقيقية على
            أرض الواقع.
          </p>
        </Reveal>
      </section>

      <section className="bg-white/40 py-16 md:py-24">
        <div className="max-w-5xl mx-auto px-6">
          <Reveal className="text-center mb-14">
            <span className="font-display text-gold text-sm tracking-[0.3em]">رحلة المتحدي</span>
            <div className="w-16 h-[2px] bg-gold my-4 mx-auto" />
            <h2 className="font-display text-3xl text-ink">مراحل التحدي</h2>
          </Reveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {timeline.map((t, i) => (
              <Reveal key={t.step} delay={i * 100}>
                <div className="p-6 h-full bg-stone border-t-2 border-gold">
                  <span className="font-display text-4xl text-gold-soft">{t.step}</span>
                  <h3 className="font-display text-lg text-ink mt-4 mb-2">{t.title}</h3>
                  <p className="text-sm text-ink/60 leading-relaxed">{t.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 py-16 md:py-24">
        <Reveal className="p-8 md:p-12 bg-teal-deep relative overflow-hidden text-center">
          <div className="pattern-khatam bg-[length:64px_64px] absolute inset-0 opacity-[0.08]" />
          <div className="relative">
            <span className="font-display text-gold-soft text-sm tracking-[0.3em]">انضم إلى التحدي</span>
            <div className="w-16 h-[2px] bg-gold my-5 mx-auto" />
            <h3 className="font-display text-3xl text-white mb-4">هل لديك فكرة ريادية؟</h3>
            <p className="text-white/70 mb-8 max-w-md mx-auto leading-loose">
              سجّل الآن، أكمل ملفك الشخصي، وقدّم طلب انضمامك إلى تحدي XP مباشرة من لوحة التحكم.
            </p>
            <Button href="/signup?next=/dashboard/volunteer" variant="outlineLight">سجّل الآن</Button>
            <p className="text-white/50 text-sm mt-5">
              لديك حساب بالفعل؟ <Link href="/login" className="text-gold-soft hover:text-gold transition-colors">سجّل الدخول</Link>
            </p>
          </div>
        </Reveal>
      </section>
    </div>
  );
}

export default async function XpTahadiPage({ searchParams }) {
  const session = await getSession();
  const params = await searchParams;
  const isAdmin = session?.role === "admin";
  // Only a real admin's session can ever set this — never trust a client-side role.
  const viewAs = isAdmin ? params?.viewAs : undefined;

  const switcher = isAdmin ? (
    <Suspense fallback={null}>
      <RoleSwitcher />
    </Suspense>
  ) : null;

  if (!session) return <MarketingContent />;

  if (viewAs === "guest") {
    return (
      <>
        <MarketingContent />
        {switcher}
      </>
    );
  }

  await connectDB();
  const project = await Project.findOne({ slug: "xp-tahadi" }).lean();
  if (!project) {
    return (
      <>
        <MarketingContent />
        {switcher}
      </>
    );
  }

  const realIsMember = project.volunteers.some((v) => v.toString() === session.uid);

  // Site admins always get the full game view by default (they can manage
  // everything from the dashboard regardless of project membership) unless
  // they explicitly ask to preview the "not accepted yet" state.
  const isMember =
    viewAs === "applicant" ? false :
    viewAs === "contestant" || viewAs === "manager" ? true :
    isAdmin ? true :
    realIsMember;

  const preview = Boolean(viewAs);

  if (!isMember) {
    return (
      <>
        <ApplyPrompt projectId={project._id.toString()} preview={preview} />
        {switcher}
      </>
    );
  }

  const [missionDocs, volunteerDocs, currentUser] = await Promise.all([
    Mission.find({ project: project._id }).sort({ createdAt: -1 }).lean(),
    User.find({ _id: { $in: project.volunteers } })
      .select("fullName xpPoints profile.neighborhood profile.avatar")
      .sort({ xpPoints: -1 })
      .lean(),
    User.findById(session.uid).select("fullName xpPoints profile.neighborhood profile.avatar").lean(),
  ]);

  const publicUser = (doc) => ({
    id: doc._id.toString(),
    name: doc.fullName,
    xpPoints: doc.xpPoints || 0,
    neighborhood: doc.profile?.neighborhood || null,
    avatar: doc.profile?.avatar || null,
  });

  const users = volunteerDocs.map(publicUser);
  const byId = new Map(users.map((u) => [u.id, u]));

  // Counts are aggregated on the server so the client never receives the
  // full applicant list of every mission — only the signed-in user's own
  // state plus the roster of people already accepted.
  const missions = missionDocs.map((m) => {
    const applicants = m.applicants || [];
    const participation = m.participation || [];
    const mine = applicants.find((a) => a.user?.toString() === session.uid);
    const myParticipation = participation.find((p) => p.user?.toString() === session.uid);

    return {
      id: m._id.toString(),
      title: m.title,
      summary: m.summary || "",
      objectives: m.objectives || [],
      icon: m.icon || null,
      images: m.images || [],
      neighborhood: m.neighborhood,
      googleMapsUrl: m.googleMapsUrl || null,
      xpReward: m.xpReward || 0,
      status: m.status,
      createdAt: m.createdAt ? new Date(m.createdAt).toISOString() : null,

      applicantCount: applicants.length,
      acceptedCount: applicants.filter((a) => a.status === "accepted").length,
      pendingCount: applicants.filter((a) => a.status === "pending").length,
      completedCount: participation.filter((p) => p.completed).length,

      participants: applicants
        .filter((a) => a.status === "accepted")
        .map((a) => byId.get(a.user?.toString()))
        .filter(Boolean),

      myStatus: mine?.status || "open",
      myCompleted: Boolean(myParticipation?.completed),
    };
  });

  const neighborhoodTotals = {};
  volunteerDocs.forEach((u) => {
    const n = u.profile?.neighborhood;
    if (!n) return;
    neighborhoodTotals[n] = (neighborhoodTotals[n] || 0) + (u.xpPoints || 0);
  });
  missions.forEach((m) => {
    if (!m.neighborhood) return;
    neighborhoodTotals[m.neighborhood] = neighborhoodTotals[m.neighborhood] || 0;
  });

  const neighborhoods = Object.entries(neighborhoodTotals)
    .map(([neighborhood, xpPoints]) => ({
      neighborhood,
      xpPoints,
      missions: missions.filter((m) => m.neighborhood === neighborhood).length,
      members: users.filter((u) => u.neighborhood === neighborhood).length,
    }))
    .sort((a, b) => b.xpPoints - a.xpPoints);

  const data = {
    currentUserId: session.uid,
    me: currentUser ? publicUser(currentUser) : null,
    missions,
    users,
    neighborhoods,
    preview,
    previewRole: viewAs,
    projectId: project._id.toString(),
    canManage:
      isAdmin ||
      project.owner.toString() === session.uid ||
      (project.admins || []).some((a) => a.toString() === session.uid),
  };

  return (
    <>
      <GameApp {...data} />
      {switcher}
    </>
  );
}
