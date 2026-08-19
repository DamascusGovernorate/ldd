import { getSession } from "@/lib/auth";
import connectDB from "@/lib/db";
import Notification from "@/models/Notification";
import NotificationsList from "./NotificationsList";

export default async function NotificationsPage() {
  const session = await getSession();
  await connectDB();
  const notifications = await Notification.find({ user: session.uid }).sort({ createdAt: -1 }).limit(50).lean();

  const plain = notifications.map((n) => ({
    id: n._id.toString(),
    message: n.message,
    link: n.link || null,
    read: n.read,
    createdAt: n.createdAt.toISOString(),
  }));

  return (
    <div>
      <h1 className="font-display text-2xl md:text-3xl text-ink mb-2">الإشعارات</h1>
      <p className="text-ink/60 mb-8">تصلك الإشعارات هنا فور حدوثها</p>
      <NotificationsList initial={plain} />
    </div>
  );
}