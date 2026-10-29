// Ground shapes exactly as turf-api returns them (v1). Keep the enums in sync with
// turf-api's src/grounds/grounds.schemas.ts.

export const SPORTS = ["football", "cricket", "badminton", "tennis", "hockey", "basketball", "other"] as const;
export const FORMATS = ["4x4", "5x5", "6x6", "7x7", "8x8", "9x9", "11x11", "net", "court"] as const;
export const SURFACES = ["outdoor-turf", "indoor-court", "covered-net"] as const;
export const AMENITIES = [
  "Floodlights", "Parking", "Changing room", "Washroom", "Scoreboard",
  "Drinking water", "First aid", "AC", "CCTV", "Seating area",
] as const;
export const AVAILABLE_DAYS = ["everyday", "weekdays", "weekends", "custom"] as const;
export const WEEKDAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;

export type Sport = (typeof SPORTS)[number];
export type GroundFormat = (typeof FORMATS)[number];
export type Surface = (typeof SURFACES)[number];
export type Amenity = (typeof AMENITIES)[number];
export type AvailableDays = (typeof AVAILABLE_DAYS)[number];
export type Weekday = (typeof WEEKDAYS)[number];
export const SLOT_DURATIONS = [60, 120] as const;
export type SlotDurationMinutes = (typeof SLOT_DURATIONS)[number];

/** A peak period in whole hours: [fromHour, toHour). */
export interface PeakRange {
  fromHour: number;
  toHour: number;
}

/** Public portal fields — only grounds that are active and shown on the portal. */
export interface ApiPublicGround {
  id: string;
  name: string;
  description: string | null;
  address: string | null;
  /** Smallest currency unit: 1500 = 15.00. */
  hourlyPrice: number;
  /** 0–23 */
  openingHour: number;
  /** 1–24, after openingHour */
  closingHour: number;
  sport: Sport;
  format: GroundFormat | null;
  surface: Surface | null;
  dimensions: string | null;
  capacity: number | null;
  amenities: Amenity[];
  availableDays: AvailableDays;
  /** Only meaningful when availableDays is "custom". */
  customDays: Weekday[];
  /** Smallest unit. When set, hourlyPrice is the off-peak price. */
  peakPrice: number | null;
  peakRanges: PeakRange[];
  slotDurationMinutes: SlotDurationMinutes;
  /** Same-origin URLs (/api/v1/uploads/…); the first is the cover. Managed via the photo endpoints. */
  photos: string[];
}

/** Dashboard fields. */
export interface ApiGround extends ApiPublicGround {
  isActive: boolean;
  showOnPortal: boolean;
  internalNotes: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Fields accepted by POST /admin/grounds (and any subset by PATCH; null clears an optional one). */
export interface GroundWriteInput {
  name: string;
  sport: Sport;
  hourlyPrice: number;
  openingHour: number;
  closingHour: number;
  description?: string | null;
  address?: string | null;
  format?: GroundFormat | null;
  surface?: Surface | null;
  dimensions?: string | null;
  capacity?: number | null;
  amenities?: Amenity[];
  availableDays?: AvailableDays;
  customDays?: Weekday[];
  peakPrice?: number | null;
  peakRanges?: PeakRange[];
  slotDurationMinutes?: SlotDurationMinutes;
  isActive?: boolean;
  showOnPortal?: boolean;
  internalNotes?: string | null;
}
