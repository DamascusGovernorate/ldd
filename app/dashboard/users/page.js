import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import connectDB from "@/lib/db";
import User from "@/models/User";
import UsersTable from "./UsersTable";

export default async function UsersPage() {
  const session = await getSession();
  if (session.role !== "admin") redirect("/dashboard");

  await connectDB();
  const users = await User.find().select("fullName email role profile.mobilePhone profile.completed createdAt").sort({ createdAt: -1 }).lean();

  const plainUsers = users.map((u) => ({
    id: u._id.toString(),
    fullName: u.fullName,
    email: u.email,
    role: u.role,
    mobilePhone: u.profile?.mobilePhone || "—",
    completed: Boolean(u.profile?.completed),
  }));

  return (
    <div>
      <h1 className="font-display text-2xl md:text-3xl text-ink mb-2">المستخدمون</h1>
      <p className="text-ink/60 mb-8">{plainUsers.length} مستخدم مسجّل</p>
      <UsersTable initialUsers={plainUsers} />
    </div>
  );
}