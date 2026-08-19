import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import connectDB from "@/lib/db";
import User from "@/models/User";
import ProjectForm from "../ProjectForm";

export default async function NewProjectPage() {
  const session = await getSession();
  if (session.role !== "admin") redirect("/dashboard");

  await connectDB();
  const users = await User.find().select("fullName email").sort({ fullName: 1 }).lean();
  const plainUsers = users.map((u) => ({ id: u._id.toString(), fullName: u.fullName, email: u.email }));

  return (
    <div>
      <h1 className="font-display text-2xl md:text-3xl text-ink mb-8">مشروع جديد</h1>
      <ProjectForm users={plainUsers} />
    </div>
  );
}