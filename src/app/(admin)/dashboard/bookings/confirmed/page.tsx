"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useBookings, type BookingRow } from "@/hooks/useBookings";
import { formatCurrency } from "@/lib/utils";
import { CalendarCheck, Search, AlertCircle, TrendingUp, List } from "lucide-react";
import { ConfirmDialog } from "@/components/features/bookings/confirm-dialog";
import { DeclineDialog } from "@/components/features/bookings/decline-dialog";
import { PendingBookingCard } from "@/components/features/bookings/pending-booking-card";
import { timeAgo } from "@/components/features/bookings/booking-status-helpers";

export default function ConfirmedPage() {
  const { data, isLoading, isError } = useBookings();
  const [search, setSearch] = useState("");
  const [groundFilter, setGroundFilter] = useState("all");
  const [confirmTarget, setConfirmTarget] = useState<BookingRow | null>(null);
  const [declineTarget, setDeclineTarget] = useState<BookingRow | null>(null);

  const pending = useMemo(() => (data ?? []).filter((b) => b.status === "pending"), [data]);

  const filtered = useMemo(() => {
    return pending.filter((b) => {
      const matchSearch = !search || b.customerName.toLowerCase().includes(search.toLowerCase()) || b.id.toLowerCase().includes(search.toLowerCase()) || b.customerPhone.includes(search);
      const matchGround = groundFilter === "all" || b.groundName === groundFilter;
      return matchSearch && matchGround;
    });
  }, [pending, search, groundFilter]);

  const totalValue = pending.reduce((s, b) => s + b.amount, 0);
  const oldestCreated = pending.length ? pending.reduce((min, b) => new Date(b.createdAt) < new Date(min.createdAt) ? b : min) : null;
  const groundNames = useMemo(() => [...new Set(pending.map((b) => b.groundName))], [pending]);

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
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
              <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <div className="text-2xl font-bold">{isLoading ? "—" : pending.length}</div>
              <div className="text-sm text-muted-foreground">Awaiting Review</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
              <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <div className="text-2xl font-bold">{isLoading ? "—" : formatCurrency(totalValue)}</div>
              <div className="text-sm text-muted-foreground">Total Value at Stake</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
              <CalendarCheck className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <div className="text-2xl font-bold">{isLoading || !oldestCreated ? "—" : timeAgo(oldestCreated.createdAt)}</div>
              <div className="text-sm text-muted-foreground">Oldest Request</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-72">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search customer, phone, ID…" className="pl-8" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={groundFilter} onValueChange={setGroundFilter}>
          <SelectTrigger className="w-44"><SelectValue placeholder="All Grounds" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Grounds</SelectItem>
            {groundNames.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}
          </SelectContent>
        </Select>
        {(search || groundFilter !== "all") && (
          <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={() => { setSearch(""); setGroundFilter("all"); }}>
            Clear filters
          </Button>
        )}
        {!isLoading && filtered.length !== pending.length && (
          <span className="text-sm text-muted-foreground ml-auto">Showing {filtered.length} of {pending.length}</span>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-36 animate-pulse rounded-xl bg-muted" />)}</div>
      ) : isError ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center">
          <AlertCircle className="mx-auto h-8 w-8 text-destructive mb-2" />
          <p className="text-sm text-destructive font-medium">Failed to load bookings.</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed p-12 text-center">
          <CalendarCheck className="mx-auto h-12 w-12 text-muted-foreground/40 mb-3" />
          <p className="font-semibold text-lg">{pending.length === 0 ? "All caught up!" : "No results found"}</p>
          <p className="text-sm text-muted-foreground mt-1">
            {pending.length === 0 ? "There are no pending bookings to review right now." : "Try adjusting your search or filter criteria."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((booking) => (
            <PendingBookingCard key={booking.id} booking={booking} onConfirm={setConfirmTarget} onDecline={setDeclineTarget} />
          ))}
        </div>
      )}

      <ConfirmDialog booking={confirmTarget} open={confirmTarget !== null} onOpenChange={(v) => { if (!v) setConfirmTarget(null); }} />
      <DeclineDialog booking={declineTarget} open={declineTarget !== null} onOpenChange={(v) => { if (!v) setDeclineTarget(null); }} />
    </div>
  );
}
