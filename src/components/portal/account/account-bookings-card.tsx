"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { CalendarDays, ChevronRight } from "lucide-react";
import { listMyBookings, toAppPath } from "@/lib/portal-bookings";
import { formatSlotDate, slotPriceLabel, slotTimeLabel } from "@/lib/slot-format";
import { SkeletonBlock } from "@/components/portal/loading/skeleton-block";

/** Next booking plus upcoming / past totals, linking to My bookings. */
export function AccountBookingsCard() {
  const upcoming = useQuery({ queryKey: ["customer", "bookings", "summary", "upcoming"], queryFn: () => listMyBookings("upcoming", 1, 1) });
  const past = useQuery({ queryKey: ["customer", "bookings", "summary", "past"], queryFn: () => listMyBookings("past", 1, 1) });
  const next = upcoming.data?.data[0];

  return (
    <section className="rounded-2xl border bg-card p-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 font-bold"><CalendarDays className="h-4 w-4 text-primary" />Bookings</h2>
        <Link href="/my-bookings" className="flex items-center text-sm font-semibold text-accent hover:underline">
          My bookings <ChevronRight className="h-4 w-4" />
        </Link>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-3">
        <Count label="Upcoming" value={upcoming.data?.total} />
        <Count label="Past" value={past.data?.total} />
      </dl>

      {upcoming.isPending ? (
        <SkeletonBlock className="mt-4 h-16" />
      ) : next ? (
        <Link href={toAppPath(next.confirmationUrl)} className="mt-4 block rounded-xl border p-4 transition-colors hover:border-primary">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Next up</p>
          <p className="mt-1 font-semibold">{next.ground.name}</p>
          <p className="text-sm text-muted-foreground">
            {formatSlotDate(next.slot.date)} · {slotTimeLabel(next.slot)} · {next.bookingNumber}
          </p>
          {next.due > 0 && <p className="mt-1 text-sm font-semibold text-accent">{slotPriceLabel(next.due)} to pay</p>}
        </Link>
      ) : (
        <p className="mt-4 text-sm text-muted-foreground">
          No upcoming bookings. <Link href="/grounds" className="font-semibold text-accent hover:underline">Find a slot</Link>
        </p>
      )}
    </section>
  );
}

function Count({ label, value }: { label: string; value: number | undefined }) {
  return (
    <div className="rounded-xl bg-muted/40 p-3">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-2xl font-extrabold tabular-nums">{value ?? "—"}</dd>
    </div>
  );
}
