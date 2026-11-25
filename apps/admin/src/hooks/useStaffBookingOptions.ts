import { useSlotSettings } from "./useSlots";

export function useStaffBookingOptions() {
  const settings = useSlotSettings();
  return {
    data: settings.data && { maxSlotsPerBooking: settings.data.multiSlotEnabled ? settings.data.maxSlotsPerBooking : 1 },
    refetch: settings.refetch,
  };
}
