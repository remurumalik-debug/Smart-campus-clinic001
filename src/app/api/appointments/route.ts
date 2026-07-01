import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Appointment } from "@/models/Appointment";
import { auth } from "@/lib/auth";
import { escapeRegex, generateTimeSlots, getNearbySlots } from "@/lib/utils";
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

    await connectDB();
    const { searchParams } = new URL(req.url);
    const sessionUserId = (session.user as any).id;
    const userId = searchParams.get("userId") || sessionUserId;

    // Students can only see their own appointments
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

    const appointments = await Appointment.find(filter).sort({ appointmentDate: -1, appointmentTime: -1 });
    return NextResponse.json(appointments);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch appointments" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const body = await req.json();

    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const { appointmentDate, appointmentTime, doctorId } = parsed.data;
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

    const existing = await Appointment.findOne({
      doctorId,
      appointmentDate,
      appointmentTime,
    });

    if (existing) {
      const allSlots = await Appointment.find({
        doctorId,
        appointmentDate,
      }).select("appointmentTime -_id");

      const occupiedSet = new Set(allSlots.map((s) => s.appointmentTime));
      const allSlotsList = generateTimeSlots();
      const alternativeTimes = getNearbySlots(occupiedSet, appointmentTime, allSlotsList);
      const alternatives = alternativeTimes.map((t) => ({ time: t, date: appointmentDate }));

      return NextResponse.json(
        {
          error: "Time slot already booked",
          alternatives,
        },
        { status: 409 }
      );
    }

    let appointment;
    try {
      appointment = await Appointment.create({
        ...parsed.data,
        userId,
        userName,
        userEmail,
      });
    } catch (err: unknown) {
      if (err && typeof err === "object" && "code" in err && (err as { code: number }).code === 11000) {
        const allSlots = await Appointment.find({
          doctorId,
          appointmentDate,
        }).select("appointmentTime -_id");
        const occupiedSet = new Set(allSlots.map((s) => s.appointmentTime));
        const allSlotsList = generateTimeSlots();
        const alternativeTimes = getNearbySlots(occupiedSet, appointmentTime, allSlotsList);
        const alternatives = alternativeTimes.map((t) => ({ time: t, date: appointmentDate }));

        return NextResponse.json(
          {
            error: "Time slot already booked",
            alternatives,
          },
          { status: 409 }
        );
      }
      throw err;
    }

    return NextResponse.json(appointment, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create appointment" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
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

    return NextResponse.json(appointment);
  } catch {
    return NextResponse.json({ error: "Failed to update appointment" }, { status: 500 });
  }
}
