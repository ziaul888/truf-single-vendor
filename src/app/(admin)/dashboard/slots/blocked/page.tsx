"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { Unlock, Ban, AlertCircle, ChevronLeft } from "lucide-react";
import { toast } from "sonner";
import type { Slot } from "@/hooks/useSlots";

const GROUNDS = [
  { id: "all",   name: "All grounds" },
  { id: "GR-01", name: "Green Arena" },
  { id: "GR-02", name: "Blue Pitch" },
  { id: "GR-03", name: "Red Court" },
  { id: "GR-04", name: "Gold Tennis" },
];

const REASONS = ["all", "Maintenance", "Reserved", "Event", "Weather", "Other"];

const PAGE_SIZE = 8;

function fmt12(t: string) {
  const [h, m] = t.split(":").map(Number);
  const s = h >= 12 ? "PM" : "AM";
  return `${h % 12 || 12}${m ? `:${String(m).padStart(2,"0")}` : ""} ${s}`;
}

export default function BlockedSlotsPage() {
  const [groundId, setGroundId] = useState("all");
  const [reason,   setReason]   = useState("all");
  const [search,   setSearch]   = useState("");
  const [page,     setPage]     = useState(1);

  const qc = useQueryClient();

  const { data, isLoading } = useQuery<{ slots: Slot[]; total: number; stats: { total: number; available: number; booked: number; blocked: number; partial: number } }>({
    queryKey: ["slots", { groundId, date: "all", status: "blocked" }],
    queryFn: async () => {
      const params = new URLSearchParams({ status: "blocked" });
      if (groundId !== "all") params.set("groundId", groundId);
      params.set("page", "1");
      // Fetch all blocked — override page size by fetching page 1 of large set
      const res  = await fetch(`/api/slots?${params}`);
      const json = await res.json();
      return json.data;
    },
  });

  const unblockMutation = useMutation({
    mutationFn: async (id: string) => {
      const res  = await fetch(`/api/slots/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: "available" }) });
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Failed");
      return json.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["slots"] });
      toast.success("Slot unblocked");
    },
    onError: () => toast.error("Failed to unblock slot"),
  });

  // Client-side secondary filter (reason + search)
  const allBlocked: Slot[] = data?.slots ?? [];
  const filtered = allBlocked.filter((s) => {
    const matchReason = reason === "all" || s.blockReason === reason;
    const matchSearch = !search || s.ground.toLowerCase().includes(search.toLowerCase()) || s.date.includes(search);
    return matchReason && matchSearch;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageRows   = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const stats = {
    total:      allBlocked.length,
    maintenance: allBlocked.filter((s) => s.blockReason === "Maintenance").length,
    reserved:   allBlocked.filter((s) => s.blockReason === "Reserved").length,
    other:      allBlocked.filter((s) => !["Maintenance","Reserved"].includes(s.blockReason ?? "")).length,
  };

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
        <Button variant="outline" size="sm" disabled={filtered.length === 0}>
          <Unlock className="mr-1.5 h-4 w-4" /> Unblock all today
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
          placeholder="Search ground or date…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="h-9 w-52"
        />
        <Select value={groundId} onValueChange={(v) => { setGroundId(v); setPage(1); }}>
          <SelectTrigger className="h-9 w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            {GROUNDS.map((g) => <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={reason} onValueChange={(v) => { setReason(v); setPage(1); }}>
          <SelectTrigger className="h-9 w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            {REASONS.map((r) => <SelectItem key={r} value={r}>{r === "all" ? "All reasons" : r}</SelectItem>)}
          </SelectContent>
        </Select>
        {(search || groundId !== "all" || reason !== "all") && (
          <Button variant="ghost" size="sm" className="h-9 text-muted-foreground" onClick={() => { setSearch(""); setGroundId("all"); setReason("all"); setPage(1); }}>
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
                        {fmt12(slot.startTime)}–{fmt12(slot.endTime)}
                      </TableCell>
                      <TableCell className="text-sm">{slot.duration}</TableCell>
                      <TableCell className="text-sm">{slot.ground}</TableCell>
                      <TableCell className="text-sm">
                        {new Date(slot.date).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}
                      </TableCell>
                      <TableCell>
                        <span className="rounded-full bg-zinc-100 dark:bg-zinc-800 px-2.5 py-0.5 text-xs font-medium text-zinc-600 dark:text-zinc-300">
                          {slot.blockReason ?? "—"}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm font-medium">৳&nbsp;{slot.price.toLocaleString("en-IN")}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost" size="sm"
                          className="h-7 px-2 text-xs gap-1 text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20"
                          disabled={unblockMutation.isPending}
                          onClick={() => unblockMutation.mutate(slot.id)}
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
                  Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} blocked slots
                </p>
                <div className="flex items-center gap-1">
                  <Button variant="outline" size="sm" onClick={() => setPage((p) => p - 1)} disabled={page === 1}>Prev</Button>
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((p) => (
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
        <span>Unblocking a slot makes it immediately available for customer booking. Blocked slots with past bookings were auto-cancelled when blocked.</span>
      </div>
    </div>
  );
}
