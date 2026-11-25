"use client";

import { useState } from "react";
import Link from "next/link";
import { useSlots, type Slot } from "@/hooks/useSlots";
import { hasGroundChoice, useGrounds } from "@/hooks/useGrounds";
import { FilterMenu } from "@/components/features/filter-menu";
import { Card, CardContent } from "@/components/ui/card";
import { PaginationControls } from "@/components/features/pagination-controls";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { durationLabel, formatSlotDate, slotPriceLabel, slotTimeLabel, venueToday } from "@/lib/slot-format";
import { SLOT_STATUSES, type SlotStatus } from "@/types/slot";
import { Checkbox } from "@/components/ui/checkbox";
import { SlotBulkBar } from "./slot-bulk-bar";
import { SlotHistorySheet } from "./slot-history-sheet";
import { SlotRowActions } from "./slot-row-actions";
import { BlockBookedSlotDialog } from "./block-booked-slot-dialog";
import { SettingsLoadError } from "@/components/features/settings/settings-load-state";
import { useDashboardAudience } from "@/components/dashboard-audience";
import { useMe } from "@/hooks/useMe";
import { SlotCardList, SlotCustomer, SlotStatusPill, isSelectable } from "./slot-card-list";

const PAGE_SIZE = 10;
const STATUSES = [...SLOT_STATUSES, "past"] as const;
type StatusFilter = SlotStatus | "past" | "all";

