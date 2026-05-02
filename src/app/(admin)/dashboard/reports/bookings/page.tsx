"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CalendarDays, CheckCircle, XCircle, MapPin } from "lucide-react";
import { useReportSummary, useBookingTrends, useGroundRevenue, type DateRange } from "@/hooks/useReports";
import { StatCard } from "@/components/features/dashboard/stat-card";
import { BookingTrendsChart, BookingStatusPieChart } from "@/components/features/reports/report-charts";
import { formatCurrency } from "@/lib/utils";

const RANGES: { label: string; value: DateRange }[] = [
  { label: "7 days",  value: "7d"  },
  { label: "30 days", value: "30d" },
  { label: "90 days", value: "90d" },
  { label: "1 year",  value: "1y"  },
];

export default function BookingsReportPage() {
  const [range, setRange] = useState<DateRange>("30d");
  const summary  = useReportSummary(range);
  const trends   = useBookingTrends(range);
  const byGround = useGroundRevenue(range);

  const statusData = useMemo(() => {
    if (!trends.data?.length) return [];
    const totals = { confirmed: 0, pending: 0, cancelled: 0, completed: 0 };
    trends.data.forEach((t) => {
      totals.confirmed += t.confirmed;
      totals.pending   += t.pending;
      totals.cancelled += t.cancelled;
      totals.completed += t.completed;
    });
    return [
      { name: "Completed",  value: totals.completed  },
      { name: "Confirmed",  value: totals.confirmed  },
      { name: "Pending",    value: totals.pending    },
      { name: "Cancelled",  value: totals.cancelled  },
    ].filter((d) => d.value > 0);
  }, [trends.data]);

  const cancellationRate = useMemo(() => {
    if (!statusData.length) return null;
    const total = statusData.reduce((s, d) => s + d.value, 0);
    const cancelled = statusData.find((d) => d.name === "Cancelled")?.value ?? 0;
    return total > 0 ? ((cancelled / total) * 100).toFixed(1) : "0.0";
  }, [statusData]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bookings Report</h1>
          <p className="text-muted-foreground">Booking trends, status distribution, and ground utilization</p>
        </div>
        <div className="flex gap-1 rounded-lg border p-1">
          {RANGES.map(({ label, value }) => (
            <Button key={value} variant={range === value ? "default" : "ghost"}
              size="sm" className="h-7 text-xs" onClick={() => setRange(value)}>
              {label}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Bookings"
          value={summary.data ? String(summary.data.totalBookings) : "—"}
          icon={CalendarDays}
          trend={summary.data?.bookingsTrend}
          loading={summary.isLoading}
        />
        <StatCard
          title="Completion Rate"
          value={summary.data ? `${summary.data.completionRate.toFixed(1)}%` : "—"}
          icon={CheckCircle}
          trend={summary.data?.completionTrend}
          loading={summary.isLoading}
        />
        <StatCard
          title="Cancellation Rate"
          value={cancellationRate !== null ? `${cancellationRate}%` : "—"}
          icon={XCircle}
          loading={trends.isLoading}
        />
        <StatCard
          title="Active Grounds"
          value={byGround.data ? String(byGround.data.length) : "—"}
          icon={MapPin}
          loading={byGround.isLoading}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-base font-medium">Booking Trends Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <BookingTrendsChart data={trends.data} loading={trends.isLoading} />
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base font-medium">Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <BookingStatusPieChart data={statusData} loading={trends.isLoading} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium">Ground Utilization</CardTitle>
        </CardHeader>
        <CardContent>
          {byGround.isLoading ? (
            <div className="space-y-2">
              {[...Array(4)].map((_, i) => <div key={i} className="h-10 animate-pulse rounded bg-muted" />)}
            </div>
          ) : !byGround.data?.length ? (
            <p className="text-sm text-muted-foreground">No data available for this period.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ground</TableHead>
                  <TableHead className="text-right">Total Bookings</TableHead>
                  <TableHead className="text-right">Revenue</TableHead>
                  <TableHead className="text-right">Avg / Booking</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {byGround.data.map((g) => (
                  <TableRow key={g.groundName}>
                    <TableCell className="font-medium">{g.groundName}</TableCell>
                    <TableCell className="text-right">{g.bookings}</TableCell>
                    <TableCell className="text-right font-medium">{formatCurrency(g.revenue)}</TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {g.bookings > 0 ? formatCurrency(Math.round(g.revenue / g.bookings)) : "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
