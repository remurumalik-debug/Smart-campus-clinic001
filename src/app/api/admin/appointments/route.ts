import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { auth } from "@/lib/auth";
import { Appointment } from "@/models/Appointment";
import { escapeRegex } from "@/lib/utils";
import { createNotification } from "@/lib/notify";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !["admin", "clinic_staff"].includes((session.user as any)?.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    const filter: Record<string, unknown> = {};
    if (status) filter.status = status;
    if (search) {
      const safe = escapeRegex(search);
      filter.$or = [
        { userName: { $regex: safe, $options: "i" } },
        { doctorName: { $regex: safe, $options: "i" } },
        { departmentName: { $regex: safe, $options: "i" } },
      ];
    }

    const total = await Appointment.countDocuments(filter);
    const appointments = await Appointment.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return NextResponse.json({ appointments, total, page, totalPages: Math.ceil(total / limit) });
  } catch {
    return NextResponse.json({ error: "Failed to fetch appointments" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !["admin", "clinic_staff"].includes((session.user as any)?.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const { id, status } = await req.json();

    if (!id || !status) {
      return NextResponse.json({ error: "ID and status are required" }, { status: 400 });
    }

    const validStatuses = ["pending", "approved", "rejected", "completed", "cancelled"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const appointment = await Appointment.findByIdAndUpdate(id, { status }, { returnDocument: "after" });
    if (!appointment) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
    }

    if (status === "approved") {
      await createNotification({
        userId: appointment.userId,
        title: "Appointment Approved",
        message: `Your appointment with ${appointment.doctorName} on ${appointment.appointmentDate} at ${appointment.appointmentTime} has been approved.`,
        type: "success",
        link: "/appointments",
      });
    } else if (status === "rejected") {
      await createNotification({
        userId: appointment.userId,
        title: "Appointment Rejected",
        message: `Your appointment with ${appointment.doctorName} on ${appointment.appointmentDate} at ${appointment.appointmentTime} has been rejected. Please book a new appointment.`,
        type: "error",
        link: "/booking",
      });
    } else if (status === "completed") {
      await createNotification({
        userId: appointment.userId,
        title: "Appointment Completed",
        message: `Your appointment with ${appointment.doctorName} on ${appointment.appointmentDate} has been marked as completed. Thank you for visiting the campus clinic.`,
        type: "info",
        link: "/appointments",
      });
    }

    return NextResponse.json(appointment);
  } catch {
    return NextResponse.json({ error: "Failed to update appointment" }, { status: 500 });
  }
}
