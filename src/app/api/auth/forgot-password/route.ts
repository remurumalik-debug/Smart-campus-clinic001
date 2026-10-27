import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { sendPasswordResetEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const ok = await connectDB();
    if (!ok) return NextResponse.json({ message: "If an account with that email exists, a password reset link has been sent." });
    const user = await User.findOne({ email });
    if (!user) {
      // Return success even if user not found (security best practice)
      return NextResponse.json({ message: "If an account with that email exists, a password reset link has been sent." });
    }

    // Generate a secure reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

    user.resetToken = resetToken;
    user.resetTokenExpiry = resetTokenExpiry;
    await user.save();

    // Send password reset email (fire-and-forget; logs to console if SMTP not configured)
    sendPasswordResetEmail(user.name, user.email, resetToken);

    return NextResponse.json({ message: "If an account with that email exists, a password reset link has been sent." });
  } catch (err) {
    console.error("Forgot password error:", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}