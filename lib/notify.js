import connectDB from "@/lib/db";
import Notification from "@/models/Notification";
import { notifyEmitter } from "@/lib/notifyEmitter";

export async function notifyUser(userId, message, link) {
  await connectDB();
  await Notification.create({ user: userId, message, link });
  notifyEmitter.emit(`user:${userId}`, { message, link, createdAt: new Date() });
}