import { useQuery } from "@tanstack/react-query";
import { useDashboardApi } from "./useDashboardApi";
import { venueToday } from "@/lib/slot-format";
import type {
  BookingPoint,
  GroundReport,
  GroupBy,
  ReportSummary,
  RevenuePoint,
  Series,
} from "@/types/report";

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

export function useReportSummary(period: ReportPeriod) {
  const { client, scope } = useDashboardApi();
  return useQuery<ReportSummary>({
    queryKey: [...scope, "reports", "summary", period],
    queryFn: async () => (await client.get("/admin/reports/summary", { params: period })).data.data,
  });
}

/** With no groupBy, the API picks day, week or month based on the range. */
export function useRevenueSeries(period: ReportPeriod, groupBy?: GroupBy) {
  const { client, scope } = useDashboardApi();
  return useQuery<Series<RevenuePoint>>({
    queryKey: [...scope, "reports", "revenue", period, groupBy],
    queryFn: async () => (await client.get("/admin/reports/revenue", { params: { ...period, groupBy } })).data.data,
  });
}

export function useBookingSeries(period: ReportPeriod, groupBy?: GroupBy) {
  const { client, scope } = useDashboardApi();
  return useQuery<Series<BookingPoint>>({
    queryKey: [...scope, "reports", "bookings", period, groupBy],
    queryFn: async () => (await client.get("/admin/reports/bookings", { params: { ...period, groupBy } })).data.data,
  });
}

export function useGroundReport(period: ReportPeriod) {
  const { client, scope } = useDashboardApi();
  return useQuery<GroundReport[]>({
    queryKey: [...scope, "reports", "grounds", period],
    queryFn: async () => (await client.get("/admin/reports/grounds", { params: period })).data.data,
  });
}
