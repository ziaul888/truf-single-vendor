"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useDashboardStats, useUpcomingBookings } from "@/hooks/useDashboard";
import { slotPriceLabel } from "@/lib/slot-format";
import type { Booking } from "@/types/booking";
import { DollarSign, CalendarDays, Clock, MapPin, Users, CalendarPlus, Plus, UserPlus } from "lucide-react";
import { StatCard } from "@/components/features/dashboard/stat-card";
import { WeeklyRevenueChart, BookingsByStatusChart } from "@/components/features/dashboard/dashboard-charts";
import { DashboardDataTable, upcomingColumns } from "@/components/features/dashboard/dashboard-data-table";
import { AttentionCards } from "@/components/features/dashboard/attention-cards";
import { TodayGrounds } from "@/components/features/dashboard/today-grounds";
import { TodayMoney } from "@/components/features/dashboard/today-money";
import { RecentActivity } from "@/components/features/dashboard/recent-activity";
import { UpcomingList } from "@/components/features/dashboard/upcoming-list";
import { CollectPaymentDialog } from "@/components/features/bookings/collect-payment-dialog";

const quickActions = [
  { label: "New Booking",  icon: CalendarPlus, href: "/dashboard/bookings/new"     },
  { label: "Add Ground",   icon: Plus,         href: "/dashboard/grounds/new"      },
  { label: "Add Customer", icon: UserPlus,     href: "/dashboard/customers?add=1"  },
  { label: "All Bookings", icon: CalendarDays, href: "/dashboard/bookings"         },
];

const TREND_LABEL = "vs last week";

export default function DashboardPage() {
  const stats    = useDashboardStats();
  const upcoming = useUpcomingBookings(5);
  const [collecting, setCollecting] = useState<Booking | null>(null);
  const s = stats.data;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
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
      </div>

      <section aria-label="Needs attention">
        <AttentionCards />
      </section>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard title="Today's Revenue"  value={s ? slotPriceLabel(s.todayRevenue) : "—"} icon={DollarSign}   trend={s?.todayRevenueTrend}   trendLabel={TREND_LABEL} loading={stats.isLoading} />
        <StatCard title="Today's Bookings" value={s ? String(s.todayBookings) : "—"}        icon={CalendarDays} trend={s?.todayBookingsTrend}  trendLabel={TREND_LABEL} loading={stats.isLoading} />
        <StatCard title="Total Customers"  value={s ? String(s.totalCustomers) : "—"}       icon={Users}        trend={s?.totalCustomersTrend} trendLabel={TREND_LABEL} loading={stats.isLoading} />
        <StatCard title="Active Grounds"   value={s ? String(s.activeGrounds) : "—"}        icon={MapPin}       trend={s?.activeGroundsTrend}  trendLabel={TREND_LABEL} loading={stats.isLoading} />
      </div>

      <TodayGrounds />

      {/* min-w-0 on the items: a grid column otherwise grows to fit the bookings table and spills off phones */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card id="upcoming" className="min-w-0 scroll-mt-20 lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Clock className="h-5 w-5" />Upcoming Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            {upcoming.isLoading ? (
              <div className="space-y-2">{[...Array(3)].map((_, i) => <div key={i} className="h-10 animate-pulse rounded bg-muted" />)}</div>
            ) : upcoming.isError ? (
              <p className="text-sm text-destructive">Failed to load upcoming bookings.</p>
            ) : !upcoming.data?.length ? (
              <p className="text-sm text-muted-foreground">No upcoming bookings.</p>
            ) : (
              <>
                <div className="md:hidden"><UpcomingList bookings={upcoming.data} onCollect={setCollecting} /></div>
                <div className="scrollbar-thin hidden overflow-x-auto md:block">
                  <DashboardDataTable columns={upcomingColumns(setCollecting)} data={upcoming.data} />
                </div>
              </>
            )}
          </CardContent>
        </Card>
        <TodayMoney />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 [&>*]:min-w-0">
        <WeeklyRevenueChart />
        <BookingsByStatusChart />
      </div>

      <RecentActivity />

      {collecting && (
        <CollectPaymentDialog booking={collecting} open onOpenChange={(v) => { if (!v) setCollecting(null); }} />
      )}
    </div>
  );
}
