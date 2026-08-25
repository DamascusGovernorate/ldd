import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import connectDB from "@/lib/db";
import Mission from "@/models/Mission";
import User from "@/models/User";
import { getXpContext } from "@/lib/xpChallengeServer";
import { normalizeStatus, isVisibleToVolunteers } from "@/lib/xpChallenge";
import ManagerBoard from "./ManagerBoard";
import VolunteerBoard from "./VolunteerBoard";

export const metadata = { title: "تحدي XP" };
export const dynamic = "force-dynamic";

function Notice({ title, children }) {
  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-2xl text-ink mb-3">{title}</h1>
      <div className="text-ink/70 leading-loose text-sm">{children}</div>
    </div>
  );
}

export default async function XpChallengeDashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login?next=/dashboard/xp-challenge");

  const ctx = await getXpContext(session);
  if (!ctx) {
    return <Notice title="تحدي XP">لم يتم إنشاء مشروع تحدي XP بعد. أنشئه من صفحة المشاريع أولاً.</Notice>;
  }

  // Neither a manager nor an accepted volunteer.
  if (!ctx.canManage && !ctx.isVolunteer) {
    return (
      <Notice title="تحدي XP">
        <p>يجب قبولك في مشروع تحدي XP قبل أن تتمكن من رؤية المهام.</p>
        <Link href="/projects/xp-tahadi" className="inline-block mt-4 px-5 py-2.5 bg-teal text-white text-sm">
          قدّم طلب انضمام
        </Link>
      </Notice>
    );
  }

  if (!ctx.neighborhood && !ctx.unscoped) {
    return (
      <Notice title="تحدي XP">
        <p>
          {ctx.canManage
            ? "لتتمكن من إنشاء المهام، حدد الحي الذي تشرف عليه في حسابك الشخصي."
            : "حدد حيّك في حسابك الشخصي لترى مهام حيّك."}
        </p>
        <Link href="/dashboard/account" className="inline-block mt-4 px-5 py-2.5 bg-teal text-white text-sm">
          إكمال الحساب
        </Link>
      </Notice>
    );
  }

  await connectDB();

  const filter = { project: ctx.project._id };
  const scope = ctx.canManage ? ctx.scope : ctx.neighborhood;
  if (scope) filter.neighborhood = scope;

  const missionDocs = await Mission.find(filter).sort({ createdAt: -1 }).lean();

  const projectId = ctx.project._id.toString();
  const base = (m) => ({
    id: m._id.toString(),
    title: m.title,
    summary: m.summary || "",
    objectives: m.objectives || [],
    type: m.type || "main",
    icon: m.icon || null,
    images: m.images || [],
    neighborhood: m.neighborhood,
    googleMapsUrl: m.googleMapsUrl || null,
    xpReward: m.xpReward || 0,
    status: normalizeStatus(m.status),
  });

  if (ctx.canManage) {
    // Resolve applicant identities in one query rather than N populates.
    const ids = [
      ...new Set(
        missionDocs.flatMap((m) => [
          ...(m.applicants || []).map((a) => a.user?.toString()),
          ...(m.participation || []).map((p) => p.user?.toString()),
        ])
      ),
    ].filter(Boolean);

    const people = await User.find({ _id: { $in: ids } })
      .select("fullName email profile.avatar profile.neighborhood")
      .lean();
    const byId = new Map(
      people.map((u) => [
        u._id.toString(),
        {
          id: u._id.toString(),
          name: u.fullName,
          email: u.email,
          avatar: u.profile?.avatar || null,
          neighborhood: u.profile?.neighborhood || null,
        },
      ])
    );

    const missions = missionDocs.map((m) => ({
      ...base(m),
      applicants: (m.applicants || [])
        .map((a) => ({ ...byId.get(a.user?.toString()), status: a.status }))
        .filter((a) => a.id),
      participation: (m.participation || []).map((p) => ({
        userId: p.user?.toString(),
        completed: Boolean(p.completed),
        average: p.average ?? null,
        awardedXP: p.awardedXP ?? 0,
      })),
    }));

    return (
      <ManagerBoard
        projectId={projectId}
        missions={missions}
        neighborhood={ctx.neighborhood}
        unscoped={ctx.unscoped}
      />
    );
  }

  // Ended missions vanish for volunteers.
  const missions = missionDocs.filter((m) => isVisibleToVolunteers(m.status)).map((m) => {
    const mine = (m.applicants || []).find((a) => a.user?.toString() === ctx.uid);
    const myPart = (m.participation || []).find((p) => p.user?.toString() === ctx.uid);
    return {
      ...base(m),
      acceptedCount: (m.applicants || []).filter((a) => a.status === "accepted").length,
      applicantCount: (m.applicants || []).length,
      myStatus: mine?.status || "open",
      myCompleted: Boolean(myPart?.completed),
      myAward: myPart?.awardedXP ?? null,
    };
  });

  return <VolunteerBoard missions={missions} neighborhood={ctx.neighborhood} xpPoints={ctx.user.xpPoints || 0} />;
}
