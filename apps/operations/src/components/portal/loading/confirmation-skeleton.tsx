import { SkeletonBlock } from "./skeleton-block";
import { SkeletonLine } from "./skeleton-line";

/**
 * The confirmation page as it first renders (ConfirmationView's "Loading your booking…"
 * state): the status icon, heading and link.
 */
export function ConfirmationSkeleton() {
  return (
    <section className="page-loading bg-background py-8 sm:py-12" aria-busy="true" aria-label="Loading your booking">
      <div className="mx-auto flex max-w-2xl flex-col items-center px-4 sm:px-6 lg:px-8">
        <SkeletonBlock className="size-12 rounded-2xl sm:size-14" />
        <SkeletonLine className="mt-4 h-7 w-72 max-w-full sm:h-9" />
        <SkeletonBlock className="mt-5 h-11 w-40 rounded-lg sm:mt-7" />
      </div>
    </section>
  );
}
