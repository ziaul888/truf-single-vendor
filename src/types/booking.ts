// Booking, customer and dashboard shapes exactly as turf-api returns them (29 Oct 2026).
// Money is in the smallest currency unit (150000 = ৳1,500); dates are venue-local "YYYY-MM-DD".

import type { Sport, GroundFormat } from "./ground";

export const BOOKING_STATUSES = ["pending", "confirmed", "cancelled", "completed", "no_show"] as const;
export const PAYMENT_STATUSES = ["unpaid", "partial", "paid", "refunded", "failed"] as const;
export const PAYMENT_METHODS = ["card", "cash", "bank_transfer", "bkash", "nagad"] as const;
/** Methods staff can record by hand (card payments only come through Stripe). */
export const OFFLINE_METHODS = ["cash", "bank_transfer", "bkash", "nagad"] as const;
/** Mobile wallets: the customer sends money to the venue's number; staff check it in their own app. */
export const WALLET_METHODS = ["bkash", "nagad"] as const;

export type BookingStatus = (typeof BOOKING_STATUSES)[number];
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];
export type OfflineMethod = (typeof OFFLINE_METHODS)[number];
export type WalletMethod = (typeof WALLET_METHODS)[number];

export const isWalletMethod = (m: string): m is WalletMethod => (WALLET_METHODS as readonly string[]).includes(m);

/** A bKash / Nagad payment a portal customer sent at checkout. `pending` until staff verify it. */
export interface WalletPayment {
  method: WalletMethod;
  amount: number;
  /** The TrxID. */
  reference: string | null;
  payerNumber: string;
  status: "pending" | "succeeded" | "failed" | "refunded";
}
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
  /** A portal customer paid by bKash / Nagad: what they sent, for staff to verify. */
  walletPayment: WalletPayment | null;
  /** The customer asked to cancel while their bKash / Nagad payment was under review. */
  cancelRequestedAt: string | null;
  ground: { id: string; name: string; sport: Sport };
  slot: { id: string; date: string; startHour: number; endHour: number };
  /** `email` null: the customer has no email (no customer emails are sent). */
  customer: { id: string; name: string; phone: string; email: string | null };
  contact: { name: string; email: string | null; phone: string };
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
  /** Part of a repeat booking (series); null for a one-off. */
  seriesId: string | null;
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
  /** bKash / Nagad TrxID. */
  reference: string | null;
  /** bKash / Nagad: the number a portal customer sent from. */
  payerNumber: string | null;
  note: string | null;
  recordedBy: StaffRef | null;
  createdAt: string;
  refundedAt: string | null;
}

export type BookingEventType =
  | "created" | "payment_received" | "confirmed" | "cancelled" | "refunded" | "email_sent" | "completed" | "cancel_requested"
  | "no_show";

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

export interface BookingCounts {
  pending: number;
  confirmed: number;
  cancelled: number;
  completed: number;
  /** Missing from older APIs. */
  no_show?: number;
}

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
  /** `email` optional: left out, the customer's stored one is used, else none. */
  customer: { id?: string; name: string; phone: string; email?: string };
  payment:
    | { type: "full"; method: OfflineMethod; reference?: string; note?: string }
    | { type: "partial"; method: OfflineMethod; amount: number; dueDate?: string; reference?: string; note?: string }
    | { type: "none" };
  notes?: string;
}

// ── Portal (no login; access by signed link) ──

export interface CheckoutOptions {
  cardEnabled: boolean;
  cashEnabled: boolean;
  /** bKash / Nagad numbers to send money to; only the ones the admin has set. */
  wallets: { method: WalletMethod; number: string }[];
  serviceFee: number;
  currency: string;
  holdMinutes: number;
}

export const CHECKOUT_METHODS = ["card", "cash", ...WALLET_METHODS] as const;
export type CheckoutMethod = (typeof CHECKOUT_METHODS)[number];

export interface CheckoutResult {
  bookingId: string;
  paymentMethod: CheckoutMethod;
  /** Stripe for card; null for cash, bKash and Nagad. */
  checkoutUrl: string | null;
  confirmationUrl: string;
}

export interface PublicBooking {
  id: string;
  bookingNumber: string;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  payAtVenue: boolean;
  /** Paid by bKash / Nagad at checkout; `status: "pending"` while the venue verifies it. */
  walletPayment: Omit<WalletPayment, "payerNumber"> | null;
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
  /** The customer asked the venue to cancel while their bKash / Nagad payment is under review. */
  cancelRequested: boolean;
  /** They can ask now ("Request cancellation"): payment under review, no request yet, before the cutoff. */
  canRequestCancel: boolean;
  /** False when the booking has no email, so nothing was emailed. Missing (older API): treat as true. */
  emailed?: boolean;
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
  /** Null: no email on file. */
  email: string | null;
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
