import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  status: "available" | "taken";
}

export function useAvailableSlots(groundId: string | undefined, date: string | undefined) {
  return useQuery<TimeSlot[]>({
    queryKey: ["slots", groundId, date],
    queryFn: async () => {
      const res = await fetch(`/api/grounds/${groundId}/slots?date=${date}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Failed to load slots");
      return json.data as TimeSlot[];
    },
    enabled: Boolean(groundId && date),
  });
}

export function useCreateBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to create booking");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
    },
  });
}
