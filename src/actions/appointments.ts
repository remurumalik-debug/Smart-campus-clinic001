"use server";

import { connectDB } from "@/lib/db";
import { Appointment } from "@/models/Appointment";
import { Doctor } from "@/models/Doctor";
import { escapeRegex, generateTimeSlots } from "@/lib/utils";
import { revalidatePath } from "next/cache";

export async function getAppointments(userId: string, filters?: {
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}) {
  await connectDB();
  const filter: Record<string, unknown> = { userId };

  if (filters?.status) filter.status = filters.status;
  if (filters?.dateFrom || filters?.dateTo) {
    const dateFilter: Record<string, string> = {};
    if (filters.dateFrom) dateFilter.$gte = filters.dateFrom;
    if (filters.dateTo) dateFilter.$lte = filters.dateTo;
    filter.appointmentDate = dateFilter;
  }
  if (filters?.search) {
    const safe = escapeRegex(filters.search);
    filter.$or = [
      { doctorName: { $regex: safe, $options: "i" } },
      { departmentName: { $regex: safe, $options: "i" } },
    ];
  }

  const appointments = await Appointment.find(filter).sort({ appointmentDate: -1, appointmentTime: -1 });
  return JSON.parse(JSON.stringify(appointments));
}

export async function getAvailableSlots(doctorId: string, date: string) {
  await connectDB();
  const allSlots = generateTimeSlots();

  const doctor = await Doctor.findById(doctorId);
  if (!doctor) return [];

  const occupied = await Appointment.find({ doctorId, appointmentDate: date }).select("appointmentTime -_id");
  const occupiedSet = new Set(occupied.map((o) => o.appointmentTime));

  return allSlots.filter((slot) => !occupiedSet.has(slot));
}

export async function cancelAppointment(appointmentId: string) {
  await connectDB();
  const appointment = await Appointment.findByIdAndUpdate(
    appointmentId,
    { status: "cancelled" },
    { returnDocument: "after" }
  );
  revalidatePath("/appointments");
  return appointment ? JSON.parse(JSON.stringify(appointment)) : null;
}


