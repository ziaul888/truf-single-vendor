import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface PricingTier {
  pricePerHour: number;
  from: string;
  to: string;
}

export interface Ground {
  id: string;
  branchId: string;
  name: string;
  type: "cricket" | "football" | "hockey" | "badminton" | "tennis" | "basketball" | "other";
  size: string;
  capacity: number;
  photos: string[];
  amenities: string[];
  pricePerHour: number;
  peakPricing: PricingTier;
  offPeakPricing: PricingTier;
  openingTime: string;
  closingTime: string;
  isActive: boolean;
  todayBookings: number;
  createdAt: string;
  updatedAt: string;
}

export function useGrounds() {
  return useQuery<Ground[]>({
    queryKey: ["grounds"],
    queryFn: async () => {
      const res = await fetch("/api/grounds");
      const json = await res.json();
      return json.data;
    },
  });
}

export function useToggleGroundStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const res = await fetch(`/api/grounds/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Failed to update");
      return json.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["grounds"] });
    },
  });
}