export function SlotListSection({ readOnly = false }: { readOnly?: boolean }) {
  const audience = useDashboardAudience();
  const { data: me, isPending: isUserPending } = useMe(audience);
  const today = venueToday(0, me && "tenant" in me ? me.tenant.timezone : undefined);
  const [groundId, setGroundId] = useState("all");
  const [chosenDate, setChosenDate] = useState<string>();
  const date = chosenDate ?? today;
  const [status,   setStatus]   = useState<StatusFilter>("all");
  const [page,     setPage]     = useState(1);
  // Ticked slot ids on this page; cleared whenever the filters or page change.
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [historyOf, setHistoryOf] = useState<Slot | null>(null);
  const [blockingBooked, setBlockingBooked] = useState<Slot | null>(null);

  const { data: grounds } = useGrounds();
  const enabled = audience === "staff" || !isUserPending;
  const { data, isPending, isPlaceholderData, isError, refetch } = useSlots(
    {
      groundId,
      date,
      status: status === "past" ? "available" : status === "all" ? undefined : status,
      schedule: status === "past" ? "started" : status === "available" ? "upcoming" : undefined,
      page,
      limit: PAGE_SIZE,
    },
    { enabled, live: date === today },
  );
  const loading = isPending || isPlaceholderData;
  const stats      = data?.stats;
  const slotRows   = data?.data ?? [];
  const total      = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const groundName = groundId === "all" ? "All grounds" : grounds?.find((g) => g.id === groundId)?.name ?? "";

  // Only free and blocked slots can be acted on in bulk.
  const selectable = readOnly || loading ? [] : slotRows.filter(isSelectable);
  const selectedSlots = selectable.filter((s) => selected.has(s.id));
  const allSelected = selectable.length > 0 && selectable.every((s) => selected.has(s.id));
  const clearSelection = () => setSelected(new Set());
  const toggleAll = (on: boolean) => setSelected(on ? new Set(selectable.map((s) => s.id)) : new Set());

  function toggleOne(id: string, on: boolean) {
    setSelected((cur) => {
      const next = new Set(cur);
      if (on) next.add(id); else next.delete(id);
      return next;
    });
  }

  // A slot change can remove the last result from this page while the list is open.
  if (data && !isPlaceholderData && page > totalPages) {
    setPage(totalPages);
    clearSelection();
  }

  return (
    <div className="space-y-4">
      {/* Stats — for the chosen ground and date, regardless of the status filter */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3 lg:grid-cols-6">
        {[
          { label: "Total slots",  value: stats?.total     ?? "—", color: "text-foreground" },
          { label: "Available",    value: stats?.available ?? "—", color: "text-blue-600 dark:text-blue-400" },
          { label: "Held",         value: stats?.held      ?? "—", color: "text-amber-600 dark:text-amber-400" },
          { label: "Booked",       value: stats?.booked    ?? "—", color: "text-green-600 dark:text-green-400" },
          { label: "Blocked",      value: stats?.blocked   ?? "—", color: "text-zinc-500" },
          { label: "Past",         value: stats?.past      ?? "—", color: "text-muted-foreground" },
        ].map(({ label, value, color }) => (
          <Card key={label}>
            <CardContent className="p-3 sm:p-4">
              <p className="text-xs text-muted-foreground mb-1">{label}</p>
              <p className={cn("text-xl font-bold sm:text-2xl", color)}>{loading ? "—" : value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 md:grid md:grid-cols-3">
        {/* Stays outside the menu on phones: it decides which day the list shows */}
        <Input
          type="date"
          aria-label="Slot date"
          value={date}
          onChange={(e) => { if (e.target.value) { setChosenDate(e.target.value); setPage(1); clearSelection(); } }}
          className="min-w-0 flex-1 md:order-2"
        />

        <FilterMenu activeCount={(groundId !== "all" ? 1 : 0) + (status !== "all" ? 1 : 0)}>
          {hasGroundChoice(grounds) && (
            <Select value={groundId} onValueChange={(v) => { setGroundId(v); setPage(1); clearSelection(); }}>
              <SelectTrigger aria-label="Filter by ground" className="md:order-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All grounds</SelectItem>
                {grounds?.map((g) => <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>)}
              </SelectContent>
            </Select>
          )}

          <Select value={status} onValueChange={(v) => { setStatus(v as StatusFilter); setPage(1); clearSelection(); }}>
            <SelectTrigger aria-label="Filter by status" className="md:order-3"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {STATUSES.map((s) => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </FilterMenu>
      </div>

      {selectedSlots.length > 0 && <SlotBulkBar selected={selectedSlots} onDone={clearSelection} />}

      {/* Table */}
      <Card className="overflow-hidden">
        {isError ? (
          <SettingsLoadError what="slots" onRetry={() => refetch()} />
        ) : loading ? (
          <div aria-hidden className="space-y-px p-4">{Array.from({ length: PAGE_SIZE }, (_, i) => <div key={i} className="h-12 animate-pulse rounded-lg bg-muted" />)}</div>
        ) : (
          <>
            <div className="md:hidden">
              {selectable.length > 0 && (
                <label className="flex cursor-pointer items-center gap-3 border-b bg-muted/30 px-4 py-2.5 text-sm text-muted-foreground">
                  <Checkbox checked={allSelected} onCheckedChange={(v) => toggleAll(v === true)} />
                  Select all on this page
                </label>
              )}
              <SlotCardList slots={slotRows} selected={selected} showGround={hasGroundChoice(grounds)} onToggle={toggleOne}
                onHistory={setHistoryOf} onBlockBooked={setBlockingBooked} readOnly={readOnly} />
            </div>
            <Table className="hidden md:table">
              <TableHeader>
                <TableRow className="bg-muted/30">
                  {!readOnly && <TableHead className="w-10">
                    <Checkbox
                      aria-label="Select all slots on this page"
                      checked={allSelected}
                      disabled={selectable.length === 0}
                      onCheckedChange={(v) => toggleAll(v === true)}
                    />
                  </TableHead>}
                  <TableHead>Slot time</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Ground</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Booking ID</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  {!readOnly && <TableHead className="text-right">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {slotRows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={readOnly ? 7 : 9} className="py-12 text-center text-muted-foreground">
                      No slots found for this filter.
                    </TableCell>
                  </TableRow>
                ) : (
                  slotRows.map((slot) => (
                    <TableRow key={slot.id} className={slot.status === "blocked" ? "opacity-60" : ""} data-state={selected.has(slot.id) ? "selected" : undefined}>
                      {!readOnly && <TableCell>
                        <Checkbox
                          aria-label={`Select ${slotTimeLabel(slot)}`}
                          checked={isSelectable(slot) && selected.has(slot.id)}
                          disabled={!isSelectable(slot)}
                          onCheckedChange={(v) => toggleOne(slot.id, v === true)}
                        />
                      </TableCell>}
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
                      <TableCell><SlotStatusPill slot={slot} /></TableCell>
                      {!readOnly && <TableCell className="text-right">
                        <SlotRowActions slot={slot} onHistory={setHistoryOf} onBlockBooked={setBlockingBooked} />
                      </TableCell>}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </>
        )}
        {!isError && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t px-4 py-3">
            <p role="status" className="text-sm text-muted-foreground">
              {loading ? "Loading slots…" : (
                <>
                  {total > 0 ? `Showing ${(page - 1) * PAGE_SIZE + 1}–${Math.min(page * PAGE_SIZE, total)} of ${total} slots` : "Showing 0 slots"}
                  {" · "}<span className="font-medium">{groundName}</span>
                  {" · "}{formatSlotDate(date)}
                </>
              )}
            </p>
            <PaginationControls page={page} totalPages={totalPages} disabled={loading} onChange={(next) => { setPage(next); clearSelection(); }} />
          </div>
        )}
      </Card>
      <SlotHistorySheet slot={historyOf} onClose={() => setHistoryOf(null)} />
      <BlockBookedSlotDialog slot={blockingBooked} onClose={() => setBlockingBooked(null)} />
    </div>
  );
}
