"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { slotPriceLabel, slotTimeLabel } from "@/lib/slot-format";
import type { Booking } from "@/types/booking";
import { formatDate, PAY_CLS, BK_CLS } from "./customer-display";

export function CustomerBookingHistory({
  customerId,
  bookings,
}: {
  customerId: string;
  bookings: Booking[];
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Recent bookings</CardTitle>
          <Button variant="ghost" size="sm" className="h-7 text-xs" asChild>
            <Link href={`/dashboard/bookings?customer=${customerId}`}>View all</Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {bookings.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">No bookings yet.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="text-xs">Booking</TableHead>
                <TableHead className="text-xs">Date</TableHead>
                <TableHead className="text-xs">Ground</TableHead>
                <TableHead className="text-xs">Slot</TableHead>
                <TableHead className="text-xs">Total</TableHead>
                <TableHead className="text-xs">Payment</TableHead>
                <TableHead className="text-xs">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings.map((b) => (
                <TableRow key={b.id}>
                  <TableCell className="font-mono text-xs">
                    <Link href={`/dashboard/bookings/${b.id}`} className="text-primary hover:underline">{b.bookingNumber}</Link>
                  </TableCell>
                  <TableCell className="text-xs whitespace-nowrap">{formatDate(b.slot.date)}</TableCell>
                  <TableCell className="text-xs">{b.ground.name}</TableCell>
                  <TableCell className="text-xs whitespace-nowrap">{slotTimeLabel(b.slot)}</TableCell>
                  <TableCell className="text-xs font-medium whitespace-nowrap">{slotPriceLabel(b.total)}</TableCell>
                  <TableCell>
                    <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize", PAY_CLS[b.paymentStatus])}>
                      {b.paymentStatus}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize", BK_CLS[b.status])}>
                      {b.status}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
