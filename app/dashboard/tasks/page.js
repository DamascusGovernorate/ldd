import { getSession } from "@/lib/auth";
import connectDB from "@/lib/db";
import Task from "@/models/Task";
import Project from "@/models/Project";
import User from "@/models/User";
import TasksClient from "./TasksClient";

export default async function TasksPage() {
  const session = await getSession();
  await connectDB();

  let taskQuery, manageableProjects;

  if (session.role === "admin") {
    taskQuery = {};
    manageableProjects = await Project.find().select("name volunteers").populate("volunteers", "fullName").lean();
  } else {
    manageableProjects = await Project.find({ $or: [{ owner: session.uid }, { admins: session.uid }] }).select("name volunteers").populate("volunteers", "fullName").lean();
    taskQuery = { $or: [{ assignedTo: session.uid }, { project: { $in: manageableProjects.map((p) => p._id) } }] };
  }

  const tasks = await Task.find(taskQuery).populate("project", "name").populate("assignedTo", "fullName email").populate("createdBy", "fullName").sort({ createdAt: -1 }).lean();
  const allUsers = session.role === "admin" ? await User.find().select("fullName email").lean() : [];

  const plainTasks = tasks.map((t) => ({
    id: t._id.toString(), title: t.title, summary: t.summary, image: t.image, status: t.status,
    project: t.project ? { id: t.project._id.toString(), name: t.project.name } : null,
    assignedTo: t.assignedTo.map((u) => ({ id: u._id.toString(), fullName: u.fullName })),
    createdBy: t.createdBy?.fullName || "—",
    canManage: session.role === "admin" || manageableProjects.some((p) => p._id.toString() === t.project?._id?.toString()),
  }));

  const plainProjects = manageableProjects.map((p) => ({ id: p._id.toString(), name: p.name, volunteers: p.volunteers.map((v) => ({ id: v._id.toString(), fullName: v.fullName })) }));

  return (
    <div>
      <h1 className="font-display text-2xl md:text-3xl text-ink mb-2">المهام</h1>
      <p className="text-ink/60 mb-8">{session.role === "admin" ? "إدارة جميع المهام" : "مهامك ومهام مشاريعك"}</p>
      <TasksClient initialTasks={plainTasks} projects={plainProjects} isAdmin={session.role === "admin"} allUsers={allUsers.map((u) => ({ id: u._id.toString(), fullName: u.fullName }))} />
    </div>
  );
}