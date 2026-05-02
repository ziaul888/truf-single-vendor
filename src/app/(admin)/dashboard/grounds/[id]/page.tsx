"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  SPORT_GRADIENT,
  SPORT_EMOJI,
} from "@/components/features/grounds/ground-card";
import type { Ground } from "@/hooks/useGrounds";
import { cn, formatCurrency } from "@/lib/utils";
import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  Clock,
  LayoutList,
  Pencil,
  TrendingDown,
  TrendingUp,
  Users,
  XCircle,
} from "lucide-react";

interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  status: "available" | "taken";
}

export default function GroundDetailPage() {
  const { id } = useParams<{ id: string }>();

  const ground = useQuery<Ground>({
    queryKey: ["grounds", id],
    queryFn: async () => {
      const res = await fetch(`/api/grounds/${id}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Not found");
      return json.data;
    },
  });

  const slots = useQuery<TimeSlot[]>({
    queryKey: ["grounds", id, "slots"],
    queryFn: async () => {
      const res = await fetch(`/api/grounds/${id}/slots`);
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Failed");
      return json.data;
    },
    enabled: !!id,
  });

  if (ground.isLoading) {
    return (
      <div className="space-y-5">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-muted" />
        <div className="h-64 animate-pulse rounded-xl bg-muted" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
        <div className="h-72 animate-pulse rounded-xl bg-muted" />
      </div>
    );
  }

  if (ground.isError || !ground.data) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-20">
        <AlertCircle className="h-10 w-10 text-destructive" />
        <p className="text-lg font-semibold">Ground not found</p>
        <Link href="/dashboard/grounds" className="text-sm text-primary underline">
          Back to grounds
        </Link>
      </div>
    );
  }

  const g = ground.data;
  const cover = g.photos?.[0];
  const gradient = SPORT_GRADIENT[g.type] ?? SPORT_GRADIENT.other;
  const emoji = SPORT_EMOJI[g.type] ?? "🏟️";

  const availableCount = slots.data?.filter((s) => s.status === "available").length ?? 0;
  const takenCount = slots.data?.filter((s) => s.status === "taken").length ?? 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <Link
            href="/dashboard/grounds"
            className="mb-2 flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ChevronLeft className="h-4 w-4" /> Back to grounds
          </Link>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight">{g.name}</h1>
            <span
              className={cn(
                "flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold",
                g.isActive
                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {g.isActive ? (
                <CheckCircle2 className="h-3 w-3" />
              ) : (
                <XCircle className="h-3 w-3" />
              )}
              {g.isActive ? "Active" : "Inactive"}
            </span>
          </div>
          <p className="mt-1 font-mono text-xs text-muted-foreground">
            {g.id} · {g.size}
          </p>
        </div>
        <Button asChild className="gap-2">
          <Link href={`/dashboard/grounds/${g.id}/edit`}>
            <Pencil className="h-4 w-4" /> Edit ground
          </Link>
        </Button>
      </div>

      {/* Hero / cover */}
      <div className="relative h-64 w-full overflow-hidden rounded-xl">
        {cover ? (
          <Image
            src={cover}
            alt={g.name}
            fill
            sizes="(max-width:1024px) 100vw, 1024px"
            className="object-cover"
            priority
          />
        ) : (
          <div
            className={cn(
              "flex h-full w-full items-center justify-center bg-gradient-to-br text-7xl",
              gradient
            )}
          >
            {emoji}
          </div>
        )}
        <span className="absolute left-4 top-4 rounded-full bg-background/85 px-3 py-1 text-xs font-semibold capitalize backdrop-blur-sm">
          {emoji} {g.type}
        </span>
      </div>

      {/* Quick stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<Users className="h-5 w-5 text-primary" />}
          bg="bg-primary/10"
          label="Capacity"
          value={`${g.capacity} players`}
        />
        <StatCard
          icon={<Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />}
          bg="bg-blue-100 dark:bg-blue-900/30"
          label="Hours"
          value={`${g.openingTime} – ${g.closingTime}`}
        />
        <StatCard
          icon={<CalendarDays className="h-5 w-5 text-green-600 dark:text-green-400" />}
          bg="bg-green-100 dark:bg-green-900/30"
          label="Today's bookings"
          value={g.todayBookings}
        />
        <StatCard
          icon={<LayoutList className="h-5 w-5 text-amber-600 dark:text-amber-400" />}
          bg="bg-amber-100 dark:bg-amber-900/30"
          label="Available now"
          value={slots.isLoading ? "—" : availableCount}
        />
      </div>

      {/* Pricing */}
      <Card>
        <CardContent className="space-y-3 p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Pricing
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex items-center justify-between rounded-lg bg-amber-50 px-4 py-3 dark:bg-amber-900/20">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-amber-600" />
                <span className="text-sm font-medium text-amber-700 dark:text-amber-400">
                  Peak
                </span>
                <span className="rounded-full bg-amber-200/70 px-2 py-0.5 text-[11px] font-medium text-amber-700 dark:bg-amber-800/50 dark:text-amber-300">
                  {g.peakPricing.from}–{g.peakPricing.to}
                </span>
              </div>
              <span className="text-lg font-bold text-amber-700 dark:text-amber-400">
                {formatCurrency(g.peakPricing.pricePerHour)}
                <span className="text-xs font-normal">/hr</span>
              </span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-blue-50 px-4 py-3 dark:bg-blue-900/20">
              <div className="flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-700 dark:text-blue-400">
                  Off-peak
                </span>
                <span className="rounded-full bg-blue-200/70 px-2 py-0.5 text-[11px] font-medium text-blue-700 dark:bg-blue-800/50 dark:text-blue-300">
                  {g.offPeakPricing.from}–{g.offPeakPricing.to}
                </span>
              </div>
              <span className="text-lg font-bold text-blue-700 dark:text-blue-400">
                {formatCurrency(g.offPeakPricing.pricePerHour)}
                <span className="text-xs font-normal">/hr</span>
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Amenities */}
      {g.amenities.length > 0 && (
        <Card>
          <CardContent className="space-y-3 p-5">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Amenities
            </h2>
            <div className="flex flex-wrap gap-1.5">
              {g.amenities.map((a) => (
                <Badge key={a} variant="secondary" className="px-2.5 py-1 text-xs font-normal">
                  {a}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Today's slots */}
      <Card>
        <CardContent className="space-y-4 p-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Today's slots
              </h2>
              {!slots.isLoading && slots.data && (
                <p className="mt-0.5 text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground">{availableCount}</span>{" "}
                  available · <span className="font-semibold text-foreground">{takenCount}</span>{" "}
                  taken
                </p>
              )}
            </div>
            <Button variant="outline" size="sm" asChild className="gap-1.5">
              <Link href={`/dashboard/slots?groundId=${g.id}`}>
                Manage all <ChevronLeft className="h-3.5 w-3.5 rotate-180" />
              </Link>
            </Button>
          </div>

          {slots.isLoading ? (
            <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-12 animate-pulse rounded-lg bg-muted" />
              ))}
            </div>
          ) : slots.isError ? (
            <p className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
              Failed to load slots.
            </p>
          ) : !slots.data || slots.data.length === 0 ? (
            <p className="rounded-lg border-2 border-dashed bg-muted/20 p-6 text-center text-sm text-muted-foreground">
              No slots configured for this ground yet.
            </p>
          ) : (
            <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-4">
              {slots.data.map((s) => (
                <div
                  key={s.id}
                  className={cn(
                    "flex items-center justify-between rounded-lg border px-3 py-2.5 text-sm transition-colors",
                    s.status === "available"
                      ? "border-green-200 bg-green-50 dark:border-green-900/40 dark:bg-green-900/10"
                      : "border-muted bg-muted/40 text-muted-foreground"
                  )}
                >
                  <span className="font-medium tabular-nums">
                    {s.startTime} – {s.endTime}
                  </span>
                  <span
                    className={cn(
                      "text-[11px] font-semibold uppercase tracking-wide",
                      s.status === "available"
                        ? "text-green-700 dark:text-green-400"
                        : "text-muted-foreground"
                    )}
                  >
                    {s.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({
  icon,
  bg,
  label,
  value,
}: {
  icon: React.ReactNode;
  bg: string;
  label: string;
  value: string | number;
}) {
  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardContent className="flex items-center gap-4 py-5">
        <div className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-xl", bg)}>
          {icon}
        </div>
        <div className="min-w-0">
          <div className="truncate text-lg font-bold tabular-nums leading-tight">{value}</div>
          <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {label}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
