import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import connectDB from "@/lib/db";
import User from "@/models/User";

export async function PUT(req) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

  const { mobilePhone, age, gender, degrees, certificateImage, idImage } = await req.json();
  if (degrees && degrees.length > 3) {
    return NextResponse.json({ error: "الحد الأقصى 3 شهادات" }, { status: 400 });
  }

  await connectDB();
  const completed = Boolean(mobilePhone && age && gender);

  const user = await User.findByIdAndUpdate(
    session.uid,
    {
      $set: {
        "profile.mobilePhone": mobilePhone,
        "profile.age": age,
        "profile.gender": gender,
        "profile.degrees": degrees || [],
        "profile.certificateImage": certificateImage,
        "profile.idImage": idImage,
        "profile.completed": completed,
      },
    },
    { new: true }
  );

  return NextResponse.json({ ok: true, completed: user.profile.completed });
}