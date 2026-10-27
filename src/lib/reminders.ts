import { connectDB } from "./db";
import { Appointment } from "@/models/Appointment";
import { Notification } from "@/models/Notification";
import { createNotification } from "./notify";

export async function generateAppointmentReminders(userId: string) {
  const ok = await connectDB();
  if (!ok) return;

  try {
    const now = new Date();
    const today = now.toLocaleDateString("en-CA");
    const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toLocaleDateString("en-CA");

    const upcomingAppointments = await Appointment.find({
      userId,
      status: { $in: ["pending", "approved"] },
      appointmentDate: { $in: [today, tomorrowStr] },
    })
      .select("doctorName appointmentDate appointmentTime")
      .lean();

    for (const apt of upcomingAppointments) {
      const existingReminder = await Notification.findOne({
        userId,
        notificationType: "appointment_reminder",
        relatedAppointmentId: String(apt._id),
        createdAt: { $gte: new Date(Date.now() - 86400000) },
      });

      if (existingReminder) continue;

      const aptDate = apt.appointmentDate === today ? "today" : "tomorrow";

      createNotification({
        userId,
        userRole: "student",
        title: "Appointment Reminder",
        message: `You have an appointment with ${apt.doctorName} ${aptDate} at ${apt.appointmentTime}.`,
        type: "info",
        notificationType: "appointment_reminder",
        relatedAppointmentId: String(apt._id),
        link: "/appointments",
      });
    }
  } catch {
    // silent
  }
}
