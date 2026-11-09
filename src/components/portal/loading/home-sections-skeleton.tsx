import { SkeletonBlock } from "./skeleton-block";
import { SkeletonLine } from "./skeleton-line";

const CONTAINER = "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8";

/** The home sections below the hero, in page order, each on its own band colour. */
export function HomeSectionsSkeleton() {
  return (
    <>
      <SportChipsSkeleton />
      <FeaturedGroundsSkeleton />
      <AmenitiesSkeleton />
      <HowItWorksSkeleton />
      <VisitUsSkeleton />
    </>
  );
}

function SportChipsSkeleton() {
  return (
    <section className="border-b bg-card py-10">
      <div className={CONTAINER}>
        <div className="mb-6 flex items-end justify-between">
          <SkeletonLine className="h-8 w-44" />
          <SkeletonLine className="w-24" />
        </div>
        <div className="flex flex-wrap gap-3">
          {Array.from({ length: 4 }).map((_, i) => <SkeletonBlock key={i} className="h-[34px] w-40 rounded-full" />)}
        </div>
      </div>
    </section>
  );
}

function FeaturedGroundsSkeleton() {
  return (
    <section className="bg-muted/30 py-14">
      <div className={CONTAINER}>
        <div className="mb-8 flex items-end justify-between">
          <div>
            <SkeletonLine className="h-9 w-56" />
            <SkeletonLine className="mt-1 w-72 max-w-full" />
          </div>
          <SkeletonLine className="hidden w-24 sm:flex" />
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => <GroundCardSkeleton key={i} />)}
        </div>
      </div>
    </section>
  );
}

/** Mirrors GroundCard: cover image, name and price, amenity chips, "View slots". */
function GroundCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border bg-card">
      <SkeletonBlock className="h-48 rounded-none" />
      <div className="p-5">
        <div className="flex items-start justify-between gap-2">
          <div>
            <SkeletonLine className="h-7 w-36" />
            <SkeletonLine className="mt-0.5 h-4 w-24" />
          </div>
          <div className="flex flex-col items-end">
            <SkeletonLine className="h-4 w-10" />
            <SkeletonLine className="h-6 w-20" />
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-1.5">
          {Array.from({ length: 3 }).map((_, i) => <SkeletonBlock key={i} className="h-[25px] w-16 rounded" />)}
        </div>
        <SkeletonBlock className="mt-4 h-10 rounded-lg" />
      </div>
    </div>
  );
}

function AmenitiesSkeleton() {
  return (
    <section className="border-y bg-card py-14">
      <div className={CONTAINER}>
        <div className="mx-auto mb-10 flex max-w-2xl flex-col items-center">
          <SkeletonLine className="h-9 w-56" />
          <SkeletonLine className="mt-2 w-72 max-w-full" />
        </div>
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-8">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex w-[calc(50%-0.75rem)] flex-col items-center sm:w-36">
              <SkeletonBlock className="h-7 w-7 rounded-lg" />
              <SkeletonLine className="mt-2 h-4 w-20" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorksSkeleton() {
  return (
    <section className="bg-sidebar py-16">
      <div className="mx-auto flex max-w-5xl flex-col items-center px-4 sm:px-6 lg:px-8">
        <SkeletonBlock className="h-6 w-28 rounded-full" />
        <SkeletonLine className="mt-4 h-9 w-64 max-w-full sm:h-10" />
        <div className="mt-12 grid w-full grid-cols-1 gap-8 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i}>
              <SkeletonBlock className="h-9 w-9 rounded-full" />
              <SkeletonLine className="mt-4 h-7 w-36" />
              <SkeletonLine className="mt-1 w-full" />
              <SkeletonLine className="w-2/3" />
            </div>
          ))}
        </div>
        <SkeletonBlock className="mt-12 h-11 w-44" />
      </div>
    </section>
  );
}

function VisitUsSkeleton() {
  return (
    <section className="bg-card py-14">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-4 sm:px-6 md:grid-cols-2 lg:px-8">
        <div>
          <SkeletonBlock className="h-6 w-24 rounded-full" />
          <SkeletonLine className="mt-4 h-9 w-56 sm:h-10" />
          <div className="mt-6 space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-start gap-3">
                <SkeletonBlock className="mt-0.5 h-5 w-5 rounded-md" />
                <div className="flex-1">
                  <SkeletonLine className="w-24" />
                  <SkeletonLine className="w-56 max-w-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
        <SkeletonBlock className="h-72 rounded-2xl" />
      </div>
    </section>
  );
}
