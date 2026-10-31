import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { venueToday } from "@/lib/slot-format";
import type {
  BookingPoint, GroundReport, GroupBy, ReportSummary, RevenuePoint, Series,
} from "@/types/report";

export type DateRange = "7d" | "30d" | "90d" | "1y";

const RANGE_DAYS: Record<DateRange, number> = { "7d": 7, "30d": 30, "90d": 90, "1y": 365 };

export interface ReportPeriod { from: string; to: string }

/** A preset as venue-local dates, ending today (both ends inclusive). */
export const periodFor = (range: DateRange): ReportPeriod => ({
  from: venueToday(-(RANGE_DAYS[range] - 1)),
  to: venueToday(),
});

const get = async <T,>(path: string, params: object) =>
  (await api.get(`/admin/reports/${path}`, { params })).data.data as T;

export function useReportSummary(period: ReportPeriod) {
  return useQuery<ReportSummary>({
    queryKey: ["reports", "summary", period],
    queryFn: () => get("summary", period),
  });
}

/** groupBy left out: the API picks day / week / month from the range length. */
export function useRevenueSeries(period: ReportPeriod, groupBy?: GroupBy) {
  return useQuery<Series<RevenuePoint>>({
    queryKey: ["reports", "revenue", period, groupBy],
    queryFn: () => get("revenue", { ...period, groupBy }),
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
