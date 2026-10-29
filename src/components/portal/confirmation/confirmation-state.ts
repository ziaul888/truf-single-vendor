import type { PublicBooking } from "@/types/booking";

/** How long the page polls after returning from Stripe: 10 refetches × 2s ≈ 20s. */
export const POLL_INTERVAL_MS = 2000;
export const MAX_POLLS = 10;

export type ConfirmationState =
  | "confirming"      // just back from Stripe, waiting for the webhook
  | "unpaid"          // pending and not paid (card or staff booking): "Pay now"
  | "reserved"        // pay at venue, pending until staff confirm
  | "confirmed"
  | "completed"
  | "cancelled";

/**
 * Whether a payment the customer just made has shown up yet. `paidBefore` is what was paid
 * when they left for Stripe (null = they didn't just come back from Stripe).
 */
export function paymentLanded(b: PublicBooking, paidBefore: number | null) {
  if (paidBefore === null) return true;
  return b.paid > paidBefore || b.due === 0 || b.status === "cancelled";
}

export function confirmationState(b: PublicBooking, waitingForPayment: boolean): ConfirmationState {
  if (waitingForPayment) return "confirming";
  if (b.status === "pending") return b.payAtVenue ? "reserved" : "unpaid";
  return b.status;
}

export const PAYMENT_STATUS_LABEL: Record<PublicBooking["paymentStatus"], string> = {
  unpaid: "Unpaid",
  partial: "Partly paid",
  paid: "Paid",
  refunded: "Refunded",
  failed: "Failed",
};
