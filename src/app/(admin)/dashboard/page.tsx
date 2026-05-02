"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useDashboardStats, useUpcomingBookings, useActiveGrounds } from "@/hooks/useDashboard";
import { formatCurrency } from "@/lib/utils";
import { DollarSign, CalendarDays, Clock, MapPin, Users, CalendarPlus, Plus, UserPlus } from "lucide-react";
import Link from "next/link";
import { StatCard } from "@/components/features/dashboard/stat-card";
import { WeeklyRevenueChart, BookingsByStatusChart } from "@/components/features/dashboard/dashboard-charts";
import { DashboardDataTable, bookingColumns, groundColumns } from "@/components/features/dashboard/dashboard-data-table";

const quickActions = [
  { label: "New Booking",  icon: CalendarPlus, href: "/dashboard/bookings/new"    },
  { label: "Add Ground",   icon: Plus,         href: "/dashboard/grounds/new"     },
  { label: "Add Customer", icon: UserPlus,     href: "/dashboard/customers/new"   },
  { label: "All Bookings", icon: CalendarDays, href: "/dashboard/bookings"        },
];

export default function DashboardPage() {
  const stats    = useDashboardStats();
  const upcoming = useUpcomingBookings();
  const grounds  = useActiveGrounds();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Overview of today&apos;s activity</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {quickActions.map(({ label, icon: Icon, href }) => (
          <Button key={href} variant="outline" size="sm" asChild>
            <Link href={href} className="flex items-center gap-2"><Icon className="h-4 w-4" />{label}</Link>
          </Button>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Today's Revenue"  value={stats.data ? formatCurrency(stats.data.todayRevenue)  : "—"} icon={DollarSign}  trend={stats.data?.todayRevenueTrend}   loading={stats.isLoading} />
        <StatCard title="Today's Bookings" value={stats.data ? String(stats.data.todayBookings)         : "—"} icon={CalendarDays} trend={stats.data?.todayBookingsTrend}  loading={stats.isLoading} />
        <StatCard title="Total Customers"  value={stats.data ? String(stats.data.totalCustomers)        : "—"} icon={Users}        trend={stats.data?.totalCustomersTrend} loading={stats.isLoading} />
        <StatCard title="Active Grounds"   value={stats.data ? String(stats.data.activeGrounds)         : "—"} icon={MapPin}       trend={stats.data?.activeGroundsTrend}  loading={stats.isLoading} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <WeeklyRevenueChart />
        <BookingsByStatusChart />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />Upcoming Bookings (Next 24 Hours)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {upcoming.isLoading ? (
            <div className="space-y-2">{[...Array(3)].map((_, i) => <div key={i} className="h-10 animate-pulse rounded bg-muted" />)}</div>
          ) : upcoming.isError ? (
            <p className="text-sm text-destructive">Failed to load upcoming bookings.</p>
          ) : !upcoming.data?.length ? (
            <p className="text-sm text-muted-foreground">No upcoming bookings in the next 24 hours.</p>
          ) : (
            <DashboardDataTable columns={bookingColumns} data={upcoming.data} />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />Active Grounds
          </CardTitle>
        </CardHeader>
        <CardContent>
          {grounds.isLoading ? (
            <div className="space-y-2">{[...Array(4)].map((_, i) => <div key={i} className="h-10 animate-pulse rounded bg-muted" />)}</div>
          ) : grounds.isError ? (
            <p className="text-sm text-destructive">Failed to load grounds.</p>
          ) : !grounds.data?.length ? (
            <p className="text-sm text-muted-foreground">No active grounds found.</p>
          ) : (
            <DashboardDataTable columns={groundColumns} data={grounds.data} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
