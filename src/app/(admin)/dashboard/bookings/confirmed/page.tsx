"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useBookings } from "@/hooks/useBookings";
import { useGrounds } from "@/hooks/useGrounds";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { slotPriceLabel } from "@/lib/slot-format";
import type { Booking } from "@/types/booking";
import { CalendarCheck, Search, AlertCircle, TrendingUp, List } from "lucide-react";
import { ConfirmDialog } from "@/components/features/bookings/confirm-dialog";
import { CancelDialog } from "@/components/features/bookings/cancel-dialog";
import { PendingBookingCard } from "@/components/features/bookings/pending-booking-card";
import { BookingsPagination } from "@/components/features/bookings/bookings-pagination";
import { timeAgo } from "@/components/features/bookings/booking-status-helpers";

const PAGE_SIZE = 20;
/** The stat cards read up to this many pending bookings (the API's page maximum). */
const STATS_LIMIT = 100;

function StatCard({ icon: Icon, tone, value, label }: {
  icon: typeof AlertCircle; tone: string; value: string; label: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 pt-6">
        <div className={`flex h-10 w-10 items-center justify-center rounded-full ${tone}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <div className="text-2xl font-bold">{value}</div>
          <div className="text-sm text-muted-foreground">{label}</div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function ConfirmedPage() {
  const [search, setSearch] = useState("");
  const [groundId, setGroundId] = useState("all");
  const [page, setPage] = useState(1);
  const [confirmTarget, setConfirmTarget] = useState<Booking | null>(null);
  const [declineTarget, setDeclineTarget] = useState<Booking | null>(null);
  const debouncedSearch = useDebouncedValue(search.trim(), 300);
  const { data: grounds } = useGrounds();

  const { data, isLoading, isError } = useBookings({
    status: "pending",
    search: debouncedSearch || undefined,
    groundId: groundId === "all" ? undefined : groundId,
    page,
    limit: PAGE_SIZE,
  });
  // Unfiltered pending bookings for the stat cards.
  const { data: all, isLoading: statsLoading } = useBookings({ status: "pending", limit: STATS_LIMIT });

  const pendingRows = all?.data ?? [];
  const awaiting = all?.total ?? 0;
  const dueAtStake = pendingRows.reduce((s, b) => s + b.due, 0);
  const oldest = pendingRows.reduce<Booking | null>((min, b) => (!min || b.createdAt < min.createdAt ? b : min), null);
  const rows = data?.data ?? [];
  const isFiltered = debouncedSearch !== "" || groundId !== "all";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Confirm Bookings</h1>
          <p className="text-muted-foreground">Review and approve pending booking requests</p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/dashboard/bookings"><List className="mr-1.5 h-4 w-4" />All Bookings</Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={AlertCircle} tone="bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
          value={statsLoading ? "—" : String(awaiting)} label="Awaiting Review" />
        <StatCard icon={TrendingUp} tone="bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
          value={statsLoading ? "—" : slotPriceLabel(dueAtStake)}
          label={awaiting > STATS_LIMIT ? `Amount Due (first ${STATS_LIMIT} requests)` : "Amount Due Across Requests"} />
        <StatCard icon={CalendarCheck} tone="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
          value={statsLoading || !oldest ? "—" : timeAgo(oldest.createdAt)} label="Oldest Request" />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-72">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search booking #, name or phone…" className="pl-8" value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <Select value={groundId} onValueChange={(v) => { setGroundId(v); setPage(1); }}>
          <SelectTrigger className="w-44"><SelectValue placeholder="All Grounds" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Grounds</SelectItem>
            {grounds?.map((g) => <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>)}
          </SelectContent>
        </Select>
        {(search || groundId !== "all") && (
          <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={() => { setSearch(""); setGroundId("all"); setPage(1); }}>
            Clear filters
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-36 animate-pulse rounded-xl bg-muted" />)}</div>
      ) : isError ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center">
          <AlertCircle className="mx-auto mb-2 h-8 w-8 text-destructive" />
          <p className="text-sm font-medium text-destructive">Failed to load bookings.</p>
        </div>
      ) : rows.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed p-12 text-center">
          <CalendarCheck className="mx-auto mb-3 h-12 w-12 text-muted-foreground/40" />
          <p className="text-lg font-semibold">{isFiltered ? "No results found" : "All caught up!"}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {isFiltered ? "Try adjusting your search or filter criteria." : "There are no pending bookings to review right now."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {rows.map((booking) => (
            <PendingBookingCard key={booking.id} booking={booking} onConfirm={setConfirmTarget} onDecline={setDeclineTarget} />
          ))}
          <BookingsPagination page={page} limit={PAGE_SIZE} total={data?.total ?? 0} onPageChange={setPage} noun="requests" />
        </div>
      )}

      <ConfirmDialog booking={confirmTarget} open={confirmTarget !== null} onOpenChange={(v) => { if (!v) setConfirmTarget(null); }} />
      <CancelDialog mode="decline" booking={declineTarget} open={declineTarget !== null} onOpenChange={(v) => { if (!v) setDeclineTarget(null); }} />
    </div>
  );
}
