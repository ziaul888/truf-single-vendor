// Conversions between turf-api's ground fields and what the UI shows or edits.

/** turf-api stores prices in the smallest currency unit: 1500 = 15.00. */
export const fromMinorUnits = (minor: number) => minor / 100;
export const toMinorUnits = (major: number) => Math.round(major * 100);

/** 6 → "06:00". 24 → "24:00" (closing at midnight). */
export const hourToTime = (hour: number) => `${String(hour).padStart(2, "0")}:00`;

/** [{ fromHour: 17, toHour: 22 }] → "17:00–22:00". */
export const formatPeakRanges = (ranges: { fromHour: number; toHour: number }[]) =>
  ranges.map((r) => `${hourToTime(r.fromHour)}–${hourToTime(r.toHour)}`).join(", ");

/**
 * "06:00" → 6. Time pickers can't show 24:00, so a closing time of "00:00" means midnight (24).
 * Returns null for anything that isn't a whole hour.
 */
export function timeToHour(time: string, { isClosing = false } = {}): number | null {
  const match = /^(\d{2}):(\d{2})$/.exec(time);
  if (!match || match[2] !== "00") return null;
  const hour = Number(match[1]);
  return isClosing && hour === 0 ? 24 : hour;
}
