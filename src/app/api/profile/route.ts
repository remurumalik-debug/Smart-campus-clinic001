import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { auth } from "@/lib/auth";
import { User } from "@/models/User";
import bcrypt from "bcryptjs";
import { createNotification } from "@/lib/notify";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const ok = await connectDB();
    if (!ok) {
      return NextResponse.json({ name: (session.user as any).name, email: (session.user as any).email, role: (session.user as any).role });
    }

    const user = await User.findById((session.user as any).id).select("-password");
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (e) {
    console.error("Failed to fetch profile", e);
    return NextResponse.json({ name: "", email: "" });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const ok = await connectDB();
    if (!ok) return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
    const body = await req.json();
    const { name, department, image, currentPassword, newPassword } = body;
    const userId = (session.user as any).id;

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (name) user.name = name;
    if (department) user.department = department;
    if (image !== undefined) user.image = image;

    const profileChanged = !!(name || department !== undefined || image !== undefined);
    const passwordChanged = !!newPassword;

    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json({ error: "Current password is required to set a new password" }, { status: 400 });
      }
      if (newPassword.length < 6) {
        return NextResponse.json({ error: "New password must be at least 6 characters" }, { status: 400 });
      }
      const isValid = await bcrypt.compare(currentPassword, user.password);
      if (!isValid) {
        return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
      }
      user.password = await bcrypt.hash(newPassword, 12);
    }

    await user.save();

    if (profileChanged) {
      createNotification({
        userId,
        userRole: "student",
        title: "Profile Updated",
        message: "Your profile information has been updated successfully.",
        type: "success",
        notificationType: "profile_updated",
        link: "/profile",
      });
    }

    if (passwordChanged) {
      createNotification({
        userId,
        userRole: "student",
        title: "Password Changed",
        message: "Your account password has been changed successfully.",
        type: "info",
        notificationType: "password_changed",
        link: "/profile",
      });
    }

    return NextResponse.json({
      id: user._id,
      name: user.name,
      email: user.email,
      matricNo: user.matricNo,
      department: user.department,
      image: user.image,
      role: user.role,
    });
  } catch (e) {
    console.error("Failed to update profile", e);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
