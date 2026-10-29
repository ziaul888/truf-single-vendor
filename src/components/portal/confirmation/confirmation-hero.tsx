import { AlertCircle, Check, Clock, Loader2, X } from "lucide-react";
import type { PublicBooking } from "@/types/booking";
import { fromMinorUnits } from "@/lib/ground-format";
import type { ConfirmationState } from "./confirmation-state";

const ICON_WRAP = "mx-auto flex h-20 w-20 items-center justify-center rounded-full";

/** Big icon + headline at the top of the confirmation page, per booking state. */
export function ConfirmationHero({ state, booking }: { state: ConfirmationState; booking: PublicBooking }) {
  const total = `৳${fromMinorUnits(booking.total).toLocaleString()}`;
  const ref = <strong>#{booking.bookingNumber}</strong>;

  const content: Record<ConfirmationState, { icon: React.ReactNode; title: string; body: React.ReactNode }> = {
    confirming: {
      icon: <Loader2 className="h-10 w-10 animate-spin text-accent-foreground" />,
      title: "Confirming your payment…",
      body: <>This only takes a few seconds. Please keep this page open.</>,
    },
    unpaid: {
      icon: <AlertCircle className="h-10 w-10 text-accent-foreground" />,
      title: "Waiting for payment",
      body: <>Booking {ref} isn&apos;t paid yet. Pay online below to confirm it.</>,
    },
    reserved: {
      icon: <Clock className="h-10 w-10 text-accent-foreground" />,
      title: "Reserved: waiting for confirmation",
      body: <>Booking {ref}. Pay <strong>{total}</strong> in cash at the venue. We&apos;ve emailed you the details.</>,
    },
    confirmed: {
      icon: <Check className="h-10 w-10 text-accent-foreground" />,
      title: "You're booked!",
      body: <>Booking {ref} is confirmed. A confirmation has been emailed to you.</>,
    },
    completed: {
      icon: <Check className="h-10 w-10 text-accent-foreground" />,
      title: "Hope you enjoyed the game!",
      body: <>Booking {ref} is completed.</>,
    },
    cancelled: {
      icon: <X className="h-10 w-10 text-accent-foreground" />,
      title: "Booking cancelled",
      body:
        booking.paymentStatus === "refunded" ? (
          <>Booking {ref} was cancelled. A full refund of {total} has been issued to your original payment method.</>
        ) : (
          <>Booking {ref} was cancelled.</>
        ),
    },
  };
  const { icon, title, body } = content[state];

  return (
    <>
      <div className={`${ICON_WRAP} bg-accent`}>{icon}</div>
      <h1 className="mt-6 text-4xl font-extrabold tracking-tight">{title}</h1>
      <p className="mt-2 opacity-80">{body}</p>
    </>
  );
}

/** Loading / not-found variants that have no booking to show. */
export function ConfirmationMessage({
  kind, title, body,
}: {
  kind: "loading" | "error"; title: string; body?: React.ReactNode;
}) {
  return (
    <>
      <div className={`${ICON_WRAP} ${kind === "loading" ? "bg-accent" : "bg-white/10"}`}>
        {kind === "loading" ? (
          <Loader2 className="h-10 w-10 animate-spin text-accent-foreground" />
        ) : (
          <AlertCircle className="h-10 w-10" />
        )}
      </div>
      <h1 className="mt-6 text-3xl font-extrabold tracking-tight">{title}</h1>
      {body && <p className="mt-2 opacity-80">{body}</p>}
    </>
  );
}
