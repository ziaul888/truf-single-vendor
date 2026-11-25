import { cn } from "@/lib/utils";
import { SkeletonBlock } from "./skeleton-block";
import { SkeletonLine } from "./skeleton-line";

/** My bookings while the session loads: title and links, the Upcoming / Past tabs and a few booking rows. */
export function MyBookingsSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8", className)} aria-busy="true" aria-label="Loading your bookings">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <SkeletonLine className="h-9 w-48" />
          <SkeletonLine className="mt-1 w-64 max-w-full" />
        </div>
        <div className="flex items-center gap-4">
          <SkeletonLine className="w-12" />
          <SkeletonLine className="w-14" />
        </div>
      </div>
      <div className="mt-6 inline-flex gap-1 rounded-lg border p-1">
        <SkeletonBlock className="h-8 w-24 rounded-md pointer-coarse:h-11" />
        <SkeletonBlock className="h-8 w-16 rounded-md pointer-coarse:h-11" />
      </div>
      <BookingRowsSkeleton />
    </div>
  );
}

/** Booking rows only, for the list inside My bookings. */
export function BookingRowsSkeleton() {
  return (
    <div className="mt-6 space-y-3" aria-hidden>
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 rounded-2xl border bg-card p-4 sm:gap-4">
          <SkeletonBlock className="hidden h-12 w-12 shrink-0 sm:block" />
          <div className="min-w-0 flex-1">
            <SkeletonLine className="h-6 w-40 max-w-full" />
            <SkeletonLine className="mt-0.5 w-56 max-w-full" />
          </div>
          <SkeletonLine className="h-6 w-16" />
          <SkeletonBlock className="h-4 w-4 shrink-0 rounded" />
        </div>
      ))}
    </div>
  );
}

/** The profile page while the session loads: avatar and name, details form, bookings and sign-out cards. */
export function AccountSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("mx-auto max-w-3xl space-y-6 px-4 py-12 sm:px-6 lg:px-8", className)} aria-busy="true" aria-label="Loading your profile">
      <div className="flex items-center gap-4">
        <SkeletonBlock className="h-14 w-14 shrink-0 rounded-full" />
        <div className="min-w-0 flex-1">
          <SkeletonLine className="h-9 w-48 max-w-full" />
          <SkeletonLine className="w-32" />
        </div>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <PersonalDetailsSkeleton />
        <div className="space-y-6">
          <BookingsCardSkeleton />
          <section className="rounded-2xl border bg-card p-6">
            <SkeletonLine className="h-6 w-20" />
            <SkeletonLine className="mt-1 w-48 max-w-full" />
            <SkeletonBlock className="mt-4 h-10 w-28 rounded-lg" />
          </section>
        </div>
      </div>
    </div>
  );
}

/** Personal details: the verified number box, then the name / email form. */
function PersonalDetailsSkeleton() {
  return (
    <section className="rounded-2xl border bg-card p-6">
      <SkeletonLine className="h-6 w-36" />
      <div className="mt-4 rounded-xl bg-muted/40 p-3">
        <SkeletonLine className="h-4 w-28" />
        <SkeletonLine className="mt-1 h-6 w-48 max-w-full" />
        <SkeletonLine className="mt-1 h-4 w-full" />
        <SkeletonLine className="h-4 w-1/2" />
      </div>
      <div className="mt-4 space-y-4">
        {[false, true].map((hint, i) => (
          <div key={i}>
            <SkeletonLine className="h-4 w-24" />
            <SkeletonBlock className="mt-1 h-11.5 rounded-lg" />
            {hint && (
              <div className="mt-1">
                <SkeletonLine className="h-4 w-full" />
                <SkeletonLine className="h-4 w-2/3" />
              </div>
            )}
          </div>
        ))}
        <SkeletonBlock className="h-11 rounded-lg" />
      </div>
    </section>
  );
}

/** Bookings card: heading and link, the Upcoming / Past counts, the next-up block. */
function BookingsCardSkeleton() {
  return (
    <section className="rounded-2xl border bg-card p-6">
      <div className="flex items-center justify-between gap-3">
        <SkeletonLine className="h-6 w-28" />
        <SkeletonLine className="w-24" />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="rounded-xl bg-muted/40 p-3">
            <SkeletonLine className="h-4 w-16" />
            <SkeletonLine className="h-8 w-8" />
          </div>
        ))}
      </div>
      <SkeletonBlock className="mt-4 h-16" />
    </section>
  );
}
