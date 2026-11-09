import { SkeletonBlock } from "./skeleton-block";
import { SkeletonLine } from "./skeleton-line";
import { SlotPickerSkeleton } from "./slot-picker-skeleton";

/**
 * A ground's page while it loads: breadcrumb, photo gallery, then the details column
 * (header, about, specifications, location) beside the 400px slot picker.
 */
export function GroundDetailSkeleton() {
  return (
    <div className="page-loading mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8" aria-busy="true" aria-label="Loading ground">
      <SkeletonLine className="mb-4 h-4 w-56" />
      <GallerySkeleton />
      <div className="mt-6 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_400px]">
        <div>
          <HeaderSkeleton />
          <section className="mt-8 border-b pb-8">
            <SkeletonLine className="mb-2 h-6 w-36" />
            {["w-full", "w-full", "w-2/3"].map((w, i) => <SkeletonLine key={i} className={`h-5.75 ${w}`} />)}
          </section>
          <SpecsSkeleton />
          <LocationSkeleton />
        </div>
        <aside className="lg:sticky lg:top-20 lg:self-start">
          <SlotPickerSkeleton />
        </aside>
      </div>
    </div>
  );
}

/** One large photo and four thumbnails from md; on phones only the large one (top row). */
function GallerySkeleton() {
  return (
    <div className="grid h-105 grid-cols-1 grid-rows-2 gap-2 overflow-hidden rounded-2xl md:grid-cols-4">
      <SkeletonBlock className="rounded-none md:col-span-2 md:row-span-2" />
      {Array.from({ length: 4 }).map((_, i) => <SkeletonBlock key={i} className="hidden rounded-none md:block" />)}
    </div>
  );
}

function HeaderSkeleton() {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0 flex-1">
        <div className="mb-2 flex items-center gap-2">
          <SkeletonBlock className="h-7 w-16 rounded-md" />
          <SkeletonLine className="h-4 w-28" />
        </div>
        <SkeletonLine className="h-9 w-64 max-w-full sm:h-10" />
        <SkeletonLine className="mt-1 w-72 max-w-full" />
        <SkeletonLine className="mt-3 w-36" />
        <SkeletonLine className="mt-1 w-56 max-w-full" />
      </div>
      <div className="flex shrink-0 gap-2">
        <SkeletonBlock className="h-10 w-10 rounded-full" />
        <SkeletonBlock className="h-10 w-10 rounded-full" />
      </div>
    </div>
  );
}

function SpecsSkeleton() {
  return (
    <section className="mt-6 border-b pb-8">
      <SkeletonLine className="mb-3 h-6 w-32" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="rounded-lg bg-muted/40 p-3">
            <SkeletonLine className="h-[16.5px] w-16" />
            <SkeletonLine className="mt-0.5 w-20" />
          </div>
        ))}
      </div>
    </section>
  );
}

function LocationSkeleton() {
  return (
    <section className="mt-6 border-b pb-8">
      <SkeletonLine className="mb-3 h-6 w-24" />
      <div className="flex flex-col gap-4 rounded-xl border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <SkeletonBlock className="mt-0.5 h-5 w-5 shrink-0 rounded-md" />
          <div className="min-w-0 flex-1">
            <SkeletonLine className="w-56 max-w-full" />
            <SkeletonLine className="h-4 w-28" />
          </div>
        </div>
        <SkeletonBlock className="h-10 shrink-0 rounded-lg sm:w-40" />
      </div>
    </section>
  );
}
