"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ColumnDef } from "@tanstack/react-table";
import type { BookingRow } from "@/hooks/useBookings";
import { formatCurrency } from "@/lib/utils";
import { Phone, XCircle } from "lucide-react";
import { paymentStatusVariant } from "./booking-status-helpers";
import { StatusCell } from "./booking-status-cell";

export function getBookingColumns(
  setCancelTarget: (b: BookingRow) => void
): ColumnDef<BookingRow>[] {
  return [
    {
      accessorKey: "id",
      header: "Booking ID",
      cell: ({ getValue }) => <span className="font-mono text-xs">{getValue<string>()}</span>,
    },
    {
      id: "customer",
      header: "Customer",
      accessorFn: (row) => row.customerName,
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.customerName}</div>
          <a href={`tel:${row.original.customerPhone}`} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
            <Phone className="h-3 w-3" />{row.original.customerPhone}
          </a>
        </div>
      ),
    },
    {
      accessorKey: "groundName",
      header: "Ground",
      filterFn: "equals",
    },
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ getValue }) => new Date(getValue<string>()).toLocaleDateString(),
    },
    {
      id: "time",
      header: "Time",
      cell: ({ row }) => `${row.original.startTime} – ${row.original.endTime}`,
    },
    {
      accessorKey: "amount",
      header: "Amount",
      cell: ({ getValue }) => formatCurrency(getValue<number>()),
    },
    {
      accessorKey: "status",
      header: "Status",
      filterFn: "equals",
      cell: ({ row }) => <StatusCell booking={row.original} />,
    },
    {
      accessorKey: "paymentStatus",
      header: "Payment",
      filterFn: "equals",
      cell: ({ getValue }) => {
        const v = getValue<string>();
        return <Badge variant={paymentStatusVariant(v)}>{v}</Badge>;
      },
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
            {b.status !== "cancelled" && b.status !== "completed" && (
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
