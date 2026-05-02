"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, CalendarDays, FileText, DollarSign, CheckCircle } from "lucide-react";
import { useReportSummary, useMonthlyRevenue, type DateRange } from "@/hooks/useReports";
import { StatCard } from "@/components/features/dashboard/stat-card";
import { MonthlyRevenueChart } from "@/components/features/reports/report-charts";
import { formatCurrency } from "@/lib/utils";

const RANGES: { label: string; value: DateRange }[] = [
  { label: "7 days",  value: "7d"  },
  { label: "30 days", value: "30d" },
  { label: "90 days", value: "90d" },
  { label: "1 year",  value: "1y"  },
];

const SUB_PAGES = [
  {
    label: "Revenue Report",
    description: "Monthly revenue trends, ground performance, and income breakdown.",
    href: "/dashboard/reports/revenue",
    icon: TrendingUp,
    iconCls: "text-violet-500",
    bgCls: "bg-violet-50 dark:bg-violet-950/40",
  },
  {
    label: "Bookings Report",
    description: "Booking volume, status distribution, and ground utilization over time.",
    href: "/dashboard/reports/bookings",
    icon: CalendarDays,
    iconCls: "text-blue-500",
    bgCls: "bg-blue-50 dark:bg-blue-950/40",
  },
  {
    label: "Export Data",
    description: "Download bookings or customer data as CSV or Excel spreadsheet.",
    href: "/dashboard/reports/export",
    icon: FileText,
    iconCls: "text-rose-500",
    bgCls: "bg-rose-50 dark:bg-rose-950/40",
  },
];

export default function ReportsPage() {
  const [range, setRange] = useState<DateRange>("30d");
  const summary = useReportSummary(range);
  const revenue = useMonthlyRevenue(range);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
          <p className="text-muted-foreground">Analytics and insights for your turf business</p>
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
          title="Total Bookings"
          value={summary.data ? String(summary.data.totalBookings) : "—"}
          icon={CalendarDays}
          trend={summary.data?.bookingsTrend}
          loading={summary.isLoading}
        />
        <StatCard
          title="Avg Booking Value"
          value={summary.data ? formatCurrency(summary.data.avgBookingValue) : "—"}
          icon={DollarSign}
          trend={summary.data?.avgValueTrend}
          loading={summary.isLoading}
        />
        <StatCard
          title="Completion Rate"
          value={summary.data ? `${summary.data.completionRate.toFixed(1)}%` : "—"}
          icon={CheckCircle}
          trend={summary.data?.completionTrend}
          loading={summary.isLoading}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium">Revenue Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <MonthlyRevenueChart data={revenue.data} loading={revenue.isLoading} />
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
