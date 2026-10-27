import { connectDB } from "./db";
import { Department } from "@/models/Department";
import { Doctor } from "@/models/Doctor";
import { getAvailableSlots, createAppointmentAtomic, finalizeAppointment, nextWeekdayDates, type ConflictPayload } from "./booking";
import { formatDate } from "./utils";
import { getDepartmentInfoFor, getDepartmentShort, getDepartmentDescription } from "./departments";

export interface BookingUserInfo {
  userId: string;
  userName: string;
  userEmail: string;
}

export interface OfferedDate {
  date: string;
  count: number;
}

export type BookingStep =
  | "idle"
  | "department"
  | "doctor"
  | "symptoms"
  | "date"
  | "slot"
  | "done";

export interface BookingSession {
  key: string;
  userId: string;
  userName: string;
  userEmail: string;
  step: BookingStep;
  departments: { _id: string; name: string; description?: string }[];
  selectedDepartmentId: string | null;
  selectedDepartmentName: string | null;
  doctors: { _id: string; name: string; specialization?: string }[];
  selectedDoctorId: string | null;
  selectedDoctorName: string | null;
  symptoms: string;
  offeredDates: OfferedDate[];
  selectedDate: string | null;
  lastSlots: string[];
  selectedSlot: string | null;
  startedAt: number;
}

const SESSION_TTL_MS = 30 * 60 * 1000;
const DAYS_AHEAD = 7;

const sessionStore = new Map<string, BookingSession>();

export function startBookingSession(user: BookingUserInfo, chatId: string): BookingSession {
  const key = `${user.userId}:${chatId}`;
  const session: BookingSession = {
    key,
    userId: user.userId,
    userName: user.userName,
    userEmail: user.userEmail,
    step: "department",
    departments: [],
    selectedDepartmentId: null,
    selectedDepartmentName: null,
    doctors: [],
    selectedDoctorId: null,
    selectedDoctorName: null,
    symptoms: "",
    offeredDates: [],
    selectedDate: null,
    lastSlots: [],
    selectedSlot: null,
    startedAt: Date.now(),
  };
  sessionStore.set(key, session);
  return session;
}

export function getBookingSession(userId: string, chatId: string): BookingSession | null {
  const key = `${userId}:${chatId}`;
  const session = sessionStore.get(key);
  if (!session) return null;
  if (Date.now() - session.startedAt > SESSION_TTL_MS) {
    sessionStore.delete(key);
    return null;
  }
  return session;
}

export function endBookingSession(userId: string, chatId: string) {
  const key = `${userId}:${chatId}`;
  sessionStore.delete(key);
}

