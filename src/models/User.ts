import mongoose, { Schema, Document } from "mongoose";

export interface IUserDoc extends Document {
  name: string;
  email: string;
  password: string;
  role: string;
  matricNo?: string;
  department?: string;
  image?: string;
  resetToken?: string;
  resetTokenExpiry?: Date;
}

const UserSchema = new Schema<IUserDoc>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: "student" },
    matricNo: { type: String },
    department: { type: String },
    image: { type: String },
    resetToken: { type: String },
    resetTokenExpiry: { type: Date },
  },
  { timestamps: true }
);

UserSchema.index({ role: 1 });
UserSchema.index({ createdAt: -1 });
UserSchema.index({ resetToken: 1 });

export const User = mongoose.models.User || mongoose.model<IUserDoc>("User", UserSchema);
