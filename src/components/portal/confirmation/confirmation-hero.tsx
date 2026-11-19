import { PortalLink as Link, useTurfPortal } from "@/components/portal/turf-portal-scope";
import { AlertCircle, Check, Clock, Loader2, X } from "lucide-react";
import type { PublicBooking } from "@/types/booking";
import { fromMinorUnits } from "@/lib/ground-format";
import { WALLET_NAME, hasBookingMoney, type ConfirmationState } from "./confirmation-state";

const ICON_WRAP = "mx-auto flex h-20 w-20 items-center justify-center rounded-full";

/** Big icon + headline at the top of the confirmation page, per booking state. */
export function ConfirmationHero({ state, booking }: { state: ConfirmationState; booking: PublicBooking }) {
  const portal = useTurfPortal();
  const taka = (minor: number) => `৳${fromMinorUnits(minor).toLocaleString()}`;
  const total = taka(booking.total);
  const ref = <strong>#{booking.bookingNumber}</strong>;
  const wallet = booking.walletPayment;
  // No email on the booking (an older API sends no `emailed`): don't claim we emailed them.
  const myBookings = <>Find it any time under <Link href="/my-bookings" className="underline">My bookings</Link>.</>;
  const emailNote = booking.emailed === false ? myBookings : <>We&apos;ve emailed you the details.</>;

  // Booking money: the venue verifies the wallet payment, the balance is paid in cash at the venue.
  const balance = wallet && hasBookingMoney(booking) ? taka(Math.max(0, booking.total - wallet.amount)) : null;
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
      body: <>Booking {ref}. Pay <strong>{total}</strong> in cash at the venue. {emailNote}</>,
    },
    verifying: {
      icon: <Clock className="h-10 w-10 text-accent-foreground" />,
      title: "Payment submitted for verification",
      body: (
        <>
          Booking {ref}. We&apos;ve got your {wallet ? WALLET_NAME[wallet.method] : ""} payment
          {wallet?.reference && <> (TrxID <strong className="font-mono">{wallet.reference}</strong>)</>}. The venue will verify the
          payment and confirm your booking.
          {balance && <> The rest, <strong>{balance}</strong>, is paid in cash at the venue.</>} {emailNote}
        </>
      ),
    },
    confirmed: {
      icon: <Check className="h-10 w-10 text-accent-foreground" />,
      title: "You're booked!",
      body: <>Booking {ref} is confirmed.{booking.payAtVenue && booking.due > 0 && <> Pay <strong>{taka(booking.due)}</strong> in cash at the venue.</>} {booking.emailed === false ? myBookings : <>A confirmation has been emailed to you.</>}</>,
    },
    completed: {
      icon: <Check className="h-10 w-10 text-accent-foreground" />,
      title: "Hope you enjoyed the game!",
      body: <>Booking {ref} is completed.</>,
    },
    no_show: {
      icon: <X className="h-10 w-10 text-accent-foreground" />,
      title: "Marked as a no-show",
      body: <>The venue marked booking {ref} as a no-show. Please contact the venue if this isn&apos;t right.</>,
    },
    cancelled: {
      icon: <X className="h-10 w-10 text-accent-foreground" />,
      title: "Booking cancelled",
      body:
        portal && booking.paymentStatus === "refunded" ? (
          <>Booking {ref} was cancelled. Contact the venue for the status of your refund.</>
        ) : booking.paymentStatus === "refunded" ? (
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
      <h1 className="mt-6 text-3xl font-extrabold tracking-tight sm:text-4xl">{title}</h1>
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
