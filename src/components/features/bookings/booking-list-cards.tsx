"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { hasGroundChoice, useGrounds } from "@/hooks/useGrounds";
import { formatSlotDate, slotPriceLabel, slotTimeLabel } from "@/lib/slot-format";
import type { Booking } from "@/types/booking";
import { Phone, UserX, XCircle } from "lucide-react";
import { PAYMENT_STATUS_LABEL, canMarkNoShow, isCancellable, paymentStatusVariant } from "./booking-status-helpers";
import { BookingPaidDue } from "./booking-paid-due";
import { StatusCell } from "./booking-status-cell";
import { PayAtVenueBadge } from "./pay-at-venue-badge";
import { WalletBadge } from "./wallet-payment-info";

const DANGER_BTN = "h-10 text-destructive hover:bg-destructive/10 hover:text-destructive";

interface BookingListCardsProps {
  bookings: Booking[];
  onCancel: (b: Booking) => void;
  onNoShow: (b: Booking) => void;
}

/** The bookings table as stacked cards for phones, where its ten columns would scroll sideways. */
export function BookingListCards({ bookings, onCancel, onNoShow }: BookingListCardsProps) {
  const { data: grounds } = useGrounds();
  const showGround = hasGroundChoice(grounds);

  if (bookings.length === 0) return <p className="py-6 text-center text-sm text-muted-foreground">No bookings found.</p>;

  return (
    <ul className="divide-y">
      {bookings.map((b) => (
        <BookingListCard key={b.id} booking={b} showGround={showGround} onCancel={onCancel} onNoShow={onNoShow} />
      ))}
    </ul>
  );
}

function BookingListCard({ booking: b, showGround, onCancel, onNoShow }: Omit<BookingListCardsProps, "bookings"> & {
  booking: Booking;
  showGround: boolean;
}) {
  return (
    <li className="space-y-2.5 py-3 first:pt-0 last:pb-0">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Link href={`/dashboard/bookings/${b.id}`} className="block truncate font-medium hover:underline">{b.contact.name}</Link>
          <p className="truncate text-xs text-muted-foreground">
            {showGround && <>{b.ground.name} · </>}{formatSlotDate(b.slot.date)} · {slotTimeLabel(b.slot)}
          </p>
          <a href={`tel:${b.contact.phone}`} className="mt-0.5 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
            <Phone className="h-3 w-3" />{b.contact.phone}
          </a>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-sm font-semibold tabular-nums">{slotPriceLabel(b.total)}</p>
          <BookingPaidDue booking={b} />
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-1.5">
        <Link href={`/dashboard/bookings/${b.id}`} className="font-mono text-xs text-primary hover:underline">{b.bookingNumber}</Link>
        <Badge variant={paymentStatusVariant(b.paymentStatus)}>{PAYMENT_STATUS_LABEL[b.paymentStatus]}</Badge>
        {b.payAtVenue && <PayAtVenueBadge />}
        {b.walletPayment && <WalletBadge payment={b.walletPayment} />}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <StatusCell booking={b} onCancel={onCancel} triggerClassName="h-10 w-36" />
        <Button variant="outline" size="sm" className="h-10" asChild>
          <Link href={`/dashboard/bookings/${b.id}`}>View</Link>
        </Button>
        {isCancellable(b) && (
          <Button variant="ghost" size="sm" className={DANGER_BTN} onClick={() => onCancel(b)}>
            <XCircle className="h-4 w-4" />Cancel
          </Button>
        )}
        {canMarkNoShow(b) && (
          <Button variant="ghost" size="sm" className={DANGER_BTN} onClick={() => onNoShow(b)}>
            <UserX className="h-4 w-4" />No-show
          </Button>
        )}
      </div>
    </li>
  );
}
