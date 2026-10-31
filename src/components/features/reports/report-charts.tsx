"use client";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Legend, AreaChart, Area, PieChart, Pie, Cell, ComposedChart, Line,
} from "recharts";
import { fromMinorUnits } from "@/lib/ground-format";
import { slotPriceLabel } from "@/lib/slot-format";
import type { BookingStatus } from "@/types/booking";
import type { BookingPoint, GroundReport, RevenuePoint } from "@/types/report";

export const STATUS_COLORS: Record<BookingStatus, string> = {
  completed: "#6366f1",
  confirmed: "#22c55e",
  pending:   "#f59e0b",
  cancelled: "#ef4444",
};

const STATUS_NAME: Record<BookingStatus, string> = {
  completed: "Completed", confirmed: "Confirmed", pending: "Pending", cancelled: "Cancelled",
};

/** Axis ticks from minor units: ৳12k, ৳1.2k, ৳800. */
export function compactTaka(minor: number) {
  const taka = fromMinorUnits(minor);
  if (Math.abs(taka) >= 1000) return `৳${(taka / 1000).toFixed(Math.abs(taka) >= 10_000 ? 0 : 1)}k`;
  return `৳${taka}`;
}

function ChartSkeleton({ height = 280 }: { height?: number }) {
  return <div className="animate-pulse rounded bg-muted" style={{ height }} />;
}

function EmptyChart({ text = "No data for this period." }: { text?: string }) {
  return <p className="py-10 text-center text-sm text-muted-foreground">{text}</p>;
}

/** Revenue bars with bookings as a line; points follow the API's groupBy (day, week or month). */
export function RevenueTrendChart({ data, loading }: { data?: RevenuePoint[]; loading?: boolean }) {
  if (loading) return <ChartSkeleton />;
  if (!data?.length) return <EmptyChart />;
  return (
    <ResponsiveContainer width="100%" height={280}>
      <ComposedChart data={data} margin={{ top: 4, right: 8, left: -4, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="label" tick={{ fontSize: 12 }} minTickGap={16} />
        <YAxis yAxisId="rev" tick={{ fontSize: 12 }} tickFormatter={compactTaka} />
        <YAxis yAxisId="bk" orientation="right" allowDecimals={false} tick={{ fontSize: 12 }} />
        <Tooltip formatter={(v: number, name: string) => (name === "Revenue" ? slotPriceLabel(v) : v)} />
        <Legend />
        <Bar yAxisId="rev" dataKey="revenue" name="Revenue" fill="#6366f1" radius={[4, 4, 0, 0]} />
        <Line yAxisId="bk" type="monotone" dataKey="bookings" name="Bookings" stroke="#f59e0b" strokeWidth={2} dot={false} />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

export function RevenueByGroundChart({ data, loading }: { data?: GroundReport[]; loading?: boolean }) {
  if (loading) return <ChartSkeleton />;
  if (!data?.length) return <EmptyChart />;
  return (
    <ResponsiveContainer width="100%" height={Math.max(200, data.length * 48)}>
      <BarChart data={data} layout="vertical" margin={{ top: 4, right: 24, left: 8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
        <XAxis type="number" tick={{ fontSize: 12 }} tickFormatter={compactTaka} />
        <YAxis type="category" dataKey="groundName" tick={{ fontSize: 12 }} width={130} />
        <Tooltip formatter={(v: number) => slotPriceLabel(v)} />
        <Bar dataKey="revenue" name="Revenue" fill="#22c55e" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function BookingTrendsChart({ data, loading }: { data?: BookingPoint[]; loading?: boolean }) {
  if (loading) return <ChartSkeleton />;
  if (!data?.length) return <EmptyChart />;
  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
        <defs>
          {Object.entries(STATUS_COLORS).map(([k, color]) => (
            <linearGradient key={k} id={`grad-${k}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.25} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="label" tick={{ fontSize: 11 }} minTickGap={16} />
        <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
        <Tooltip />
        <Legend />
        {(Object.keys(STATUS_COLORS) as BookingStatus[]).map((k) => (
          <Area key={k} type="monotone" dataKey={k} name={STATUS_NAME[k]}
            stroke={STATUS_COLORS[k]} strokeWidth={2} fill={`url(#grad-${k})`} />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
}

/** Pie of `statusCounts` from the summary; empty statuses are left out. */
export function BookingStatusPieChart({ counts, loading }: { counts?: Record<BookingStatus, number>; loading?: boolean }) {
  if (loading) return <ChartSkeleton height={240} />;
  const data = (Object.keys(STATUS_COLORS) as BookingStatus[])
    .map((k) => ({ key: k, name: STATUS_NAME[k], value: counts?.[k] ?? 0 }))
    .filter((d) => d.value > 0);
  if (!data.length) return <EmptyChart text="No bookings in this period." />;
  return (
    <ResponsiveContainer width="100%" height={240}>
      <PieChart>
        <Pie data={data} cx="50%" cy="50%" outerRadius={90} dataKey="value"
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          labelLine={false}>
          {data.map((d) => <Cell key={d.key} fill={STATUS_COLORS[d.key]} />)}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
