"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { clearPaymentReturn, getPublicBooking, paidBeforeLeaving, PortalApiError } from "@/lib/portal-bookings";
import type { PublicBooking } from "@/types/booking";
import { confirmationState, MAX_POLLS, paymentLanded, POLL_INTERVAL_MS } from "./confirmation-state";
import { ConfirmationHero, ConfirmationMessage } from "./confirmation-hero";
import { BookingDetailsCard } from "./booking-details-card";
import { CancelBooking } from "./cancel-booking";
import { PayNow } from "./pay-now";

const NOT_FOUND_BODY = "Use the link in your email.";

/** Loads the booking by its signed link and shows the view for its current state. */
export function ConfirmationView({ id, token, venueName }: { id: string; token?: string; venueName: string }) {
  const queryClient = useQueryClient();
  const queryKey = ["portal", "booking", id, token];
  // Set when the customer just came back from Stripe (checkout or "Pay now"); read once.
  const [paidBefore] = useState(() => (typeof window === "undefined" ? null : paidBeforeLeaving(id)));
  // dataUpdatedAt is read so each poll re-renders; the poll count lives on the query state.
  const { data: booking, error, isPending, dataUpdatedAt, refetch } = useQuery({
    queryKey,
    queryFn: () => getPublicBooking(id, token ?? ""),
    enabled: !!token,
    // Right after Stripe redirects back the webhook may not have landed yet: poll ~20s.
    refetchInterval: (q) =>
      q.state.data && !paymentLanded(q.state.data, paidBefore) && q.state.dataUpdateCount <= MAX_POLLS
        ? POLL_INTERVAL_MS
        : false,
    // A wrong or missing token is a 404 with a code; retrying won't help.
    retry: (count, err) => !(err instanceof PortalApiError && err.code) && count < 2,
  });

  const polls = dataUpdatedAt ? (queryClient.getQueryState(queryKey)?.dataUpdateCount ?? 0) : 0;
  const waitingForPayment = !!booking && !paymentLanded(booking, paidBefore) && polls <= MAX_POLLS;
  // Once the payment shows up (or we give up), forget the Stripe return so a reload doesn't poll again.
  useEffect(() => {
    if (booking && paidBefore !== null && !waitingForPayment) clearPaymentReturn(id);
  }, [booking, paidBefore, waitingForPayment, id]);

  if (!token || (error instanceof PortalApiError && error.code === "BOOKING_NOT_FOUND")) {
    return <Shell><ConfirmationMessage kind="error" title="We couldn't find this booking." body={NOT_FOUND_BODY} /></Shell>;
  }
  if (isPending) {
    return <Shell><ConfirmationMessage kind="loading" title="Loading your booking…" /></Shell>;
  }
  if (!booking) {
    const body = (
      <>
        {error?.message}{" "}
        <button type="button" onClick={() => refetch()} className="font-semibold text-accent underline">Try again</button>
      </>
    );
    return <Shell><ConfirmationMessage kind="error" title="Couldn't load your booking" body={body} /></Shell>;
  }

  const state = confirmationState(booking, waitingForPayment);
  const onCancelled = (updated: PublicBooking) => queryClient.setQueryData(queryKey, updated);

  return (
    <Shell>
      <ConfirmationHero state={state} booking={booking} />
      <BookingDetailsCard booking={booking} state={state} venueName={venueName}>
        {booking.canPay && state !== "confirming" && (
          <PayNow booking={booking} token={token} onNothingDue={() => refetch()} />
        )}
        {booking.canCancel && state !== "confirming" && (
          <CancelBooking booking={booking} token={token} onCancelled={onCancelled} />
        )}
      </BookingDetailsCard>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <section className="bg-sidebar py-16 text-sidebar-foreground">
      <div className="mx-auto max-w-2xl px-4 text-center sm:px-6 lg:px-8">
        {children}
        <Link href="/grounds" className="mt-8 inline-block font-semibold text-accent hover:underline">
          Book another slot →
        </Link>
      </div>
    </section>
  );
}
