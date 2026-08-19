import { getSession } from "@/lib/auth";
import connectDB from "@/lib/db";
import User from "@/models/User";
import AccountForm from "./AccountForm";

export default async function AccountPage() {
  const session = await getSession();
  await connectDB();
  const user = await User.findById(session.uid).lean();

  const initialData = {
    mobilePhone: user.profile?.mobilePhone || "",
    age: user.profile?.age || "",
    gender: user.profile?.gender || "",
    degrees: user.profile?.degrees || [],
    certificateImage: user.profile?.certificateImage || "",
    idImage: user.profile?.idImage || "",
  };

  return (
    <div>
      <h1 className="font-display text-2xl md:text-3xl text-ink mb-2">حسابي</h1>
      <p className="text-ink/60 mb-8">أكمل معلوماتك الشخصية والمؤهلات العلمية</p>
      <AccountForm initialData={initialData} />
    </div>
  );
}