"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { cn, formatCurrency } from "@/lib/utils";
import { CheckCircle2, XCircle, TrendingUp, TrendingDown, Pencil, LayoutList, CalendarDays } from "lucide-react";
import type { Ground } from "@/hooks/useGrounds";
import { SPORT_EMOJI, SPORT_GRADIENT } from "./ground-card";

interface GroundTableProps {
  grounds: Ground[];
  onToggleStatus: (g: Ground) => void;
  isPending: boolean;
}

export function GroundTable({ grounds, onToggleStatus, isPending }: GroundTableProps) {
  return (
    <div className="rounded-xl border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/40">
            <TableHead className="w-[220px]">Ground</TableHead>
            <TableHead>Sport</TableHead>
            <TableHead>Capacity</TableHead>
            <TableHead>Hours</TableHead>
            <TableHead>
              <span className="flex items-center gap-1"><TrendingUp className="h-3.5 w-3.5 text-amber-500" />Peak</span>
            </TableHead>
            <TableHead>
              <span className="flex items-center gap-1"><TrendingDown className="h-3.5 w-3.5 text-blue-500" />Off-peak</span>
            </TableHead>
            <TableHead className="text-center">
              <span className="flex items-center justify-center gap-1"><CalendarDays className="h-3.5 w-3.5" />Today</span>
            </TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {grounds.map((g) => {
            const gradient = SPORT_GRADIENT[g.type] ?? SPORT_GRADIENT.other;
            return (
              <TableRow key={g.id} className={cn(!g.isActive && "opacity-60")}>
                {/* Ground */}
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br text-base", gradient)}>
                      {SPORT_EMOJI[g.type] ?? "🏟️"}
                    </div>
                    <div className="min-w-0">
                      <div className="font-medium truncate">{g.name}</div>
                      <div className="font-mono text-[11px] text-muted-foreground">{g.id} · {g.size}</div>
                    </div>
                  </div>
                </TableCell>

                {/* Sport */}
                <TableCell>
                  <span className="text-sm capitalize">{g.type}</span>
                </TableCell>

                {/* Capacity */}
                <TableCell>
                  <span className="text-sm">{g.capacity} players</span>
                </TableCell>

                {/* Hours */}
                <TableCell>
                  <span className="text-sm tabular-nums">{g.openingTime} – {g.closingTime}</span>
                </TableCell>

                {/* Peak pricing */}
                <TableCell>
                  <div className="text-sm font-semibold text-amber-700 dark:text-amber-400 tabular-nums">
                    {formatCurrency(g.peakPricing.pricePerHour)}
                  </div>
                  <div className="text-[11px] text-muted-foreground">{g.peakPricing.from}–{g.peakPricing.to}</div>
                </TableCell>

                {/* Off-peak pricing */}
                <TableCell>
                  <div className="text-sm font-semibold text-blue-700 dark:text-blue-400 tabular-nums">
                    {formatCurrency(g.offPeakPricing.pricePerHour)}
                  </div>
                  <div className="text-[11px] text-muted-foreground">{g.offPeakPricing.from}–{g.offPeakPricing.to}</div>
                </TableCell>

                {/* Today bookings */}
                <TableCell className="text-center">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                    {g.todayBookings}
                  </span>
                </TableCell>

                {/* Status */}
                <TableCell>
                  <Badge
                    variant={g.isActive ? "default" : "secondary"}
                    className={cn("gap-1 text-xs", g.isActive ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300 border-0" : "")}
                  >
                    {g.isActive ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                    {g.isActive ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>

                {/* Actions */}
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" asChild>
                      <Link href={`/dashboard/grounds/${g.id}`}><LayoutList className="mr-1 h-3.5 w-3.5" />Slots</Link>
                    </Button>
                    <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" asChild>
                      <Link href={`/dashboard/grounds/${g.id}/edit`}><Pencil className="mr-1 h-3.5 w-3.5" />Edit</Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={cn("h-7 px-2 text-xs", g.isActive ? "text-destructive hover:bg-destructive/10 hover:text-destructive" : "text-green-600 hover:bg-green-50 hover:text-green-700 dark:hover:bg-green-900/20")}
                      onClick={() => onToggleStatus(g)}
                      disabled={isPending}
                    >
                      {g.isActive ? "Deactivate" : "Activate"}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
