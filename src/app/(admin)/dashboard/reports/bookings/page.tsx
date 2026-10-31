"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays, CheckCircle, XCircle, Gauge } from "lucide-react";
import { periodFor, useBookingSeries, useGroundReport, useReportSummary, type DateRange } from "@/hooks/useReports";
import { StatCard } from "@/components/features/dashboard/stat-card";
import { BookingStatusPieChart, BookingTrendsChart } from "@/components/features/reports/report-charts";
import { ReportHeader } from "@/components/features/reports/report-header";
import { GroundReportTable } from "@/components/features/reports/ground-report-table";

const TREND_LABEL = "vs previous period";

export default function BookingsReportPage() {
  const [range, setRange] = useState<DateRange>("30d");
  const period = periodFor(range);
  const summary = useReportSummary(period);
  const series = useBookingSeries(period);
  const grounds = useGroundReport(period);
  const s = summary.data;

  // Venue-wide utilization: all hours booked over all hours open.
  const hours = grounds.data?.reduce((t, g) => ({ booked: t.booked + g.hoursBooked, open: t.open + g.hoursAvailable }), { booked: 0, open: 0 });
  const utilization = hours && hours.open > 0 ? `${((hours.booked / hours.open) * 100).toFixed(1)}%` : "—";

  return (
    <div className="space-y-6">
      <ReportHeader title="Bookings Report" subtitle="Counted by the day each slot is played" range={range} period={period} onRange={setRange} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Bookings" value={s ? String(s.bookings) : "—"} icon={CalendarDays}
          trend={s?.bookingsTrend} trendLabel={TREND_LABEL} loading={summary.isLoading} />
        <StatCard title="Completion Rate" value={s?.completionRate != null ? `${s.completionRate.toFixed(1)}%` : "—"} icon={CheckCircle}
          trend={s?.completionRate != null ? s.completionRateTrend : undefined} trendLabel={TREND_LABEL} loading={summary.isLoading} />
        <StatCard title="Cancellation Rate" value={s ? `${s.cancellationRate.toFixed(1)}%` : "—"} icon={XCircle} loading={summary.isLoading} />
        <StatCard title="Utilization" value={utilization} icon={Gauge} loading={grounds.isLoading} />
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-base font-medium">Booking Trends Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <BookingTrendsChart data={series.data?.points} loading={series.isLoading} />
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base font-medium">Status Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <BookingStatusPieChart counts={s?.statusCounts} loading={summary.isLoading} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium">Ground Utilization</CardTitle>
        </CardHeader>
        <CardContent>
          <GroundReportTable data={grounds.data} loading={grounds.isLoading} mode="utilization" />
          <p className="mt-3 text-xs text-muted-foreground">Hours booked out of hours open, leaving out blocked slots and closures.</p>
        </CardContent>
      </Card>
    </div>
  );
}
