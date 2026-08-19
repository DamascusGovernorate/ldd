import { NextResponse } from "next/server";
import crypto from "crypto";
import connectDB from "@/lib/db";
import User from "@/models/User";
import Otp from "@/models/Otp";
import { checkRateLimit } from "@/lib/rateLimit";
import { createSession } from "@/lib/auth";

const hashCode = (code) => crypto.createHmac("sha256", process.env.OTP_SECRET).update(code).digest("hex");

export async function POST(req) {
  try {
    const { email, code, purpose } = await req.json();
    if (!email || !code || !purpose) {
      return NextResponse.json({ error: "بيانات غير صالحة" }, { status: 400 });
    }
    const normalizedEmail = email.trim().toLowerCase();

    await connectDB();

    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const ipLimit = await checkRateLimit(`otp-verify:ip:${ip}`, { max: 15, windowMs: 15 * 60 * 1000 });
    if (!ipLimit.allowed) return NextResponse.json({ error: "محاولات كثيرة، حاول لاحقاً" }, { status: 429 });

    const otp = await Otp.findOne({ email: normalizedEmail, purpose });
    if (!otp) return NextResponse.json({ error: "الرمز غير صالح أو منتهي الصلاحية" }, { status: 400 });

    if (otp.attempts >= 5) {
      await otp.deleteOne();
      return NextResponse.json({ error: "تم تجاوز عدد المحاولات، اطلب رمزاً جديداً" }, { status: 429 });
    }

    if (hashCode(code) !== otp.codeHash) {
      otp.attempts += 1;
      await otp.save();
      return NextResponse.json({ error: "رمز غير صحيح" }, { status: 400 });
    }

    let user;
    if (purpose === "signup") {
      user = await User.create({ fullName: otp.fullName, email: normalizedEmail, role: "user", emailVerified: true });
    } else {
      user = await User.findOne({ email: normalizedEmail });
      if (!user) return NextResponse.json({ error: "لا يوجد حساب مرتبط بهذا البريد الإلكتروني" }, { status: 404 });
    }

    await otp.deleteOne();
    await createSession(user);

    return NextResponse.json({ ok: true, role: user.role });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "حدث خطأ، حاول مرة أخرى" }, { status: 500 });
  }
}