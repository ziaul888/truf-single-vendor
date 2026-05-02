"use client";

import { useState } from "react";
import { useSlots, useToggleSlotStatus, type Slot } from "@/hooks/useSlots";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { Ban, Eye, Unlock, AlertCircle } from "lucide-react";
import { toast } from "sonner";

const GROUNDS = [
  { id: "GR-01", name: "Green Arena — Football" },
  { id: "GR-02", name: "Blue Pitch — Cricket" },
  { id: "GR-03", name: "Red Court — Badminton" },
  { id: "GR-04", name: "Gold Tennis — Tennis" },
];

const STATUS_CLS: Record<string, string> = {
  available: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  booked:    "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  partial:   "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  blocked:   "bg-zinc-200 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300",
};

const PAGE_SIZE = 7;

function fmt12(time: string) {
  const [h, m] = time.split(":").map(Number);
  const s = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return m === 0 ? `${h12} ${s}` : `${h12}:${String(m).padStart(2,"0")} ${s}`;
}

function slotTime(slot: Slot) {
  return `${fmt12(slot.startTime)}–${fmt12(slot.endTime)}`;
}

export function SlotListSection() {
  const [groundId, setGroundId] = useState("GR-01");
  const [date,     setDate]     = useState("2026-04-21");
  const [status,   setStatus]   = useState("all");
  const [duration, setDuration] = useState("all");
  const [page,     setPage]     = useState(1);

  const { data, isLoading } = useSlots({ groundId, date, status, duration, page });
  const toggle = useToggleSlotStatus();

  const stats      = data?.stats;
  const slotRows   = data?.slots ?? [];
  const total      = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const groundName = GROUNDS.find((g) => g.id === groundId)?.name.split(" — ")[0] ?? "All";
  const displayDate = new Date(date).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });

  function handleToggle(slot: Slot) {
    const next = slot.status === "blocked" ? "available" : "blocked";
    toggle.mutate(
      { id: slot.id, status: next, blockReason: next === "blocked" ? "Admin" : undefined },
      {
        onSuccess: () => toast.success(next === "blocked" ? "Slot blocked" : "Slot unblocked"),
        onError:   () => toast.error("Action failed"),
      }
    );
  }

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {[
          { label: "Total slots today", value: stats?.total     ?? "—", color: "text-foreground" },
          { label: "Available",         value: stats?.available ?? "—", color: "text-blue-600 dark:text-blue-400" },
          { label: "Booked",            value: stats?.booked    ?? "—", color: "text-green-600 dark:text-green-400" },
          { label: "Blocked",           value: stats?.blocked   ?? "—", color: "text-zinc-500" },
          { label: "Partial",           value: stats?.partial   ?? "—", color: "text-amber-500" },
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
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <Select value={groundId} onValueChange={(v) => { setGroundId(v); setPage(1); }}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {GROUNDS.map((g) => <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>)}
          </SelectContent>
        </Select>

        <Input
          type="date"
          value={date}
          onChange={(e) => { setDate(e.target.value); setPage(1); }}
        />

        <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1); }}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="available">Available</SelectItem>
            <SelectItem value="booked">Booked</SelectItem>
            <SelectItem value="blocked">Blocked</SelectItem>
            <SelectItem value="partial">Partial</SelectItem>
          </SelectContent>
        </Select>

        <Select value={duration} onValueChange={(v) => { setDuration(v); setPage(1); }}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All durations</SelectItem>
            <SelectItem value="30 min">30 min</SelectItem>
            <SelectItem value="1 hour">1 hour</SelectItem>
            <SelectItem value="2 hours">2 hours</SelectItem>
            <SelectItem value="Custom">Custom</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card className="overflow-hidden">
        {isLoading ? (
          <div className="space-y-px p-4">{[...Array(7)].map((_, i) => <div key={i} className="h-12 animate-pulse rounded-lg bg-muted" />)}</div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
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
                    <TableCell colSpan={8} className="py-12 text-center text-muted-foreground">
                      No slots found for this filter.
                    </TableCell>
                  </TableRow>
                ) : (
                  slotRows.map((slot) => (
                    <TableRow key={slot.id} className={slot.status === "blocked" ? "opacity-60" : ""}>
                      <TableCell className="font-medium whitespace-nowrap">{slotTime(slot)}</TableCell>
                      <TableCell className="text-sm">{slot.duration}</TableCell>
                      <TableCell className="text-sm">{slot.ground}</TableCell>
                      <TableCell className="text-sm">{slot.customer ?? <span className="text-muted-foreground">—</span>}</TableCell>
                      <TableCell className="font-mono text-xs">{slot.bookingId ? `#${slot.bookingId}` : <span className="text-muted-foreground">—</span>}</TableCell>
                      <TableCell className="text-sm font-medium">৳&nbsp;{slot.price.toLocaleString("en-IN")}</TableCell>
                      <TableCell>
                        <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize", STATUS_CLS[slot.status])}>
                          {slot.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {(slot.status === "booked" || slot.status === "partial") && (
                            <Button variant="ghost" size="sm" className="h-7 px-2 text-xs gap-1">
                              <Eye className="h-3 w-3" /> View
                            </Button>
                          )}
                          {slot.status === "available" && (
                            <Button
                              variant="ghost" size="sm" className="h-7 px-2 text-xs gap-1 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                              disabled={toggle.isPending}
                              onClick={() => handleToggle(slot)}
                            >
                              <Ban className="h-3 w-3" /> Block
                            </Button>
                          )}
                          {slot.status === "blocked" && (
                            <Button
                              variant="ghost" size="sm" className="h-7 px-2 text-xs gap-1 text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20"
                              disabled={toggle.isPending}
                              onClick={() => handleToggle(slot)}
                            >
                              <Unlock className="h-3 w-3" /> Unblock
                            </Button>
                          )}
                        </div>
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
                {" · "}{displayDate}
              </p>
              <div className="flex items-center gap-1">
                <Button variant="outline" size="sm" onClick={() => setPage((p) => p - 1)} disabled={page === 1}>Prev</Button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((p) => (
                  <Button key={p} variant={p === page ? "default" : "outline"} size="sm" className="h-8 w-8 p-0" onClick={() => setPage(p)}>{p}</Button>
                ))}
                <Button variant="outline" size="sm" onClick={() => setPage((p) => p + 1)} disabled={page === totalPages}>Next</Button>
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
