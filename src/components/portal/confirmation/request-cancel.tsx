"use client";

import { useMutation } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { requestCancellation } from "@/lib/portal-bookings";
import type { PublicBooking } from "@/types/booking";

/**
 * While the venue verifies a bKash / Nagad payment the customer can't cancel directly: they ask,
 * and the venue cancels with a refund or rejects the payment. Shows "Cancellation requested" after.
 */
export function RequestCancel({
  booking, token, onRequested,
}: {
  booking: PublicBooking; token: string; onRequested: (b: PublicBooking) => void;
}) {
  const request = useMutation({ mutationFn: () => requestCancellation(booking.id, token), onSuccess: onRequested });

  if (booking.cancelRequested) {
    return (
      <p className="mt-3 rounded-lg border px-3 py-2.5 text-sm">
        <strong>Cancellation requested.</strong> The venue will check your payment and let you know by email.
      </p>
    );
  }
  if (!booking.canRequestCancel) return null;
  return (
    <div className="mt-3">
      <button
        type="button"
        onClick={() => request.mutate()}
        disabled={request.isPending}
        className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-destructive/30 px-3 py-2.5 text-sm font-semibold text-destructive hover:bg-destructive/5 disabled:opacity-60"
      >
        {request.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
        Request cancellation
      </button>
      <p className="mt-1 text-xs opacity-70">Your payment is still being verified, so the venue handles the cancellation and any refund.</p>
      {request.isError && <p role="alert" className="mt-2 text-sm text-destructive">{request.error.message}</p>}
    </div>
  );
}
