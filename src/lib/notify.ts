import { connectDB } from "./db";
import { Notification } from "@/models/Notification";
import { emitNotification } from "./notificationEmitter";

export async function createNotification({
  userId,
  userRole = "student",
  title,
  message,
  type = "info",
  notificationType = "general",
  link,
  relatedAppointmentId,
}: {
  userId: string;
  userRole?: string;
  title: string;
  message: string;
  type?: "info" | "success" | "warning" | "error";
  notificationType?: string;
  link?: string;
  relatedAppointmentId?: string;
}) {
  try {
    await connectDB();
    const doc = await Notification.create({
      userId,
      userRole,
      title,
      message,
      type,
      notificationType,
      link,
      relatedAppointmentId,
    });
    emitNotification({
      _id: String(doc._id),
      userId,
      userRole,
      title,
      message,
      type,
      notificationType,
      link,
      relatedAppointmentId,
      createdAt: doc.createdAt?.toISOString(),
    });
  } catch (err) {
    console.error("Failed to create notification:", err);
  }
}

export async function createNotificationForRole({
  role,
  title,
  message,
  type = "info",
  notificationType = "general",
  link,
}: {
  role: string;
  title: string;
  message: string;
  type?: "info" | "success" | "warning" | "error";
  notificationType?: string;
  link?: string;
}) {
  try {
    await connectDB();
    const users = await (await import("@/models/User")).User.find({ role }).select("_id").lean();
    const admins = role === "admin" || role === "clinic_staff"
      ? await (await import("@/models/Admin")).Admin.find({ role }).select("_id").lean()
      : [];
    const allUserIds = [
      ...users.map((u: any) => String(u._id)),
      ...admins.map((a: any) => String(a._id)),
    ];
    for (const userId of allUserIds) {
      await createNotification({ userId, userRole: role, title, message, type, notificationType, link });
    }
  } catch (err) {
    console.error("Failed to broadcast notification:", err);
  }
}
