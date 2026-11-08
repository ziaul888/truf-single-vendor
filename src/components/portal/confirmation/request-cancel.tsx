"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { requestCancellation } from "@/lib/portal-bookings";
import type { PublicBooking } from "@/types/booking";

/**
 * While the venue verifies a bKash / Nagad payment the customer can't cancel directly: they ask,
 * once (with an in-page confirmation step, as for "Cancel booking"), and the venue cancels with a refund
 * or rejects the payment. Shows "Cancellation requested" after.
 */
export function RequestCancel({
  booking, token, onRequested,
}: {
  booking: PublicBooking; token: string; onRequested: (b: PublicBooking) => void;
}) {
  const [confirming, setConfirming] = useState(false);
  const request = useMutation({
    mutationFn: () => requestCancellation(booking.id, token),
    onSuccess: (updated) => { setConfirming(false); onRequested(updated); },
  });

  if (booking.cancelRequested) {
    return (
      <p className="mt-3 rounded-lg border px-3 py-2.5 text-sm">
        <strong>Cancellation requested.</strong> The venue will check your payment and let you know by email.
      </p>
    );
  }
  if (!booking.canRequestCancel) return null;
  if (confirming) {
    return (
      <AskToCancel
        pending={request.isPending}
        error={request.isError ? request.error.message : null}
        onYes={() => request.mutate()}
        onNo={() => { setConfirming(false); request.reset(); }}
      />
    );
  }
  return (
    <div className="mt-3">
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="w-full rounded-lg border border-destructive/30 px-3 py-2.5 text-sm font-semibold text-destructive hover:bg-destructive/5"
      >
        Request cancellation
      </button>
      <p className="mt-1 text-xs opacity-70">Your payment is still being verified, so the venue handles the cancellation and any refund.</p>
    </div>
  );
}

/** "Are you sure?": the request can only be sent once. */
function AskToCancel({ pending, error, onYes, onNo }: { pending: boolean; error: string | null; onYes: () => void; onNo: () => void }) {
  return (
    <div role="alertdialog" aria-label="Request cancellation" className="mt-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm">
      <p className="font-semibold">Ask the venue to cancel?</p>
      <p className="mt-1 text-muted-foreground">You can only ask once. The venue checks your payment, then cancels with a refund or tells you by email.</p>
      {error && <p role="alert" className="mt-2 text-destructive">{error}</p>}
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={onYes}
          disabled={pending}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-destructive px-3 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
        >
          {pending && <Loader2 className="h-4 w-4 animate-spin" />}
          Yes, ask to cancel
        </button>
        <button
          type="button"
          onClick={onNo}
          disabled={pending}
          className="flex-1 rounded-lg border px-3 py-2 text-sm font-semibold hover:bg-muted disabled:opacity-60"
        >
          Keep booking
        </button>
      </div>
    </div>
  );
}
