"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

function Trend({ value, label }: { value: number | null; label: string }) {
  // null: nothing in the previous period to compare against.
  if (value === null)
    return (
      <span className="flex items-center gap-1 text-xs text-muted-foreground">
        <Sparkles className="h-3 w-3" /> New
      </span>
    );
  if (value === 0)
    return (
      <span className="flex items-center gap-1 text-xs text-muted-foreground">
        <Minus className="h-3 w-3" /> No change
      </span>
    );
  const up = value > 0;
  return (
    <span className={cn("flex flex-wrap items-center gap-1 text-xs font-medium", up ? "text-green-600" : "text-red-500")}>
      {up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
      {up ? "+" : ""}{value.toFixed(1)}% {label}
    </span>
  );
}

export function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  trendLabel = "vs yesterday",
  loading,
}: {
  title: string;
  value: string;
  icon: React.ElementType;
  /** % change; null shows "New" (nothing to compare against). */
  trend?: number | null;
  /** Shown after the %, e.g. "vs last week". */
  trendLabel?: string;
  loading?: boolean;
}) {
  return (
    <Card className="min-w-0">
      <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0 p-4 pb-2 sm:p-6 sm:pb-2">
        <CardTitle className="text-sm font-medium leading-tight text-muted-foreground">{title}</CardTitle>
        <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
      </CardHeader>
      <CardContent className="space-y-1 p-4 pt-0 sm:p-6 sm:pt-0">
        {loading ? (
          <>
            <div className="h-8 w-24 animate-pulse rounded bg-muted" />
            <div className="h-4 w-full max-w-32 animate-pulse rounded bg-muted" />
          </>
        ) : (
          <>
            <div className="truncate text-xl font-bold sm:text-2xl">{value}</div>
            {trend !== undefined && <Trend value={trend} label={trendLabel} />}
          </>
        )}
      </CardContent>
    </Card>
  );
}
