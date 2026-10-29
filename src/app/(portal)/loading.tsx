import { SkeletonBlock } from "@/components/portal/loading/skeleton-block";

// Shown the instant a portal link is clicked, while the next page renders.
export default function PortalLoading() {
  return (
    <div className="page-loading mx-auto max-w-3xl space-y-4 px-4 py-10 sm:px-6" aria-busy="true" aria-label="Loading">
      <SkeletonBlock className="h-8 w-56" />
      <SkeletonBlock className="h-4 w-80 max-w-full" />
      <SkeletonBlock className="mt-6 h-40" />
      <SkeletonBlock className="h-40" />
    </div>
  );
}
