"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { customerSignOut, getCustomerSession } from "@/lib/portal-bookings";

export const CUSTOMER_SESSION_KEY = ["customer", "session"] as const;

/** The signed-in customer (null when signed out). Checked once per page load. */
export function useCustomerSession() {
  return useQuery({
    queryKey: CUSTOMER_SESSION_KEY,
    queryFn: getCustomerSession,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}

/** Signs out everywhere and drops any customer data held in the page. */
export function useCustomerSignOut() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: customerSignOut,
    onSettled: () => {
      qc.setQueryData(CUSTOMER_SESSION_KEY, null);
      qc.removeQueries({ queryKey: ["customer", "bookings"] });
    },
  });
}
