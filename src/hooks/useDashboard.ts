import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import type { DashboardStats } from "@/types/booking";
import type { ActivityPage, DashboardAttention, DashboardToday } from "@/types/dashboard";

export type { DashboardStats };
export { useUpcomingBookings } from "./useBookings";

/** Live blocks (attention, today's grounds, activity) refresh on this interval. */
const LIVE_REFRESH_MS = 60_000;

const get = async <T,>(path: string, params?: object) => (await api.get(path, { params })).data.data as T;

/** Today's revenue, bookings, customers and active grounds; trends are null when last week was 0. */
export function useDashboardStats() {
  return useQuery<DashboardStats>({
    queryKey: ["dashboard", "stats"],
    queryFn: () => get("/admin/dashboard/stats"),
  });
}

/** Counts for the "Needs attention" cards. */
export function useDashboardAttention() {
  return useQuery<DashboardAttention>({
    queryKey: ["dashboard", "attention"],
    queryFn: () => get("/admin/dashboard/attention"),
    refetchInterval: LIVE_REFRESH_MS,
  });
}

/** Today's slots per active ground, with who's playing now and next. */
export function useDashboardToday() {
  return useQuery<DashboardToday>({
    queryKey: ["dashboard", "today"],
    queryFn: () => get("/admin/dashboard/today"),
    refetchInterval: LIVE_REFRESH_MS,
  });
}

/** Latest booking events across the venue, newest first. */
export function useRecentActivity(limit = 10) {
  return useQuery<ActivityPage>({
    queryKey: ["dashboard", "activity", limit],
    queryFn: () => get("/admin/booking-events", { limit }),
    refetchInterval: LIVE_REFRESH_MS,
  });
}
