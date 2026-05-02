"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadialBarChart, RadialBar, Legend,
} from "recharts";
import { formatCurrency } from "@/lib/utils";

const weeklyRevenue = [
  { day: "Mon", revenue: 1200 },
  { day: "Tue", revenue: 1900 },
  { day: "Wed", revenue: 1500 },
  { day: "Thu", revenue: 2200 },
  { day: "Fri", revenue: 2800 },
  { day: "Sat", revenue: 3500 },
  { day: "Sun", revenue: 3100 },
];

const bookingsByStatus = [
  { name: "Confirmed", value: 54, fill: "#22c55e" },
  { name: "Pending",   value: 23, fill: "#f59e0b" },
  { name: "Cancelled", value: 11, fill: "#ef4444" },
];

export function WeeklyRevenueChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-medium">Weekly Revenue</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={weeklyRevenue} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip formatter={(v: number) => formatCurrency(v)} />
            <Area type="monotone" dataKey="revenue" stroke="#22c55e" strokeWidth={2} fill="url(#revenueGradient)" />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function BookingsByStatusChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-medium">Bookings by Status</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={240}>
          <RadialBarChart cx="50%" cy="50%" innerRadius={30} outerRadius={110}
            data={bookingsByStatus} startAngle={90} endAngle={-270}>
            <RadialBar dataKey="value" cornerRadius={6} label={{ position: "insideStart", fill: "#fff", fontSize: 11 }} />
            <Legend iconSize={10} />
            <Tooltip />
          </RadialBarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
