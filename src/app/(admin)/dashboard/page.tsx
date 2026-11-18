"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  CalendarDays,
  CalendarPlus,
  ChevronDown,
  Clock,
  MapPin,
  MapPinPlus,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useDashboardAudience } from "@/components/dashboard-audience";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useDashboardStats, useUpcomingBookings } from "@/hooks/useDashboard";
import { slotPriceLabel } from "@/lib/slot-format";
import type { Booking } from "@/types/booking";
import { StatCard } from "@/components/features/dashboard/stat-card";
import {
  WeeklyRevenueChart,
  BookingsByStatusChart,
} from "@/components/features/dashboard/dashboard-charts";
import { AttentionCards } from "@/components/features/dashboard/attention-cards";
import { NeedsOutcomeCard } from "@/components/features/dashboard/needs-outcome-card";
import { TodayGrounds } from "@/components/features/dashboard/today-grounds";
import { TodayMoney } from "@/components/features/dashboard/today-money";
import { RecentActivity } from "@/components/features/dashboard/recent-activity";
import { UpcomingList } from "@/components/features/dashboard/upcoming-list";
import { CollectPaymentDialog } from "@/components/features/bookings/collect-payment-dialog";

export default function DashboardPage() {
  const tenant = useDashboardAudience() === "owner";
  const stats = useDashboardStats();
  const upcoming = useUpcomingBookings(5);
  const [collecting, setCollecting] = useState<Booking | null>(null);
  const [showInsights, setShowInsights] = useState(false);
  const s = stats.data;

  return (
    <div className="mx-auto max-w-7xl space-y-5 sm:space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Dashboard</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {tenant ? "Manage your grounds and slot availability." : "Your bookings and priorities for today."}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:flex">
          <Button asChild className="min-h-11">
            <Link href={tenant ? "/dashboard/grounds/new" : "/dashboard/bookings/new"}>
              {tenant ? <MapPinPlus /> : <CalendarPlus />}
              {tenant ? "Add ground" : "New booking"}
            </Link>
          </Button>
          <Button variant="outline" asChild className="min-h-11">
            <Link href={tenant ? "/dashboard/slots" : "/dashboard/bookings/calendar"}>
              <CalendarDays />
              {tenant ? "Manage slots" : "Calendar"}
            </Link>
          </Button>
        </div>
      </div>

      {stats.isError && (
        <div
          role="alert"
          className="border-destructive/30 bg-destructive/5 flex flex-wrap items-center justify-between gap-2 rounded-lg border p-3 text-sm"
        >
          <p>Today&apos;s summary couldn&apos;t be loaded.</p>
          <Button
            variant="outline"
            size="sm"
            disabled={stats.isFetching}
            onClick={() => void stats.refetch()}
          >
            Try again
          </Button>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
        <div className="col-span-2 sm:col-span-1">
          <StatCard
            title="Total sales"
            value={s?.totalRevenue != null ? slotPriceLabel(s.totalRevenue) : "—"}
            icon={TrendingUp}
            note="All time · after refunds"
            loading={stats.isLoading}
          />
        </div>
        <StatCard
          title="Bookings today"
          value={s ? String(s.todayBookings) : "—"}
          icon={CalendarDays}
          trend={s?.todayBookingsTrend}
          trendLabel="vs last week"
          loading={stats.isLoading}
        />
        <StatCard
          title="Sales today"
          value={s ? slotPriceLabel(s.todayRevenue) : "—"}
          icon={Wallet}
          trend={s?.todayRevenueTrend}
          trendLabel="vs last week"
          loading={stats.isLoading}
        />
      </div>

      <section aria-label="Needs attention" className="space-y-3">
        <AttentionCards />
        <NeedsOutcomeCard />
      </section>

      <div className="grid items-start gap-4 xl:grid-cols-2 [&>*]:min-w-0">
        <Card id="upcoming" className="scroll-mt-6">
          <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2 space-y-0 p-4 sm:p-6">
            <div className="space-y-1.5">
              <CardTitle className="flex items-center gap-2 text-base">
                <Clock className="text-muted-foreground h-4 w-4" />
                Upcoming bookings
              </CardTitle>
              <CardDescription>Your next five bookings.</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/bookings">
                View all
                <ArrowRight />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
            {upcoming.isLoading ? (
              <div aria-label="Loading upcoming bookings" className="space-y-3">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="bg-muted h-20 animate-pulse rounded-lg" />
                ))}
              </div>
            ) : upcoming.isError ? (
              <div role="alert" className="space-y-3 text-sm">
                <p className="text-muted-foreground">Upcoming bookings couldn&apos;t be loaded.</p>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={upcoming.isFetching}
                  onClick={() => void upcoming.refetch()}
                >
                  Try again
                </Button>
              </div>
            ) : !upcoming.data?.length ? (
              <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed px-4 py-8 text-center">
                <CalendarDays className="text-muted-foreground mb-1 h-7 w-7" />
                <p className="text-sm font-medium">No upcoming bookings</p>
                <p className="text-muted-foreground text-sm">New bookings will appear here.</p>
                <Button variant="outline" size="sm" asChild className="mt-2">
                  <Link href="/dashboard/bookings/new">
                    <CalendarPlus />
                    Create booking
                  </Link>
                </Button>
              </div>
            ) : (
              <UpcomingList bookings={upcoming.data} onCollect={setCollecting} />
            )}
          </CardContent>
        </Card>
        <TodayGrounds />
      </div>

      <Collapsible
        open={showInsights}
        onOpenChange={setShowInsights}
        className="bg-card text-card-foreground rounded-lg border shadow-sm"
      >
        <CollapsibleTrigger className="group hover:bg-muted/50 focus-visible:ring-ring flex min-h-20 w-full items-center gap-3 rounded-lg p-4 text-left focus-visible:ring-2 focus-visible:outline-none sm:p-5">
          <span className="bg-muted flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
            <BarChart3 className="text-muted-foreground h-5 w-5" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-semibold">Insights &amp; activity</span>
            <span className="text-muted-foreground mt-0.5 block text-xs sm:text-sm">
              Payment breakdown, weekly trends, and recent changes.
            </span>
          </span>
          <ChevronDown className="text-muted-foreground h-5 w-5 shrink-0 transition-transform group-data-[state=open]:rotate-180" />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="space-y-4 border-t p-3 sm:p-5">
            <div className="grid grid-cols-2 gap-3">
              <StatCard
                title="Total customers"
                value={s ? String(s.totalCustomers) : "—"}
                icon={Users}
                loading={stats.isLoading}
              />
              <StatCard
                title="Active grounds"
                value={s ? String(s.activeGrounds) : "—"}
                icon={MapPin}
                loading={stats.isLoading}
              />
            </div>
            <div className="grid items-start gap-4 lg:grid-cols-2 [&>*]:min-w-0">
              <TodayMoney />
              <WeeklyRevenueChart />
              <BookingsByStatusChart />
              <RecentActivity />
            </div>
            <Button variant="outline" asChild className="w-full sm:w-auto">
              <Link href="/dashboard/reports">
                Open reports
                <ArrowRight />
              </Link>
            </Button>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {collecting && (
        <CollectPaymentDialog
          booking={collecting}
          open
          onOpenChange={(open) => {
            if (!open) setCollecting(null);
          }}
        />
      )}
    </div>
  );
}
