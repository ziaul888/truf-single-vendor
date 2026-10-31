// Booking, customer and dashboard shapes exactly as turf-api returns them (29 Oct 2026).
// Money is in the smallest currency unit (150000 = ৳1,500); dates are venue-local "YYYY-MM-DD".

import type { Sport, GroundFormat } from "./ground";

export const BOOKING_STATUSES = ["pending", "confirmed", "cancelled", "completed"] as const;
export const PAYMENT_STATUSES = ["unpaid", "partial", "paid", "refunded", "failed"] as const;
export const PAYMENT_METHODS = ["card", "cash", "bank_transfer"] as const;
/** Methods staff can record by hand (card payments only come through Stripe). */
export const OFFLINE_METHODS = ["cash", "bank_transfer"] as const;

export type BookingStatus = (typeof BOOKING_STATUSES)[number];
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];
export type OfflineMethod = (typeof OFFLINE_METHODS)[number];
export type BookingSource = "portal" | "staff";

export interface StaffRef { id: string; name: string }

/** Admin booking. `contact` is what was given for this booking; `customer` is the customer record. */
export interface Booking {
  id: string;
  bookingNumber: string;
  source: BookingSource;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  /** A portal customer chose to pay cash at the venue; pending until staff confirm. */
  payAtVenue: boolean;
  ground: { id: string; name: string; sport: Sport };
  slot: { id: string; date: string; startHour: number; endHour: number };
  customer: { id: string; name: string; phone: string; email: string };
  contact: { name: string; email: string; phone: string };
  amount: number;
  serviceFee: number;
  total: number;
  paid: number;
  due: number;
  dueDate: string | null;
  dueNote: string | null;
  notes: string | null;
  createdBy: StaffRef | null;
  confirmedAt: string | null;
  cancelledAt: string | null;
  cancelReason: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface BookingPayment {
  id: string;
  method: PaymentMethod;
  amount: number;
  status: string;
  cardLast4: string | null;
  stripePaymentIntentId: string | null;
  note: string | null;
  recordedBy: StaffRef | null;
  createdAt: string;
  refundedAt: string | null;
}

export type BookingEventType =
  | "created" | "payment_received" | "confirmed" | "cancelled" | "refunded" | "email_sent" | "completed";

export interface BookingEvent {
  id: string;
  type: BookingEventType;
  detail: string | null;
  user: StaffRef | null;
  createdAt: string;
}

export interface BookingDetail extends Booking {
  customer: Booking["customer"] & { totalBookings: number };
  payments: BookingPayment[];
  /** Newest first. */
  events: BookingEvent[];
}

export interface BookingCounts { pending: number; confirmed: number; cancelled: number; completed: number }

export interface BookingPage {
  data: Booking[];
  total: number;
  page: number;
  limit: number;
  /** Ignore the status filter, for the stat cards. */
  counts: BookingCounts;
}

export interface CreateBookingInput {
  slotId: string;
  customer: { id?: string; name: string; phone: string; email: string };
  payment:
    | { type: "full"; method: OfflineMethod; note?: string }
    | { type: "partial"; method: OfflineMethod; amount: number; dueDate?: string; note?: string }
    | { type: "none" };
  notes?: string;
}

// ── Portal (no login; access by signed link) ──

export interface CheckoutOptions {
  cashEnabled: boolean;
  serviceFee: number;
  currency: string;
  holdMinutes: number;
}

export interface CheckoutResult {
  bookingId: string;
  paymentMethod: "card" | "cash";
  /** Stripe for card; null for cash. */
  checkoutUrl: string | null;
  confirmationUrl: string;
}

export interface PublicBooking {
  id: string;
  bookingNumber: string;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  payAtVenue: boolean;
  ground: { id: string; name: string; sport: Sport; format: GroundFormat | null; address: string | null; coverPhoto: string | null };
  slot: { date: string; startHour: number; endHour: number };
  amount: number;
  serviceFee: number;
  total: number;
  paid: number;
  due: number;
  createdAt: string;
  cancelledAt: string | null;
  canCancel: boolean;
  /** Something is due and can be paid online ("Pay ৳{due} now"). */
  canPay: boolean;
}

export interface PayResult {
  bookingId: string;
  paymentMethod: "card";
  checkoutUrl: string;
  confirmationUrl: string;
  /** Smallest unit. */
  amount: number;
}

// ── Customers ──

export type CustomerTag = "vip" | "regular" | "new";

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  adminNote: string | null;
  /** "Customer since". */
  createdAt: string;
  /** Bookings that weren't cancelled. */
  bookings: number;
  totalSpent: number;
  lastBooking: string | null;
  dueAmount: number;
  tag: CustomerTag;
}

export interface CustomerStats {
  total: number;
  newThisMonth: number;
  withDuePayments: number;
  totalDueAmount: number;
  totalRevenue: number;
}

export interface CustomerPage {
  data: Customer[];
  total: number;
  page: number;
  limit: number;
  stats: CustomerStats;
}

export interface CustomerDetail extends Customer {
  recentBookings: Booking[];
  duePayments: { bookingId: string; bookingNumber: string; amount: number; dueDate: string | null }[];
  favoriteGround: { id: string; name: string; bookings: number } | null;
}

export type CustomerSort = "lastBooking" | "totalSpent" | "bookings" | "since" | "due";

// ── Dashboard ──

export interface DashboardStats {
  todayRevenue: number;
  todayRevenueTrend: number | null;
  todayBookings: number;
  todayBookingsTrend: number | null;
  totalCustomers: number;
  totalCustomersTrend: number | null;
  activeGrounds: number;
  activeGroundsTrend: number | null;
  bookingsTodayByGround: { groundId: string; bookings: number }[];
}

// ── Customer sign-in (phone + SMS code; httpOnly customer_token cookie) ──

/** name, email and customerId are null for a number that has never booked. */
export interface CustomerSession {
  phone: string;
  customerId: string | null;
  name: string | null;
  email: string | null;
  /** True when the number has no customer record yet — ask for name and email. */
  needsProfile: boolean;
}

/** A signed-in customer's booking: the public booking plus its signed link. */
export interface CustomerBooking extends PublicBooking {
  confirmationUrl: string;
}
