import { SkeletonBlock } from "./skeleton-block";
import { SkeletonLine } from "./skeleton-line";

const SECTION = "mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8";

/** The home sections below the hero, in page order, mirroring the modern tile layout. */
export function HomeSectionsSkeleton() {
  return (
    <>
      <StatsSkeleton />
      <GroundTilesSkeleton />
      <AmenitiesSkeleton />
      <HowItWorksSkeleton />
      <VisitUsSkeleton />
    </>
  );
}

function Heading() {
  return (
    <div className="mb-4 flex items-end justify-between sm:mb-6">
      <SkeletonLine className="h-7 w-48 sm:h-9" />
      <SkeletonLine className="w-16" />
    </div>
  );
}

function StatsSkeleton() {
  return (
    <div className={`${SECTION} pb-0 sm:pb-0`}>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 rounded-2xl border bg-card p-3 sm:p-4">
            <SkeletonBlock className="h-10 w-10 shrink-0 rounded-full" />
            <div className="min-w-0 flex-1">
              <SkeletonLine className="h-6 w-16" />
              <SkeletonLine className="w-20" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Mirrors GroundTile: a photo-first card; swipeable on phones, a grid from sm. */
function GroundTilesSkeleton() {
  return (
    <div className={SECTION}>
      <Heading />
      <div className="-mx-4 flex gap-3 overflow-hidden px-4 sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-5 sm:px-0 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <SkeletonBlock key={i} className="aspect-[4/5] w-[78%] shrink-0 rounded-3xl sm:aspect-[4/3] sm:w-auto" />
        ))}
      </div>
    </div>
  );
}

function AmenitiesSkeleton() {
  return (
    <div className={SECTION}>
      <Heading />
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-5 sm:gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-2 rounded-2xl border bg-card px-2 py-4">
            <SkeletonBlock className="h-11 w-11 rounded-full" />
            <SkeletonLine className="h-4 w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}

function HowItWorksSkeleton() {
  return (
    <div className={SECTION}>
      <div className="rounded-3xl bg-sidebar p-5 sm:p-10">
        <SkeletonBlock className="h-6 w-28 rounded-full" />
        <SkeletonLine className="mt-3 h-8 w-64 max-w-full sm:h-10" />
        <div className="mt-5 grid grid-cols-1 gap-3 sm:mt-8 sm:grid-cols-3 sm:gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonBlock key={i} className="h-24 rounded-2xl sm:h-40" />
          ))}
        </div>
        <SkeletonBlock className="mt-5 h-12 w-full sm:mt-8 sm:w-44" />
      </div>
    </div>
  );
}

function VisitUsSkeleton() {
  return (
    <div className={SECTION}>
      <div className="grid overflow-hidden rounded-3xl border bg-card md:grid-cols-2">
        <SkeletonBlock className="h-52 rounded-none md:h-auto md:min-h-96" />
        <div className="p-5 sm:p-8">
          <SkeletonBlock className="h-6 w-24 rounded-full" />
          <SkeletonLine className="mt-3 h-8 w-56 sm:h-10" />
          <div className="mt-4 space-y-3 sm:mt-6 sm:space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-start gap-3">
                <SkeletonBlock className="h-9 w-9 shrink-0 rounded-full" />
                <div className="flex-1">
                  <SkeletonLine className="w-24" />
                  <SkeletonLine className="w-56 max-w-full" />
                </div>
              </div>
            ))}
          </div>
          <SkeletonBlock className="mt-5 h-12 w-full sm:mt-6 sm:w-40" />
        </div>
      </div>
    </div>
  );
}
