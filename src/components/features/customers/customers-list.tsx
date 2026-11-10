"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Customer } from "@/types/booking";
import { avatarBg, initials, formatDate, formatTaka, TAG_CLS, TAG_LABEL } from "./customer-display";

/** Customers as stacked rows for phones, where the table would scroll sideways. Each row opens the profile. */
export function CustomersList({ customers }: { customers: Customer[] }) {
  if (customers.length === 0) return <p className="py-12 text-center text-sm text-muted-foreground">No customers found.</p>;
  return (
    <ul className="divide-y">
      {customers.map((c) => (
        <li key={c.id}>
          <Link href={`/dashboard/customers/${c.id}`} className="flex items-center gap-3 px-4 py-3 active:bg-muted/50">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white" style={{ backgroundColor: avatarBg(c.name) }}>
              {initials(c.name)}
            </div>
            <div className="min-w-0 flex-1 space-y-0.5">
              <div className="flex items-center gap-2">
                <p className="truncate font-medium">{c.name}</p>
                <span className={cn("shrink-0 rounded-full border px-2 py-0.5 text-[11px] font-semibold", TAG_CLS[c.tag])}>{TAG_LABEL[c.tag]}</span>
              </div>
              <p className="truncate text-xs text-muted-foreground">{c.phone}</p>
              <p className="truncate text-xs text-muted-foreground">
                {c.bookings} booking{c.bookings === 1 ? "" : "s"} · {c.totalSpent > 0 ? formatTaka(c.totalSpent) : "৳ 0"} · Last {formatDate(c.lastBooking)}
              </p>
            </div>
            {c.dueAmount > 0 && (
              <span className="shrink-0 text-sm font-semibold tabular-nums text-amber-600 dark:text-amber-400">{formatTaka(c.dueAmount)} due</span>
            )}
            <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
          </Link>
        </li>
      ))}
    </ul>
  );
}
