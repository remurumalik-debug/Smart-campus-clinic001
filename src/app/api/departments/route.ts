import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Department } from "@/models/Department";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    await connectDB();
    const departments = await Department.find({ isActive: true }).sort({ name: 1 });
    return NextResponse.json(departments);
  } catch {
    return NextResponse.json({ error: "Failed to fetch departments" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || (session.user as any)?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const body = await req.json();

    if (!body.name) {
      return NextResponse.json({ error: "Department name is required" }, { status: 400 });
    }

    const existing = await Department.findOne({ name: body.name });
    if (existing) {
      return NextResponse.json({ error: "Department already exists" }, { status: 409 });
    }

    const department = await Department.create({
      name: body.name,
      description: body.description || "",
      isActive: body.isActive !== undefined ? body.isActive : true,
    });

    return NextResponse.json(department, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create department" }, { status: 500 });
  }
}
