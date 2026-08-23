import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import connectDB from "@/lib/db";
import Mission from "@/models/Mission";
import Project from "@/models/Project";
import User from "@/models/User";
import { notifyUser } from "@/lib/notify";

async function canManageMission(session, mission) {
  if (session.role === "admin") return true;
  const project = await Project.findById(mission.project);
  if (!project) return false;
  return project.owner.toString() === session.uid || project.admins.some((a) => a.toString() === session.uid);
}

export async function GET(req, { params }) {
  const { id } = await params;
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  await connectDB();
  const mission = await Mission.findById(id).populate("applicants.user", "fullName email").lean();
  if (!mission) return NextResponse.json({ error: "غير موجود" }, { status: 404 });
  return NextResponse.json({ mission });
}

export async function PATCH(req, { params }) {
  const { id } = await params;
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

  await connectDB();
  const mission = await Mission.findById(id);
  if (!mission) return NextResponse.json({ error: "غير موجود" }, { status: 404 });
  if (!(await canManageMission(session, mission))) return NextResponse.json({ error: "غير مصرح" }, { status: 403 });

  const body = await req.json();

  const allowed = ["title", "summary", "objectives", "icon", "images", "neighborhood", "googleMapsUrl", "xpReward"];
  for (const f of allowed) if (body[f] !== undefined) mission[f] = body[f];

  if (body.complete) {
    const { participation } = body; // [{ user, completed }]
    if (!Array.isArray(participation)) return NextResponse.json({ error: "بيانات غير صالحة" }, { status: 400 });

    mission.participation = participation.map((p) => ({ user: p.user, completed: Boolean(p.completed) }));
    mission.status = "closed";

    await Promise.all(
      participation
        .filter((p) => p.completed)
        .map(async (p) => {
          await User.findByIdAndUpdate(p.user, { $inc: { xpPoints: mission.xpReward || 5 } });
          await notifyUser(p.user, `حصلت على ${mission.xpReward || 5} نقاط لإكمال مهمة: ${mission.title}`, "/projects/xp-tahadi");
        })
    );
  }

  await mission.save();
  return NextResponse.json({ ok: true });
}

export async function DELETE(req, { params }) {
  const { id } = await params;
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  await connectDB();
  const mission = await Mission.findById(id);
  if (!mission) return NextResponse.json({ error: "غير موجود" }, { status: 404 });
  if (!(await canManageMission(session, mission))) return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
  await mission.deleteOne();
  return NextResponse.json({ ok: true });
}