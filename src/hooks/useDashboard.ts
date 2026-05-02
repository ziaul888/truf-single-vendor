import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import type { Booking, Ground } from "@/types";

export interface DashboardStats {
  todayRevenue: number;
  todayRevenueTrend: number;
  todayBookings: number;
  todayBookingsTrend: number;
  totalCustomers: number;
  totalCustomersTrend: number;
  activeGrounds: number;
  activeGroundsTrend: number;
}

export function useDashboardStats() {
  return useQuery<DashboardStats>({
    queryKey: ["dashboard", "stats"],
    queryFn: async () => {
      const { data } = await api.get("/dashboard/stats");
      return data.data;
    },
  });
}

export function useUpcomingBookings() {
  return useQuery<Booking[]>({
    queryKey: ["dashboard", "upcoming-bookings"],
    queryFn: async () => {
      const { data } = await api.get("/bookings/upcoming");
      return data.data;
    },
  });
}

export function useActiveGrounds() {
  return useQuery<Ground[]>({
    queryKey: ["dashboard", "active-grounds"],
    queryFn: async () => {
      const { data } = await api.get("/grounds", { params: { isActive: true } });
      return data.data;
    },
  });
}
