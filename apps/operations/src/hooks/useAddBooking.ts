import { useQuery } from "@tanstack/react-query";
import { useDashboardAudience } from "@/components/dashboard-audience";
import { useDashboardApi } from "./useDashboardApi";
import { useMe } from "./useMe";
import { fromMinorUnits } from "@/lib/ground-format";
import { slotEndHours, slotEndTime, slotStartTime, venueHourNow, venueToday } from "@/lib/slot-format";
import type { Slot } from "@/types/slot";

export interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  status: "available" | "taken";
  /** Whole currency units, including any peak hours. */
  price?: number;
}

/** A ground's open slots on a date, from turf-api, in the shape the booking form uses. */
export function useAvailableSlots(groundId: string | undefined, date: string | undefined) {
  const { client, scope } = useDashboardApi();
  const { data: me } = useMe(useDashboardAudience());
  const timezone = me && "tenant" in me ? me.tenant.timezone : undefined;
  return useQuery<TimeSlot[]>({
    queryKey: [...scope, "slots", "booking-form", groundId, date, timezone],
    queryFn: async () => {
      const { data } = await client.get("/admin/slots", {
        params: { groundId, date, status: "available", openDaysOnly: true, limit: 100 },
      });
      // A slot stays bookable after it starts, for walk-ins, until it ends.
      const isOver = (s: Slot) =>
        s.date === venueToday(0, timezone) && slotEndHours(s) <= venueHourNow(timezone);
      return (data.data.data as Slot[]).filter((s) => !isOver(s)).map((s) => ({
        id: s.id,
        startTime: slotStartTime(s),
        endTime: slotEndTime(s),
        status: "available" as const,
        price: fromMinorUnits(s.price),
      }));
    },
    enabled: Boolean(groundId && date),
  });
}
