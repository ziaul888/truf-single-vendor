import { slotClockLabel, type SlotTimes } from "@/lib/slot-format";
import type { BookingSeries, SeriesSkipReason } from "@/types/booking-series";
import type { Weekday } from "@/types/ground";

/** Why a date of a repeat booking couldn't be booked, in plain words. */
export const SKIP_REASON_LABEL: Record<SeriesSkipReason, string> = {
  booked: "Already booked",
  blocked: "Blocked",
  held: "Someone is paying for it",
  closed: "Venue closed",
  ended: "Already over",
  no_slot: "No slot yet",
};

const WEEKDAY_LABEL: Record<Weekday, string> = {
  mon: "Mon", tue: "Tue", wed: "Wed", thu: "Thu", fri: "Fri", sat: "Sat", sun: "Sun",
};

/** "2026-12-01" → "1 Dec". */
export const shortDate = (date: string) =>
  new Date(`${date}T00:00:00`).toLocaleDateString("en-GB", { day: "numeric", month: "short" });

/** "2026-12-01" → "Tue, 1 Dec". */
export const dayDate = (date: string) =>
  new Date(`${date}T00:00:00`).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });

/** "2026-12" → "Dec 2026". */
export const monthLabel = (month: string) =>
  new Date(`${month}-01T00:00:00`).toLocaleDateString("en-GB", { month: "short", year: "numeric" });

/** "Every Sat, Mon, Wed · 21:00–22:00 · from 1 Dec, keeps going" (or "… until 31 Dec"). */
export function seriesPatternLabel(s: Pick<BookingSeries, "weekdays" | "fromDate" | "untilDate"> & SlotTimes) {
  const days = s.weekdays.length === 7 ? "Every day" : `Every ${s.weekdays.map((d) => WEEKDAY_LABEL[d]).join(", ")}`;
  const until = s.untilDate ? `until ${shortDate(s.untilDate)}` : "keeps going";
  return `${days} · ${slotClockLabel(s)} · from ${shortDate(s.fromDate)}, ${until}`;
}
