import Image from "next/image";
import Link from "next/link";
import { FORMAT_LABEL } from "@/lib/portal-stub-data";
import { getPublicGround, getPublicSlots } from "@/services/portal-grounds";
import { formatSlotDate, slotStartMinute, slotTimeLabel } from "@/lib/slot-format";
import { FormatBadge } from "@/components/portal/format-badge";
import { CheckoutStepper } from "@/components/portal/checkout/checkout-stepper";
import { CheckoutForm } from "@/components/portal/checkout/checkout-form";
import { CHECKOUT_METHODS } from "@/types/booking";
import { CheckoutTotals } from "@/components/portal/checkout/checkout-totals";
import { GroundRules } from "@/components/portal/ground-rules";
import type { Ground } from "@/types/api";
import type { PublicSlot } from "@/types/slot";

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ groundId?: string; date?: string; hour?: string; minute?: string; method?: string }>;
}) {
  const { groundId, date, hour, minute, method } = await searchParams;
  const ground = groundId ? await getPublicGround(groundId) : null;

  const hourNum = hour && /^\d+$/.test(hour) ? Number(hour) : null;
  // A 90-minute slot can start on the half hour (`minute=30`); older links have no minute.
  const minuteNum = minute === "30" ? 30 : 0;
  // The slot's price comes from turf-api (peak hours included), so the portal doesn't calculate it.
  const slots = ground && date ? await getPublicSlots(ground.id, date) : [];
  const slot = slots.find((s) => s.startHour === hourNum && slotStartMinute(s) === minuteNum);
  const unavailable = !!ground && hourNum != null && !slot?.available;

  return (
    <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_360px] lg:px-8">
      <section>
        <h1 className="text-3xl font-extrabold tracking-tight">Confirm &amp; pay</h1>
        <p className="mt-1 text-sm text-muted-foreground">Step 2 of 3 — almost there.</p>

        <CheckoutStepper />

        {unavailable && (
          <p role="alert" className="mt-6 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
            This slot is no longer available.{" "}
            <Link href={`/grounds/${ground.id}`} className="font-semibold underline">Pick another time</Link>
          </p>
        )}

        {ground && <CompactSummary ground={ground} date={date} slot={slot} />}

        {ground && date && hourNum != null && slot ? (
          <CheckoutForm
            groundId={ground.id}
            date={date}
            hour={hourNum}
            startMinute={minuteNum}
            slotPrice={slot.price}
            disabled={unavailable}
            initialMethod={CHECKOUT_METHODS.find((m) => m === method)}
          />
        ) : (
          !unavailable && (
            <p className="mt-8 rounded-2xl border bg-card p-6 text-sm text-muted-foreground">
              No slot selected. <Link className="underline" href="/grounds">Pick a ground</Link> first.
            </p>
          )
        )}
      </section>

      {/* Phones get CompactSummary above the form instead */}
      <aside className="hidden lg:sticky lg:top-20 lg:block lg:self-start">
        <div className="rounded-2xl border bg-card p-5">
          <h3 className="mb-3 font-bold">Your booking</h3>
          {ground ? (
            <BookingSummary ground={ground} date={date} slot={slot} />
          ) : (
            <p className="text-sm text-muted-foreground">
              No slot selected. <Link className="underline" href="/grounds">Pick a ground</Link> first.
            </p>
          )}
        </div>
      </aside>
    </div>
  );
}

function BookingSummary({ ground, date, slot }: { ground: Ground; date?: string; slot?: PublicSlot }) {
  return (
    <>
      <div className="flex gap-3">
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg">
          {ground.images?.[0] ? (
            <Image src={ground.images[0]} alt={ground.name} fill sizes="80px" className="object-cover" />
          ) : (
            <div className="h-full w-full bg-linear-to-br from-primary/80 to-primary/40" />
          )}
        </div>
        <div>
          {ground.format && <FormatBadge format={ground.format} />}
          <p className="mt-1 font-semibold">{ground.name}</p>
          {ground.address && <p className="text-xs text-muted-foreground">{ground.address}</p>}
        </div>
      </div>
      <dl className="mt-4 space-y-2 text-sm">
        <Row label="Date" value={date ? formatSlotDate(date) : "—"} />
        <Row label="Time" value={slot ? slotTimeLabel(slot) : "—"} />
        {ground.sport && ground.format && (
          <Row label="Sport" value={`${cap(ground.sport)} · ${FORMAT_LABEL[ground.format]}`} />
        )}
      </dl>
      {slot && <CheckoutTotals slotPrice={slot.price} isPeak={slot.isPeak} />}
      <GroundRules rules={ground.rules} heading="h3" className="mt-4 border-t pt-4" />
    </>
  );
}

/**
 * Below lg: what is being booked and its total, above the form, with the ground rules the form
 * asks to agree to (folded away so the form isn't pushed down).
 */
function CompactSummary({ ground, date, slot }: { ground: Ground; date?: string; slot?: PublicSlot }) {
  return (
    <div className="mt-6 rounded-2xl border bg-card p-4 lg:hidden">
      <div className="flex items-center gap-2">
        {ground.format && <FormatBadge format={ground.format} />}
        <p className="min-w-0 truncate font-semibold">{ground.name}</p>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        {date ? formatSlotDate(date) : "—"} · {slot ? slotTimeLabel(slot) : "—"}
      </p>
      {slot && <CheckoutTotals slotPrice={slot.price} isPeak={slot.isPeak} />}
      {ground.rules?.trim() && (
        <details className="mt-4 border-t pt-4 text-sm">
          <summary className="cursor-pointer font-bold">Ground rules</summary>
          <p className="mt-2 whitespace-pre-line leading-relaxed text-muted-foreground">{ground.rules}</p>
        </details>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
