import mongoose, { Schema, Document } from "mongoose";

export interface IActivityLogDoc extends Document {
  actorId: string;
  actorName: string;
  actorRole: string;
  action: string;
  description: string;
  relatedAppointmentId?: string;
}

const ActivityLogSchema = new Schema<IActivityLogDoc>(
  {
    actorId: { type: String, required: true },
    actorName: { type: String, required: true },
    actorRole: { type: String, required: true },
    action: { type: String, required: true },
    description: { type: String, required: true },
    relatedAppointmentId: { type: String },
  },
  { timestamps: true }
);

ActivityLogSchema.index({ actorRole: 1, createdAt: -1 });
ActivityLogSchema.index({ createdAt: -1 });

export const ActivityLog =
  mongoose.models.ActivityLog ||
  mongoose.model<IActivityLogDoc>("ActivityLog", ActivityLogSchema);
