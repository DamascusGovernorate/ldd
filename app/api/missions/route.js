import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import connectDB from "@/lib/db";
import Mission from "@/models/Mission";
import { getXpContext, canTouchNeighborhood, normalizeStatus, isVisibleToVolunteers } from "@/lib/xpChallenge";
import { getXpContext } from "@/lib/xpChallengeServer";

export async function GET(req) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get("project");
  if (!projectId) return NextResponse.json({ error: "المشروع مطلوب" }, { status: 400 });

  const ctx = await getXpContext(session, { projectId });
  if (!ctx) return NextResponse.json({ error: "المشروع غير موجود" }, { status: 404 });
  if (!ctx.canManage && !ctx.isVolunteer) {
    return NextResponse.json({ error: "يجب أن تكون عضواً في المشروع" }, { status: 403 });
  }

  await connectDB();

  // Managers see their own district (site admin/owner: all). Volunteers only
  // ever see missions in the neighborhood on their profile.
  const filter = { project: projectId };
  const scope = ctx.canManage ? ctx.scope : ctx.neighborhood;
  if (scope) filter.neighborhood = scope;
  else if (!ctx.unscoped) return NextResponse.json({ missions: [] });

  const query = Mission.find(filter).sort({ createdAt: -1 });
  if (ctx.canManage) query.populate("applicants.user", "fullName email profile.avatar profile.neighborhood");
  const missions = await query.lean();

  if (ctx.canManage) return NextResponse.json({ missions });

  // Volunteers never receive other people's applications, and ended
  // missions disappear for them entirely.
  const safe = missions.filter((m) => isVisibleToVolunteers(m.status)).map((m) => {
    const mine = (m.applicants || []).find((a) => a.user?.toString() === ctx.uid);
    const myParticipation = (m.participation || []).find((p) => p.user?.toString() === ctx.uid);
    return {
      ...m,
      status: normalizeStatus(m.status),
      applicants: undefined,
      participation: undefined,
      applicantCount: (m.applicants || []).length,
      acceptedCount: (m.applicants || []).filter((a) => a.status === "accepted").length,
      myStatus: mine?.status || "open",
      myCompleted: Boolean(myParticipation?.completed),
    };
  });

  return NextResponse.json({ missions: safe });
}

export async function POST(req) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

  const body = await req.json();
  const { project: projectId, title, summary, objectives, type, icon, images, googleMapsUrl, xpReward } = body;
  if (!projectId || !title) {
    return NextResponse.json({ error: "المشروع والعنوان مطلوبان" }, { status: 400 });
  }

  const ctx = await getXpContext(session, { projectId });
  if (!ctx) return NextResponse.json({ error: "المشروع غير موجود" }, { status: 404 });
  if (!ctx.canManage) return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
  if (ctx.blockedForMissingNeighborhood) {
    return NextResponse.json({ error: "حدد حيّك في حسابك الشخصي قبل إنشاء المهام" }, { status: 400 });
  }

  // A scoped manager cannot publish outside their own district, whatever the
  // client sends. Only the site admin/owner may choose a neighborhood.
  const neighborhood = ctx.unscoped ? body.neighborhood : ctx.neighborhood;
  if (!neighborhood) return NextResponse.json({ error: "الحي مطلوب" }, { status: 400 });
  if (!canTouchNeighborhood(ctx, neighborhood)) {
    return NextResponse.json({ error: "لا يمكنك إنشاء مهام خارج حيّك" }, { status: 403 });
  }

  const points = Number(xpReward);
  if (!Number.isFinite(points) || points < 1 || points > 1000) {
    return NextResponse.json({ error: "النقاط يجب أن تكون بين 1 و 1000" }, { status: 400 });
  }

  await connectDB();
  const mission = await Mission.create({
    project: projectId,
    title,
    summary,
    objectives: (objectives || []).filter((o) => o && o.trim()),
    type: type === "side" ? "side" : "main",
    icon,
    images: images || [],
    neighborhood,
    googleMapsUrl,
    xpReward: points,
    createdBy: ctx.uid,
  });

  return NextResponse.json({ ok: true, id: mission._id.toString() });
}
