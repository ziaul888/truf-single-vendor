"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Booking } from "@/types/booking";
import { formatSlotDate, slotPriceLabel, slotTimeLabel } from "@/lib/slot-format";
import { Phone, MapPin, CalendarDays, Banknote, Clock, StickyNote, CheckCircle2, XCircle, CreditCard } from "lucide-react";
import { PAYMENT_STATUS_LABEL, isAwaitingCardPayment, paymentStatusVariant, timeAgo } from "./booking-status-helpers";
import { PayAtVenueBadge } from "./pay-at-venue-badge";

export function PendingBookingCard({
  booking,
  onConfirm,
  onDecline,
}: {
  booking: Booking;
  onConfirm: (b: Booking) => void;
  onDecline: (b: Booking) => void;
}) {
  const awaitingCard = isAwaitingCardPayment(booking);

  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardContent className="p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-base font-semibold">{booking.contact.name}</span>
                  <span className="font-mono text-xs text-muted-foreground">{booking.bookingNumber}</span>
                </div>
                <a href={`tel:${booking.contact.phone}`} className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
                  <Phone className="h-3 w-3" />{booking.contact.phone}
                </a>
              </div>
              <div className="flex shrink-0 items-center gap-1.5">
                {booking.payAtVenue && <PayAtVenueBadge />}
                <Badge variant={paymentStatusVariant(booking.paymentStatus)} className="text-xs">
                  {PAYMENT_STATUS_LABEL[booking.paymentStatus]}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <MapPin className="h-3.5 w-3.5 shrink-0" /><span className="truncate">{booking.ground.name}</span>
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <CalendarDays className="h-3.5 w-3.5 shrink-0" /><span>{formatSlotDate(booking.slot.date)}</span>
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Banknote className="h-3.5 w-3.5 shrink-0" />
                <span className="font-medium text-foreground">{slotPriceLabel(booking.total)}</span>
                {booking.paid > 0 && <span className="text-xs">({slotPriceLabel(booking.due)} due)</span>}
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Clock className="h-3.5 w-3.5 shrink-0" /><span>{slotTimeLabel(booking.slot)}</span>
              </div>
            </div>

            {booking.notes && (
              <div className="flex items-start gap-2 rounded-md bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
                <StickyNote className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span className="italic">{booking.notes}</span>
              </div>
            )}

            {awaitingCard && (
              <div className="flex items-center gap-2 rounded-md bg-blue-50 px-3 py-2 text-xs text-blue-700 dark:bg-blue-950/30 dark:text-blue-300">
                <CreditCard className="h-3.5 w-3.5 shrink-0" />Customer is paying by card. It confirms automatically when payment succeeds.
              </div>
            )}

            <div className="flex items-center gap-1 text-[11px] text-muted-foreground/70">
              <Clock className="h-3 w-3" />Requested {timeAgo(booking.createdAt)}
              {booking.source === "staff" && booking.createdBy && <> · by {booking.createdBy.name}</>}
            </div>
          </div>

          <div className="flex gap-2 sm:flex-col sm:items-stretch">
            {!awaitingCard && (
              <Button size="sm" className="flex-1 bg-green-600 text-white hover:bg-green-700 sm:flex-none" onClick={() => onConfirm(booking)}>
                <CheckCircle2 className="mr-1.5 h-4 w-4" />Confirm
              </Button>
            )}
            <Button size="sm" variant="outline" className="flex-1 border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive sm:flex-none" onClick={() => onDecline(booking)}>
              <XCircle className="mr-1.5 h-4 w-4" />Decline
            </Button>
            <Button size="sm" variant="ghost" className="flex-1 text-xs sm:flex-none" asChild>
              <Link href={`/dashboard/bookings/${booking.id}`}>View</Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
