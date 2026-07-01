import mongoose, { Schema, Document } from "mongoose";

export interface IAppointmentDoc extends Document {
  userId: string;
  userName: string;
  userEmail: string;
  doctorId: string;
  doctorName: string;
  departmentId: string;
  departmentName: string;
  appointmentDate: string;
  appointmentTime: string;
  symptoms: string;
  status: string;
}

const AppointmentSchema = new Schema<IAppointmentDoc>(
  {
    userId: { type: String, required: true },
    userName: { type: String, required: true },
    userEmail: { type: String, required: true },
    doctorId: { type: String, required: true },
    doctorName: { type: String, required: true },
    departmentId: { type: String, required: true },
    departmentName: { type: String, required: true },
    appointmentDate: { type: String, required: true },
    appointmentTime: { type: String, required: true },
    symptoms: { type: String, default: "" },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "completed", "cancelled"],
      default: "pending",
    },
  },
  { timestamps: true }
);

AppointmentSchema.index({ doctorId: 1, appointmentDate: 1, appointmentTime: 1 }, { unique: true });

export const Appointment = mongoose.models.Appointment || mongoose.model<IAppointmentDoc>("Appointment", AppointmentSchema);
