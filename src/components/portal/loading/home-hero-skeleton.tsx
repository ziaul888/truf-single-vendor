import { SkeletonBlock } from "./skeleton-block";
import { SkeletonLine } from "./skeleton-line";

/** The home hero while it loads: just the search box. */
export function HomeHeroSkeleton() {
  return (
    <section className="flex min-h-80 items-center bg-sidebar sm:min-h-112">
      <div className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        <SearchBoxSkeleton />
      </div>
    </section>
  );
}

/** The date / sport / format search: date full-width then sport/format side by side on phones, one 12-column row from sm. */
function SearchBoxSkeleton() {
  return (
    <div className="mx-auto max-w-3xl rounded-2xl bg-card/95 p-3 shadow-2xl sm:p-4">
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
