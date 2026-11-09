import { SkeletonBlock } from "./skeleton-block";
import { SkeletonLine } from "./skeleton-line";

/**
 * The grounds list while it loads: filters (an icon button below md, the full panel from md,
 * a 260px column from lg), the date bar, the results header and the two-column cards.
 */
export function GroundsListSkeleton() {
  return (
    <div
      className="page-loading mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[260px_1fr] lg:px-8"
      aria-busy="true"
      aria-label="Loading grounds"
    >
      <SkeletonBlock className="h-10 w-10 rounded-md md:hidden" />
      <FiltersSkeleton />
      <div>
        <DateBarSkeleton />
        <div className="mt-4 flex items-center justify-between">
          <SkeletonLine className="w-56 max-w-[60%]" />
          <SkeletonBlock className="h-9.5 w-44 rounded-lg" />
        </div>
        <div className="mt-4 grid grid-cols-1 gap-5 md:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => <GroundRowSkeleton key={i} />)}
        </div>
      </div>
    </div>
  );
}

function FiltersSkeleton() {
  return (
    <div className="hidden h-fit rounded-2xl border bg-card p-5 md:block lg:sticky lg:top-20">
      <SkeletonLine className="w-16" />
      <FilterGroupSkeleton rows={7} />
      <div className="mt-5">
        <SkeletonLine className="mb-2 h-4 w-14" />
        <div className="grid grid-cols-3 gap-1.5">
          {Array.from({ length: 9 }).map((_, i) => <SkeletonBlock key={i} className="h-6.5 rounded-full" />)}
        </div>
      </div>
      <FilterGroupSkeleton rows={3} />
    </div>
  );
}

function FilterGroupSkeleton({ rows }: { rows: number }) {
  return (
    <div className="mt-5">
      <SkeletonLine className="mb-2 h-4 w-14" />
      <div className="space-y-1.5">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex h-5 items-center gap-2">
            <SkeletonBlock className="h-4 w-4 rounded" />
            <SkeletonLine className="w-24" />
          </div>
        ))}
      </div>
    </div>
  );
}

/** "See free slots for a day": icon, label, date input and button in a bordered bar. */
function DateBarSkeleton() {
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl border bg-card p-3">
      <SkeletonBlock className="h-4 w-4 rounded" />
      <SkeletonLine className="w-40" />
      <SkeletonBlock className="h-7.5 w-36 rounded-md" />
      <SkeletonBlock className="h-7 w-24 rounded-md" />
    </div>
  );
}

/** Mirrors a list card: 128px image on the left; name, details, price and "View ground" on the right. */
function GroundRowSkeleton() {
  return (
    <div className="flex overflow-hidden rounded-xl border bg-card">
      <SkeletonBlock className="w-32 shrink-0 rounded-none" />
      <div className="flex flex-1 flex-col p-4">
        <SkeletonLine className="h-6 w-36" />
        <SkeletonLine className="mt-0.5 h-4 w-28" />
        <SkeletonLine className="mt-1 h-[16.5px] w-32" />
        <div className="mt-auto flex items-center justify-between pt-3">
          <SkeletonLine className="h-6 w-20" />
          <SkeletonBlock className="h-7 w-24 rounded-md" />
        </div>
      </div>
    </div>
  );
}
