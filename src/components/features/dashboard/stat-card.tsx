"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

function Trend({ value }: { value: number }) {
  if (value === 0)
    return (
      <span className="flex items-center gap-1 text-xs text-muted-foreground">
        <Minus className="h-3 w-3" /> No change
      </span>
    );
  const up = value > 0;
  return (
    <span className={cn("flex items-center gap-1 text-xs font-medium", up ? "text-green-600" : "text-red-500")}>
      {up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
      {up ? "+" : ""}{value.toFixed(1)}% vs yesterday
    </span>
  );
}

export function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  loading,
}: {
  title: string;
  value: string;
  icon: React.ElementType;
  trend?: number;
  loading?: boolean;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent className="space-y-1">
        {loading ? (
          <>
            <div className="h-8 w-24 animate-pulse rounded bg-muted" />
            <div className="h-4 w-32 animate-pulse rounded bg-muted" />
          </>
        ) : (
          <>
            <div className="text-2xl font-bold">{value}</div>
            {trend !== undefined && <Trend value={trend} />}
          </>
        )}
      </CardContent>
    </Card>
  );
}
