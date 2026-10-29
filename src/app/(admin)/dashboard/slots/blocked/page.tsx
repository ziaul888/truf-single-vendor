"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { Unlock, Ban, AlertCircle, ChevronLeft } from "lucide-react";
import { toast } from "sonner";
import { useSlots, useUnblockSlot, useUnblockDay } from "@/hooks/useSlots";
import { useGrounds } from "@/hooks/useGrounds";
import { toApiFailure } from "@/lib/api-error";
import {
  BLOCK_REASON_LABEL, durationLabel, formatSlotDate, slotPriceLabel, slotTimeLabel, venueToday,
} from "@/lib/slot-format";
import { BLOCK_REASONS, type BlockReason } from "@/types/slot";
import { pageWindow } from "@/components/features/slots/slot-list-section";
import { ConfirmDialog } from "@/components/features/confirm-dialog";

const PAGE_SIZE = 8;

export default function BlockedSlotsPage() {
  const [groundId, setGroundId] = useState("all");
  const [reason,   setReason]   = useState<BlockReason | "all">("all");
  const [date,     setDate]     = useState("");
  const [page,     setPage]     = useState(1);

  const today = venueToday();
  const { data: grounds } = useGrounds();
  const filters = { groundId, date: date || undefined, status: "blocked" as const };
  const { data, isLoading } = useSlots({ ...filters, reason: reason === "all" ? undefined : reason, page, limit: PAGE_SIZE });
  // Reason counts for the stat cards (same ground and date, any reason).
  const maintenance = useSlots({ ...filters, reason: "maintenance", limit: 1 }).data?.total;
  const reserved    = useSlots({ ...filters, reason: "reserved", limit: 1 }).data?.total;

  const unblockMutation = useUnblockSlot();
  const unblockDay = useUnblockDay();
  const [confirmUnblockAll, setConfirmUnblockAll] = useState(false);

  const pageRows   = data?.data ?? [];
  const filteredTotal = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(filteredTotal / PAGE_SIZE));
  const blockedTotal = data?.stats.blocked ?? 0;

  const stats = {
    total:       blockedTotal,
    maintenance: maintenance ?? 0,
    reserved:    reserved ?? 0,
    other:       Math.max(0, blockedTotal - (maintenance ?? 0) - (reserved ?? 0)),
  };

  function unblock(id: string) {
    unblockMutation.mutate(id, {
      onSuccess: () => toast.success("Slot unblocked"),
      onError:   (err) => toast.error(toApiFailure(err).error),
    });
  }

  function unblockToday() {
    unblockDay.mutate(
      { groundId: groundId === "all" ? undefined : groundId, date: today },
      {
        onSuccess: (res) => toast.success(res.unblocked ? `Unblocked ${res.unblocked} slot${res.unblocked === 1 ? "" : "s"} today` : "No blocked slots left today"),
        onError:   (err) => toast.error(toApiFailure(err).error),
      }
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link href="/dashboard/slots" className="mb-1 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground w-fit">
            <ChevronLeft className="h-4 w-4" /> Back to slots
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">Blocked slots</h1>
          <p className="text-sm text-muted-foreground">All currently blocked time slots across grounds</p>
        </div>
        <Button variant="outline" size="sm" disabled={unblockDay.isPending} onClick={() => setConfirmUnblockAll(true)}>
          <Unlock className="mr-1.5 h-4 w-4" /> {unblockDay.isPending ? "Unblocking…" : "Unblock all today"}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Total blocked",  value: stats.total,       color: "text-zinc-600 dark:text-zinc-300" },
          { label: "Maintenance",    value: stats.maintenance, color: "text-blue-600 dark:text-blue-400" },
          { label: "Reserved",       value: stats.reserved,    color: "text-amber-500" },
          { label: "Other",          value: stats.other,       color: "text-purple-600 dark:text-purple-400" },
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
      <div className="flex flex-wrap gap-2">
        <Input
          type="date"
          aria-label="Filter by date"
          value={date}
          onChange={(e) => { setDate(e.target.value); setPage(1); }}
          className="h-9 w-52"
        />
        <Select value={groundId} onValueChange={(v) => { setGroundId(v); setPage(1); }}>
          <SelectTrigger className="h-9 w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All grounds</SelectItem>
            {grounds?.map((g) => <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={reason} onValueChange={(v) => { setReason(v as BlockReason | "all"); setPage(1); }}>
          <SelectTrigger className="h-9 w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All reasons</SelectItem>
            {BLOCK_REASONS.map((r) => <SelectItem key={r} value={r}>{BLOCK_REASON_LABEL[r]}</SelectItem>)}
          </SelectContent>
        </Select>
        {(date || groundId !== "all" || reason !== "all") && (
          <Button variant="ghost" size="sm" className="h-9 text-muted-foreground" onClick={() => { setDate(""); setGroundId("all"); setReason("all"); setPage(1); }}>
            Clear
          </Button>
        )}
      </div>

      {/* Table */}
      <Card className="overflow-hidden">
        {isLoading ? (
          <div className="space-y-px p-4">{[...Array(6)].map((_, i) => <div key={i} className="h-12 animate-pulse rounded-lg bg-muted" />)}</div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead>Slot time</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Ground</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Block reason</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pageRows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="py-16 text-center">
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <Ban className="h-8 w-8 opacity-30" />
                        <p className="text-sm">No blocked slots found.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  pageRows.map((slot) => (
                    <TableRow key={slot.id} className="opacity-80">
                      <TableCell className="font-medium whitespace-nowrap">
                        {slotTimeLabel(slot)}
                      </TableCell>
                      <TableCell className="text-sm">{durationLabel(slot.durationMinutes)}</TableCell>
                      <TableCell className="text-sm">{slot.groundName}</TableCell>
                      <TableCell className="text-sm">{formatSlotDate(slot.date)}</TableCell>
                      <TableCell>
                        <span
                          className="rounded-full bg-zinc-100 dark:bg-zinc-800 px-2.5 py-0.5 text-xs font-medium text-zinc-600 dark:text-zinc-300"
                          title={[slot.block?.note, slot.block?.blockedBy && `Blocked by ${slot.block.blockedBy.name}`].filter(Boolean).join(" · ") || undefined}
                        >
                          {slot.block ? BLOCK_REASON_LABEL[slot.block.reason] : "—"}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm font-medium whitespace-nowrap">{slotPriceLabel(slot.price)}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost" size="sm"
                          className="h-7 px-2 text-xs gap-1 text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20"
                          disabled={unblockMutation.isPending || slot.date < today}
                          title={slot.date < today ? "Past slots can't be unblocked" : undefined}
                          onClick={() => unblock(slot.id)}
                        >
                          <Unlock className="h-3 w-3" /> Unblock
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

            {pageRows.length > 0 && (
              <div className="flex flex-wrap items-center justify-between gap-3 border-t px-4 py-3">
                <p className="text-sm text-muted-foreground">
                  Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filteredTotal)} of {filteredTotal} blocked slots
                </p>
                <div className="flex items-center gap-1">
                  <Button variant="outline" size="sm" onClick={() => setPage((p) => p - 1)} disabled={page === 1}>Prev</Button>
                  {pageWindow(page, totalPages).map((p) => (
                    <Button key={p} variant={p === page ? "default" : "outline"} size="sm" className="h-8 w-8 p-0" onClick={() => setPage(p)}>{p}</Button>
                  ))}
                  <Button variant="outline" size="sm" onClick={() => setPage((p) => p + 1)} disabled={page === totalPages}>Next</Button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>

      {/* Info note */}
      <div className="flex items-start gap-2 rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 px-4 py-3 text-sm text-blue-700 dark:text-blue-400">
        <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
        <span>Unblocking a slot makes it immediately available for customer booking. Slots that have already started can&apos;t be unblocked.</span>
      </div>

      <ConfirmDialog
        open={confirmUnblockAll}
        title="Unblock all of today's slots?"
        description={`Every blocked slot today${groundId === "all" ? " on all grounds" : ` on ${grounds?.find((g) => g.id === groundId)?.name ?? "this ground"}`} becomes bookable straight away. Slots that have already started stay as they are.`}
        confirmLabel="Unblock all"
        destructive={false}
        onCancel={() => setConfirmUnblockAll(false)}
        onConfirm={() => { setConfirmUnblockAll(false); unblockToday(); }}
      />
    </div>
  );
}
