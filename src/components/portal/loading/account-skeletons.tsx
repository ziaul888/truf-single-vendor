import { SkeletonBlock } from "./skeleton-block";

/** My bookings while the session loads: title, tabs and a few booking rows. */
export function MyBookingsSkeleton() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8" aria-busy="true" aria-label="Loading your bookings">
      <SkeletonBlock className="h-9 w-56" />
      <SkeletonBlock className="mt-2 h-4 w-64" />
      <SkeletonBlock className="mt-6 h-10 w-48" />
      <BookingRowsSkeleton />
    </div>
  );
}

/** Booking rows only, for the list inside My bookings. */
export function BookingRowsSkeleton() {
  return (
    <div className="mt-6 space-y-3" aria-hidden>
      {Array.from({ length: 3 }).map((_, i) => <SkeletonBlock key={i} className="h-24" />)}
    </div>
  );
}

/** The profile page while the session loads: avatar and name, details form, bookings card. */
export function AccountSkeleton() {
  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-12 sm:px-6 lg:px-8" aria-busy="true" aria-label="Loading your profile">
      <div className="flex items-center gap-4">
        <SkeletonBlock className="h-14 w-14 rounded-full" />
        <div className="space-y-2">
          <SkeletonBlock className="h-8 w-48" />
          <SkeletonBlock className="h-4 w-32" />
        </div>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <SkeletonBlock className="h-80 rounded-2xl" />
        <div className="space-y-6">
          <SkeletonBlock className="h-52 rounded-2xl" />
          <SkeletonBlock className="h-32 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
