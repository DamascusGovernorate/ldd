import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import connectDB from "@/lib/db";
import Project from "@/models/Project";
import User from "@/models/User";
import { notifyUser } from "@/lib/notify";

/** Only the site admin appoints project managers. */
async function requireSiteAdmin() {
  const session = await getSession();
  if (!session) return { error: NextResponse.json({ error: "غير مصرح" }, { status: 401 }) };
  await connectDB();
  const me = await User.findById(session.uid).select("role").lean();
  if (me?.role !== "admin") return { error: NextResponse.json({ error: "غير مصرح" }, { status: 403 }) };
  return { session };
}

const publicUser = (u) => ({
  id: u._id.toString(),
  name: u.fullName,
  email: u.email,
  role: u.role,
  neighborhood: u.profile?.neighborhood || null,
});

export async function GET(req, { params }) {
  const { id } = await params;
  const gate = await requireSiteAdmin();
  if (gate.error) return gate.error;

  const project = await Project.findById(id).lean();
  if (!project) return NextResponse.json({ error: "غير موجود" }, { status: 404 });

  const managerIds = (project.admins || []).map((a) => a.toString());

  const [managers, candidates] = await Promise.all([
    User.find({ _id: { $in: managerIds } }).select("fullName email role profile.neighborhood").lean(),
    // A manager is scoped to their own neighborhood, so only people who have
    // one set are eligible — otherwise they would be appointed to nothing.
    User.find({
      _id: { $nin: [...managerIds, project.owner] },
      role: { $ne: "admin" },
      "profile.neighborhood": { $exists: true, $ne: null },
    })
      .select("fullName email role profile.neighborhood")
      .sort({ fullName: 1 })
      .limit(200)
      .lean(),
  ]);

  return NextResponse.json({
    managers: managers.map(publicUser),
    candidates: candidates.map(publicUser),
  });
}

export async function PATCH(req, { params }) {
  const { id } = await params;
  const gate = await requireSiteAdmin();
  if (gate.error) return gate.error;

  const { userId, action } = await req.json();
  if (!userId || !["add", "remove"].includes(action)) {
    return NextResponse.json({ error: "بيانات غير صالحة" }, { status: 400 });
  }

  const [project, user] = await Promise.all([Project.findById(id), User.findById(userId)]);
  if (!project) return NextResponse.json({ error: "المشروع غير موجود" }, { status: 404 });
  if (!user) return NextResponse.json({ error: "المستخدم غير موجود" }, { status: 404 });

  if (action === "add") {
    if (!user.profile?.neighborhood) {
      return NextResponse.json(
        { error: "يجب أن يحدد المستخدم حيّه في حسابه الشخصي قبل تعيينه مسؤولاً" },
        { status: 400 }
      );
    }

    const already = project.admins.some((a) => a.toString() === userId);
    if (!already) project.admins.push(userId);

    // The role only drives the sidebar tab; never overwrite a site admin
    // or a news reporter's role.
    if (user.role === "user") {
      user.role = "xp_project_manager";
      await user.save();
    }
    await project.save();

    await notifyUser(
      userId,
      `تم تعيينك مسؤولاً عن تحدي XP في حي ${user.profile.neighborhood}`,
      "/dashboard/xp-challenge"
    );
  } else {
    project.admins = project.admins.filter((a) => a.toString() !== userId);
    await project.save();

    // Demote only if they no longer manage any project at all.
    if (user.role === "xp_project_manager") {
      const stillManages = await Project.exists({ admins: userId });
      if (!stillManages) {
        user.role = "user";
        await user.save();
      }
    }

    await notifyUser(userId, "تم إنهاء دورك كمسؤول عن تحدي XP", "/dashboard");
  }

  return NextResponse.json({ ok: true });
}
