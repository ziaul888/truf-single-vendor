"use client";

import Link from "next/link";
import { Banknote } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatSlotDate, slotPriceLabel } from "@/lib/slot-format";
import { formatBookingSlots } from "@/lib/booking-slots";
import type { Booking } from "@/types/booking";
import {
  BOOKING_STATUS_LABEL,
  PAYMENT_STATUS_LABEL,
  bookingStatusVariant,
  canCollectPayment,
  paymentStatusVariant,
} from "@/components/features/bookings/booking-status-helpers";

/** A readable booking list shared by phone and desktop dashboard views. */
export function UpcomingList({
  bookings,
  onCollect,
}: {
  bookings: Booking[];
  onCollect: (b: Booking) => void;
}) {
  return (
    <ul className="divide-y">
      {bookings.map((b) => (
        <li key={b.id} className="space-y-2 py-4 first:pt-0 last:pb-0">
          <div className="flex items-start justify-between gap-3">
            <Link
              href={`/dashboard/bookings/${b.id}`}
              className="focus-visible:ring-ring min-w-0 flex-1 rounded-sm focus-visible:ring-2 focus-visible:outline-none"
            >
              <p className="text-sm font-semibold break-words hover:underline">
                {b.contact.name || b.customer.name}
              </p>
              <p className="text-muted-foreground mt-1 text-xs break-words">
                {formatSlotDate(b.slot.date)} · {formatBookingSlots(b)}
              </p>
              <p className="text-muted-foreground mt-0.5 text-xs break-words">{b.ground.name}</p>
            </Link>
            <span className="shrink-0 text-sm font-semibold tabular-nums">
              {slotPriceLabel(b.total)}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <Link
              href={`/dashboard/bookings/${b.id}`}
              className="text-primary font-mono text-xs hover:underline"
            >
              {b.bookingNumber}
            </Link>
            <Badge variant={bookingStatusVariant(b.status)}>{BOOKING_STATUS_LABEL[b.status]}</Badge>
            <Badge variant={paymentStatusVariant(b.paymentStatus)}>
              {PAYMENT_STATUS_LABEL[b.paymentStatus]}
            </Badge>
            {canCollectPayment(b) && (
              <Button
                size="sm"
                variant="outline"
                className="ml-auto min-h-10 gap-1 px-2 text-xs"
                onClick={() => onCollect(b)}
              >
                <Banknote className="h-3.5 w-3.5" /> Collect {slotPriceLabel(b.due)}
              </Button>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
