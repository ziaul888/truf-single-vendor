// Settings shapes exactly as turf-api returns them (31 Oct 2026).
// Read: admin + manager. Save, upload, reset: admin. System status: admin only.

import type { StaffRef } from "./booking";

/** Every section carries who changed it last ("Last changed by Manager, 2 hours ago"). */
export interface Audited {
  updatedAt: string | null;
  updatedBy: StaffRef | null;
}

export interface VenueProfile extends Audited {
  name: string;
  tagline: string;
  phone: string;
  email: string;
  /** null: replies go to `email`. */
  supportEmail: string | null;
  address: string;
  openHours: string;
  mapUrl: string;
  websiteUrl: string;
  /** Read-only; set by the logo upload. null shows the default icon. */
  logoUrl: string | null;
  /** Read-only in v1. */
  locale: { currency: string; timezone: string; weekStartsOn: string };
}

export type VenueInput = Partial<Omit<VenueProfile, "logoUrl" | "locale" | keyof Audited>>;

/** GET /venue (public): no support email, no audit fields. */
export type PublicVenue = Omit<VenueProfile, "supportEmail" | keyof Audited>;

export interface PaymentStatus {
  stripe: {
    configured: boolean;
    /** From the key itself; null when Stripe isn't set up. */
    mode: "test" | "live" | null;
    webhook: { configured: boolean; lastEventAt: string | null; lastEventOk: boolean | null };
    currency: string;
  };
  methods: { card: boolean; cash: boolean; bankTransfer: boolean };
  portalCashEnabled: boolean;
}

export interface NotificationSettings extends Audited {
  email: {
    configured: boolean;
    fromEmail: string;
    /** null follows the venue (see effective*). */
    fromName: string | null;
    replyTo: string | null;
    effectiveFromName: string;
    effectiveReplyTo: string;
  };
  customer: {
    /** Always true: locked on. */
    bookingConfirmed: boolean;
    /** Always true: locked on. */
    bookingCancelled: boolean;
    refundIssued: boolean;
    slotBlocked: boolean;
  };
  staff: {
    /** 0–5 emails; empty means every active admin. */
    recipients: string[];
    newBooking: boolean;
    customerCancelled: boolean;
    dueDigest: boolean;
  };
}

export interface NotificationsInput {
  email?: { fromName?: string | null; replyTo?: string | null };
  customer?: Partial<NotificationSettings["customer"]>;
  staff?: Partial<NotificationSettings["staff"]>;
}

export type EmailKind =
  | "booking_confirmed" | "booking_received" | "booking_cancelled" | "refund_issued" | "payment_due"
  | "staff_new_booking" | "staff_customer_cancelled" | "staff_due_digest" | "test";

export interface EmailLogEntry {
  id: string;
  /** Masked: ra***@example.com */
  to: string;
  subject: string;
  kind: EmailKind;
  ok: boolean;
  error: string | null;
  createdAt: string;
}

export interface EmailLogPage {
  data: EmailLogEntry[];
  total: number;
  page: number;
  limit: number;
}

/** "PUT /admin/settings/venue" strings, generated from the API's route guards. */
export interface Permissions {
  admin: string[];
  manager: string[];
}

export interface JobStatus {
  lastRunAt: string;
  ok: boolean;
  error?: string;
}

export const SYSTEM_JOBS = ["slotGeneration", "holdExpiry", "completion", "dueReminders", "dueDigest"] as const;
export type SystemJob = (typeof SYSTEM_JOBS)[number];

export interface SystemStatus {
  version: string;
  startedAt: string;
  database: { ok: boolean };
  counts: { grounds: number; slots: number; bookings: number; customers: number; payments: number };
  /** null until the job first runs after a restart. */
  jobs: Record<SystemJob, JobStatus | null>;
  integrations: { stripe: boolean; sendgrid: boolean; twilio: boolean };
}

export const RESETTABLE_SECTIONS = ["slots", "notifications", "website"] as const;
export type ResettableSection = (typeof RESETTABLE_SECTIONS)[number];
