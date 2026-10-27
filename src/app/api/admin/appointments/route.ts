import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { auth } from "@/lib/auth";
import { Appointment } from "@/models/Appointment";
import { escapeRegex } from "@/lib/utils";
import { createNotification, createNotificationForRole } from "@/lib/notify";
import { logActivity } from "@/lib/activity";
import { emitAppointmentEvent } from "@/lib/notificationEmitter";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !["admin", "clinic_staff"].includes((session.user as any)?.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const ok = await connectDB();
    if (!ok) return NextResponse.json({ appointments: [], total: 0, page: 1, totalPages: 0 });

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
      .limit(limit)
      .lean();

    return NextResponse.json({ appointments, total, page, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    console.error("Failed to fetch admin appointments", err);
    return NextResponse.json({ appointments: [], total: 0, page: 1, totalPages: 0 });
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
    const { id, status } = await req.json();

    if (!id || !status) {
      return NextResponse.json({ error: "ID and status are required" }, { status: 400 });
    }

    const validStatuses = ["pending", "approved", "rejected", "completed", "cancelled"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const appointment = await Appointment.findByIdAndUpdate(
      id,
      { status, slotActive: status !== "cancelled" },
      { returnDocument: "after" }
    );
    if (!appointment) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
    }

    emitAppointmentEvent({
      doctorId: appointment.doctorId,
      appointmentDate: appointment.appointmentDate,
      appointmentTime: appointment.appointmentTime,
      userId: appointment.userId,
      action: status === "cancelled" ? "cancelled" : "updated",
    });

    if (status === "approved") {
      await createNotification({
        userId: appointment.userId,
        userRole: "student",
        title: "Appointment Approved",
        message: `Your appointment with ${appointment.doctorName} on ${appointment.appointmentDate} at ${appointment.appointmentTime} has been approved.`,
        type: "success",
        notificationType: "appointment_approved",
        relatedAppointmentId: String(appointment._id),
        link: "/appointments",
      });
    } else if (status === "rejected") {
      await createNotification({
        userId: appointment.userId,
        userRole: "student",
        title: "Appointment Rejected",
        message: `Your appointment with ${appointment.doctorName} on ${appointment.appointmentDate} at ${appointment.appointmentTime} has been rejected. Please book a new appointment.`,
        type: "error",
        notificationType: "appointment_rejected",
        relatedAppointmentId: String(appointment._id),
        link: "/booking",
      });
    } else if (status === "completed") {
      await createNotification({
        userId: appointment.userId,
        userRole: "student",
        title: "Appointment Completed",
        message: `Your appointment with ${appointment.doctorName} on ${appointment.appointmentDate} has been marked as completed. Thank you for visiting the campus clinic.`,
        type: "info",
        notificationType: "appointment_completed",
        relatedAppointmentId: String(appointment._id),
        link: "/appointments",
      });
    }

    const actorRole = (session.user as any)?.role;
    const actorName = (session.user as any)?.name || "Clinic Staff";

    if (actorRole === "clinic_staff" && ["approved", "rejected", "completed"].includes(status)) {
      const actionLabel =
        status === "approved" ? "approved" :
        status === "rejected" ? "rejected" : "marked completed";
      const actionTitle =
        status === "approved" ? "Appointment Approved by Staff" :
        status === "rejected" ? "Appointment Rejected by Staff" : "Appointment Completed by Staff";
      const actionType =
        status === "rejected" ? "warning" : "info";
      const actionNotifType =
        status === "approved" ? "appointment_approved_by_staff" :
        status === "rejected" ? "appointment_rejected_by_staff" : "appointment_completed_by_staff";

      await createNotificationForRole({
        role: "admin",
        title: actionTitle,
        message: `${actorName} ${actionLabel} ${appointment.userName}'s appointment with ${appointment.doctorName} on ${appointment.appointmentDate} at ${appointment.appointmentTime}.`,
        type: actionType,
        notificationType: actionNotifType,
        link: `/admin/appointments?id=${appointment._id}`,
      });
    }

    if (["approved", "rejected", "completed", "cancelled"].includes(status)) {
      const actionLabel =
        status === "approved" ? "approved" :
        status === "rejected" ? "rejected" :
        status === "completed" ? "marked completed" : "cancelled";
      await logActivity({
        actorId: (session.user as any).id,
        actorName: actorName,
        actorRole: actorRole,
        action: `appointment_${status}`,
        description: `${actorName} (${actorRole === "clinic_staff" ? "Clinic Staff" : "Admin"}) ${actionLabel} ${appointment.userName}'s appointment with ${appointment.doctorName} on ${appointment.appointmentDate} at ${appointment.appointmentTime}.`,
        relatedAppointmentId: String(appointment._id),
      });
    }

    return NextResponse.json(appointment);
  } catch (err) {
    console.error("Failed to update admin appointment", err);
    return NextResponse.json({ error: "Failed to update appointment" }, { status: 500 });
  }
}
