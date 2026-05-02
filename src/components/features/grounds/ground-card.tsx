"use client";

import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { cn, formatCurrency } from "@/lib/utils";
import {
  Users, Clock, CalendarDays, Pencil, LayoutList,
  CheckCircle2, XCircle, TrendingUp, TrendingDown,
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
    <Card className={cn("overflow-hidden p-0 transition-shadow hover:shadow-md", !ground.isActive && "opacity-60")}>
      {/* Photo / gradient */}
      <div className="relative h-44 w-full">
        {coverPhoto ? (
          <Image src={coverPhoto} alt={ground.name} fill sizes="(max-width:640px) 100vw,(max-width:1024px) 50vw,33vw" className="object-cover" />
        ) : (
          <div className={cn("flex h-full w-full items-center justify-center bg-gradient-to-br text-5xl", gradient)}>
            {SPORT_EMOJI[ground.type] ?? "🏟️"}
          </div>
        )}
        <span className={cn("absolute left-3 top-3 rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize backdrop-blur-sm bg-background/80", SPORT_COLOR[ground.type])}>
          {SPORT_EMOJI[ground.type]} {ground.type}
        </span>
        <span className={cn("absolute right-3 top-3 flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold backdrop-blur-sm bg-background/85", ground.isActive ? "text-green-600" : "text-destructive")}>
          {ground.isActive ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
          {ground.isActive ? "Active" : "Inactive"}
        </span>
      </div>

      <CardContent className="space-y-3 p-4">
        {/* Name + ID */}
        <div>
          <h3 className="font-semibold leading-tight">{ground.name}</h3>
          <span className="font-mono text-[11px] text-muted-foreground">{ground.id} · {ground.size}</span>
        </div>

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

        {/* Pricing */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between rounded-lg bg-amber-50 dark:bg-amber-900/20 px-3 py-1.5">
            <div className="flex items-center gap-1.5">
              <TrendingUp className="h-3.5 w-3.5 text-amber-600" />
              <span className="text-xs font-medium text-amber-700 dark:text-amber-400">Peak</span>
              <span className="rounded-full bg-amber-200/70 dark:bg-amber-800/50 px-1.5 py-0.5 text-[10px] font-medium text-amber-700 dark:text-amber-300">
                {ground.peakPricing.from}–{ground.peakPricing.to}
              </span>
            </div>
            <span className="text-sm font-bold text-amber-700 dark:text-amber-400">{formatCurrency(ground.peakPricing.pricePerHour)}<span className="text-[10px] font-normal">/hr</span></span>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-blue-50 dark:bg-blue-900/20 px-3 py-1.5">
            <div className="flex items-center gap-1.5">
              <TrendingDown className="h-3.5 w-3.5 text-blue-600" />
              <span className="text-xs font-medium text-blue-700 dark:text-blue-400">Off-peak</span>
              <span className="rounded-full bg-blue-200/70 dark:bg-blue-800/50 px-1.5 py-0.5 text-[10px] font-medium text-blue-700 dark:text-blue-300">
                {ground.offPeakPricing.from}–{ground.offPeakPricing.to}
              </span>
            </div>
            <span className="text-sm font-bold text-blue-700 dark:text-blue-400">{formatCurrency(ground.offPeakPricing.pricePerHour)}<span className="text-[10px] font-normal">/hr</span></span>
          </div>
        </div>

        {/* Today's bookings */}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground border-t pt-2.5">
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
