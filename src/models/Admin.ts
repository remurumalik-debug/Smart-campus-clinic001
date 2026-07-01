import mongoose, { Schema, Document } from "mongoose";

export interface IAdminDoc extends Document {
  fullName: string;
  email: string;
  password: string;
  role: "admin" | "clinic_staff";
  securityKey: string;
  isActive: boolean;
  lastLogin?: Date;
}

const AdminSchema = new Schema<IAdminDoc>(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["admin", "clinic_staff"], required: true },
    securityKey: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    lastLogin: { type: Date },
  },
  { timestamps: true }
);

export const Admin = mongoose.models.Admin || mongoose.model<IAdminDoc>("Admin", AdminSchema);
