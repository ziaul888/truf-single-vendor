"use client";

import { useState } from "react";
import Link from "next/link";
import { useInfiniteQuery } from "@tanstack/react-query";
import { CalendarDays, ChevronRight, Mail } from "lucide-react";
import { BookingRowsSkeleton, MyBookingsSkeleton } from "@/components/portal/loading/account-skeletons";
import { cn } from "@/lib/utils";
import { fromMinorUnits } from "@/lib/ground-format";
import { formatSlotDate, slotTimeLabel } from "@/lib/slot-format";
import { listMyBookings, toAppPath } from "@/lib/portal-bookings";
import type { CustomerBooking } from "@/types/booking";
import { useCustomerSession, useCustomerSignOut } from "./use-customer-session";

type Scope = "upcoming" | "past";
const PAGE_SIZE = 10;

const STATUS: Record<CustomerBooking["status"], { label: string; cls: string }> = {
  pending:   { label: "Pending",   cls: "bg-warning/15 text-warning" },
  confirmed: { label: "Confirmed", cls: "bg-success/15 text-success" },
  completed: { label: "Completed", cls: "bg-muted text-muted-foreground" },
  cancelled: { label: "Cancelled", cls: "bg-destructive/15 text-destructive" },
};

/** Signed in: every booking made with this phone. Signed out: sign in, or use the email link. */
export function MyBookingsView() {
  const session = useCustomerSession();
  const signOut = useCustomerSignOut();
  const [scope, setScope] = useState<Scope>("upcoming");

  if (session.isPending) {
    return <MyBookingsSkeleton />;
  }
  if (!session.data) return <SignedOut />;

  const who = session.data.name ?? session.data.phone;
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">My bookings</h1>
          <p className="mt-1 text-sm text-muted-foreground">Signed in as {who}{session.data.name ? ` · ${session.data.phone}` : ""}</p>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/account" className="text-sm font-medium text-muted-foreground hover:text-foreground">Profile</Link>
          <button type="button" onClick={() => signOut.mutate()} disabled={signOut.isPending}
            className="text-sm font-medium text-muted-foreground hover:text-foreground">
            {signOut.isPending ? "Signing out…" : "Sign out"}
          </button>
        </div>
      </div>

      <div role="tablist" className="mt-6 inline-flex rounded-lg border p-1">
        {(["upcoming", "past"] as const).map((s) => (
          <button key={s} role="tab" type="button" aria-selected={scope === s} onClick={() => setScope(s)}
            className={cn("rounded-md px-4 py-1.5 text-sm font-semibold capitalize", scope === s ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground")}>
            {s}
          </button>
        ))}
      </div>

      <BookingList key={scope} scope={scope} />
    </div>
  );
}

function BookingList({ scope }: { scope: Scope }) {
  const q = useInfiniteQuery({
    queryKey: ["customer", "bookings", scope],
    queryFn: ({ pageParam }) => listMyBookings(scope, pageParam, PAGE_SIZE),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.page * last.limit < last.total ? last.page + 1 : undefined),
  });
  const rows = q.data?.pages.flatMap((p) => p.data) ?? [];

  if (q.isPending) return <BookingRowsSkeleton />;
  if (q.isError) return <p className="mt-8 text-sm text-destructive">{q.error.message}</p>;
  if (rows.length === 0) {
    return (
      <div className="mt-8 rounded-2xl border border-dashed p-10 text-center text-sm text-muted-foreground">
        {scope === "upcoming" ? "No upcoming bookings." : "No past bookings yet."}{" "}
        <Link href="/grounds" className="font-semibold text-accent underline">Book a slot</Link>
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-3">
      {rows.map((b) => <BookingRow key={b.id} booking={b} />)}
      {q.hasNextPage && (
        <button type="button" onClick={() => q.fetchNextPage()} disabled={q.isFetchingNextPage}
          className="w-full rounded-lg border py-2.5 text-sm font-medium hover:bg-muted">
          {q.isFetchingNextPage ? "Loading…" : "Show more"}
        </button>
      )}
    </div>
  );
}

function BookingRow({ booking: b }: { booking: CustomerBooking }) {
  const status = STATUS[b.status];
  return (
    <Link href={toAppPath(b.confirmationUrl)}
      className="flex items-center gap-4 rounded-2xl border bg-card p-4 transition hover:border-primary/40 hover:shadow-sm">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-muted">
        <CalendarDays className="h-5 w-5 opacity-70" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="truncate font-bold">{b.ground.name}</p>
          <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-semibold", status.cls)}>{status.label}</span>
          {b.canPay && <span className="rounded-full bg-accent/20 px-2 py-0.5 text-[11px] font-semibold">Payment due</span>}
        </div>
        <p className="mt-0.5 text-sm text-muted-foreground">
          {formatSlotDate(b.slot.date)} · {slotTimeLabel(b.slot)} · #{b.bookingNumber}
        </p>
      </div>
      <div className="text-right">
        <p className="font-bold">৳{fromMinorUnits(b.total).toLocaleString()}</p>
        {b.due > 0 && b.status !== "cancelled" && (
          <p className="text-xs text-muted-foreground">৳{fromMinorUnits(b.due).toLocaleString()} due</p>
        )}
      </div>
      <ChevronRight className="h-4 w-4 shrink-0 opacity-50" />
    </Link>
  );
}

/** Signed out: sign in with the phone (coming back to `from`), or use the email link. */
export function SignedOut({ title = "Your bookings", from = "/my-bookings" }: { title?: string; from?: string }) {
  return (
    <div className="mx-auto max-w-xl px-4 py-16 text-center sm:px-6 lg:px-8">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-accent">
        <Mail className="h-8 w-8 text-accent-foreground" />
      </div>
      <h1 className="mt-6 text-3xl font-extrabold tracking-tight">{title}</h1>
      <p className="mt-2 text-muted-foreground">
        Sign in with your mobile number to see every booking you&apos;ve made, or open the link in your confirmation email.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href={`/sign-in?from=${encodeURIComponent(from)}`}
          className="inline-flex h-11 items-center rounded-lg bg-primary px-5 text-sm font-bold text-primary-foreground hover:opacity-90">
          Sign in with phone
        </Link>
        <Link href="/grounds" className="inline-flex h-11 items-center rounded-lg border px-5 text-sm font-semibold hover:bg-muted">
          Browse grounds
        </Link>
      </div>
    </div>
  );
}
