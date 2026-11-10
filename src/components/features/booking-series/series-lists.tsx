"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { BOOKING_STATUS_LABEL, bookingStatusVariant } from "@/components/features/bookings/booking-status-helpers";
import { dayDate, SKIP_REASON_LABEL } from "@/lib/series-format";
import { cn } from "@/lib/utils";
import type { BookingSeries } from "@/types/booking-series";
import { ChevronDown } from "lucide-react";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Collapsible className="rounded-lg border">
      <CollapsibleTrigger className="group flex h-11 w-full items-center justify-between px-3 text-sm font-medium">
        {title}
        <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
      </CollapsibleTrigger>
      <CollapsibleContent className="border-t">{children}</CollapsibleContent>
    </Collapsible>
  );
}

/** Every booking of the series, oldest first; the one on screen is marked. */
export function SeriesBookingList({ bookings, currentId }: { bookings: BookingSeries["bookings"]; currentId: string }) {
  const sorted = [...bookings].sort((a, b) => a.date.localeCompare(b.date));
  return (
    <Section title={`Bookings (${bookings.length})`}>
      <ul className="divide-y">
        {sorted.map((b) => (
          <li key={b.id}>
            <Link href={`/dashboard/bookings/${b.id}`}
              className={cn("flex min-h-11 items-center gap-3 px-3 py-2 text-sm hover:bg-muted/50", b.id === currentId && "bg-primary/5")}>
              <span className="flex-1 font-medium">{dayDate(b.date)}</span>
              {b.id === currentId && <span className="text-xs text-muted-foreground">This one</span>}
              <Badge variant={bookingStatusVariant(b.status)}>{BOOKING_STATUS_LABEL[b.status]}</Badge>
            </Link>
          </li>
        ))}
      </ul>
    </Section>
  );
}

/** Dates of the pattern that couldn't be booked, and why. */
export function SeriesSkippedList({ skipped }: { skipped: BookingSeries["skipped"] }) {
  if (skipped.length === 0) return null;
  return (
    <Section title={`Skipped dates (${skipped.length})`}>
      <ul className="divide-y">
        {skipped.map((s) => (
          <li key={s.date} className="flex min-h-10 items-center justify-between gap-3 px-3 py-2 text-sm">
            <span className="font-medium">{dayDate(s.date)}</span>
            <span className="text-xs text-muted-foreground">{SKIP_REASON_LABEL[s.reason] ?? s.reason}</span>
          </li>
        ))}
      </ul>
    </Section>
  );
}
