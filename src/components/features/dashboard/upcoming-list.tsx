"use client";

import Link from "next/link";
import { Banknote } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatSlotDate, slotPriceLabel, slotTimeLabel } from "@/lib/slot-format";
import type { Booking } from "@/types/booking";
import {
  BOOKING_STATUS_LABEL, PAYMENT_STATUS_LABEL, bookingStatusVariant, paymentStatusVariant,
} from "@/components/features/bookings/booking-status-helpers";

/** Upcoming bookings as stacked rows for phones, where the table would scroll sideways. */
export function UpcomingList({ bookings, onCollect }: { bookings: Booking[]; onCollect: (b: Booking) => void }) {
  return (
    <ul className="divide-y">
      {bookings.map((b) => (
        <li key={b.id} className="space-y-1.5 py-3 first:pt-0 last:pb-0">
          <div className="flex items-start justify-between gap-3">
            <Link href={`/dashboard/bookings/${b.id}`} className="min-w-0">
              <p className="truncate font-medium">{b.contact.name || b.customer.name}</p>
              <p className="truncate text-xs text-muted-foreground">
                {b.ground.name} · {formatSlotDate(b.slot.date)} · {slotTimeLabel(b.slot)}
              </p>
            </Link>
            <span className="shrink-0 text-sm font-semibold tabular-nums">{slotPriceLabel(b.total)}</span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <Link href={`/dashboard/bookings/${b.id}`} className="font-mono text-xs text-primary hover:underline">{b.bookingNumber}</Link>
            <Badge variant={bookingStatusVariant(b.status)}>{BOOKING_STATUS_LABEL[b.status]}</Badge>
            <Badge variant={paymentStatusVariant(b.paymentStatus)}>{PAYMENT_STATUS_LABEL[b.paymentStatus]}</Badge>
            {b.due > 0 && (
              <Button size="sm" variant="outline" className="ml-auto h-7 gap-1 px-2 text-xs" onClick={() => onCollect(b)}>
                <Banknote className="h-3.5 w-3.5" /> Collect {slotPriceLabel(b.due)}
              </Button>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
