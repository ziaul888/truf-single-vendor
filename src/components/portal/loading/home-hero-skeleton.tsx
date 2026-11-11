import { SkeletonBlock } from "./skeleton-block";
import { SkeletonLine } from "./skeleton-line";

/** The home hero while it loads: badge, two-line headline, intro, stats, search box, trust badges. */
export function HomeHeroSkeleton() {
  return (
    <section className="bg-sidebar">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-28 lg:px-8">
        <div className="max-w-2xl">
          <SkeletonBlock className="h-6 w-40 rounded-full" />
          <div className="mt-3 sm:mt-4">
            <SkeletonLine className="h-9 w-11/12 sm:h-18.75" />
            <SkeletonLine className="h-9 w-2/3 sm:h-18.75" />
          </div>
          <div className="mt-3 max-w-xl sm:mt-4">
            <SkeletonLine className="h-5 w-full sm:h-7" />
            <SkeletonLine className="h-5 w-3/4 sm:h-7" />
          </div>
          <div className="mt-4 flex flex-wrap gap-2 sm:mt-6 sm:gap-x-8 sm:gap-y-3">
            {Array.from({ length: 3 }).map((_, i) => <SkeletonLine key={i} className="h-8 w-24 rounded-full sm:w-28" />)}
          </div>
        </div>
        <SearchBoxSkeleton />
        <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 sm:mt-10 sm:gap-x-8 sm:gap-y-3">
          {["w-36", "w-56", "w-52"].map((w) => <SkeletonLine key={w} className={w} />)}
        </div>
      </div>
    </section>
  );
}

/** The date / sport / format search: date full-width then sport/format side by side on phones, one 12-column row from sm. */
function SearchBoxSkeleton() {
  return (
    <div className="mt-6 max-w-3xl sm:mt-10 rounded-2xl bg-card/95 p-3 shadow-2xl sm:p-4">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-12 sm:gap-3">
        {["col-span-2 sm:col-span-4", "sm:col-span-3", "sm:col-span-3"].map((span, i) => (
          <div key={i} className={`rounded-xl border bg-card px-3 py-2 ${span}`}>
            <SkeletonLine className="h-[16.5px] w-12" />
            {/* The inputs are text-base on phones, text-sm from sm */}
            <SkeletonLine className="mt-0.5 h-6 w-full sm:h-5" />
          </div>
        ))}
        <SkeletonBlock className="col-span-2 h-11 sm:h-auto" />
      </div>
    </div>
  );
}
