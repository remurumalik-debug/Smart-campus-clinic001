import { connectDB } from "./db";
import { Appointment } from "@/models/Appointment";
import { Doctor } from "@/models/Doctor";
import { generateTimeSlots, getNearbySlots, formatDate, formatSlotTime } from "./utils";
import { createNotification, createNotificationForRole } from "./notify";
import { emitAppointmentEvent } from "./notificationEmitter";
import { logActivity } from "./activity";

export interface AppointmentInput {
  userId: string;
  userName: string;
  userEmail: string;
  doctorId: string;
  doctorName: string;
  departmentId: string;
  departmentName: string;
  appointmentDate: string;
  appointmentTime: string;
  symptoms: string;
}

export interface ConflictPayload {
  error: string;
  doctorName: string;
  departmentName: string;
  appointmentDate: string;
  appointmentTime: string;
  formattedDate: string;
  formattedTime: string;
  alternatives: { time: string; date: string }[];
  doctorAlternatives: { doctorId: string; doctorName: string; departmentName: string }[];
}

export type AtomicResult =
  | { ok: true; appointment: any; conflict: null }
  | { ok: false; appointment: null; conflict: ConflictPayload };

export async function getAvailableSlots(doctorId: string, date: string) {
  const booked = await Appointment.find({ doctorId, appointmentDate: date, slotActive: true })
    .select("appointmentTime -_id")
    .lean();

  const bookedTimes = new Set(booked.map((b) => b.appointmentTime));
  const allSlots = generateTimeSlots();
  const available = allSlots.filter((t) => !bookedTimes.has(t));

  return {
    date,
    doctorId,
    available,
    booked: Array.from(bookedTimes),
  };
}

export async function buildConflictPayload(
  doctorId: string,
  appointmentDate: string,
  appointmentTime: string,
  doctorName: string,
  departmentId: string,
  departmentName: string
): Promise<ConflictPayload> {
  const allSlots = await Appointment.find({
    doctorId,
    appointmentDate,
    slotActive: true,
  })
    .select("appointmentTime -_id")
    .lean();

  const occupiedSet = new Set(allSlots.map((s) => s.appointmentTime));
  const allSlotsList = generateTimeSlots();
  const alternativeTimes = getNearbySlots(occupiedSet, appointmentTime, allSlotsList);
  const timeAlternatives = alternativeTimes.map((t) => ({ time: t, date: appointmentDate }));

  let doctorAlternatives: { doctorId: string; doctorName: string; departmentName: string }[] = [];

  if (timeAlternatives.length === 0) {
    const otherDoctors = await Doctor.find({
      departmentId,
      _id: { $ne: doctorId },
      isAvailable: true,
    })
      .select("name departmentName")
      .limit(3)
      .lean();

    doctorAlternatives = otherDoctors.map((d) => ({
      doctorId: String(d._id),
      doctorName: d.name,
      departmentName: d.departmentName,
    }));
  }

  const formattedDate = formatDate(appointmentDate);
  const formattedTime = formatSlotTime(appointmentTime);

  let message = `Unfortunately, ${doctorName} is already booked on ${formattedDate} at ${formattedTime}.`;
  if (timeAlternatives.length > 0) {
    message += ` Here are the nearest available appointment times with ${doctorName}:`;
  }

  return {
    error: message,
    doctorName,
    departmentName,
    appointmentDate,
    appointmentTime,
    formattedDate,
    formattedTime,
    alternatives: timeAlternatives,
    doctorAlternatives,
  };
}

/**
 * Atomic conflict-check-and-save.
 *
 * Uses findOneAndUpdate with upsert + a unique partial index on
 * (doctorId, appointmentDate, appointmentTime) where status != "cancelled".
 * The unique index guarantees that only one concurrent request can insert a
 * given doctor+date+time slot; the second caller either sees
 * `updatedExisting: true` (no insert performed) or receives a duplicate-key
 * (11000) error. Both cases resolve to a conflict response, never a double
 * booking.
 */
