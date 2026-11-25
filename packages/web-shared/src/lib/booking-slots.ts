import { formatSlotRange, slotMinutes, type SlotTimes } from "./slot-format";

/** The part of a booking (admin or customer view) these helpers read. */
interface BookingWithSlots {
  slot: SlotTimes & { date: string };
  /** Missing from older APIs, and a booking made before multi-slot bookings has just `slot`. */
  slots?: (SlotTimes & { date: string })[];
}

/** Every slot of the booking, earliest first; falls back to its single `slot`. */
export function bookingSlots(b: BookingWithSlots): (SlotTimes & { date: string })[] {
  return b.slots?.length ? b.slots : [b.slot];
}

/** The booked times as one label: "6:00 – 8:30 PM" (see formatSlotRange). */
export const formatBookingSlots = (b: BookingWithSlots) => formatSlotRange(bookingSlots(b));

export const bookingSlotCount = (b: BookingWithSlots) => bookingSlots(b).length;

/** Total booked time in minutes. */
export const bookingMinutes = (b: BookingWithSlots) => bookingSlots(b).reduce((sum, s) => sum + slotMinutes(s), 0);
