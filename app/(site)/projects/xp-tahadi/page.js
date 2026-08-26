import { Suspense } from "react";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import connectDB from "@/lib/db";
import Project from "@/models/Project";
import Mission from "@/models/Mission";
import User from "@/models/User";
import Reveal from "@/app/components/ui/Reveal";
import ApplyPrompt from "./ApplyPrompt";
import GameApp from "./GameApp";
import RoleSwitcher from "./RoleSwitcher";

export const metadata = {
  title: "تحدي XP",
  description:
    "تحدي XP يكتشف ويدعم المواهب الريادية الشابة في محافظة دمشق من خلال مسار تدريبي مكثف يجمع بين التعليم العملي والإرشاد الفردي.",
};

/* ==================================================================
   Brand palette, taken off the poster
================================================================== */
const C = {
  blue: "#1168af",
  blueDeep: "#0d5590",
  yellow: "#f9c218",
  red: "#e03c31",
  green: "#4cAF50",
  navy: "#09446c",
};

/* ------------------------------------------------------------------
   Assets — all in /public.

   Plain <img> rather than next/image: these are SVGs of unknown
   intrinsic size, and Next's optimizer refuses SVG unless you set
   dangerouslyAllowSVG in next.config.
------------------------------------------------------------------- */
const ASSETS = {
  logo: "/Logo.svg",
  map: "/MapImage.svg",
  howItWorks: "/HowTheGameWorks.svg",
  challenges: "/challanges.svg",
  navLogo: "/logo-white.svg",
  pattern: "/pattern.svg",
};

// Right-to-left in the poster: شارك top-right → اجمع xp bottom-left
const HOW_STEPS = [
  { src: "/share-1.svg", alt: "شارك" },
  { src: "/chooseYourChallenge-2.svg", alt: "إختر تحديك" },
  { src: "/compete-3.svg", alt: "نافس" },
  { src: "/collectXP-4.svg", alt: "اجمع XP" },
];

// Left-to-right in the poster: تبرع بقمامتك top-left → الطريق للجميع bottom-right
const CHALLENGE_CARDS = [
  { src: "/donate-1.svg", alt: "تبرع بقمامتك" },
  { src: "/playgrounds-2.svg", alt: "ملاعبنا" },
  { src: "/theirLaugh-3.svg", alt: "ضحكتهم علينا" },
  { src: "/roadsForAll-4.svg", alt: "الطريق للجميع" },
];

/* ==================================================================
   Decorative pieces from the poster
================================================================== */

/** The four-colour diagonal ribbon used as a section rule. */
function StripeBar({ className = "", height = 11 }) {
  return (
    <div
      className={className}
      aria-hidden="true"
      style={{
        height,
        backgroundImage: `repeating-linear-gradient(115deg,
          ${C.blue} 0 15px, #fff 15px 19px,
          ${C.red} 19px 34px, #fff 34px 38px,
          ${C.yellow} 38px 53px, #fff 53px 57px,
          ${C.green} 57px 72px, #fff 72px 76px)`,
      }}
    />
  );
}

/** Solid navy bar with the white logo on the right, linking home. */
function PageNav() {
  return (
    <nav
      dir="ltr"
      className="w-full h-16 flex items-center justify-end px-4 sm:px-6"
      style={{ backgroundColor: C.navy }}
    >
      <Link
        href="/"
        aria-label="الصفحة الرئيسية"
        className="inline-flex items-center rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
      >
        <img src={ASSETS.navLogo} alt="الصفحة الرئيسية" className="h-10 w-auto" />
      </Link>
    </nav>
  );
}

/** Yellow dot field — three rows in the poster. */
function DotField({ rows = 3, className = "" }) {
  return (
    <div
      className={className}
      aria-hidden="true"
      style={{
        height: rows * 26,
        backgroundImage: `radial-gradient(circle, ${C.yellow} 4.5px, transparent 5px)`,
        backgroundSize: "34px 26px",
        backgroundPosition: "0 6px",
      }}
    />
  );
}

/** Single-row artwork strip. `dir` decides which end counts as first. */
function AssetGrid({ items, dir = "rtl" }) {
  return (
    <div dir={dir} className="grid grid-cols-4 gap-2 sm:gap-3">
      {items.map((item, i) => (
        <Reveal key={item.src} delay={i * 80}>
          <img src={item.src} alt={item.alt} className="w-full h-auto" loading="lazy" />
        </Reveal>
      ))}
    </div>
  );
}

function SignupButton({ className = "" }) {
  return (
    <Link
      href="/signup?next=/projects/xp-tahadi"
      className={`inline-flex items-center justify-center px-9 py-3.5 text-base sm:text-lg font-extrabold
                  rounded-xl shadow-[0_5px_0_rgba(0,0,0,0.18)] transition-transform duration-150
                  hover:-translate-y-0.5 active:translate-y-[3px] active:shadow-none ${className}`}
      style={{ backgroundColor: C.blue, color: C.yellow }}
    >
      إبدأ التحدي
    </Link>
  );
}

