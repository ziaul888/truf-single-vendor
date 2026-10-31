// Dashboard home shapes exactly as turf-api returns them (31 Oct 2026).
// Money is in the smallest currency unit; dates and hours are venue-local.

import type { BookingEventType } from "./booking";
import type { SlotStatus } from "./slot";

export interface DashboardAttention {
  toConfirm: { count: number; payAtVenue: number };
  overdue: { count: number; amount: number };
  dueToday: { count: number; amount: number };
  payingNow: { count: number };
  startingSoon: { count: number; withinMinutes: number };
}

export interface TodayBookingRef {
  bookingId: string;
  bookingNumber: string;
  customerName: string;
  startHour: number;
  endHour: number;
}

export interface TodayGround {
  groundId: string;
  groundName: string;
  sport: string;
  format: string | null;
  openingHour: number;
  closingHour: number;
  /** Set when the ground doesn't open today ("Closed for Eid", "Not open today"). */
  closedReason: string | null;
  slots: Record<SlotStatus, number> & { total: number };
  bookedHours: number;
  remainingFreeHours: number;
  revenueToday: number;
  current: TodayBookingRef | null;
  next: (TodayBookingRef & { due: number }) | null;
  timeline: { startHour: number; endHour: number; status: SlotStatus }[];
}

export interface DashboardToday {
  date: string;
  nowHour: number;
  grounds: TodayGround[];
}

export interface ActivityEvent {
  id: string;
  type: BookingEventType;
  detail: string | null;
  /** null for automatic events: Stripe, the jobs, portal checkouts. */
  user: { id: string; name: string } | null;
  booking: { id: string; bookingNumber: string; customerName: string; groundName: string };
  createdAt: string;
}

export interface ActivityPage {
  data: ActivityEvent[];
  total: number;
  page: number;
  limit: number;
}
