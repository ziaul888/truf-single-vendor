import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import type { DashboardStats } from "@/types/booking";

export type { DashboardStats };
export { useUpcomingBookings } from "./useBookings";

/** Today's revenue, bookings, customers and active grounds, each with a % trend against last week. */
export function useDashboardStats() {
  return useQuery<DashboardStats>({
    queryKey: ["dashboard", "stats"],
    queryFn: async () => (await api.get("/admin/dashboard/stats")).data.data,
  });
}
