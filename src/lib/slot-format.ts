import { fromMinorUnits } from "@/lib/ground-format";
import type { BlockReason } from "@/types/slot";

const VENUE_TIME_ZONE = "Asia/Dhaka";

/** Today's date at the venue, "YYYY-MM-DD" — slot dates are venue-local, not UTC. */
export function venueToday(offsetDays = 0): string {
  const d = new Date(Date.now() + offsetDays * 86_400_000);
  // en-CA formats as YYYY-MM-DD.
  return new Intl.DateTimeFormat("en-CA", { timeZone: VENUE_TIME_ZONE }).format(d);
}

/** Adds days to a "YYYY-MM-DD" date without timezone drift. */
export function addDays(date: string, days: number): string {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/** 18 → "6 PM", 24 → "12 AM". */
export function hourLabel(hour: number): string {
  const h = hour % 24;
  return `${h % 12 || 12} ${h < 12 ? "AM" : "PM"}`;
}

export const slotTimeLabel = (s: { startHour: number; endHour: number }) =>
  `${hourLabel(s.startHour)}–${hourLabel(s.endHour)}`;

export const durationLabel = (minutes: number) => (minutes === 120 ? "2 hours" : "1 hour");

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
