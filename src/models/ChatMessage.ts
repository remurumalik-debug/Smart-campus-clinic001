import mongoose, { Schema, Document } from "mongoose";

export interface IChatMessageDoc extends Document {
  userId: string;
  chatId: string;
  role: string;
  content: string;
}

const ChatMessageSchema = new Schema<IChatMessageDoc>(
  {
    userId: { type: String, required: true },
    chatId: { type: String, required: true },
    role: { type: String, enum: ["user", "assistant", "system"], required: true },
    content: { type: String, required: true },
  },
  { timestamps: true }
);

ChatMessageSchema.index({ userId: 1, chatId: 1 });

export const ChatMessage = mongoose.models.ChatMessage || mongoose.model<IChatMessageDoc>("ChatMessage", ChatMessageSchema);
