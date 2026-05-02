import Link from "next/link";
import Image from "next/image";
import { CalendarPlus, Check, Map } from "lucide-react";
import { GROUNDS, VENUE } from "@/lib/portal-stub-data";
import { FormatBadge } from "@/components/portal/format-badge";

export default async function ConfirmationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // TODO: const booking = await api.bookings.get(id);
  // For the stub we'll use the first ground as a placeholder.
  const ground = GROUNDS[0]!;

  return (
    <section className="bg-sidebar py-16 text-sidebar-foreground">
      <div className="mx-auto max-w-2xl px-4 text-center sm:px-6 lg:px-8">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-accent">
          <Check className="h-10 w-10 text-accent-foreground" />
        </div>
        <h1 className="mt-6 text-4xl font-extrabold tracking-tight">You're booked!</h1>
        <p className="mt-2 opacity-80">
          Confirmation #{id} has been emailed to <strong>you</strong>.
        </p>

        <div className="mt-10 rounded-2xl bg-card p-6 text-left text-card-foreground">
          <div className="flex items-center gap-3 border-b pb-4">
            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg">
              <Image src={ground.images[0]!} alt={ground.name} fill sizes="56px" className="object-cover" />
            </div>
            <div>
              <FormatBadge format={ground.format} />
              <p className="mt-1 font-bold">{ground.name} · {VENUE.name}</p>
              <p className="text-xs text-muted-foreground">Banani, Dhaka</p>
            </div>
            <span className="ml-auto rounded-full bg-success/15 px-2 py-0.5 text-xs font-semibold text-success">
              Confirmed
            </span>
          </div>
          <dl className="mt-4 grid grid-cols-3 gap-4 text-sm">
            <Stat label="Date" value="Fri, 02 May" />
            <Stat label="Time" value="18:00 — 19:00" />
            <Stat label="Paid" value={`৳${(ground.peakRate ?? ground.hourlyRate + 50).toLocaleString()}`} />
          </dl>
          <div className="mt-6 grid grid-cols-2 gap-2">
            <button className="inline-flex items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-semibold hover:bg-muted">
              <CalendarPlus className="h-4 w-4" /> Add to calendar
            </button>
            <button className="inline-flex items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-semibold hover:bg-muted">
              <Map className="h-4 w-4" /> Get directions
            </button>
          </div>
        </div>

        <Link
          href="/my-bookings"
          className="mt-8 inline-block font-semibold text-accent hover:underline"
        >
          View my bookings →
        </Link>
      </div>
    </section>
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
