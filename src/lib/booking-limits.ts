import type { CheckoutOptions } from "@/types/booking";

export const MAX_SLOTS_PER_BOOKING = 4;

/** Older APIs, loading and failed capability checks permit single-slot bookings only. */
export function bookingSlotLimit(options?: Pick<CheckoutOptions, "maxSlotsPerBooking">): number {
  const limit = options?.maxSlotsPerBooking;
  return typeof limit === "number" && Number.isInteger(limit) && limit > 0
    ? Math.min(limit, MAX_SLOTS_PER_BOOKING)
    : 1;
}
