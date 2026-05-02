"use client";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Legend, AreaChart, Area, PieChart, Pie, Cell, ComposedChart, Line,
} from "recharts";
import { formatCurrency } from "@/lib/utils";
import type { MonthlyRevenue, GroundRevenue, BookingTrend } from "@/hooks/useReports";

const STATUS_COLORS: Record<string, string> = {
  confirmed: "#22c55e",
  pending:   "#f59e0b",
  cancelled: "#ef4444",
  completed: "#6366f1",
};

const PIE_COLORS = ["#6366f1", "#22c55e", "#f59e0b", "#ef4444"];

function ChartSkeleton({ height = 280 }: { height?: number }) {
  return <div className="animate-pulse rounded bg-muted" style={{ height }} />;
}

function EmptyChart() {
  return <p className="py-10 text-center text-sm text-muted-foreground">No data available for this period.</p>;
}

export function MonthlyRevenueChart({ data, loading }: { data?: MonthlyRevenue[]; loading?: boolean }) {
  if (loading) return <ChartSkeleton />;
  if (!data?.length) return <EmptyChart />;
  return (
    <ResponsiveContainer width="100%" height={280}>
      <ComposedChart data={data} margin={{ top: 4, right: 8, left: -10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" tick={{ fontSize: 12 }} />
        <YAxis yAxisId="rev" tick={{ fontSize: 12 }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
        <YAxis yAxisId="bk" orientation="right" tick={{ fontSize: 12 }} />
        <Tooltip formatter={(v: number, name: string) => name === "Revenue" ? formatCurrency(v) : v} />
        <Legend />
        <Bar yAxisId="rev" dataKey="revenue" name="Revenue" fill="#6366f1" radius={[4, 4, 0, 0]} />
        <Line yAxisId="bk" type="monotone" dataKey="bookings" name="Bookings" stroke="#f59e0b" strokeWidth={2} dot={false} />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

export function RevenueByGroundChart({ data, loading }: { data?: GroundRevenue[]; loading?: boolean }) {
  if (loading) return <ChartSkeleton />;
  if (!data?.length) return <EmptyChart />;
  return (
    <ResponsiveContainer width="100%" height={Math.max(200, data.length * 48)}>
      <BarChart data={data} layout="vertical" margin={{ top: 4, right: 24, left: 8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
        <XAxis type="number" tick={{ fontSize: 12 }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
        <YAxis type="category" dataKey="groundName" tick={{ fontSize: 12 }} width={130} />
        <Tooltip formatter={(v: number) => formatCurrency(v)} />
        <Bar dataKey="revenue" name="Revenue" fill="#22c55e" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function BookingTrendsChart({ data, loading }: { data?: BookingTrend[]; loading?: boolean }) {
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
        <XAxis dataKey="date" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip />
        <Legend />
        {Object.entries(STATUS_COLORS).map(([k, color]) => (
          <Area key={k} type="monotone" dataKey={k}
            name={k.charAt(0).toUpperCase() + k.slice(1)}
            stroke={color} strokeWidth={2} fill={`url(#grad-${k})`} />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function BookingStatusPieChart({ data, loading }: { data?: { name: string; value: number }[]; loading?: boolean }) {
  if (loading) return <ChartSkeleton height={240} />;
  if (!data?.length) return <EmptyChart />;
  return (
    <ResponsiveContainer width="100%" height={240}>
      <PieChart>
        <Pie data={data} cx="50%" cy="50%" outerRadius={90} dataKey="value"
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          labelLine={false}>
          {data.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
