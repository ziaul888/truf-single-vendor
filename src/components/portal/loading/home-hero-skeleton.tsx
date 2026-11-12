import { SkeletonBlock } from "./skeleton-block";
import { SkeletonLine } from "./skeleton-line";

/** The home hero while it loads: a tall photo with the booking card at its bottom. */
export function HomeHeroSkeleton() {
  return (
    <section>
      <div className="flex h-96 sm:h-112 items-end bg-sidebar">
        <div className="w-full px-4 pb-4 sm:px-6 sm:pb-10 lg:px-8">
          <BookingCardSkeleton />
        </div>
      </div>
    </section>
  );
}

/** Title and price, then the date / sport / format search: date full-width then sport/format side by side on phones, one 12-column row from sm. */
function BookingCardSkeleton() {
  return (
    <div className="mx-auto max-w-3xl rounded-3xl border bg-card/85 p-4 shadow-2xl sm:p-5">
      <div className="mb-3 flex items-end justify-between gap-3">
        <div>
          <SkeletonLine className="h-7 w-40" />
          <SkeletonLine className="h-4 w-32" />
        </div>
        <SkeletonLine className="h-7 w-20" />
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-12 sm:gap-3">
        {["col-span-2 sm:col-span-4", "sm:col-span-3", "sm:col-span-3"].map((span, i) => (
          <div key={i} className={`rounded-xl border bg-card px-3 py-2 ${span}`}>
            <SkeletonLine className="h-[16.5px] w-12" />
            {/* The inputs are text-base on phones, text-sm from sm */}
            <SkeletonLine className="mt-0.5 h-6 w-full sm:h-5" />
          </div>
        ))}
        <SkeletonBlock className="col-span-2 h-12" />
      </div>
    </div>
  );
}
