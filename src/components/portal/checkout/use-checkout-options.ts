"use client";

import { useQuery } from "@tanstack/react-query";
import { getCheckoutOptions } from "@/lib/portal-bookings";

/** Service fee, cash availability and hold time from turf-api. Shared by the form and the summary. */
export function useCheckoutOptions() {
  return useQuery({
    queryKey: ["portal", "checkout-options"],
    queryFn: getCheckoutOptions,
    staleTime: 60_000,
  });
}
