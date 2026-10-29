// Mirrors the backend API contract — keep in sync with the separate backend project.

import type { AvailableDays, GroundFormat, PeakRange, SlotDurationMinutes, Sport, Surface, Weekday } from "./ground";

export type { GroundFormat, Sport, Surface };
export type SlotStatus = "available" | "booked" | "blocked";
export type BookingStatus = "pending" | "confirmed" | "cancelled" | "refunded";

/**
 * A ground as the portal renders it. Built from turf-api's public ground
 * (see src/services/portal-grounds.ts); hourlyRate is in whole currency units.
 */
export interface Ground {
  id: string;
  name: string;
  description?: string | null;
  address?: string | null;
  hourlyRate: number;
  openHour: number;
  closeHour: number;
  sport?: Sport;
  format?: GroundFormat;
  surface?: Surface;
  dimensions?: string;
  capacity?: number;
  amenities?: string[];
  /** Missing means open every day (demo data). */
  availableDays?: AvailableDays;
  customDays?: Weekday[];

  /** Whole currency units; hourlyRate is the off-peak price when this is set. */
  peakRate?: number;
  peakRanges?: PeakRange[];
  /** Missing means 60 (demo data). */
  slotDurationMinutes?: SlotDurationMinutes;
  images?: string[];
}

export interface TimeSlot {
  id: string;
  groundId: string;
  date: string;
  startTime: string;
  endTime: string;
  status: SlotStatus;
  price: number;
  isPeak: boolean;
}

export interface Booking {
  id: string;
  bookingNumber: string;
  groundId: string;
  ground: Pick<Ground, "id" | "name" | "sport" | "format" | "images">;
  slotId: string;
  slot: Pick<TimeSlot, "date" | "startTime" | "endTime">;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  amount: number;
  serviceFee: number;
  total: number;
  status: BookingStatus;
  createdAt: string;
  cancelledAt?: string;
}

export interface ApiSuccess<T> { success: true; data: T }
export interface ApiError { success: false; error: string; code?: number }
export type ApiResponse<T> = ApiSuccess<T> | ApiError;

export interface Paginated<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}
