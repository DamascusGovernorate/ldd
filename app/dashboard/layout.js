import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import connectDB from "@/lib/db";
import User from "@/models/User";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";

export default async function DashboardLayout({ children }) {
  const session = await getSession();
  if (!session) redirect("/login");

  await connectDB();
  const user = await User.findById(session.uid).select("fullName role profile.avatar");
  if (!user) redirect("/login");

  return (
    <div className="min-h-screen bg-stone flex" dir="rtl">
      <Sidebar role={user.role} />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar name={user.fullName} role={user.role} avatar={user.profile?.avatar} />
        <main className="flex-1 p-6 md:p-10">{children}</main>
      </div>
    </div>
  );
}