"use client";

import { useQuery } from "@tanstack/react-query";
import { getCheckoutOptions } from "@/lib/portal-bookings";

/** Payment options and the booking slot limit, shared by portal and staff booking forms. */
export function useCheckoutOptions() {
  return useQuery({
    queryKey: ["portal", "checkout-options"],
    queryFn: getCheckoutOptions,
    staleTime: 60_000,
  });
}
