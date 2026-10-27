import mongoose, { Schema, Document } from "mongoose";

export interface ISystemSettings extends Document {
  clinicName: string;
  clinicAddress: string;
  clinicPhone: string;
  clinicEmail: string;
  workingDays: string[];
  openingTime: string;
  closingTime: string;
  appointmentDuration: number;
  maxAppointmentsPerDay: number;
  systemEmail: string;
  notificationPreferences: {
    emailNotifications: boolean;
    smsReminders: boolean;
  };
}

const SystemSettingsSchema = new Schema<ISystemSettings>(
  {
    clinicName: { type: String, default: "Campus Clinic" },
    clinicAddress: { type: String, default: "" },
    clinicPhone: { type: String, default: "" },
    clinicEmail: { type: String, default: "" },
    workingDays: {
      type: [String],
      default: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    },
    openingTime: { type: String, default: "08:00" },
    closingTime: { type: String, default: "17:00" },
    appointmentDuration: { type: Number, default: 30, min: 15, max: 120 },
    maxAppointmentsPerDay: { type: Number, default: 50, min: 1, max: 500 },
    systemEmail: { type: String, default: "" },
    notificationPreferences: {
      emailNotifications: { type: Boolean, default: true },
      smsReminders: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

export const SystemSettings =
  mongoose.models.SystemSettings ||
  mongoose.model<ISystemSettings>("SystemSettings", SystemSettingsSchema);
