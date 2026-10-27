import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Department } from "@/models/Department";
import { Doctor } from "@/models/Doctor";
import { auth } from "@/lib/auth";

export async function GET() {
  const ok = await connectDB();
  if (!ok) return NextResponse.json([]);

  try {
    const departments = await Department.find({ isActive: true }).sort({ name: 1 }).lean();
    return NextResponse.json(departments);
  } catch (e) {
    console.error("Failed to fetch departments", e);
    return NextResponse.json([]);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || (session.user as any)?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const ok = await connectDB();
    if (!ok) return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
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
  } catch (err) {
    console.error("Failed to create department", err);
    return NextResponse.json({ error: "Failed to create department" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || (session.user as any)?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const ok = await connectDB();
    if (!ok) return NextResponse.json({ error: "Database unavailable" }, { status: 503 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Department ID is required" }, { status: 400 });
    }

    const linkedDoctors = await Doctor.countDocuments({ departmentId: id });
    if (linkedDoctors > 0) {
      return NextResponse.json(
        { error: `Cannot delete — ${linkedDoctors} doctor(s) are assigned to this department` },
        { status: 409 }
      );
    }

    const deleted = await Department.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ error: "Department not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Failed to delete department", err);
    return NextResponse.json({ error: "Failed to delete department" }, { status: 500 });
  }
}
