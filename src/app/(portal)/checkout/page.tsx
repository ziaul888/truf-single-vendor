import Image from "next/image";
import { Check, CreditCard, Lock } from "lucide-react";
import { findGround, FORMAT_LABEL } from "@/lib/portal-stub-data";
import { FormatBadge } from "@/components/portal/format-badge";

const SERVICE_FEE = 50;

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ groundId?: string; date?: string; hour?: string }>;
}) {
  const { groundId, date, hour } = await searchParams;
  const ground = groundId ? findGround(groundId) : undefined;

  const hourNum = hour ? Number(hour) : null;
  const isPeak =
    ground && hourNum != null && ground.peakStartHour != null && ground.peakEndHour != null
      ? hourNum >= ground.peakStartHour && hourNum < ground.peakEndHour
      : false;
  const slotPrice = ground
    ? isPeak && ground.peakRate
      ? ground.peakRate
      : ground.hourlyRate
    : 0;
  const total = slotPrice + SERVICE_FEE;

  return (
    <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_360px] lg:px-8">
      <section>
        <h1 className="text-3xl font-extrabold tracking-tight">Confirm &amp; pay</h1>
        <p className="mt-1 text-sm text-muted-foreground">Step 2 of 3 — almost there.</p>

        <Stepper />

        <form
          action="/api/v1/checkout"
          method="POST"
          className="mt-8 space-y-6 rounded-2xl border bg-card p-6"
        >
          <input type="hidden" name="groundId" value={groundId ?? ""} />
          <input type="hidden" name="date" value={date ?? ""} />
          <input type="hidden" name="hour" value={hour ?? ""} />

          <div>
            <h2 className="mb-4 font-bold">Your details</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Full name" name="customerName" required />
              <Field label="Phone" name="customerPhone" type="tel" required />
              <Field
                label="Email"
                name="customerEmail"
                type="email"
                required
                className="sm:col-span-2"
                hint="Confirmation will be sent here."
              />
            </div>
          </div>

          <div className="border-t pt-6">
            <h2 className="mb-4 flex items-center gap-2 font-bold">
              <CreditCard className="h-4 w-4" /> Payment
            </h2>
            <p className="mb-3 text-xs text-muted-foreground">
              Powered by Stripe — your card details never touch our servers.
            </p>
            <div className="rounded-lg border bg-muted/40 p-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="font-medium">Card · Apple Pay · Google Pay</span>
                <div className="flex gap-2 text-[10px] font-bold text-muted-foreground">
                  <span>VISA</span><span>MC</span><span>AMEX</span>
                </div>
              </div>
            </div>
          </div>

          <label className="flex items-start gap-2 text-sm">
            <input type="checkbox" required defaultChecked className="mt-0.5 accent-primary" />
            <span>
              I agree to the <a href="#" className="underline">terms</a> and free-cancellation policy.
            </span>
          </label>

          <button
            type="submit"
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-primary text-sm font-bold text-primary-foreground hover:opacity-90"
          >
            <Lock className="h-4 w-4" />
            Pay ৳{total.toLocaleString()} securely
          </button>
        </form>
      </section>

      <aside className="lg:sticky lg:top-20 lg:self-start">
        <div className="rounded-2xl border bg-card p-5">
          <h3 className="mb-3 font-bold">Your booking</h3>
          {ground ? (
            <>
              <div className="flex gap-3">
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg">
                  <Image src={ground.images[0]!} alt={ground.name} fill sizes="80px" className="object-cover" />
                </div>
                <div>
                  <FormatBadge format={ground.format} />
                  <p className="mt-1 font-semibold">{ground.name}</p>
                  <p className="text-xs text-muted-foreground">Champions Turf · Banani</p>
                </div>
              </div>
              <dl className="mt-4 space-y-2 text-sm">
                <Row label="Date" value={date ?? "—"} />
                <Row
                  label="Time"
                  value={hour ? `${pad(Number(hour))}:00 — ${pad(Number(hour) + 1)}:00` : "—"}
                />
                <Row
                  label="Sport"
                  value={`${cap(ground.sport)} · ${FORMAT_LABEL[ground.format]}`}
                />
              </dl>
              <div className="mt-4 space-y-1.5 border-t pt-4 text-sm">
                <Line label={isPeak ? "Slot (peak)" : "Slot"} value={`৳${slotPrice.toLocaleString()}`} />
                <Line label="Service fee" value={`৳${SERVICE_FEE}`} />
                <Line label="Total" value={`৳${total.toLocaleString()}`} bold />
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              No slot selected. <a className="underline" href="/grounds">Pick a ground</a> first.
            </p>
          )}
        </div>
      </aside>
    </div>
  );
}

function Stepper() {
  return (
    <ol className="mt-6 mb-2 flex items-center gap-3 text-sm">
      <Step n="✓" label="Slot" done />
      <span className="h-px flex-1 bg-primary" />
      <Step n={2} label="Details" active />
      <span className="h-px flex-1 bg-border" />
      <Step n={3} label="Done" />
    </ol>
  );
}

function Step({
  n, label, active, done,
}: {
  n: string | number; label: string; active?: boolean; done?: boolean;
}) {
  return (
    <li className={`flex items-center gap-2 ${active || done ? "font-semibold" : "text-muted-foreground"}`}>
      <span
        className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
          done
            ? "bg-primary text-primary-foreground"
            : active
            ? "bg-accent text-accent-foreground"
            : "bg-muted text-muted-foreground"
        }`}
      >
        {done ? <Check className="h-3.5 w-3.5" /> : n}
      </span>
      {label}
    </li>
  );
}

function Field({
  label, name, type = "text", required, className, hint,
}: {
  label: string; name: string; type?: string; required?: boolean; className?: string; hint?: string;
}) {
  return (
    <div className={className}>
      <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </label>
      <input
        name={name}
        type={type}
        required={required}
        className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />
      {hint && <p className="mt-1 text-[11px] text-muted-foreground">{hint}</p>}
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

function Line({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={`flex justify-between ${bold ? "border-t pt-2 text-base font-bold" : ""}`}>
      <span className={bold ? "" : "text-muted-foreground"}>{label}</span>
      <span>{value}</span>
    </div>
  );
}

const pad = (n: number) => n.toString().padStart(2, "0");
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
