"use client";

import { useState } from "react";
import Link from "next/link";
import { useReactTable, getCoreRowModel, getFilteredRowModel, flexRender, type ColumnFiltersState } from "@tanstack/react-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useBookings, type BookingRow } from "@/hooks/useBookings";
import { CalendarDays, Search, XCircle, CheckCircle, FilterX, Plus, LayoutGrid } from "lucide-react";
import { CancelDialog } from "@/components/features/bookings/cancel-dialog";
import { getBookingColumns } from "@/components/features/bookings/bookings-table-columns";

export default function BookingsPage() {
  const { data, isLoading, isError } = useBookings();
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [cancelTarget, setCancelTarget] = useState<BookingRow | null>(null);

  const columns = getBookingColumns(setCancelTarget);

  const table = useReactTable({
    data: data ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnFiltersChange: setColumnFilters,
    state: { columnFilters },
  });

  const confirmed = data?.filter((b) => b.status === "confirmed").length ?? 0;
  const pending   = data?.filter((b) => b.status === "pending").length ?? 0;
  const cancelled = data?.filter((b) => b.status === "cancelled").length ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Bookings</h1>
          <p className="text-sm text-muted-foreground sm:text-base">Manage all ground bookings</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" asChild size="sm" className="sm:size-default">
            <Link href="/dashboard/bookings/calendar">
              <LayoutGrid className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Calendar</span>
            </Link>
          </Button>
          <Button asChild size="sm" className="sm:size-default">
            <Link href="/dashboard/bookings/new">
              <Plus className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Add Booking</span>
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Confirmed", count: confirmed, icon: CheckCircle, color: "text-green-600" },
          { label: "Pending",   count: pending,   icon: CalendarDays, color: "text-yellow-600" },
          { label: "Cancelled", count: cancelled, icon: XCircle,     color: "text-red-500"   },
        ].map(({ label, count, icon: Icon, color }) => (
          <Card key={label}>
            <CardContent className="flex items-center gap-4 pt-6">
              <Icon className={`h-8 w-8 ${color}`} />
              <div>
                <div className="text-2xl font-bold">{count}</div>
                <div className="text-sm text-muted-foreground">{label}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="space-y-4">
          <CardTitle>All Bookings</CardTitle>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full lg:w-80">
              <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search customer…" className="pl-8"
                value={(table.getColumn("customer")?.getFilterValue() as string) ?? ""}
                onChange={(e) => table.getColumn("customer")?.setFilterValue(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:flex lg:flex-wrap lg:gap-1">
              <Select value={(table.getColumn("status")?.getFilterValue() as string) ?? "all"}
                onValueChange={(v) => table.getColumn("status")?.setFilterValue(v === "all" ? undefined : v)}>
                <SelectTrigger className="w-full lg:w-36"><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={(table.getColumn("paymentStatus")?.getFilterValue() as string) ?? "all"}
                onValueChange={(v) => table.getColumn("paymentStatus")?.setFilterValue(v === "all" ? undefined : v)}>
                <SelectTrigger className="w-full lg:w-36"><SelectValue placeholder="Payment" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Payments</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={(table.getColumn("groundName")?.getFilterValue() as string) ?? "all"}
                onValueChange={(v) => table.getColumn("groundName")?.setFilterValue(v === "all" ? undefined : v)}>
                <SelectTrigger className="w-full lg:w-40"><SelectValue placeholder="Ground" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Grounds</SelectItem>
                  {[...new Set(data?.map((b) => b.groundName) ?? [])].map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                </SelectContent>
              </Select>
              {columnFilters.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => table.resetColumnFilters()}
                  className="col-span-2 gap-1.5 text-muted-foreground sm:col-span-3 lg:col-span-1"
                >
                  <FilterX className="h-4 w-4" />Clear
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-2 sm:px-6">
          {isLoading ? (
            <div className="space-y-2">{[...Array(5)].map((_, i) => <div key={i} className="h-12 animate-pulse rounded bg-muted" />)}</div>
          ) : isError ? (
            <p className="text-sm text-destructive">Failed to load bookings.</p>
          ) : (
            <div className="overflow-x-auto -mx-2 px-2 sm:mx-0 sm:px-0">
              <Table className="min-w-[800px]">
                <TableHeader>
                  {table.getHeaderGroups().map((hg) => (
                    <TableRow key={hg.id}>
                      {hg.headers.map((header) => (
                        <TableHead key={header.id} className="whitespace-nowrap">{flexRender(header.column.columnDef.header, header.getContext())}</TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {table.getRowModel().rows.length === 0 ? (
                    <TableRow><TableCell colSpan={columns.length} className="text-center text-muted-foreground">No bookings found.</TableCell></TableRow>
                  ) : (
                    table.getRowModel().rows.map((row) => (
                      <TableRow key={row.id}>
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id} className="whitespace-nowrap">{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                        ))}
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <CancelDialog booking={cancelTarget} open={cancelTarget !== null} onOpenChange={(v) => { if (!v) setCancelTarget(null); }} />
    </div>
  );
}
