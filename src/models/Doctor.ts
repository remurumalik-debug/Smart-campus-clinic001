import mongoose, { Schema, Document } from "mongoose";

export interface IDoctorDoc extends Document {
  name: string;
  email: string;
  specialization: string;
  departmentId: string;
  departmentName: string;
  isAvailable: boolean;
  availability: {
    day: string;
    startTime: string;
    endTime: string;
  }[];
}

const DoctorSchema = new Schema<IDoctorDoc>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    specialization: { type: String, required: true },
    departmentId: { type: String, required: true },
    departmentName: { type: String, required: true },
    isAvailable: { type: Boolean, default: true },
    availability: [
      {
        day: { type: String },
        startTime: { type: String },
        endTime: { type: String },
      },
    ],
  },
  { timestamps: true }
);

export const Doctor = mongoose.models.Doctor || mongoose.model<IDoctorDoc>("Doctor", DoctorSchema);
