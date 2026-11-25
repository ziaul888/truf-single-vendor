import Link from "next/link";
import { ArrowRight, CalendarDays, MapPin, Undo2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatBookingSlots } from "@/lib/booking-slots";
import { formatEventTime, formatSlotDate, slotPriceLabel } from "@/lib/slot-format";
import type { RefundBooking } from "@/types/refund-booking";
import { PAYMENT_METHOD_LABEL } from "./booking-status-helpers";

export function RefundBookingCard({ booking }: { booking: RefundBooking }) {
  const refund = booking.refundSummary;
  const due = refund.status === "due";
  const href = `/dashboard/bookings/${booking.id}`;

  return (
    <Card className="min-w-0">
      <CardContent className="space-y-4 p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Link href={href} className="text-primary font-mono text-xs font-medium hover:underline">
            {booking.bookingNumber}
          </Link>
          <Badge
            variant="outline"
            className={due ? "border-warning/40 bg-warning/10 text-foreground" : undefined}
          >
            {due ? "To send" : "Refund recorded"}
          </Badge>
        </div>

        <div className="min-w-0 space-y-1">
          <h2 className="text-base font-semibold break-words">
            {booking.contact.name || booking.customer.name}
          </h2>
          <p className="text-muted-foreground text-sm break-words">
            {booking.contact.phone || booking.customer.phone}
          </p>
          <p className="text-muted-foreground flex items-start gap-2 pt-1 text-sm">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
            <span className="min-w-0 break-words">{booking.ground.name}</span>
          </p>
          <p className="text-muted-foreground flex items-start gap-2 text-sm">
            <CalendarDays className="mt-0.5 h-4 w-4 shrink-0" />
            <span className="min-w-0 break-words">
              {formatSlotDate(booking.slot.date)} · {formatBookingSlots(booking)}
            </span>
          </p>
        </div>

        <div className="bg-muted/50 space-y-1 rounded-lg p-3">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <span className="text-muted-foreground flex items-center gap-1.5 text-sm">
              <Undo2 className="h-4 w-4" />
              Refund amount
            </span>
            <span className="text-lg font-semibold tabular-nums">
              {slotPriceLabel(refund.amount)}
            </span>
          </div>
          <p className="text-muted-foreground text-xs break-words">
            {refund.methods.map((method) => PAYMENT_METHOD_LABEL[method]).join(" · ")}
          </p>
          {refund.refundedAt && (
            <p className="text-muted-foreground text-xs">
              Recorded {formatEventTime(refund.refundedAt)}
            </p>
          )}
          {due && (
            <p className="pt-1 text-sm font-medium">
              {slotPriceLabel(refund.dueAmount)} still to send by wallet
            </p>
          )}
        </div>

        {booking.cancelReason && (
          <p className="text-muted-foreground text-sm break-words">
            Cancellation: {booking.cancelReason}
          </p>
        )}

        <Button variant={due ? "default" : "outline"} asChild className="min-h-11 w-full">
          <Link href={href}>
            {due ? "View & record refund" : "View booking"}
            <ArrowRight />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
