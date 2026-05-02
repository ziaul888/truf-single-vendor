"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { GroundCard } from "@/components/features/grounds/ground-card";
import { GroundTable } from "@/components/features/grounds/ground-table";
import { useGrounds, useToggleGroundStatus, type Ground } from "@/hooks/useGrounds";
import {
  MapPin, CheckCircle2, XCircle, CalendarDays, PlusCircle,
  Search, LayoutGrid, List, AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { ElementType } from "react";

const SPORT_TYPES = ["football", "cricket", "badminton", "tennis", "hockey", "basketball", "other"];

function StatCard({ icon: Icon, label, value, iconClass, bgClass }: {
  icon: ElementType; label: string; value: string | number;
  iconClass: string; bgClass: string;
}) {
  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardContent className="flex items-center gap-4 py-5">
        <div className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-xl", bgClass)}>
          <Icon className={cn("h-5 w-5", iconClass)} />
        </div>
        <div className="min-w-0">
          <div className="text-2xl font-bold tabular-nums leading-tight">{value}</div>
          <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</div>
        </div>
      </CardContent>
    </Card>
  );
}

const SKELETON_WIDTHS = ["w-32", "w-20", "w-48", "w-40"] as const;

export default function GroundsPage() {
  const { data: grounds, isLoading, isError } = useGrounds();
  const toggle = useToggleGroundStatus();

  const [search,      setSearch]      = useState("");
  const [typeFilter,  setTypeFilter]  = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [view,        setView]        = useState<"grid" | "table">("grid");

  const filtered = useMemo(() => {
    return (grounds ?? []).filter((g) => {
      const q = search.toLowerCase();
      const matchSearch = !search || g.name.toLowerCase().includes(q) || g.id.toLowerCase().includes(q);
      const matchType   = typeFilter === "all"    || g.type === typeFilter;
      const matchStatus = statusFilter === "all"  || (statusFilter === "active" ? g.isActive : !g.isActive);
      return matchSearch && matchType && matchStatus;
    });
  }, [grounds, search, typeFilter, statusFilter]);

  const total    = grounds?.length ?? 0;
  const active   = grounds?.filter((g) => g.isActive).length ?? 0;
  const inactive = total - active;
  const bookedToday = grounds?.reduce((s, g) => s + g.todayBookings, 0) ?? 0;

  const activeFilters =
    (search ? 1 : 0) + (typeFilter !== "all" ? 1 : 0) + (statusFilter !== "all" ? 1 : 0);
  const hasFilters = activeFilters > 0;
  const clearFilters = () => { setSearch(""); setTypeFilter("all"); setStatusFilter("all"); };

  function handleToggle(ground: Ground) {
    const next = !ground.isActive;
    toggle.mutate(
      { id: ground.id, isActive: next },
      {
        onSuccess: () => toast.success(`${ground.name} ${next ? "activated" : "deactivated"}`),
        onError:   () => toast.error("Failed to update ground status"),
      }
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Grounds</h1>
          <p className="text-muted-foreground">Manage all sport grounds and pricing</p>
        </div>
        <Button className="gap-2" asChild>
          <Link href="/dashboard/grounds/new">
            <PlusCircle className="h-4 w-4" />
            Add Ground
          </Link>
        </Button>
      </div>

      {/* Stats row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={MapPin}        label="Total Grounds"   value={isLoading ? "—" : total}        iconClass="text-primary"              bgClass="bg-primary/10" />
        <StatCard icon={CheckCircle2}  label="Active"          value={isLoading ? "—" : active}       iconClass="text-green-600 dark:text-green-400"  bgClass="bg-green-100 dark:bg-green-900/30" />
        <StatCard icon={XCircle}       label="Inactive"        value={isLoading ? "—" : inactive}     iconClass="text-destructive"          bgClass="bg-destructive/10" />
        <StatCard icon={CalendarDays}  label="Booked Today"    value={isLoading ? "—" : bookedToday}  iconClass="text-blue-600 dark:text-blue-400"    bgClass="bg-blue-100 dark:bg-blue-900/30" />
      </div>

      {/* Filters + view toggle */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-card p-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative w-full sm:w-64">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name or ID…"
              className="pl-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-36"><SelectValue placeholder="Sport type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sports</SelectItem>
              {SPORT_TYPES.map((t) => (
                <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>

          {hasFilters && (
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-muted-foreground hover:text-foreground"
              onClick={clearFilters}
            >
              Clear
              <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-muted px-1.5 text-[10px] font-semibold text-foreground">
                {activeFilters}
              </span>
            </Button>
          )}
        </div>

        {/* View toggle */}
        <div className="flex gap-0.5 rounded-lg border bg-muted/40 p-0.5">
          {(["grid", "table"] as const).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setView(v)}
              aria-pressed={view === v}
              aria-label={`${v} view`}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium capitalize transition-colors",
                view === v
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {v === "grid" ? <LayoutGrid className="h-3.5 w-3.5" /> : <List className="h-3.5 w-3.5" />}
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        view === "grid" ? (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="overflow-hidden p-0">
                <div className="h-44 animate-pulse bg-muted" />
                <CardContent className="space-y-3 p-4">
                  {SKELETON_WIDTHS.map((w, j) => (
                    <div key={j} className={cn("h-4 animate-pulse rounded bg-muted", w)} />
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-14 animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        )
      ) : isError ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-10 text-center">
          <AlertCircle className="mx-auto mb-3 h-10 w-10 text-destructive" />
          <p className="font-semibold text-destructive">Failed to load grounds</p>
          <p className="mt-1 text-sm text-muted-foreground">Please refresh the page or try again later.</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed bg-muted/20 p-12 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
            <MapPin className="h-7 w-7 text-muted-foreground/60" />
          </div>
          <p className="text-lg font-semibold">No grounds found</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {hasFilters ? "Try adjusting or clearing your filters." : "Get started by adding your first ground."}
          </p>
          <div className="mt-4">
            {hasFilters ? (
              <Button variant="outline" size="sm" onClick={clearFilters}>Clear filters</Button>
            ) : (
              <Button size="sm" className="gap-2" asChild>
                <Link href="/dashboard/grounds/new"><PlusCircle className="h-4 w-4" />Add Ground</Link>
              </Button>
            )}
          </div>
        </div>
      ) : view === "grid" ? (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((g) => (
            <GroundCard key={g.id} ground={g} onToggleStatus={handleToggle} isPending={toggle.isPending} />
          ))}
        </div>
      ) : (
        <GroundTable grounds={filtered} onToggleStatus={handleToggle} isPending={toggle.isPending} />
      )}

      {!isLoading && !isError && filtered.length > 0 && (
        <div className="flex justify-center">
          <span className="rounded-full border bg-muted/40 px-3 py-1 text-xs text-muted-foreground tabular-nums">
            Showing <span className="font-semibold text-foreground">{filtered.length}</span> of {total} grounds
          </span>
        </div>
      )}
    </div>
  );
}
