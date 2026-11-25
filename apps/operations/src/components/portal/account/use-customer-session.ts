"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { customerSignOut, getCustomerSession } from "@/lib/portal-bookings";
import { useTurfPortal } from "@/components/portal/turf-portal-scope";

export const customerSessionKey = (slug?: string) => ["customer", "session", slug ?? null] as const;
export const customerBookingsKey = (slug?: string) => ["customer", "bookings", slug ?? null] as const;

/** The signed-in customer (null when signed out). Checked once per page load. */
export function useCustomerSession() {
  const slug = useTurfPortal()?.slug;
  return useQuery({
    queryKey: customerSessionKey(slug),
    queryFn: () => getCustomerSession(slug),
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}

/** Signs out everywhere and drops any customer data held in the page. */
export function useCustomerSignOut() {
  const slug = useTurfPortal()?.slug;
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => customerSignOut(slug),
    onSettled: () => {
      qc.setQueryData(customerSessionKey(slug), null);
      qc.removeQueries({ queryKey: customerBookingsKey(slug) });
    },
  });
}
