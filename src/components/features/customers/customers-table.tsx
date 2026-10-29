"use client";

import Link from "next/link";
import { ArrowDown, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { Customer, CustomerSort } from "@/types/booking";
import { avatarBg, initials, formatSince, formatDate, formatTaka, TAG_CLS, TAG_LABEL } from "./customer-display";

/** Sortable columns in table order; the API always sorts high → low. */
export const SORT_COLUMNS: { field: CustomerSort; label: string }[] = [
  { field: "since",       label: "Since" },
  { field: "bookings",    label: "Bookings" },
  { field: "totalSpent",  label: "Total spent" },
  { field: "lastBooking", label: "Last booking" },
  { field: "due",         label: "Due amount" },
];

function CustomerCells({ c }: { c: Customer }) {
  return (
    <>
      <TableCell className="text-sm">{formatSince(c.createdAt)}</TableCell>
      <TableCell className="text-sm font-semibold">{c.bookings}</TableCell>
      <TableCell className="text-sm font-medium">{c.totalSpent > 0 ? formatTaka(c.totalSpent) : "৳ 0"}</TableCell>
      <TableCell className="text-sm">{formatDate(c.lastBooking)}</TableCell>
      <TableCell>
        {c.dueAmount > 0
          ? <span className="text-sm font-semibold text-amber-600 dark:text-amber-400">{formatTaka(c.dueAmount)}</span>
          : <span className="text-muted-foreground">—</span>}
      </TableCell>
      <TableCell>
        <span className={cn("rounded-full border px-2.5 py-0.5 text-xs font-semibold", TAG_CLS[c.tag])}>{TAG_LABEL[c.tag]}</span>
      </TableCell>
    </>
  );
}

export function CustomersTable({
  customers,
  sort,
  onSort,
}: {
  customers: Customer[];
  sort: CustomerSort;
  onSort: (field: CustomerSort) => void;
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-muted/30">
          <TableHead className="w-[220px]">Customer</TableHead>
          {SORT_COLUMNS.map(({ field, label }) => (
            <TableHead key={field}>
              <button type="button" className="flex items-center gap-1 font-medium" onClick={() => onSort(field)}>
                {label}
                {field === sort ? <ArrowDown className="h-3 w-3" /> : <ArrowUpDown className="h-3 w-3 opacity-40" />}
              </button>
            </TableHead>
          ))}
          <TableHead>Tag</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {customers.length === 0 ? (
          <TableRow><TableCell colSpan={8} className="py-12 text-center text-muted-foreground">No customers found.</TableCell></TableRow>
        ) : (
          customers.map((c) => (
            <TableRow key={c.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white" style={{ backgroundColor: avatarBg(c.name) }}>
                    {initials(c.name)}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium leading-tight truncate">{c.name}</p>
                    <p className="text-xs text-muted-foreground">{c.phone}</p>
                  </div>
                </div>
              </TableCell>
              <CustomerCells c={c} />
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1">
                  <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" asChild>
                    <Link href={`/dashboard/customers/${c.id}`}>Profile</Link>
                  </Button>
                  <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" asChild>
                    <Link href={`/dashboard/bookings?customer=${c.id}`}>Bookings</Link>
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
