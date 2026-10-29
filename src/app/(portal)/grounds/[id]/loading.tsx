import { SkeletonBlock } from "@/components/portal/loading/skeleton-block";

// Mirrors the ground detail layout: breadcrumb, gallery, details and the slot picker.
export default function GroundDetailLoading() {
  return (
    <div className="page-loading mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8" aria-busy="true" aria-label="Loading ground">
      <SkeletonBlock className="mb-4 h-4 w-64" />
      <SkeletonBlock className="h-64 sm:h-80" />
      <div className="mt-6 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_400px]">
        <div className="space-y-4">
          <SkeletonBlock className="h-8 w-72 max-w-full" />
          <SkeletonBlock className="h-4 w-48" />
          <SkeletonBlock className="mt-6 h-32" />
          <SkeletonBlock className="h-40" />
        </div>
        <SkeletonBlock className="h-[420px]" />
      </div>
    </div>
  );
}
