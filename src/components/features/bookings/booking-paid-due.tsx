import { slotPriceLabel } from "@/lib/slot-format";
import type { Booking } from "@/types/booking";
import { isAwaitingWalletVerification } from "./booking-status-helpers";

/** Paid, and what's still due (or "Verifying" while a bKash / Nagad payment is checked). */
export function BookingPaidDue({ booking }: { booking: Booking }) {
  return (
    <div className="text-xs">
      <div className="text-green-600 dark:text-green-400">{slotPriceLabel(booking.paid)}</div>
      {booking.due > 0 && (isAwaitingWalletVerification(booking)
        ? <div className="text-muted-foreground">Verifying</div>
        : <div className="text-amber-600 dark:text-amber-400">{slotPriceLabel(booking.due)} due</div>)}
    </div>
  );
}
