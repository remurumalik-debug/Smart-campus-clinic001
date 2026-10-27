import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Doctor } from "@/models/Doctor";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const ok = await connectDB();
  if (!ok) return NextResponse.json([]);

  try {
    const { searchParams } = new URL(req.url);
    const departmentId = searchParams.get("departmentId");

    const filter: Record<string, unknown> = { isAvailable: true };
    if (departmentId) filter.departmentId = departmentId;

    const doctors = await Doctor.find(filter).sort({ name: 1 }).limit(100).lean();
    return NextResponse.json(doctors);
  } catch (e) {
    console.error("Failed to fetch doctors", e);
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

    if (!body.name || !body.email || !body.specialization || !body.departmentId) {
      return NextResponse.json(
        { error: "Name, email, specialization, and departmentId are required" },
        { status: 400 }
      );
    }

    const existing = await Doctor.findOne({ email: body.email });
    if (existing) {
      return NextResponse.json({ error: "Doctor with this email already exists" }, { status: 409 });
    }

    const doctor = await Doctor.create({
      name: body.name,
      email: body.email,
      specialization: body.specialization,
      departmentId: body.departmentId,
      departmentName: body.departmentName || "",
      isAvailable: body.isAvailable !== undefined ? body.isAvailable : true,
      availability: body.availability || [],
    });

    return NextResponse.json(doctor, { status: 201 });
  } catch (err) {
    console.error("Failed to create doctor", err);
    return NextResponse.json({ error: "Failed to create doctor" }, { status: 500 });
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
      return NextResponse.json({ error: "Doctor ID is required" }, { status: 400 });
    }

    const deleted = await Doctor.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ error: "Doctor not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Failed to delete doctor", err);
    return NextResponse.json({ error: "Failed to delete doctor" }, { status: 500 });
  }
}
