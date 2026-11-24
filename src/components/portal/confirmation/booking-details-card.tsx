import { Goal, Map } from "lucide-react";
import type { PublicBooking } from "@/types/booking";
import { fromMinorUnits } from "@/lib/ground-format";
import { bookingSlots } from "@/lib/booking-slots";
import { formatSlotDate, formatSlotRange, slotClockLabel, slotCountLabel, slotStartTime } from "@/lib/slot-format";
import { FallbackImage } from "@/components/fallback-image";
import { FormatBadge } from "@/components/portal/format-badge";
import { PAYMENT_STATUS_LABEL, WALLET_NAME, hasBookingMoney, isUnderReview, type ConfirmationState } from "./confirmation-state";

const STATUS_PILL: Record<ConfirmationState, { label: string; className: string }> = {
  confirming: { label: "Processing", className: "bg-warning/15 [&>span]:bg-warning" },
  unpaid: { label: "Awaiting payment", className: "bg-warning/15 [&>span]:bg-warning" },
  reserved: { label: "Pending", className: "bg-warning/15 [&>span]:bg-warning" },
  verifying: { label: "Verifying payment", className: "bg-warning/15 [&>span]:bg-warning" },
  confirmed: { label: "Confirmed", className: "bg-success/15 [&>span]:bg-success" },
  completed: { label: "Completed", className: "bg-muted [&>span]:bg-muted-foreground" },
  no_show: { label: "No-show", className: "bg-destructive/15 [&>span]:bg-destructive" },
  cancelled: { label: "Cancelled", className: "bg-destructive/15 [&>span]:bg-destructive" },
};

const taka = (minor: number) => `৳${fromMinorUnits(minor).toLocaleString()}`;

/** "Paid · cash at venue", "Unpaid · bKash, being verified". */
function paymentLabel(b: PublicBooking) {
  const status = PAYMENT_STATUS_LABEL[b.paymentStatus];
  const w = b.walletPayment;
  if (b.payAtVenue && !w) return `${status} · cash at venue`;
  if (!w) return status;
  if (b.payAtVenue && (w.status === "pending" || w.status === "succeeded")) {
    return w.status === "pending"
      ? `Booking money · ${WALLET_NAME[w.method]}, being verified`
      : `Booking money paid · ${WALLET_NAME[w.method]}, rest in cash at venue`;
  }
  return w.status === "pending" ? `${WALLET_NAME[w.method]} · being verified` : `${status} · ${WALLET_NAME[w.method]}`;
}

export function BookingDetailsCard({
  booking: b, state, venueName, children,
}: {
  booking: PublicBooking; state: ConfirmationState; venueName: string; children?: React.ReactNode;
}) {
  const pill = STATUS_PILL[state];
  const slots = bookingSlots(b);
  const placeholder = (
    <div className="absolute inset-0 grid place-items-center bg-muted text-muted-foreground">
      <Goal className="size-6" aria-hidden />
    </div>
  );
  return (
    <article aria-label="Booking details" className="w-full min-w-0 overflow-hidden rounded-2xl border bg-card text-card-foreground shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3 px-4 py-4 sm:px-6">
        <div className="flex min-w-0 flex-1 basis-40 items-center gap-3">
          <div className="relative size-12 shrink-0 overflow-hidden rounded-xl border sm:size-14">
            {b.ground.coverPhoto ? (
              <FallbackImage src={b.ground.coverPhoto} alt="" fill sizes="56px" className="object-cover" unoptimized={b.ground.coverPhoto.startsWith("/")} fallback={placeholder} />
            ) : placeholder}
          </div>
          <div className="min-w-0">
            <h2 className="text-base font-bold [overflow-wrap:anywhere] sm:text-lg">{b.ground.name}</h2>
            <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
              <span className="[overflow-wrap:anywhere]">{venueName}</span>
              {b.ground.format && <FormatBadge format={b.ground.format} className="bg-muted text-muted-foreground" />}
            </div>
            {b.ground.address && <p className="mt-1 text-xs text-muted-foreground [overflow-wrap:anywhere]">{b.ground.address}</p>}
          </div>
        </div>
        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${pill.className}`}>
          <span className="size-1.5 shrink-0 rounded-full" aria-hidden />
          {pill.label}
        </span>
      </div>

      <dl className="grid grid-cols-2 gap-x-3 gap-y-4 border-y bg-muted/35 px-4 py-4 text-sm sm:grid-cols-3 sm:px-6">
        <Stat label="Booking reference" value={b.bookingNumber} />
        <Stat label="Date" value={formatSlotDate(b.slot.date)} />
        <Stat label={slots.length > 1 ? `Time · ${slotCountLabel(slots.length)}` : "Time"} value={formatSlotRange(slots, { hour12: false })} />
      </dl>

      <dl className="space-y-2 px-4 py-4 text-sm sm:px-6">
        {b.slots && slots.length > 1 ? (
          b.slots.map((s) => (
            <Line key={slotStartTime(s)} label={slotClockLabel(s)} value={taka(s.price)} />
          ))
        ) : (
          <Line label="Slot" value={taka(b.amount)} />
        )}
        <Line label="Service fee" value={taka(b.serviceFee)} />
        <Line label="Total" value={taka(b.total)} bold />
        {b.walletPayment && hasBookingMoney(b) && isUnderReview(b) && (
          <>
            <Line label="Booking money" value={`${taka(b.walletPayment.amount)} · being verified`} />
            <Line label="To pay at the venue" value={taka(Math.max(0, b.total - b.walletPayment.amount))} bold />
          </>
        )}
        {b.paid > 0 && b.due > 0 && !isUnderReview(b) && (
          <>
            <Line label="Paid" value={taka(b.paid)} />
            <Line label={b.payAtVenue ? "Due at the venue" : "Due"} value={taka(b.due)} bold />
          </>
        )}
        <Line label="Payment" value={paymentLabel(b)} />
        {b.walletPayment?.reference && <Line label="TrxID" value={b.walletPayment.reference} />}
      </dl>

      <div className="border-t px-4 pb-4 empty:hidden sm:px-6">
        {b.ground.address && state !== "cancelled" && (
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(b.ground.address)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-semibold hover:bg-muted"
          >
            <Map className="size-4" aria-hidden /> Get directions
          </a>
        )}
        {children}
      </div>
    </article>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 max-sm:last:col-span-2">
      <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
      <dd className="mt-1 font-semibold tabular-nums [overflow-wrap:anywhere]">{value}</dd>
    </div>
  );
}

function Line({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={`grid grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)] gap-3 ${bold ? "border-t pt-2.5 text-base font-bold" : ""}`}>
      <dt className={bold ? "" : "text-muted-foreground"}>{label}</dt>
      <dd className="min-w-0 text-right tabular-nums [overflow-wrap:anywhere]">{value}</dd>
    </div>
  );
}
