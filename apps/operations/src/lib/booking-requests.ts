/** Keep single-slot requests compatible with the backend that predates multi-slot bookings. */
export function staffSlotRequest(slotIds: string[]): { slotId: string } | { slotIds: string[] } {
  if (slotIds.length === 0) throw new Error("Select a time slot");
  return slotIds.length === 1 ? { slotId: slotIds[0] } : { slotIds };
}

export function checkoutSlotRequest(slots: { startHour: number; startMinute?: number }[]) {
  if (slots.length === 0) throw new Error("Select a time slot");
  return slots.length === 1
    ? { startHour: slots[0].startHour, startMinute: slots[0].startMinute ?? 0 }
    : { slots };
}
