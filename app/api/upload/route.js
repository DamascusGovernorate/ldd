import { NextResponse } from "next/server";
import { imagekit } from "@/lib/imagekit";
import { getSession } from "@/lib/auth";

export async function POST(req) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("file");
  const folder = formData.get("folder") || "misc";
  if (!file) return NextResponse.json({ error: "لم يتم إرفاق ملف" }, { status: 400 });

  const buffer = Buffer.from(await file.arrayBuffer());

  try {
    const result = await imagekit.upload({
      file: buffer,
      fileName: `${session.uid}-${Date.now()}-${file.name}`,
      folder: `/ldd/${folder}`,
    });
    return NextResponse.json({ url: result.url, fileId: result.fileId });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "فشل رفع الملف" }, { status: 500 });
  }
}