import { fromMinorUnits } from "@/lib/ground-format";
import type { BlockReason } from "@/types/slot";
import { MAX_SLOTS_PER_BOOKING } from "@/lib/booking-limits";
export { MAX_SLOTS_PER_BOOKING } from "@/lib/booking-limits";

const VENUE_TIME_ZONE = "Asia/Dhaka";

/** Today's date at the venue, "YYYY-MM-DD" — slot dates are venue-local, not UTC. */
export function venueToday(offsetDays = 0): string {
  const d = new Date(Date.now() + offsetDays * 86_400_000);
  // en-CA formats as YYYY-MM-DD.
  return new Intl.DateTimeFormat("en-CA", { timeZone: VENUE_TIME_ZONE }).format(d);
}

/** The time now at the venue in hours, e.g. 18.5 at 18:30. */
export function venueHourNow(): number {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: VENUE_TIME_ZONE, hour: "2-digit", minute: "2-digit", hourCycle: "h23",
  }).formatToParts(new Date());
  const part = (type: "hour" | "minute") => Number(parts.find((p) => p.type === type)?.value);
  return part("hour") + part("minute") / 60;
}

/** Adds days to a "YYYY-MM-DD" date without timezone drift. */
export function addDays(date: string, days: number): string {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/** 18 → "6 PM", 24 → "12 AM", (16, 30) → "4:30 PM". */
export function hourLabel(hour: number, minute = 0): string {
  const h = hour % 24;
  return `${h % 12 || 12}${minute ? `:${pad2(minute)}` : ""} ${h < 12 ? "AM" : "PM"}`;
}

/**
 * A slot's or booking's time as turf-api sends it. Slots of 90 minutes start on half hours, so
 * startHour/endHour alone aren't enough; older APIs leave out the minutes and "HH:MM" times.
 */
export interface SlotTimes {
  startHour: number;
  endHour: number;
  startMinute?: number;
  endMinute?: number;
  startTime?: string;
  endTime?: string;
}

const pad2 = (n: number) => String(n).padStart(2, "0");
const minuteOf = (time: string | undefined) => (time ? Number(time.slice(3, 5)) || 0 : 0);

/** (16, 30) → "16:30". */
export const clockTime = (hour: number, minute = 0) => `${pad2(hour)}:${pad2(minute)}`;

export const slotStartMinute = (s: SlotTimes) => s.startMinute ?? minuteOf(s.startTime);
export const slotEndMinute = (s: SlotTimes) => s.endMinute ?? minuteOf(s.endTime);

/** "16:30" — the start in 24-hour time. */
export const slotStartTime = (s: SlotTimes) => s.startTime ?? clockTime(s.startHour, slotStartMinute(s));
export const slotEndTime = (s: SlotTimes) => s.endTime ?? clockTime(s.endHour, slotEndMinute(s));

/** "16:30–18:00". */
export const slotClockLabel = (s: SlotTimes) => `${slotStartTime(s)}–${slotEndTime(s)}`;

/** "4:30 PM–6 PM"; whole-hour slots stay "6 PM–7 PM". */
export const slotTimeLabel = (s: SlotTimes) =>
  `${hourLabel(s.startHour, slotStartMinute(s))}–${hourLabel(s.endHour, slotEndMinute(s))}`;

/** Start and end in hours, for comparing with venueHourNow(): 16:30 → 16.5. */
export const slotStartHours = (s: SlotTimes) => s.startHour + slotStartMinute(s) / 60;
export const slotEndHours = (s: SlotTimes) => s.endHour + slotEndMinute(s) / 60;

/** Slot length in minutes (an end at midnight is endHour 24). */
export const slotMinutes = (s: SlotTimes) => Math.round((slotEndHours(s) - slotStartHours(s)) * 60);

export const durationLabel = (minutes: number) =>
  minutes === 120 ? "2 hours" : minutes === 90 ? "1 hr 30 min" : "1 hour";

/** "৳ 1,500" from a price in the smallest unit. */
export const slotPriceLabel = (minor: number) => `৳ ${fromMinorUnits(minor).toLocaleString("en-IN")}`;

export const formatSlotDate = (date: string) =>
  new Date(`${date}T00:00:00`).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });

