// Report shapes exactly as turf-api returns them (31 Oct 2026).
// Money is in the smallest currency unit; dates are venue-local "YYYY-MM-DD".

import type { BookingStatus, PaymentMethod } from "./booking";

export type GroupBy = "day" | "week" | "month";

/** % change from the previous period; null when the previous value was 0 (show "New"). */
export type Trend = number | null;

export interface ReportSummary {
  period: { from: string; to: string };
  previous: { from: string; to: string };
  /** Received minus refunds; can be negative. */
  revenue: number;
  revenueTrend: Trend;
  received: number;
  refunds: number;
  /** bkash / nagad are missing from older APIs: read them as 0. */
  revenueByMethod: Partial<Record<PaymentMethod, number>>;
  bookings: number;
  bookingsTrend: Trend;
  avgBookingValue: number;
  avgBookingValueTrend: Trend;
  /** completed / (completed + no-show), 0–100; null when no booking in the range has an outcome yet. */
  completionRate: number | null;
  completionRateTrend: Trend;
  cancellationRate: number;
  /** `no_show` is missing from older APIs. */
  statusCounts: Record<BookingStatus, number>;
  /** Bookings marked no-show. Missing from older APIs. */
  noShows?: number;
}

export interface RevenuePoint {
  period: string;
  label: string;
  revenue: number;
  received: number;
  refunds: number;
  bookings: number;
}

export interface BookingPoint extends Record<BookingStatus, number> {
  period: string;
  label: string;
  total: number;
}

export interface Series<T> {
  groupBy: GroupBy;
  points: T[];
}

export interface GroundReport {
  groundId: string;
  groundName: string;
  isActive: boolean;
  revenue: number;
  bookings: number;
  cancelled: number;
  hoursBooked: number;
  hoursAvailable: number;
  /** 0–100; null when the ground had no open hours. */
  utilization: number | null;
}

export type ExportType = "revenue" | "bookings" | "customers";
