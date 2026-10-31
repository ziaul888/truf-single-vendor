"use client";

import Link from "next/link";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { slotPriceLabel } from "@/lib/slot-format";
import type { GroundReport } from "@/types/report";

interface GroundReportTableProps {
  data?: GroundReport[];
  loading?: boolean;
  /** "revenue": share of revenue; "utilization": hours booked vs open. */
  mode: "revenue" | "utilization";
}

const pct = (v: number | null) => (v === null ? "—" : `${v.toFixed(1)}%`);

/** One row per ground, highest revenue first (the API's order). Names link to the ground. */
export function GroundReportTable({ data, loading, mode }: GroundReportTableProps) {
  if (loading) return <div className="space-y-2">{[...Array(4)].map((_, i) => <div key={i} className="h-10 animate-pulse rounded bg-muted" />)}</div>;
  if (!data?.length) return <p className="text-sm text-muted-foreground">No grounds to show for this period.</p>;

  const totalRevenue = data.reduce((s, g) => s + g.revenue, 0);
  return (
    <div className="scrollbar-thin overflow-x-auto">
      <Table className="min-w-[560px]">
        <TableHeader>
          <TableRow>
            <TableHead>Ground</TableHead>
            <TableHead className="text-right">Bookings</TableHead>
            <TableHead className="text-right">Revenue</TableHead>
            {mode === "revenue" ? (
              <TableHead className="text-right">Share</TableHead>
            ) : (
              <>
                <TableHead className="text-right">Hours booked</TableHead>
                <TableHead className="text-right">Utilization</TableHead>
              </>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((g) => (
            <TableRow key={g.groundId}>
              <TableCell className="font-medium">
                <Link href={`/dashboard/grounds/${g.groundId}`} className="hover:underline">{g.groundName}</Link>
                {!g.isActive && <span className="ml-2 text-xs text-muted-foreground">Inactive</span>}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {g.bookings}
                {g.cancelled > 0 && <span className="block text-[11px] text-muted-foreground">{g.cancelled} cancelled</span>}
              </TableCell>
              <TableCell className="text-right font-medium tabular-nums">{slotPriceLabel(g.revenue)}</TableCell>
              {mode === "revenue" ? (
                <TableCell className="text-right tabular-nums text-muted-foreground">
                  {totalRevenue > 0 ? pct((g.revenue / totalRevenue) * 100) : "—"}
                </TableCell>
              ) : (
                <>
                  <TableCell className="text-right tabular-nums text-muted-foreground">{g.hoursBooked} / {g.hoursAvailable}</TableCell>
                  <TableCell className="text-right">
                    <div className="ml-auto flex w-32 items-center justify-end gap-2">
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                        <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(100, g.utilization ?? 0)}%` }} />
                      </div>
                      <span className="w-12 tabular-nums">{pct(g.utilization)}</span>
                    </div>
                  </TableCell>
                </>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
