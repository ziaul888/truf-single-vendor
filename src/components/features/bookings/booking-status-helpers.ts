import type {
  Booking, BookingEventType, BookingStatus, PaymentMethod, PaymentStatus,
} from "@/types/booking";
import { toMinorUnits } from "@/lib/ground-format";
import { slotPriceLabel } from "@/lib/slot-format";

type BadgeVariant = "default" | "secondary" | "destructive" | "outline";

export function bookingStatusVariant(status: BookingStatus): BadgeVariant {
  if (status === "confirmed") return "default";
  if (status === "pending") return "secondary";
  if (status === "cancelled") return "destructive";
  return "outline";
}

export function paymentStatusVariant(status: PaymentStatus): BadgeVariant {
  if (status === "paid") return "default";
  if (status === "partial") return "secondary";
  if (status === "failed") return "destructive";
  return "outline";
}

export const BOOKING_STATUS_LABEL: Record<BookingStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  cancelled: "Cancelled",
  completed: "Completed",
};

export const PAYMENT_STATUS_LABEL: Record<PaymentStatus, string> = {
  unpaid: "Unpaid",
  partial: "Partial",
  paid: "Paid",
  refunded: "Refunded",
  failed: "Failed",
};

export const PAYMENT_METHOD_LABEL: Record<PaymentMethod, string> = {
  card: "Card",
  cash: "Cash",
  bank_transfer: "Bank transfer",
};

export const EVENT_LABEL: Record<BookingEventType, string> = {
  created: "Booking created",
  payment_received: "Payment received",
  confirmed: "Booking confirmed",
  cancelled: "Booking cancelled",
  refunded: "Refund issued",
  email_sent: "Email sent",
  completed: "Booking completed",
};

export const EVENT_DOT_CLASS: Record<BookingEventType, string> = {
  created: "bg-blue-500",
  payment_received: "bg-green-500",
  confirmed: "bg-emerald-500",
  cancelled: "bg-red-500",
  refunded: "bg-red-400",
  email_sent: "bg-purple-500",
  completed: "bg-gray-400",
};

/** "৳ 1,500" from whole currency units (form values). */
export const takaLabel = (major: number) => slotPriceLabel(toMinorUnits(major));

/** Pending or confirmed bookings can still be cancelled; completed ones can't. */
export const isCancellable = (b: Pick<Booking, "status">) => b.status === "pending" || b.status === "confirmed";

/** Portal card bookings confirm when Stripe payment succeeds; staff can't confirm them by hand. */
export const isAwaitingCardPayment = (b: Pick<Booking, "source" | "payAtVenue" | "status">) =>
  b.status === "pending" && b.source === "portal" && !b.payAtVenue;

export function timeAgo(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.max(0, Math.floor(diff / 60_000));
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}
