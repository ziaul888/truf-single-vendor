"use client";

import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { cn, formatCurrency } from "@/lib/utils";
import {
  Users, Clock, CalendarDays, Pencil, LayoutList,
  CheckCircle2, XCircle, TrendingDown,
} from "lucide-react";
import type { Ground } from "@/hooks/useGrounds";

export const SPORT_GRADIENT: Record<string, string> = {
  football:   "from-green-800  to-green-600",
  cricket:    "from-sky-800    to-sky-600",
  badminton:  "from-purple-800 to-purple-600",
  tennis:     "from-yellow-700 to-yellow-500",
  hockey:     "from-orange-800 to-orange-600",
  basketball: "from-red-800    to-red-600",
  other:      "from-slate-700  to-slate-500",
};

export const SPORT_EMOJI: Record<string, string> = {
  football: "⚽", cricket: "🏏", badminton: "🏸",
  tennis: "🎾", hockey: "🏑", basketball: "🏀", other: "🏟️",
};

const SPORT_COLOR: Record<string, string> = {
  football:   "bg-green-100  text-green-700  dark:bg-green-900/40  dark:text-green-300",
  cricket:    "bg-sky-100    text-sky-700    dark:bg-sky-900/40    dark:text-sky-300",
  badminton:  "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
  tennis:     "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300",
  hockey:     "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
  basketball: "bg-red-100    text-red-700    dark:bg-red-900/40    dark:text-red-300",
  other:      "bg-muted      text-muted-foreground",
};

interface GroundCardProps {
  ground: Ground;
  onToggleStatus: (g: Ground) => void;
  isPending: boolean;
}

export function GroundCard({ ground, onToggleStatus, isPending }: GroundCardProps) {
  const coverPhoto = ground.photos?.[0];
  const gradient   = SPORT_GRADIENT[ground.type] ?? SPORT_GRADIENT.other;

  return (
    <Card
      className={cn(
        "group overflow-hidden p-0 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl",
        !ground.isActive && "opacity-60",
      )}
    >
      {/* Photo / gradient with overlay */}
      <div className="relative h-52 w-full overflow-hidden">
        {coverPhoto ? (
          <Image
            src={coverPhoto}
            alt={ground.name}
            fill
            sizes="(max-width:640px) 100vw,(max-width:1024px) 50vw,33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className={cn("flex h-full w-full items-center justify-center bg-linear-to-br text-6xl transition-transform duration-500 group-hover:scale-105", gradient)}>
            {SPORT_EMOJI[ground.type] ?? "🏟️"}
          </div>
        )}
        {/* Bottom gradient for legibility */}
        <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/30 to-transparent" />

        {/* Top badges */}
        <span className={cn("absolute left-3 top-3 rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize backdrop-blur-md bg-background/80 shadow-sm", SPORT_COLOR[ground.type])}>
          {SPORT_EMOJI[ground.type]} {ground.type}
        </span>
        <span
          className={cn(
            "absolute right-3 top-3 flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold backdrop-blur-md shadow-sm",
            ground.isActive
              ? "bg-green-500/90 text-white"
              : "bg-destructive/90 text-white",
          )}
        >
          {ground.isActive ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
          {ground.isActive ? "Active" : "Inactive"}
        </span>

        {/* Name + ID over image */}
        <div className="absolute inset-x-0 bottom-0 p-4 text-white">
          <h3 className="text-lg font-semibold leading-tight drop-shadow-sm">{ground.name}</h3>
          <span className="font-mono text-[11px] text-white/70">{ground.id} · {ground.size}</span>
        </div>
      </div>

      <CardContent className="space-y-3 p-4">
        {/* Capacity + hours */}
        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" />{ground.capacity} players</span>
          <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{ground.openingTime} – {ground.closingTime}</span>
        </div>

        {/* Amenities */}
        {ground.amenities.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {ground.amenities.map((a) => (
              <Badge key={a} variant="secondary" className="text-[11px] font-normal px-2 py-0">{a}</Badge>
            ))}
          </div>
        )}

        {/* Single bold price line */}
        <div className="flex items-baseline justify-between rounded-lg border bg-muted/30 px-3 py-2">
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-bold tracking-tight text-foreground">
              {formatCurrency(ground.peakPricing.pricePerHour)}
            </span>
            <span className="text-[11px] text-muted-foreground">/hr peak</span>
          </div>
          <div className="flex items-baseline gap-1 text-muted-foreground">
            <TrendingDown className="h-3 w-3" />
            <span className="text-sm font-medium">{formatCurrency(ground.offPeakPricing.pricePerHour)}</span>
            <span className="text-[10px]">/hr off-peak</span>
          </div>
        </div>

        {/* Today's bookings */}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <CalendarDays className="h-3.5 w-3.5" />
          <span><span className="font-semibold text-foreground">{ground.todayBookings}</span> booking{ground.todayBookings !== 1 ? "s" : ""} today</span>
        </div>
      </CardContent>

      <CardFooter className="flex gap-1.5 border-t px-4 py-3">
        <Button variant="outline" size="sm" className="flex-1 gap-1 text-xs" asChild>
          <Link href={`/dashboard/grounds/${ground.id}`}><LayoutList className="h-3.5 w-3.5" />View Slots</Link>
        </Button>
        <Button variant="outline" size="sm" className="flex-1 gap-1 text-xs" asChild>
          <Link href={`/dashboard/grounds/${ground.id}/edit`}><Pencil className="h-3.5 w-3.5" />Edit</Link>
        </Button>
        <Button
          variant={ground.isActive ? "destructive" : "default"}
          size="sm"
          className={cn("flex-1 text-xs", !ground.isActive && "bg-green-600 hover:bg-green-700 text-white")}
          onClick={() => onToggleStatus(ground)}
          disabled={isPending}
        >
          {ground.isActive ? "Deactivate" : "Activate"}
        </Button>
      </CardFooter>
    </Card>
  );
}
