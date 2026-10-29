"use client";

import { useState } from "react";
import Link from "next/link";
import { useSlots, type Slot } from "@/hooks/useSlots";
import { useGrounds } from "@/hooks/useGrounds";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import {
  BLOCK_REASON_LABEL, durationLabel, formatSlotDate, slotPriceLabel, slotTimeLabel, venueToday,
} from "@/lib/slot-format";
import { SLOT_STATUSES, type SlotStatus } from "@/types/slot";
import { Checkbox } from "@/components/ui/checkbox";
import { SlotBulkBar } from "./slot-bulk-bar";
import { SlotHistorySheet } from "./slot-history-sheet";
import { SlotRowActions } from "./slot-row-actions";
import { BlockBookedSlotDialog } from "./block-booked-slot-dialog";

const STATUS_CLS: Record<SlotStatus, string> = {
  available: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  held:      "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  booked:    "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  blocked:   "bg-zinc-200 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300",
};

const PAGE_SIZE = 10;

/** "18:05" in the venue's timezone. */
const venueClock = (iso: string) =>
  new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Dhaka", hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date(iso));

/** Held and booked slots belong to a customer, so they can't be selected for bulk actions. */
const isSelectable = (s: Slot) => s.status === "available" || s.status === "blocked";

export function SlotListSection() {
  const [groundId, setGroundId] = useState("all");
  const [date,     setDate]     = useState(venueToday);
  const [status,   setStatus]   = useState<SlotStatus | "all">("all");
  const [page,     setPage]     = useState(1);
  // Ticked slot ids on this page; cleared whenever the filters or page change.
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [historyOf, setHistoryOf] = useState<Slot | null>(null);
  const [blockingBooked, setBlockingBooked] = useState<Slot | null>(null);

  const { data: grounds } = useGrounds();
  const { data, isLoading } = useSlots({
    groundId, date, status: status === "all" ? undefined : status, page, limit: PAGE_SIZE,
  });
  const stats      = data?.stats;
  const slotRows   = data?.data ?? [];
  const total      = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const groundName = groundId === "all" ? "All grounds" : grounds?.find((g) => g.id === groundId)?.name ?? "";

  // Only free and blocked slots can be acted on in bulk.
  const selectable = slotRows.filter(isSelectable);
  const selectedSlots = slotRows.filter((s) => selected.has(s.id));
  const allSelected = selectable.length > 0 && selectable.every((s) => selected.has(s.id));
  const clearSelection = () => setSelected(new Set());

  function toggleOne(id: string, on: boolean) {
    setSelected((cur) => {
      const next = new Set(cur);
      if (on) next.add(id); else next.delete(id);
      return next;
    });
  }

  return (
    <div className="space-y-4">
      {/* Stats — for the chosen ground and date, regardless of the status filter */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {[
          { label: "Total slots",  value: stats?.total     ?? "—", color: "text-foreground" },
          { label: "Available",    value: stats?.available ?? "—", color: "text-blue-600 dark:text-blue-400" },
          { label: "Held",         value: stats?.held      ?? "—", color: "text-amber-600 dark:text-amber-400" },
          { label: "Booked",       value: stats?.booked    ?? "—", color: "text-green-600 dark:text-green-400" },
          { label: "Blocked",      value: stats?.blocked   ?? "—", color: "text-zinc-500" },
        ].map(({ label, value, color }) => (
          <Card key={label}>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground mb-1">{label}</p>
              <p className={cn("text-2xl font-bold", color)}>{isLoading ? "—" : value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        <Select value={groundId} onValueChange={(v) => { setGroundId(v); setPage(1); clearSelection(); }}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All grounds</SelectItem>
            {grounds?.map((g) => <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>)}
          </SelectContent>
        </Select>

        <Input
          type="date"
          value={date}
          onChange={(e) => { if (e.target.value) { setDate(e.target.value); setPage(1); clearSelection(); } }}
        />

        <Select value={status} onValueChange={(v) => { setStatus(v as SlotStatus | "all"); setPage(1); clearSelection(); }}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {SLOT_STATUSES.map((s) => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {selectedSlots.length > 0 && <SlotBulkBar selected={selectedSlots} onDone={clearSelection} />}

      {/* Table */}
      <Card className="overflow-hidden">
        {isLoading ? (
          <div className="space-y-px p-4">{[...Array(7)].map((_, i) => <div key={i} className="h-12 animate-pulse rounded-lg bg-muted" />)}</div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="w-10">
                    <Checkbox
                      aria-label="Select all slots on this page"
                      checked={allSelected}
                      disabled={selectable.length === 0}
                      onCheckedChange={(v) => setSelected(v === true ? new Set(selectable.map((s) => s.id)) : new Set())}
                    />
                  </TableHead>
                  <TableHead>Slot time</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Ground</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Booking ID</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {slotRows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="py-12 text-center text-muted-foreground">
                      No slots found for this filter.
                    </TableCell>
                  </TableRow>
                ) : (
                  slotRows.map((slot) => (
                    <TableRow key={slot.id} className={slot.status === "blocked" ? "opacity-60" : ""} data-state={selected.has(slot.id) ? "selected" : undefined}>
                      <TableCell>
                        <Checkbox
                          aria-label={`Select ${slotTimeLabel(slot)}`}
                          checked={selected.has(slot.id)}
                          disabled={!isSelectable(slot)}
                          onCheckedChange={(v) => toggleOne(slot.id, v === true)}
                        />
                      </TableCell>
                      <TableCell className="font-medium whitespace-nowrap">{slotTimeLabel(slot)}</TableCell>
                      <TableCell className="text-sm">{durationLabel(slot.durationMinutes)}</TableCell>
                      <TableCell className="text-sm">{slot.groundName}</TableCell>
                      <TableCell className="text-sm"><SlotCustomer slot={slot} /></TableCell>
                      <TableCell className="font-mono text-xs">
                        {slot.booking ? (
                          <Link href={`/dashboard/bookings/${slot.booking.id}`} className="text-primary hover:underline">#{slot.booking.bookingNumber}</Link>
                        ) : <span className="text-muted-foreground">—</span>}
                      </TableCell>
                      <TableCell className="text-sm font-medium whitespace-nowrap">{slotPriceLabel(slot.price)}</TableCell>
                      <TableCell>
                        <span
                          className={cn("rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize", STATUS_CLS[slot.status])}
                          title={slot.block ? `${BLOCK_REASON_LABEL[slot.block.reason]}${slot.block.note ? `: ${slot.block.note}` : ""}` : undefined}
                        >
                          {slot.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <SlotRowActions slot={slot} onHistory={setHistoryOf} onBlockBooked={setBlockingBooked} />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

            {/* Pagination */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t px-4 py-3">
              <p className="text-sm text-muted-foreground">
                Showing {total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)} of {total} slots
                {" · "}<span className="font-medium">{groundName}</span>
                {" · "}{formatSlotDate(date)}
              </p>
              <div className="flex items-center gap-1">
                <Button variant="outline" size="sm" onClick={() => { setPage((p) => p - 1); clearSelection(); }} disabled={page === 1}>Prev</Button>
                {pageWindow(page, totalPages).map((p) => (
                  <Button key={p} variant={p === page ? "default" : "outline"} size="sm" className="h-8 w-8 p-0" onClick={() => { setPage(p); clearSelection(); }}>{p}</Button>
                ))}
                <Button variant="outline" size="sm" onClick={() => { setPage((p) => p + 1); clearSelection(); }} disabled={page === totalPages}>Next</Button>
              </div>
            </div>
          </>
        )}
      </Card>
      <SlotHistorySheet slot={historyOf} onClose={() => setHistoryOf(null)} />
      <BlockBookedSlotDialog slot={blockingBooked} onClose={() => setBlockingBooked(null)} />
    </div>
  );
}

/** The customer cell: who booked it, or "Customer paying…" while a slot is held in checkout. */
function SlotCustomer({ slot }: { slot: Slot }) {
  if (slot.status === "held") {
    return (
      <span className="text-amber-700 dark:text-amber-400">
        {slot.booking?.customerName && <span className="block text-foreground">{slot.booking.customerName}</span>}
        <span className="text-xs">Customer paying…{slot.heldUntil ? ` (until ${venueClock(slot.heldUntil)})` : ""}</span>
      </span>
    );
  }
  return slot.booking?.customerName ? <>{slot.booking.customerName}</> : <span className="text-muted-foreground">—</span>;
}

/** Up to 5 page numbers around the current page. */
export function pageWindow(page: number, totalPages: number) {
  const start = Math.max(1, Math.min(page - 2, totalPages - 4));
  return Array.from({ length: Math.min(5, totalPages) }, (_, i) => start + i);
}
