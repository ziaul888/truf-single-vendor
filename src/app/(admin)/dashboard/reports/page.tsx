"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, CalendarDays, FileText, Banknote, CheckCircle, Receipt } from "lucide-react";
import { periodFor, useReportSummary, useRevenueSeries, type DateRange } from "@/hooks/useReports";
import { StatCard } from "@/components/features/dashboard/stat-card";
import { RevenueTrendChart } from "@/components/features/reports/report-charts";
import { ReportHeader } from "@/components/features/reports/report-header";
import { slotPriceLabel } from "@/lib/slot-format";

const TREND_LABEL = "vs previous period";

const SUB_PAGES = [
  {
    label: "Revenue Report",
    description: "Revenue over time, ground performance and payment methods.",
    href: "/dashboard/reports/revenue",
    icon: TrendingUp,
    iconCls: "text-violet-500",
    bgCls: "bg-violet-50 dark:bg-violet-950/40",
  },
  {
    label: "Bookings Report",
    description: "Booking volume, status breakdown and how full each ground is.",
    href: "/dashboard/reports/bookings",
    icon: CalendarDays,
    iconCls: "text-blue-500",
    bgCls: "bg-blue-50 dark:bg-blue-950/40",
  },
  {
    label: "Export Data",
    description: "Download revenue, bookings or customers as CSV or Excel.",
    href: "/dashboard/reports/export",
    icon: FileText,
    iconCls: "text-rose-500",
    bgCls: "bg-rose-50 dark:bg-rose-950/40",
  },
];

export default function ReportsPage() {
  const [range, setRange] = useState<DateRange>("30d");
  const period = periodFor(range);
  const summary = useReportSummary(period);
  const revenue = useRevenueSeries(period);
  const s = summary.data;

  return (
    <div className="space-y-6">
      <ReportHeader title="Reports" subtitle="How the business is doing" range={range} period={period} onRange={setRange} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Revenue" value={s ? slotPriceLabel(s.revenue) : "—"} icon={Banknote}
          trend={s?.revenueTrend} trendLabel={TREND_LABEL} loading={summary.isLoading} />
        <StatCard title="Bookings" value={s ? String(s.bookings) : "—"} icon={CalendarDays}
          trend={s?.bookingsTrend} trendLabel={TREND_LABEL} loading={summary.isLoading} />
        <StatCard title="Avg Booking Value" value={s ? slotPriceLabel(s.avgBookingValue) : "—"} icon={Receipt}
          trend={s?.avgBookingValueTrend} trendLabel={TREND_LABEL} loading={summary.isLoading} />
        <StatCard title="Completion Rate" value={s?.completionRate != null ? `${s.completionRate.toFixed(1)}%` : "—"} icon={CheckCircle}
          trend={s?.completionRate != null ? s.completionRateTrend : undefined} trendLabel={TREND_LABEL} loading={summary.isLoading} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium">Revenue Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <RevenueTrendChart data={revenue.data?.points} loading={revenue.isLoading} />
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-3">
        {SUB_PAGES.map(({ label, description, href, icon: Icon, iconCls, bgCls }) => (
          <Card key={href} className="transition-shadow hover:shadow-md">
            <CardContent className="pt-6">
              <div className={`mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg ${bgCls}`}>
                <Icon className={`h-5 w-5 ${iconCls}`} />
              </div>
              <h3 className="font-semibold">{label}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{description}</p>
              <Button variant="outline" size="sm" className="mt-4 w-full" asChild>
                <Link href={href}>View Report</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
