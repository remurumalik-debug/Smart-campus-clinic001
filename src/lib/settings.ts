import { connectDB } from "./db";
import { SystemSettings } from "@/models/SystemSettings";

interface SettingsData {
  clinicName: string;
  clinicAddress: string;
  clinicPhone: string;
  clinicEmail: string;
  workingDays: string[];
  openingTime: string;
  closingTime: string;
  appointmentDuration: number;
  maxAppointmentsPerDay: number;
  systemEmail: string;
  notificationPreferences: {
    emailNotifications: boolean;
    smsReminders: boolean;
  };
}

let cachedSettings: SettingsData | null = null;
let lastFetch = 0;
const CACHE_TTL = 60000; // 1 minute

const defaults: SettingsData = {
  clinicName: "Campus Clinic",
  clinicAddress: "",
  clinicPhone: "",
  clinicEmail: "",
  workingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
  openingTime: "08:00",
  closingTime: "17:00",
  appointmentDuration: 30,
  maxAppointmentsPerDay: 50,
  systemEmail: "",
  notificationPreferences: {
    emailNotifications: true,
    smsReminders: false,
  },
};

export async function getSystemSettings(): Promise<SettingsData> {
  const now = Date.now();
  if (cachedSettings && now - lastFetch < CACHE_TTL) {
    return cachedSettings;
  }

  const ok = await connectDB();
  if (!ok) return defaults;

  try {
    let settings = await SystemSettings.findOne().lean();
    if (!settings) {
      settings = await SystemSettings.create({});
      settings = settings.toObject();
    }
    cachedSettings = {
      clinicName: settings.clinicName || defaults.clinicName,
      clinicAddress: settings.clinicAddress || defaults.clinicAddress,
      clinicPhone: settings.clinicPhone || defaults.clinicPhone,
      clinicEmail: settings.clinicEmail || defaults.clinicEmail,
      workingDays: settings.workingDays?.length ? settings.workingDays : defaults.workingDays,
      openingTime: settings.openingTime || defaults.openingTime,
      closingTime: settings.closingTime || defaults.closingTime,
      appointmentDuration: settings.appointmentDuration || defaults.appointmentDuration,
      maxAppointmentsPerDay: settings.maxAppointmentsPerDay || defaults.maxAppointmentsPerDay,
      systemEmail: settings.systemEmail || defaults.systemEmail,
      notificationPreferences: settings.notificationPreferences || defaults.notificationPreferences,
    };
    lastFetch = now;
    return cachedSettings;
  } catch {
    return defaults;
  }
}

export function invalidateSettingsCache() {
  cachedSettings = null;
  lastFetch = 0;
}
