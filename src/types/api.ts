// Mirrors the backend API contract — keep in sync with the separate backend project.

export type Sport = "football" | "cricket" | "badminton";
export type GroundFormat = "5x5" | "6x6" | "7x7" | "11x11" | "net" | "court";
export type Surface = "outdoor-turf" | "indoor-court" | "covered-net";
export type SlotStatus = "available" | "booked" | "blocked";
export type BookingStatus = "pending" | "confirmed" | "cancelled" | "refunded";

export interface Ground {
  id: string;
  name: string;
  sport: Sport;
  format: GroundFormat;
  surface: Surface;
  dimensions?: string;
  capacity: number;
  hourlyRate: number;
  peakRate?: number;
  peakStartHour?: number;
  peakEndHour?: number;
  openHour: number;
  closeHour: number;
  amenities: string[];
  images: string[];
  rating?: number;
  reviewCount?: number;
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
