export function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function formatSlotTime(time: string) {
  const [h, m] = time.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${ampm}`;
}

export function getNearbySlots(
  occupiedSet: Set<string>,
  time: string,
  allSlots: string[]
): string[] {
  const idx = allSlots.indexOf(time);
  const alternatives: string[] = [];
  let offset = 1;
  while (alternatives.length < 5 && (idx - offset >= 0 || idx + offset < allSlots.length)) {
    const prev = idx - offset;
    const next = idx + offset;
    if (prev >= 0 && !occupiedSet.has(allSlots[prev])) {
      alternatives.push(allSlots[prev]);
    }
    if (next < allSlots.length && !occupiedSet.has(allSlots[next])) {
      alternatives.push(allSlots[next]);
    }
    offset++;
  }
  return alternatives;
}

export function cn(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(" ");
}

export function formatDate(date: string | Date) {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatTime(time: string) {
  const [hours, minutes] = time.split(":");
  const h = parseInt(hours);
  const ampm = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 || 12;
  return `${hour12}:${String(minutes).padStart(2, "0")} ${ampm}`;
}

export function generateTimeSlots(
  startHour = 8,
  endHour = 17,
  interval = 30
) {
  const slots: string[] = [];
  for (let h = startHour; h < endHour; h++) {
    for (let m = 0; m < 60; m += interval) {
      slots.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    }
  }
  return slots;
}

export function getCookie(name: string) {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift();
  return null;
}
