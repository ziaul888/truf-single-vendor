"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn, formatCurrency } from "@/lib/utils";
import { CheckCircle2, XCircle, Pencil, LayoutList, TrendingUp, TrendingDown } from "lucide-react";
import { formatPeakRanges } from "@/lib/ground-format";
import type { Ground } from "@/hooks/useGrounds";
import { SPORT_EMOJI, SPORT_GRADIENT } from "./ground-card";

interface GroundTableProps {
  grounds: Ground[];
  onToggleStatus: (g: Ground) => void;
  isPending: boolean;
  /** Admins only — managers can view grounds but not change them. */
  canEdit: boolean;
}

// Today's bookings per ground are on the ground detail page (and summed on the list's stat card).
export function GroundTable({ grounds, onToggleStatus, isPending, canEdit }: GroundTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/40">
            <TableHead className="w-[220px]">Ground</TableHead>
            <TableHead>Sport</TableHead>
            <TableHead>Capacity</TableHead>
            <TableHead>Hours</TableHead>
            <TableHead>
              <span className="flex items-center gap-1">
                <TrendingUp className="h-3.5 w-3.5 text-amber-500" />
                Peak
              </span>
            </TableHead>
            <TableHead>
              <span className="flex items-center gap-1">
                <TrendingDown className="h-3.5 w-3.5 text-blue-500" />
                Off-peak
              </span>
            </TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {grounds.map((g) => {
            return (
              <TableRow key={g.id} className={cn(!g.isActive && "opacity-60")}>
                {/* Ground */}
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br text-base",
                        SPORT_GRADIENT[g.sport] ?? SPORT_GRADIENT.other
                      )}
                    >
                      {SPORT_EMOJI[g.sport] ?? SPORT_EMOJI.other}
                    </div>
                    <div className="min-w-0">
                      <div className="truncate font-medium">{g.name}</div>
                      {g.address && (
                        <div className="text-muted-foreground truncate text-[11px]">
                          {g.address}
                        </div>
                      )}
                    </div>
                  </div>
                </TableCell>

                {/* Sport */}
                <TableCell>
                  <span className="text-sm capitalize">{g.sport}</span>
                </TableCell>

                {/* Capacity */}
                <TableCell>
                  <span className="text-sm">
                    {g.capacity != null ? `${g.capacity} players` : "—"}
                  </span>
                </TableCell>

                {/* Hours */}
                <TableCell>
                  <span className="text-sm tabular-nums">
                    {g.openingTime} – {g.closingTime}
                  </span>
                </TableCell>

                {/* Peak pricing */}
                <TableCell>
                  {g.peakPricePerHour !== null ? (
                    <>
                      <div className="text-sm font-semibold text-amber-700 tabular-nums dark:text-amber-400">
                        {formatCurrency(g.peakPricePerHour)}
                      </div>
                      <div className="text-muted-foreground text-[11px]">
                        {formatPeakRanges(g.peakRanges)}
                      </div>
                    </>
                  ) : (
                    <span className="text-muted-foreground text-sm">—</span>
                  )}
                </TableCell>

                {/* Off-peak (the base hourly price) */}
                <TableCell>
                  <div className="text-sm font-semibold text-blue-700 tabular-nums dark:text-blue-400">
                    {formatCurrency(g.pricePerHour)}
                  </div>
                </TableCell>

                {/* Status */}
                <TableCell>
                  <Badge
                    variant={g.isActive ? "default" : "secondary"}
                    className={cn(
                      "gap-1 text-xs",
                      g.isActive
                        ? "border-0 bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
                        : ""
                    )}
                  >
                    {g.isActive ? (
                      <CheckCircle2 className="h-3 w-3" />
                    ) : (
                      <XCircle className="h-3 w-3" />
                    )}
                    {g.isActive ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>

                {/* Actions */}
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" asChild>
                      <Link href={`/dashboard/grounds/${g.id}`}>
                        <LayoutList className="mr-1 h-3.5 w-3.5" />
                        Slots
                      </Link>
                    </Button>
                    {canEdit && (
                      <>
                        <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" asChild>
                          <Link href={`/dashboard/grounds/${g.id}/edit`}>
                            <Pencil className="mr-1 h-3.5 w-3.5" />
                            Edit
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className={cn(
                            "h-7 px-2 text-xs",
                            g.isActive
                              ? "text-destructive hover:bg-destructive/10 hover:text-destructive"
                              : "text-green-600 hover:bg-green-50 hover:text-green-700 dark:hover:bg-green-900/20"
                          )}
                          onClick={() => onToggleStatus(g)}
                          disabled={isPending}
                        >
                          {g.isActive ? "Deactivate" : "Activate"}
                        </Button>
                      </>
                    )}
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