function MarketingContent({ signup = false, apply = null }) {
  return (
    <div className="relative bg-white overflow-x-clip">
      <div
        className="absolute inset-0 opacity-[0.3] pointer-events-none"
        aria-hidden="true"
        style={{
          backgroundImage: `url(${ASSETS.pattern})`,
          backgroundRepeat: "repeat",
          backgroundSize: "120px 120px",
        }}
      />

      <div className="relative">

        {/* ---------- hero ---------- */}
        <section className="w-full px-3 sm:px-4 pt-6 pb-3 md:pt-10">
          <div dir="ltr" className="grid md:grid-cols-2 gap-6 lg:gap-8 items-center">
            <Reveal className="flex flex-col items-center gap-5">
              <img
                src={ASSETS.logo}
                alt="تحدي XP — العبها تنمية"
                className="w-full max-w-[360px] h-auto"
                style={{ margin: "auto" }}
              />

              {signup && <SignupButton />}
            </Reveal>

            <Reveal delay={120}>
              <img src={ASSETS.map} alt="اللعبة بدأت — خريطة أحياء دمشق" className="w-full h-auto" />
            </Reveal>
          </div>
        </section>

        {/* dots under the logo, ribbon under the map */}
        <div dir="ltr" className="w-full px-3 sm:px-4 grid md:grid-cols-2 gap-6 lg:gap-8 items-center pb-6 md:pb-10">
          <DotField className="w-[230px] sm:w-[280px]" />
          <StripeBar className="w-full md:w-[70%] md:ms-auto" />
        </div>

        {/* ---------- join / apply slot ---------- */}
        {apply && <section id="apply" className="pb-6 px-3 sm:px-4">{apply}</section>}

        {/* ---------- how the game works ---------- */}
        <section className="sm:w-full px-3 sm:px-4 pb-6">
          <div dir="ltr" className="grid md:grid-cols-2 gap-4 lg:gap-6">
            <Reveal>
              <img src={ASSETS.howItWorks} alt="كيف تعمل اللعبة؟" className="w-1/2 h-auto m-auto" loading="lazy" />
            </Reveal>

            <div className="w-full">
              <AssetGrid items={HOW_STEPS} dir="rtl" />
            </div>
          </div>
        </section>

        {/* ribbon under the devices, dots under the cards */}
        <div dir="ltr" className="w-full px-3 sm:px-4 grid md:grid-cols-2 gap-6 lg:gap-8 items-center py-6 md:py-10">
          <StripeBar className="w-full" />
          <DotField className="w-[230px] sm:w-[280px] md:ms-auto " />
        </div>

        {/* ---------- the challenges ---------- */}
        <section className="w-full px-3 sm:px-4 pb-10 md:pb-14">
          <div dir="ltr" className="grid md:grid-cols-2 gap-6 lg:gap-8 items-center">
            <div className="order-2 md:order-1 w-full">
              <AssetGrid items={CHALLENGE_CARDS} dir="ltr" />
            </div>

            <Reveal className="order-1 md:order-2 ">
              <img src={ASSETS.challenges} alt="التحديات" className="w-1/2 h-auto m-auto" loading="lazy" />
            </Reveal>
          </div>
        </section>

        {signup && (
          <section className="pb-14 text-center px-3 sm:px-4">
            <Reveal>
              <SignupButton />
              <p className="text-ink/50 text-sm mt-5">
                لديك حساب بالفعل؟{" "}
                <Link
                  href="/login?next=/projects/xp-tahadi"
                  className="font-bold hover:underline"
                  style={{ color: C.blue }}
                >
                  سجّل الدخول
                </Link>
              </p>
            </Reveal>
          </section>
        )}

        <StripeBar className="w-full" height={13} />
      </div>
    </div>
  );
}

/* ==================================================================
   Page body — NOT exported. The default export below wraps it.
================================================================== */
async function XpTahadiContent({ searchParams }) {
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

  if (!session) return <MarketingContent signup />;

  if (viewAs === "guest") {
    return (
      <>
        <MarketingContent signup />
        {switcher}
      </>
    );
  }

  await connectDB();
  const project = await Project.findOne({ slug: "xp-tahadi" }).lean();
  if (!project) {
    return (
      <>
        <MarketingContent signup />
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

  // Signed in but not accepted yet: the same landing page, with the join
  // card slotted in under the hero instead of the sign-up button.
  if (!isMember) {
    return (
      <>
        <MarketingContent apply={<ApplyPrompt projectId={project._id.toString()} preview={preview} />} />
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
  // A volunteer only ever sees missions in the neighborhood on their profile.
  // Site admins, the owner and project managers see everything they cover.
  const canManageProject =
    isAdmin ||
    project.owner.toString() === session.uid ||
    (project.admins || []).some((a) => a.toString() === session.uid);
  const myNeighborhood = currentUser?.profile?.neighborhood || null;
  // Ended missions leave the map for everyone — the game board shows what is
  // live, the dashboard keeps the archive.
  const liveDocs = missionDocs.filter((m) => !["ended", "closed"].includes(m.status));
  const visibleDocs = canManageProject
    ? liveDocs
    : liveDocs.filter((m) => myNeighborhood && m.neighborhood === myNeighborhood);

  const missions = visibleDocs.map((m) => {
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
      type: m.type || "main",
      status: m.status === "open" ? "upcoming" : m.status,
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
    scopeNeighborhood: canManageProject ? null : myNeighborhood,
    canManage: canManageProject,
  };

  return (
    <>
      <GameApp {...data} />
      {switcher}
    </>
  );
}

/* ==================================================================
   The one and only default export — nav bar on top of every branch.
================================================================== */
export default async function XpTahadiPage(props) {
  return (
    <>
      <PageNav />
      <XpTahadiContent {...props} />
    </>
  );
}