const START_PATTERNS = [
  /\b(book|schedule|reserve|make)\b.*\b(appointment|slot)\b/i,
  /\b(appointment|slot)\b.*\b(book|schedule|reserve)\b/i,
  /\bbook\s+an\s+appointment\b/i,
  /\bneed\s+an\s+appointment\b/i,
  /\bschedule\s+(a\s+)?visit\b/i,
  /\bwant\s+to\s+book\b/i,
  /\b(i\s+need|i\s+want|i'd\s+like|i\s+would\s+like)\b.*\b(see\s+a\s+doctor|see\s+the\s+doctor|see\s+a\s+physician)\b/i,
  /\b(need|want|like)\s+to\s+(see|visit)\s+(a\s+)?(doctor|physician)\b/i,
  /\b(book\s+me|make\s+an\s+appointment|make\s+a\s+booking|make\s+a\s+reservation)\b/i,
  /\b(can\s+i|can\s+you|could\s+i|could\s+you)\s+(book|schedule)\b/i,
];

export function detectBookingIntent(text: string): boolean {
  return START_PATTERNS.some((re) => re.test(text));
}

const EXIT_PATTERNS = [
  /\b(cancel|stop|exit|quit|abort)\b/i,
];

export function detectExitIntent(text: string): boolean {
  return EXIT_PATTERNS.some((re) => re.test(text));
}

const RESTART_PATTERNS = [
  /\bstart\s+over\b/i,
  /\brestart\b/i,
];

function detectRestartIntent(text: string): boolean {
  return RESTART_PATTERNS.some((re) => re.test(text));
}

function numberedList(items: string[]): string {
  return items.map((item, i) => `${i + 1}. ${item}`).join("\n");
}

function formatDateLabel(date: string): string {
  return formatDate(date);
}

function safeInt(text: string): number | null {
  const m = text.trim().match(/^(\d{1,2})[.,]?$/);
  if (!m) return null;
  const n = parseInt(m[1], 10);
  return Number.isInteger(n) ? n : null;
}

interface NamedItem {
  name: string;
}

function pickByIndex<T extends NamedItem>(text: string, list: T[]): { index: number; item: T } | null {
  const n = safeInt(text);
  if (n !== null && n >= 1 && n <= list.length) {
    return { index: n - 1, item: list[n - 1] };
  }
  const lower = text.trim().toLowerCase();
  const idx = list.findIndex((it) => {
    const name = it.name.toLowerCase();
    if (name === lower) return true;
    const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    if (new RegExp(`\\b${escapedName}\\b`).test(lower)) return true;
    if (lower.length >= 3) {
      const escapedText = lower.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      if (new RegExp(`\\b${escapedText}\\b`).test(name)) return true;
    }
    return false;
  });
  if (idx >= 0) return { index: idx, item: list[idx] };
  return null;
}

function pickDate(text: string, offered: OfferedDate[]): { index: number; date: OfferedDate } | null {
  const labeled: NamedItem[] = offered.map((o) => ({
    name: `${formatDateLabel(o.date)} (${o.count} slots)`,
  }));
  const pick = pickByIndex(text, labeled);
  if (!pick) return null;
  return { index: pick.index, date: offered[pick.index] };
}

function pickSlot(text: string, slots: string[]): string | null {
  const n = safeInt(text);
  if (n !== null && n >= 1 && n <= slots.length) {
    return slots[n - 1];
  }
  const lower = text.trim().toLowerCase().replace(/\s/g, "").replace(/[.,-]/g, ":");
  const found = slots.find((s) => s.toLowerCase() === lower);
  if (found) return found;
  const hourMatch = text.trim().match(/^(\d{1,2})[:.]?(\d{2})?\s*(am|pm)?$/i);
  if (hourMatch) {
    let hour = parseInt(hourMatch[1], 10);
    const minute = hourMatch[2] ? parseInt(hourMatch[2], 10) : 0;
    const meridiem = hourMatch[3] ? hourMatch[3].toLowerCase() : null;
    if (meridiem === "pm" && hour < 12) hour += 12;
    if (meridiem === "am" && hour === 12) hour = 0;
    if (meridiem === null) {
      if (hour >= 13 && hour <= 17) {
        /* 24h format, keep as is */
      } else if (hour >= 1 && hour <= 9) {
        hour += 12;
      }
    }
    const formatted = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
    return slots.find((s) => s === formatted) ?? null;
  }
  return null;
}

function filterFutureSlots(slots: string[], date: string): string[] {
  const today = new Date().toLocaleDateString("en-CA");
  if (date !== today) return slots;
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  return slots.filter((slot) => {
    const [h, m] = slot.split(":").map(Number);
    return h * 60 + m > currentMinutes;
  });
}

function firstStepMessage(): string {
  return "Sure! Let's book your appointment. Reply with `cancel` anytime to stop.\n\nWhich department would you like to visit? You can also ask me what a department does (e.g. \"what does cardiology do?\").";
}

async function stepDepartment(session: BookingSession, text: string): Promise<string> {
  const ok = await connectDB();
  if (!ok) {
    return "I'm having trouble reaching the database right now. Please try again in a moment.";
  }
  session.departments = await Department.find({ isActive: true }).select("name _id description").lean();

  if (session.departments.length === 0) {
    return "Sorry, no departments are available right now. Please try again later.";
  }

  const pick = pickByIndex(text, session.departments);
  if (!pick) {
    const deptInfo = await getDepartmentInfoFor(text);
    if (deptInfo) {
      return deptInfo + "\n\nReply with the number of the department you'd like to book with.";
    }
    const lines = session.departments.map(
      (d, i) => `${i + 1}. ${d.name} — ${getDepartmentShort(d.name, d.description)}`
    );
    return `Which department would you like to visit?\n\n${lines.join("\n")}\n\nReply with the number of your preferred department, or ask me what a department does.`;
  }

  session.selectedDepartmentId = String(session.departments[pick.index]._id);
  session.selectedDepartmentName = session.departments[pick.index].name;
  session.selectedDoctorId = null;
  session.selectedDoctorName = null;
  session.selectedDate = null;
  session.selectedSlot = null;
  session.step = "doctor";

  session.doctors = await Doctor.find({
    departmentId: session.selectedDepartmentId,
    isAvailable: true,
  })
    .select("name specialization _id")
    .lean();

  const fullDesc = getDepartmentDescription(session.selectedDepartmentName, session.departments[pick.index].description);

  if (session.doctors.length === 0) {
    return `You've selected **${session.selectedDepartmentName}** — ${fullDesc}\n\nSorry, no doctors or nurses are currently available in this department. Please reply with \`start over\` to choose another department.`;
  }

  const lines = session.doctors.map(
    (d, i) => `${i + 1}. ${d.name}${d.specialization ? ` — ${d.specialization}` : ""}`
  );
  return `You've selected **${session.selectedDepartmentName}** — ${fullDesc}\n\nHere are the available doctors and nurses in this department:\n\n${lines.join(
    "\n"
  )}\n\nPlease reply with the number or name of the doctor or nurse you'd like to see.`;
}

async function stepDoctor(session: BookingSession, text: string): Promise<string> {
  const ok = await connectDB();
  if (!ok) {
    return "I'm having trouble reaching the database right now. Please try again in a moment.";
  }

  if (session.selectedDepartmentId) {
    session.doctors = await Doctor.find({
      departmentId: session.selectedDepartmentId,
      isAvailable: true,
    }).select("name specialization _id");
  }

  if (session.doctors.length === 0) {
    return "Sorry, no doctors or nurses are available in this department right now. Please reply with `start over` to choose another department.";
  }

  const pick = pickByIndex(text, session.doctors);
  if (!pick) {
    const lines = session.doctors.map(
      (d, i) => `${i + 1}. ${d.name}${d.specialization ? ` — ${d.specialization}` : ""}`
    );
    return `Which doctor or nurse would you like to see?\n\n${lines.join("\n")}`;
  }

  session.selectedDoctorId = String(session.doctors[pick.index]._id);
  session.selectedDoctorName = session.doctors[pick.index].name;
  session.step = "symptoms";

  return `You'll be seeing ${session.selectedDoctorName}. What symptoms are you experiencing? (You can also type "none".)`;
}

async function stepSymptoms(session: BookingSession, text: string): Promise<string> {
  const symptoms = text.trim().slice(0, 500);
  if (!symptoms) {
    return 'Could you describe your symptoms briefly? (Or type "none".)';
  }
  session.symptoms = symptoms.toLowerCase() === "none" ? "" : symptoms;
  session.step = "date";

  return "When would you like to come in? I'll check which dates are available over the next week.";
}

async function stepDate(session: BookingSession, text: string): Promise<string> {
  const ok = await connectDB();
  if (!ok) {
    return "I'm having trouble reaching the database right now. Please try again in a moment.";
  }
  if (!session.selectedDoctorId) {
    session.step = "doctor";
    return "Let's restart the doctor selection. Please choose a doctor from the list below.";
  }

  const dates = nextWeekdayDates(DAYS_AHEAD);
  const offered: OfferedDate[] = [];
  for (const date of dates) {
    const { available } = await getAvailableSlots(session.selectedDoctorId, date);
    const future = filterFutureSlots(available, date);
    if (future.length > 0) {
      offered.push({ date, count: future.length });
    }
  }

  session.offeredDates = offered;

  if (offered.length === 0) {
    return `${session.selectedDoctorName} has no availability today or over the next week. Please reply with \`start over\` to try a different doctor.`;
  }

  const pick = pickDate(text, offered);
  if (!pick) {
    return `Available dates for ${session.selectedDoctorName}:\n\n${numberedList(
      offered.map((o) => `${formatDateLabel(o.date)} (${o.count} slots)`)
    )}\n\nPlease reply with the number of your preferred date.`;
  }

  session.selectedDate = offered[pick.index].date;
  session.step = "slot";

  const { available } = await getAvailableSlots(session.selectedDoctorId, session.selectedDate);
  session.lastSlots = filterFutureSlots(available, session.selectedDate);
  if (available.length === 0) {
    session.selectedDate = null;
    return "That date just got fully booked. Let me refresh the available dates for you.";
  }

  return `${formatDateLabel(session.selectedDate)} it is! Available times:\n\n${numberedList(available)}\n\nPlease reply with the number of your preferred time.`;
}

async function stepSlot(session: BookingSession, text: string): Promise<string> {
  if (!session.selectedDoctorId || !session.selectedDate) {
    session.step = "date";
    return "Let's pick a date again.";
  }

  let slots = session.lastSlots;
  if (slots.length === 0) {
    const { available } = await getAvailableSlots(session.selectedDoctorId, session.selectedDate);
    slots = filterFutureSlots(available, session.selectedDate);
    session.lastSlots = slots;
  }

  if (slots.length === 0) {
    session.selectedDate = null;
    session.step = "date";
    return "That date just got fully booked. Let me refresh the available dates for you.";
  }

  const picked = pickSlot(text, slots);
  if (!picked) {
    return `Those times may no longer be available. Here are the current available times:\n\n${numberedList(slots)}\n\nPlease reply with the number of your preferred time.`;
  }

  session.selectedSlot = picked;

  const result = await createAppointmentAtomic({
    userId: session.userId,
    userName: session.userName,
    userEmail: session.userEmail,
    doctorId: session.selectedDoctorId,
    doctorName: session.selectedDoctorName ?? "",
    departmentId: session.selectedDepartmentId ?? "",
    departmentName: session.selectedDepartmentName ?? "",
    appointmentDate: session.selectedDate,
    appointmentTime: picked,
    symptoms: session.symptoms,
  });

  if (result.ok && result.appointment) {
    await finalizeAppointment(result.appointment);
    session.step = "done";
    const apt = result.appointment;
    const symptoms = session.symptoms || "Not specified";
    return `Your appointment is confirmed!\n\nAppointment ID: ${String(apt._id).slice(-8).toUpperCase()}\nDepartment: ${session.selectedDepartmentName}\nDoctor: ${session.selectedDoctorName}\nDate: ${formatDateLabel(session.selectedDate)}\nTime: ${picked}\nReason: ${symptoms}\nStatus: ${apt.status}\n\nI've sent you a confirmation notification. You can also view or cancel it from the Appointments page. Is there anything else I can help with?`;
  }

  return slotConflictMessage(result.conflict, session);
}

function slotConflictMessage(conflict: ConflictPayload | null, session: BookingSession): string {
  let message =
    conflict?.error ??
    `${session.selectedDoctorName ?? "The doctor"} is no longer available at that time.`;

  const altTimes = conflict?.alternatives ?? [];
  if (altTimes.length > 0) {
    message += `\n\nAvailable times:\n${numberedList(altTimes.map((a) => a.time))}`;
    message += "\n\nReply with the number of your preferred time.";
    session.lastSlots = altTimes.map((a) => a.time);
    session.step = "slot";
    return message;
  }

  const altDoctors = conflict?.doctorAlternatives ?? [];
  if (altDoctors.length > 0) {
    message += `\n\nWould you like to see a different doctor? Reply \`start over\` to choose another doctor.`;
    return message;
  }

  session.selectedDate = null;
  session.step = "date";
  return `${message}\n\nLet me refresh the available dates for you.`;
}

export interface BookingMessageResult {
  handled: boolean;
  reply: string;
  done: boolean;
}

export async function handleBookingMessage(session: BookingSession, text: string): Promise<BookingMessageResult> {
  const trimmed = text.trim();
  const chatId = session.key.split(":")[1] ?? "";

  if (detectRestartIntent(trimmed)) {
    const fresh = startBookingSession(
      { userId: session.userId, userName: session.userName, userEmail: session.userEmail },
      chatId
    );
    if (session.departments.length > 0) {
      fresh.departments = session.departments;
    }
    return {
      handled: true,
      reply: firstStepMessage(),
      done: false,
    };
  }

  if (detectExitIntent(trimmed)) {
    endBookingSession(session.userId, chatId);
    return {
      handled: true,
      reply: "No problem, I've cancelled the booking flow. Is there anything else I can help with?",
      done: true,
    };
  }

  let reply: string;

  switch (session.step) {
    case "department":
      reply = await stepDepartment(session, trimmed);
      break;
    case "doctor":
      reply = await stepDoctor(session, trimmed);
      break;
    case "symptoms":
      reply = await stepSymptoms(session, trimmed);
      break;
    case "date":
      reply = await stepDate(session, trimmed);
      break;
    case "slot":
      reply = await stepSlot(session, trimmed);
      break;
    case "done":
      if (detectBookingIntent(trimmed)) {
        const fresh = startBookingSession(
          { userId: session.userId, userName: session.userName, userEmail: session.userEmail },
          chatId
        );
        fresh.departments = session.departments;
        return { handled: true, reply: firstStepMessage(), done: false };
      }
      return { handled: false, reply: "", done: true };
    default:
      reply = firstStepMessage();
      break;
  }

  return { handled: true, reply, done: false };
}
