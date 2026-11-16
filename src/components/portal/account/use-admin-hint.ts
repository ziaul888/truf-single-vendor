"use client";

import { useQuery } from "@tanstack/react-query";

/** True when an admin is signed in on this browser: the portal then offers a Dashboard link. Checked once per page load. */
export function useIsAdmin(): boolean {
  const { data } = useQuery({
    queryKey: ["portal", "admin-hint"],
    queryFn: async (): Promise<boolean> => {
      const res = await fetch("/admin-hint", { cache: "no-store" });
      if (!res.ok) return false;
      return Boolean((await res.json()).isAdmin);
    },
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
  return data === true;
}
