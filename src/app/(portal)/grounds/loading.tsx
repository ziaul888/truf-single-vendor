import { SkeletonBlock } from "@/components/portal/loading/skeleton-block";

// Mirrors the grounds list layout (filters + two-column cards) so nothing jumps when it loads.
export default function GroundsLoading() {
  return (
    <div
      className="page-loading mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[260px_1fr] lg:px-8"
      aria-busy="true"
      aria-label="Loading grounds"
    >
      <SkeletonBlock className="hidden h-96 lg:block" />
      <div>
        <div className="flex items-center justify-between">
          <SkeletonBlock className="h-6 w-40" />
          <SkeletonBlock className="h-9 w-36" />
        </div>
        <div className="mt-4 grid grid-cols-1 gap-5 md:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonBlock key={i} className="h-36" />)}
        </div>
      </div>
    </div>
  );
}
