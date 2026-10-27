import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Appointment } from "@/models/Appointment";
import { auth } from "@/lib/auth";
import { escapeRegex } from "@/lib/utils";
import { createAppointmentAtomic, finalizeAppointment } from "@/lib/booking";
import { createNotification, createNotificationForRole } from "@/lib/notify";
import { logActivity } from "@/lib/activity";
import { emitAppointmentEvent } from "@/lib/notificationEmitter";
import { z } from "zod";

const createSchema = z.object({
  userName: z.string().optional(),
  userEmail: z.string().optional(),
  doctorId: z.string().min(1, "Doctor ID is required"),
  doctorName: z.string().min(1, "Doctor name is required"),
  departmentId: z.string().min(1, "Department ID is required"),
  departmentName: z.string().min(1, "Department name is required"),
  appointmentDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),
  appointmentTime: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format (HH:MM)"),
  symptoms: z.string().default(""),
});

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const ok = await connectDB();
    if (!ok) return NextResponse.json([]);

    const { searchParams } = new URL(req.url);
    const sessionUserId = (session.user as any).id;
    const userId = searchParams.get("userId") || sessionUserId;

    if ((session.user as any).role === "student" && userId !== sessionUserId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const doctorId = searchParams.get("doctorId");
    const date = searchParams.get("date");
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    const filter: Record<string, unknown> = {};
    if (userId) filter.userId = userId;
    if (doctorId) filter.doctorId = doctorId;
    if (date) filter.appointmentDate = date;
    if (status) filter.status = status;
    if (search) {
      const safe = escapeRegex(search);
      filter.$or = [
        { doctorName: { $regex: safe, $options: "i" } },
        { departmentName: { $regex: safe, $options: "i" } },
        { symptoms: { $regex: safe, $options: "i" } },
      ];
    }

    const appointments = await Appointment.find(filter).sort({ appointmentDate: -1, appointmentTime: -1 }).limit(100).lean();
    return NextResponse.json(appointments);
  } catch (error) {
    console.error("Failed to fetch appointments", error);
    return NextResponse.json([]);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if ((session.user as any).role !== "student") {
      return NextResponse.json({ error: "Only students can book appointments" }, { status: 403 });
    }

    const ok = await connectDB();
    if (!ok) return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
    const body = await req.json();

    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const { appointmentDate, appointmentTime, doctorId, doctorName, departmentId, departmentName, symptoms } = parsed.data;
    const userId = (session.user as any).id;
    const userName = (session.user as any).name || parsed.data.userName;
    const userEmail = (session.user as any).email || parsed.data.userEmail;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (new Date(appointmentDate) < today) {
      return NextResponse.json(
        { error: "Appointment date must be today or in the future" },
        { status: 400 }
      );
    }

    const result = await createAppointmentAtomic({
      userId,
      userName,
      userEmail,
      doctorId,
      doctorName,
      departmentId,
      departmentName,
      appointmentDate,
      appointmentTime,
      symptoms: symptoms ?? "",
    });

    if (!result.ok) {
      return NextResponse.json(result.conflict, { status: 409 });
    }

    finalizeAppointment(result.appointment);

    return NextResponse.json(result.appointment, { status: 201 });
  } catch (error) {
    console.error("Failed to create appointment", error);
    return NextResponse.json({ error: "Failed to create appointment" }, { status: 500 });
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
    const { id, status } = await req.json();

    if (!id || !status) {
      return NextResponse.json({ error: "ID and status are required" }, { status: 400 });
    }

    const validStatuses = ["pending", "approved", "rejected", "completed", "cancelled"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
    }
    if ((session.user as any).role === "student" && String(appointment.userId) !== (session.user as any).id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    appointment.status = status;
    appointment.slotActive = status !== "cancelled";
    await appointment.save();

    if (status === "cancelled") {
      createNotification({
        userId: appointment.userId,
        userRole: "student",
        title: "Appointment Cancelled",
        message: `Your appointment with ${appointment.doctorName} on ${appointment.appointmentDate} at ${appointment.appointmentTime} has been cancelled. This time slot is now available for other patients.`,
        type: "warning",
        notificationType: "appointment_cancelled",
        relatedAppointmentId: String(appointment._id),
        link: "/appointments",
      });
      createNotificationForRole({
        role: "admin",
        title: "Appointment Cancelled",
        message: `${appointment.userName} cancelled their appointment with ${appointment.doctorName} on ${appointment.appointmentDate} at ${appointment.appointmentTime}.`,
        type: "info",
        notificationType: "appointment_cancelled",
      });
      logActivity({
        actorId: (session.user as any).id,
        actorName: (session.user as any).name || appointment.userName,
        actorRole: "student",
        action: "appointment_cancelled",
        description: `${appointment.userName} cancelled their appointment with ${appointment.doctorName} on ${appointment.appointmentDate} at ${appointment.appointmentTime}.`,
        relatedAppointmentId: String(appointment._id),
      });
    }

    emitAppointmentEvent({
      doctorId: appointment.doctorId,
      appointmentDate: appointment.appointmentDate,
      appointmentTime: appointment.appointmentTime,
      userId: appointment.userId,
      action: status === "cancelled" ? "cancelled" : "updated",
    });

    return NextResponse.json(appointment);
  } catch (error) {
    console.error("Failed to update appointment", error);
    return NextResponse.json({ error: "Failed to update appointment" }, { status: 500 });
  }
}
