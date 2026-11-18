import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { ownerApi } from "@/lib/owner-api";
import type { ApiSuccess } from "@/types/api";
import type { DashboardStats } from "@/types/booking";
import type { ActivityPage, DashboardAttention, DashboardToday } from "@/types/dashboard";
import { useDashboardAudience } from "@/components/dashboard-audience";

export type { DashboardStats };
export { useUpcomingBookings } from "./useBookings";

/** Live blocks (attention, today's grounds, activity) refresh on this interval. */
const LIVE_REFRESH_MS = 60_000;

const get = async <T>(path: string, params?: object) =>
  (await api.get(path, { params })).data.data as T;

/** Today's revenue, bookings, customers and active grounds; trends are null when last week was 0. */
export function useDashboardStats() {
  const audience = useDashboardAudience();
  return useQuery<DashboardStats>({
    queryKey: [audience, "dashboard", "stats"],
    queryFn: async () => {
      if (audience === "staff") return get<DashboardStats>("/admin/dashboard/stats");
      const { data } = await ownerApi.get<ApiSuccess<{ activeGrounds: number }>>("/admin/dashboard/stats");
      return {
        todayRevenue: 0,
        todayRevenueTrend: null,
        todayBookings: 0,
        todayBookingsTrend: null,
        totalCustomers: 0,
        totalCustomersTrend: null,
        activeGrounds: data.data.activeGrounds,
        activeGroundsTrend: null,
        bookingsTodayByGround: [],
      };
    },
  });
}

/** Counts for the "Needs attention" cards. */
export function useDashboardAttention() {
  const audience = useDashboardAudience();
  return useQuery<DashboardAttention>({
    queryKey: [audience, "dashboard", "attention"],
    queryFn: () =>
      audience === "owner"
        ? Promise.resolve({
            toConfirm: { count: 0, payAtVenue: 0 },
            toVerify: { count: 0 },
            overdue: { count: 0, amount: 0 },
            dueToday: { count: 0, amount: 0 },
            payingNow: { count: 0 },
            startingSoon: { count: 0, withinMinutes: 60 },
            needsOutcome: { count: 0, bookings: [] },
            refundDue: { count: 0 },
          })
        : get("/admin/dashboard/attention"),
    refetchInterval: LIVE_REFRESH_MS,
  });
}

/** Today's slots per active ground, with who's playing now and next. */
export function useDashboardToday() {
  const audience = useDashboardAudience();
  return useQuery<DashboardToday>({
    queryKey: [audience, "dashboard", "today"],
    queryFn: async () =>
      audience === "owner"
        ? (await ownerApi.get<ApiSuccess<DashboardToday>>("/admin/dashboard/today")).data.data
        : get("/admin/dashboard/today"),
    refetchInterval: LIVE_REFRESH_MS,
  });
}

/** Latest booking events across the venue, newest first. */
export function useRecentActivity(limit = 10) {
  const audience = useDashboardAudience();
  return useQuery<ActivityPage>({
    queryKey: [audience, "dashboard", "activity", limit],
    queryFn: () =>
      audience === "owner"
        ? Promise.resolve({ data: [], total: 0, page: 1, limit })
        : get("/admin/booking-events", { limit }),
    refetchInterval: LIVE_REFRESH_MS,
  });
}
