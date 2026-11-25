import { useQuery } from "@tanstack/react-query";
import { useDashboardApi } from "./useDashboardApi";
import type { DashboardStats } from "@/types/booking";
import type { ActivityPage, DashboardAttention, DashboardToday } from "@/types/dashboard";

export type { DashboardStats };
export { useUpcomingBookings } from "./useBookings";

/** Live blocks (attention, today's grounds, activity) refresh on this interval. */
const LIVE_REFRESH_MS = 60_000;

/** Today's revenue, bookings, customers and active grounds. */
export function useDashboardStats() {
  const { client, scope } = useDashboardApi();
  return useQuery<DashboardStats>({
    queryKey: [...scope, "dashboard", "stats"],
    queryFn: async () => (await client.get("/admin/dashboard/stats")).data.data,
  });
}

export function useDashboardAttention() {
  const { client, scope } = useDashboardApi();
  return useQuery<DashboardAttention>({
    queryKey: [...scope, "dashboard", "attention"],
    queryFn: async () => (await client.get("/admin/dashboard/attention")).data.data,
    refetchInterval: LIVE_REFRESH_MS,
  });
}

export function useDashboardToday() {
  const { client, scope } = useDashboardApi();
  return useQuery<DashboardToday>({
    queryKey: [...scope, "dashboard", "today"],
    queryFn: async () => (await client.get("/admin/dashboard/today")).data.data,
    refetchInterval: LIVE_REFRESH_MS,
  });
}

export function useRecentActivity(limit = 10) {
  const { client, scope } = useDashboardApi();
  return useQuery<ActivityPage>({
    queryKey: [...scope, "dashboard", "activity", limit],
    queryFn: async () => (await client.get("/admin/booking-events", { params: { limit } })).data.data,
    refetchInterval: LIVE_REFRESH_MS,
  });
}
