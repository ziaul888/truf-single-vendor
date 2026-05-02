"use client";

import {
  useReactTable, getCoreRowModel, flexRender,
  type ColumnDef,
} from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils";
import type { Booking, Ground } from "@/types";

function bookingStatusVariant(status: string): "default" | "secondary" | "destructive" | "outline" {
  if (status === "confirmed") return "default";
  if (status === "pending") return "secondary";
  if (status === "cancelled") return "destructive";
  return "outline";
}

function paymentStatusVariant(status: string): "default" | "secondary" | "destructive" | "outline" {
  if (status === "paid") return "default";
  if (status === "refunded") return "outline";
  if (status === "failed") return "destructive";
  return "secondary";
}

export const bookingColumns: ColumnDef<Booking>[] = [
  {
    accessorKey: "id",
    header: "Booking ID",
    cell: ({ getValue }) => <span className="font-mono text-xs">{getValue<string>()}</span>,
  },
  { accessorKey: "groundId", header: "Ground" },
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
    cell: ({ getValue }) => {
      const v = getValue<string>();
      return <Badge variant={bookingStatusVariant(v)}>{v}</Badge>;
    },
  },
  {
    accessorKey: "paymentStatus",
    header: "Payment",
    cell: ({ getValue }) => {
      const v = getValue<string>();
      return <Badge variant={paymentStatusVariant(v)}>{v}</Badge>;
    },
  },
];

export const groundColumns: ColumnDef<Ground>[] = [
  { accessorKey: "name", header: "Name", cell: ({ getValue }) => <span className="font-medium">{getValue<string>()}</span> },
  { accessorKey: "type", header: "Type", cell: ({ getValue }) => <span className="capitalize">{getValue<string>()}</span> },
  { accessorKey: "size", header: "Size" },
  { accessorKey: "capacity", header: "Capacity" },
  {
    accessorKey: "pricePerHour",
    header: "Price / Hour",
    cell: ({ getValue }) => formatCurrency(getValue<number>()),
  },
  {
    id: "hours",
    header: "Hours",
    cell: ({ row }) => `${row.original.openingTime} – ${row.original.closingTime}`,
  },
];

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
