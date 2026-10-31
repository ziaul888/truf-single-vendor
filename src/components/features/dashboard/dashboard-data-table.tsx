"use client";

import {
  useReactTable, getCoreRowModel, flexRender,
  type ColumnDef,
} from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Banknote } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Link from "next/link";
import { formatSlotDate, slotPriceLabel, slotTimeLabel } from "@/lib/slot-format";
import type { Booking } from "@/types/booking";

function bookingStatusVariant(status: string): "default" | "secondary" | "destructive" | "outline" {
  if (status === "confirmed") return "default";
  if (status === "pending") return "secondary";
  if (status === "cancelled") return "destructive";
  return "outline"; // completed
}

function paymentStatusVariant(status: string): "default" | "secondary" | "destructive" | "outline" {
  if (status === "paid") return "default";
  if (status === "refunded") return "outline";
  if (status === "failed") return "destructive";
  return "secondary"; // unpaid, partial
}

export const bookingColumns: ColumnDef<Booking>[] = [
  {
    accessorKey: "bookingNumber",
    header: "Booking",
    cell: ({ row }) => (
      <Link href={`/dashboard/bookings/${row.original.id}`} className="font-mono text-xs font-medium text-primary hover:underline">
        #{row.original.bookingNumber}
      </Link>
    ),
  },
  { id: "customer", header: "Customer", cell: ({ row }) => row.original.contact?.name || row.original.customer.name },
  { id: "ground", header: "Ground", cell: ({ row }) => row.original.ground.name },
  { id: "date", header: "Date", cell: ({ row }) => formatSlotDate(row.original.slot.date) },
  { id: "time", header: "Time", cell: ({ row }) => <span className="whitespace-nowrap">{slotTimeLabel(row.original.slot)}</span> },
  { accessorKey: "total", header: "Total", cell: ({ getValue }) => slotPriceLabel(getValue<number>()) },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ getValue }) => {
      const v = getValue<string>();
      return <Badge variant={bookingStatusVariant(v)} className="capitalize">{v}</Badge>;
    },
  },
  {
    accessorKey: "paymentStatus",
    header: "Payment",
    cell: ({ getValue }) => {
      const v = getValue<string>();
      return <Badge variant={paymentStatusVariant(v)} className="capitalize">{v}</Badge>;
    },
  },
];

/** Upcoming bookings plus a "Collect" button for bookings with money due. */
export function upcomingColumns(onCollect: (b: Booking) => void): ColumnDef<Booking>[] {
  return [
    ...bookingColumns,
    {
      id: "actions",
      header: "",
      cell: ({ row }) => row.original.due > 0 && (
        <Button size="sm" variant="outline" className="h-7 gap-1 px-2 text-xs" onClick={() => onCollect(row.original)}>
          <Banknote className="h-3.5 w-3.5" /> Collect {slotPriceLabel(row.original.due)}
        </Button>
      ),
    },
  ];
}

export function DashboardDataTable<TData>({ columns, data }: { columns: ColumnDef<TData>[]; data: TData[] }) {
  const table = useReactTable({ data, columns, getCoreRowModel: getCoreRowModel() });

  return (
    <Table>
      <TableHeader>
        {table.getHeaderGroups().map((hg) => (
          <TableRow key={hg.id}>
            {hg.headers.map((header) => (
              <TableHead key={header.id}>
                {flexRender(header.column.columnDef.header, header.getContext())}
              </TableHead>
            ))}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {table.getRowModel().rows.map((row) => (
          <TableRow key={row.id}>
            {row.getVisibleCells().map((cell) => (
              <TableCell key={cell.id}>
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
