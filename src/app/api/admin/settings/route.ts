import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { auth } from "@/lib/auth";
import { SystemSettings } from "@/models/SystemSettings";
import { z } from "zod";

const daysEnum = [
  "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday",
] as const;

const settingsSchema = z.object({
  clinicName: z.string().min(1, "Clinic name is required").max(200),
  clinicAddress: z.string().max(500).default(""),
  clinicPhone: z.string().max(50).default(""),
  clinicEmail: z.string().email("Invalid email").or(z.literal("")).default(""),
  workingDays: z.array(z.enum(daysEnum)).min(1, "At least one working day is required"),
  openingTime: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format (HH:MM)"),
  closingTime: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format (HH:MM)"),
  appointmentDuration: z.number().int().min(15, "Min 15 minutes").max(120, "Max 120 minutes"),
  maxAppointmentsPerDay: z.number().int().min(1, "Min 1").max(500, "Max 500"),
  systemEmail: z.string().email("Invalid email").or(z.literal("")).default(""),
  notificationPreferences: z.object({
    emailNotifications: z.boolean().default(true),
    smsReminders: z.boolean().default(false),
  }).default({ emailNotifications: true, smsReminders: false }),
});

export async function GET() {
  try {
    const session = await auth();
    if (!session || !["admin", "clinic_staff"].includes((session.user as any)?.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const ok = await connectDB();
    if (!ok) {
      return NextResponse.json({
        settings: null,
        warning: "Database unavailable",
      });
    }

    let settings = await SystemSettings.findOne().lean();
    if (!settings) {
      settings = await SystemSettings.create({});
      settings = settings.toObject();
    }

    return NextResponse.json({ settings });
  } catch (err) {
    console.error("Failed to fetch settings", err);
    return NextResponse.json({ error: "Failed to load settings" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || (session.user as any)?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const ok = await connectDB();
    if (!ok) {
      return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
    }

    const body = await req.json();
    const parsed = settingsSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const data = parsed.data;

    if (data.openingTime >= data.closingTime) {
      return NextResponse.json(
        { error: "Opening time must be before closing time" },
        { status: 400 }
      );
    }

    let settings = await SystemSettings.findOne();
    if (!settings) {
      settings = new SystemSettings();
    }

    settings.clinicName = data.clinicName;
    settings.clinicAddress = data.clinicAddress;
    settings.clinicPhone = data.clinicPhone;
    settings.clinicEmail = data.clinicEmail;
    settings.workingDays = data.workingDays;
    settings.openingTime = data.openingTime;
    settings.closingTime = data.closingTime;
    settings.appointmentDuration = data.appointmentDuration;
    settings.maxAppointmentsPerDay = data.maxAppointmentsPerDay;
    settings.systemEmail = data.systemEmail;
    settings.notificationPreferences = data.notificationPreferences;

    await settings.save();

    return NextResponse.json({ settings, success: true });
  } catch (err) {
    console.error("Failed to update settings", err);
    return NextResponse.json({ error: "Failed to save settings" }, { status: 500 });
  }
}
