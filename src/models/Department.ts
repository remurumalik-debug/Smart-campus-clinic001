import mongoose, { Schema, Document } from "mongoose";

export interface IDepartmentDoc extends Document {
  name: string;
  description?: string;
  isActive: boolean;
}

const DepartmentSchema = new Schema<IDepartmentDoc>(
  {
    name: { type: String, required: true, unique: true },
    description: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

DepartmentSchema.index({ isActive: 1 });

export const Department = mongoose.models.Department || mongoose.model<IDepartmentDoc>("Department", DepartmentSchema);
