import { PortalLink as Link, useTurfPortal } from "@/components/portal/turf-portal-scope";
import { AlertCircle, Check, Clock, Loader2, X, type LucideIcon } from "lucide-react";
import type { PublicBooking } from "@/types/booking";
import { fromMinorUnits } from "@/lib/ground-format";
import { cn } from "@/lib/utils";
import { WALLET_NAME, hasBookingMoney, type ConfirmationState } from "./confirmation-state";

/** The current booking state and any next step for the customer. */
export function ConfirmationHero({ state, booking }: { state: ConfirmationState; booking: PublicBooking }) {
  const portal = useTurfPortal();
  const taka = (minor: number) => `৳${fromMinorUnits(minor).toLocaleString()}`;
  const total = taka(booking.total);
  const ref = <strong>#{booking.bookingNumber}</strong>;
  const wallet = booking.walletPayment;
  // No email on the booking (an older API sends no `emailed`): don't claim we emailed them.
  const myBookings = <>Find it in <Link href="/my-bookings" className="font-medium text-foreground underline underline-offset-4">My bookings</Link>.</>;
  const emailNote = booking.emailed === false ? myBookings : <>We&apos;ve emailed you the details.</>;

  // Booking money: the venue verifies the wallet payment, the balance is paid in cash at the venue.
  const balance = wallet && hasBookingMoney(booking) ? taka(Math.max(0, booking.total - wallet.amount)) : null;
  const content: Record<ConfirmationState, { icon: LucideIcon; title: string; body: React.ReactNode }> = {
    confirming: {
      icon: Loader2,
      title: "Confirming your payment…",
      body: <>This only takes a few seconds. Please keep this page open.</>,
    },
    unpaid: {
      icon: AlertCircle,
      title: "Waiting for payment",
      body: <>Booking {ref} isn&apos;t paid yet. Pay online below to confirm it.</>,
    },
    reserved: {
      icon: Clock,
      title: "Waiting for confirmation",
      body: <>Booking {ref}. Pay <strong>{total}</strong> in cash at the venue. {emailNote}</>,
    },
    verifying: {
      icon: Clock,
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
      icon: Check,
      title: "You're booked!",
      body: <>Booking {ref} is confirmed.{booking.payAtVenue && booking.due > 0 && <> Pay <strong>{taka(booking.due)}</strong> in cash at the venue.</>} {booking.emailed === false ? myBookings : <>A confirmation has been emailed to you.</>}</>,
    },
    completed: {
      icon: Check,
      title: "Hope you enjoyed the game!",
      body: <>Booking {ref} is completed.</>,
    },
    no_show: {
      icon: X,
      title: "Marked as a no-show",
      body: <>The venue marked booking {ref} as a no-show. Please contact the venue if this isn&apos;t right.</>,
    },
    cancelled: {
      icon: X,
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

  return <StatusHeading icon={icon} title={title} body={body} loading={state === "confirming"} />;
}

/** Loading / not-found variants that have no booking to show. */
export function ConfirmationMessage({
  kind, title, body,
}: {
  kind: "loading" | "error"; title: string; body?: React.ReactNode;
}) {
  const loading = kind === "loading";
  return <StatusHeading icon={loading ? Loader2 : AlertCircle} title={title} body={body} loading={loading} />;
}

function StatusHeading({ icon: Icon, title, body, loading }: {
  icon: LucideIcon; title: string; body?: React.ReactNode; loading: boolean;
}) {
  return (
    <header className="mx-auto max-w-lg text-center" aria-live="polite">
      <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-accent text-accent-foreground sm:size-14">
        <Icon className={cn("size-6", loading && "motion-safe:animate-spin")} aria-hidden />
      </div>
      <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-balance sm:text-3xl">{title}</h1>
      {body && <p className="mt-2 text-sm leading-relaxed text-pretty text-muted-foreground sm:text-base">{body}</p>}
    </header>
  );
}
