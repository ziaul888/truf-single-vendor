"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadialBarChart, RadialBar, Legend,
} from "recharts";
import { periodFor, useReportSummary, useRevenueSeries } from "@/hooks/useReports";
import { slotPriceLabel } from "@/lib/slot-format";
import { STATUS_COLORS, compactTaka } from "@/components/features/reports/report-charts";
import type { BookingStatus } from "@/types/booking";

const STATUS_ORDER: { key: BookingStatus; name: string }[] = [
  { key: "completed", name: "Completed" },
  { key: "confirmed", name: "Confirmed" },
  { key: "pending", name: "Pending" },
  { key: "cancelled", name: "Cancelled" },
];

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

const Skeleton = () => <div className="h-[240px] animate-pulse rounded bg-muted" />;

/** Net revenue for each of the last 7 days (today included). */
export function WeeklyRevenueChart() {
  const { data, isLoading } = useRevenueSeries(periodFor("7d"), "day");
  return (
    <ChartCard title="Weekly Revenue">
      {isLoading ? <Skeleton /> : (
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={data?.points ?? []} margin={{ top: 4, right: 8, left: -4, bottom: 0 }}>
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="label" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} tickFormatter={compactTaka} />
            <Tooltip formatter={(v: number) => slotPriceLabel(v)} />
            <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#22c55e" strokeWidth={2} fill="url(#revenueGradient)" />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </ChartCard>
  );
}

/** Bookings played in the last 7 days, by status now. */
export function BookingsByStatusChart() {
  const { data, isLoading } = useReportSummary(periodFor("7d"));
  const rows = STATUS_ORDER
    .map(({ key, name }) => ({ name, value: data?.statusCounts[key] ?? 0, fill: STATUS_COLORS[key] }))
    .filter((r) => r.value > 0);

  return (
    <ChartCard title="Bookings by Status · last 7 days">
      {isLoading ? <Skeleton /> : rows.length === 0 ? (
        <p className="flex h-[240px] items-center justify-center text-sm text-muted-foreground">No bookings in the last 7 days.</p>
      ) : (
        <ResponsiveContainer width="100%" height={240}>
          <RadialBarChart cx="50%" cy="50%" innerRadius={30} outerRadius={110} data={rows} startAngle={90} endAngle={-270}>
            <RadialBar dataKey="value" cornerRadius={6} label={{ position: "insideStart", fill: "#fff", fontSize: 11 }} />
            <Legend iconSize={10} />
            <Tooltip />
          </RadialBarChart>
        </ResponsiveContainer>
      )}
    </ChartCard>
  );
}
