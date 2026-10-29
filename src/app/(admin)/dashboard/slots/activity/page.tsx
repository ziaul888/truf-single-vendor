"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { pageWindow } from "@/components/features/slots/slot-list-section";
import { useSlotEvents } from "@/hooks/useSlots";
import { useGrounds } from "@/hooks/useGrounds";
import { useMe } from "@/hooks/useMe";
import { useUsers } from "@/hooks/useUsers";
import { toApiFailure } from "@/lib/api-error";
import {
  BLOCK_REASON_LABEL, SLOT_EVENT_LABEL, formatEventTime, formatSlotDate, hourLabel,
} from "@/lib/slot-format";
import type { SlotEventAction } from "@/types/slot";

const PAGE_SIZE = 20;
const ACTIONS: SlotEventAction[] = ["block", "unblock", "close", "reopen"];

const ACTION_CLS: Record<SlotEventAction, string> = {
  block:   "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  close:   "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  unblock: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  reopen:  "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
};

// Every block, unblock and closure change across the venue, newest first.
export default function SlotActivityPage() {
  const [groundId, setGroundId] = useState("all");
  const [action,   setAction]   = useState<SlotEventAction | "all">("all");
  const [userId,   setUserId]   = useState("all");
  const [from,     setFrom]     = useState("");
  const [to,       setTo]       = useState("");
  const [page,     setPage]     = useState(1);

  const { data: grounds } = useGrounds();
  const { data: me } = useMe();
  // The staff list is admin-only, so managers don't get the "who" filter.
  const staff = useUsers({ page: 1, limit: 100, search: "" }, { enabled: me?.role === "admin" });

  // The API needs both dates or neither.
  const range = from && to ? { from, to } : {};
  const events = useSlotEvents({
    groundId, action: action === "all" ? undefined : action, userId: userId === "all" ? undefined : userId,
    ...range, page, limit: PAGE_SIZE,
  });

  const rows = events.data?.data ?? [];
  const total = events.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const reset = <T,>(set: (v: T) => void) => (v: T) => { set(v); setPage(1); };
  const filtered = groundId !== "all" || action !== "all" || userId !== "all" || from || to;

  return (
    <div className="space-y-5">
      <div>
        <Link href="/dashboard/slots" className="mb-1 flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ChevronLeft className="h-4 w-4" /> Back to slots
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">Slot activity</h1>
        <p className="text-sm text-muted-foreground">Who blocked, unblocked or closed slots, and when</p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Select value={groundId} onValueChange={reset(setGroundId)}>
          <SelectTrigger className="h-9 w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All grounds</SelectItem>
            {grounds?.map((g) => <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={action} onValueChange={reset((v: string) => setAction(v as SlotEventAction | "all"))}>
          <SelectTrigger className="h-9 w-48"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All actions</SelectItem>
            {ACTIONS.map((a) => <SelectItem key={a} value={a}>{SLOT_EVENT_LABEL[a]}</SelectItem>)}
          </SelectContent>
        </Select>
        {staff.data && (
          <Select value={userId} onValueChange={reset(setUserId)}>
            <SelectTrigger className="h-9 w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Anyone</SelectItem>
              {staff.data.data.map((u) => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}
            </SelectContent>
          </Select>
        )}
        <div className="flex items-center gap-1.5">
          <Input type="date" aria-label="Slot date from" value={from} onChange={(e) => reset(setFrom)(e.target.value)} className="h-9 w-40" />
          <span className="text-sm text-muted-foreground">to</span>
          <Input type="date" aria-label="Slot date to" min={from} value={to} onChange={(e) => reset(setTo)(e.target.value)} className="h-9 w-40" />
        </div>
        {filtered && (
          <Button variant="ghost" size="sm" className="h-9 text-muted-foreground" onClick={() => {
            setGroundId("all"); setAction("all"); setUserId("all"); setFrom(""); setTo(""); setPage(1);
          }}>
            Clear
          </Button>
        )}
      </div>
      {(from && !to) || (!from && to) ? <p className="-mt-3 text-xs text-muted-foreground">Pick both dates to filter by slot date.</p> : null}

      <Card className="overflow-hidden">
        {events.isLoading ? (
          <div className="space-y-px p-4">{[...Array(6)].map((_, i) => <div key={i} className="h-12 animate-pulse rounded-lg bg-muted" />)}</div>
        ) : events.isError ? (
          <p className="p-6 text-center text-sm text-destructive">{toApiFailure(events.error).error}</p>
        ) : rows.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-16 text-muted-foreground">
            <History className="h-8 w-8 opacity-30" />
            <p className="text-sm">No activity{filtered ? " for these filters" : " yet"}.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead>When</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Slot</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>By</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((e) => (
                <TableRow key={e.id}>
                  <TableCell className="whitespace-nowrap text-sm">{formatEventTime(e.createdAt)}</TableCell>
                  <TableCell>
                    <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-semibold", ACTION_CLS[e.action])}>{SLOT_EVENT_LABEL[e.action]}</span>
                  </TableCell>
                  <TableCell className="text-sm">
                    <span className="font-medium">{e.groundName}</span>
                    <span className="block text-xs text-muted-foreground">{formatSlotDate(e.date)} · {hourLabel(e.startHour)}</span>
                  </TableCell>
                  <TableCell className="text-sm">
                    {e.reason ? BLOCK_REASON_LABEL[e.reason] : <span className="text-muted-foreground">—</span>}
                    {e.note && <span className="block max-w-[240px] truncate text-xs text-muted-foreground" title={e.note}>{e.note}</span>}
                  </TableCell>
                  <TableCell className="text-sm">{e.user?.name ?? <span className="text-muted-foreground">Removed account</span>}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        {totalPages > 1 && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t px-4 py-3">
            <p className="text-sm text-muted-foreground">{total} events</p>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="sm" onClick={() => setPage((p) => p - 1)} disabled={page === 1}>Prev</Button>
              {pageWindow(page, totalPages).map((p) => (
                <Button key={p} variant={p === page ? "default" : "outline"} size="sm" className="h-8 w-8 p-0" onClick={() => setPage(p)}>{p}</Button>
              ))}
              <Button variant="outline" size="sm" onClick={() => setPage((p) => p + 1)} disabled={page === totalPages}>Next</Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
