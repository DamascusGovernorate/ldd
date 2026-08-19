import { NextResponse } from "next/server";
import crypto from "crypto";
import connectDB from "@/lib/db";
import User from "@/models/User";
import Otp from "@/models/Otp";
import { checkRateLimit } from "@/lib/rateLimit";
import { sendOtpEmail } from "@/lib/resend";

const ALLOWED_DOMAINS = ["gmail.com", "yahoo.com", "outlook.com", "protonmail.com", "hotmail.com"];
const hashCode = (code) => crypto.createHmac("sha256", process.env.OTP_SECRET).update(code).digest("hex");

export async function POST(req) {
  try {
    const { fullName, email, purpose } = await req.json();
    if (!email || !["signup", "login"].includes(purpose)) {
      return NextResponse.json({ error: "بيانات غير صالحة" }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const domain = normalizedEmail.split("@")[1];
    if (!domain || !ALLOWED_DOMAINS.includes(domain)) {
      return NextResponse.json(
        { error: "الرجاء استخدام بريد من Gmail أو Yahoo أو Outlook أو ProtonMail أو Hotmail" },
        { status: 400 }
      );
    }

    await connectDB();
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (purpose === "signup") {
      if (!fullName || fullName.trim().length < 3) {
        return NextResponse.json({ error: "الرجاء إدخال الاسم الكامل" }, { status: 400 });
      }
      if (existingUser) {
        return NextResponse.json({ error: "هذا البريد الإلكتروني مسجل مسبقاً" }, { status: 409 });
      }
    } else if (!existingUser) {
      return NextResponse.json({ error: "لا يوجد حساب مرتبط بهذا البريد الإلكتروني" }, { status: 404 });
    }

    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const ipLimit = await checkRateLimit(`otp-req:ip:${ip}`, { max: 8, windowMs: 15 * 60 * 1000 });
    if (!ipLimit.allowed) return NextResponse.json({ error: "محاولات كثيرة، حاول لاحقاً" }, { status: 429 });

    const emailLimit = await checkRateLimit(`otp-req:email:${normalizedEmail}`, { max: 3, windowMs: 15 * 60 * 1000 });
    if (!emailLimit.allowed) return NextResponse.json({ error: "الرجاء الانتظار قليلاً قبل طلب رمز جديد" }, { status: 429 });

    const code = crypto.randomInt(100000, 999999).toString();

    await Otp.findOneAndDelete({ email: normalizedEmail, purpose });
    await Otp.create({
      email: normalizedEmail,
      purpose,
      codeHash: hashCode(code),
      fullName: purpose === "signup" ? fullName.trim() : undefined,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });

    await sendOtpEmail({
      to: normalizedEmail,
      code,
      fullName: purpose === "signup" ? fullName.trim() : existingUser.fullName,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "حدث خطأ، حاول مرة أخرى" }, { status: 500 });
  }
}