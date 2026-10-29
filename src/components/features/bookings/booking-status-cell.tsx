"use client";

import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useConfirmBooking } from "@/hooks/useBookings";
import { toApiFailure } from "@/lib/api-error";
import type { Booking } from "@/types/booking";
import { toast } from "sonner";
import { BOOKING_STATUS_LABEL, bookingStatusVariant, isAwaitingCardPayment, isCancellable } from "./booking-status-helpers";

/**
 * Inline status: there is no generic status update, so "Confirmed" calls confirm
 * and "Cancelled" opens the cancel dialog (which asks about the refund).
 */
export function StatusCell({ booking, onCancel }: { booking: Booking; onCancel: (b: Booking) => void }) {
  const confirm = useConfirmBooking();

  if (!isCancellable(booking)) {
    return <Badge variant={bookingStatusVariant(booking.status)}>{BOOKING_STATUS_LABEL[booking.status]}</Badge>;
  }

  const canConfirm = booking.status === "pending" && !isAwaitingCardPayment(booking);

  function handleChange(value: string) {
    if (value === "cancelled") return onCancel(booking);
    if (value !== "confirmed" || booking.status === "confirmed") return;
    confirm.mutate(
      { id: booking.id, notifyCustomer: true },
      {
        onSuccess: () => toast.success(`Booking ${booking.bookingNumber} confirmed`),
        onError: (err) => toast.error(toApiFailure(err).error),
      },
    );
  }

  return (
    <Select value={booking.status} onValueChange={handleChange} disabled={confirm.isPending}>
      <SelectTrigger className="h-7 w-32 text-xs">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {booking.status === "pending" && <SelectItem value="pending">Pending</SelectItem>}
        {(canConfirm || booking.status === "confirmed") && <SelectItem value="confirmed">Confirmed</SelectItem>}
        <SelectItem value="cancelled">Cancelled</SelectItem>
      </SelectContent>
    </Select>
  );
}
