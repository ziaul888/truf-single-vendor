"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { CreditCard, Loader2 } from "lucide-react";
import { fromMinorUnits } from "@/lib/ground-format";
import { markLeavingForPayment, payBooking, PortalApiError } from "@/lib/portal-bookings";
import type { PublicBooking } from "@/types/booking";

/**
 * "Pay ৳{due} now": pays whatever is owed by card through Stripe (an unpaid booking,
 * pay-at-venue, or the rest after an advance). Stripe brings the customer back to this page.
 */
export function PayNow({ booking, token, onNothingDue }: {
  booking: PublicBooking; token: string; onNothingDue: () => void;
}) {
  const [leaving, setLeaving] = useState(false);
  const pay = useMutation({
    mutationFn: () => payBooking(booking.id, token),
    onSuccess: ({ checkoutUrl }) => {
      setLeaving(true);
      markLeavingForPayment(booking.id, booking.paid);
      window.location.href = checkoutUrl;
    },
    onError: (err) => {
      // Already paid (e.g. at the counter) or cancelled meanwhile: show the latest state.
      if (err instanceof PortalApiError && err.code === "NOTHING_DUE") onNothingDue();
    },
  });
  const busy = pay.isPending || leaving;
  const due = `৳${fromMinorUnits(booking.due).toLocaleString()}`;

  return (
    <div className="mt-6">
      <button
        type="button"
        onClick={() => pay.mutate()}
        disabled={busy}
        className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-3 py-2.5 text-sm font-bold text-primary-foreground hover:opacity-90 disabled:opacity-60"
      >
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
        {busy ? "Taking you to payment…" : `Pay ${due} now`}
      </button>
      {booking.payAtVenue && !busy && (
        <p className="mt-2 text-xs opacity-70">Or pay in cash at the venue, as you chose.</p>
      )}
      {pay.isError && !(pay.error instanceof PortalApiError && pay.error.code === "NOTHING_DUE") && (
        <p role="alert" className="mt-2 text-sm text-destructive">{pay.error.message}</p>
      )}
    </div>
  );
}
