import { fromMinorUnits } from "@/lib/ground-format";
import type { BlockReason } from "@/types/slot";

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
