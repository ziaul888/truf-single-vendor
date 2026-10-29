"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { cancelPublicBooking } from "@/lib/portal-bookings";
import type { PublicBooking } from "@/types/booking";

/** "Cancel booking" with an in-page confirmation step. Cancelling refunds in full and frees the slot. */
export function CancelBooking({
  booking, token, onCancelled,
}: {
  booking: PublicBooking; token: string; onCancelled: (b: PublicBooking) => void;
}) {
  const [confirming, setConfirming] = useState(false);
  const cancel = useMutation({
    mutationFn: () => cancelPublicBooking(booking.id, token),
    onSuccess: (updated) => {
      setConfirming(false);
      onCancelled(updated);
    },
  });

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="mt-3 w-full rounded-lg border border-destructive/30 px-3 py-2.5 text-sm font-semibold text-destructive hover:bg-destructive/5"
      >
        Cancel booking
      </button>
    );
  }

  const refundNote = booking.paymentStatus === "paid" ? " You'll get a full refund to your original payment method." : "";
  return (
    <div role="alertdialog" aria-label="Cancel booking" className="mt-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm">
      <p className="font-semibold">Cancel this booking?</p>
      <p className="mt-1 text-muted-foreground">The slot will be released.{refundNote}</p>
      {cancel.isError && (
        <p role="alert" className="mt-2 text-destructive">{cancel.error.message}</p>
      )}
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={() => cancel.mutate()}
          disabled={cancel.isPending}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-destructive px-3 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
        >
          {cancel.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          Yes, cancel
        </button>
        <button
          type="button"
          onClick={() => { setConfirming(false); cancel.reset(); }}
          disabled={cancel.isPending}
          className="flex-1 rounded-lg border px-3 py-2 text-sm font-semibold hover:bg-muted disabled:opacity-60"
        >
          Keep booking
        </button>
      </div>
    </div>
  );
}
