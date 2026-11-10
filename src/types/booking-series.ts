// Repeat bookings (a booking series) as turf-api returns them.
// Money is in the smallest currency unit; dates are venue-local "YYYY-MM-DD", months "YYYY-MM".

import type { BookingStatus, OfflineMethod } from "./booking";
import type { Weekday } from "./ground";

export type SeriesStatus = "active" | "stopped";
/** fixed: until a date (at most 30 days) · ongoing: keeps booking new dates until stopped. */
export type SeriesMode = "fixed" | "ongoing";

/** Why a date in the pattern can't be booked. */
export type SeriesSkipReason = "booked" | "blocked" | "held" | "closed" | "ended" | "no_slot";

export interface SeriesPatternInput {
  groundId: string;
  startHour: number;
  weekdays: Weekday[];
  fromDate: string;
  /** null: ongoing. */
  untilDate: string | null;
}

export interface SeriesPreviewDate {
  date: string;
  slotId: string | null;
  price: number | null;
  available: boolean;
  reason?: SeriesSkipReason;
}

export interface SeriesPreview {
  dates: SeriesPreviewDate[];
  bookableCount: number;
  total: number;
  /** The last date booked now; an ongoing series adds later dates as their slots open. */
  horizon: string;
}

export interface CreateSeriesInput extends SeriesPatternInput {
  customer: { id?: string; name: string; phone: string; email?: string };
  notes?: string;
  payment:
    | { type: "full"; method: OfflineMethod; reference?: string }
    | { type: "partial"; method: OfflineMethod; amount: number; reference?: string }
    | { type: "none" };
}

export interface SeriesMoney {
  total: number;
  paid: number;
  due: number;
}

export interface SeriesMonth extends SeriesMoney {
  month: string;
  bookings: number;
  cancelled: number;
}

export interface SeriesBooking extends SeriesMoney {
  id: string;
  bookingNumber: string;
  date: string;
  status: BookingStatus;
}

export interface BookingSeries {
  id: string;
  status: SeriesStatus;
  ground: { id: string; name: string };
  customer: { id: string; name: string; phone: string };
  startHour: number;
  endHour: number;
  weekdays: Weekday[];
  fromDate: string;
  untilDate: string | null;
  bookedThrough: string | null;
  notes: string | null;
  createdAt: string;
  stoppedAt: string | null;
  totals: SeriesMoney & { bookings: number };
  months: SeriesMonth[];
  bookings: SeriesBooking[];
  skipped: { date: string; reason: SeriesSkipReason }[];
}

export interface SeriesPaymentInput {
  amount: number;
  method: OfflineMethod;
  reference?: string;
  /** Left out: spread over all months. */
  month?: string;
}

export interface StopSeriesInput {
  fromDate: string;
  refund: boolean;
  reason?: string;
}
