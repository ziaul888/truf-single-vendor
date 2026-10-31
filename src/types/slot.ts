// Slot shapes exactly as turf-api returns them. Keep the enums in sync with
// turf-api's src/slots/slots.schemas.ts.

import type { Weekday } from "./ground";

/** `held`: a customer is paying in Stripe checkout (up to holdMinutes). */
export const SLOT_STATUSES = ["available", "held", "booked", "blocked"] as const;
export const BLOCK_REASONS = ["maintenance", "reserved", "event", "weather", "other"] as const;

export type SlotStatus = (typeof SLOT_STATUSES)[number];
export type BlockReason = (typeof BLOCK_REASONS)[number];

export interface SlotBlock {
  reason: BlockReason;
  note: string | null;
  blockedBy: { id: string; name: string } | null;
  blockedAt: string;
}

/** Admin slot. Times are venue-local (Asia/Dhaka): a calendar date plus whole hours. */
export interface Slot {
  id: string;
  groundId: string;
  groundName: string;
  /** "YYYY-MM-DD" */
  date: string;
  startHour: number;
  endHour: number;
  durationMinutes: 60 | 120;
  /** Smallest currency unit, fixed when the slot was created (peak hours included). */
  price: number;
  status: SlotStatus;
  /** Set for held and booked slots. */
  booking: { id: string; bookingNumber: string; customerName: string; paymentStatus: string } | null;
  /** Set while status is "held". */
  heldUntil?: string | null;
  block: SlotBlock | null;
  createdAt: string;
  updatedAt: string;
}

/** Counts for the same ground and dates, ignoring the status and reason filters. */
export interface SlotStats {
  total: number;
  available: number;
  held: number;
  booked: number;
  blocked: number;
}

export interface SlotPage {
  data: Slot[];
  total: number;
  page: number;
  limit: number;
  stats: SlotStats;
}

/** Customer view: never says why a slot is unavailable. */
export interface PublicSlot {
  id: string;
  date: string;
  startHour: number;
  endHour: number;
  price: number;
  isPeak: boolean;
  available: boolean;
}

export interface GenerateResult {
  generated: number;
  skipped: number;
  days: number;
  slotsPerDay: number;
}

export type BulkBlockInput = {
  groundId: string;
  date: string;
  reason: BlockReason;
  note?: string;
} & (
  | { type: "single"; startHour: number }
  | { type: "fullDay" }
  | { type: "recurringWeekly"; weekdays: Weekday[]; untilDate: string; startHour?: number }
);

export interface BulkBlockResult {
  blocked: number;
  skippedBooked: number;
  cancelledBookings: number;
}

export interface CalendarApiSlot {
  id: string;
  groundId: string;
  groundName: string;
  date: string;
  startHour: number;
  endHour: number;
  status: "held" | "booked" | "blocked";
  /** "reason: note" for blocked slots. */
  note?: string;
  // Booked and held slots:
  bookingId?: string;
  customerName?: string;
  customerPhone?: string;
  /** Smallest unit. */
  amount?: number;
  advancePaid?: number;
}

export interface SlotCalendar {
  slots: CalendarApiSlot[];
  totals: { date: string; groundId: string; totalSlots: number }[];
}

export interface SlotSettings {
  advanceBookingDays: number;
  autoGenerate: boolean;
  cancellationCutoffHours: number;
  notifyCustomerOnBlock: boolean;
  notifyAdminOnBooking: boolean;
  /** Minutes a slot stays held during Stripe checkout (5–30). */
  holdMinutes: number;
  /** Portal bookings only, smallest unit. */
  serviceFee: number;
  /** Lets portal customers choose "pay at venue". */
  portalCashEnabled: boolean;
  updatedAt: string | null;
  updatedBy: StaffRef | null;
}

/** Returned by PATCH /admin/grounds/:id when the change touched slots. */
export interface SlotSync {
  removed: number;
  generated: number;
  kept: number;
}

// ── Bulk actions, history and closures (turf-api, 29 Oct 2026) ──

export type SlotEventAction = "block" | "unblock" | "close" | "reopen";
export interface StaffRef { id: string; name: string }

export interface BulkSlotsResult {
  done: number;
  failed: { id: string; code: string; error: string }[];
}

/** One entry in a slot's audit trail. `user` is null if that staff account no longer exists. */
export interface SlotEvent {
  id: string;
  action: SlotEventAction;
  reason: BlockReason | null;
  note: string | null;
  user: StaffRef | null;
  createdAt: string;
}

/** An event in the venue-wide log. `slotId` is null when the slot was later regenerated. */
export interface SlotEventListItem extends SlotEvent {
  slotId: string | null;
  groundId: string;
  groundName: string;
  date: string;
  startHour: number;
}

export interface Closure {
  id: string;
  fromDate: string;
  toDate: string;
  /** [] = every ground, including grounds added later. */
  groundIds: string[];
  reason: BlockReason;
  note: string | null;
  publicLabel: string | null;
  createdBy: StaffRef | null;
  createdAt: string;
  liftedAt: string | null;
  liftedBy: StaffRef | null;
}

export interface CreateClosureInput {
  fromDate: string;
  toDate: string;
  groundIds?: string[];
  reason: BlockReason;
  note?: string;
  publicLabel?: string;
}

export interface CreateClosureResult { closure: Closure; blocked: number; skippedBooked: number }

/** What customers see: `label` is the public label, or "Closed". */
export interface PublicClosure { fromDate: string; toDate: string; groundIds: string[]; label: string }
