import { connectDB } from "./db";
import { ActivityLog } from "@/models/ActivityLog";

export async function logActivity({
  actorId,
  actorName,
  actorRole,
  action,
  description,
  relatedAppointmentId,
}: {
  actorId: string;
  actorName: string;
  actorRole: string;
  action: string;
  description: string;
  relatedAppointmentId?: string;
}) {
  try {
    await connectDB();
    await ActivityLog.create({
      actorId,
      actorName,
      actorRole,
      action,
      description,
      relatedAppointmentId,
    });
  } catch (err) {
    console.error("Failed to log activity:", err);
  }
}
