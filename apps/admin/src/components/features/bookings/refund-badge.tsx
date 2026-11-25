import { Undo2 } from "lucide-react";
import type { Booking } from "@/types/booking";

/** True while a manual bKash / Nagad refund still has to be paid back. */
export const isRefundDue = (b: Pick<Booking, "refund">) => !!b.refund && !b.refund.sentAt;

/** List badge: "Refund due" (amber) until staff record it as sent, then "Refunded" (neutral). */
export function RefundBadge({ refund }: { refund: NonNullable<Booking["refund"]> }) {
  const due = !refund.sentAt;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
        due
          ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
          : "bg-muted text-muted-foreground"
      }`}
    >
      <Undo2 className="h-3 w-3" />{due ? "Refund due" : "Refunded"}
    </span>
  );
}
