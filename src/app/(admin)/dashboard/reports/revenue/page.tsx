"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DollarSign, TrendingUp, BarChart3, Award } from "lucide-react";
import { useReportSummary, useMonthlyRevenue, useGroundRevenue, type DateRange } from "@/hooks/useReports";
import { StatCard } from "@/components/features/dashboard/stat-card";
import { MonthlyRevenueChart, RevenueByGroundChart } from "@/components/features/reports/report-charts";
import { formatCurrency } from "@/lib/utils";

const RANGES: { label: string; value: DateRange }[] = [
  { label: "7 days",  value: "7d"  },
  { label: "30 days", value: "30d" },
  { label: "90 days", value: "90d" },
  { label: "1 year",  value: "1y"  },
];

export default function RevenueReportPage() {
  const [range, setRange] = useState<DateRange>("30d");
  const summary  = useReportSummary(range);
  const monthly  = useMonthlyRevenue(range);
  const byGround = useGroundRevenue(range);

  const topGround     = byGround.data?.[0];
  const totalFromGrds = byGround.data?.reduce((s, g) => s + g.revenue, 0) ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Revenue Report</h1>
          <p className="text-muted-foreground">Detailed revenue breakdown and ground performance</p>
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
          title="Total Revenue"
          value={summary.data ? formatCurrency(summary.data.totalRevenue) : "—"}
          icon={DollarSign}
          trend={summary.data?.revenueTrend}
          loading={summary.isLoading}
        />
        <StatCard
          title="Avg Booking Value"
          value={summary.data ? formatCurrency(summary.data.avgBookingValue) : "—"}
          icon={TrendingUp}
          trend={summary.data?.avgValueTrend}
          loading={summary.isLoading}
        />
        <StatCard
          title="Top Ground Revenue"
          value={topGround ? formatCurrency(topGround.revenue) : "—"}
          icon={Award}
          loading={byGround.isLoading}
        />
        <StatCard
          title="Grounds Tracked"
          value={byGround.data ? String(byGround.data.length) : "—"}
          icon={BarChart3}
          loading={byGround.isLoading}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium">Monthly Revenue &amp; Bookings</CardTitle>
        </CardHeader>
        <CardContent>
          <MonthlyRevenueChart data={monthly.data} loading={monthly.isLoading} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium">Revenue by Ground</CardTitle>
        </CardHeader>
        <CardContent>
          <RevenueByGroundChart data={byGround.data} loading={byGround.isLoading} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium">Ground Performance</CardTitle>
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
                  <TableHead className="text-right">Bookings</TableHead>
                  <TableHead className="text-right">Revenue</TableHead>
                  <TableHead className="text-right">Share</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {byGround.data.map((g) => (
                  <TableRow key={g.groundName}>
                    <TableCell className="font-medium">{g.groundName}</TableCell>
                    <TableCell className="text-right">{g.bookings}</TableCell>
                    <TableCell className="text-right font-medium">{formatCurrency(g.revenue)}</TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {totalFromGrds > 0 ? `${((g.revenue / totalFromGrds) * 100).toFixed(1)}%` : "—"}
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
