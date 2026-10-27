import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { auth } from "@/lib/auth";
import { User } from "@/models/User";
import { Admin } from "@/models/Admin";
import { escapeRegex } from "@/lib/utils";
import bcrypt from "bcryptjs";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !["admin", "clinic_staff"].includes((session.user as any)?.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const ok = await connectDB();
    if (!ok) return NextResponse.json({ users: [], total: 0, page: 1, totalPages: 0 });

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const type = searchParams.get("type") || "all";

    const buildFilter = (fields: string[]) => {
      if (!search) return {};
      const safe = escapeRegex(search);
      return {
        $or: fields.map((f) => ({ [f]: { $regex: safe, $options: "i" } })),
      };
    };

    let students: any[] = [];
    let staff: any[] = [];
    let totalStudents = 0;
    let totalStaff = 0;

    if (type === "all" || type === "student") {
      const studentFilter = buildFilter(["name", "email", "matricNo"]);
      totalStudents = await User.countDocuments(studentFilter);
      students = await User.find(studentFilter)
        .sort({ createdAt: -1 })
        .skip(type === "student" ? (page - 1) * limit : 0)
        .limit(type === "student" ? limit : 100)
        .select("-password")
        .lean();
      students = students.map((u) => ({ ...u, userType: "student" }));
    }

    if (type === "all" || type === "staff") {
      const staffFilter = buildFilter(["fullName", "email"]);
      totalStaff = await Admin.countDocuments(staffFilter);
      staff = await Admin.find(staffFilter)
        .sort({ createdAt: -1 })
        .skip(type === "staff" ? (page - 1) * limit : 0)
        .limit(type === "staff" ? limit : 100)
        .select("-password")
        .lean();
      staff = staff.map((u) => ({
        _id: u._id,
        name: u.fullName,
        email: u.email,
        role: u.role,
        userType: u.role === "admin" ? "admin" : "clinic_staff",
        isActive: u.isActive,
        lastLogin: u.lastLogin,
        createdAt: u.createdAt,
      }));
    }

    const allUsers = [...students, ...staff].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    const total = type === "all" ? totalStudents + totalStaff : type === "student" ? totalStudents : totalStaff;

    return NextResponse.json({
      users: allUsers,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error("Failed to fetch users", err);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !["admin", "clinic_staff"].includes((session.user as any)?.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const ok = await connectDB();
    if (!ok) return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
    const { id, ...updates } = await req.json();
    if (!id) return NextResponse.json({ error: "User ID is required" }, { status: 400 });

    if (updates.password) {
      if (updates.password.length < 6) {
        return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
      }
      const hashed = await bcrypt.hash(updates.password, 12);
      await User.findByIdAndUpdate(id, { password: hashed });
      return NextResponse.json({ message: "Password updated successfully" });
    }

    const allowed = ["name", "email", "department", "matricNo"];
    const safeUpdates: Record<string, unknown> = {};
    for (const key of allowed) {
      if (updates[key] !== undefined) safeUpdates[key] = updates[key];
    }

    const user = await User.findByIdAndUpdate(id, safeUpdates, { returnDocument: "after" }).select("-password");
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    return NextResponse.json(user);
  } catch (err) {
    console.error("Failed to update user", err);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !["admin", "clinic_staff"].includes((session.user as any)?.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const ok = await connectDB();
    if (!ok) return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "User ID is required" }, { status: 400 });

    const user = await User.findByIdAndDelete(id);
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    return NextResponse.json({ message: "User deleted successfully" });
  } catch (err) {
    console.error("Failed to delete user", err);
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }
}
