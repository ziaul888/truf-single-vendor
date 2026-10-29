"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ColumnDef } from "@tanstack/react-table";
import type { Booking } from "@/types/booking";
import { formatSlotDate, slotPriceLabel, slotTimeLabel } from "@/lib/slot-format";
import { Phone, XCircle } from "lucide-react";
import { PAYMENT_STATUS_LABEL, isCancellable, paymentStatusVariant } from "./booking-status-helpers";
import { StatusCell } from "./booking-status-cell";
import { PayAtVenueBadge } from "./pay-at-venue-badge";

export function getBookingColumns(setCancelTarget: (b: Booking) => void): ColumnDef<Booking>[] {
  return [
    {
      id: "bookingNumber",
      header: "Booking #",
      cell: ({ row }) => (
        <Link href={`/dashboard/bookings/${row.original.id}`} className="font-mono text-xs hover:underline">
          {row.original.bookingNumber}
        </Link>
      ),
    },
    {
      id: "customer",
      header: "Customer",
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.contact.name}</div>
          <a href={`tel:${row.original.contact.phone}`} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
            <Phone className="h-3 w-3" />{row.original.contact.phone}
          </a>
        </div>
      ),
    },
    { id: "ground", header: "Ground", cell: ({ row }) => row.original.ground.name },
    { id: "date", header: "Date", cell: ({ row }) => formatSlotDate(row.original.slot.date) },
    { id: "time", header: "Time", cell: ({ row }) => slotTimeLabel(row.original.slot) },
    { id: "total", header: "Total", cell: ({ row }) => slotPriceLabel(row.original.total) },
    {
      id: "paidDue",
      header: "Paid / Due",
      cell: ({ row }) => (
        <div className="text-xs">
          <div className="text-green-600 dark:text-green-400">{slotPriceLabel(row.original.paid)}</div>
          {row.original.due > 0 && <div className="text-amber-600 dark:text-amber-400">{slotPriceLabel(row.original.due)} due</div>}
        </div>
      ),
    },
    {
      id: "status",
      header: "Status",
      cell: ({ row }) => <StatusCell booking={row.original} onCancel={setCancelTarget} />,
    },
    {
      id: "paymentStatus",
      header: "Payment",
      cell: ({ row }) => (
        <div className="flex flex-col items-start gap-1">
          <Badge variant={paymentStatusVariant(row.original.paymentStatus)}>{PAYMENT_STATUS_LABEL[row.original.paymentStatus]}</Badge>
          {row.original.payAtVenue && <PayAtVenueBadge />}
        </div>
      ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const b = row.original;
        return (
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" asChild>
              <Link href={`/dashboard/bookings/${b.id}`}>View</Link>
            </Button>
            {isCancellable(b) && (
              <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => setCancelTarget(b)}>
                <XCircle className="mr-1 h-3.5 w-3.5" />Cancel
              </Button>
            )}
          </div>
        );
      },
    },
  ];
}
