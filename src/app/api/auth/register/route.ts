import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import bcrypt from "bcryptjs";
import { z } from "zod";

const registerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  matricNo: z.string().min(1, "Matric No. is required"),
  department: z.string().min(1, "Department is required"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Validation failed" },
        { status: 400 }
      );
    }

    await connectDB();
    const existing = await User.findOne({ email: parsed.data.email });
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(parsed.data.password, 12);
    const user = await User.create({
      name: parsed.data.name,
      email: parsed.data.email,
      password: hashedPassword,
      role: "student",
      matricNo: parsed.data.matricNo,
      department: parsed.data.department,
    });

    import("@/lib/email").then((m) => m.sendRegistrationEmail(parsed.data.name, parsed.data.email));
    import("@/lib/notify").then((m) =>
      m.createNotification({
        userId: String(user._id),
        title: "Welcome to Campus Clinic",
        message: "Your account has been created successfully. You can now book appointments and access campus health services.",
        type: "success",
        link: "/dashboard",
      })
    );

    return NextResponse.json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    }, { status: 201 });
  } catch (err) {
    console.error("Registration error:", err);
    return NextResponse.json({ error: err instanceof Error ? err.message : "Registration failed" }, { status: 500 });
  }
}
