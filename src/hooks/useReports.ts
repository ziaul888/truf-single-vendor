import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { venueToday } from "@/lib/slot-format";
import type {
  BookingPoint,
  GroundReport,
  GroupBy,
  ReportSummary,
  RevenuePoint,
  Series,
} from "@/types/report";
import { useDashboardAudience } from "@/components/dashboard-audience";

export type DateRange = "7d" | "30d" | "90d" | "1y";

const RANGE_DAYS: Record<DateRange, number> = { "7d": 7, "30d": 30, "90d": 90, "1y": 365 };

export interface ReportPeriod {
  from: string;
  to: string;
}

/** A preset as venue-local dates, ending today (both ends inclusive). */
export const periodFor = (range: DateRange): ReportPeriod => ({
  from: venueToday(-(RANGE_DAYS[range] - 1)),
  to: venueToday(),
});

const get = async <T>(path: string, params: object) =>
  (await api.get(`/admin/reports/${path}`, { params })).data.data as T;

export function useReportSummary(period: ReportPeriod) {
  const audience = useDashboardAudience();
  return useQuery<ReportSummary>({
    queryKey: [audience, "reports", "summary", period],
    queryFn: () =>
      audience === "owner"
        ? Promise.resolve({
            period,
            previous: period,
            revenue: 0,
            revenueTrend: null,
            received: 0,
            refunds: 0,
            revenueByMethod: {},
            bookings: 0,
            bookingsTrend: null,
            avgBookingValue: 0,
            avgBookingValueTrend: null,
            completionRate: null,
            completionRateTrend: null,
            cancellationRate: 0,
            statusCounts: {
              pending: 0,
              confirmed: 0,
              cancelled: 0,
              completed: 0,
              no_show: 0,
            },
            noShows: 0,
          })
        : get("summary", period),
  });
}

/** groupBy left out: the API picks day / week / month from the range length. */
export function useRevenueSeries(period: ReportPeriod, groupBy?: GroupBy) {
  const audience = useDashboardAudience();
  return useQuery<Series<RevenuePoint>>({
    queryKey: [audience, "reports", "revenue", period, groupBy],
    queryFn: () =>
      audience === "owner"
        ? Promise.resolve({ groupBy: groupBy ?? "day", points: [] })
        : get("revenue", { ...period, groupBy }),
  });
}

export function useBookingSeries(period: ReportPeriod, groupBy?: GroupBy) {
  return useQuery<Series<BookingPoint>>({
    queryKey: ["reports", "bookings", period, groupBy],
    queryFn: () => get("bookings", { ...period, groupBy }),
  });
}

export function useGroundReport(period: ReportPeriod) {
  return useQuery<GroundReport[]>({
    queryKey: ["reports", "grounds", period],
    queryFn: () => get("grounds", period),
  });
}
