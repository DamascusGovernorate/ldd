import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import connectDB from "@/lib/db";
import Mission from "@/models/Mission";
import User from "@/models/User";
import { notifyUser } from "@/lib/notify";
import {
  getXpContext,
  canTouchNeighborhood,
  normalizeStatus,
  isVisibleToVolunteers,
  scoreRatings,
  awardFor,
  EVALUATION_CRITERIA,
} from "@/lib/xpChallenge";
import { getXpContext } from "@/lib/xpChallengeServer";

const STATUSES = ["upcoming", "active", "ended"];

/** Managers may only touch missions inside the district they cover. */
async function gate(session, missionId) {
  await connectDB();
  const mission = await Mission.findById(missionId);
  if (!mission) return { res: NextResponse.json({ error: "غير موجود" }, { status: 404 }) };

  const ctx = await getXpContext(session, { projectId: mission.project });
  if (!ctx) return { res: NextResponse.json({ error: "غير موجود" }, { status: 404 }) };
  if (!canTouchNeighborhood(ctx, mission.neighborhood)) {
    return { res: NextResponse.json({ error: "غير مصرح" }, { status: 403 }) };
  }
  return { mission, ctx };
}

export async function GET(req, { params }) {
  const { id } = await params;
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

  await connectDB();
  const mission = await Mission.findById(id).lean();
  if (!mission) return NextResponse.json({ error: "غير موجود" }, { status: 404 });

  const ctx = await getXpContext(session, { projectId: mission.project });
  if (!ctx) return NextResponse.json({ error: "غير موجود" }, { status: 404 });

  const isManager = canTouchNeighborhood(ctx, mission.neighborhood);

  if (!isManager) {
    const sameDistrict = ctx.isVolunteer && ctx.neighborhood === mission.neighborhood;
    // ended missions disappear for volunteers entirely
    if (!sameDistrict || !isVisibleToVolunteers(mission.status)) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
    }
    const mine = (mission.applicants || []).find((a) => a.user?.toString() === ctx.uid);
    return NextResponse.json({
      mission: {
        ...mission,
        status: normalizeStatus(mission.status),
        applicants: undefined,
        participation: undefined,
        myStatus: mine?.status || "open",
      },
    });
  }

  const populated = await Mission.findById(id).populate("applicants.user", "fullName email profile.avatar").lean();
  return NextResponse.json({ mission: { ...populated, status: normalizeStatus(populated.status) } });
}

export async function PATCH(req, { params }) {
  const { id } = await params;
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

  const { mission, ctx, res } = await gate(session, id);
  if (res) return res;

  const body = await req.json();
  const current = normalizeStatus(mission.status);

  /* ---------- editing the mission itself ---------- */

  const allowed = ["title", "summary", "objectives", "type", "icon", "images", "googleMapsUrl"];
  if (ctx.unscoped) allowed.push("neighborhood");
  for (const f of allowed) if (body[f] !== undefined) mission[f] = body[f];

  if (body.xpReward !== undefined) {
    const points = Number(body.xpReward);
    if (!Number.isFinite(points) || points < 1 || points > 1000) {
      return NextResponse.json({ error: "النقاط يجب أن تكون بين 1 و 1000" }, { status: 400 });
    }
    mission.xpReward = points;
  }

  /* ---------- lifecycle ---------- */

  if (body.status !== undefined) {
    const next = normalizeStatus(body.status);
    if (!STATUSES.includes(next)) {
      return NextResponse.json({ error: "حالة غير صالحة" }, { status: 400 });
    }
    if (current === "ended") {
      return NextResponse.json({ error: "المهمة منتهية ولا يمكن تغيير حالتها" }, { status: 409 });
    }

    if (next === "ended") {
      // Ending is the only transition that awards points, so it must carry a
      // complete evaluation for every accepted participant.
      const accepted = (mission.applicants || []).filter((a) => a.status === "accepted");
      const evaluations = Array.isArray(body.evaluations) ? body.evaluations : null;
      if (!evaluations) {
        return NextResponse.json({ error: "تقييم المشاركين مطلوب لإنهاء المهمة" }, { status: 400 });
      }

      const byUser = new Map(evaluations.map((e) => [String(e.user), e]));
      const missing = accepted.find((a) => !byUser.has(a.user.toString()));
      if (missing) {
        return NextResponse.json({ error: "يجب تقييم كل مشارك مقبول" }, { status: 400 });
      }

      const rows = [];
      for (const a of accepted) {
        const uid = a.user.toString();
        const evaluation = byUser.get(uid);

        // Q1 — did they take part? "no" ends it here with nothing awarded.
        if (!evaluation.participated) {
          rows.push({ user: uid, completed: false, average: 0, awardedXP: 0 });
          continue;
        }

        const scored = scoreRatings(evaluation.ratings);
        if (!scored.ok) return NextResponse.json({ error: scored.error }, { status: 400 });

        const ratings = Object.fromEntries(
          EVALUATION_CRITERIA.map((c) => [c.id, Number(evaluation.ratings[c.id])])
        );
        rows.push({
          user: uid,
          completed: true,
          ratings,
          average: scored.average,
          awardedXP: awardFor(mission.xpReward, scored.average),
        });
      }

      mission.participation = rows;
      mission.status = "ended";
      mission.endedAt = new Date();
      await mission.save();

      await Promise.all(
        rows
          .filter((r) => r.awardedXP > 0)
          .map(async (r) => {
            await User.findByIdAndUpdate(r.user, { $inc: { xpPoints: r.awardedXP } });
            await notifyUser(
              r.user,
              `حصلت على ${r.awardedXP} نقطة عن مهمة: ${mission.title} (تقييم ${r.average.toFixed(1)}/5)`,
              "/projects/xp-tahadi"
            );
          })
      );

      return NextResponse.json({
        ok: true,
        awarded: rows.map((r) => ({ user: r.user, awardedXP: r.awardedXP, average: r.average })),
      });
    }

    if (next === "active" && current !== "active") mission.startedAt = new Date();
    mission.status = next;

    if (next === "active") {
      await Promise.all(
        (mission.applicants || [])
          .filter((a) => a.status === "accepted")
          .map((a) => notifyUser(a.user, `بدأت مهمة: ${mission.title}`, "/dashboard/xp-challenge"))
      );
    }
  }

  await mission.save();
  return NextResponse.json({ ok: true });
}

export async function DELETE(req, { params }) {
  const { id } = await params;
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

  const { mission, res } = await gate(session, id);
  if (res) return res;

  // Deleting an ended mission does not claw back the XP already credited —
  // those points belong to the volunteers now.
  await mission.deleteOne();
  return NextResponse.json({ ok: true });
}
