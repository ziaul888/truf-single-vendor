import Image from "next/image";
import { Map } from "lucide-react";
import type { PublicBooking } from "@/types/booking";
import { fromMinorUnits } from "@/lib/ground-format";
import { formatSlotDate, slotTimeLabel } from "@/lib/slot-format";
import { FormatBadge } from "@/components/portal/format-badge";
import { PAYMENT_STATUS_LABEL, type ConfirmationState } from "./confirmation-state";

const STATUS_PILL: Record<ConfirmationState, { label: string; className: string }> = {
  confirming: { label: "Processing", className: "bg-warning/15 text-warning" },
  unpaid: { label: "Awaiting payment", className: "bg-warning/15 text-warning" },
  reserved: { label: "Pending", className: "bg-warning/15 text-warning" },
  confirmed: { label: "Confirmed", className: "bg-success/15 text-success" },
  completed: { label: "Completed", className: "bg-muted text-muted-foreground" },
  cancelled: { label: "Cancelled", className: "bg-destructive/15 text-destructive" },
};

const taka = (minor: number) => `৳${fromMinorUnits(minor).toLocaleString()}`;

export function BookingDetailsCard({
  booking: b, state, venueName, children,
}: {
  booking: PublicBooking; state: ConfirmationState; venueName: string; children?: React.ReactNode;
}) {
  const pill = STATUS_PILL[state];
  return (
    <div className="mt-10 rounded-2xl bg-card p-6 text-left text-card-foreground">
      <div className="flex items-center gap-3 border-b pb-4">
        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg">
          {b.ground.coverPhoto ? (
            <Image src={b.ground.coverPhoto} alt={b.ground.name} fill sizes="56px" className="object-cover" />
          ) : (
            <div className="h-full w-full bg-linear-to-br from-primary/80 to-primary/40" />
          )}
        </div>
        <div className="min-w-0">
          {b.ground.format && <FormatBadge format={b.ground.format} />}
          <p className="mt-1 font-bold">{b.ground.name} · {venueName}</p>
          {b.ground.address && <p className="text-xs text-muted-foreground">{b.ground.address}</p>}
        </div>
        <span className={`ml-auto shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${pill.className}`}>
          {pill.label}
        </span>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
        <Stat label="Booking" value={b.bookingNumber} />
        <Stat label="Date" value={formatSlotDate(b.slot.date)} />
        <Stat label="Time" value={slotTimeLabel(b.slot)} />
      </dl>

      <div className="mt-4 space-y-1.5 border-t pt-4 text-sm">
        <Line label="Slot" value={taka(b.amount)} />
        <Line label="Service fee" value={taka(b.serviceFee)} />
        <Line label="Total" value={taka(b.total)} bold />
        {b.paid > 0 && b.due > 0 && (
          <>
            <Line label="Paid" value={taka(b.paid)} />
            <Line label="Due" value={taka(b.due)} bold />
          </>
        )}
        <Line label="Payment" value={b.payAtVenue ? `${PAYMENT_STATUS_LABEL[b.paymentStatus]} · cash at venue` : PAYMENT_STATUS_LABEL[b.paymentStatus]} />
      </div>

      {b.ground.address && state !== "cancelled" && (
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(b.ground.address)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-semibold hover:bg-muted"
        >
          <Map className="h-4 w-4" /> Get directions
        </a>
      )}
      {children}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="mt-1 font-semibold">{value}</dd>
    </div>
  );
}

function Line({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={`flex justify-between ${bold ? "border-t pt-2 text-base font-bold" : ""}`}>
      <span className={bold ? "" : "text-muted-foreground"}>{label}</span>
      <span>{value}</span>
    </div>
  );
}
