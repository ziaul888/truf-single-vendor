import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";

export type DateRange = "7d" | "30d" | "90d" | "1y";

export interface ReportSummary {
  totalRevenue: number;
  revenueTrend: number;
  totalBookings: number;
  bookingsTrend: number;
  avgBookingValue: number;
  avgValueTrend: number;
  completionRate: number;
  completionTrend: number;
}

export interface MonthlyRevenue {
  month: string;
  revenue: number;
  bookings: number;
}

export interface GroundRevenue {
  groundName: string;
  revenue: number;
  bookings: number;
}

export interface BookingTrend {
  date: string;
  confirmed: number;
  pending: number;
  cancelled: number;
  completed: number;
}

export function useReportSummary(range: DateRange) {
  return useQuery<ReportSummary>({
    queryKey: ["reports", "summary", range],
    queryFn: async () => {
      const { data } = await api.get("/reports/summary", { params: { range } });
      return data.data;
    },
  });
}

export function useMonthlyRevenue(range: DateRange) {
  return useQuery<MonthlyRevenue[]>({
    queryKey: ["reports", "revenue", "monthly", range],
    queryFn: async () => {
      const { data } = await api.get("/reports/revenue/monthly", { params: { range } });
      return data.data;
    },
  });
}

export function useGroundRevenue(range: DateRange) {
  return useQuery<GroundRevenue[]>({
    queryKey: ["reports", "revenue", "by-ground", range],
    queryFn: async () => {
      const { data } = await api.get("/reports/revenue/by-ground", { params: { range } });
      return data.data;
    },
  });
}

export function useBookingTrends(range: DateRange) {
  return useQuery<BookingTrend[]>({
    queryKey: ["reports", "bookings", "trends", range],
    queryFn: async () => {
      const { data } = await api.get("/reports/bookings/trends", { params: { range } });
      return data.data;
    },
  });
}
