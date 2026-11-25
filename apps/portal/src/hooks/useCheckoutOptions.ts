"use client";

import { useQuery } from "@tanstack/react-query";
import { getCheckoutOptions } from "@/lib/portal-bookings";
import { useTurfPortal } from "@/components/portal/turf-portal-scope";

/** Payment options and booking slot limits for customer checkout. */
export function useCheckoutOptions() {
  const portal = useTurfPortal();
  return useQuery({
    queryKey: ["portal", "checkout-options", portal?.slug ?? null],
    queryFn: () => getCheckoutOptions(portal?.slug),
    staleTime: 60_000,
  });
}
