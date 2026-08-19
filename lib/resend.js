import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendOtpEmail({ to, code, fullName }) {
  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL,
    to,
    subject: `رمز التحقق: ${code}`,
    html: `
      <div dir="rtl" style="font-family: Tahoma, Arial, sans-serif; background:#F3EFE6; padding:32px;">
        <div style="max-width:480px; margin:0 auto; background:#ffffff; border:1px solid #e5e0d5;">
          <div style="background:#0A3F35; padding:24px; text-align:center;">
            <span style="color:#D9B876; letter-spacing:4px; font-size:12px;">مديرية التنمية المحلية</span>
          </div>
          <div style="padding:32px; text-align:center;">
            <p style="color:#1B2420; font-size:15px;">مرحباً ${fullName || ""}،</p>
            <p style="color:#1B2420; font-size:15px;">رمز التحقق الخاص بك هو:</p>
            <div style="font-size:32px; letter-spacing:8px; font-weight:bold; color:#0E5C4E; margin:20px 0;">${code}</div>
            <p style="color:#6b6b6b; font-size:13px;">الرمز صالح لمدة 10 دقائق. إذا لم تطلب هذا الرمز، تجاهل هذه الرسالة.</p>
          </div>
        </div>
      </div>
    `,
  });
}