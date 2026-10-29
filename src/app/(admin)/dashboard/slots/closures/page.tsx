"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { CalendarOff, ChevronLeft, Unlock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { ConfirmDialog } from "@/components/features/confirm-dialog";
import { ClosureFormSheet } from "@/components/features/slots/closure-form-sheet";
import { pageWindow } from "@/components/features/slots/slot-list-section";
import { useClosures, useLiftClosure } from "@/hooks/useSlots";
import { useGrounds } from "@/hooks/useGrounds";
import { useMe } from "@/hooks/useMe";
import { toApiFailure } from "@/lib/api-error";
import { BLOCK_REASON_LABEL, formatSlotDate, venueToday } from "@/lib/slot-format";
import type { Closure } from "@/types/slot";

const PAGE_SIZE = 10;

type ClosureStatus = "upcoming" | "active" | "ended" | "lifted";

const STATUS: Record<ClosureStatus, { label: string; cls: string }> = {
  upcoming: { label: "Upcoming", cls: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
  active:   { label: "Active",   cls: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
  ended:    { label: "Ended",    cls: "bg-muted text-muted-foreground" },
  lifted:   { label: "Lifted",   cls: "bg-zinc-200 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300" },
};

function statusOf(c: Closure, today: string): ClosureStatus {
  if (c.liftedAt) return "lifted";
  if (c.toDate < today) return "ended";
  return c.fromDate > today ? "upcoming" : "active";
}

export default function ClosuresPage() {
  const [page, setPage] = useState(1);
  const [creating, setCreating] = useState(false);
  const [lifting, setLifting] = useState<Closure | null>(null);

  const today = venueToday();
  const { data, isLoading } = useClosures(page, PAGE_SIZE);
  const { data: grounds } = useGrounds();
  const { data: me } = useMe();
  const lift = useLiftClosure();
  const isAdmin = me?.role === "admin";

  const rows = data?.data ?? [];
  const totalPages = Math.max(1, Math.ceil((data?.total ?? 0) / PAGE_SIZE));
  const groundNames = (ids: string[]) =>
    ids.length === 0 ? "All grounds" : ids.map((id) => grounds?.find((g) => g.id === id)?.name ?? "Removed ground").join(", ");
  const dateRange = (c: Closure) =>
    c.fromDate === c.toDate ? formatSlotDate(c.fromDate) : `${formatSlotDate(c.fromDate)} – ${formatSlotDate(c.toDate)}`;

  function confirmLift() {
    if (!lifting) return;
    lift.mutate(lifting.id, {
      onSuccess: (res) => toast.success(`Closure lifted; ${res.unblocked} slot${res.unblocked === 1 ? "" : "s"} reopened`),
      onError: (err) => toast.error(toApiFailure(err).error),
    });
    setLifting(null);
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link href="/dashboard/slots" className="mb-1 flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            <ChevronLeft className="h-4 w-4" /> Back to slots
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">Venue closures</h1>
          <p className="text-sm text-muted-foreground">Close every ground, or some, for holidays or outages</p>
        </div>
        {isAdmin && (
          <Button variant="destructive" onClick={() => setCreating(true)}>
            <CalendarOff className="mr-1.5 h-4 w-4" /> Close venue
          </Button>
        )}
      </div>

      <Card className="overflow-hidden">
        {isLoading ? (
          <div className="space-y-px p-4">{[...Array(4)].map((_, i) => <div key={i} className="h-12 animate-pulse rounded-lg bg-muted" />)}</div>
        ) : rows.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-16 text-center text-muted-foreground">
            <CalendarOff className="h-8 w-8 opacity-30" />
            <p className="text-sm">No closures yet.</p>
            {isAdmin && <p className="text-xs">Use “Close venue” for holidays like Eid.</p>}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead>Dates</TableHead>
                <TableHead>Grounds</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Customers see</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created by</TableHead>
                {isAdmin && <TableHead className="text-right">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((c) => {
                const status = statusOf(c, today);
                return (
                  <TableRow key={c.id} className={cn(status === "lifted" && "opacity-60")}>
                    <TableCell className="whitespace-nowrap font-medium">{dateRange(c)}</TableCell>
                    <TableCell className="max-w-[220px] truncate text-sm" title={groundNames(c.groundIds)}>{groundNames(c.groundIds)}</TableCell>
                    <TableCell className="text-sm" title={c.note ?? undefined}>
                      {BLOCK_REASON_LABEL[c.reason]}
                      {c.note && <span className="block max-w-[200px] truncate text-xs text-muted-foreground">{c.note}</span>}
                    </TableCell>
                    <TableCell className="text-sm">{c.publicLabel ?? <span className="text-muted-foreground">Closed</span>}</TableCell>
                    <TableCell>
                      <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-semibold", STATUS[status].cls)}>{STATUS[status].label}</span>
                      {c.liftedBy && <span className="mt-0.5 block text-[11px] text-muted-foreground">by {c.liftedBy.name}</span>}
                    </TableCell>
                    <TableCell className="text-sm">{c.createdBy?.name ?? "—"}</TableCell>
                    {isAdmin && (
                      <TableCell className="text-right">
                        {!c.liftedAt && status !== "ended" && (
                          <Button
                            variant="ghost" size="sm"
                            className="h-7 gap-1 px-2 text-xs text-green-600 hover:bg-green-50 hover:text-green-700 dark:hover:bg-green-900/20"
                            disabled={lift.isPending}
                            onClick={() => setLifting(c)}
                          >
                            <Unlock className="h-3 w-3" /> Lift
                          </Button>
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
        {totalPages > 1 && (
          <div className="flex items-center justify-end gap-1 border-t px-4 py-3">
            <Button variant="outline" size="sm" onClick={() => setPage((p) => p - 1)} disabled={page === 1}>Prev</Button>
            {pageWindow(page, totalPages).map((p) => (
              <Button key={p} variant={p === page ? "default" : "outline"} size="sm" className="h-8 w-8 p-0" onClick={() => setPage(p)}>{p}</Button>
            ))}
            <Button variant="outline" size="sm" onClick={() => setPage((p) => p + 1)} disabled={page === totalPages}>Next</Button>
          </div>
        )}
      </Card>

      {!isAdmin && me && <p className="text-xs text-muted-foreground">Only admins can create or lift closures.</p>}

      <ClosureFormSheet open={creating} onClose={() => setCreating(false)} />
      <ConfirmDialog
        open={!!lifting}
        title="Lift this closure?"
        description={lifting ? `${dateRange(lifting)} on ${groundNames(lifting.groundIds)} reopens for booking. Slots blocked separately stay blocked.` : ""}
        confirmLabel="Lift closure"
        destructive={false}
        onCancel={() => setLifting(null)}
        onConfirm={confirmLift}
      />
    </div>
  );
}