export const BLOCK_REASON_LABEL: Record<BlockReason, string> = {
  maintenance: "Maintenance",
  reserved: "Reserved",
  event: "Event",
  weather: "Weather",
  other: "Other",
};

export const SLOT_EVENT_LABEL: Record<"block" | "unblock" | "close" | "reopen", string> = {
  block: "Blocked",
  unblock: "Unblocked",
  close: "Closed by venue closure",
  reopen: "Reopened (closure lifted)",
};

/** "29 Oct, 11:10 AM" in the venue's timezone. */
export const formatEventTime = (iso: string) =>
  new Date(iso).toLocaleString("en-GB", {
    timeZone: VENUE_TIME_ZONE, day: "numeric", month: "short", hour: "numeric", minute: "2-digit", hour12: true,
  });

// ── Several slots in one booking (one ground and date, at most MAX_SLOTS_PER_BOOKING) ──

const START_TIME = /^(\d{1,2}):(00|30)$/;

/** "18:00,19:30" (the `slots` URL param) → valid start times "HH:MM", de-duplicated, earliest first, capped. */
export function parseSlotsParam(value: string | undefined, max = MAX_SLOTS_PER_BOOKING): string[] {
  const times = (value ?? "").split(",").flatMap((part) => {
    const match = START_TIME.exec(part.trim());
    return match && Number(match[1]) <= 23 ? [clockTime(Number(match[1]), Number(match[2]))] : [];
  });
  return [...new Set(times)].sort().slice(0, max);
}

/** Start times "HH:MM" → the `slots` URL param. */
export function formatSlotsParam(times: string[], max = MAX_SLOTS_PER_BOOKING): string {
  return [...new Set(times)].sort().slice(0, max).join(",");
}

/** "16:30" → { startHour: 16, startMinute: 30 }, the shape turf-api takes for a checkout slot. */
export function startOfTime(time: string): { startHour: number; startMinute: number } {
  const [hour, minute] = time.split(":").map(Number);
  return { startHour: hour, startMinute: minute || 0 };
}

const clock12 = (hour: number, minute: number) => `${(hour % 24) % 12 || 12}:${pad2(minute)}`;
const meridiem = (hour: number) => ((hour % 24) < 12 ? "AM" : "PM");

/**
 * Booked times as a short label. One slot reads as slotTimeLabel ("6 PM–7 PM"); back-to-back
 * slots merge into one range ("6:00 – 8:30 PM"); a gap starts a new range ("6:00 – 7:00 PM, 8:30 – 9:30 PM").
 */
export function formatSlotRange(slots: SlotTimes[]): string {
  if (slots.length === 1) return slotTimeLabel(slots[0]);
  const sorted = [...slots].sort((a, b) => slotStartHours(a) - slotStartHours(b));
  const runs: { start: SlotTimes; end: SlotTimes }[] = [];
  for (const slot of sorted) {
    const last = runs[runs.length - 1];
    if (last && slotEndHours(last.end) === slotStartHours(slot)) last.end = slot;
    else runs.push({ start: slot, end: slot });
  }
  return runs
    .map(({ start, end }) => {
      const from = clock12(start.startHour, slotStartMinute(start));
      const to = clock12(end.endHour, slotEndMinute(end));
      return meridiem(start.startHour) === meridiem(end.endHour)
        ? `${from} – ${to} ${meridiem(end.endHour)}`
        : `${from} ${meridiem(start.startHour)} – ${to} ${meridiem(end.endHour)}`;
    })
    .join(", ");
}

/** "2 slots" / "1 slot". */
export const slotCountLabel = (count: number) => `${count} ${count === 1 ? "slot" : "slots"}`;
