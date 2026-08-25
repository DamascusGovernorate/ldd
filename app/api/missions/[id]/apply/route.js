import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import connectDB from "@/lib/db";
import Mission from "@/models/Mission";
import { notifyUser } from "@/lib/notify";
import { getXpContext, canApplyTo, normalizeStatus } from "@/lib/xpChallenge";
import { getXpContext } from "@/lib/xpChallengeServer";
export async function POST(req, { params }) {
  const { id } = await params;
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

  await connectDB();
  const mission = await Mission.findById(id);
  if (!mission) return NextResponse.json({ error: "غير موجود" }, { status: 404 });
  const status = normalizeStatus(mission.status);
  if (status === "ended") return NextResponse.json({ error: "هذه المهمة منتهية" }, { status: 400 });
  if (!canApplyTo(status)) {
    return NextResponse.json({ error: "بدأت المهمة والتقديم مغلق" }, { status: 400 });
  }

  const ctx = await getXpContext(session, { projectId: mission.project });
  if (!ctx) return NextResponse.json({ error: "المشروع غير موجود" }, { status: 404 });

  if (!ctx.isVolunteer) {
    return NextResponse.json({ error: "يجب أن تكون عضواً مقبولاً في المشروع أولاً" }, { status: 403 });
  }
  if (!ctx.neighborhood) {
    return NextResponse.json({ error: "حدد حيّك في حسابك الشخصي قبل التقديم" }, { status: 400 });
  }
  // A volunteer only works in their own district.
  if (ctx.neighborhood !== mission.neighborhood) {
    return NextResponse.json({ error: "هذه المهمة في حي آخر" }, { status: 403 });
  }

  const already = mission.applicants.find((a) => a.user.toString() === ctx.uid);
  if (already) return NextResponse.json({ error: "لقد تقدمت لهذه المهمة مسبقاً" }, { status: 409 });

  mission.applicants.push({ user: ctx.uid, status: "pending" });
  await mission.save();

  // Tell whoever actually runs this district, not just the project owner.
  const recipients = new Set([
    ...(ctx.project.admins || []).map((a) => a.toString()),
    ctx.project.owner?.toString(),
  ]);
  recipients.delete(ctx.uid);

  await Promise.all(
    [...recipients].filter(Boolean).map((rid) =>
      notifyUser(rid, `طلب انضمام جديد لمهمة: ${mission.title}`, "/dashboard/xp-challenge")
    )
  );

  return NextResponse.json({ ok: true });
}