export async function createAppointmentAtomic(input: AppointmentInput): Promise<AtomicResult> {
  const { doctorId, appointmentDate, appointmentTime } = input;

  await connectDB();

  let result: any;
  try {
    result = await Appointment.findOneAndUpdate(
      {
        doctorId,
        appointmentDate,
        appointmentTime,
        slotActive: true,
      },
      {
        $setOnInsert: {
          userId: input.userId,
          userName: input.userName,
          userEmail: input.userEmail,
          doctorId,
          doctorName: input.doctorName,
          departmentId: input.departmentId,
          departmentName: input.departmentName,
          appointmentDate,
          appointmentTime,
          symptoms: input.symptoms || "",
          status: "pending",
          slotActive: true,
        },
      },
      {
        upsert: true,
        returnDocument: "after",
        setDefaultsOnInsert: true,
        includeResultMetadata: true,
      }
    );
  } catch (err) {
    if (err && typeof err === "object" && "code" in err && (err as { code: number }).code === 11000) {
      const conflict = await buildConflictPayload(
        doctorId,
        appointmentDate,
        appointmentTime,
        input.doctorName,
        input.departmentId,
        input.departmentName
      );
      return { ok: false, appointment: null, conflict };
    }
    throw err;
  }

  if (result?.lastErrorObject?.updatedExisting === false && result?.value) {
    return { ok: true, appointment: result.value, conflict: null };
  }

  const conflict = await buildConflictPayload(
    doctorId,
    appointmentDate,
    appointmentTime,
    input.doctorName,
    input.departmentId,
    input.departmentName
  );
  return { ok: false, appointment: null, conflict };
}

/**
 * Post-success side effects shared by every booking path:
 * student + admin + clinic-staff notifications, activity log, and the
 * real-time slot event. Fire-and-forget; never throws.
 */
export async function finalizeAppointment(appointment: any) {
  try {
    const { userId, userName, doctorName, departmentName, appointmentDate, appointmentTime } = appointment;

    await createNotification({
      userId,
      userRole: "student",
      title: "Appointment Booked",
      message: `Your appointment with ${doctorName} on ${appointmentDate} at ${appointmentTime} has been booked successfully.`,
      type: "success",
      notificationType: "appointment_booked",
      relatedAppointmentId: String(appointment._id),
      link: "/appointments",
    });

    await createNotificationForRole({
      role: "admin",
      title: "New Appointment",
      message: `${userName} booked an appointment with ${doctorName} on ${appointmentDate} at ${appointmentTime}.`,
      type: "info",
      notificationType: "appointment_booked",
      link: `/admin/appointments?id=${appointment._id}`,
    });

    await createNotificationForRole({
      role: "clinic_staff",
      title: "New Appointment",
      message: `${userName} booked an appointment with ${doctorName} on ${appointmentDate} at ${appointmentTime}.`,
      type: "info",
      notificationType: "appointment_booked",
      link: `/clinic-staff/appointments?id=${appointment._id}`,
    });

    emitAppointmentEvent({
      doctorId: appointment.doctorId,
      appointmentDate,
      appointmentTime,
      userId,
      action: "booked",
    });

    await logActivity({
      actorId: userId,
      actorName: userName,
      actorRole: "student",
      action: "appointment_booked",
      description: `${userName} booked an appointment with ${doctorName} on ${appointmentDate} at ${appointmentTime}.`,
      relatedAppointmentId: String(appointment._id),
    });
  } catch (err) {
    console.error("Failed to finalize appointment:", err);
  }
}

export function nextWeekdayDates(n: number, fromDate: Date = new Date()): string[] {
  const dates: string[] = [];
  const d = new Date(fromDate);
  while (dates.length < n) {
    const day = d.getDay();
    if (day !== 0 && day !== 6) {
      dates.push(d.toLocaleDateString("en-CA"));
    }
    d.setDate(d.getDate() + 1);
  }
  return dates;
}
