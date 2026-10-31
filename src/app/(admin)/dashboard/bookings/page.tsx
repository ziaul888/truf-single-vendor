"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useReactTable, getCoreRowModel, flexRender } from "@tanstack/react-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DUE_FILTERS, useBookings, type DueFilter } from "@/hooks/useBookings";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import type { Booking } from "@/types/booking";
import { CalendarDays, XCircle, CheckCircle, Plus, LayoutGrid, Flag } from "lucide-react";
import { CancelDialog } from "@/components/features/bookings/cancel-dialog";
import { getBookingColumns } from "@/components/features/bookings/bookings-table-columns";
import { BookingsPagination } from "@/components/features/bookings/bookings-pagination";
import {
  BookingsFilters, EMPTY_BOOKING_FILTERS, type BookingListFilters,
} from "@/components/features/bookings/bookings-filters";

const PAGE_SIZE = 20;

// useSearchParams needs a Suspense boundary on a client page.
export default function BookingsPage() {
  return <Suspense><BookingsView /></Suspense>;
}

/** ?due=overdue|today|any from the dashboard's attention cards. */
const dueFromUrl = (v: string | null): DueFilter | "all" =>
  DUE_FILTERS.includes(v as DueFilter) ? (v as DueFilter) : "all";

function BookingsView() {
  const initialDue = dueFromUrl(useSearchParams().get("due"));
  const [filters, setFilters] = useState<BookingListFilters>({ ...EMPTY_BOOKING_FILTERS, due: initialDue });
  const [page, setPage] = useState(1);
  const [cancelTarget, setCancelTarget] = useState<Booking | null>(null);
  const search = useDebouncedValue(filters.search.trim(), 300);

  const { data, isLoading, isError } = useBookings({
    search: search || undefined,
    status: filters.status === "all" ? undefined : filters.status,
    paymentStatus: filters.paymentStatus === "all" ? undefined : filters.paymentStatus,
    groundId: filters.groundId === "all" ? undefined : filters.groundId,
    due: filters.due === "all" ? undefined : filters.due,
    page,
    limit: PAGE_SIZE,
  });

  const columns = getBookingColumns(setCancelTarget);
  const table = useReactTable({ data: data?.data ?? [], columns, getCoreRowModel: getCoreRowModel() });
  const counts = data?.counts;

  function changeFilters(next: BookingListFilters) {
    setFilters(next);
    setPage(1);
  }

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

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Confirmed", count: counts?.confirmed, icon: CheckCircle, color: "text-green-600" },
          { label: "Pending",   count: counts?.pending,   icon: CalendarDays, color: "text-yellow-600" },
          { label: "Completed", count: counts?.completed, icon: Flag,         color: "text-blue-600" },
          { label: "Cancelled", count: counts?.cancelled, icon: XCircle,      color: "text-red-500" },
        ].map(({ label, count, icon: Icon, color }) => (
          <Card key={label}>
            <CardContent className="flex items-center gap-4 pt-6">
              <Icon className={`h-8 w-8 ${color}`} />
              <div>
                <div className="text-2xl font-bold">{count ?? "—"}</div>
                <div className="text-sm text-muted-foreground">{label}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="space-y-4">
          <CardTitle>All Bookings</CardTitle>
          <BookingsFilters value={filters} onChange={changeFilters} />
        </CardHeader>
        <CardContent className="space-y-4 px-2 sm:px-6">
          {isLoading ? (
            <div className="space-y-2">{[...Array(5)].map((_, i) => <div key={i} className="h-12 animate-pulse rounded bg-muted" />)}</div>
          ) : isError ? (
            <p className="text-sm text-destructive">Failed to load bookings.</p>
          ) : (
            <>
              <div className="scrollbar-thin overflow-x-auto -mx-2 px-2 sm:mx-0 sm:px-0">
                <Table className="min-w-[960px]">
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
              <BookingsPagination page={page} limit={PAGE_SIZE} total={data?.total ?? 0} onPageChange={setPage} />
            </>
          )}
        </CardContent>
      </Card>

      <CancelDialog booking={cancelTarget} open={cancelTarget !== null} onOpenChange={(v) => { if (!v) setCancelTarget(null); }} />
    </div>
  );
}
