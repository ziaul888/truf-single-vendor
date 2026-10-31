"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Banknote, Receipt, RotateCcw, Award } from "lucide-react";
import { periodFor, useGroundReport, useReportSummary, useRevenueSeries, type DateRange } from "@/hooks/useReports";
import { StatCard } from "@/components/features/dashboard/stat-card";
import { RevenueByGroundChart, RevenueTrendChart } from "@/components/features/reports/report-charts";
import { ReportHeader } from "@/components/features/reports/report-header";
import { GroundReportTable } from "@/components/features/reports/ground-report-table";
import { PAYMENT_METHOD_LABEL } from "@/components/features/bookings/booking-status-helpers";
import { slotPriceLabel } from "@/lib/slot-format";
import { PAYMENT_METHODS } from "@/types/booking";

const TREND_LABEL = "vs previous period";
const GROUP_LABEL = { day: "Daily", week: "Weekly", month: "Monthly" } as const;

export default function RevenueReportPage() {
  const [range, setRange] = useState<DateRange>("30d");
  const period = periodFor(range);
  const summary = useReportSummary(period);
  const series = useRevenueSeries(period);
  const grounds = useGroundReport(period);
  const s = summary.data;
  const top = grounds.data?.[0];

  return (
    <div className="space-y-6">
      <ReportHeader title="Revenue Report" subtitle="Money received, minus refunds" range={range} period={period} onRange={setRange} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Net Revenue" value={s ? slotPriceLabel(s.revenue) : "—"} icon={Banknote}
          trend={s?.revenueTrend} trendLabel={TREND_LABEL} loading={summary.isLoading} />
        <StatCard title="Avg Booking Value" value={s ? slotPriceLabel(s.avgBookingValue) : "—"} icon={Receipt}
          trend={s?.avgBookingValueTrend} trendLabel={TREND_LABEL} loading={summary.isLoading} />
        <StatCard title="Refunds" value={s ? slotPriceLabel(s.refunds) : "—"} icon={RotateCcw} loading={summary.isLoading} />
        <StatCard title="Top Ground" value={top && top.revenue > 0 ? top.groundName : "—"} icon={Award} loading={grounds.isLoading} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base font-medium">
              {series.data ? GROUP_LABEL[series.data.groupBy] : ""} Revenue &amp; Bookings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RevenueTrendChart data={series.data?.points} loading={series.isLoading} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium">Where the money came from</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {summary.isLoading || !s ? (
              <div className="space-y-2">{[...Array(5)].map((_, i) => <div key={i} className="h-6 animate-pulse rounded bg-muted" />)}</div>
            ) : (
              <>
                {PAYMENT_METHODS.map((m) => (
                  <div key={m} className="flex justify-between">
                    <span className="text-muted-foreground">{PAYMENT_METHOD_LABEL[m]}</span>
                    <span className="font-medium tabular-nums">{slotPriceLabel(s.revenueByMethod[m])}</span>
                  </div>
                ))}
                <div className="space-y-2 border-t pt-3">
                  <div className="flex justify-between"><span className="text-muted-foreground">Received</span><span className="tabular-nums">{slotPriceLabel(s.received)}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Refunded</span><span className="tabular-nums text-red-500">− {slotPriceLabel(s.refunds)}</span></div>
                  <div className="flex justify-between text-base font-bold"><span>Net revenue</span><span className="tabular-nums">{slotPriceLabel(s.revenue)}</span></div>
                </div>
                <p className="text-xs text-muted-foreground">Each method is net of its refunds.</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium">Revenue by Ground</CardTitle>
        </CardHeader>
        <CardContent>
          <RevenueByGroundChart data={grounds.data} loading={grounds.isLoading} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium">Ground Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <GroundReportTable data={grounds.data} loading={grounds.isLoading} mode="revenue" />
        </CardContent>
      </Card>
    </div>
  );
}
