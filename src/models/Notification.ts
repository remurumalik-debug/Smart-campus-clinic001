import mongoose, { Schema, Document } from "mongoose";

export interface INotificationDoc extends Document {
  userId: string;
  userRole: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  notificationType: string;
  link?: string;
  relatedAppointmentId?: string;
  read: boolean;
  deleted: boolean;
}

const NotificationSchema = new Schema<INotificationDoc>(
  {
    userId: { type: String, required: true },
    userRole: { type: String, required: true, default: "student" },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ["info", "success", "warning", "error"],
      default: "info",
    },
    notificationType: { type: String, default: "general" },
    link: { type: String },
    relatedAppointmentId: { type: String },
    read: { type: Boolean, default: false },
    deleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

NotificationSchema.index({ userId: 1, read: 1, createdAt: -1 });
NotificationSchema.index({ userId: 1, deleted: 1 });
NotificationSchema.index({ userRole: 1, createdAt: -1 });

export const Notification =
  mongoose.models.Notification ||
  mongoose.model<INotificationDoc>("Notification", NotificationSchema);
