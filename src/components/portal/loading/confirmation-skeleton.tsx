import { SkeletonBlock } from "./skeleton-block";
import { SkeletonLine } from "./skeleton-line";

/**
 * The confirmation page as it first renders (ConfirmationView's "Loading your booking…"
 * state): the dark band with the round icon, a title and "Book another slot".
 */
export function ConfirmationSkeleton() {
  return (
    <section className="page-loading bg-sidebar py-16" aria-busy="true" aria-label="Loading your booking">
      <div className="mx-auto flex max-w-2xl flex-col items-center px-4 sm:px-6 lg:px-8">
        <SkeletonBlock className="h-20 w-20 rounded-full" />
        <SkeletonLine className="mt-6 h-9 w-72 max-w-full" />
        <SkeletonLine className="mt-8 h-6 w-40" />
      </div>
    </section>
  );
}
