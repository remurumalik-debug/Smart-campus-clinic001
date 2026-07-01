import { connectDB } from "./db";
import { Notification } from "@/models/Notification";
import { emitNotification } from "./notificationEmitter";

export async function createNotification({
  userId,
  title,
  message,
  type = "info",
  link,
}: {
  userId: string;
  title: string;
  message: string;
  type?: "info" | "success" | "warning" | "error";
  link?: string;
}) {
  try {
    await connectDB();
    await Notification.create({ userId, title, message, type, link });
    emitNotification({ userId, title, message, type, link });
  } catch (err) {
    console.error("Failed to create notification:", err);
  }
}
