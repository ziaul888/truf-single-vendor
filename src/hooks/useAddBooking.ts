import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { fromMinorUnits, hourToTime } from "@/lib/ground-format";
import { venueHourNow, venueToday } from "@/lib/slot-format";
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
  return useQuery<TimeSlot[]>({
    queryKey: ["slots", "booking-form", groundId, date],
    queryFn: async () => {
      const { data } = await api.get("/admin/slots", {
        params: { groundId, date, status: "available", openDaysOnly: true, limit: 100 },
      });
      // A slot stays bookable after it starts, for walk-ins, until it ends.
      const isOver = (s: Slot) => s.date === venueToday() && s.endHour <= venueHourNow();
      return (data.data.data as Slot[]).filter((s) => !isOver(s)).map((s) => ({
        id: s.id,
        startTime: hourToTime(s.startHour),
        endTime: hourToTime(s.endHour),
        status: "available" as const,
        price: fromMinorUnits(s.price),
      }));
    },
    enabled: Boolean(groundId && date),
  });
}
