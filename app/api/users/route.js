import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import connectDB from "@/lib/db";
import User from "@/models/User";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "admin") return NextResponse.json({ error: "غير مصرح" }, { status: 403 });

  await connectDB();
  const users = await User.find().select("fullName email role profile.mobilePhone profile.completed createdAt").sort({ createdAt: -1 }).lean();
  return NextResponse.json({ users });
}